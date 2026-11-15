import {statSync,readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const required=["index.html","styles.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/city-network.svg","assets/roles-geometry-v2.svg","package.json","package-lock.json",".github/workflows/ci.yml","scripts/browser-audit.mjs","tests/site.test.mjs"];
const failures=[];
for(const path of required){
  try{if(statSync(new URL(path,root)).size===0)failures.push("Archivo vacío: "+path);}
  catch{failures.push("Archivo inexistente: "+path);}
}
try{
  const png=readFileSync(new URL("assets/deliver-assets-mark.png",root));
  if(png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")failures.push("Cabecera PNG del símbolo inválida");
  const svg=readFileSync(new URL("assets/city-network.svg",root),"utf8");
  if(!svg.includes("<svg")||/<script|<foreignObject|onload\s*=/i.test(svg))failures.push("SVG sospechoso o mal formado");
  const hero=readFileSync(new URL("assets/roles-geometry-v2.svg",root),"utf8");
  if(!hero.includes("<svg")||/<script|<foreignObject|onload\\s*=/i.test(hero)) failures.push("Arte SVG no válido o sospechoso");
  const pack=JSON.parse(readFileSync(new URL("package.json",root),"utf8"));
  const lock=JSON.parse(readFileSync(new URL("package-lock.json",root),"utf8"));
  if(pack.name!==lock.name||pack.version!==lock.version)failures.push("Lockfile no corresponde al paquete");
}catch(e){failures.push("Error validando assets/lockfile: "+e.message);}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1;}
else console.log("Estructura, firmas de activos y lockfile: OK");
