// Immutable V12 snapshot reconstruction for THEME-V13 regression tests.
// NEVER used by the runtime/release gate. Fail closed on any out-of-scope mutation.
import assert from "node:assert/strict";
import { gitBlobSha1 } from "../../scripts/visual-baseline.mjs";

export const V12_HTML_SHA = "77b81ec013ed229cff6e064823ce99b4b3b52c4a";
export const V12_CSS_SHA = "70ee2931257ee6e50f72656def5f19f379a8d5a7";
const oldTheme="      <button class=\"tile tile--theme tile--button\" id=\"themeButton\" type=\"button\" aria-label=\"Activar el modo oscuro\" aria-pressed=\"false\">\n        <span class=\"theme-symbol\" aria-hidden=\"true\">☼</span>\n        <span class=\"theme-caption\">ACTIVAR MODO OSCURO.</span>\n        <span class=\"tile-arrow\" aria-hidden=\"true\">↗</span>\n      </button>";
const marker = "\n/* THEME-V13 — isolated editorial/pixel card candidate; merge and deploy NOT authorized. */\n";
const open = '      <button class="tile tile--theme tile--button" id="themeButton" type="button" aria-label="Activar el modo oscuro" aria-pressed="false">';
const close = "      </button>";
export function restorePublishedV12Html(html){
  const start=html.indexOf(open);
  assert.ok(start>=0&&html.indexOf(open,start+open.length)===-1,"NO-GO: theme button not unique");
  const end=html.indexOf(close,start+open.length);
  assert.ok(end>start,"NO-GO: theme button not closed");
  const candidate=html.slice(start,end+close.length);
  assert.match(candidate,/class="theme-v13-gear"/);
  assert.match(candidate,/class="theme-v13-moon"/);
  assert.equal((candidate.match(/class="theme-v13-star theme-v13-star--/g)||[]).length,3);
  assert.doesNotMatch(candidate,/<script|<image\b|<use\b|<foreignObject|onload=/i);
  const restored=html.slice(0,start)+oldTheme+html.slice(end+close.length);
  assert.equal(gitBlobSha1(Buffer.from(restored)),V12_HTML_SHA,"NO-GO: V12 HTML outside theme differs from published baseline");
  return restored;
}
export function restorePublishedV12Css(css){
  const start=css.indexOf(marker);
  assert.ok(start>0&&css.indexOf(marker,start+marker.length)===-1,"NO-GO: theme style marker not unique");
  const original=css.slice(0,start);
  assert.equal(gitBlobSha1(Buffer.from(original)),V12_CSS_SHA,"NO-GO: approved V12 CSS changed");
  return original;
}
export const publishedV12Read = read => path=>path==="index.html"?
 Buffer.from(restorePublishedV12Html(read(path).toString("utf8"))):
 path==="styles.css"?Buffer.from(restorePublishedV12Css(read(path).toString("utf8"))):read(path);
