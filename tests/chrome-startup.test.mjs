import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { launchChromeWithRetry, waitForDevToolsPort } from "../scripts/chrome-startup.mjs";

class FakeChrome extends EventEmitter {
  constructor() {
    super();
    this.exitCode = null;
    this.signalCode = null;
    this.stderr = new EventEmitter();
  }
}

test("waits for a fully written DevToolsActivePort and accepts only numeric TCP ports", async () => {
  const child = new FakeChrome();
  let reads = 0, clock = 0;
  const port = await waitForDevToolsPort(child, "/tmp/desset-unit-test", {
    timeoutMs: 500,
    now: () => clock,
    sleep: async ms => { clock += ms; },
    exists: () => true,
    read: async () => ++reads === 1 ? "" : "42319\n/devtools/browser/abc",
  });
  assert.equal(port, 42319);
  assert.equal(reads, 2);
  assert.equal(child.listenerCount("error"), 0);
});

test("a delayed Chrome marker can appear within the bounded startup window", async () => {
  const child = new FakeChrome();
  let clock = 0;
  const result = await waitForDevToolsPort(child, "/tmp/desset-unit-test", {
    timeoutMs: 500,
    intervalMs: 100,
    now: () => clock,
    sleep: async ms => { clock += ms; },
    exists: () => clock >= 300,
    read: async () => "33445\n",
  });
  assert.equal(result, 33445);
  assert.equal(clock, 300);
});

test("timeout fails closed with bounded diagnostics rather than silently skipping audit", async () => {
  const child = new FakeChrome();
  let clock = 0;
  await assert.rejects(waitForDevToolsPort(child, "/tmp/desset-unit-test", {
    timeoutMs: 300,
    now: () => clock,
    sleep: async ms => { clock += ms; },
    exists: () => false,
    stderr: () => "x".repeat(10000),
  }), error => {
    assert.equal(error.code, "CHROME_STARTUP");
    assert.match(error.message, /DevToolsActivePort/);
    assert.match(error.message, /300 ms/);
    assert.ok(error.message.length < 2200, "Do not leak unbounded Chrome stderr");
    return true;
  });
  assert.equal(child.listenerCount("error"), 0);
});

test("process termination by signal is detected without waiting for the full timeout", async () => {
  const child = new FakeChrome();
  child.signalCode = "SIGKILL";
  await assert.rejects(waitForDevToolsPort(child, "/tmp/desset-unit-test", {
    timeoutMs: 30000,
    exists: () => false,
  }), error => {
    assert.equal(error.code, "CHROME_STARTUP");
    assert.match(error.message, /SIGKILL/);
    return true;
  });
});

test("spawn errors are reported explicitly and the error listener is removed", async () => {
  const child = new FakeChrome();
  let clock = 0;
  await assert.rejects(waitForDevToolsPort(child, "/tmp/desset-unit-test", {
    timeoutMs: 500,
    now: () => clock,
    sleep: async ms => {
      clock += ms;
      child.emit("error", Object.assign(new Error("ENOENT browser not found"), { code: "ENOENT" }));
    },
    exists: () => false,
  }), error => {
    assert.equal(error.code, "CHROME_SPAWN");
    assert.match(error.message, /ENOENT browser not found/);
    return true;
  });
  assert.equal(child.listenerCount("error"), 0);
});

test("invalid, out-of-range or truncated marker data never pass the handshake", async () => {
  for (const marker of ["0", "-1", "65536", "hello", "1e4"]) {
    let clock = 0;
    await assert.rejects(waitForDevToolsPort(new FakeChrome(), "/tmp/desset-unit-test", {
      timeoutMs: 200,
      now: () => clock,
      sleep: async ms => { clock += ms; },
      exists: () => true,
      read: async () => marker,
    }), /DevToolsActivePort/);
  }
});

