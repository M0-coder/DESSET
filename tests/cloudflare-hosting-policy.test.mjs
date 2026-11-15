import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { CLOUDFLARE_RELEASE_HEADERS } from "../scripts/cloudflare-headers.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const sha256 = text => createHash("sha256").update(text).digest("hex");

test("the Cloudflare release header bytes match the last approved deployment", () => {
  // Verified against approved GitHub Actions release artifact #14175933962.
  assert.equal(
    sha256(CLOUDFLARE_RELEASE_HEADERS),
    "0f09d71140acc0e820f619c996ee62a5974ac7595c0c2ac71c96823fa917f79a",
    "Cloudflare production headers must not drift during legacy cleanup",
  );
});

test("the release builder and hosting guard use the same Cloudflare policy module", () => {
  const builder = read("scripts/cloudflare-release-candidate.mjs");
  const guard = read("scripts/hosting-policy-gate.mjs");
  for (const source of [builder, guard]) {
    assert.match(source, /from "\.\/cloudflare-headers\.mjs"/);
    assert.doesNotMatch(source, /vercel\.json/);
  }
  assert.match(builder, /const header=CLOUDFLARE_RELEASE_HEADERS;/);
  assert.match(guard, /const headers=CLOUDFLARE_RELEASE_HEADERS;/);
});

test("no longer copy the legacy Vercel configuration into local packages", () => {
  assert.equal(existsSync(new URL("../vercel.json", import.meta.url)), false);
  assert.doesNotMatch(read("scripts/release-package.mjs"), /vercel\.json/);
  assert.match(read("scripts/release-package-gate.mjs"),
    /!existsSync\(path\("vercel\.json"\)\)/);
});

test("Cloudflare fail-closed SEO and CSP controls remain in effect", () => {
  const header = CLOUDFLARE_RELEASE_HEADERS;
  for (const x of [
    "Content-Security-Policy:", "default-src 'self'", "script-src 'self'",
    "object-src 'none'", "frame-ancestors 'none'", "upgrade-insecure-requests",
    "X-Frame-Options: DENY", "Permissions-Policy:"
  ]) assert.ok(header.includes(x), x);
  assert.doesNotMatch(header, /unsafe-inline|unsafe-eval|X-Robots-Tag:\s*noindex/i);
  assert.match(read("index.html"), /name="robots" content="noindex,nofollow"/);
});
