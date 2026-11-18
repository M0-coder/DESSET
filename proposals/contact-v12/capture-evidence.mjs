/**
 * Contact-V12 preview-only Chrome evidence: 13 viewports x 2 modes.
 * All networking binds to 127.0.0.1; no publishing API or credentials.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { launchChromeWithRetry } from "../../scripts/chrome-startup.mjs";
import { finishBrowserAudit } from "../../scripts/browser-cleanup.mjs";
import { buildPreview } from "./build-preview.mjs";

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const viewports=[
  [1920,1080],[1440,900],[1280,720],[1280,600],[1024,768],[768,900],
  [390,844],[375,667],[360,740],[320,568],[768,320],[390,320],[320,256]
];
const siteFiles=new Map([
  ["index.html","text/html;charset=utf-8"],["styles.css","text/css;charset=utf-8"],
  ["styles-compact.css","text/css;charset=utf-8"],
  ["src/app.mjs","text/javascript;charset=utf-8"],
  ["src/content.mjs","text/javascript;charset=utf-8"],
  ["assets/deliver-assets-mark.png","image/png"],
  ["assets/roles-geometry-v2.svg","image/svg+xml"],
  ["assets/desset-eye.gif","image/gif"],
  ["assets/desset-eye-still.png","image/png"],
  ["assets/contact-terminal-v12.svg","image/svg+xml"],
  ["contact-preview.css","text/css;charset=utf-8"],
]);
function chromeBinary(){
  for(const path of [process.env.CHROME_BIN,"google-chrome-stable","google-chrome","chromium"].filter(Boolean)){
    if(spawnSync(path,["--version"],{encoding:"utf8",timeout:3000}).status===0)return path;
  }
  throw new Error("NO-GO: Chrome absent");
}
async function connected(port){
  let target;
  for(let n=0;n<60;n++){
    const pages=await fetch("http://127.0.0.1:"+port+"/json/list").then(r=>r.json()).catch(()=>[]);
    target=pages.find(x=>x.type==="page");
    if(target)break;
    await wait(100);
  }
  assert.ok(target?.webSocketDebuggerUrl,"Chrome tab absent");
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});
  });
  let seq=0;const tasks=new Map();
  ws.addEventListener("message",event=>{
    const value=JSON.parse(event.data),item=tasks.get(value.id);
    if(!item)return;tasks.delete(value.id);
    if(value.error)item.reject(new Error(value.error.message));
    else item.resolve(value.result);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;const timer=setTimeout(()=>{tasks.delete(id);reject(new Error("CDP timeout: "+method));},20000);
    tasks.set(id,{
      resolve:r=>{clearTimeout(timer);resolve(r);},
      reject:e=>{clearTimeout(timer);reject(e);}
    });
    ws.send(JSON.stringify({id,method,params}));
  });
  return {ws,send};
}
async function evaluate(send,expression){
  const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails)throw new Error("Chrome evaluation: "+
    String(r.exceptionDetails.exception?.description||r.exceptionDetails.text));
  return r.result.value;
}
function measure(){
  const tile=document.querySelector(".tile--contact");
  const title=tile.querySelector(".tile-title");
  const arrow=tile.querySelector(".tile-arrow");
  const pc=tile.querySelector(".contact-v12-computer");
  const cross=tile.querySelector(".contact-v12-cross");
  const labelRange=document.createRange();
  labelRange.selectNodeContents(title);
  const rect=e=>{
    const r=e.getBoundingClientRect();
    return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  };
  const t=rect(tile),h=rect(title),a=rect(arrow);
  const image=pc?rect(pc):null;
  const ink=rect(labelRange);
  const crossBox=cross?rect(cross):null;
  // Image object-fit:contain: measure the visible art, not its transparent layout box.
  const ratio=pc?.naturalWidth&&pc?.naturalHeight?pc.naturalWidth/pc.naturalHeight:0;
  const visibleWidth=image&&ratio?Math.min(image.width,image.height*ratio):0;
  const visibleHeight=ratio?visibleWidth/ratio:0;
  const computerInk=image&&ratio?{
    x:image.x+(image.width-visibleWidth)/2,
    y:image.y+(image.height-visibleHeight)/2,
    right:image.x+(image.width+visibleWidth)/2,
    bottom:image.y+(image.height+visibleHeight)/2
  }:null;
  const intersects=(one,two,padding=0)=>one&&two &&
    one.x<two.right+padding&&one.right>two.x-padding&&
    one.y<two.bottom+padding&&one.bottom>two.y-padding;
  const inkOverlap=Boolean(intersects(ink,computerInk,2));
  const computerArrowOverlap=Boolean(intersects(computerInk,a,2));
  const titleArrowOverlap=Boolean(intersects(ink,a,2));
  const crossArt=crossBox?{
    x:crossBox.x-7,y:crossBox.y-7,
    right:crossBox.right+7,bottom:crossBox.bottom+7
  }:null;
  const crossShown=cross?getComputedStyle(cross).display!=="none":false;
  const crossOverlap=crossShown&&Boolean(intersects(crossArt,ink,2) || intersects(crossArt,computerInk,2) ||
    intersects(crossArt,a,2));
  const insetBorder=getComputedStyle(tile,"::before");
  const baseColor=getComputedStyle(tile).backgroundColor;
  const titleColor=getComputedStyle(title).color;
  const visible=getComputedStyle(tile).display!=="none" && tile.getClientRects().length>0;
  return {
    viewport:[innerWidth,innerHeight],visible,view:document.querySelector(".board").dataset.view,
    tile:t,title:h,arrow:a,image,
    titleInk:ink,computerInk,crossArt,crossShown,
    titleComputerOverlap:inkOverlap,computerArrowOverlap,titleArrowOverlap,crossOverlap,
    hasInsetBorder:insetBorder.content!=="none" &&
      insetBorder.borderTopStyle==="solid" && parseFloat(insetBorder.borderTopWidth)>=1,
    theme:document.body.dataset.theme,titleColor,baseColor,
    labelPresent:tile.textContent.includes("CONTACTO / 01"),
    expectedText:tile.textContent.includes("CANALES")&&tile.textContent.includes("OFICIALES."),
    buttonDetail:tile.getAttribute("data-detail"),
    titleClipped:title.scrollWidth>title.clientWidth+2 || title.scrollHeight>title.clientHeight+2 ||
      h.x<t.x-2 || h.right>t.right+2 || h.y<t.y-2 || h.bottom>t.bottom+2,
    arrowClipped:a.x<t.x-2 || a.right>t.right+2 || a.y<t.y-2 || a.bottom>t.bottom+2,
    computer:pc?{complete:pc.complete,naturalWidth:pc.naturalWidth,
      naturalHeight:pc.naturalHeight,source:pc.getAttribute("src")}:null,
    documentScroll:[document.documentElement.scrollWidth,document.body.scrollWidth],
    css:getComputedStyle(tile).backgroundColor
  };
}
const preview=await buildPreview("reports/contact-v12-preview");
await mkdir("reports/contact-v12-evidence",{recursive:true});
let server,browser,ws,temporary,primaryError,results=[];
try{
  server=createServer(async(req,res)=>{
    const url=new URL(req.url,"http://localhost");
    const match=/^\/(baseline|candidate)\/(.*)$/.exec(url.pathname);
    if(!match){res.writeHead(404);res.end();return;}
    const [_,mode,requested]=match;
    const path=requested||"index.html";
    if(!siteFiles.has(path)||(mode==="baseline" &&
      (path==="contact-preview.css"||path==="assets/contact-terminal-v12.svg"))){
      res.writeHead(404);res.end();return;
    }
    try{
      const bytes=await readFile(join(preview[mode],path));
      res.writeHead(200,{"content-type":siteFiles.get(path),"cache-control":"no-store","x-robots-tag":"noindex,nofollow"});
      res.end(bytes);
    }catch(error){
      console.error("PREVIEW HTTP ERROR",path,error.code||error.name);
      res.writeHead(500);res.end();
    }
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const local="http://127.0.0.1:"+server.address().port+"/";
  const launched=await launchChromeWithRetry(chromeBinary());
  browser=launched.browser;temporary=launched.temporary;
  const connectedBrowser=await connected(launched.port);
  ws=connectedBrowser.ws;
  const send=connectedBrowser.send;
  await send("Page.enable");await send("Runtime.enable");
  for(const [width,height] of viewports){
    for(const mode of ["baseline","candidate"]){
      await send("Emulation.setDeviceMetricsOverride",{width,height,mobile:width<=640,deviceScaleFactor:1});
      const nav=await send("Page.navigate",{url:local+mode+"/"});
      assert.ok(!nav.errorText,"NO-GO navigation "+width+"x"+height+" "+mode+": "+nav.errorText);
      let ready=false;
      for(let attempt=0;attempt<120;attempt++){
        ready=await evaluate(send,"document.readyState==='complete'&&!!document.querySelector('.board')").catch(()=>false);
        if(ready)break;await wait(100);
      }
      assert.ok(ready,"NO-GO: preview board did not load "+mode+" "+width+"x"+height);
      await wait(120);
      if(width<=640)
        await evaluate(send,"document.querySelector('[data-view-button=sections]').click()");
      const m=await evaluate(send,"("+measure.toString()+")()");
      assert.ok(m.visible,"NO-GO: contact tile invisible "+mode+" "+width+"x"+height);
      assert.ok(m.expectedText&&m.buttonDetail==="contact","NO-GO: contact action lost");
      assert.ok(!m.titleClipped && !m.arrowClipped,
        "NO-GO: title or button clipped "+mode+" "+width+"x"+height+": "+JSON.stringify(m));
      if(mode==="candidate"){
        assert.equal(m.theme,"light","NO-GO: candidate wrong initial theme");
        assert.ok(m.hasInsetBorder,"NO-GO: original reference's fine inset border missing");
        assert.ok(!m.titleComputerOverlap&&!m.computerArrowOverlap&&
          !m.titleArrowOverlap&&!m.crossOverlap,
          "NO-GO: overlapping text, illustration, cross or arrow "+
          width+"x"+height+": "+JSON.stringify(m));
        assert.equal(m.labelPresent,false,"NO-GO: redundant Contacto / 01 present");
        assert.ok(m.computer?.complete && m.computer.naturalWidth>0 && m.computer.naturalHeight>0 &&
          Math.abs(m.computer.naturalWidth/m.computer.naturalHeight - 180/130)<0.02,
          "NO-GO: retro computer SVG unavailable or distorted "+width+"x"+height+": "+JSON.stringify(m.computer));
        assert.ok(m.image.x>=m.tile.x-2 && m.image.right<=m.tile.right+2,
          "NO-GO: computer outside contact tile "+width+"x"+height);
      }else assert.ok(m.labelPresent,"NO-GO: baseline changed");
      // The card must still open exactly its existing official channels dialog.
      const dialog=await evaluate(send,"(function(){document.querySelector('.tile--contact').click();const d=document.querySelector('#detailDialog');const ok=d.open && d.querySelector('#detailTitle')?.textContent?.length>0;d.close();return ok;})()");
      assert.ok(dialog,"NO-GO: contact dialog no longer works "+mode+" "+width+"x"+height);
      if(mode==="candidate" && ((width===1440&&height===900)||
          (width===390&&height===844)||(width===320&&height===256))){
        await evaluate(send,"document.querySelector('#themeButton').click()");
        // .tile--button has a 160ms background-color transition; inspect its settled state.
        await wait(240);
        const dark=await evaluate(send,
          "(function(){const t=document.querySelector('.tile--contact');const h=t.querySelector('.contact-v12-title');const b=getComputedStyle(t,'::before');return {theme:document.body.dataset.theme,bg:getComputedStyle(t).backgroundColor,text:getComputedStyle(h).color,border:b.borderTopColor,visible:getComputedStyle(t).display!=='none',imageLoaded:t.querySelector('img')?.complete};})()");
        assert.ok(dark.theme==="dark"&&dark.visible&&dark.imageLoaded&&
          dark.text==="rgb(244, 240, 235)"&&dark.bg==="rgb(53, 53, 53)" &&
          dark.border==="rgba(233, 228, 217, 0.6)",
          "NO-GO: dark-mode contact palette or fine border failed "+JSON.stringify(dark));
        const darkPng=await send("Page.captureScreenshot",{format:"png",fromSurface:true});
        await writeFile(join("reports/contact-v12-evidence",
          "candidate-dark-"+width+"x"+height+".png"),Buffer.from(darkPng.data,"base64"));
        await evaluate(send,"document.querySelector('#themeButton').click()");
        await wait(240);
      }
      const capture=await send("Page.captureScreenshot",{format:"png",fromSurface:true});
      const filename=mode+"-"+width+"x"+height+".png";
      await writeFile(join("reports/contact-v12-evidence",filename),Buffer.from(capture.data,"base64"));
      results.push({mode,viewport:[width,height],screenshot:filename,
        action_ok:dialog,label_present:m.labelPresent,title_clipped:m.titleClipped,
        arrow_clipped:m.arrowClipped,computer_ok:mode==="baseline"?null:m.computer.complete});
    }
    console.log("CONTACT-V12 viewport PASS: "+width+"x"+height+" baseline and candidate");
  }
  await writeFile("reports/contact-v12-evidence/manifest.json",
    JSON.stringify({status:"PREVIEW_ONLY_NO_DEPLOY",source:preview.source_sha,results},null,2)+"\n");
}catch(error){primaryError=error;
}finally{
  await finishBrowserAudit({ws,browser,server,temporary},primaryError);
}
console.log("CONTACT-V12 PREVIEW PASS: 13 viewports, 29 screenshots incl 3 dark-mode shots, zero overlap, contact dialog preserved.");
