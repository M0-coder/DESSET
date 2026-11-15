import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  VISUAL_FILES, gitBlobSha1, htmlBodyFnv64, parseApprovedManifest,
  inspectVisualBaseline, assertApprovedVisualBaseline, loadApprovedVisualBaseline
} from "../scripts/visual-baseline.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url));
const clone = x => JSON.parse(JSON.stringify(x));

test("manifest versionado reconoce exactamente el Bento vigente, sin saltos", () => {
  const m = loadApprovedVisualBaseline();
  assert.equal(m.baseline_id, "DESSET-BENTO-APPROVED-2026-11-15");
  assert.equal(m.source_commit, "841fb1d5ba44022237fe1534926c6c3a5ab564f5");
  assert.equal(m.production_deployment, "c29ec7a7-806a-4a92-b326-e1a42c7dc1fe");
  assert.equal(Object.keys(m.files).length, 7);
  assert.deepEqual(inspectVisualBaseline(m, read).diffs, []);
  assert.deepEqual(assertApprovedVisualBaseline(m, read).diffs, []);
});

test("cada uno de los 7 archivos protegidos rechaza un solo byte cambiado", () => {
  const m = loadApprovedVisualBaseline();
  for (const path of VISUAL_FILES) {
    const source = read(path);
    const altered = Buffer.concat([source, Buffer.from("\n")]);
    assert.notEqual(gitBlobSha1(altered), m.files[path]);
    assert.ok(inspectVisualBaseline(m, p => p === path ? altered : read(p)).diffs.includes(path), path);
  }
});

test("cambiar BODY HTML sin aprobar actualizacion hace fallar el gate", () => {
  const m = loadApprovedVisualBaseline();
  const html = read("index.html").toString("utf8");
  const altered = Buffer.from(html.replace("<body ", '<body data-proposal="1" '));
  assert.notEqual(htmlBodyFnv64(altered.toString("utf8")), m.html_body_fnv64);
  assert.throws(() => assertApprovedVisualBaseline(m, p => p === "index.html" ? altered : read(p)), /BENTO NO APROBADO/);
});

test("hash aprobado manipulado sin modificar el archivo también bloquea CI", () => {
  const m = clone(loadApprovedVisualBaseline());
  m.files["styles.css"] = "f".repeat(40);
  assert.ok(inspectVisualBaseline(m, read).diffs.includes("styles.css"));
});

test("nueva imagen aprobada se valida por hash sin editar el código del gate", () => {
  const m = clone(loadApprovedVisualBaseline());
  const newImage = Buffer.from("image candidate bytes");
  m.files["assets/campana.webp"] = gitBlobSha1(newImage);
  const versioned = parseApprovedManifest(JSON.stringify(m));
  assert.deepEqual(inspectVisualBaseline(versioned,
    p => p === "assets/campana.webp" ? newImage : read(p)).diffs, []);
  assert.ok(inspectVisualBaseline(versioned, read).diffs.some(x => x.includes("assets/campana.webp")),
    "Imagen listada, pero ausente en el repo, debe bloquear el gate");
  assert.ok(inspectVisualBaseline(versioned,
    p => p === "assets/campana.webp" ? Buffer.from("tampered") : read(p))
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
  const changed = Buffer.from(read("index.html").toString("utf8")
    .replace('<meta name="robots" content="noindex,nofollow">', ""));
  m.files["index.html"] = gitBlobSha1(changed);
  m.html_body_fnv64 = htmlBodyFnv64(changed.toString("utf8"));
  assert.ok(inspectVisualBaseline(m, p => p === "index.html" ? changed : read(p)).diffs.includes("index.html#noindex"));
});

test("manifiesto inusual o incompleto no permite aprobar nuevos activos", () => {
  const m = loadApprovedVisualBaseline();
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
  const m = loadApprovedVisualBaseline();
  const before = readFileSync(new URL("../config/visual-baseline-approved.json", import.meta.url), "utf8");
  const report = inspectVisualBaseline(m, p => p === "styles.css" ? Buffer.from("new design candidate") : read(p));
  assert.deepEqual(report.diffs, ["styles.css"]);
  assert.notEqual(report.actualFiles["styles.css"], m.files["styles.css"]);
  const after = readFileSync(new URL("../config/visual-baseline-approved.json", import.meta.url), "utf8");
  assert.equal(after, before);
});

test("el inspector de candidatos no autoriza despliegue ni modifica baseline", () => {
  const inspector = readFileSync(new URL("../scripts/visual-proposal-report.mjs", import.meta.url), "utf8");
  const wrapper = readFileSync(new URL("../scripts/approved-baseline-gate.mjs", import.meta.url), "utf8");
  assert.match(inspector, /publication_authorized: false/);
  assert.doesNotMatch(inspector, /writeFile|renameSync|process\.env\.DESSET_APPROVE/);
  assert.match(wrapper, /assertApprovedVisualBaseline\(manifest\)/);
  assert.doesNotMatch(wrapper, /process\.env|GITHUB_EVENT_NAME|bypass/i);
});
