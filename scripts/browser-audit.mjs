import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.env.DESSET_BROWSER_DIST === "1" ? new URL("../dist/", import.meta.url) : new URL("../", import.meta.url);
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/styles-compact.css", ["styles-compact.css", "text/css; charset=utf-8"]],
  ["/src/app.mjs", ["src/app.mjs", "text/javascript; charset=utf-8"]],
  ["/src/content.mjs", ["src/content.mjs", "text/javascript; charset=utf-8"]],
  ["/assets/deliver-assets-mark.png", ["assets/deliver-assets-mark.png", "image/png"]],
  ["/assets/city-network.svg", ["assets/city-network.svg", "image/svg+xml"]],
  ["/assets/roles-geometry-v2.svg", ["assets/roles-geometry-v2.svg", "image/svg+xml"]]
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
async function connectChrome(browser, dir) {
  const marker = join(dir, "DevToolsActivePort");
  let port;
  for (let i = 0; i < 100; i++) {
    if (existsSync(marker)) {
      port = Number((await readFile(marker, "utf8")).split("\n")[0]);
      break;
    }
    if (browser.exitCode !== null) throw new Error("Chrome terminó antes de abrir DevTools");
    await delay(100);
  }
  assert.ok(port > 0, "Chrome no creó DevToolsActivePort");
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
  if (response.exceptionDetails) throw new Error("Runtime exception: " + response.exceptionDetails.text);
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
  assert.ok(Math.abs(metrics.site.width - width) <= tolerance, label + ": contenedor no cubre el ancho");
  assert.ok(Math.abs(metrics.board.x) <= tolerance && Math.abs(metrics.board.right-width) <= tolerance, label + ": Bento deja márgenes externos");
  assert.ok(metrics.pageScroll[0] <= width+tolerance && metrics.pageScroll[2] <= width+tolerance, label + ": scroll horizontal");
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
const output = new URL(process.env.DESSET_BROWSER_DIST === "1" ? "../reports/browser-dist/" : "../reports/browser/", import.meta.url);
let server, browser, ws, temporary;
const failures = [];
try {
  const local = await serve(); server = local.server;
  temporary = await mkdtemp(join(tmpdir(), "desset-browser-"));
  browser = spawn(findChrome(), [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--remote-debugging-port=0", "--user-data-dir=" + temporary, "about:blank"
  ], { stdio: "ignore" });
  const connected = await connectChrome(browser, temporary);
  ws = connected.ws;
  const send = connected.send;
  await send("Page.enable");
  await send("Runtime.enable");
  await mkdir(output, { recursive: true });
  for (const [width, height] of viewports) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, mobile: width <= 640, deviceScaleFactor: 1 });
    await send("Page.navigate", { url: local.url });
    for (let attempt = 0; attempt < 60; attempt++) {
      const ready = await evalBrowser(send, "document.readyState === 'complete' && Boolean(document.querySelector('.board'))");
      if (ready) break;
      await delay(100);
    }
    await delay(120);
    const primary = await evalBrowser(send, "(" + measure.toString() + ")()");
    if(height<=400){
      const compact=await evalBrowser(send,"(function(){const sheet=[...document.styleSheets].find(s=>s.href?.includes('styles-compact.css'));const nav=document.querySelector('.mobile-nav');return {loaded:!!sheet,overflow:getComputedStyle(document.documentElement).overflowY,nav:getComputedStyle(nav).position};})()");
      if(!compact.loaded||compact.overflow!=="auto"||(width<=640&&compact.nav!=="fixed"))failures.push(width+"x"+height+": modo compacto no operativo: "+JSON.stringify(compact));
    }
    const label = width + "x" + height + "-home";
    const seo = await evalBrowser(send,"(function(){const canonical=document.querySelector('link[rel=canonical]');const robots=document.querySelector('meta[name=robots]');return {canonical:canonical?.href??null,robots:robots?.content??null};})()");
    if(process.env.DESSET_BROWSER_DIST==="1"){
      if(seo.canonical!=="https://desset.lat/"||seo.robots?.includes("noindex"))failures.push(label+": paquete publicado con canonical o robots incorrecto "+JSON.stringify(seo));
    }else{
      if(seo.canonical!==null||seo.robots!=="noindex,nofollow")failures.push(label+": previsualización indexable por error "+JSON.stringify(seo));
    }

    try { (height<=400?checkCompactMetrics:checkMetrics)(primary, label); } catch (error) { failures.push(error.message); }
    console.log(JSON.stringify({ label, ...primary }));
    const capture = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
    await writeFile(new URL(label + ".png", output), Buffer.from(capture.data, "base64"));
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
    const dialogOverflow = await evalBrowser(send, "(function(){const bad=[];for(const trigger of document.querySelectorAll('[data-detail]')){trigger.click();const d=document.querySelector('#detailDialog');const p=d.querySelector('.dialog-content');if(!d.open||p.scrollHeight>p.clientHeight+2)bad.push(trigger.dataset.detail);d.close();}return bad;})()");
    if (dialogOverflow.length) failures.push(label + ": diálogos recortados: " + dialogOverflow.join(","));
    await evalBrowser(send, "document.querySelector('[data-detail=company]').click()");
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
      console.log(JSON.stringify({label:label+"-keyboard",focus:focused,enter:keyboardOpened,escape:keyboardClosed}));
    }
    if (width <= 640) {
      const legend = await evalBrowser(send, "(function(){const tile=document.querySelector('.tile--visual'),cap=tile.querySelector('.visual-caption'),el=tile.querySelector('.role-legend'),labels=[...el.children];const a=el.getBoundingClientRect(),b=cap.getBoundingClientRect();return {count:labels.length,display:getComputedStyle(el).display,minFont:Math.min(...labels.map(x=>parseFloat(getComputedStyle(x).fontSize))),truncated:labels.some(x=>x.scrollWidth>x.clientWidth+2||x.scrollHeight>x.clientHeight+2),overlap:a.bottom>b.top+2,tileOverflow:a.left<tile.getBoundingClientRect().left-1||a.right>tile.getBoundingClientRect().right+1};})()");
      if(legend.count!==4||legend.display!=="grid"||legend.minFont<10||legend.truncated||legend.overlap||legend.tileOverflow) failures.push(label+": leyenda móvil ilegible o solapada: "+JSON.stringify(legend));
      console.log(JSON.stringify({label:label+"-roles",...legend}));
      const switched = await evalBrowser(send, "(function(){document.querySelector('[data-view-button=sections]').click();return document.querySelector('#board').dataset.view==='sections' && getComputedStyle(document.querySelector('.tile--journal')).display!=='none';})()");
      if (!switched) failures.push(label + ": navegación móvil no funciona");
      const secondary = await evalBrowser(send, "(" + measure.toString() + ")()");
      try { (height<=400?checkCompactMetrics:checkMetrics)(secondary, width + "x" + height + "-sections"); } catch (error) { failures.push(error.message); }
      console.log(JSON.stringify({ label: width + "x" + height + "-sections", ...secondary }));
      const secondCapture = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(new URL(width + "x" + height + "-sections.png", output), Buffer.from(secondCapture.data, "base64"));
    }
  }
  if (failures.length) {
    console.error("AUDITORÍA VISUAL: FALLÓ\n" + failures.join("\n"));
    process.exitCode = 1;
  } else console.log("AUDITORÍA VISUAL: APROBADA (" + viewports.length + " tamaños, modalidades y capturas)");
} finally {
  ws?.close();
  if (browser) browser.kill("SIGKILL");
  if (server) await new Promise(resolve => server.close(resolve));
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
