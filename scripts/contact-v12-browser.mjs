// CONTACT-V12: local-only instrumented Chrome audit of the actual official-site source.
// This script cannot deploy, modify DNS, or access Cloudflare credentials.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { launchChromeWithRetry } from "./chrome-startup.mjs";
import { finishBrowserAudit } from "./browser-cleanup.mjs";

const sizes=[[1920,1080],[1440,900],[1280,720],[1280,600],[1024,768],[768,900],[390,844],[375,667],[360,740],[320,568],[768,320],[390,320],[320,256]];
const assets=new Map([
 ["/","index.html"],["/index.html","index.html"],["/styles.css","styles.css"],
 ["/styles-compact.css","styles-compact.css"],["/src/app.mjs","src/app.mjs"],
 ["/src/content.mjs","src/content.mjs"],
 ["/assets/deliver-assets-mark.png","assets/deliver-assets-mark.png"],
 ["/assets/desset-eye.gif","assets/desset-eye.gif"],
 ["/assets/desset-eye-still.png","assets/desset-eye-still.png"],
 ["/assets/roles-geometry-v2.svg","assets/roles-geometry-v2.svg"]
]);
const mime=p=>p.endsWith(".css")?"text/css":p.endsWith(".mjs")?"text/javascript":p.endsWith(".svg")?"image/svg+xml":p.endsWith(".png")?"image/png":p.endsWith(".gif")?"image/gif":"text/html";
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function chromeBinary(){
 for(const b of [process.env.CHROME_BIN,"google-chrome-stable","google-chrome","chromium"].filter(Boolean)){
  if(spawnSync(b,["--version"],{encoding:"utf8",timeout:3000}).status===0)return b;
 }
 throw Error("NO-GO: Chromium unavailable");
}
async function cdp(port){
 let page;
 for(let n=0;n<60;n++){
  const j=await fetch("http://127.0.0.1:"+port+"/json/list").then(r=>r.json()).catch(()=>[]);
  page=j.find(x=>x.type==="page");if(page)break;await delay(100);
 }
 assert.ok(page?.webSocketDebuggerUrl,"NO-GO: Chrome devtools page unavailable");
 const ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((ok,bad)=>{ws.addEventListener("open",ok,{once:true});ws.addEventListener("error",bad,{once:true})});
 let i=0;const pending=new Map();
 ws.addEventListener("message",e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)});
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++i;const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout "+method));},20000);
  pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x)},reject:x=>{clearTimeout(timer);reject(x)}});
  ws.send(JSON.stringify({id,method,params}));
 });
 return {ws,send};
}
async function evaluate(send,s){
 const v=await send("Runtime.evaluate",{expression:s,returnByValue:true,awaitPromise:true});
 if(v.exceptionDetails)throw Error("Browser eval error: "+(v.exceptionDetails.exception?.description||v.exceptionDetails.text));
 return v.result.value;
}
function measureContact(){
 const tile=document.querySelector(".tile--contact"),title=tile?.querySelector(".contact-v12-title"),computer=tile?.querySelector(".contact-v12-computer"),cross=tile?.querySelector(".contact-v12-cross"),arrow=tile?.querySelector(".tile-arrow");
 if(!tile||!title||!computer||!cross||!arrow)return {errors:["missing elements"]};
 const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
 const intersects=(a,b,pad=0)=>a.x<b.right+pad&&a.right>b.x-pad&&a.y<b.bottom+pad&&a.bottom>b.y-pad;
 const tb=box(tile),tt=box(title),pc=box(computer),ab=box(arrow),xb=box(cross);
 const range=document.createRange();range.selectNodeContents(title);
 const lines=[...range.getClientRects()].map(r=>({x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height})).filter(r=>r.width>0&&r.height>0);
 // SVG art's actual rendered region inside the aspect-ratio-preserving SVG viewport.
 const vw=Math.min(pc.width,pc.height*180/130),vh=vw*130/180;
 const x=pc.x+(pc.width-vw)/2,y=pc.y+(pc.height-vh)/2;
 // Core CRT silhouette, not the nearly transparent ink-dot perimeter.
 const silhouette={x:x+39/180*vw,y:y+10/130*vh,right:x+154/180*vw,bottom:y+125/130*vh};
 const crossInk={x:xb.x-7,y:xb.y-7,right:xb.right+7,bottom:xb.bottom+7};
 const crossShown=getComputedStyle(cross).display!=="none";
 const inside=(a,t,p=2)=>a.x>=t.x-p&&a.y>=t.y-p&&a.right<=t.right+p&&a.bottom<=t.bottom+p;
 const border=getComputedStyle(tile,"::before");
 const errors=[];
 if(getComputedStyle(tile).display!=="none" && tile.getClientRects().length){
  if(title.scrollWidth>title.clientWidth+2||title.scrollHeight>title.clientHeight+2||!inside(tt,tb))errors.push("title clipped");
  if(!inside(ab,tb))errors.push("arrow clipped");
  if(!inside(pc,tb))errors.push("computer clipped");
  if(lines.some(r=>intersects(r,silhouette,1)))errors.push("text overlaps CRT");
  if(lines.some(r=>intersects(r,ab,1)))errors.push("text overlaps arrow");
  if(intersects(silhouette,ab,1))errors.push("CRT overlaps arrow");
  if(crossShown&&(lines.some(r=>intersects(r,crossInk,1))||intersects(crossInk,silhouette,1)||intersects(crossInk,ab,1)))errors.push("cross overlaps text/CRT/arrow");
 }
 if(tile.textContent.includes("CONTACTO / 01"))errors.push("redundant label");
 if(!tile.textContent.includes("CANALES")||!tile.textContent.includes("OFICIALES."))errors.push("title missing");
 if(tile.getAttribute("data-detail")!=="contact")errors.push("contact action missing");
 if(!(computer instanceof SVGSVGElement)||computer.querySelectorAll("rect").length<200)errors.push("retro SVG missing");
 if(border.content==="none"||parseFloat(border.borderTopWidth)<1)errors.push("inner border missing");
 const contrast={background:getComputedStyle(tile).backgroundColor,title:getComputedStyle(title).color};
 return {errors,viewport:[innerWidth,innerHeight],view:document.querySelector(".board").dataset.view,theme:document.body.dataset.theme,contrast,crossShown,tile:tb,text:lines,computer:pc,art:silhouette,arrow:ab,cross:crossInk,innerBorder:border.borderTopColor};
}
let server,browser,temporary,ws,problem=null;
const output=new URL("../reports/contact-v12-implementation/",import.meta.url);
await mkdir(output,{recursive:true});
const records=[];
try{
 server=createServer(async(req,res)=>{
  const p=new URL(req.url,"http://localhost").pathname;
  if(!assets.has(p)){res.writeHead(404);res.end("Not found");return}
  try{
   const bytes=await readFile(new URL("../"+assets.get(p),import.meta.url));
   res.writeHead(200,{"content-type":mime(p),"cache-control":"no-store","x-robots-tag":"noindex,nofollow"});
   res.end(bytes);
  }catch(e){res.writeHead(500);res.end("Missing "+e.code)}
 });
 await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const local="http://127.0.0.1:"+server.address().port+"/";
 const launched=await launchChromeWithRetry(chromeBinary());
 browser=launched.browser;temporary=launched.temporary;
 const connected=await cdp(launched.port);ws=connected.ws;
 const send=connected.send;
 await send("Page.enable");await send("Runtime.enable");
 for(const [width,height] of sizes){
  await send("Emulation.setDeviceMetricsOverride",{width,height,mobile:width<=640,deviceScaleFactor:1});
  const nav=await send("Page.navigate",{url:local});
  assert.ok(!nav.errorText,"NO-GO: local navigation "+nav.errorText);
  let ready=false;
  for(let n=0;n<80;n++){
   ready=await evaluate(send,"document.readyState==='complete'&&!!document.querySelector('.tile--contact')").catch(()=>false);
   if(ready)break;await delay(100);
  }
  assert.ok(ready,"NO-GO: site did not load "+width+"x"+height);
  await delay(120);
  if(width<=640)await evaluate(send,"document.querySelector('[data-view-button=sections]').click()");
  for(const theme of ["light","dark"]){
   if(theme==="dark"){await evaluate(send,"document.querySelector('#themeButton').click()");await delay(220)}
   const m=await evaluate(send,"("+measureContact.toString()+")()");
   const dialog=await evaluate(send,"(function(){document.querySelector('.tile--contact').click();const d=document.querySelector('#detailDialog');const result={open:d.open,links:d.querySelectorAll('.channel-links a').length};d.close();return result})()");
   if(!dialog.open||dialog.links!==5)m.errors.push("contact dialog or five channels failed");
   if(theme!==m.theme)m.errors.push("dark/light mode mismatch");
   if(theme==="dark"&&m.contrast.background!=="rgb(53, 53, 53)")m.errors.push("dark background mismatch");
   const screenshot=await send("Page.captureScreenshot",{format:"png",fromSurface:true});
   const file=theme+"-"+width+"x"+height+".png";
   await writeFile(new URL(file,output),Buffer.from(screenshot.data,"base64"));
   records.push({file,...m});
   console.log("CONTACT-V12 "+width+"x"+height+" "+theme+" "+(m.errors.length?"FAIL "+m.errors.join("; "):"PASS"));
  }
 }
 await writeFile(new URL("manifest.json",output),JSON.stringify({mode:"LOCAL_ONLY_NO_DEPLOY",screenshots:records.length,results:records},null,2)+"\n");
 const bad=records.filter(x=>x.errors.length);
 if(bad.length)throw Error("CONTACT-V12 NO-GO: "+bad.length+" viewport/theme failures. See manifest.json.");
}catch(e){problem=e}
finally{await finishBrowserAudit({ws,browser,server,temporary},problem)}
console.log("CONTACT-V12 PASS: 13 viewports, light/dark, 26 captures, zero forbidden overlaps, five official links.");
