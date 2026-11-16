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
  for(const path of ["assets/deliver-assets-mark.png","404.html"])assert.ok(existsSync(new URL("../"+path,import.meta.url)));
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

test("hero aprobado: cuatro roles, colores y siluetas exactas",()=>{
  const svg=read("assets/roles-geometry-v2.svg");
  assert.match(svg,/viewBox="0 0 720 380"/);
  assert.match(svg,/d="M18 102H235L327 190L235 278H18Z" fill="#1551D8"/);
  assert.match(svg,/d="M702 102H485L393 190L485 278H702Z" fill="#FF3328"/);
  assert.match(svg,/d="M272 12H448V86L360 168L272 86Z" fill="#FFC62F"/);
  assert.match(svg,/d="M272 368H448V294L360 212L272 294Z" fill="#111111"/);
  for(const label of ["CUSTOMER","SOLICITA","BUSINESS","PREPARA","RIDER","MUEVE","CONTROL","SUPERVISA"]) assert.match(svg,new RegExp(">"+label+"<"));
  assert.doesNotMatch(svg,/<script|<foreignObject|onload\\s*=/i);
});
test("solo cambia la ilustración central: misma narrativa V2 y contenido comercial",()=>{
  const html=read("index.html"),css=read("styles.css");
  assert.match(html,/src="\.\/assets\/roles-geometry-v2\.svg"/);
  assert.match(html,/NO SOLO ENTREGAMOS\./);
  assert.match(html,/MOVEMOS LA CIUDAD\./);
  assert.match(html,/MOVIMIENTO \/ SISTEMA/);
  assert.match(html,/COBRO<br>POR ENVÍO\./);
  assert.match(html,/UNA MISMA VISIÓN\./);
  assert.match(html,/CANALES OFICIALES<br>EN PREPARACIÓN\./);
  assert.match(css,/\.tile--visual img\{object-fit:contain;/);
  assert.match(css,/\.site\{width:100%;height:100dvh;/);
});

test("chips del ecosistema usan la misma identidad cromática del hero",()=>{
  const css=read("styles.css");
  for(const [role,hex] of [[1,"#1551D8"],[2,"#FFC62F"],[3,"#111111"],[4,"#FF3328"]]){
    assert.match(css,new RegExp("\\.app-strip span:nth-child\\("+role+"\\),body\\[data-theme=\"dark\"\\] \\.app-strip span:nth-child\\("+role+"\\)\\{background:"+hex));
  }
});

test("Bento móvil: sin cuatro rótulos redundantes y con ilustración original intacta",()=>{
  const svg=read("assets/roles-geometry-v2.svg");
  const html=read("index.html");
  const css=read("styles.css");
  assert.match(svg,/d="M702 102H485L393 190L485 278H702Z" fill="#FF3328"/);
  assert.match(svg,/d="M272 368H448V294L360 212L272 294Z" fill="#111111"/);
  assert.match(svg,/x="535" y="188" fill="#111111"/);
  assert.match(svg,/x="535" y="208" fill="#111111"/);
  assert.doesNotMatch(html,/class="role-legend"|role-legend--(?:customer|business|rider|control)/);
  assert.doesNotMatch(css,/\.role-legend(?:--|\b)/);
  assert.match(css,/\.tile--visual img\{width:100%;height:100%;min-height:0;max-height:none;/);
  assert.match(html,/class="visual-caption">MOVIMIENTO \/ SISTEMA/);
  assert.match(html,/src="\.\/assets\/desset-eye\.gif"/);
});
test("Prelaunch: ningún texto institucional aprobado se sustituye",()=>{
  const html=read("index.html");
  for(const fragment of ["UNA MISMA VISIÓN.","MOVEMOS LA CIUDAD.","COBRO<br>POR ENVÍO.","CANALES OFICIALES<br>EN PREPARACIÓN."]){
    assert.ok(html.includes(fragment),"Falta contenido autorizado: "+fragment);
  }
});

test("los metadatos nuevos permanecen limitados a HEAD y no indexan una vista preliminar",()=>{
 const html=read("index.html");
 assert.match(html,/<meta property="og:type" content="website">/);
 assert.match(html,/<meta property="og:locale" content="es_PE">/);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
 assert.doesNotMatch(html,/<link rel="canonical"/);
 assert.match(html,/UNA MISMA VISIÓN/);
});