test("transient missing marker triggers exactly one fresh-profile retry with cleanup", async () => {
  const profiles = [], launches = [], removed = [], stopped = [], warnings = [];
  const result = await launchChromeWithRetry("fake-chrome", {
    makeProfile: async () => {
      const profile = "/tmp/desset-startup-test-" + (profiles.length + 1);
      profiles.push(profile);
      return profile;
    },
    spawnBrowser: (binary, args, options) => {
      launches.push({ binary, args, options });
      return new FakeChrome();
    },
    waitForPort: async (_child, dir) => {
      if (dir === profiles[0]) throw new Error("DevToolsActivePort did not appear");
      return 38151;
    },
    stop: async child => { stopped.push(child); child.signalCode = "SIGTERM"; },
    remove: async path => { removed.push(path); },
    warn: message => warnings.push(message),
  });
  assert.equal(result.port, 38151);
  assert.equal(result.startupAttempts, 2);
  assert.equal(result.temporary, profiles[1]);
  assert.equal(launches.length, 2);
  assert.equal(stopped.length, 1);
  assert.deepEqual(removed, [profiles[0]]);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /reintento aislado/);
  assert.ok(launches.every(x => x.binary === "fake-chrome" &&
    x.args.includes("--remote-debugging-port=0") &&
    x.options.stdio[2] === "pipe"));
  assert.ok(launches[1].args.includes("--user-data-dir=" + profiles[1]));
  assert.notEqual(profiles[0], profiles[1]);
});

test("both handshakes failing is a hard error; retries never exceed two", async () => {
  let launched = 0, cleaned = 0;
  await assert.rejects(launchChromeWithRetry("fake", {
    makeProfile: async () => "/tmp/desset-test-" + ++launched,
    spawnBrowser: () => new FakeChrome(),
    waitForPort: async () => { throw new Error("handshake failed"); },
    stop: async child => { child.signalCode = "SIGTERM"; },
    remove: async () => { cleaned++; },
    warn: () => {},
  }), /NO-GO: Chrome no inició tras 2 intento\(s\)/);
  assert.equal(launched, 2);
  assert.equal(cleaned, 2);
});

test("a failed Chrome cleanup prevents any retry or profile reuse", async () => {
  let attempts = 0, removes = 0;
  await assert.rejects(launchChromeWithRetry("fake", {
    makeProfile: async () => "/tmp/desset-unique-" + ++attempts,
    spawnBrowser: () => new FakeChrome(),
    waitForPort: async () => { throw new Error("launch failed"); },
    stop: async () => { throw new Error("Chrome still running"); },
    remove: async () => { removes++; },
    warn: () => {},
  }), error => error instanceof AggregateError && /NO-GO/.test(error.message));
  assert.equal(attempts, 1);
  assert.equal(removes, 0, "Do not remove a possibly live Chrome profile");
});

test("spawn failures are hard errors, not a retry loop", async () => {
  let launched = 0;
  await assert.rejects(launchChromeWithRetry("fake", {
    makeProfile: async () => "/tmp/desset-test-" + ++launched,
    spawnBrowser: () => new FakeChrome(),
    waitForPort: async () => {
      const error = new Error("spawn ENOENT");
      error.code = "CHROME_SPAWN";
      throw error;
    },
    stop: async () => {},
    remove: async () => {},
    warn: () => {},
  }), /NO-GO: Chrome no inició tras 1 intento\(s\)/);
  assert.equal(launched, 1);
});

test("invalid options cannot disable startup bounds", async () => {
  await assert.rejects(launchChromeWithRetry("fake", { maxAttempts: 10 }), RangeError);
  await assert.rejects(waitForDevToolsPort(new FakeChrome(), "/tmp/any", { timeoutMs: -1 }), RangeError);
  await assert.rejects(waitForDevToolsPort(new FakeChrome(), "/tmp/any", { intervalMs: 0 }), RangeError);
});

test("browser audits retain all 13 resolutions, real assertions and fail-closed cleanup", () => {
  const audit = readFileSync(new URL("../scripts/browser-audit.mjs", import.meta.url), "utf8");
  assert.match(audit, /launchChromeWithRetry\(findChrome\(\)\)/);
  assert.match(audit, /\[1920, 1080\]/);
  assert.match(audit, /\[320, 256\]/);
  assert.match(audit, /checkCompactMetrics/);
  assert.match(audit, /checkMetrics/);
  assert.match(audit, /prefers-reduced-motion/);
  assert.match(audit, /Profiler\.takePreciseCoverage/);
  assert.match(audit, /navigation\.errorText/);
  assert.match(audit, /if \(!boardReady\)/);
  assert.match(audit, /NO-GO: tablero Bento no cargó/);
  assert.match(audit, /detail\.exception\?\.description/);
  assert.match(audit, /await finishBrowserAudit\(\{ ws, browser, server, temporary \}, primaryError\)/);
  assert.doesNotMatch(audit, /process\.env\.SKIP|skipVisual|CHROME_IGNORE_ERRORS/i);
});
