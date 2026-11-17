/**
 * DESSET HERO-V11 / SOLO VISTA PREVIA.
 * Construye dos COPIAS locales: base aprobada y candidato editorial.
 * Nunca modifica archivos oficiales ni crea un despliegue.
 * Uso: node proposals/hero-v11/build-preview.mjs --out reports/hero-v11-preview
 */
import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../../", import.meta.url));
const proposalRoot = fileURLToPath(new URL("./", import.meta.url));
export const OLD_HEADING =
  '<h1 id="main-heading">COMERCIO<br>Y <span class="brand-word">LOGÍSTICA</span>.<br><span>UNA MISMA VISIÓN.</span></h1>';
export const NEW_HEADING =
  '<h1 id="main-heading"><span class="intro-title-heavy">COMERCIO Y<br>LOGÍSTICA.</span> ' +
  '<span class="intro-title-vision">UNA MISMA VISIÓN.</span></h1>';

const copiedFiles = Object.freeze([
  "styles.css",
  "styles-compact.css",
  "src/app.mjs",
  "src/content.mjs",
  "assets/deliver-assets-mark.png",
  "assets/roles-geometry-v2.svg",
  "assets/desset-eye.gif",
  "assets/desset-eye-still.png",
]);

function inside(path, root) {
  const rel = relative(root, path);
  return rel !== "" && rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel);
}

export function assertSafeOutput(out) {
  assert.equal(typeof out, "string", "La salida debe ser un directorio");
  const target = resolve(out);
  assert.ok(target !== sourceRoot, "NO-GO: no escribir en la raíz del repositorio");
  // Dentro del repo, únicamente la carpeta ignorada reports/ es utilizable.
  if (inside(target, sourceRoot)) {
    assert.ok(inside(target, resolve(sourceRoot, "reports")),
      "NO-GO: vista previa no puede modificar fuente, dist ni configuración");
  } else {
    // Evitar rutas como /etc, /home o directorios compartidos fuera de tmp.
    assert.ok(inside(target, resolve(tmpdir())) || target === resolve(tmpdir()),
      "NO-GO: salida externa solo bajo el directorio temporal");
    assert.notEqual(target, resolve(tmpdir()), "NO-GO: no sobrescribir /tmp");
  }
  return target;
}

export function makeCandidateHtml(source) {
  assert.ok(source.includes('name="robots" content="noindex,nofollow"'),
    "NO-GO: fuente ya no conserva noindex");
  assert.ok(source.includes('class="tile tile--intro"'),
    "NO-GO: el Bento aprobado ha cambiado");
  assert.equal(source.split(OLD_HEADING).length, 2,
    "NO-GO: el h1 aprobado cambió; actualizar propuesta, no bypass");
  const link = '  <link rel="stylesheet" href="./hero-proposal.css">\n';
  assert.ok(!source.includes("hero-proposal.css"), "NO-GO: fuente contaminada por propuesta");
  assert.equal(source.split("</head>").length, 2, "NO-GO: </head> no es único");
  return source.replace(OLD_HEADING, NEW_HEADING)
    .replace("</head>", link + "</head>");
}

async function copySite(directory) {
  await mkdir(directory, { recursive: true });
  for (const file of copiedFiles) {
    const to = resolve(directory, file);
    await mkdir(dirname(to), { recursive: true });
    await copyFile(resolve(sourceRoot, file), to);
  }
}

/**
 * @param {string} outputDir Debe ser /tmp/... o reports/... dentro del repo.
 * @returns {Promise<{baseline:string,candidate:string}>}
 */
export async function buildPreview(outputDir) {
  const root = assertSafeOutput(outputDir);
  const baseline = join(root, "baseline");
  const candidate = join(root, "candidate");
  const approved = await readFile(join(sourceRoot, "index.html"), "utf8");
  const amended = makeCandidateHtml(approved);
  for (const dir of [baseline, candidate]) await copySite(dir);
  await writeFile(join(baseline, "index.html"), approved);
  await writeFile(join(candidate, "index.html"), amended);
  await copyFile(join(proposalRoot, "hero-proposal.css"),
    join(candidate, "hero-proposal.css"));
  return { baseline, candidate };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 2 && args[0] === "--out" && args[1],
    "Uso: node proposals/hero-v11/build-preview.mjs --out reports/hero-v11-preview");
  const result = await buildPreview(args[1]);
  console.log(JSON.stringify({
    status: "PREVIEW_ONLY",publication_authorized: false,
    source_untouched: true, ...result
  }));
}
