import {statSync,readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const required=["index.html","styles.css","styles-compact.css","scripts/cloudflare-stage-package.mjs","scripts/cloudflare-stage-negative.mjs","scripts/cloudflare-stage-gate.mjs","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","404.html","assets/roles-geometry-v2.svg","package.json","package-lock.json",".github/workflows/ci.yml","scripts/browser-audit.mjs","tests/site.test.mjs"];
const failures=[];
for(const path of required){
  try{if(statSync(new URL(path,root)).size===0)failures.push("Archivo vacío: "+path);}
  catch{failures.push("Archivo inexistente: "+path);}
}
try{
  const png=readFileSync(new URL("assets/deliver-assets-mark.png",root));
  if(png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")failures.push("Cabecera PNG del símbolo inválida");
  const notFound=readFileSync(new URL("404.html",root),"utf8");
  if(!/<title>404\b/.test(notFound)||!/name="robots" content="noindex,nofollow"/.test(notFound)||/<script\b/i.test(notFound))failures.push("Página estática 404 insegura o inválida");
  const hero=readFileSync(new URL("assets/roles-geometry-v2.svg",root),"utf8");
  if(!hero.includes("<svg")||/<\s*(?:script|foreignObject)\b|\bon[a-z]+\s*=/i.test(hero)) failures.push("Arte SVG no válido o sospechoso");
  const pack=JSON.parse(readFileSync(new URL("package.json",root),"utf8"));
  const lock=JSON.parse(readFileSync(new URL("package-lock.json",root),"utf8"));
  if(pack.name!==lock.name||pack.version!==lock.version)failures.push("Lockfile no corresponde al paquete");
}catch(e){failures.push("Error validando assets/lockfile: "+e.message);}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
else console.log("Estructura, firmas de activos y lockfile: OK");
