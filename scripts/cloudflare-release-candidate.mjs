// DESSET-CF-RELEASE-01. Paquete de PRODUCCIÓN SIMULADA LOCAL.
// La producción real requiere autorización de SHA y despliegue separado.
import {readFileSync,writeFileSync,rmSync,mkdirSync,lstatSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {CLOUDFLARE_RELEASE_HEADERS} from "./cloudflare-headers.mjs";
const root=fileURLToPath(new URL("../",import.meta.url));
const dist=resolve(root,"dist"),target=resolve(root,"dist-cloudflare-release-candidate");
if(process.env.DESSET_CF_RELEASE_MODE!=="LOCAL_TEST_ONLY"||
   process.env.DESSET_RELEASE_APPROVED!==undefined||
   process.env.CF_API_TOKEN!==undefined||
   process.env.CLOUDFLARE_API_TOKEN!==undefined){
 console.error("NO-GO: solo permite simular paquete local; no admite credenciales ni aprobación de publicación");
 process.exit(2);
}
const allow=["index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/desset-eye-still.png","assets/desset-eye.gif","assets/roles-geometry-v2.svg","404.html","robots.txt","sitemap.xml"];
const header=CLOUDFLARE_RELEASE_HEADERS;
const html=readFileSync(resolve(dist,"index.html"),"utf8");
if(!html.includes('<link rel="canonical" href="https://desset.lat/">')||
   !html.includes('<meta property="og:url" content="https://desset.lat/">')||
   /<meta name="robots" content="noindex,nofollow">/.test(html))
 throw Error("NO-GO: paquete base no tiene origen y SEO de producción simulada");
const robots=readFileSync(resolve(dist,"robots.txt"),"utf8");
if(!robots.includes("Allow: /")||robots.includes("Disallow: /"))throw Error("NO-GO: robots final no válido");
rmSync(target,{recursive:true,force:true});mkdirSync(target,{recursive:true});
const hashes={};
for(const path of allow){
 const input=resolve(dist,path),stat=lstatSync(input);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error("NO-GO: archivo no regular: "+path);
 const bytes=readFileSync(input),out=resolve(target,path);
 mkdirSync(dirname(out),{recursive:true});writeFileSync(out,bytes);
 hashes[path]=createHash("sha256").update(bytes).digest("hex");
}
writeFileSync(resolve(target,"_headers"),header);
hashes["_headers"]=createHash("sha256").update(header).digest("hex");
mkdirSync(resolve(root,"reports"),{recursive:true});
writeFileSync(resolve(root,"reports/cloudflare-release-manifest.json"),JSON.stringify({
 mode:"LOCAL_TEST_ONLY",origin:"https://desset.lat",deployment_authorized:false,
 candidate_head:process.env.DESSET_CANDIDATE_SHA||"unrecorded-local",
 checkout_sha:process.env.GITHUB_SHA||"unrecorded-local",
 files:hashes
},null,2)+"\n");
console.log("CF RELEASE-SHAPE: 13 archivos locales; ningún despliegue, no DNS ni autorización para publicar.");
