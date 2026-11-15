import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url));
const expected={
  "styles.css":"12290dd8da8c4ba4296a7926696ca684dd5c699f",
  "src/app.mjs":"52866fb6588bd7eb5a22e3917a82e28781a97319",
  "src/content.mjs":"5af6215a9f3a9e5d3ed3c146731b70a25a8124ac",
  "assets/deliver-assets-mark.png":"fa6cb4ea5c5331c4cf47dfd157214e972f809356",
  "assets/roles-geometry-v2.svg":"71401c4d0f93eeefcde393f18e82e165e50d8f90"
};
for(const [file,sha] of Object.entries(expected)){
 const content=read(file);
 const digest=createHash("sha1").update("blob "+content.length+"\0").update(content).digest("hex");
 assert.equal(digest,sha,"Alteración no autorizada del archivo aprobado: "+file);
}
const html=read("index.html").toString("utf8");
const a=html.indexOf("<body"),b=html.indexOf("</body>");
assert.ok(a>=0&&b>a,"Falta el body de la web institucional");
const body=html.slice(a,b+"</body>".length);
let n=0xcbf29ce484222325n;
for(let i=0;i<body.length;i++)n=BigInt.asUintN(64,(n^BigInt(body.charCodeAt(i)))*0x100000001b3n);
assert.equal(n.toString(16).padStart(16,"0"),"0750334fc145028b","Se modificó estructura, texto o identidad visual del Bento");
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
console.log("GATE VISUAL: cuerpo HTML y 5 archivos aprobados intactos (SHA de Git blob / firma de contenido).");
