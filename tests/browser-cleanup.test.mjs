import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { stopChrome, removeChromeProfile, closeBrowserResources, finishBrowserAudit } from "../scripts/browser-cleanup.mjs";

class FakeChrome extends EventEmitter {
  constructor(onKill = () => {}) {
    super();
    this.exitCode = null;
    this.signalCode = null;
    this.signals = [];
    this.onKill = onKill;
  }
  kill(signal) {
    this.signals.push(signal);
    this.onKill(signal, this);
    return true;
  }
  finish(signal) {
    this.signalCode = signal;
    this.emit("close", null, signal);
  }
}

test("Chrome stops promptly on graceful signal", async () => {
  const chrome = new FakeChrome((signal, child) => child.finish(signal));
  await stopChrome(chrome, { gracefulMs: 30, forcedMs: 30 });
  assert.deepEqual(chrome.signals, ["SIGTERM"]);
  assert.equal(chrome.listenerCount("close"), 0);
});

test("Chrome delayed graceful exit is awaited before profile removal", async () => {
  let closed = false;
  const chrome = new FakeChrome((signal, child) => {
    setTimeout(() => { child.finish(signal); closed = true; }, 6);
  });
  await stopChrome(chrome, { gracefulMs: 80, forcedMs: 30 });
  assert.equal(closed, true);
  assert.deepEqual(chrome.signals, ["SIGTERM"]);
});

test("Chrome that ignores SIGTERM is SIGKILLed and waited for", async () => {
  const chrome = new FakeChrome((signal, child) => {
    if (signal === "SIGKILL") child.finish(signal);
  });
  await stopChrome(chrome, { gracefulMs: 5, forcedMs: 35 });
  assert.deepEqual(chrome.signals, ["SIGTERM", "SIGKILL"]);
});

test("Chrome refusing both signals is a bounded hard failure", async () => {
  const chrome = new FakeChrome();
  await assert.rejects(
    stopChrome(chrome, { gracefulMs: 5, forcedMs: 5 }),
    /no terminó tras SIGKILL/,
  );
  assert.deepEqual(chrome.signals, ["SIGTERM", "SIGKILL"]);
  assert.equal(chrome.listenerCount("close"), 0);
});

test("profile removal retries transient ENOTEMPTY and EBUSY, then succeeds", async () => {
  const errors = ["ENOTEMPTY", "EBUSY"];
  let tries = 0;
  const removed = [];
  await removeChromeProfile("/temporary/example", {
    maxAttempts: 4, retryDelayMs: 1,
    sleep: async ms => { assert.ok(ms <= 2); },
    remove: async (path, options) => {
      removed.push([path, options]);
      tries++;
      const code = errors.shift();
      if (code) throw Object.assign(new Error(code), { code });
    },
  });
  assert.equal(tries, 3);
  assert.ok(removed.every(([path, o]) => path === "/temporary/example" && o.recursive && o.force));
});

test("permanent ENOTEMPTY is reported after fixed maximum retries", async () => {
  let tries = 0;
  await assert.rejects(removeChromeProfile("/temporary/profile", {
    maxAttempts: 3, retryDelayMs: 1, sleep: async () => {},
    remove: async () => {
      tries++;
      throw Object.assign(new Error("still busy"), { code: "ENOTEMPTY" });
    },
  }), error => error.code === "ENOTEMPTY");
  assert.equal(tries, 3);
});

test("unexpected remove errors do not retry and are not swallowed", async () => {
  let tries = 0;
  await assert.rejects(removeChromeProfile("/temporary/profile", {
    remove: async () => {
      tries++;
      throw Object.assign(new Error("permission denied"), { code: "EACCES" });
    },
    sleep: async () => { throw new Error("unexpected wait"); },
  }), error => error.code === "EACCES");
  assert.equal(tries, 1);
});

test("resource cleanup continues after a child termination failure", async () => {
  let websocketClosed = false, serverClosed = false, profileRemoved = false;
  await assert.rejects(closeBrowserResources({
    ws: { close() { websocketClosed = true; } },
    browser: {}, server: { close(callback) { serverClosed = true; callback(); } },
    temporary: "/temporary/profile",
  }, {
    stop: async () => { throw new Error("chrome still alive"); },
    remove: async () => { profileRemoved = true; },
  }), AggregateError);
  assert.equal(websocketClosed, true);
  assert.equal(serverClosed, true);
  assert.equal(profileRemoved, true);
});

test("primary browser audit failure is preserved after cleanup", async () => {
  const primary = new Error("visual assertion failed");
  let removed = false;
  await assert.rejects(finishBrowserAudit({
    temporary: "/temporary/profile",
  }, primary, { remove: async () => { removed = true; } }), error => error === primary);
  assert.equal(removed, true);
});

test("cleanup failure propagates if the visual audit itself passed", async () => {
  await assert.rejects(finishBrowserAudit({
    temporary: "/temporary/profile",
  }, undefined, { remove: async () => { throw new Error("cannot clean"); } }),
  error => error instanceof AggregateError && error.errors[0].message === "cannot clean");
});
