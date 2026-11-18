import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const checksum=p=>createHash("sha256").update(readFileSync(new URL(p,root))).digest("hex");
const gitBlobSha1=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");

test("HERITAGE-V2: old artwork builds a local-only DESSET preview without altering production",()=>{
  const protectedPaths=[
    "index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs",
    "assets/deliver-assets-mark.png","assets/desset-eye.gif","assets/desset-eye-still.png",
    "assets/roles-geometry-v2.svg","config/visual-baseline-approved.json",
    "scripts/cloudflare-release-candidate.mjs",".github/workflows/cloudflare-pages-production.yml"
  ];
  const before=protectedPaths.map(checksum);
  execFileSync(process.execPath,[fileURLToPath(new URL("proposals/heritage-reuse-v2/build-preview.mjs",root))],
    {cwd:fileURLToPath(root),encoding:"utf8",timeout:15000});
  assert.deepEqual(protectedPaths.map(checksum),before,"approved source must remain unchanged");
  const meta=JSON.parse(read("reports/heritage-reuse-v2/manifest.json"));
  assert.equal(meta.publication_authorized,false);
  assert.equal(meta.merge_authorized,false);
  assert.equal(meta.approved_visual_baseline_changed,false);

  const html=read("reports/heritage-reuse-v2/index.html");
  const css=read("reports/heritage-reuse-v2/styles.css");
  const content=read("reports/heritage-reuse-v2/src/content.mjs");
  const rider=read("reports/heritage-reuse-v2/assets/rider-heritage-adapted.svg");
  const businessBytes=readFileSync(new URL("reports/heritage-reuse-v2/assets/business-ops-original.svg",root));

  assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(html,/rider-heritage-adapted\.svg/);
  assert.match(html,/business-ops-original\.svg/);
  assert.match(html,/PIDE · MIRA · RECIBE/);
  assert.match(html,/PARA TU<br>NEGOCIO\./);
  assert.doesNotMatch(html,/MOVIMIENTO \/ SISTEMA|CUATRO ROLES\.<br>UNA ARQUITECTURA\./);
  for(const stable of ['CANALES<br>OFICIALES.','data-detail="contact"','class="intro-eye"',
    'src="./assets/desset-eye.gif"','data-detail="services"','data-detail="company"',
    'data-detail="status"','data-detail="model"','data-detail="evidence"'])
    assert.ok(html.includes(stable),"existing site feature lost: "+stable);
  assert.match(content,/kicker:"CÓMO FUNCIONA \/ VISTA CONCEPTUAL"/);
  assert.match(content,/kicker:"NEGOCIOS \/ DESSET BUSINESS"/);
  assert.match(content,/El sitio público no habilita compras, pagos, seguimiento real/);
  assert.match(css,/\.tile--visual img\.heritage-rider/);
  assert.match(css,/\.tile--apps\.heritage-business-tile/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(rider,/RUTA PREVISTA/);
  assert.doesNotMatch(rider,/RUTA ACTIVA/);
  assert.match(rider,/>DESSET<\/text>/);
  assert.doesNotMatch(rider,/font-size="30" font-weight="900" text-anchor="middle" font-size=/);
  assert.match(rider,/prefers-reduced-motion: reduce/);
  assert.match(rider,/heritage-route-flow/);
  assert.doesNotMatch(rider,/<script\b|<foreignObject\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|javascript:|data:)/i);
  assert.equal(gitBlobSha1(businessBytes),"ce8c39fbc13c98fcab413355c31a87a02d7284d5","historical Business artwork is reused byte-for-byte");
  assert.ok(existsSync(new URL("reports/heritage-reuse-v2/assets/desset-eye-still.png",root)));
});
