import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  OLD_HEADING, NEW_HEADING, assertSafeOutput, buildPreview, makeCandidateHtml
} from "../proposals/hero-v11/build-preview.mjs";
import {
  assertApprovedVisualBaseline, loadApprovedVisualBaseline
} from "../scripts/visual-baseline.mjs";

const sourceRoot = resolve(import.meta.dirname, "..");
const cssPath = join(sourceRoot, "proposals/hero-v11/hero-proposal.css");

test("HERO-V11: propuesta no altera el manifiesto ni los 9 archivos oficiales", () => {
  const baseline = loadApprovedVisualBaseline();
  assert.equal(baseline.status, "approved");
  assertApprovedVisualBaseline(baseline);
  assert.equal(Object.keys(baseline.files).length, 9);
  assert.doesNotMatch(readFileSync(cssPath, "utf8"), /@import|@font-face|url\s*\(|!important/i);
});

test("HERO-V11: solo cambia el h1 dentro de una COPIA y añade CSS no publicado", () => {
  const html = readFileSync(join(sourceRoot, "index.html"), "utf8");
  const next = makeCandidateHtml(html);
  assert.equal(html.split(OLD_HEADING).length, 2, "El h1 aprobado debe seguir siendo reconocible");
  assert.ok(next.includes(NEW_HEADING), "Cabecera editorial nueva");
  const withoutStyle = next.replace('  <link rel="stylesheet" href="./hero-proposal.css">\n', "");
  assert.equal(withoutStyle.replace(NEW_HEADING, OLD_HEADING), html,
    "No modificar otras tarjetas, SEO, URLs, cuadros de diálogo ni JS");
  assert.match(next, /COMERCIO Y<br>LOGÍSTICA/);
  assert.match(next, /intro-title-vision/);
  assert.doesNotMatch(next, /DESSET®|DESSET&reg;|DESSET<sup/);
  assert.match(next, /noindex,nofollow/);
});

test("HERO-V11: CSS limitado a la primera tarjeta y tipografía sin dependencias externas", () => {
  const css = readFileSync(cssPath, "utf8");
  for (const x of [
    ".tile--intro .intro-main h1 .intro-title-heavy",
    ".tile--intro .intro-main h1 .intro-title-vision",
    ".tile--intro .intro-wordmark",
    ".tile--intro .intro-eye",
    ".tile--intro .intro-skyline",
    "@media(max-width:640px)",
    "@media(max-height:400px)",
    "font-family:Georgia",
    "font-family:Arial",
    "object-fit:contain",
  ]) assert.ok(css.includes(x), "Elemento de referencia ausente: " + x);
  for (const unsafe of [
    /(^|\n)\s*(?:body|html|:root|\.board|\.tile--visual|\.tile--contact|\.tile--status)\s*[{,]/,
    /@import|@font-face|url\s*\(|!important|position:fixed/i,
    /display:none.*intro-eye|animation-play-state:\s*paused/i,
  ]) assert.doesNotMatch(css, unsafe, "CSS debe preservar Bento y GIF");
});

test("HERO-V11: salida restringida a reports/ o tmp; nunca dist ni main", () => {
  assert.throws(() => assertSafeOutput(sourceRoot), /NO-GO/);
  assert.throws(() => assertSafeOutput(join(sourceRoot, "dist")), /NO-GO/);
  assert.throws(() => assertSafeOutput(join(sourceRoot, "index.html")), /NO-GO/);
  assert.throws(() => assertSafeOutput(join(sourceRoot, "styles.css")), /NO-GO/);
  assert.equal(assertSafeOutput(join(sourceRoot, "reports", "hero-v11-preview")),
    join(sourceRoot, "reports", "hero-v11-preview"));
});

test("HERO-V11: genera 2 sitios offline, conserva cada asset y no modifica fuentes", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "desset-hero-v11-test-"));
  const manifestBefore = readFileSync(join(sourceRoot, "config/visual-baseline-approved.json"));
  const files = Object.keys(loadApprovedVisualBaseline().files);
  const protectedBefore = files.map(p => readFileSync(join(sourceRoot, p)));
  try {
    const out = await buildPreview(join(tmp, "evidence"));
    const oldHtml = await readFile(join(out.baseline, "index.html"), "utf8");
    const newHtml = await readFile(join(out.candidate, "index.html"), "utf8");
    assert.notEqual(oldHtml, newHtml);
    assert.equal(newHtml.replace('  <link rel="stylesheet" href="./hero-proposal.css">\n', "")
      .replace(NEW_HEADING, OLD_HEADING), oldHtml);
    for (const path of files.filter(x => x !== "index.html")) {
      assert.deepEqual(await readFile(join(out.candidate, path)),
        await readFile(join(sourceRoot, path)), path);
      assert.deepEqual(await readFile(join(out.baseline, path)),
        await readFile(join(sourceRoot, path)), path);
    }
    assert.equal(await readFile(join(out.candidate, "hero-proposal.css"), "utf8"),
      await readFile(cssPath, "utf8"));
    assert.deepEqual(readFileSync(join(sourceRoot, "config/visual-baseline-approved.json")),
      manifestBefore);
    files.forEach((path, i) => assert.deepEqual(readFileSync(join(sourceRoot, path)), protectedBefore[i]));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});
