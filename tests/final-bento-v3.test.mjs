import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const sha=p=>createHash("sha256").update(readFileSync(new URL(p,root))).digest("hex");
test("FINAL BENTO V3 builds real interactive candidate and never mutates approved files",()=>{
 const protectedPaths=["index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/roles-geometry-v2.svg","config/visual-baseline-approved.json"];
 const original=protectedPaths.map(sha);
 execFileSync(process.execPath,[fileURLToPath(new URL("proposals/final-bento-v3/build-preview.mjs",root))],
   {cwd:fileURLToPath(root),timeout:18000,encoding:"utf8",env:{...process.env,CLOUDFLARE_API_TOKEN:"",DESSET_RELEASE_APPROVED:"",DESSET_CF_RELEASE_MODE:""}});
 assert.deepEqual(protectedPaths.map(sha),original,"approved source has changed!");
 const html=read("reports/final-bento-v3/index.html");
 const css=read("reports/final-bento-v3/styles.css");
 const content=read("reports/final-bento-v3/src/content.mjs");
 const runner=read("reports/final-bento-v3/src/app.mjs");
 const rider=read("reports/final-bento-v3/assets/rider-city-v3.svg");
 const business=read("reports/final-bento-v3/assets/business-dashboard-v3.svg");
 const manifest=JSON.parse(read("reports/final-bento-v3/candidate.json"));
 assert.equal(manifest.publication_authorized,false);
 assert.equal(manifest.merge_authorized,false);
 assert.equal(manifest.approved_source_preserved,true);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
 assert.match(html,/content="default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"/);
 assert.match(html,/assets\/rider-city-v3\.svg/);
 assert.match(html,/assets\/business-dashboard-v3\.svg/);
 assert.match(html,/PIDE · MIRA · RECIBE/);
 assert.match(html,/PARA TU<br>NEGOCIO\./);
 assert.doesNotMatch(html,/CUATRO ROLES\.<br>UNA ARQUITECTURA\./);
 assert.doesNotMatch(html,/MOVIMIENTO \/ SISTEMA/);
 assert.match(html,/Una identidad que conecta comercio, pedidos y movimiento/);
 assert.match(html,/src="\.\/assets\/desset-eye\.gif"/);
 assert.match(html,/srcset="\.\/assets\/desset-eye-still\.png"/);
 for(const name of ["project","ecosystem","contact","status","services","company","evidence","model","apps"])
   assert.ok(html.includes('data-detail="'+name+'"'),"missing functional tile: "+name);
 assert.match(html,/id="themeButton"/);
 assert.match(html,/class="contact-v12-computer"/);
 assert.match(html,/data-view-button="sections"/);
 assert.match(html,/data-view-button="home"/);
 assert.match(runner,/DETAILS/);
 assert.match(content,/kicker:"CÓMO FUNCIONA DESSET"/);
 assert.match(content,/kicker:"DESSET BUSINESS \/ COMERCIOS"/);
 assert.match(content,/La web sigue siendo institucional/);
 assert.match(css,/\.tile--visual \.v3-flow/);
 assert.match(css,/\.tile--apps\.v3-business-tile/);
 assert.match(css,/@media\(max-width:640px\)/);
 for(const svg of [rider,business]){
   assert.match(svg,/viewBox="0 0 960 600"/);
   assert.match(svg,/prefers-reduced-motion:reduce/);
   assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|javascript:|data:)/i);
 }
 assert.doesNotMatch(rider,/12 MIN|EN VIVO|RUTA ACTIVA|ENTREGA GARANTIZADA/i);
 for(const p of ["reports/final-bento-v3/assets/desset-eye.gif","reports/final-bento-v3/assets/desset-eye-still.png","reports/final-bento-v3/styles-compact.css","reports/final-bento-v3/404.html"])
  assert.ok(existsSync(new URL(p,root)),"missing "+p);
});
test("FINAL BENTO V3 rejects release credentials",()=>{
 const child=process.execPath;
 assert.throws(()=>execFileSync(child,[fileURLToPath(new URL("proposals/final-bento-v3/build-preview.mjs",root))],
   {cwd:fileURLToPath(root),timeout:15000,env:{...process.env,CLOUDFLARE_API_TOKEN:"unsafe-test",DESSET_RELEASE_APPROVED:"",DESSET_CF_RELEASE_MODE:""},stdio:"pipe"}),/Command failed/);
});
