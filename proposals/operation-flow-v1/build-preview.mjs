// DESSET OPERATION-FLOW-V1. Strictly offline preview; approved web files remain unchanged.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../../",import.meta.url));
const output=resolve(root,"reports/operation-flow-v1");
const read=p=>readFileSync(resolve(root,p),"utf8");
const copy=(p,target=p)=>{const dst=resolve(output,target);mkdirSync(dirname(dst),{recursive:true});copyFileSync(resolve(root,p),dst);};
function once(value,needle,replacement,label){
  const count=value.split(needle).length-1;
  if(count!==1)throw Error("NO-GO: "+label+" expected once, found "+count);
  return value.replace(needle,replacement);
}
function replaceObject(source,name,nextName,replacement){
  const start=source.indexOf("  "+name+":{");
  const end=nextName?source.indexOf("\n  "+nextName+":{",start):source.indexOf("\n});",start);
  if(start<0||end<0)throw Error("NO-GO: unexpected DETAIL structure for "+name);
  return source.slice(0,start)+replacement+source.slice(end);
}
if(process.env.CLOUDFLARE_API_TOKEN||process.env.DESSET_RELEASE_APPROVED){
  throw Error("NO-GO: preview builder must not receive publication credentials or approval flags");
}
rmSync(output,{recursive:true,force:true});
for(const p of ["styles-compact.css","src/app.mjs","404.html","assets/deliver-assets-mark.png","assets/desset-eye.gif","assets/desset-eye-still.png","assets/roles-geometry-v2.svg"])copy(p);
copy("proposals/operation-flow-v1/flow-operation-v1.svg","assets/flow-operation-v1.svg");
copy("proposals/operation-flow-v1/flow-operation-mobile-v1.svg","assets/flow-operation-mobile-v1.svg");
let html=read("index.html");
html=once(html,'<img src="./assets/roles-geometry-v2.svg" width="960" height="720" alt="Diagrama conceptual de la relación entre Customer, Business, Rider y Control">',
  '<picture class="flow-picture"><source media="(max-width:640px)" srcset="./assets/flow-operation-mobile-v1.svg"><img src="./assets/flow-operation-v1.svg" class="flow-graphic" width="720" height="380" alt="Recorrido ilustrativo: el cliente solicita, el comercio prepara, el repartidor recoge y el cliente recibe; Control supervisa el proceso"></picture>',"hero SVG");
html=once(html,'MOVIMIENTO / SISTEMA','DEL PEDIDO A LA ENTREGA',"hero caption");
const lowerOriginal='        <span class="tile-label">ECOSISTEMA DIGITAL</span>\n        <span class="tile-title">CUATRO ROLES.<br>UNA ARQUITECTURA.</span>\n        <span class="app-strip" aria-hidden="true"><span>CU</span><span>BU</span><span>RI</span><span>CO</span></span>';
const lowerNew='        <span class="tile-label">COMERCIOS / INTEGRACIÓN</span>\n        <span class="tile-title">DESSET PARA<br>TU NEGOCIO.</span>\n        <span class="tile-sub">Conexión comercial y logística proyectada para negocios.</span>\n        <div class="business-benefits" aria-hidden="true"><span>PEDIDOS</span><span>GESTIÓN</span><span>ENTREGAS</span></div>';
html=once(html,lowerOriginal,lowerNew,"lower tile");
writeFileSync(resolve(output,"index.html"),html);
let css=read("styles.css");
const appendCss=[
  "/* OPERATION-FLOW-V1: additive, preview-only selectors. Production CSS is unchanged. */",
  ".tile--visual .flow-picture{display:block;width:100%;height:100%;min-height:0}",
  ".tile--visual .flow-graphic{width:100%;height:100%;object-fit:contain;object-position:center;filter:none;opacity:1;padding:0 2px 7px}",
  'body[data-theme="dark"] .tile--visual .flow-graphic{filter:none;opacity:1}',
  ".business-benefits{display:flex;align-items:flex-end;gap:6px;flex-wrap:wrap;margin-top:auto;padding-right:32px}",
  ".business-benefits span{display:block;padding:12px 9px;flex:1 1 auto;border-radius:9px;background:#1551D8;color:white;font-size:clamp(9px,.86vw,13px);font-weight:700;text-align:center;white-space:nowrap}",
  ".business-benefits span:nth-child(2){background:#FFC62F;color:#111}",
  ".business-benefits span:nth-child(3){background:#111;color:white}",
  'body[data-theme="dark"] .business-benefits span:nth-child(3){background:#FF3328;color:#111}',
  "@media(max-width:1000px){.business-benefits span{padding:7px 5px;font-size:9px}.tile--visual .flow-graphic{padding:0 1px 9px}}",
  "@media(max-width:640px){.tile--visual .flow-graphic{padding:0 0 16px}.business-benefits{gap:3px;padding-right:24px}.business-benefits span{padding:6px 3px;font-size:8px}}",
  "@media(max-width:360px) and (max-height:640px){.business-benefits span{font-size:7px;padding:4px 2px}}"
].join("\n");
css+="\n"+appendCss+"\n";
writeFileSync(resolve(output,"styles.css"),css);
let content=read("src/content.mjs");
const ecosystem=[
'  ecosystem:{',
'    kicker:"RECORRIDO LOGÍSTICO",',
'    title:"Del pedido a la entrega.",',
'    body:"El gráfico describe una operación prevista. No implica pedidos habilitados, cobertura activa ni seguimiento en tiempo real.",',
'    points:["01 · Solicitud: un cliente inicia un pedido en la aplicación cuando esté disponible.","02 · Preparación: el comercio recibe y prepara la solicitud.","03 · Recogida: un repartidor recoge el pedido y realiza el traslado.","04 · Entrega: el cliente recibe el pedido; Control está previsto para supervisar el proceso."]',
'  },'
].join("\n");
const business=[
'  apps:{',
'    kicker:"PARA COMERCIOS",',
'    title:"DESSET para tu negocio.",',
'    body:"DESSET proyecta herramientas que conecten los pedidos de comercios con la coordinación de entregas.",',
'    points:["Facilitar la gestión de pedidos mediante las aplicaciones previstas.","Conectar la preparación comercial con la coordinación logística.","La integración, tarifas y disponibilidad dependerán de las validaciones comerciales y técnicas previas al lanzamiento."]',
'  }'
].join("\n");
content=replaceObject(content,"ecosystem","contact",ecosystem);
content=replaceObject(content,"apps",null,business);
writeFileSync(resolve(output,"src/content.mjs"),content);
const meta={source:"main",scope:["tarjeta visual superior","tarjeta inferior comercial","dos diálogos"],production_authorized:false,merge_authorized:false,files_written:["index.html","styles.css","src/content.mjs","assets/flow-operation-v1.svg","assets/flow-operation-mobile-v1.svg"],originals_unchanged:true};
writeFileSync(resolve(output,"candidate.json"),JSON.stringify(meta,null,2)+"\n");
console.log("OPERATION-FLOW-V1 offline candidate: "+output+"; NO MERGE / NO DEPLOY.");
