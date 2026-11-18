import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";

const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const digest=p=>createHash("sha256").update(readFileSync(new URL(p,root))).digest("hex");

test("OPERATION-FLOW-V1: offline preview does not modify approved website files",()=>{
  const protectedPaths=["index.html","styles.css","src/content.mjs","src/app.mjs","assets/roles-geometry-v2.svg","config/visual-baseline-approved.json"];
  const before=protectedPaths.map(digest);
  execFileSync(process.execPath,[fileURLToPath(new URL("proposals/operation-flow-v1/build-preview.mjs",root))],{
    cwd:fileURLToPath(root),encoding:"utf8",timeout:15000
  });
  assert.deepEqual(protectedPaths.map(digest),before,"no approved file may be changed");
  const candidate=JSON.parse(read("reports/operation-flow-v1/candidate.json"));
  assert.equal(candidate.production_authorized,false);
  assert.equal(candidate.merge_authorized,false);
  const html=read("reports/operation-flow-v1/index.html");
  const css=read("reports/operation-flow-v1/styles.css");
  const content=read("reports/operation-flow-v1/src/content.mjs");
  const svg=read("reports/operation-flow-v1/assets/flow-operation-v1.svg");
  assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(html,/flow-operation-v1\.svg/);
  assert.match(html,/DEL PEDIDO A LA ENTREGA/);
  assert.match(html,/DESSET PARA<br>TU NEGOCIO/);
  assert.doesNotMatch(html,/CUATRO ROLES\.<br>UNA ARQUITECTURA/);
  assert.match(html,/data-detail="ecosystem"/);
  assert.match(html,/data-detail="apps"/);
  assert.match(html,/class="contact-v12-computer"/);
  assert.match(html,/src="\.\/assets\/desset-eye\.gif"/);
  assert.match(css,/\.tile--visual \.flow-graphic/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(content,/kicker:"RECORRIDO LOGÍSTICO"/);
  assert.match(content,/kicker:"PARA COMERCIOS"/);
  assert.match(svg,/viewBox="0 0 720 380"/);
  assert.match(svg,/prefers-reduced-motion:reduce/);
  assert.match(svg,/offset-distance/);
  for(const word of ["PEDIDO","COMERCIO","REPARTO","ENTREGA","CONTROL"])
    assert.ok(svg.includes(word),word);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|javascript:|data:)/i);
  assert.ok(existsSync(new URL("reports/operation-flow-v1/assets/desset-eye-still.png",root)));
});
