/**
 * HERO-V11: capturas offline de SOLO LECTURA de la línea base y la propuesta.
 * No GitHub API, no secret, no DNS, no wrangler, no publicación, no cambios fuente.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, stat, writeFile } from "node:fs/promises";
import { resolve, join, sep } from "node:path";
import { buildPreview } from "./build-preview.mjs";

const root = resolve("reports/hero-v11-preview");
const evidence = resolve("reports/hero-v11-evidence");
const allowExt = new Map([
  [".html", "text/html; charset=utf-8"],[".css", "text/css; charset=utf-8"],
  [".mjs", "application/javascript"],[".png", "image/png"],
  [".gif", "image/gif"],[".svg", "image/svg+xml"],
]);
const viewports = [
  [1440,900],[1024,768],[390,844],[320,568],
];

async function main() {
  const { baseline, candidate } = await buildPreview(root);
  await mkdir(evidence, { recursive: true });
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
      const matches = /^\/(baseline|candidate)\/(.*)$/.exec(path);
      if (!matches) { res.writeHead(404); res.end(); return; }
      const file = matches[2] || "index.html";
      if (!/^[a-zA-Z0-9/_-]+\.(?:html|css|mjs|png|gif|svg)$/.test(file) ||
          file.includes("..")) {
        res.writeHead(404); res.end(); return;
      }
      const folder = matches[1] === "baseline" ? baseline : candidate;
      const full = resolve(folder, file);
      assert.ok(full.startsWith(folder + sep));
      const ext = file.slice(file.lastIndexOf("."));
      const bytes = await readFile(full);
      res.writeHead(200, {
        "Content-Type": allowExt.get(ext) || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex,nofollow",
      });
      res.end(bytes);
    } catch (error) {
      console.error("NO-GO: preview server", error?.code ?? error?.name);
      res.writeHead(500); res.end();
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const port = server.address().port;
  const binary = process.env.DESSET_CHROME_BIN || "google-chrome";
  let summary = [];
  try {
    for (const [w,h] of viewports) {
      for (const mode of ["baseline","candidate"]) {
        const file = join(evidence, mode+"-"+w+"x"+h+".png");
        const url = "http://127.0.0.1:"+port+"/"+mode+"/";
        const args = [
          "--headless=new", "--no-sandbox", "--disable-gpu",
          "--disable-dev-shm-usage", "--disable-extensions",
          "--no-first-run", "--no-default-browser-check",
          "--no-proxy-server", "--hide-scrollbars",
          "--force-device-scale-factor=1",
          "--window-size="+w+","+h,
          "--virtual-time-budget=1400",
          "--screenshot="+file, url
        ];
        const stderr = await new Promise((resolveResult,reject) => {
          const chrome = spawn(binary,args,{stdio:["ignore","ignore","pipe"]});
          let logs = "", timedOut = false;
          const timer = setTimeout(() => {
            timedOut = true;
            chrome.kill("SIGKILL");
          }, 45000);
          chrome.stderr.on("data", chunk => {logs=(logs+String(chunk)).slice(-1100);});
          chrome.once("error", err => {clearTimeout(timer);reject(err);});
          chrome.once("close", (code,signal) => {
            clearTimeout(timer);
            if (timedOut || code !== 0) reject(new Error(
              "NO-GO: Chrome screenshot "+mode+" "+w+"x"+h+
              " code="+code+" signal="+signal+": "+logs));
            else resolveResult(logs);
          });
        });
        const result = await stat(file);
        assert.ok(result.size>3000, "NO-GO: evidencia PNG vacía "+file+": "+stderr);
        summary.push({mode,viewport:w+"x"+h,file:file.slice(evidence.length+1),bytes:result.size});
      }
    }
    await writeFile(join(evidence,"manifest.json"),JSON.stringify({
      mode:"LOCAL_PREVIEW_ONLY",production_deployment_authorized:false,
      files:summary,
    },null,2)+"\n");
    console.log("HERO V11 PREVIEW PASS: 8 capturas offline, misma fuente protegida.");
  } finally {
    await new Promise(resolveClose => server.close(resolveClose));
  }
}
await main();
