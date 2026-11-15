import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { CLOUDFLARE_RELEASE_HEADERS, CLOUDFLARE_ANALYTICS_SCRIPT, CLOUDFLARE_SOURCE_META_CSP, CLOUDFLARE_RELEASE_META_CSP } from "../scripts/cloudflare-headers.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const sha256 = text => createHash("sha256").update(text).digest("hex");

test("the future release CSP is byte-pinned; the already deployed approved header remains a distinct historical artifact", () => {
  const candidateSha = sha256(CLOUDFLARE_RELEASE_HEADERS);
  assert.equal(candidateSha, "fb5a1578348524c0109d9af5e65d16e633254a1a4877c772abc07a146ba59a74",
    "NO-GO: Cloudflare candidate _headers have changed without review");
  // SHA-256 from approved production artifact #14175933962, not to be rewritten as deployed candidate.
  assert.notEqual(candidateSha, "0f09d71140acc0e820f619c996ee62a5974ac7595c0c2ac71c96823fa917f79a");
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

test("automatic Cloudflare analytics CSP allows only beacon.min.js and first-party /cdn-cgi/rum", () => {
  for (const csp of [CLOUDFLARE_RELEASE_HEADERS,CLOUDFLARE_RELEASE_META_CSP]) {
    assert.ok(csp.includes("script-src 'self' "+CLOUDFLARE_ANALYTICS_SCRIPT+"; connect-src 'self';"),
      "Unrestricted or missing Cloudflare RUM CSP");
    assert.doesNotMatch(csp,/unsafe-inline|unsafe-eval|https:\/\/\*|connect-src[^;\\n]*cloudflareinsights\.com/i);
    assert.ok(!csp.includes("https://cloudflareinsights.com/"),"Automatic injection must use first-party RUM endpoint");
  }
  assert.match(read("index.html"),/name="robots" content="noindex,nofollow"/);
  assert.ok(read("index.html").includes('<meta http-equiv="Content-Security-Policy" content="'+CLOUDFLARE_SOURCE_META_CSP+'">'),
    "Never change source preview CSP or approved visual baseline");
  assert.doesNotMatch(read("index.html"),/static\.cloudflareinsights\.com|<script[^>]*data-cf-beacon/);
});
