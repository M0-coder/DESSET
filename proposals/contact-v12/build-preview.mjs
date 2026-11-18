/**
 * DESSET CONTACT-V12: preview-only builder, never modifies approved V11 files.
 * Usage: node proposals/contact-v12/build-preview.mjs --out reports/contact-v12-preview
 */
import assert from "node:assert/strict";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertApprovedVisualBaseline, loadApprovedVisualBaseline
} from "../../scripts/visual-baseline.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const proposal = fileURLToPath(new URL("./", import.meta.url));
const APPROVED_SHA = "beed9943f3dbaf834a3201233f6c9006abe0407f";
export const OLD_CONTACT = [
  '      <button class="tile tile--contact tile--button" type="button" data-detail="contact">',
  '        <span class="tile-label">CONTACTO / 01</span>',
  '        <span class="tile-title">CANALES<br>OFICIALES.</span>',
  '        <span class="tile-arrow" aria-hidden="true">↗</span>',
  '      </button>',
].join("\n");
export const NEW_CONTACT = [
  '      <button class="tile tile--contact tile--button" type="button" data-detail="contact">',
  '        <span class="tile-title contact-v12-title">CANALES<br>OFICIALES.</span>',
  '        <img class="contact-v12-computer" src="./assets/contact-terminal-v12.svg" alt="" aria-hidden="true" width="180" height="130" decoding="async">',
  '        <span class="contact-v12-cross" aria-hidden="true"></span>',
  '        <span class="tile-arrow" aria-hidden="true">↗</span>',
  '      </button>',
].join("\n");
const styleLink = '  <link rel="stylesheet" href="./contact-preview.css">\n';
function within(path, directory) {
  const rel = relative(directory, path);
  return Boolean(rel) && rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel);
}
export function safeOutput(value) {
  assert.equal(typeof value, "string");
  const out = resolve(value);
  const localReports = resolve(root, "reports");
  const systemTmp = resolve(tmpdir());
  assert.ok(within(out, localReports) || within(out, systemTmp),
    "NO-GO: candidate copies only under reports/ or a unique temp directory");
  return out;
}
export function candidateHtml(source) {
  assert.ok(source.includes('name="robots" content="noindex,nofollow"'),
    "NO-GO: candidate must inherit V11 noindex");
  assert.equal(source.split(OLD_CONTACT).length, 2,
    "NO-GO: contact tile changed; do not patch unknown markup");
  assert.equal(source.split("</head>").length, 2,
    "NO-GO: head has changed");
  assert.ok(!source.includes("contact-preview.css") &&
    !source.includes("contact-terminal-v12.svg"),
    "NO-GO: proposal must not already be deployed");
  return source.replace(OLD_CONTACT, NEW_CONTACT)
    .replace("</head>", styleLink + "</head>");
}
export async function buildPreview(outPath) {
  const target = safeOutput(outPath);
  const manifest = loadApprovedVisualBaseline();
  assert.equal(manifest.baseline_id, "DESSET-V11-HERO-2026-11-17",
    "NO-GO: base design changed");
  assert.equal(manifest.source_commit, "5f1d5b711889868a1e14ab75a74448f91b34a59b");
  assertApprovedVisualBaseline(manifest);
  const baseline = join(target, "baseline"), candidate = join(target, "candidate");
  const old = await readFile(join(root, "index.html"), "utf8");
  const next = candidateHtml(old);
  for (const folder of [baseline, candidate]) {
    for (const path of Object.keys(manifest.files)) {
      const targetFile = resolve(folder, path);
      await mkdir(dirname(targetFile), { recursive:true });
      await copyFile(resolve(root,path), targetFile);
    }
  }
  await writeFile(join(baseline, "index.html"), old, "utf8");
  await writeFile(join(candidate, "index.html"), next, "utf8");
  await copyFile(join(proposal, "contact-preview.css"), join(candidate, "contact-preview.css"));
  await copyFile(join(proposal, "retro-terminal.svg"), join(candidate, "assets/contact-terminal-v12.svg"));
  return { baseline, candidate, source_sha:APPROVED_SHA, mode:"PREVIEW_ONLY" };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.length===2 && args[0]==="--out", "Usage: --out reports/contact-v12-preview");
  console.log(JSON.stringify(await buildPreview(args[1]), null, 2));
}
