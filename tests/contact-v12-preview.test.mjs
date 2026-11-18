import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  assertApprovedVisualBaseline, gitBlobSha1, loadApprovedVisualBaseline
} from "../scripts/visual-baseline.mjs";
import { OLD_CONTACT, NEW_CONTACT, candidateHtml, safeOutput, buildPreview } from
  "../proposals/contact-v12/build-preview.mjs";

const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(join(root,p));
test("CONTACT-V12: approved V11 main stays signed, exact hashes and 10 Bento tiles",()=>{
  const manifest=loadApprovedVisualBaseline();
  assert.equal(manifest.baseline_id,"DESSET-V11-HERO-2026-11-17");
  assert.deepEqual(assertApprovedVisualBaseline(manifest).diffs,[]);
  for(const [path,sha] of Object.entries(manifest.files))
    assert.equal(gitBlobSha1(read(path)),sha,"Protected V11 file changed: "+path);
  const html=read("index.html").toString("utf8");
  assert.equal(html.split('class="tile tile--').length-1,10);
  assert.ok(html.includes(OLD_CONTACT),"Contact tile remains officially V11");
});

test("CONTACT-V12: candidate changes only contact button and local stylesheet link",()=>{
  const approved=read("index.html").toString("utf8");
  const candidate=candidateHtml(approved);
  const stylesheet='  <link rel="stylesheet" href="./contact-preview.css">\n';
  assert.ok(candidate.includes(NEW_CONTACT));
  assert.equal(candidate.replace(NEW_CONTACT,OLD_CONTACT).replace(stylesheet,""),approved);
  assert.equal(candidate.split('class="tile tile--').length-1,10);
  assert.equal((candidate.match(/data-detail="contact"/g)||[]).length,1);
  assert.ok(!candidate.includes("CONTACTO / 01"));
  assert.ok(candidate.includes("CANALES<br>OFICIALES."));
  assert.match(candidate,/data-detail="contact"/);
  assert.match(candidate,/contact-v12-computer[^>]+alt="" aria-hidden="true"/);
  assert.match(candidate,/contact-v12-cross" aria-hidden="true"/);
  assert.match(candidate,/name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(candidate,/<script[^>]+src="https?:/i);
});

test("CONTACT-V12: vector illustration self-contained, retro green spectrum and keyboard",()=>{
  const svg=read("proposals/contact-v12/retro-terminal.svg").toString("utf8");
  assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg,/viewBox="0 0 180 130"/);
  assert.match(svg,/Computadora retro/);
  assert.match(svg,/#44e31b/);
  assert.match(svg,/typewriter keyboard/);
  assert.doesNotMatch(svg,/<script|<foreignObject|onload\s*=|href=|xlink:href|<image\b|<use\b/i);
  assert.ok(svg.length<50000,"Keep artifact compact");
});

test("CONTACT-V12: scoped CSS never changes grid, global elements or other tiles",()=>{
  const css=read("proposals/contact-v12/contact-preview.css").toString("utf8");
  assert.match(css,/\.tile--contact::before\{/);
  assert.match(css,/inset:clamp\(5px,1\.5cqw,9px\)/);
  assert.match(css,/pointer-events:none/);
  assert.match(css,/\.tile--contact \.contact-v12-title/);
  assert.match(css,/\.tile--contact \.contact-v12-computer/);
  assert.match(css,/\.tile--contact \.contact-v12-cross/);
  assert.match(css,/body\[data-theme="dark"\] \.tile--contact/);
  assert.match(css,/body\[data-theme="dark"\] \.tile--contact \.contact-v12-computer\{\s*filter:none/);
  assert.doesNotMatch(css,/filter:\s*invert\(/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/@media\(max-height:400px\)/);
  assert.doesNotMatch(css,/@import|@font-face|url\s*\(|!important|position:\s*fixed/);
  assert.doesNotMatch(css,/(^|\n)\s*(?:body|html|:root|\.board|\.tile--intro|\.tile--services|\.tile--visual)\s*\{/m);
  assert.doesNotMatch(css,/display:\s*none.*contact-v12-computer/);
});

test("CONTACT-V12: preview builder refuses output to main, dist, workflow or system root",()=>{
  for(const path of [root,join(root,"dist"),join(root,"index.html"),join(root,"styles.css"),"/etc"])
    assert.throws(()=>safeOutput(path),/NO-GO/);
  assert.equal(safeOutput(join(root,"reports","contact-v12-preview")),
    join(root,"reports","contact-v12-preview"));
});

test("CONTACT-V12: offline baseline and candidate preserve protected files byte for byte",async()=>{
  const tmp=await mkdtemp(join(tmpdir(),"desset-contact-v12-test-"));
  try{
    const out=await buildPreview(join(tmp,"evidence"));
    const manifest=loadApprovedVisualBaseline();
    const old=await readFile(join(out.baseline,"index.html"),"utf8");
    const next=await readFile(join(out.candidate,"index.html"),"utf8");
    assert.equal(next.replace(NEW_CONTACT,OLD_CONTACT)
      .replace('  <link rel="stylesheet" href="./contact-preview.css">\n',""),old);
    for(const path of Object.keys(manifest.files).filter(p=>p!=="index.html")){
      assert.deepEqual(await readFile(join(out.baseline,path)),read(path));
      assert.deepEqual(await readFile(join(out.candidate,path)),read(path));
    }
    assert.deepEqual(await readFile(join(out.candidate,"assets/contact-terminal-v12.svg")),
      read("proposals/contact-v12/retro-terminal.svg"));
    assert.deepEqual(await readFile(join(out.candidate,"contact-preview.css")),
      read("proposals/contact-v12/contact-preview.css"));
    assert.deepEqual(readFileSync(join(root,"config/visual-baseline-approved.json")),
      read("config/visual-baseline-approved.json"));
  }finally{
    await rm(tmp,{recursive:true,force:true});
  }
});
