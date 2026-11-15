// Gate determinista de contenido para Cloudflare Pages (sólo ejecución local).
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {resolve,relative,join,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
const root=fileURLToPath(new URL("../",import.meta.url));
const dir=resolve(root,"dist-cloudflare-release-candidate");
const allow=["404.html","_headers","assets/deliver-assets-mark.png","assets/roles-geometry-v2.svg","index.html","robots.txt","sitemap.xml","src/app.mjs","src/content.mjs","styles-compact.css","styles.css"];
const seen=[];
function walk(path){
 for(const e of readdirSync(path,{withFileTypes:true})){
  const p=join(path,e.name);
  assert.ok(!e.isSymbolicLink(),"NO-GO: symlink "+p);
  if(e.isDirectory())walk(p);
  else{assert.ok(e.isFile(),"NO-GO: archivo especial "+p);seen.push(relative(dir,p).split(sep).join("/"))}
 }
}
walk(dir);
assert.deepEqual(seen.sort(),allow,"NO-GO: Cloudflare release tiene archivos extras");
for(const path of allow.filter(x=>x!=="_headers")){
 const src=readFileSync(resolve(root,"dist",path)),actual=readFileSync(resolve(dir,path));
 assert.equal(createHash("sha256").update(src).digest("hex"),createHash("sha256").update(actual).digest("hex"),"Archivo modificado: "+path);
}
const html=readFileSync(resolve(dir,"index.html"),"utf8"),h=readFileSync(resolve(dir,"_headers"),"utf8");
assert.doesNotMatch(html,/<meta name="robots" content="noindex/);
assert.match(html,/<link rel="canonical" href="https:\/\/desset\.lat\/">/);
assert.match(html,/<meta property="og:url" content="https:\/\/desset\.lat\/">/);
assert.match(readFileSync(resolve(dir,"robots.txt"),"utf8"),/User-agent: \*\nAllow: \/\nSitemap: https:\/\/desset\.lat\/sitemap\.xml/);
assert.match(readFileSync(resolve(dir,"sitemap.xml"),"utf8"),/<loc>https:\/\/desset\.lat\/<\/loc>/);
for(const x of ["Content-Security-Policy:","frame-ancestors 'none'","X-Frame-Options: DENY","X-Content-Type-Options: nosniff","Referrer-Policy: no-referrer","Permissions-Policy:"])
 assert.ok(h.includes(x),"Falta cabecera: "+x);
assert.doesNotMatch(h,/X-Robots-Tag:\s*noindex/i);
assert.doesNotMatch(h,/unsafe-inline|unsafe-eval/);
const m=JSON.parse(readFileSync(resolve(root,"reports/cloudflare-release-manifest.json"),"utf8"));
assert.equal(m.mode,"LOCAL_TEST_ONLY");
assert.equal(m.deployment_authorized,false);
assert.equal(m.origin,"https://desset.lat");
if(process.env.DESSET_CANDIDATE_SHA){
 assert.match(m.candidate_head,/^[0-9a-f]{40}$/);
 assert.equal(m.candidate_head,process.env.DESSET_CANDIDATE_SHA);
}
assert.deepEqual(Object.keys(m.files).sort(),allow);
for(const p of allow)assert.equal(m.files[p],createHash("sha256").update(readFileSync(resolve(dir,p))).digest("hex"));
console.log("CLOUDFLARE RELEASE-SHAPE GATE: PASS 11/11, SEO y cabeceras declaradas, design assets SHA-256 idénticos. HTTP TLS y despliegue = NOT_VERIFIED.");
