// Teardown of an instrumented Chrome instance. No production assets or network calls.
import { rm } from "node:fs/promises";

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function waitForClose(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise(resolve => {
    let timer;
    const finish = success => {
      clearTimeout(timer);
      child.removeListener("close", onClose);
      child.removeListener("error", onError);
      resolve(success);
    };
    const onClose = () => finish(true);
    const onError = () => finish(false);
    child.once("close", onClose);
    child.once("error", onError);
    timer = setTimeout(() => finish(false), timeoutMs);
    if (child.exitCode !== null || child.signalCode !== null) finish(true);
  });
}

export async function stopChrome(child, { gracefulMs = 2000, forcedMs = 3000 } = {}) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const graceful = waitForClose(child, gracefulMs);
  child.kill("SIGTERM");
  if (await graceful) return;
  const forced = waitForClose(child, forcedMs);
  child.kill("SIGKILL");
  if (!(await forced)) throw new Error("Chrome no terminó tras SIGKILL y el límite de espera");
}

export async function removeChromeProfile(dir, {
  remove = rm, sleep = pause, maxAttempts = 5, retryDelayMs = 150
} = {}) {
  if (!dir) return;
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    throw new RangeError("Número de intentos de limpieza fuera de rango");
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await remove(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!["ENOTEMPTY", "EBUSY", "EPERM"].includes(error?.code) || attempt === maxAttempts) throw error;
      await sleep(retryDelayMs * attempt);
    }
  }
}

export async function closeBrowserResources(
  { ws, browser, server, temporary },
  { stop = stopChrome, remove = removeChromeProfile } = {}
) {
  const errors = [];
  let chromeStopped = false;
  try { ws?.close(); } catch (error) { errors.push(error); }
  try { await stop(browser); chromeStopped = true; } catch (error) { errors.push(error); }
  if (server) {
    try {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    } catch (error) { errors.push(error); }
  }
  // Never delete a profile that may still be used by a Chrome process.
  if (chromeStopped) {
    try { await remove(temporary); } catch (error) { errors.push(error); }
  }
  if (errors.length) throw new AggregateError(errors, "Falló el cierre de recursos del navegador");
}

export async function finishBrowserAudit(resources, primaryError, options) {
  let cleanupError;
  try { await closeBrowserResources(resources, options); } catch (error) { cleanupError = error; }
  if (primaryError) {
    if (cleanupError) console.error("Error secundario de limpieza Chrome:", cleanupError);
    throw primaryError;
  }
  if (cleanupError) throw cleanupError;
}
