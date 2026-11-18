// DESSET HERITAGE-V2: build a preview using verified historic company-owned SVGs.
// Strictly local/ignored outputs. Never writes to the owner-approved Bento.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=fileURLToPath(new URL("../../",import.meta.url));
const dest=resolve(root,"reports/heritage-reuse-v2");
const read=p=>readFileSync(resolve(root,p),"utf8");
const write=(p,v)=>{const out=resolve(dest,p);mkdirSync(dirname(out),{recursive:true});writeFileSync(out,v);};
const copy=(p,target=p)=>{const out=resolve(dest,target);mkdirSync(dirname(out),{recursive:true});copyFileSync(resolve(root,p),out);};
const replaceOnce=(s,b,a,label)=>{
  if(s.split(b).length!==2)throw Error("NO-GO: expected one "+label);
  return s.replace(b,a);
};
function swapDetails(source,key,next,value){
  const start=source.indexOf("  "+key+":{");
  const end=next?source.indexOf("\n  "+next+":{",start):source.indexOf("\n});",start);
  if(start<0||end<0)throw Error("NO-GO: DETAIL structure changed for "+key);
  return source.slice(0,start)+value+source.slice(end);
}
if(process.env.CLOUDFLARE_API_TOKEN||process.env.DESSET_RELEASE_APPROVED||process.env.DESSET_CF_RELEASE_MODE){
  throw Error("NO-GO: not a release or deployment command");
}
rmSync(dest,{recursive:true,force:true});
for(const f of ["src/app.mjs","styles-compact.css","404.html",
  "assets/deliver-assets-mark.png","assets/desset-eye.gif","assets/desset-eye-still.png",
  "assets/roles-geometry-v2.svg"])copy(f);
copy("proposals/heritage-reuse-v2/rider-heritage-adapted.svg","assets/rider-heritage-adapted.svg");
copy("proposals/heritage-reuse-v2/business-ops-original.svg","assets/business-ops-original.svg");
let html=read("index.html");
html=replaceOnce(html,'aria-label="Conocer la visión del ecosistema DELIVER ASSETS"','aria-label="Conocer el recorrido conceptual de pedidos y entregas de DESSET"',"hero aria");
html=replaceOnce(html,
  '<img src="./assets/roles-geometry-v2.svg" width="960" height="720" alt="Diagrama conceptual de la relación entre Customer, Business, Rider y Control">',
  '<img src="./assets/rider-heritage-adapted.svg" class="heritage-rider" width="1200" height="800" alt="Ilustración histórica adaptada: repartidor, mapa urbano y pantalla conceptual de coordinación. No es seguimiento real.">',
  "hero illustration");
html=replaceOnce(html,'MOVIMIENTO / SISTEMA','PIDE · MIRA · RECIBE',"hero caption");
const before=[
'        <span class="tile-label">ECOSISTEMA DIGITAL</span>',
'        <span class="tile-title">CUATRO ROLES.<br>UNA ARQUITECTURA.</span>',
'        <span class="app-strip" aria-hidden="true"><span>CU</span><span>BU</span><span>RI</span><span>CO</span></span>'
].join("\n");
const after=[
'        <img src="./assets/business-ops-original.svg" class="heritage-business" width="1200" height="800" alt="" aria-hidden="true">',
'        <span class="tile-label">NEGOCIOS / DESSET BUSINESS</span>',
'        <span class="tile-title">PARA TU<br>NEGOCIO.</span>',
'        <span class="heritage-business-sub">PEDIDOS · CATÁLOGO · GESTIÓN</span>'
].join("\n");
html=replaceOnce(html,before,after,"business tile");
html=replaceOnce(html,'class="tile tile--apps tile--button"','class="tile tile--apps tile--button heritage-business-tile"',"business classname");
write("index.html",html);

