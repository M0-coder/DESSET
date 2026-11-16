import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {CLOUDFLARE_SOURCE_META_CSP,CLOUDFLARE_RELEASE_META_CSP} from "./cloudflare-headers.mjs";
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

const seoTitle = "DESSET | DELIVER ASSETS — Comercio y logística en desarrollo";
const seoDescription = "Conoce DESSET, un proyecto de DELIVER ASSETS en Huacho, Perú. Una visión de comercio y coordinación de entregas, todavía en desarrollo.";
const seoReplacements = [
  ['<title>DELIVER ASSETS · Proyecto en desarrollo</title>', '<title>'+seoTitle+'</title>'],
  ['<meta property="og:title" content="DELIVER ASSETS · Proyecto en desarrollo">', '<meta property="og:title" content="'+seoTitle+'">'],
  ['<meta property="og:description" content="DELIVER ASSETS / DESSET. Sitio institucional en desarrollo. Proyecto de comercio y coordinación de entregas en preparación.">', '<meta property="og:description" content="'+seoDescription+'">'],
  ['<meta name="description" content="DELIVER ASSETS / DESSET. Sitio institucional en desarrollo. Proyecto de comercio y coordinación de entregas en preparación.">', '<meta name="description" content="'+seoDescription+'">']
];
for (const [from,to] of seoReplacements) {
  if (!html.includes(from)) throw Error("NO-GO: metadatos originales no reconocidos en el paquete de producción");
  html = html.replace(from,to);
}
// HEAD-only, fail-closed CSP change: never edit the approved HTML BODY or source file.
const sourceCspMeta='<meta http-equiv="Content-Security-Policy" content="'+CLOUDFLARE_SOURCE_META_CSP+'">';
const releaseCspMeta='<meta http-equiv="Content-Security-Policy" content="'+CLOUDFLARE_RELEASE_META_CSP+'">';
if (html.split(sourceCspMeta).length!==2) throw Error("NO-GO: la CSP original no coincide con el HTML aprobado");
html=html.replace(sourceCspMeta,releaseCspMeta);
const dst=output;
rmSync(dst,{force:true,recursive:true});mkdirSync(dst,{recursive:true});
for(const file of ["styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/desset-eye-still.png","assets/desset-eye.gif","assets/roles-geometry-v2.svg","404.html"]){
 const src=resolve(root,file),out=resolve(dst,file);mkdirSync(resolve(out,".."),{recursive:true});cpSync(src,out);
}
writeFileSync(resolve(dst,"index.html"),html);
writeFileSync(resolve(dst,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: "+site+"/sitemap.xml\n");
writeFileSync(resolve(dst,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+site+'/</loc></url></urlset>\n');
console.log("PAQUETE LOCAL DE PRUEBA en dist/. No hay autorización ni mecanismo de despliegue en este script.");
