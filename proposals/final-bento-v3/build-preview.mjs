// DESSET DESIGN-V3: reproduce the founder's 18-Nov visual reference
// as a real, locally runnable copy of the current institutional site.
// Deliberately does not edit approved source, merge, or deploy.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
const root=fileURLToPath(new URL("../../",import.meta.url));
const out=resolve(root,"reports/final-bento-v3");
const read=p=>readFileSync(resolve(root,p),"utf8");
const write=(p,s)=>{const to=resolve(out,p);mkdirSync(dirname(to),{recursive:true});writeFileSync(to,s);};
const copy=(p,dst=p)=>{const to=resolve(out,dst);mkdirSync(dirname(to),{recursive:true});copyFileSync(resolve(root,p),to);};
const one=(s,a,b,label)=>{const parts=s.split(a);if(parts.length!==2)throw Error("NO-GO V3 "+label+": "+(parts.length-1)+" occurrences");return parts.join(b);};
const sha=p=>createHash("sha256").update(readFileSync(resolve(root,p))).digest("hex");
const protectedFiles=["index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/roles-geometry-v2.svg","config/visual-baseline-approved.json"];
const before=Object.fromEntries(protectedFiles.map(p=>[p,sha(p)]));
if(process.env.CLOUDFLARE_API_TOKEN||process.env.DESSET_RELEASE_APPROVED||process.env.DESSET_CF_RELEASE_MODE){
 throw Error("NO-GO: preview builder must not use release privileges");
}
rmSync(out,{recursive:true,force:true});
for(const file of ["src/app.mjs","styles-compact.css","404.html",
  "assets/deliver-assets-mark.png","assets/desset-eye.gif","assets/desset-eye-still.png","assets/roles-geometry-v2.svg"]){copy(file);}
copy("proposals/final-bento-v3/rider-city-v3.svg","assets/rider-city-v3.svg");
copy("proposals/final-bento-v3/rider-city-mobile-v3.svg","assets/rider-city-mobile-v3.svg");
copy("proposals/final-bento-v3/business-dashboard-v3.svg","assets/business-dashboard-v3.svg");
let html=read("index.html");
html=one(html,
  '<img src="./assets/roles-geometry-v2.svg" width="960" height="720" alt="Diagrama conceptual de la relación entre Customer, Business, Rider y Control">',
  '<picture class="v3-art-picture"><source media="(max-width: 640px)" srcset="./assets/rider-city-mobile-v3.svg"><img src="./assets/rider-city-v3.svg" class="v3-rider-scene" width="960" height="600" alt="Ilustración conceptual DESSET: repartidor, ciudad y ruta representada en un teléfono; no muestra seguimiento real"></picture>',
  "replace diagram");
html=one(html,'aria-label="Conocer la visión del ecosistema DELIVER ASSETS"','aria-label="Conocer cómo está previsto que funcione DESSET"',"hero aria");
html=one(html,
  '<span class="visual-caption">MOVIMIENTO / SISTEMA <span aria-hidden="true">↗</span></span>',
  '<span class="v3-flow" aria-hidden="true">PIDE · MIRA · RECIBE<span class="v3-flow-bars"><i></i><i></i><i></i></span></span>',
  "hero caption");
html=one(html,'Una identidad creada para conectar comercio, ciudad y movimiento.','Una identidad que conecta comercio, pedidos y movimiento en la ciudad.',"lead");
html=one(html,'class="tile tile--apps tile--button"','class="tile tile--apps tile--button v3-business-tile"',"business tile class");
const oldBusiness=[
'        <span class="tile-label">ECOSISTEMA DIGITAL</span>',
'        <span class="tile-title">CUATRO ROLES.<br>UNA ARQUITECTURA.</span>',
'        <span class="app-strip" aria-hidden="true"><span>CU</span><span>BU</span><span>RI</span><span>CO</span></span>'
].join("\n");
const newBusiness=[
'        <img class="v3-business-art" src="./assets/business-dashboard-v3.svg" width="960" height="600" alt="" aria-hidden="true">',
'        <span class="tile-label v3-business-kicker">NEGOCIOS / DESSET BUSINESS</span>',
'        <span class="tile-title v3-business-title">PARA TU<br>NEGOCIO.</span>',
'        <span class="v3-business-desc">PEDIDOS · CATÁLOGO · GESTIÓN</span>'
].join("\n");
html=one(html,oldBusiness,newBusiness,"business contents");
write("index.html",html);
let content=read("src/content.mjs");
function setDetail(s,key,next,newValue){
  const start=s.indexOf("  "+key+":{");
  const end=next?s.indexOf("\n  "+next+":{",start):s.indexOf("\n});",start);
  if(start<0||end<0)throw Error("NO-GO: DETAIL object "+key+" not found");
  return s.slice(0,start)+newValue+s.slice(end);
}
content=setDetail(content,"ecosystem","contact",[
'  ecosystem:{',
'    kicker:"CÓMO FUNCIONA DESSET",',
'    title:"Pide. Mira. Recibe.",',
'    body:"DESSET prepara una experiencia para conectar pedidos, comercios y entregas. La escena es conceptual y no presenta seguimiento ni envíos activos.",',
'    points:["PIDE: Customer permite iniciar la solicitud desde las aplicaciones cuando estén habilitadas.","PREPARA: Business organiza los productos y confirma la preparación.","MIRA: Rider recibe una asignación y realiza recogida y traslado; los estados previstos se coordinan desde las aplicaciones.","RECIBE: el destinatario recibe el pedido y se completa el recorrido.","Control está diseñado para atender incidencias escaladas con acceso restringido; no es otra etapa de entrega.","La web sigue siendo institucional: no recibe pedidos, pagos ni revela la ubicación de personas."]',
'  },'].join("\n"));
content=setDetail(content,"apps",null,[
'  apps:{',
'    kicker:"DESSET BUSINESS / COMERCIOS",',
'    title:"Herramientas previstas para tu negocio.",',
'    body:"La propuesta DESSET Business integra información de productos, preparación de pedidos y coordinación logística. La imagen representa una interfaz conceptual, no indicadores financieros reales.",',
'    points:["Catálogo: organizar productos, variantes y disponibilidad.","Pedidos: preparar, revisar y coordinar entregas desde la aplicación Business.","Gestión: consultar estados e incidencias sin depender de esta web institucional.","El alta de negocios, precios y cobertura se anunciarán únicamente cuando estén verificados."]',
'  }'].join("\n"));
write("src/content.mjs",content);
const css=read("styles.css")+"\n"+read("proposals/final-bento-v3/final.css")+"\n";
write("styles.css",css);
const after=Object.fromEntries(protectedFiles.map(p=>[p,sha(p)]));
if(JSON.stringify(before)!==JSON.stringify(after))throw Error("NO-GO: changed approved production file");
write("candidate.json",JSON.stringify({
  name:"DESSET-FINAL-BENTO-V3",source_sha:"9f48d62cdadb43135fc9c2072cdc9e31f695c9ab",
  approved_source_preserved:true,publication_authorized:false,merge_authorized:false,
  source_sha256:before,output_files:["index.html","styles.css","styles-compact.css","src/app.mjs","src/content.mjs","assets/rider-city-v3.svg","assets/rider-city-mobile-v3.svg","assets/business-dashboard-v3.svg"],interactive:true,
  warning:"Illustrations are editorial concepts; not operational claims"
},null,2)+"\n");
console.log("FINAL-BENTO-V3 local candidate "+out+" (NO DEPLOY; original unchanged)");
