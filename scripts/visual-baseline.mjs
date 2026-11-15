// DESSET: approved visual identity is data, not frozen hashes embedded in source code.
// A proposed design may be previewed separately; CI still requires an approved baseline.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";

export const VISUAL_FILES = Object.freeze([
  "index.html",
  "styles.css",
  "styles-compact.css",
  "src/app.mjs",
  "src/content.mjs",
  "assets/deliver-assets-mark.png",
  "assets/roles-geometry-v2.svg",
]);

const root = new URL("../", import.meta.url);
const defaultRead = path => readFileSync(new URL("../" + path, import.meta.url));

export function gitBlobSha1(bytes) {
  const content = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return createHash("sha1")
    .update("blob " + content.length + "\0")
    .update(content)
    .digest("hex");
}

export function htmlBodyFnv64(html) {
  const start = html.indexOf("<body");
  const end = html.indexOf("</body>");
  assert.ok(start >= 0 && end > start, "Falta BODY HTML válido para verificar identidad");
  const body = html.slice(start, end + "</body>".length);
  let n = 0xcbf29ce484222325n;
  for (let i = 0; i < body.length; i++) {
    n = BigInt.asUintN(64, (n ^ BigInt(body.charCodeAt(i))) * 0x100000001b3n);
  }
  return n.toString(16).padStart(16, "0");
}

export function parseApprovedManifest(text) {
  const manifest = JSON.parse(text);
  assert.equal(manifest.schema_version, 1, "Versión de contrato visual no admitida");
  assert.equal(manifest.status, "approved", "Solo una referencia expresamente aprobada permite pasar CI");
  assert.match(manifest.baseline_id, /^DESSET-[A-Z0-9-]{5,100}$/);
  assert.match(manifest.source_commit, /^[a-f0-9]{40}$/);
  assert.match(manifest.production_deployment, /^[0-9a-f-]{36}$/);
  assert.match(manifest.approval_evidence, /^https:\/\/github\.com\/M0-coder\/DESSET\/(?:actions\/runs|issues|pull)\/[0-9]+(?:#.+)?$/);
  assert.equal(manifest.hash_algorithm, "git-blob-sha1");
  assert.match(manifest.html_body_fnv64, /^[a-f0-9]{16}$/);
  assert.ok(manifest.files && typeof manifest.files === "object" && !Array.isArray(manifest.files));
  const entries = Object.keys(manifest.files);
  assert.ok(entries.length >= VISUAL_FILES.length && entries.length <= 64,
    "La referencia debe incluir los siete activos canónicos y no más de 64 archivos");
  for (const path of VISUAL_FILES) assert.ok(Object.hasOwn(manifest.files, path), "Falta activo canónico: " + path);
  // Additional approved images can be versioned without changing this gate.
  // New paths are restricted to relative raster assets; no scripts, traversal or external references.
  for (const [path, sha] of Object.entries(manifest.files)) {
    if (!VISUAL_FILES.includes(path)) {
      assert.match(path, /^assets\/(?:[a-z0-9_-]+\/)*[a-z0-9][a-z0-9._-]*\.(?:png|jpg|jpeg|webp|avif|gif)$/i,
        "No está permitido versionar esta ruta adicional: " + path);
    }
    assert.match(sha, /^[a-f0-9]{40}$/, "Hash de Git inválido: " + path);
  }
  return manifest;
}

export function inspectVisualBaseline(manifest, read = defaultRead) {
  const diffs = [];
  const actualFiles = {};
  for (const path of Object.keys(manifest.files)) {
    try {
      const actual = gitBlobSha1(read(path));
      actualFiles[path] = actual;
      if (actual !== manifest.files[path]) diffs.push(path);
    } catch (error) {
      diffs.push(path + " (no se pudo leer: " + error.message + ")");
    }
  }
  let bodySignature;
  try {
    const html = read("index.html").toString("utf8");
    bodySignature = htmlBodyFnv64(html);
    if (bodySignature !== manifest.html_body_fnv64) diffs.push("index.html#body");
    if (!/<meta name="robots" content="noindex,nofollow">/.test(html)) {
      diffs.push("index.html#noindex");
    }
  } catch (error) {
    diffs.push("index.html#structure (" + error.message + ")");
  }
  return { diffs, actualFiles, bodySignature };
}

export function assertApprovedVisualBaseline(manifest, read = defaultRead) {
  const result = inspectVisualBaseline(manifest, read);
  assert.deepEqual(result.diffs, [],
    "BENTO NO APROBADO: cambios detectados. Crear propuesta visual, obtener aprobación expresa y actualizar el manifiesto en PR revisado.");
  return result;
}

export function loadApprovedVisualBaseline() {
  // Reject non-regular files: a manifest must not silently resolve to an external symlink.
  const manifestUrl = new URL("../config/visual-baseline-approved.json", import.meta.url);
  assert.ok(lstatSync(manifestUrl).isFile(), "El manifiesto visual debe ser un archivo regular");
  return parseApprovedManifest(readFileSync(manifestUrl, "utf8"));
}
