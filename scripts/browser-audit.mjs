import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { launchChromeWithRetry } from "./chrome-startup.mjs";
import { finishBrowserAudit } from "./browser-cleanup.mjs";
import { readFileSync } from "node:fs";
import { STYLESHEET_PATHS, versionedStylesheetUrl } from "./cache-version.mjs";

const browserModes = ["DESSET_BROWSER_DIST","DESSET_BROWSER_CLOUDFLARE","DESSET_BROWSER_CF_RELEASE"].filter(key=>process.env[key]==="1");
if(browserModes.length>1)throw Error("Modos de navegador incompatibles");
const requireVersionedCss = process.env.DESSET_BROWSER_DIST === "1" || process.env.DESSET_BROWSER_CF_RELEASE === "1";
const expectedCssUrls = requireVersionedCss
  ? STYLESHEET_PATHS.map(path => versionedStylesheetUrl(path, readFileSync(new URL("../" + path, import.meta.url))))
  : [];
const root = process.env.DESSET_BROWSER_CF_RELEASE === "1" ? new URL("../dist-cloudflare-release-candidate/", import.meta.url) : process.env.DESSET_BROWSER_CLOUDFLARE === "1" ? new URL("../dist-cloudflare-stage/", import.meta.url) : process.env.DESSET_BROWSER_DIST === "1" ? new URL("../dist/", import.meta.url) : new URL("../", import.meta.url);
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/styles-compact.css", ["styles-compact.css", "text/css; charset=utf-8"]],
  ["/src/app.mjs", ["src/app.mjs", "text/javascript; charset=utf-8"]],
  ["/src/content.mjs", ["src/content.mjs", "text/javascript; charset=utf-8"]],
  ["/assets/deliver-assets-mark.png", ["assets/deliver-assets-mark.png", "image/png"]],
  ["/assets/roles-geometry-v2.svg", ["assets/roles-geometry-v2.svg", "image/svg+xml"]],
  ["/assets/desset-eye.gif", ["assets/desset-eye.gif", "image/gif"]],
  ["/assets/desset-eye-still.png", ["assets/desset-eye-still.png", "image/png"]]
]);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function findChrome() {
  const choices = [process.env.CHROME_BIN, "google-chrome-stable", "google-chrome", "chromium", "chromium-browser"].filter(Boolean);
  for (const binary of choices) {
    const probe = spawnSync(binary, ["--version"], { encoding: "utf8", timeout: 4000 });
    if (probe.status === 0) return binary;
  }
  throw new Error("No se encontró Chrome/Chromium para la auditoría instrumentada");
}
async function serve() {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = files.get(pathname);
    if (!file) { response.writeHead(404); response.end("Not found"); return; }
    try {
      const bytes = await readFile(new URL(file[0], root));
      response.writeHead(200, { "content-type": file[1], "x-content-type-options": "nosniff", "cache-control": "no-store" });
      response.end(bytes);
    } catch {
      response.writeHead(500); response.end("Missing file");
    }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { server, url: "http://127.0.0.1:" + server.address().port + "/" };
}
async function connectChrome(port) {
  assert.ok(Number.isInteger(port) && port > 0 && port <= 65535,
    "NO-GO: puerto de depuración Chrome fuera de rango");
  let target;
  for (let i = 0; i < 50; i++) {
    const pages = await fetch("http://127.0.0.1:" + port + "/json/list").then(r => r.json()).catch(() => []);
    target = pages.find(p => p.type === "page");
    if (target) break;
    await delay(100);
  }
  assert.ok(target?.webSocketDebuggerUrl, "No hay pestaña Chrome para ejecutar pruebas");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const item = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message));
    else item.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Chrome DevTools agotó el tiempo: " + method));
    }, 15000);
    pending.set(id, {
      resolve: val => { clearTimeout(timeout); resolve(val); },
      reject: err => { clearTimeout(timeout); reject(err); }
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { ws, send };
}
async function evalBrowser(send, expression) {
  const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) {
    const detail = response.exceptionDetails;
    const description = detail.exception?.description ?? detail.exception?.value ?? detail.text;
    throw new Error("Runtime exception: " + String(description).slice(0, 1200));
  }
  return response.result.value;
}
function measure() {
  const rect = element => {
    const r = element.getBoundingClientRect();
    return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  const board = document.querySelector(".board");
  const site = document.querySelector(".site");
  const tileList = [...document.querySelectorAll(".tile")].filter(tile => {
    const c = getComputedStyle(tile);
    return c.display !== "none" && c.visibility !== "hidden";
  });
  const clipped = [];
  const contents = ".intro-top,.intro-main,.intro-bottom,.eyebrow,.intro-main h1,.intro-main h1 span,.intro-lead,.text-action,.tile-label,.tile-title,.tile-sub,.status-line,.theme-caption,.visual-caption,.mini-strip,.app-strip";
  for (const tile of tileList) {
    const parent = rect(tile);
    if (tile.scrollHeight > tile.clientHeight + 2) clipped.push(tile.className + " (alto interno)");
    for (const element of tile.querySelectorAll(contents)) {
      if (getComputedStyle(element).display === "none") continue;
      const r = rect(element);
      if (r.width === 0 || r.height === 0) continue;
      if (r.x < parent.x - 2 || r.right > parent.right + 2 || r.y < parent.y - 2 || r.bottom > parent.bottom + 2 || element.scrollWidth > element.clientWidth + 2) {
        clipped.push(tile.className + " > " + (element.className || element.tagName));
      }
    }
  }
  return {
    viewport: [innerWidth, innerHeight],
    usableWidth: document.documentElement.clientWidth,
    pageScroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight, document.body.scrollWidth, document.body.scrollHeight],
    site: rect(site),
    board: rect(board),
    boardPadding: getComputedStyle(board).padding,
    visibleTiles: tileList.length,
    clipped: [...new Set(clipped)],
    brokenImages: [...document.querySelectorAll("img")].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute("src")),
    view: board.dataset.view
  };
}
function checkMetrics(metrics, label) {
  const [width, height] = metrics.viewport;
  const tolerance = 1.5;
  assert.ok(Math.abs(metrics.site.x) <= tolerance && Math.abs(metrics.site.y) <= tolerance, label + ": contenedor no empieza en (0,0)");
  assert.ok(Math.abs(metrics.site.width - width) <= tolerance && Math.abs(metrics.site.height - height) <= tolerance, label + ": contenedor no ocupa el viewport");
  assert.ok(Math.abs(metrics.board.x) <= tolerance && Math.abs(metrics.board.right - width) <= tolerance, label + ": el tablero deja márgenes externos");
  assert.ok(metrics.pageScroll[0] <= width + tolerance && metrics.pageScroll[1] <= height + tolerance, label + ": scroll del documento");
  assert.ok(metrics.pageScroll[2] <= width + tolerance && metrics.pageScroll[3] <= height + tolerance, label + ": scroll del body");
  assert.deepEqual(metrics.brokenImages, [], label + ": imágenes no cargadas");
  assert.deepEqual(metrics.clipped, [], label + ": contenido recortado");
}
function checkCompactMetrics(metrics, label) {
  const [width, height] = metrics.viewport;
  const tolerance = 2;
  assert.ok(Math.abs(metrics.site.x) <= tolerance, label + ": el contenedor horizontal se movió");
  assert.ok(Math.abs(metrics.site.width - metrics.usableWidth) <= tolerance, label + ": contenedor no cubre el ancho disponible");
  assert.ok(Math.abs(metrics.board.x) <= tolerance && Math.abs(metrics.board.right-metrics.usableWidth) <= tolerance, label + ": Bento deja márgenes externos");
  assert.ok(metrics.pageScroll[0] <= metrics.usableWidth+tolerance && metrics.pageScroll[2] <= metrics.usableWidth+tolerance, label + ": scroll horizontal");
  assert.ok(Math.max(metrics.pageScroll[1],metrics.pageScroll[3]) > height+48, label + ": no hay desplazamiento vertical para recuperar contenido");
  assert.ok(metrics.board.height > height+48, label + ": altura de contenido insuficiente");
  assert.deepEqual(metrics.brokenImages, [], label + ": activos no cargados");
  assert.deepEqual(metrics.clipped, [], label + ": hay contenido recortado dentro de tarjetas");
}
const viewports = [
  [1920, 1080], [1440, 900], [1280, 720], [1280, 600], [1024, 768], [768, 900],
  [390, 844], [375, 667], [360, 740], [320, 568],
  [768, 320], [390, 320], [320, 256]
];
const output = new URL(process.env.DESSET_BROWSER_CF_RELEASE === "1" ? "../reports/browser-cloudflare-release/" : process.env.DESSET_BROWSER_CLOUDFLARE === "1" ? "../reports/browser-cloudflare-stage/" : process.env.DESSET_BROWSER_DIST === "1" ? "../reports/browser-dist/" : "../reports/browser/", import.meta.url);
let server, browser, ws, temporary;
let primaryError;
const failures = [];
try {
  const local = await serve(); server = local.server;
  // Retry only the local Chrome startup handshake, never a failed visual assertion.
  const launched = await launchChromeWithRetry(findChrome());
  browser = launched.browser;
  temporary = launched.temporary;
  const connected = await connectChrome(launched.port);
  ws = connected.ws;
  const send = connected.send;
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Profiler.enable");
  await send("Profiler.startPreciseCoverage", {callCount:true,detailed:true});
  await mkdir(output, { recursive: true });
  for (const [width, height] of viewports) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, mobile: width <= 640, deviceScaleFactor: 1 });
    const navigation = await send("Page.navigate", { url: local.url });
    if (navigation.errorText)
      throw new Error("NO-GO: navegación local falló " + width + "x" + height + ": " + navigation.errorText);
    let boardReady = false;
    for (let attempt = 0; attempt < 150; attempt++) {
      boardReady = await evalBrowser(send, "document.readyState === 'complete' && Boolean(document.querySelector('.board'))");
      if (boardReady) break;
      await delay(100);
    }
    if (!boardReady) {
      const info = await evalBrowser(send,
        "(function(){return {url:location.href,readyState:document.readyState,hasSite:!!document.querySelector('.site'),hasBoard:!!document.querySelector('.board'),title:document.title};})()")
        .catch(error => ({ diagnosticError: error.message }));
      throw new Error("NO-GO: tablero Bento no cargó en Chrome tras 15 segundos " +
        width + "x" + height + ": " + JSON.stringify(info));
    }
    await delay(120);
    // Check the production HTML actually loaded the content-addressed CSS URL.
    if (requireVersionedCss) {
      const cssState = await evalBrowser(send, "(function(){return {hrefs:[...document.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href')),grid:getComputedStyle(document.querySelector('.intro-main')).display};})()");
      if (cssState.grid !== "grid" || !expectedCssUrls.every(url => cssState.hrefs.includes(url)))
        failures.push(width + "x" + height + ": production CSS cache contract failed: " + JSON.stringify(cssState));
    }
    const primary = await evalBrowser(send, "(" + measure.toString() + ")()");
    if(height<=400){
      const compact=await evalBrowser(send,"(function(){const sheet=[...document.styleSheets].find(s=>s.href?.includes('styles-compact.css'));const nav=document.querySelector('.mobile-nav');return {loaded:!!sheet,overflow:getComputedStyle(document.documentElement).overflowY,nav:getComputedStyle(nav).position};})()");
      if(!compact.loaded||compact.overflow!=="auto"||(width<=640&&compact.nav!=="fixed"))failures.push(width+"x"+height+": modo compacto no operativo: "+JSON.stringify(compact));
    }
    const label = width + "x" + height + "-home";
    const seo = await evalBrowser(send,"(function(){const canonical=document.querySelector('link[rel=canonical]');const robots=document.querySelector('meta[name=robots]');return {canonical:canonical?.href??null,robots:robots?.content??null};})()");
    if(process.env.DESSET_BROWSER_DIST==="1"||process.env.DESSET_BROWSER_CF_RELEASE==="1"){
      if(seo.canonical!=="https://desset.lat/"||seo.robots?.includes("noindex"))failures.push(label+": paquete publicado con canonical o robots incorrecto "+JSON.stringify(seo));
    }else{
      if(seo.canonical!==null||seo.robots!=="noindex,nofollow")failures.push(label+": previsualización indexable por error "+JSON.stringify(seo));
    }

    try { (height<=400?checkCompactMetrics:checkMetrics)(primary, label); } catch (error) { failures.push(error.message); }
    const semantics = await evalBrowser(send, "(function(){const visible=[...document.querySelectorAll('button')].filter(b=>{const s=getComputedStyle(b);return s.display!=='none'&&s.visibility!=='hidden'&&b.getClientRects().length>0;});const nameless=visible.filter(b=>!(b.getAttribute('aria-label')||b.getAttribute('aria-labelledby')||b.textContent.trim())).map(b=>b.outerHTML.slice(0,95));const d=document.querySelector('#detailDialog');const heading=document.getElementById('detailTitle');return {language:document.documentElement.lang,visibleButtons:visible.length,nameless,dialogLabelled:d.getAttribute('aria-labelledby')===heading.id,dialogDescribed:d.getAttribute('aria-describedby')==='detailBody'};})()");
    if(semantics.language!=="es"||semantics.nameless.length||!semantics.dialogLabelled||!semantics.dialogDescribed) failures.push(label+": semántica accesible incompleta: "+JSON.stringify(semantics));
    console.log(JSON.stringify({label:label+"-a11y-semantics",...semantics}));
    console.log(JSON.stringify({ label, ...primary }));
    const eye = await evalBrowser(send, "(function(){const img=document.querySelector('.intro-eye img'),copy=document.querySelector('.intro-copy'),tile=document.querySelector('.tile--intro');const r=img.getBoundingClientRect(),c=copy.getBoundingClientRect(),t=tile.getBoundingClientRect();return {loaded:img.complete&&img.naturalWidth===496&&img.naturalHeight===499,ratio:r.width/r.height,inside:r.left>=t.left&&r.right<=t.right&&r.top>=t.top&&r.bottom<=t.bottom,separate:r.left>=c.right-1,src:img.currentSrc};})()");
    if(!eye.loaded||!eye.inside||!eye.separate||Math.abs(eye.ratio-496/499)>.01)failures.push(label+": ojo no cargado, deformado o fuera de su espacio "+JSON.stringify(eye));
    console.log(JSON.stringify({label:label+"-eye",...eye}));
    const capture = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
    await writeFile(new URL(label + ".png", output), Buffer.from(capture.data, "base64"));
    if ((width === 1440 && height === 900) || (width === 390 && height === 844)) {
      await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
      let fixed = false;
      for(let attempt=0;attempt<30;attempt++) {
        fixed=await evalBrowser(send,"(function(){const i=document.querySelector('.intro-eye img');return i.complete&&i.naturalWidth===496&&i.currentSrc.endsWith('/assets/desset-eye-still.png');})()");
        if(fixed)break;
        await delay(100);
      }
      if(!fixed)failures.push(label+": reducción de movimiento no selecciona PNG fijo");
      console.log(JSON.stringify({label:label+"-reduced-motion",fixed}));
      await send("Emulation.setEmulatedMedia", {features:[]});
      let animated = false;
      for(let attempt=0;attempt<30;attempt++) {
        animated=await evalBrowser(send,"(function(){const i=document.querySelector('.intro-eye img');return i.complete&&i.naturalWidth===496&&i.currentSrc.endsWith('/assets/desset-eye.gif');})()");
        if(animated)break;
        await delay(100);
      }
      if(!animated)failures.push(label+": no se recuperó el GIF tras desactivar reducción de movimiento");
    }
    const changed = await evalBrowser(send, "(function(){document.querySelector('#themeButton').click(); return document.body.dataset.theme==='dark' && document.querySelector('#themeButton').getAttribute('aria-pressed')==='true';})()");
    if (!changed) failures.push(label + ": modo oscuro no se activó");
    const modal = await evalBrowser(send, "(function(){document.querySelector('[data-detail=services]').click();const d=document.querySelector('#detailDialog');const p=d.querySelector('.dialog-content');return {open:d.open,body:document.querySelector('#detailBody').textContent.length,clipped:p.scrollHeight>p.clientHeight+2};})()");
    if (!modal.open || !modal.body || modal.clipped) failures.push(label + ": diálogo vacío o contenido recortado");
    if(height<=400){
      const modalScroll=await evalBrowser(send,"(function(){const d=document.querySelector('#detailDialog');return {scrollable:d.scrollHeight>d.clientHeight+3,overflow:getComputedStyle(d).overflowY};})()");
      if(!modalScroll.scrollable||!["auto","scroll"].includes(modalScroll.overflow))failures.push(label+": diálogo no recuperable mediante desplazamiento "+JSON.stringify(modalScroll));
    }
    await evalBrowser(send, "document.querySelector('#dialogBack').click()");
    const closeButton = await evalBrowser(send, "(function(){document.querySelector('[data-detail=services]').click();const d=document.querySelector('#detailDialog');document.querySelector('.close-button').click();return !d.open;})()");
    if (!closeButton) failures.push(label + ": botón de cerrar diálogo no funciona");
    const dialogOverflow = await evalBrowser(send, "(function(){const bad=[];for(const trigger of document.querySelectorAll('[data-detail]')){trigger.click();const d=document.querySelector('#detailDialog');const p=d.querySelector('.dialog-content');const key=trigger.dataset.detail;const readerClass=key==='project'?'dialog-content--project':key==='company'?'dialog-content--identity':key==='contact'?'dialog-content--channels':null;const accessibleScroll=!!readerClass&&p.classList.contains(readerClass)&&getComputedStyle(p).overflowY==='auto';if(!d.open||(p.scrollHeight>p.clientHeight+2&&!accessibleScroll))bad.push(trigger.dataset.detail);d.close();}return bad;})()");
    if (dialogOverflow.length) failures.push(label + ": diálogos recortados: " + dialogOverflow.join(","));
    const projectReadability = await evalBrowser(send, "(function(){ document.querySelector('[data-detail=project]').click(); const d=document.querySelector('#detailDialog'), shell=d.querySelector('.dialog-shell'), c=d.querySelector('.dialog-content'); const head=d.querySelector('.dialog-top'), foot=d.querySelector('.dialog-bottom'), ps=[...d.querySelectorAll('.project-prose p')]; const target=ps[ps.length-1]; const dr=d.getBoundingClientRect(),sr=shell.getBoundingClientRect(),cr=c.getBoundingClientRect(),hr=head.getBoundingClientRect(),fr=foot.getBoundingClientRect(); const border=parseFloat(getComputedStyle(d).borderBottomWidth)||0; const fullCopy=c.textContent.includes('Una visión para integrar el comercio, los servicios y la logística.')&&c.textContent.includes('reservar espacios y transportar mercancías')&&target?.textContent.endsWith('comerciales y operativas.'); const scrollable=c.scrollHeight>c.clientHeight+2, overflow=getComputedStyle(c).overflowY, before=c.scrollTop; c.scrollTop=c.scrollHeight; const reachedEnd=scrollable&&c.scrollTop>before; const tr=target.getBoundingClientRect(); const visibleEnd=tr.top>=cr.top-3&&tr.bottom<=cr.bottom+3; const headerVisible=hr.top>=dr.top+border-2&&hr.bottom<=cr.top+2; const footerVisible=fr.bottom<=dr.bottom-border+2&&fr.top>=cr.bottom-2; const shellContained=sr.top>=dr.top+border-2&&sr.bottom<=dr.bottom-border+2; const contentContained=cr.top>=sr.top-2&&cr.bottom<=sr.bottom+2; const preservedFont=getComputedStyle(document.querySelector('#detailBody')).fontFamily===getComputedStyle(ps[0]).fontFamily; const label=d.querySelector('.project-prose strong'),accentColor=label?getComputedStyle(label).color:null,bodyColor=getComputedStyle(ps[0]).color; const accentVisible=Boolean(label&&label.textContent==='Nuestra visión'&&accentColor!==bodyColor); const result={open:d.open,paragraphs:ps.length,fullCopy,scrollable,overflow,reachedEnd,visibleEnd,headerVisible,footerVisible,shellContained,contentContained,preservedFont,accentVisible,accentColor}; d.close(); document.querySelector('[data-detail=services]').click(); result.noSpillToOtherDialogs=!d.classList.contains('detail-dialog--project')&&!c.classList.contains('dialog-content--project'); d.close(); return result; })()");
    if(!projectReadability.open||projectReadability.paragraphs!==6||!projectReadability.fullCopy||!projectReadability.scrollable||projectReadability.overflow!=="auto"||!projectReadability.reachedEnd||!projectReadability.visibleEnd||!projectReadability.headerVisible||!projectReadability.footerVisible||!projectReadability.shellContained||!projectReadability.contentContained||!projectReadability.preservedFont||!projectReadability.accentVisible||!projectReadability.noSpillToOtherDialogs)failures.push(label+": proyecto largo no legible o controles recortados: "+JSON.stringify(projectReadability));
    console.log(JSON.stringify({label:label+"-project-readability",...projectReadability}));
    const identityReadability=await evalBrowser(send, "(function(){ document.querySelector('[data-detail=company]').click(); const d=document.querySelector('#detailDialog'); const c=d.querySelector('.dialog-content'), sh=d.querySelector('.dialog-shell'), top=d.querySelector('.dialog-top'), foot=d.querySelector('.dialog-bottom'); const p=[...d.querySelectorAll('.identity-prose p')], last=p[p.length-1], t=d.querySelector('#detailTitle'); const dr=d.getBoundingClientRect(),cr=c.getBoundingClientRect(),sr=sh.getBoundingClientRect(),tr=top.getBoundingClientRect(),fr=foot.getBoundingClientRect(); const border=parseFloat(getComputedStyle(d).borderBottomWidth)||0; const contentComplete=c.textContent.includes('DESSET nace con la convicción')&&c.textContent.includes('ecosistema tecnológico que una personas')&&c.textContent.includes('conexión, confianza y evolución')&&last?.textContent==='DELIVER ASSETS / DESSET — PROYECTO EN DESARROLLO'; const correctHeading=t.textContent==='UNA IDENTIDAD.UNA VISIÓN QUE CONECTA.'&&!!t.querySelector('.identity-accent'); const long=c.scrollHeight>c.clientHeight+2,overflow=getComputedStyle(c).overflowY,gutter=getComputedStyle(c).scrollbarGutter; const initialLast=last?.getBoundingClientRect(); const visibleWithoutScrolling=!!initialLast&&initialLast.top>=cr.top-3&&initialLast.bottom<=cr.bottom+3; const before=c.scrollTop;c.scrollTop=c.scrollHeight; const reached=!long||c.scrollTop>before; const lr=last?.getBoundingClientRect(); const lastVisible=!!lr&&lr.bottom<=cr.bottom+3&&lr.top>=cr.top-3; const shellFits=sr.top>=dr.top+border-2&&sr.bottom<=dr.bottom-border+2; const identityGeometry={dialog:{top:dr.top,bottom:dr.bottom,height:dr.height},shell:{top:sr.top,bottom:sr.bottom,height:sr.height},content:{top:cr.top,bottom:cr.bottom,height:cr.height,scrollHeight:c.scrollHeight,clientHeight:c.clientHeight},border,computed:{dialogHeight:getComputedStyle(d).height,shellHeight:getComputedStyle(sh).height,shellMaxHeight:getComputedStyle(sh).maxHeight},overflowPx:sr.bottom-(dr.bottom-border)}; const controlsFit=tr.top>=dr.top+border-2&&tr.bottom<=cr.top+2&&fr.bottom<=dr.bottom-border+2&&fr.top>=cr.bottom-2; const accent=t.querySelector('.identity-accent'); const blue=!!accent&&getComputedStyle(accent).color!==getComputedStyle(t).color; const noHorizontalOverflow=c.scrollWidth<=c.clientWidth+2; return {open:d.open,paragraphs:p.length,contentComplete,correctHeading,overflow,reached,lastVisible,shellFits,controlsFit,blue,noHorizontalOverflow,scrollable:long,gutter,visibleWithoutScrolling,identityGeometry}; })()");
    if(!identityReadability.open||identityReadability.paragraphs!==4||!identityReadability.contentComplete||!identityReadability.correctHeading||identityReadability.overflow!=="auto"||!identityReadability.reached||!identityReadability.lastVisible||!identityReadability.shellFits||!identityReadability.controlsFit||!identityReadability.blue||!identityReadability.noHorizontalOverflow)failures.push(label+": identidad incompleta o recortada: "+JSON.stringify(identityReadability));
    const desktopFitsWithoutScroll=width>=641&&height>=700;
    if(desktopFitsWithoutScroll&&(identityReadability.scrollable||identityReadability.gutter!=="auto"||!identityReadability.visibleWithoutScrolling))failures.push(label+": IDENTIDAD desktop muestra desplazamiento innecesario: "+JSON.stringify(identityReadability));
    console.log(JSON.stringify({label:label+"-identity-readability",...identityReadability}));

    const channelsReadability=await evalBrowser(send, "(function(){ document.querySelector('[data-detail=contact]').click(); const d=document.querySelector('#detailDialog'),c=d.querySelector('.dialog-content'),shell=d.querySelector('.dialog-shell'),h=d.querySelector('.dialog-top'),f=d.querySelector('.dialog-bottom'); const nav=d.querySelector('nav.channel-links'),links=[...nav?.querySelectorAll('a')||[]]; const names=links.map(x=>x.textContent.replace('↗','').trim()); const urls=links.map(x=>x.getAttribute('href')); const expected=['https://x.com/deliver_assets','https://www.instagram.com/deliver_assets/','https://www.tiktok.com/@deliver_assets','https://www.facebook.com/share/1EtpsZNFwQ/','https://www.youtube.com/@deliver_assets']; const safe=links.every(x=>x.target==='_blank'&&x.rel.includes('noopener')&&x.rel.includes('noreferrer')&&x.getAttribute('aria-label')?.includes('sitio externo')); const rect=d.getBoundingClientRect(),cr=c.getBoundingClientRect(),sr=shell.getBoundingClientRect(),hr=h.getBoundingClientRect(),fr=f.getBoundingClientRect(),bw=parseFloat(getComputedStyle(d).borderBottomWidth)||0; const scrollNeeded=c.scrollHeight>c.clientHeight+2,before=c.scrollTop;c.scrollTop=c.scrollHeight; const scrollReachable=!scrollNeeded||c.scrollTop>before; const last=links.at(-1)?.getBoundingClientRect(),lastVisible=!!last&&last.bottom<=cr.bottom+3&&last.top>=cr.top-3; const headerVisible=hr.top>=rect.top+bw-2&&hr.bottom<=cr.top+2; const footerVisible=fr.top>=cr.bottom-2&&fr.bottom<=rect.bottom-bw+2; const compact=innerHeight<=400; const outerBefore=d.scrollTop; const outerScrollable=d.scrollHeight>d.clientHeight+2; if(compact)d.scrollTop=d.scrollHeight; const footerEndRect=f.getBoundingClientRect(); const outerFooterReachable=compact&&outerScrollable&&d.scrollTop>outerBefore&&footerEndRect.top>=rect.top+bw-2&&footerEndRect.bottom<=rect.bottom-bw+2; const footerAccessible=compact?outerFooterReachable:footerVisible; const allPresent=links.length===5&&names.join('|')==='X|Instagram|TikTok|Facebook|YouTube'&&urls.every((u,i)=>u===expected[i]); const geometry=sr.top>=rect.top+bw-2&&sr.bottom<=rect.bottom-bw+2; const noHorizontalOverflow=c.scrollWidth<=c.clientWidth+2; const result={open:d.open,allPresent,safe,scrollNeeded,scrollReachable,lastVisible,headerVisible,footerVisible,footerAccessible,compact,outerScrollable,outerFooterReachable,geometry,noHorizontalOverflow,overflow:getComputedStyle(c).overflowY}; d.close();return result; })()");
    if(!channelsReadability.open||!channelsReadability.allPresent||!channelsReadability.safe||!channelsReadability.scrollReachable||!channelsReadability.lastVisible||!channelsReadability.headerVisible||!channelsReadability.footerAccessible||!channelsReadability.geometry||!channelsReadability.noHorizontalOverflow||channelsReadability.overflow!=="auto")failures.push(label+": enlaces o geometría de CANALES OFICIALES inválidos: "+JSON.stringify(channelsReadability));
    console.log(JSON.stringify({label:label+"-channels-readability",...channelsReadability}));
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    const escapeClosed = await evalBrowser(send, "!document.querySelector('#detailDialog').open");
    if (!escapeClosed) failures.push(label + ": Escape no cierra el diálogo");
    if ((width === 1440 && height === 900) || (width === 390 && height === 844)) {
      const focused = await evalBrowser(send, "(function(){const b=document.querySelector('[data-detail=project]');b.focus();return document.activeElement===b})()");
      if (!focused) failures.push(label+": el control Proyecto no recibe foco");
      await send("Input.dispatchKeyEvent",{type:"rawKeyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
      await send("Input.dispatchKeyEvent",{type:"char",text:"\r",unmodifiedText:"\r",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
      await send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
      const keyboardOpened=await evalBrowser(send,"document.querySelector('#detailDialog').open");
      if(!keyboardOpened) failures.push(label+": Enter no abre el diálogo del proyecto");
      await send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
      await send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
      const keyboardClosed=await evalBrowser(send,"!document.querySelector('#detailDialog').open");
      if(!keyboardClosed) failures.push(label+": Escape no cierra el diálogo");
      const focusRestored=await evalBrowser(send,"document.activeElement===document.querySelector('[data-detail=project]')");
      if(!focusRestored) failures.push(label+": foco no vuelve al control que abrió el diálogo");
      console.log(JSON.stringify({label:label+"-keyboard",focus:focused,enter:keyboardOpened,escape:keyboardClosed,restored:focusRestored}));
    }
    if (width <= 640) {
      const visual = await evalBrowser(send, "(function(){const tile=document.querySelector('.tile--visual'),cap=tile.querySelector('.visual-caption'),img=tile.querySelector('img'),r=tile.getBoundingClientRect(),c=cap.getBoundingClientRect(),p=img.getBoundingClientRect();return {legendAbsent:!document.querySelector('.role-legend'),captionPresent:cap.textContent.includes('MOVIMIENTO / SISTEMA'),captionInside:c.left>=r.left-1&&c.right<=r.right+1&&c.bottom<=r.bottom+1,imageLoaded:img.complete&&img.naturalWidth>0,imageInside:p.left>=r.left-1&&p.right<=r.right+1&&p.top>=r.top-1&&p.bottom<=r.bottom+1};})()");
      if(!visual.legendAbsent||!visual.captionPresent||!visual.captionInside||!visual.imageLoaded||!visual.imageInside)failures.push(label+": imagen y pie móvil incorrectos tras eliminar leyenda: "+JSON.stringify(visual));
      console.log(JSON.stringify({label:label+"-visual-no-legend",...visual}));
      const switched = await evalBrowser(send, "(function(){document.querySelector('[data-view-button=sections]').click();return document.querySelector('#board').dataset.view==='sections' && getComputedStyle(document.querySelector('.tile--journal')).display!=='none';})()");
      if (!switched) failures.push(label + ": navegación móvil no funciona");
      const secondary = await evalBrowser(send, "(" + measure.toString() + ")()");
      try { (height<=400?checkCompactMetrics:checkMetrics)(secondary, width + "x" + height + "-sections"); } catch (error) { failures.push(error.message); }
      console.log(JSON.stringify({ label: width + "x" + height + "-sections", ...secondary }));
      const secondCapture = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(new URL(width + "x" + height + "-sections.png", output), Buffer.from(secondCapture.data, "base64"));
    }
  }
  const jsCoverage=await send("Profiler.takePreciseCoverage");
  const appScript=(jsCoverage.result||[]).find(x=>x.url?.includes("/src/app.mjs"));
  const appFunctions=appScript?.functions||[];
  const executed=appFunctions.reduce((n,f)=>n+f.ranges.filter(r=>r.count>0).length,0);
  const uncovered=appFunctions.reduce((n,f)=>n+f.ranges.filter(r=>r.count===0).length,0);
  const jsEvidence={script:appScript?.url||null,functions:appFunctions.length,executedRanges:executed,unexecutedRanges:uncovered,method:"Chrome DevTools Profiler precise coverage; do not interpret as complete line/branch coverage"};
  await writeFile(new URL("js-browser-execution-evidence.json",output),JSON.stringify(jsEvidence,null,2)+"\n");
  if(!appScript||!executed)failures.push("JS app.mjs sin evidencia de ejecución real en navegador");
  console.log(JSON.stringify({label:"browser-js-execution",...jsEvidence}));
  if (failures.length) {
    console.error("AUDITORÍA VISUAL: FALLÓ\n" + failures.join("\n"));
    process.exitCode = 1;
  } else console.log("AUDITORÍA VISUAL: APROBADA (" + viewports.length + " tamaños, modalidades y capturas)");
} catch (error) {
  primaryError = error;
} finally {
  await finishBrowserAudit({ ws, browser, server, temporary }, primaryError);
}
