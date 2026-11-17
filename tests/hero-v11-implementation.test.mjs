import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  gitBlobSha1, htmlBodyFnv64, inspectVisualBaseline,
  assertApprovedVisualBaseline, loadApprovedVisualBaseline
} from "../scripts/visual-baseline.mjs";

const read = p => readFileSync(new URL("../" + p, import.meta.url));
const text = p => read(p).toString("utf8");
const oldHeading =
  '<h1 id="main-heading">COMERCIO<br>Y <span class="brand-word">LOGÍSTICA</span>.<br><span>UNA MISMA VISIÓN.</span></h1>';
const newHeading =
  '<h1 id="main-heading"><span class="intro-title-heavy">COMERCIO Y<br>LOGÍSTICA.</span> ' +
  '<span class="intro-title-vision">UNA MISMA VISIÓN.</span></h1>';
const marker = "/* HERO-V11 — IMPLEMENTACIÓN CANDIDATA";

test("HERO-V11: el HTML real solo reemplaza el h1 del primer Bento", () => {
  const manifest = loadApprovedVisualBaseline();
  const actual = text("index.html");
  assert.equal(actual.split(newHeading).length, 2, "Exigir un solo título V11 exacto");
  const reconstructedV10 = actual.replace(newHeading, oldHeading);
  assert.equal(gitBlobSha1(Buffer.from(reconstructedV10)), manifest.files["index.html"],
    "NO-GO: otra modificación accidental de la web pública");
  assert.match(actual, /name="robots" content="noindex,nofollow"/);
  assert.match(actual, /src="\.\/assets\/desset-eye\.gif"/);
  assert.match(actual, /srcset="\.\/assets\/desset-eye-still\.png"/);
  assert.doesNotMatch(actual, /DESSET®|DESSET&reg;|DESSET<sup/i);
});

test("HERO-V11: los estilos V10 anteriores al bloque editorial son byte a byte idénticos", () => {
  const manifest = loadApprovedVisualBaseline();
  const css = text("styles.css");
  assert.equal(css.split(marker).length, 2, "Un bloque candidato, sin duplicados");
  const before = css.slice(0, css.indexOf(marker));
  assert.equal(gitBlobSha1(Buffer.from(before)), manifest.files["styles.css"],
    "NO-GO: no modificar ni reorganizar la hoja aprobada V10");
  const extra = css.slice(css.indexOf(marker));
  for (const fragment of [
    ".tile--intro .intro-main h1 .intro-title-heavy",
    ".tile--intro .intro-main h1 .intro-title-vision",
    'font-family:"Times New Roman",Times,Georgia,serif',
    "font-style:italic",
    ".tile--intro .intro-eye",
    "@media(max-width:640px)",
    "@media(max-height:400px)",
    "@media(min-width:1001px) and (max-width:1150px)",
  ]) assert.ok(extra.includes(fragment), "No se implementó " + fragment);
  assert.doesNotMatch(extra, /@import|@font-face|url\s*\(|!important|position:\s*fixed/i);
  assert.doesNotMatch(extra, /(^|\n)\s*(?:body|html|:root|\.board|\.tile--visual|\.tile--contact)\s*\{/m);
  assert.doesNotMatch(extra, /animation-play-state|display:\s*none.*intro-eye/i);
});

test("HERO-V11: ningún GIF, contenido operativo, asset o tarjeta adyacente cambió", () => {
  const manifest = loadApprovedVisualBaseline();
  for (const path of Object.keys(manifest.files).filter(p => p !== "index.html" && p !== "styles.css")) {
    assert.equal(gitBlobSha1(read(path)), manifest.files[path],
      "NO-GO: activo fuera de alcance alterado: " + path);
  }
  const html = text("index.html");
  for (const content of [
    'class="tile tile--visual',
    'class="tile tile--contact',
    'class="tile tile--status',
    'class="tile tile--services',
    'class="tile tile--company',
    'COBRO<br>POR ENVÍO.',
    'CANALES<br>OFICIALES.',
    'NO SOLO ENTREGAMOS.',
  ]) assert.ok(html.includes(content), "Contenido no contemplado: " + content);
});

test("HERO-V11: el manifiesto V10 permanece aprobado y bloquea la implementación pendiente", () => {
  const manifest = loadApprovedVisualBaseline();
  assert.equal(manifest.baseline_id, "DESSET-V10-HERO-2026-11-17");
  const differences = inspectVisualBaseline(manifest).diffs;
  assert.deepEqual(differences, ["index.html", "styles.css", "index.html#body"]);
  assert.throws(() => assertApprovedVisualBaseline(manifest), /BENTO NO APROBADO/,
    "NO-GO: nunca aprobar automáticamente un cambio visual desde PR DRAFT");
  assert.notEqual(htmlBodyFnv64(text("index.html")), manifest.html_body_fnv64);
});

test("HERO-V11: GitHub mantiene el control humano de publicación, no bypass", () => {
  const approval = text("scripts/visual-approval.mjs");
  const gate = text("scripts/approved-baseline-gate.mjs");
  const productionWorkflow = text(".github/workflows/cloudflare-pages-production.yml");
  assert.match(approval, /comment\.user\?\.login\?\.toLowerCase\(\), OWNER/);
  assert.match(approval, /comment\.author_association, "OWNER"/);
  assert.match(approval, /comment\.body\?\.trim\(\), visualApprovalSentence\(manifest\)/);
  assert.match(gate, /assertApprovedVisualBaseline\(manifest\)/);
  assert.match(productionWorkflow, /inputs\.confirm == 'PUBLICAR_DESSET'/);
  assert.match(productionWorkflow, /github\.ref == 'refs\/heads\/main'/);
});
