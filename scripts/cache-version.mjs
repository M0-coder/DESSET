import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Release-only cache identity. Source HTML and approved Bento remain untouched.
export const STYLESHEET_PATHS = Object.freeze(["styles.css", "styles-compact.css"]);

export function versionedStylesheetUrl(path, bytes) {
  assert.ok(STYLESHEET_PATHS.includes(path), "NO-GO: stylesheet outside release allowlist");
  assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0, "NO-GO: stylesheet bytes are missing");
  const digest = createHash("sha256").update(bytes).digest("hex");
  return "./" + path + "?v=" + digest;
}

export function versionReleaseStylesheets(html, bytesByPath) {
  assert.equal(typeof html, "string", "NO-GO: invalid HTML release input");
  for (const path of STYLESHEET_PATHS) {
    const oldHref = 'href="./' + path + '"';
    assert.equal(html.split(oldHref).length, 2,
      "NO-GO: expected exactly one approved stylesheet reference for " + path);
    const newHref = 'href="' + versionedStylesheetUrl(path, bytesByPath[path]) + '"';
    html = html.replace(oldHref, newHref);
  }
  return html;
}
