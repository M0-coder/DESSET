import{readFileSync,statSync}from"node:fs";
import{join}from"node:path";
const root=new URL("../",import.meta.url);
const required=["index.html","styles.css","src/app.mjs","src/content.mjs","assets/deliver-assets-mark.png","assets/city-network.svg","package.json","package-lock.json",".github/workflows/ci.yml"];
let failures=[];
for(const p of required){try{const size=statSync(new URL(p,root)).size;if(!size)failures.push("Vacío: "+p)}catch{failures.push("Falta: "+p)}}
if(failures.length){console.error(failures.join("\n"));process.exitCode=1}else console.log("Archivos de sitio, activos y CI: OK");