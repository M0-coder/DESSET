// Cloudflare Pages release policy. Production continues to use the previous deployed artifact until separately authorized.
// Analytics allowlisting prepares for the AUTOMATIC beacon (first-party /cdn-cgi/rum); it does not enable tracking.
export const CLOUDFLARE_ANALYTICS_SCRIPT = "https://static.cloudflareinsights.com/beacon.min.js";
export const CLOUDFLARE_SOURCE_META_CSP = "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";
export const CLOUDFLARE_RELEASE_META_CSP = `default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self' ${CLOUDFLARE_ANALYTICS_SCRIPT}; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`;
export const CLOUDFLARE_RELEASE_HEADERS = `/*
  Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self' ${CLOUDFLARE_ANALYTICS_SCRIPT}; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
`;
