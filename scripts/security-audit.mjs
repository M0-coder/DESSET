import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=read("index.html");
assert.match(html,/Content-Security-Policy/);
assert.match(html,/name="robots" content="noindex,nofollow"/);
assert.doesNotMatch(html,/<script[^>]+src=["']https?:/i);
assert.doesNotMatch(html,/<form[^>]+action=["']https?:/i);
assert.doesNotMatch(html,/<iframe\b/i);
for(const path of ["src/app.mjs","src/content.mjs"]){
 const txt=read(path);
 assert.doesNotMatch(txt,/\beval\s*\(|\bnew\s+Function\s*\(|\.innerHTML\s*=|document\.write\s*\(/i,path+" contiene una API peligrosa");
}
for(const path of ["assets/roles-geometry-v2.svg","assets/city-network.svg"]){
 const txt=read(path);
 assert.match(txt,/<svg\b/);
 assert.doesNotMatch(txt,/<\s*(?:script|foreignObject)\b|\bon[a-z]+\s*=/i,path+" contiene elementos o atributos de ejecución");
 assert.doesNotMatch(txt,/(?:href|xlink:href)\s*=\s*["'](?:https?:|javascript:|data:)/i,path+" introduce referencias no autorizadas");
}
const css=read("styles.css");
assert.doesNotMatch(css,/@import\s+|url\s*\(\s*["']?https?:/i);
console.log("Seguridad estática sin dependencias: checks de HTML/JS/SVG/CSS OK. No es SAST exhaustivo.");
