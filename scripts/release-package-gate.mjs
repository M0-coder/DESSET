import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {CLOUDFLARE_SOURCE_META_CSP,CLOUDFLARE_RELEASE_META_CSP} from "./cloudflare-headers.mjs";
const path=part=>new URL("../dist/"+part,import.meta.url);
const read=part=>readFileSync(path(part),"utf8");
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const html=read("index.html"),origin="https://desset.lat";
assert.match(source,/<meta name="robots" content="noindex,nofollow">/,"Fuente de preview protegida");
assert.doesNotMatch(html,/<meta name="robots" content="noindex,nofollow">/,"El paquete final debe estar indexable");
assert.ok(html.includes('<link rel="canonical" href="'+origin+'/">'));
assert.ok(html.includes('<meta property="og:url" content="'+origin+'/">'));
assert.ok(html.includes("UNA MISMA VISIÓN.")&&html.includes("MOVEMOS LA CIUDAD."),"Narrativa intacta");
const previewMeta='<meta http-equiv="Content-Security-Policy" content="'+CLOUDFLARE_SOURCE_META_CSP+'">';
const releaseMeta='<meta http-equiv="Content-Security-Policy" content="'+CLOUDFLARE_RELEASE_META_CSP+'">';
assert.ok(source.includes(previewMeta),"La fuente aprobada debe conservar su CSP original");
assert.ok(html.includes(releaseMeta),"El artefacto debe admitir únicamente el beacon RUM automático");
assert.ok(!html.includes(previewMeta),"El artefacto debe sustituir la CSP de preview, no añadir políticas incompatibles");
assert.equal(html.slice(html.indexOf("<body")),source.slice(source.indexOf("<body")),"NO-GO: la publicación altera un solo byte del BODY visual aprobado");


assert.match(html, /<title>DESSET \| DELIVER ASSETS — Comercio y logística en desarrollo<\/title>/);
assert.match(html, /<meta property="og:title" content="DESSET \| DELIVER ASSETS — Comercio y logística en desarrollo">/);
assert.match(html, /<meta name="description" content="Conoce DESSET, un proyecto de DELIVER ASSETS en Huacho, Perú\./);
assert.match(html, /<meta property="og:description" content="Conoce DESSET, un proyecto de DELIVER ASSETS en Huacho, Perú\./);

assert.match(read("robots.txt"),/User-agent: \*\nAllow: \//);
assert.ok(read("robots.txt").includes(origin+"/sitemap.xml"));
assert.ok(read("sitemap.xml").includes("<loc>"+origin+"/</loc>"));
assert.match(source,/styles-compact\.css" media="screen and \(max-height: 400px\)"/);
assert.ok(html.includes('styles-compact.css" media="screen and (max-height: 400px)"'));
for(const file of ["styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/roles-geometry-v2.svg","assets/deliver-assets-mark.png","assets/desset-eye-still.png","assets/desset-eye.gif"]){
 const a=readFileSync(new URL("../"+file,import.meta.url)),b=readFileSync(path(file));
 const h=x=>createHash("sha256").update(x).digest("hex");
 assert.equal(h(a),h(b),"Copiado no reproducible: "+file);
}
assert.ok(!existsSync(path("vercel.json")),"No incluir configuración legacy Vercel en paquete Cloudflare");
assert.ok(existsSync(path("404.html")),"Debe existir página de error 404 en Cloudflare Pages");
assert.match(read("404.html"),/name="robots" content="noindex,nofollow"/);
console.log("ENSAYO DESSET.lat OK: paquete reproducible con canonical/SEO y origen aprobado, NO subido ni publicado.");
