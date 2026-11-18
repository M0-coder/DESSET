import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gitBlobSha1, inspectVisualBaseline, loadApprovedVisualBaseline } from "../scripts/visual-baseline.mjs";

const read = p => readFileSync(new URL("../"+p, import.meta.url));
const V12_HTML_BLOB = "77b81ec013ed229cff6e064823ce99b4b3b52c4a";
const V12_CSS_BLOB = "70ee2931257ee6e50f72656def5f19f379a8d5a7";
const V12_APP_BLOB = "e73c3ff7267057e8f384909bf62003e049d9a257";
const oldTile = "      <button class=\"tile tile--theme tile--button\" id=\"themeButton\" type=\"button\" aria-label=\"Activar el modo oscuro\" aria-pressed=\"false\">\n        <span class=\"theme-symbol\" aria-hidden=\"true\">☼</span>\n        <span class=\"theme-caption\">ACTIVAR MODO OSCURO.</span>\n        <span class=\"tile-arrow\" aria-hidden=\"true\">↗</span>\n      </button>";
const cssMarker = "\n/* THEME-V13 — isolated editorial/pixel card candidate; merge and deploy NOT authorized. */\n";

test("THEME-V13: only the theme tile changes compared with approved public V12",()=>{
  const html=read("index.html").toString("utf8");
  const start=html.indexOf('      <button class="tile tile--theme tile--button" id="themeButton"');
  const end=start<0?-1:html.indexOf('      </button>',start)+"      </button>".length;
  assert.ok(start>=0&&end>start,"the original toggle exists");
  assert.equal(html.indexOf('id="themeButton"',start+15),-1,"only one theme toggle");
  const candidate=html.slice(start,end);
  assert.match(candidate,/aria-label="Activar el modo oscuro"/);
  assert.match(candidate,/aria-pressed="false"/);
  assert.match(candidate,/class="theme-symbol" aria-hidden="true"/);
  assert.match(candidate,/class="theme-v13-gear"/);
  assert.match(candidate,/class="theme-v13-moon"/);
  assert.equal((candidate.match(/class="theme-v13-star theme-v13-star--/g)||[]).length,3);
  assert.match(candidate,/class="theme-caption">ACTIVAR MODO OSCURO\./);
  assert.match(candidate,/class="tile-arrow" aria-hidden="true">↗/);
  assert.doesNotMatch(candidate,/<script|<image\b|<use\b|<foreignObject|onload=|onclick=|href=|xlink:href=/i);
  const restored=html.slice(0,start)+oldTile+html.slice(end);
  assert.equal(gitBlobSha1(Buffer.from(restored)),V12_HTML_BLOB,
    "NO-GO: all nine other tiles, body and legacy markup must match published V12 exactly");
  assert.equal((html.match(/class="tile tile--/g)||[]).length,10);
  assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(html,/class="contact-v12-computer"/);
  assert.doesNotMatch(html,/CONTACTO \/ 01/);
});
test("THEME-V13: earlier CSS and all remaining scripts are byte-for-byte untouched",()=>{
  const css=read("styles.css").toString("utf8");
  const at=css.indexOf(cssMarker);
  assert.ok(at>0&&css.indexOf(cssMarker,at+cssMarker.length)===-1);
  assert.equal(gitBlobSha1(Buffer.from(css.slice(0,at))),V12_CSS_BLOB);
  const scoped=css.slice(at);
  assert.match(scoped,/\.tile--theme::before\{/);
  assert.match(scoped,/\.tile--theme \.theme-v13-gear/);
  assert.match(scoped,/\.tile--theme \.theme-v13-moon/);
  assert.match(scoped,/\.tile--theme \.tile-arrow\{/);
  assert.match(scoped,/border-radius:9px/);
  assert.match(scoped,/@media\(max-width:640px\)/);
  assert.match(scoped,/@media\(max-height:400px\)/);
  assert.doesNotMatch(scoped,/@import|@font-face|!important|position:\s*fixed|url\(/i);
  assert.doesNotMatch(scoped,/(?:^|\n)\s*(?:body|html|:root|\.board|\.tile--contact|\.tile--intro)\s*\{/m);
  assert.equal(gitBlobSha1(read("src/app.mjs")),V12_APP_BLOB);
  const js=read("src/app.mjs").toString("utf8");
  assert.match(js,/themeButton\.setAttribute\("aria-pressed",String\(dark\)\)/);
  assert.match(js,/themeButton\.setAttribute\("aria-label",dark\?/);
  assert.match(js,/themeButton\.querySelector\("\.theme-caption"\)\.textContent=dark\?/);
});
test("THEME-V13: signed V12 remains the immutable active gate until owner approval",()=>{
  const approved=loadApprovedVisualBaseline();
  assert.equal(approved.baseline_id,"DESSET-V12-CONTACT-2026-11-17");
  assert.equal(approved.status,"approved");
  assert.equal(approved.files["index.html"],V12_HTML_BLOB);
  assert.equal(approved.files["styles.css"],V12_CSS_BLOB);
  assert.deepEqual(inspectVisualBaseline(approved).diffs.sort(),["index.html","styles.css","index.html#body"].sort());
});
