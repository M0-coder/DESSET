// Historical V11 snapshot reconstruction for legacy regressions.
// Never used by the production approval gate. Fail-closed if the V12 delta changes.
import assert from "node:assert/strict";
import { gitBlobSha1, parseApprovedManifest } from "../../scripts/visual-baseline.mjs";
import { readFileSync } from "node:fs";

const originalContact = "      <button class=\"tile tile--contact tile--button\" type=\"button\" data-detail=\"contact\">\n        <span class=\"tile-label\">CONTACTO / 01</span>\n        <span class=\"tile-title\">CANALES<br>OFICIALES.</span>\n        <span class=\"tile-arrow\" aria-hidden=\"true\">↗</span>\n      </button>";
const contactOpen = '      <button class="tile tile--contact tile--button" type="button" data-detail="contact">';
const contactClose = '      </button>';
const marker = '\n/* CONTACT-V12 — implementation on the official web source; SHA authorization required for merge/release. */\n';
export const HISTORICAL_V11_HTML_SHA = "f964d7cddde9abaf321f3db6d3b942228131ce5b";
export const HISTORICAL_V11_CSS_SHA = "b6e054daa3d9af66abb19324683f0f9b3c0500bf";

export function restoreHistoricalV11Html(html) {
  const start = html.indexOf(contactOpen);
  assert.ok(start >= 0 && html.indexOf(contactOpen, start + contactOpen.length) === -1, "NO-GO: one contact card only");
  const end = html.indexOf(contactClose, start + contactOpen.length);
  assert.ok(end > start, "NO-GO: contact card does not close");
  const candidateTile = html.slice(start, end + contactClose.length);
  assert.match(candidateTile, /class="contact-v12-computer"/);
  assert.match(candidateTile, /class="contact-v12-cross"/);
  assert.doesNotMatch(candidateTile, /CONTACTO \/ 01/);
  const restored = html.slice(0, start) + originalContact + html.slice(end + contactClose.length);
  assert.equal(gitBlobSha1(Buffer.from(restored)), HISTORICAL_V11_HTML_SHA,
    "NO-GO: files outside CONTACT-V12 changed relative to immutable V11");
  return restored;
}

export function restoreHistoricalV11Css(css) {
  const index = css.indexOf(marker);
  assert.ok(index > 0 && css.indexOf(marker,index+marker.length) === -1, "NO-GO: contact style marker not unique");
  const original = css.slice(0,index);
  assert.equal(gitBlobSha1(Buffer.from(original)), HISTORICAL_V11_CSS_SHA,
    "NO-GO: earlier V11 CSS was modified");
  return original;
}

export function historicalV11Read(read) {
  return path => path === "index.html" ? Buffer.from(restoreHistoricalV11Html(read(path).toString("utf8"))) :
    path === "styles.css" ? Buffer.from(restoreHistoricalV11Css(read(path).toString("utf8"))) : read(path);
}

// V11 authorization evidence remains a frozen historical fixture; never substitutes for current gate.
export function loadHistoricalV11Manifest() {
  const bytes = readFileSync(new URL("../fixtures/visual-baseline-v11.json",import.meta.url));
  const m = parseApprovedManifest(bytes.toString("utf8"));
  assert.equal(m.baseline_id,"DESSET-V11-HERO-2026-11-17");
  assert.equal(m.source_commit,"5f1d5b711889868a1e14ab75a74448f91b34a59b");
  assert.equal(m.approval_evidence,"https://github.com/M0-coder/DESSET/issues/55#issuecomment-6964660907");
  assert.equal(m.files["index.html"],HISTORICAL_V11_HTML_SHA);
  assert.equal(m.files["styles.css"],HISTORICAL_V11_CSS_SHA);
  return m;
}