let css=read("styles.css");
css+="\n"+[
"/* HERITAGE-V2 PREVIEW — original DELIVER ASSETS scene reused; official CSS untouched. */",
".tile--visual{background:#090b0d}",
".tile--visual img.heritage-rider{width:100%;height:100%;object-fit:cover;object-position:center center;padding:0;filter:none;opacity:1}",
"body[data-theme='dark'] .tile--visual img.heritage-rider{filter:none;opacity:1}",
".tile--visual .visual-caption{z-index:3;background:rgba(245,241,232,.95);color:#151515}",
"body[data-theme='dark'] .tile--visual .visual-caption{background:rgba(245,241,232,.94);color:#151515}",
".tile--apps.heritage-business-tile{position:relative;overflow:hidden;background:#080a0b;color:#fff}",
".tile--apps.heritage-business-tile img.heritage-business{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.8;pointer-events:none}",
".tile--apps.heritage-business-tile::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(4,6,7,.96),rgba(4,6,7,.78) 47%,rgba(4,6,7,.28));pointer-events:none}",
".tile--apps.heritage-business-tile .tile-label,.tile--apps.heritage-business-tile .tile-title,.tile--apps.heritage-business-tile .heritage-business-sub,.tile--apps.heritage-business-tile .tile-arrow{position:relative;z-index:2}",
".tile--apps.heritage-business-tile .tile-label{color:#f0d990;font-weight:700}",
".tile--apps.heritage-business-tile .tile-title{margin-top:auto;font-size:clamp(25px,2.6vw,42px);line-height:1;letter-spacing:-.055em;color:#fff;font-weight:800}",
".tile--apps.heritage-business-tile .heritage-business-sub{display:block;margin:10px 26px 3px 0;font-size:clamp(9px,.95vw,14px);font-weight:700;color:#f3d98c;letter-spacing:-.035em}",
".tile--apps.heritage-business-tile .tile-arrow{background:#FFC62F;color:#111;border-color:#FFC62F}",
"@media(max-width:1000px){.tile--visual img.heritage-rider{object-position:42% center}.tile--apps.heritage-business-tile .tile-title{font-size:clamp(20px,2.7vw,31px)}}",
"@media(max-width:640px){.tile--visual img.heritage-rider{object-position:38% center;object-fit:cover;padding:0}.tile--apps.heritage-business-tile img.heritage-business{object-position:60% center}.tile--apps.heritage-business-tile .tile-title{font-size:clamp(15px,4.9vw,24px)}.tile--apps.heritage-business-tile .heritage-business-sub{font-size:clamp(8px,2.1vw,10px);max-width:85%}}",
"@media(max-width:360px) and (max-height:640px){.tile--apps.heritage-business-tile .tile-title{font-size:15px}.tile--apps.heritage-business-tile .heritage-business-sub{font-size:7px}}",
"@media(prefers-reduced-motion:reduce){.tile--visual img.heritage-rider{animation:none}}"
].join("\n")+"\n";
write("styles.css",css);

let content=read("src/content.mjs");
const flow=[
'  ecosystem:{',
'    kicker:"CÓMO FUNCIONA / VISTA CONCEPTUAL",',
'    title:"Pide. Mira. Recibe.",',
'    body:"La secuencia recupera la narrativa original de DELIVER ASSETS y muestra cómo se articularía el recorrido de un pedido. Esta ilustración no representa una entrega en curso.",',
'    points:["PIDE: el cliente origina un pedido desde Customer; Business recibe y prepara.","MIRA: Rider acepta una asignación y se encarga del recojo y traslado; los estados y la coordinación se diseñaron en los prototipos.","RECIBE: el pedido llega a su destinatario y se registra el cierre conceptual.","CONTROL: el acceso es restringido; según el diseño de las aplicaciones, interviene ante incidencias escaladas, no como un cuarto paso del reparto.","El sitio público no habilita compras, pagos, seguimiento real ni promesas de tiempos de entrega."]',
'  },'
].join("\n");
const biz=[
'  apps:{',
'    kicker:"NEGOCIOS / DESSET BUSINESS",',
'    title:"Una operación más conectada.",',
'    body:"El prototipo histórico Business contiene pantallas de catálogo, inventario, pedidos y coordinación mediante chat de pedido. La ilustración es una representación editorial de esas capacidades.",',
'    points:["Catálogo y variantes: definición y presentación de productos.","Pedidos: revisión de estados, detalles y preparación.","Coordinación: conversaciones y evidencias asociadas a un pedido.","La integración pública, las tarifas y la disponibilidad requieren validación antes del lanzamiento comercial."]',
'  }'
].join("\n");
content=swapDetails(content,"ecosystem","contact",flow);
content=swapDetails(content,"apps",null,biz);
write("src/content.mjs",content);
write("manifest.json",JSON.stringify({
  id:"DESSET-HERITAGE-REUSE-V2",publication_authorized:false,
  merge_authorized:false,source_sha:"9f48d62cdadb43135fc9c2072cdc9e31f695c9ab",
  old_rider:{"repo":"M0-coder/DELIVER-ASESSET-prime","path":"assets/rider-ops-v2.svg","git_blob_sha":"f7a7455319246dfff998d84b8f727ff84d783479","adapted":true},
  old_business:{"repo":"M0-coder/DELIVER-ASESSET-prime","path":"assets/business-ops-v2.svg","git_blob_sha":"ce8c39fbc13c98fcab413355c31a87a02d7284d5","adapted":false},
  approved_visual_baseline_changed:false
},null,2)+"\n");
console.log("HERITAGE-V2 PREVIEW: "+dest+"; production unchanged; no merge/deploy.");
