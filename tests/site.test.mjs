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

test("V2.1 conserva cuadrícula Bento y los tokens canónicos",()=>{
  const css=read("styles.css"), html=read("index.html");
  assert.match(css,/grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(css,/\.board\{width:100%;height:100%;/);
  assert.match(css,/--brand-blue:#1551D8/);
  assert.match(css,/--brand-red:#FF3328/);
  assert.match(css,/--brand-yellow:#FFC62F/);
  assert.match(html,/DA — VISIÓN 01/);
  assert.match(html,/HUACHO\.<br>PUNTO DE PARTIDA\./);
  assert.match(html,/CANALES<br>OFICIALES\./);
  assert.doesNotMatch(html,/COBRO<br>POR ENVÍO\./);
});
test("V2.1 conserva accesibilidad básica de controles y reduce efectos animados",()=>{
  const css=read("styles.css"),html=read("index.html");
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.tile--button:focus-visible\{outline:/);
  assert.match(html,/aria-label="Conocer la visión del ecosistema DELIVER ASSETS"/);
  assert.match(html,/meta name="robots" content="noindex,nofollow"/);
  assert.match(DETAILS.model.body,/previsto/);
  assert.match(DETAILS.model.points.join(" "),/la aplicación, no a esta web/);
});
