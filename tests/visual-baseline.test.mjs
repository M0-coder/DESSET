import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  gitBlobSha1, htmlBodyFnv64, parseApprovedManifest,
  inspectVisualBaseline, assertApprovedVisualBaseline, loadApprovedVisualBaseline
} from "../scripts/visual-baseline.mjs";
import {historicalV11Read,loadHistoricalV11Manifest} from "./helpers/contact-v12-history.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url));
const clone = x => JSON.parse(JSON.stringify(x));
const historicalRead = historicalV11Read(read);

test("manifest V11 con aprobación verificada preserva las diez tarjetas y canales oficiales", () => {
  const m = loadHistoricalV11Manifest();
  assert.equal(m.baseline_id, "DESSET-V11-HERO-2026-11-17");
  assert.equal(m.source_commit, "5f1d5b711889868a1e14ab75a74448f91b34a59b");
  assert.equal(m.production_deployment, "b118e080-24c8-412a-8ae7-ab52af7506f3");
  assert.equal(m.approval_evidence,"https://github.com/M0-coder/DESSET/issues/55#issuecomment-6964660907");
  assert.equal(Object.keys(m.files).length, 9);
  assert.equal(m.files["index.html"], "f964d7cddde9abaf321f3db6d3b942228131ce5b");
  assert.equal(m.files["styles.css"], "b6e054daa3d9af66abb19324683f0f9b3c0500bf");
  assert.equal(m.html_body_fnv64, "30c5cb77e9eb795a");
  assert.deepEqual(inspectVisualBaseline(m, historicalRead).diffs, []);
  // The immutable V11 snapshot must continue to reject the later V12 bytes.
  assert.deepEqual(inspectVisualBaseline(m, read).diffs.sort(),["index.html","styles.css","index.html#body"].sort());
  assert.deepEqual(assertApprovedVisualBaseline(m, historicalRead).diffs, []);
});

test("cada uno de los 9 archivos protegidos rechaza un solo byte cambiado", () => {
  const m = loadHistoricalV11Manifest();
  for (const path of Object.keys(m.files)) {
    const source = historicalRead(path);
    const altered = Buffer.concat([source, Buffer.from("\n")]);
    assert.notEqual(gitBlobSha1(altered), m.files[path]);
    assert.ok(inspectVisualBaseline(m, p => p === path ? altered : historicalRead(p)).diffs.includes(path), path);
  }
});

test("cambiar BODY HTML sin aprobar actualizacion hace fallar el gate", () => {
  const m = loadHistoricalV11Manifest();
  const html = historicalRead("index.html").toString("utf8");
  const altered = Buffer.from(html.replace("<body ", '<body data-proposal="1" '));
  assert.notEqual(htmlBodyFnv64(altered.toString("utf8")), m.html_body_fnv64);
  assert.throws(() => assertApprovedVisualBaseline(m, p => p === "index.html" ? altered : historicalRead(p)), /BENTO NO APROBADO/);
});

test("hash aprobado manipulado sin modificar el archivo también bloquea CI", () => {
  const m = clone(loadApprovedVisualBaseline());
  m.files["styles.css"] = "f".repeat(40);
  assert.ok(inspectVisualBaseline(m, historicalRead).diffs.includes("styles.css"));
});

test("nueva imagen aprobada se valida por hash sin editar el código del gate", () => {
  const m = clone(loadApprovedVisualBaseline());
  const newImage = Buffer.from("image candidate bytes");
  m.files["assets/campana.webp"] = gitBlobSha1(newImage);
  const versioned = parseApprovedManifest(JSON.stringify(m));
  assert.deepEqual(inspectVisualBaseline(versioned,
    p => p === "assets/campana.webp" ? newImage : historicalRead(p)).diffs, []);
  assert.ok(inspectVisualBaseline(versioned, historicalRead).diffs.some(x => x.includes("assets/campana.webp")),
    "Imagen listada, pero ausente en el repo, debe bloquear el gate");
  assert.ok(inspectVisualBaseline(versioned,
    p => p === "assets/campana.webp" ? Buffer.from("tampered") : historicalRead(p))
    .diffs.includes("assets/campana.webp"), "Una alteración del nuevo recurso debe ser rechazada");
});

