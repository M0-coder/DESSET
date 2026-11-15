import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/cloudflare-pages-production.yml", import.meta.url),
  "utf8",
);

function extractCurlCommands(source) {
  // Unfold shell line continuations before inspecting flags on a whole command.
  const unfolded = source.replace(/\\\r?\n[ \t]*/g, " ");
  return [...unfolded.matchAll(/\bcurl[^\n]*/g)]
    .map(([command]) => command.trim());
}

function hasIncompatibleCurlFlags(command) {
  const args = command.replace(/\\\r?\n\s*/g, " ").trim().split(/\s+/);
  const withBody = args.includes("--fail-with-body");
  const shortFail = args.some((arg) => /^-(?!-)[a-zA-Z]*f[a-zA-Z]*$/.test(arg));
  return withBody && shortFail;
}

test("curl guard rejects -f together with --fail-with-body", () => {
  assert.equal(hasIncompatibleCurlFlags("curl --fail-with-body -fsS https://example.com"), true);
  assert.equal(
    hasIncompatibleCurlFlags(extractCurlCommands("curl --fail-with-body \\\n  -sSf https://example.com")[0]),
    true,
    "Regression guard must recognize options on continued shell lines",
  );
  assert.equal(hasIncompatibleCurlFlags("curl -sSf --fail-with-body https://example.com"), true);
  assert.equal(hasIncompatibleCurlFlags("curl --fail-with-body -sS https://example.com"), false);
  assert.equal(hasIncompatibleCurlFlags("curl -fsSI https://example.com"), false);
});

test("production Cloudflare workflow has no conflicting curl flags", () => {
  const commands = extractCurlCommands(workflow);
  assert.ok(commands.length >= 9, "Expected coverage of all credential and live smoke curl calls");
  for (const command of commands) {
    assert.equal(hasIncompatibleCurlFlags(command), false, `Conflicting curl flags: ${command}`);
  }
  assert.equal(commands.filter((command) => command.includes("--fail-with-body")).length, 7);
});
