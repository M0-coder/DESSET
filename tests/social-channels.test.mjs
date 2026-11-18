import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DETAILS } from "../src/content.mjs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("CANALES OFICIALES contains exactly the five founder-supplied destinations",()=>{
  assert.deepEqual(DETAILS.contact.links,[
    {label:"X",url:"https://x.com/deliver_assets"},
    {label:"Instagram",url:"https://www.instagram.com/deliver_assets/"},
    {label:"TikTok",url:"https://www.tiktok.com/@deliver_assets"},
    {label:"Facebook",url:"https://www.facebook.com/share/1EtpsZNFwQ/"},
    {label:"YouTube",url:"https://www.youtube.com/@deliver_assets"}
  ]);
  assert.deepEqual(DETAILS.contact.points,[
    "Los enlaces conducen a plataformas externas.",
    "Esta web es institucional: no admite pedidos ni pagos."
  ]);
  assert.equal(DETAILS.contact.links.length,5);
  assert.match(DETAILS.contact.kicker,/CANALES OFICIALES/);
  assert.match(DETAILS.contact.body,/noticias y avances del proyecto/);
});

test("each social destination is HTTPS, allowlisted and free of tracking queries",()=>{
  const domains=["x.com","www.instagram.com","www.tiktok.com","www.facebook.com","www.youtube.com"];
  const actual=DETAILS.contact.links.map(x=>new URL(x.url));
  assert.deepEqual(actual.map(x=>x.hostname),domains);
  actual.forEach(url=>{
    assert.equal(url.protocol,"https:");
    assert.equal(url.username,"");
    assert.equal(url.password,"");
    assert.equal(url.search,"");
    assert.equal(url.hash,"");
  });
  assert.match(DETAILS.contact.links[3].url,/facebook\.com\/share\/1EtpsZNFwQ\/$/);
});

test("external navigation is isolated, accessible and cannot execute injected HTML",()=>{
  const js=read("src/app.mjs");
  assert.match(js,/const isChannels=button\.dataset\.detail==="contact"/);
  assert.match(js,/dialog\.classList\.toggle\("detail-dialog--channels",isChannels\)/);
  assert.match(js,/dialogContent\.classList\.toggle\("dialog-content--channels",isChannels\)/);
  assert.match(js,/document\.createElement\("nav"\)/);
  assert.match(js,/new Set\(\["x\.com","www\.instagram\.com","www\.tiktok\.com","www\.facebook\.com","www\.youtube\.com"\]\)/);
  assert.match(js,/target\.protocol!=="https:"/);
  assert.match(js,/a\.target="_blank"/);
  assert.match(js,/a\.rel="noopener noreferrer"/);
  assert.match(js,/a\.setAttribute\("aria-label"/);
  assert.match(js,/a\.textContent=label/);
  assert.doesNotMatch(js,/\.innerHTML\s*=/);
});

test("only existing contact tile text changes, links use bounded responsive grid",()=>{
  const html=read("index.html"),css=read("styles.css");
  assert.match(html,/data-detail="contact"[\s\S]*?<span class="tile-title contact-v12-title">CANALES<br>OFICIALES\.<\/span>/);
  assert.doesNotMatch(html,/CONTACTO \/ 01/);
  assert.match(html,/data-detail="company"[\s\S]*?IDENTIDAD\./);
  assert.match(html,/data-detail="project">CONOCER EL PROYECTO/);
  assert.match(css,/\.detail-dialog--channels \.dialog-content--channels\{justify-content:flex-start;overflow-x:hidden;overflow-y:auto;/);
  assert.match(css,/\.channel-links\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.channel-links a\{display:flex;/);
  assert.match(css,/\.channel-links a:focus-visible\{outline:3px solid var\(--brand-blue-ink\)/);
  assert.doesNotMatch(html,/<a\b[^>]*href=["']https?:/);
});
