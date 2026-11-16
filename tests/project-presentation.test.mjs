import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DETAILS } from "../src/content.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Conocer el proyecto matches every founder-approved sentence exactly", () => {
  assert.deepEqual(DETAILS.project,{
    kicker:"PRESENTACIÓN",
    title:"DELIVER ASSETS / DESSET",
    body:"Una visión para integrar el comercio, los servicios y la logística.",
    points:[
      "DESSET nace con la ambición de transformar la manera en que las personas y las empresas acceden a productos, servicios y oportunidades comerciales.",
      "Nuestra visión es construir un ecosistema tecnológico donde comprar, vender, contratar servicios, reservar espacios y transportar mercancías formen parte de una experiencia conectada.",
      "No buscamos desarrollar únicamente una aplicación de entregas o un marketplace. Aspiramos a integrar diferentes mercados mediante plataformas especializadas que compartan una misma infraestructura digital.",
      "Nuestro propósito: reducir las barreras entre la oferta y la demanda, facilitar las operaciones comerciales y conectar el mundo digital con el movimiento físico de bienes y mercancías.",
      "Nuestro horizonte: construir una plataforma comercial y logística multisectorial, capaz de evolucionar desde operaciones locales hacia mercados nacionales e internacionales.",
      "DESSET es un proyecto en desarrollo. Su visión se ejecutará progresivamente, conforme se validen sus capacidades tecnológicas, comerciales y operativas."
    ]
  });
});

test("approved mission stays informational and does not promise active services", () => {
  const text=[DETAILS.project.body,...DETAILS.project.points].join(" ");
  assert.match(text,/DESSET es un proyecto en desarrollo/);
  assert.match(text,/Nuestra visión/);
  assert.match(text,/Nuestro propósito:/);
  assert.match(text,/Nuestro horizonte:/);
  assert.doesNotMatch(text,/ya estamos operando|compra ahora|servicio disponible|pedidos habilitados/i);
});

test("long-form content has an accessible project-only scroll, without typography overrides", () => {
  const css=read("styles.css"),js=read("src/app.mjs"),html=read("index.html");
  assert.match(css,/\.dialog-content--project\{justify-content:flex-start;overflow-y:auto;overscroll-behavior:contain\}/);
  assert.match(css,/\.project-prose\{display:grid;gap:clamp\(8px,1\.4vh,15px\)\}/);
  assert.doesNotMatch(css,/\.dialog-content--project\{[^}]*font|\.project-prose\{[^}]*font/);
  assert.match(js,/dialogContent\.classList\.toggle\("dialog-content--project",isProject\)/);
  assert.match(js,/dialogContent\.scrollTop=0/);
  assert.match(js,/p\.append\(note\)/);
  assert.match(html,/data-detail="project">CONOCER EL PROYECTO/);
  assert.match(html,/COMERCIO<br>Y <span class="brand-word">LOGÍSTICA<\/span>\.<br><span>UNA MISMA VISIÓN\.<\/span>/);
});

test("V5 physically constrains only the project dialog and keeps its reader scrollable",()=>{
  const css=read("styles.css"),js=read("src/app.mjs");
  assert.match(css,/\.detail-dialog\.detail-dialog--project\{height:min\(540px,calc\(100dvh - 24px\)\);overflow:hidden\}/);
  assert.match(css,/\.detail-dialog--project \.dialog-shell\{height:100%;max-height:none;min-height:0\}/);
  assert.match(css,/\.detail-dialog--project \.dialog-content--project\{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;/);
  assert.match(css,/scrollbar-color:var\(--brand-blue-ink\) transparent/);
  assert.match(css,/\.detail-dialog--project #detailBody strong,\.detail-dialog--project \.project-prose strong\{color:var\(--brand-blue-ink\)\}/);
  assert.match(js,/dialog\.classList\.toggle\("detail-dialog--project",isProject\)/);
  assert.match(js,/const prefix=\["Nuestra visión","Nuestro propósito:","Nuestro horizonte:"\]/);
  // Do not introduce typography changes inside the V5-specific selectors.
  for(const rule of css.match(/\.detail-dialog--project[^{}]*\{[^}]*\}/g)||[]){
    assert.doesNotMatch(rule,/(?:font-size|font-family|letter-spacing|line-height|font-weight)\s*:/);
  }
  assert.doesNotMatch(js,/innerHTML\s*=/);
});
