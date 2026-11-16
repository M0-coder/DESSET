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
