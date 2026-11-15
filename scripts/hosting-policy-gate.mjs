// Validate the Cloudflare Pages production header policy (not a legacy Vercel config).
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CLOUDFLARE_RELEASE_HEADERS,CLOUDFLARE_ANALYTICS_SCRIPT,CLOUDFLARE_SOURCE_META_CSP} from "./cloudflare-headers.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const headers=CLOUDFLARE_RELEASE_HEADERS;
assert.ok(headers.startsWith("/*\n"),"Cloudflare _headers must apply to every path");
for(const directive of [
  "Content-Security-Policy:","default-src 'self'","script-src 'self'",
  "object-src 'none'","frame-ancestors 'none'","form-action 'none'",
  "X-Content-Type-Options: nosniff","X-Frame-Options: DENY",
  "Referrer-Policy: no-referrer","Permissions-Policy:","upgrade-insecure-requests"
]) assert.ok(headers.includes(directive),"Missing Cloudflare production policy: "+directive);
assert.doesNotMatch(headers,/unsafe-inline|unsafe-eval|X-Robots-Tag:\s*noindex/i);
assert.ok(headers.includes("script-src 'self' "+CLOUDFLARE_ANALYTICS_SCRIPT+"; connect-src 'self';"),"El beacon RUM automático requiere script externo acotado y endpoint first-party");
assert.doesNotMatch(headers,/script-src[^;\n]*\*|connect-src[^;\n]*\*/, "NO-GO: comodines CSP no autorizados");

const html=read("index.html");
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
assert.doesNotMatch(html,/<link[^>]*rel="canonical"/i);
console.log("GATE HOSTING CLOUDFLARE: origin stays protected; production _headers policy validated.");
