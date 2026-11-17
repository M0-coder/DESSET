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
  assert.equal(commands.filter((command) => command.includes("--fail-with-body")).length, 8,
    "Expected all original calls and the versioned CSS integrity download");
  assert.ok(workflow.includes("for css in styles.css styles-compact.css; do"),
    "Release must verify both CSS assets after deployment");
  assert.ok(workflow.includes('sha256sum "$css"'),
    "CSS cache query version must match real file bytes");
  assert.ok(workflow.includes('cmp -s "$css" "/tmp/desset-public-${css}"'),
    "Public CSS bytes must match the approved checkout");
});


function hasPrematureCurlPipe(source) {
  // grep -q can exit early and close curl's stdout under pipefail.
  const unfolded = source.replace(/\\\r?\n[ \t]*/g, " ");
  return /\bcurl\b[^\n]*\|\s*(?:\n[ \t]*)?grep\s+-[a-zA-Z]*q\b/.test(unfolded);
}

test("regression: quiet grep after curl causes curl exit 23 and must be forbidden", () => {
  const broken = "curl --fail-with-body -sS https://www.desset.lat/ |\n  grep -Fq 'DELIVER ASSETS / DESSET'";
  const safe = "curl --fail-with-body -sS https://www.desset.lat/ -o /tmp/www.html\n" +
    "grep -Fq 'DELIVER ASSETS / DESSET' /tmp/www.html";
  assert.equal(hasPrematureCurlPipe(broken), true);
  assert.equal(hasPrematureCurlPipe(safe), false);
  const smoke = workflow.split("      - name: Live HTTPS smoke after deployment\n")[1];
  assert.ok(smoke, "No live HTTPS smoke step exists");
  assert.equal(hasPrematureCurlPipe(smoke), false,
    "NO-GO: curl piped to grep -q can fail after a successful deployment");
});

test("release smoke drains HTTPS responses before checking content and status", () => {
  const smoke = workflow.split("      - name: Live HTTPS smoke after deployment\n")[1];
  for (const [download,match] of [
    ['-o /tmp/desset-published-index.html', 'grep -Fq "DELIVER ASSETS / DESSET" /tmp/desset-published-index.html'],
    ['-o /tmp/desset-published-www-index.html', 'grep -Fq "DELIVER ASSETS / DESSET" /tmp/desset-published-www-index.html'],
    ['-o /tmp/desset-published-robots.txt', 'grep -Fq "Sitemap: https://desset.lat/sitemap.xml" /tmp/desset-published-robots.txt'],
    ['-o /tmp/desset-published-sitemap.xml', 'grep -Fq "https://desset.lat/" /tmp/desset-published-sitemap.xml'],
    ['-o /tmp/desset-published-headers.txt', "grep -iq '^content-security-policy:' /tmp/desset-published-headers.txt"],
  ]) {
    assert.ok(smoke.includes(download), "Missing fully drained curl output: " + download);
    assert.ok(smoke.includes(match), "Missing fail-closed check: " + match);
  }
  assert.match(smoke, /missing_code="\$\(curl --silent --show-error -o \/dev\/null -w '%\{http_code\}'/);
  assert.match(smoke, /test "\$missing_code" = "404"/);
  assert.match(smoke, /cmp -s assets\/deliver-assets-mark\.png \/tmp\/desset-public-logo\.png/);
  assert.match(smoke, /cmp -s "\$css" "\/tmp\/desset-public-\$\{css\}"/);
  assert.match(smoke, /set -euo pipefail/);
  assert.match(workflow, /inputs\.confirm == 'PUBLICAR_DESSET'/);
  assert.match(workflow, /--commit-hash="\$GITHUB_SHA"/);
});
