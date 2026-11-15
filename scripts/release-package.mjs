import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const output=resolve(root,"dist");
const origin=process.env.DESSET_OFFICIAL_ORIGIN;
if(process.env.DESSET_PACKAGE_MODE!=="LOCAL_TEST_ONLY"||process.env.DESSET_RELEASE_APPROVED||!origin){
 console.error("NO-GO: solo se permite generar un paquete local mediante DESSET_PACKAGE_MODE=LOCAL_TEST_ONLY y DESSET_OFFICIAL_ORIGIN=https://desset.lat");
 process.exit(2);
}
let url;
try{url=new URL(origin)}catch{console.error("NO-GO: origen HTTPS inválido");process.exit(2)}
if(url.protocol!=="https:"||url.username||url.password||url.port||url.pathname!=="/"||url.search||url.hash||
  url.hostname.endsWith(".vercel.app")||url.hostname.endsWith(".github.io")||
  url.hostname.endsWith(".invalid")||url.hostname==="localhost"||url.hostname!=="desset.lat"){
 console.error("NO-GO: se requiere dominio canónico propio, HTTPS y sin ruta o credenciales");
 process.exit(2);
}
const site=url.origin;
const source=readFileSync(resolve(root,"index.html"),"utf8");
if(!source.includes('<meta name="robots" content="noindex,nofollow">'))throw Error("Preflight: la fuente cambió");
let html=source.replace('  <meta name="robots" content="noindex,nofollow">\n',"");
html=html.replace('  <link rel="stylesheet" href="./styles.css">','  <link rel="canonical" href="'+site+'/">\n  <meta property="og:url" content="'+site+'/">\n  <link rel="stylesheet" href="./styles.css">');
const dst=output;
rmSync(dst,{force:true,recursive:true});mkdirSync(dst,{recursive:true});
for(const file of ["styles.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/roles-geometry-v2.svg","assets/city-network.svg"]){
 const src=resolve(root,file),out=resolve(dst,file);mkdirSync(resolve(out,".."),{recursive:true});cpSync(src,out);
}
writeFileSync(resolve(dst,"index.html"),html);
writeFileSync(resolve(dst,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: "+site+"/sitemap.xml\n");
writeFileSync(resolve(dst,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+site+'/</loc></url></urlset>\n');
cpSync(resolve(root,"vercel.json"),resolve(dst,"vercel.json"));
console.log("PAQUETE LOCAL DE PRUEBA en dist/. No hay autorización ni mecanismo de despliegue en este script.");
