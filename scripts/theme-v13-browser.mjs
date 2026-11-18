// THEME-V13: local-only instrumented Chrome audit of the actual official-site source.
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
function measureTheme(){
 const tile=document.querySelector(".tile--theme"),label=tile?.querySelector(".theme-caption"),arrow=tile?.querySelector(".tile-arrow"),gear=tile?.querySelector(".theme-v13-gear"),moon=tile?.querySelector(".theme-v13-moon"),sky=tile?.querySelector(".theme-v13-sky"),stars=tile?.querySelectorAll(".theme-v13-star");
 const errors=[];
 if(!tile||!label||!arrow||!gear||!moon||!sky||stars?.length!==3)return {errors:["missing theme elements"],viewport:[innerWidth,innerHeight]};
 const box=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
 const inside=(a,b,pad=2)=>a.x>=b.x-pad&&a.y>=b.y-pad&&a.right<=b.right+pad&&a.bottom<=b.bottom+pad;
 const intersect=(a,b,pad=0)=>a.x<b.right+pad&&a.right>b.x-pad&&a.y<b.bottom+pad&&a.bottom>b.y-pad;
 const tb=box(tile),cb=box(label),ab=box(arrow),gb=box(gear),mb=box(moon);
 const textRange=document.createRange();textRange.selectNodeContents(label);
 const lines=[...textRange.getClientRects()].map(r=>({x:r.left,y:r.top,right:r.right,bottom:r.bottom})).filter(x=>x.right>x.x&&x.bottom>x.y);
 const theme=document.body.dataset.theme,expected=theme==="light"?"ACTIVAR MODO OSCURO.":"ACTIVAR MODO CLARO.";
 const skyShown=getComputedStyle(sky).display!=="none";
 const arrowStyle=getComputedStyle(arrow),labelStyle=getComputedStyle(label),tileStyle=getComputedStyle(tile);
 if(document.querySelectorAll(".tile").length!==10)errors.push("missing other tiles");
 if(getComputedStyle(tile).display==="none"||!inside(tb,{x:0,y:0,right:innerWidth,bottom:innerHeight},2))errors.push("theme tile hidden/clipped");
 if(label.textContent.trim()!==expected)errors.push("wrong caption "+label.textContent);
 if(tile.getAttribute("aria-pressed")!==String(theme==="dark"))errors.push("aria pressed");
 if(tile.getAttribute("aria-label")!==(theme==="dark"?"Activar el modo claro":"Activar el modo oscuro"))errors.push("aria label");
 if(!inside(cb,tb)||label.scrollWidth>label.clientWidth+2||label.scrollHeight>label.clientHeight+2)errors.push("caption clipped");
 if(!inside(ab,tb))errors.push("arrow clipped");
 if(lines.some(r=>intersect(r,ab,1)))errors.push("caption overlaps arrow");
 if(!inside(gb,tb))errors.push("gear clipped");
 if(intersect(gb,ab,1)||lines.some(r=>intersect(r,gb,1)))errors.push("gear overlaps text/arrow");
 if(skyShown){
  if(!inside(mb,tb))errors.push("moon clipped");
  if(intersect(mb,ab,1)||lines.some(r=>intersect(r,mb,1)))errors.push("moon overlaps text/arrow");
  for(const s of stars){const sb=box(s);if(!inside(sb,tb))errors.push("star clipped");if(lines.some(r=>intersect(r,sb,1)))errors.push("star overlaps caption");}
 }
 if(parseFloat(arrowStyle.borderTopWidth)<1||parseFloat(arrowStyle.borderTopLeftRadius)>12)errors.push("arrow not square");
 if(!arrowStyle.color.includes("244, 240, 233"))errors.push("arrow color unexpected "+arrowStyle.color);
 if(!tileStyle.backgroundImage.includes("radial-gradient"))errors.push("grain texture missing");
 if(theme==="light"&&tileStyle.backgroundColor!=="rgb(41, 37, 34)")errors.push("light card background unexpected");
 if(theme==="dark"&&tileStyle.backgroundColor!=="rgb(33, 30, 29)")errors.push("dark card background unexpected");
 if(labelStyle.whiteSpace!=="nowrap")errors.push("caption must be one line");
 if(tileStyle.position!=="relative")errors.push("tile geometry unexpected");
 return {errors,viewport:[innerWidth,innerHeight],theme,skyShown,tile:tb,caption:cb,arrow:ab,gear:gb,moon:mb,background:tileStyle.backgroundColor,textColor:labelStyle.color};
}
let server,browser,temporary,ws,problem=null;
const output=new URL("../reports/theme-v13-candidate/",import.meta.url);
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
   ready=await evaluate(send,"document.readyState==='complete'&&!!document.querySelector('.tile--theme')").catch(()=>false);
   if(ready)break;await delay(100);
  }
  assert.ok(ready,"NO-GO: site did not load "+width+"x"+height);
  await delay(120);
  // The approved compact fallback deliberately scrolls at heights <=400 CSS px.
  // Bring the live toggle into view rather than falsely reporting an offscreen tile as clipped.
  if(height<=400)await evaluate(send,"document.querySelector('.tile--theme').scrollIntoView({block:'center',behavior:'auto'})");
  for(const theme of ["light","dark"]){
   if(theme==="dark"){await evaluate(send,"document.querySelector('#themeButton').click()");await delay(220)}
   const m=await evaluate(send,"("+measureTheme.toString()+")()");
   if(theme!==m.theme)m.errors.push("theme switching failed");
   if(theme==="dark"&&m.background!=="rgb(33, 30, 29)")m.errors.push("dark card background mismatch");
   const screenshot=await send("Page.captureScreenshot",{format:"png",fromSurface:true});
   const file=theme+"-"+width+"x"+height+".png";
   await writeFile(new URL(file,output),Buffer.from(screenshot.data,"base64"));
   records.push({file,...m});
   console.log("THEME-V13 "+width+"x"+height+" "+theme+" "+(m.errors.length?"FAIL "+m.errors.join("; "):"PASS"));
  }
 }
 await writeFile(new URL("manifest.json",output),JSON.stringify({mode:"LOCAL_ONLY_NO_DEPLOY",screenshots:records.length,results:records},null,2)+"\n");
 const bad=records.filter(x=>x.errors.length);
 if(bad.length)throw Error("THEME-V13 NO-GO: "+bad.length+" viewport/theme failures. See manifest.json.");
}catch(e){problem=e}
finally{await finishBrowserAudit({ws,browser,server,temporary},problem)}
console.log("THEME-V13 PASS: 13 viewports, light/dark, 26 captures, no text or symbol overlaps; aria and toggle preserved.");
