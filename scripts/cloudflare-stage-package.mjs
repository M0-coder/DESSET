// DESSET-CF-PREFLIGHT-01: SOLO ARTIFACTO LOCAL. NO despliega ni autoriza producción.
import {lstatSync,readFileSync,writeFileSync,mkdirSync,rmSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
const root=fileURLToPath(new URL("../",import.meta.url));
const target=resolve(root,"dist-cloudflare-stage");
if(process.env.DESSET_CLOUDFLARE_STAGE!=="LOCAL_TEST_ONLY"||
   process.env.DESSET_RELEASE_APPROVED!==undefined||
   process.env.DESSET_OFFICIAL_ORIGIN!==undefined||
   process.env.CF_API_TOKEN!==undefined||
   process.env.CLOUDFLARE_API_TOKEN!==undefined){
  console.error("NO-GO: Cloudflare stage solo permite ensayo local aislado, sin credenciales ni destino de producción");
  process.exit(2);
}
const approved=["index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/roles-geometry-v2.svg","assets/city-network.svg"];
const source=readFileSync(resolve(root,"index.html"),"utf8");
if(!source.includes('<meta name="robots" content="noindex,nofollow">')||
    /<link\s+rel="canonical"/i.test(source))throw Error("NO-GO: la fuente no conserva noindex staging");
const headers="/*\n  Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n";
const robots="User-agent: *\nDisallow: /\n";
rmSync(target,{recursive:true,force:true});
mkdirSync(target,{recursive:true});
const hashes={};
for(const path of approved){
  const origin=resolve(root,path), info=lstatSync(origin);
  if(!info.isFile()||info.isSymbolicLink())throw Error("NO-GO: archivo fuente no regular: "+path);
  const bytes=readFileSync(origin),dest=resolve(target,path);
  mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes);
  hashes[path]=createHash("sha256").update(bytes).digest("hex");
}
writeFileSync(resolve(target,"_headers"),headers);
writeFileSync(resolve(target,"robots.txt"),robots);
hashes["_headers"]=createHash("sha256").update(headers).digest("hex");
hashes["robots.txt"]=createHash("sha256").update(robots).digest("hex");
mkdirSync(resolve(root,"reports"),{recursive:true});
writeFileSync(resolve(root,"reports/cloudflare-stage-manifest.json"),JSON.stringify({
 mode:"LOCAL_TEST_ONLY", candidate_head:process.env.DESSET_CANDIDATE_SHA||"unrecorded-local", checkout_sha:process.env.GITHUB_SHA||"unrecorded-local",
 public_exposure:false,domain_association:false,files:hashes
},null,2)+"\n");
console.log("CLOUDFLARE STAGE: solo paquete local, 10 archivos allowlist; no deploy, no DNS, sin indexación.");