test("rutas adicionales peligrosas o no gráficas se rechazan", () => {
  for (const path of ["../secrets.png", "assets/../secrets.png", "assets/script.js",
    "assets/unsafe.svg", "https://example.com/a.png", "images/logo.png"]) {
    const m = clone(loadApprovedVisualBaseline());
    m.files[path] = "1".repeat(40);
    assert.throws(() => parseApprovedManifest(JSON.stringify(m)), undefined, path);
  }
});

test("noindex no se puede omitir en la fuente incluso si se editara el manifest", () => {
  const m = clone(loadApprovedVisualBaseline());
  const changed = Buffer.from(historicalRead("index.html").toString("utf8")
    .replace('<meta name="robots" content="noindex,nofollow">', ""));
  m.files["index.html"] = gitBlobSha1(changed);
  m.html_body_fnv64 = htmlBodyFnv64(changed.toString("utf8"));
  assert.ok(inspectVisualBaseline(m, p => p === "index.html" ? changed : historicalRead(p)).diffs.includes("index.html#noindex"));
});

test("manifiesto inusual o incompleto no permite aprobar nuevos activos", () => {
  const m = loadHistoricalV11Manifest();
  for (const change of [
    x => { x.status = "proposal"; },
    x => { x.schema_version = 2; },
    x => { x.files["extra.js"] = "0".repeat(40); },
    x => { delete x.files["styles-compact.css"]; },
    x => { x.files["styles.css"] = "not-a-hash"; },
    x => { x.approval_evidence = "https://example.com/fake"; },
  ]) {
    const mutated = clone(m); change(mutated);
    assert.throws(() => parseApprovedManifest(JSON.stringify(mutated)));
  }
});

test("candidato visual obtiene diff informativo sin alterar el manifiesto", () => {
  const m = loadHistoricalV11Manifest();
  const before = readFileSync(new URL("../config/visual-baseline-approved.json", import.meta.url), "utf8");
  const report = inspectVisualBaseline(m, p => p === "styles.css" ? Buffer.from("new design candidate") : historicalRead(p));
  assert.deepEqual(report.diffs, ["styles.css"]);
  assert.notEqual(report.actualFiles["styles.css"], m.files["styles.css"]);
  const after = readFileSync(new URL("../config/visual-baseline-approved.json", import.meta.url), "utf8");
  assert.equal(after, before);
});


test("CONTACT-V12: active owner-approved manifest matches files and rejects mutations", () => {
  const actual=loadApprovedVisualBaseline();
  assert.equal(actual.baseline_id,"DESSET-V12-CONTACT-2026-11-17");
  assert.equal(actual.status,"approved");
  assert.equal(actual.source_commit,"9e766cb38f1ffd9f4b3460f5e6a46fa914d4edb9");
  assert.equal(actual.approval_evidence,"https://github.com/M0-coder/DESSET/issues/58#issuecomment-6968083138");
  assert.deepEqual(assertApprovedVisualBaseline(actual).diffs,[]);
  const html=read("index.html").toString("utf8");
  const forged=Buffer.from(html.replace('CANALES<br>OFICIALES.','CANALES<br>ALTERADOS.'));
  assert.notEqual(gitBlobSha1(forged),actual.files["index.html"]);
  assert.throws(()=>assertApprovedVisualBaseline(actual,p=>p==="index.html"?forged:read(p)),/BENTO NO APROBADO/);
  const cssChanged=Buffer.concat([read("styles.css"),Buffer.from("\n/* unapproved mutation */\n")]);
  assert.throws(()=>assertApprovedVisualBaseline(actual,p=>p==="styles.css"?cssChanged:read(p)),/BENTO NO APROBADO/);
});

test("el inspector de candidatos no autoriza despliegue ni modifica baseline", () => {
  const inspector = readFileSync(new URL("../scripts/visual-proposal-report.mjs", import.meta.url), "utf8");
  const wrapper = readFileSync(new URL("../scripts/approved-baseline-gate.mjs", import.meta.url), "utf8");
  assert.match(inspector, /publication_authorized: false/);
  assert.doesNotMatch(inspector, /writeFile|renameSync|process\.env\.DESSET_APPROVE/);
  assert.match(wrapper, /assertApprovedVisualBaseline\(manifest\)/);
  assert.doesNotMatch(wrapper, /process\.env|GITHUB_EVENT_NAME|bypass/i);
});
