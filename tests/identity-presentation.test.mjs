import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DETAILS} from "../src/content.mjs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("IDENTIDAD V6 reproduces the exact founder-approved copy",()=>{
  assert.deepEqual(DETAILS.company,{
    kicker:"DESSET / IDENTIDAD",
    title:"UNA IDENTIDAD.\nUNA VISIÓN QUE CONECTA.",
    body:"DESSET nace con la convicción de que el comercio, los servicios y la logística pueden avanzar conectados.",
    points:[
      "Aspiramos a construir un ecosistema tecnológico que una personas, empresas y mercados, facilitando nuevas oportunidades.",
      "Nuestra identidad se fundamenta en tres principios: conexión, confianza y evolución.",
      "Nuestra visión nos define. Nuestras acciones deberán demostrarla.",
      "DELIVER ASSETS / DESSET — PROYECTO EN DESARROLLO"
    ]
  });
  assert.equal(DETAILS.company.points.length,4);
});

test("identity is descriptive, not a claim of launched services",()=>{
  const all=[DETAILS.company.title,DETAILS.company.body,...DETAILS.company.points].join(" ");
  assert.match(all,/PROYECTO EN DESARROLLO/);
  assert.doesNotMatch(all,/servicio activo|ya disponible|comprar ahora|iniciar pedido/i);
  assert.equal(DETAILS.project.title,"DELIVER ASSETS / DESSET");
  assert.match(DETAILS.status.body,/no consta como inscrita/);
});

test("company tile remains the only entry point, other Bento content is unmodified",()=>{
  const html=read("index.html");
  assert.match(html,/data-detail="company"[\s\S]*?IDENTIDAD\./);
  assert.match(html,/COMERCIO<br>Y <span class="brand-word">LOGÍSTICA<\/span>\.<br><span>UNA MISMA VISIÓN\.<\/span>/);
  assert.match(html,/data-detail="project">CONOCER EL PROYECTO/);
});

test("identity has its own bounded modal reader, unchanged type and safe DOM rendering",()=>{
  const js=read("src/app.mjs"),css=read("styles.css");
  assert.match(js,/const isIdentity=button\.dataset\.detail==="company"/);
  assert.match(js,/dialog\.classList\.toggle\("detail-dialog--identity",isIdentity\)/);
  assert.match(js,/dialogContent\.classList\.toggle\("dialog-content--identity",isIdentity\)/);
  assert.match(js,/heading\.replaceChildren\(document\.createTextNode\(firstLine\),document\.createElement\("br"\),accent\)/);
  assert.match(js,/points\.after\(prose\)/);
  assert.doesNotMatch(js,/innerHTML\s*=/);
  assert.match(css,/\.detail-dialog\.detail-dialog--identity\{height:min\(540px,calc\(100dvh - 24px\)\);overflow:hidden\}/);
  assert.match(css,/\.detail-dialog--identity \.dialog-content--identity\{flex:1 1 auto;min-height:0;justify-content:flex-start;overflow-x:hidden;overflow-y:auto;/);
  assert.match(css,/\.identity-prose\{display:grid;gap:clamp\(8px,1\.4vh,15px\)\}/);
  assert.match(css,/\.detail-dialog--identity #detailTitle \.identity-accent,\.detail-dialog--identity \.identity-prose strong\{color:var\(--brand-blue-ink\)\}/);
  assert.match(css,/@media\(min-width:641px\)\{\s*\.detail-dialog--identity \.dialog-content--identity\{scrollbar-gutter:auto\}/);
  assert.match(css,/@media\(min-width:641px\) and \(min-height:700px\)\{\s*\.detail-dialog\.detail-dialog--identity\{height:fit-content;max-height:min\(580px,calc\(100dvh - 24px\)\)\}/);
  assert.match(css,/\.detail-dialog--identity \.dialog-shell\{height:auto;max-height:calc\(100dvh - 42px\)\}/);
  assert.match(css,/\.detail-dialog--identity \.dialog-content--identity\{flex:1 1 auto;min-height:0;justify-content:flex-start;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;/);
  for(const match of css.match(/\.detail-dialog--identity[^{}]*\{[^}]*\}/g)||[]){
    assert.doesNotMatch(match,/(?:font-size|font-family|font-weight|line-height|letter-spacing)\s*:/);
  }
});
