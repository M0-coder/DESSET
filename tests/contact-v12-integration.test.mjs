import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gitBlobSha1 } from "../scripts/visual-baseline.mjs";

const read = path => readFileSync(new URL("../"+path, import.meta.url), "utf8");
const originalTile = "      <button class=\"tile tile--contact tile--button\" type=\"button\" data-detail=\"contact\">\n        <span class=\"tile-label\">CONTACTO / 01</span>\n        <span class=\"tile-title\">CANALES<br>OFICIALES.</span>\n        <span class=\"tile-arrow\" aria-hidden=\"true\">↗</span>\n      </button>";
const V11_HTML_BLOB = "f964d7cddde9abaf321f3db6d3b942228131ce5b";
const V11_CSS_BLOB = "b6e054daa3d9af66abb19324683f0f9b3c0500bf";
const CSS_MARKER = "\n/* CONTACT-V12 — implementation on the official web source; SHA authorization required for merge/release. */\n";

test("CONTACT-V12: only official contact button differs from V11 HTML",()=>{
  const html=read("index.html");
  const first=html.indexOf('      <button class="tile tile--contact tile--button" type="button" data-detail="contact">');
  const last=first<0?-1:html.indexOf('      </button>',first)+"      </button>".length;
  assert.ok(first>=0 && last>first,"Contact button present");
  assert.equal(html.indexOf('class="tile tile--contact',first+1),-1,"Only one contact tile");
  const restored=html.slice(0,first)+originalTile+html.slice(last);
  assert.equal(gitBlobSha1(Buffer.from(restored)),V11_HTML_BLOB,"All other site HTML byte-identical to V11");
  assert.equal((html.match(/class="tile tile--/g)||[]).length,10,"Bento has ten tiles");
  assert.ok(html.includes('<meta name="robots" content="noindex,nofollow">'));
  assert.doesNotMatch(html,/CONTACTO \/ 01/);
});
test("CONTACT-V12: styles elsewhere remain byte-identical to V11 CSS",()=>{
  const css=read("styles.css");
  const at=css.indexOf(CSS_MARKER);
  assert.ok(at>0,"Scoped style marker found");
  assert.equal(css.indexOf(CSS_MARKER,at+CSS_MARKER.length),-1);
  assert.equal(gitBlobSha1(Buffer.from(css.slice(0,at))),V11_CSS_BLOB);
  const scoped=css.slice(at);
  assert.match(scoped,/\.tile--contact::before\{/);
  assert.match(scoped,/border:1\.25px solid rgba\(42,39,34,\.78\)/);
  assert.match(scoped,/\.contact-v12-title/);
  assert.match(scoped,/\.contact-v12-computer/);
  assert.match(scoped,/\.contact-v12-cross/);
  assert.match(scoped,/body\[data-theme="dark"\] \.tile--contact/);
  assert.match(scoped,/@media\(max-width:640px\)/);
  assert.doesNotMatch(scoped,/@import|@font-face|!important|position:\s*fixed/);
  assert.doesNotMatch(scoped,/(?:^|\n)\s*(?:body|html|:root|\.board|\.tile--intro|\.tile--visual)\s*\{/m);
});
test("CONTACT-V12: working trigger, vector CRT, pixel cross and square arrow",()=>{
  const html=read("index.html");
  const start=html.indexOf('      <button class="tile tile--contact');
  const end=html.indexOf('      </button>',start);
  assert.ok(start>=0 && end>start);
  const tile=html.slice(start,end);
  assert.match(tile,/data-detail="contact"/);
  assert.match(tile,/CANALES<br>OFICIALES\./);
  assert.match(tile,/<svg class="contact-v12-computer"/);
  assert.match(tile,/viewBox="0 0 180 130"/);
  assert.match(tile,/aria-hidden="true" focusable="false"/);
  assert.match(tile,/#44e31b/);
  assert.match(tile,/class="contact-v12-cross" aria-hidden="true"/);
  assert.match(tile,/class="tile-arrow" aria-hidden="true"/);
  assert.doesNotMatch(tile,/<script|<foreignObject|<image\b|<use\b|xlink:href|href=|onload\s*=/i);
  assert.doesNotMatch(tile,/https?:\/\//);
});
