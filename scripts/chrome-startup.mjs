// Isolated Chrome startup instrumentation for LOCAL browser audits.
// Never retries visual assertions, security gates, package builds or deployments.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stopChrome, removeChromeProfile } from "./browser-cleanup.mjs";

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const MAX_LOG_CHARS = 1800;
const chromeArgs = Object.freeze([
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--no-first-run", "--no-default-browser-check", "--disable-extensions",
  "--remote-debugging-port=0",
]);
const ended = child => child.exitCode !== null || child.signalCode !== null;
const compact = value => String(value ?? "").replace(/\u001b\[[0-9;]*m/g, "").slice(-MAX_LOG_CHARS);

function startupError(message, child, stderr) {
  const error = new Error(message + " [exitCode=" + child.exitCode +
    ", signalCode=" + child.signalCode + ", stderr=" + JSON.stringify(compact(stderr())) + "]");
  error.code = "CHROME_STARTUP";
  return error;
}

/**
 * Wait only for Chrome's local DevTools handshake, not for page assertions.
 * Dependencies are injected for deterministic unit tests; the default is 30s.
 */
export async function waitForDevToolsPort(child, profile, {
  timeoutMs = 30000,
  intervalMs = 100,
  exists = existsSync,
  read = readFile,
  sleep = pause,
  now = Date.now,
  stderr = () => "",
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 90000)
    throw new RangeError("Límite de arranque Chrome inválido");
  if (!Number.isInteger(intervalMs) || intervalMs < 1 || intervalMs > 1000)
    throw new RangeError("Intervalo de arranque Chrome inválido");
  const marker = join(profile, "DevToolsActivePort");
  const deadline = now() + timeoutMs;
  let spawnError;
  let lastMarker = "not-created";
  const onError = error => { spawnError = error; };
  child.on("error", onError);
  try {
    while (now() <= deadline) {
      if (spawnError) {
        const failure = startupError("Chrome no pudo iniciarse: " + spawnError.message, child, stderr);
        failure.code = "CHROME_SPAWN";
        throw failure;
      }
      if (ended(child))
        throw startupError("Chrome terminó antes de abrir DevTools", child, stderr);
      if (exists(marker)) {
        try {
          const value = String(await read(marker, "utf8")).split(/\r?\n/, 1)[0].trim();
          lastMarker = value;
          if (/^[0-9]{1,5}$/.test(value)) {
            const port = Number(value);
            if (port > 0 && port <= 65535) return port;
          }
        } catch (error) {
          if (error?.code !== "ENOENT" && error?.code !== "EAGAIN") throw error;
        }
      }
      await sleep(intervalMs);
    }
    throw startupError("Chrome no creó DevToolsActivePort antes de " + timeoutMs +
      " ms; último marcador=" + JSON.stringify(compact(lastMarker)), child, stderr);
  } finally {
    child.removeListener("error", onError);
  }
}

/**
 * At most one fresh-profile restart, only if the DevTools handshake fails.
 * A failed process teardown is a hard NO-GO (never delete an active profile).
 */
export async function launchChromeWithRetry(binary, {
  maxAttempts = 2,
  timeoutMs = 30000,
  spawnBrowser = spawn,
  makeProfile = () => mkdtemp(join(tmpdir(), "desset-browser-")),
  waitForPort = waitForDevToolsPort,
  stop = stopChrome,
  remove = removeChromeProfile,
  warn = console.warn,
} = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 2)
    throw new RangeError("Chrome admite como máximo dos intentos de inicio");
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const temporary = await makeProfile();
    let browser, stderrText = "";
    try {
      browser = spawnBrowser(binary, [
        ...chromeArgs, "--user-data-dir=" + temporary, "about:blank",
      ], { stdio: ["ignore", "ignore", "pipe"] });
      browser.stderr?.on("data", chunk => {
        stderrText = (stderrText + String(chunk)).slice(-MAX_LOG_CHARS);
      });
      const port = await waitForPort(browser, temporary, {
        timeoutMs, stderr: () => stderrText,
      });
      return { browser, temporary, port, startupAttempts: attempt };
    } catch (error) {
      // Always terminate the process before removing its unique temporary profile.
      // If teardown fails, stop here; never risk a second Chrome with a live profile.
      try {
        if (browser) await stop(browser);
        await remove(temporary);
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError],
          "NO-GO: error de Chrome y limpieza; no es seguro reintentar");
      }
      if (attempt === maxAttempts || error.code === "CHROME_SPAWN") {
        throw new Error("NO-GO: Chrome no inició tras " + attempt +
          " intento(s): " + error.message, { cause: error });
      }
      warn("CI-CHROME-P1: fallo de handshake Chrome en intento " + attempt +
        "/" + maxAttempts + "; perfil cerrado y eliminado; reintento aislado. " + error.message);
    }
  }
  throw new Error("NO-GO: Chrome no inició");
}
