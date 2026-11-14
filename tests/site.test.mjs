import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {DETAILS,DETAIL_KEYS} from "../src/content.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("las tarjetas navegables tienen contenido verificable",()=>{
  const html=read("index.html");
  for(const key of DETAIL_KEYS){
    assert.match(html,new RegExp('data-detail="'+key+'"'));
    const data=DETAILS[key];
    assert.ok(data.kicker&&data.title&&data.body&&data.points.length>=2);
  }
});
test("la pantalla y el tablero prohíben desplazamiento",()=>{
  const css=read("styles.css");
  assert.match(css,/html,body\{[^}]*overflow:hidden/);
  assert.match(css,/\.site\{[^}]*height:100dvh/);
  assert.match(css,/\.board\{[^}]*overflow:hidden/);
  assert.match(css,/\.board\[data-view="sections"\]/);
});
test("ningún enlace comercial no verificado ni componente externo",()=>{
  const html=read("index.html");
  assert.doesNotMatch(html,/<form[^>]*action=/i);
  assert.doesNotMatch(html,/https?:\/\//);
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.match(html,/Content-Security-Policy/);
});
test("se versionan los activos del proyecto anterior",()=>{
  for(const path of ["assets/deliver-assets-mark.png","assets/city-network.svg"])assert.ok(existsSync(new URL("../"+path,import.meta.url)));
});
test("la interfaz no afirma operaciones, coberturas ni métricas",()=>{
  const html=read("index.html");
  for(const text of ["12 MIN","24/7","96%","4.8/5","PAGOS PROTEGIDOS","PEDIR AHORA"])assert.ok(!html.includes(text));
});
test("los datos operativos quedan rotulados como previstos",()=>{
  assert.match(DETAILS.model.body,/previsto/);
  assert.match(DETAILS.status.body,/prototipo/);
  assert.match(DETAILS.company.body,/trámite de constitución/);
});
test("full-bleed elimina max-width, padding y márgenes exteriores",()=>{
  const css=read("styles.css");
  assert.match(css,/body\{background:var\(--outer\);/);
  assert.match(css,/\.site\{width:100%;height:100dvh;min-height:0;margin:0;padding:0;/);
  assert.match(css,/\.board\{width:100%;height:100%;/);
  assert.match(css,/\.board\{[^}]*border-radius:0;/);
  assert.doesNotMatch(css,/width:min\(100%,1600px\)/);
  assert.match(css,/@media\(max-width:640px\)\{\s*\.site\{padding:0;[^}]*gap:0\}/);
});
test("la web no ejecuta scripts ajenos ni utiliza enlaces externos",()=>{
  const html=read("index.html");
  assert.doesNotMatch(html,/<script[^>]+src="https?:/i);
  assert.doesNotMatch(html,/target="_blank"/i);
  assert.match(html,/<html lang="es">/);
  assert.match(html,/<dialog class="detail-dialog"/);
});

test("carácter V2 respeta el origen y la jerarquía de marca",()=>{
  const html=read("index.html");
  const css=read("styles.css");
  assert.match(html,/class="brand-word">LOGÍSTICA<\/span>/);
  assert.match(html,/NO SOLO ENTREGAMOS\./);
  assert.match(html,/MOVEMOS LA CIUDAD\./);
  assert.match(html,/MOVIMIENTO \/ SISTEMA/);
  assert.match(css,/--brand-blue:#1551D8/);
  assert.match(css,/--brand-red:#FF3328/);
  assert.match(css,/--brand-yellow:#FFC62F/);
  assert.match(css,/\.tile--visual img\{filter:none;opacity:1\}/);
  assert.match(css,/@media\(max-width:640px\)\{\s*\.visual-statement\{display:none\}/);
});
test("la presencia institucional no crea compras, pagos ni contacto ficticio",()=>{
  const html=read("index.html");
  assert.match(html,/IDENTIDAD\./);
  assert.match(html,/ACTIVAR MODO OSCURO\./);
  assert.doesNotMatch(html,/comprar ahora|añadir al carrito|checkout|pay now/i);
  assert.match(DETAILS.services.points.join(" "),/no admite compras, pedidos ni pagos/);
  assert.match(DETAILS.model.points.join(" "),/la aplicación, no a esta web/);
});

test("el pulido del hero conserva el texto original y la ruta del ecosistema",()=>{
  const before=read("assets/city-network.svg");
  const after=read("assets/city-network-refined.svg");
  const labels=s=>[...s.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);
  assert.deepEqual(labels(after),labels(before),"Ningún nombre, subtítulo o lema del SVG puede cambiar");
  const trajectory=s=>s.match(/<path d="(M116 548C[^"]+)"/)?.[1];
  assert.equal(trajectory(after),trajectory(before),"La trayectoria central no debe cambiar");
  assert.match(after,/translate\(72 360\)/);
  assert.doesNotMatch(after,/<script|<foreignObject|onload\s*=/i);
  assert.match(read("index.html"),/assets\/city-network-refined\.svg/);
  assert.match(read("index.html"),/NO SOLO ENTREGAMOS\./);
  assert.match(read("index.html"),/MOVEMOS LA CIUDAD\./);
  assert.match(read("index.html"),/MOVIMIENTO \/ SISTEMA/);
  assert.match(read("index.html"),/COBRO<br>POR ENVÍO\./);
});
test("el hero permanece dentro del Bento y sin cambio de tipografía global",()=>{
  const css=read("styles.css");
  assert.match(css,/\.tile--visual\{background:#FFF9E9\}/);
  assert.match(css,/\.visual-caption\{/);
  assert.match(css,/\.site\{width:100%;height:100dvh;/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
