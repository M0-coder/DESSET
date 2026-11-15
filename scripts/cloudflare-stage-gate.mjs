import assert from "node:assert/strict";
import {readFileSync,readdirSync,lstatSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,join,relative,sep} from "node:path";
import {createHash} from "node:crypto";
const root=fileURLToPath(new URL("../",import.meta.url));
const dist=resolve(root,"dist-cloudflare-stage");
const approved=["404.html","_headers","assets/deliver-assets-mark.png","assets/roles-geometry-v2.svg","index.html","robots.txt","src/app.mjs","src/content.mjs","styles-compact.css","styles.css"];
const seen=[];
function walk(dir){
 for(const ent of readdirSync(dir,{withFileTypes:true})){
  const loc=join(dir,ent.name);
  assert.ok(!ent.isSymbolicLink(),"NO-GO: symlink expuesto: "+loc);
  if(ent.isDirectory())walk(loc);
  else {assert.ok(ent.isFile(),"NO-GO: fichero especial: "+loc);seen.push(relative(dist,loc).split(sep).join("/"));}
 }
}
walk(dist);
assert.deepEqual(seen.sort(),approved,"NO-GO: archivos fuera de la lista de publicación");
for(const path of approved.filter(x=>!["_headers","robots.txt"].includes(x))){
 const src=readFileSync(resolve(root,path)),out=readFileSync(resolve(dist,path));
 assert.equal(createHash("sha256").update(src).digest("hex"),createHash("sha256").update(out).digest("hex"),"Archivo visual o funcional modificado: "+path);
}
const html=readFileSync(resolve(dist,"index.html"),"utf8");
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
assert.doesNotMatch(html,/<link\s+rel="canonical"/i);
assert.match(html,/<link rel="stylesheet" href="\.\/styles-compact\.css" media="screen and \(max-height: 400px\)">/);
const headers=readFileSync(resolve(dist,"_headers"),"utf8");
for(const header of ["Content-Security-Policy:","frame-ancestors 'none'","X-Content-Type-Options: nosniff","X-Frame-Options: DENY","Referrer-Policy: no-referrer","Permissions-Policy:","X-Robots-Tag: noindex, nofollow"])
 assert.ok(headers.includes(header),"Cabecera Cloudflare faltante: "+header);
assert.equal(readFileSync(resolve(dist,"robots.txt"),"utf8"),"User-agent: *\nDisallow: /\n");
const manifest=JSON.parse(readFileSync(resolve(root,"reports/cloudflare-stage-manifest.json"),"utf8"));
assert.equal(manifest.mode,"LOCAL_TEST_ONLY");
assert.equal(manifest.candidate_head,process.env.DESSET_CANDIDATE_SHA||"unrecorded-local","SHA de PR no corresponde a manifiesto");
if(process.env.DESSET_CANDIDATE_SHA)assert.match(manifest.candidate_head,/^[a-f0-9]{40}$/);
assert.equal(manifest.public_exposure,false);
assert.equal(manifest.domain_association,false);
assert.deepEqual(Object.keys(manifest.files).sort(),approved);
for(const path of approved){
 const expected=createHash("sha256").update(readFileSync(resolve(dist,path))).digest("hex");
 assert.equal(manifest.files[path],expected,"Manifiesto incorrecto "+path);
}
console.log("CLOUDFLARE GATE PASS: 10 archivos allowlist, SHA-256 idénticos, sin noindex retirado, sin datos privados, con _headers declarados. Aplicación real de cabeceras = NOT_VERIFIED.");
