// V10 hero experiment: enforce invariants without approving visual changes.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gitBlobSha1} from "../scripts/visual-baseline.mjs";

const read = path => readFileSync(new URL("../" + path, import.meta.url));
const manifest = JSON.parse(read("config/visual-baseline-approved.json").toString("utf8"));
const html = read("index.html").toString("utf8");
const css = read("styles.css").toString("utf8");
const marker = "/* V10 HERO PILOT";

test("V10 only appends scoped pilot CSS; approved stylesheet prefix is identical", () => {
  const at = css.indexOf(marker);
  assert.ok(at > 0, "V10 pilot marker missing");
  assert.equal(css.indexOf(marker, at + marker.length), -1, "duplicate V10 marker");
  assert.equal(gitBlobSha1(Buffer.from(css.slice(0, at).trimEnd() + "\n")),
    manifest.files["styles.css"], "historical CSS changed before the isolated pilot");
  const pilot = css.slice(at);
  assert.match(pilot, /\.tile--intro \.intro-main h1\s*\{/);
  assert.match(pilot, /font-family:"PP Mondwest",Georgia/);
  assert.match(pilot, /body\[data-theme="dark"\] \.tile--intro\s*\{/);
  assert.doesNotMatch(pilot, /@font-face|@import|url\s*\(\s*["']?https?:/i);
  assert.doesNotMatch(pilot, /\.board\s*\{|\.intro-eye\s*\{|\.brand-symbol\s*\{|\.tile--visual\s*\{/);
  assert.notEqual(gitBlobSha1(Buffer.from(css)), manifest.files["styles.css"],
    "the unapproved pilot must not accidentally pass the historical visual gate");
});

test("exact approved HTML, all 10 Bento tiles and project link remain untouched", () => {
  assert.equal(gitBlobSha1(Buffer.from(html)), manifest.files["index.html"]);
  assert.equal((html.match(/class="tile tile--/g) || []).length, 10);
  assert.match(html, /COMERCIO<br>Y <span class="brand-word">LOGÍSTICA<\/span>\.<br><span>UNA MISMA VISIÓN\.<\/span>/);
  assert.match(html, /data-detail="project">CONOCER EL PROYECTO/);
  assert.match(html, /<picture class="intro-eye">/);
  assert.match(html, /<source media="\(prefers-reduced-motion: reduce\)" srcset="\.\/assets\/desset-eye-still\.png">/);
  assert.match(html, /<img src="\.\/assets\/desset-eye\.gif" width="496" height="499"/);
});

test("animated GIF and still fallback retain their approved binary hashes", () => {
  const gif = read("assets/desset-eye.gif");
  const still = read("assets/desset-eye-still.png");
  assert.equal(gif.subarray(0,3).toString(), "GIF");
  assert.equal(gif.readUInt16LE(6), 496);
  assert.equal(gif.readUInt16LE(8), 499);
  assert.equal(still.subarray(0,8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(gitBlobSha1(gif), manifest.files["assets/desset-eye.gif"]);
  assert.equal(gitBlobSha1(still), manifest.files["assets/desset-eye-still.png"]);
});

test("logo, ecosystem illustration and behavior are byte-for-byte approved", () => {
  for(const path of [
    "assets/deliver-assets-mark.png",
    "assets/roles-geometry-v2.svg",
    "src/app.mjs",
    "src/content.mjs",
    "styles-compact.css",
  ]){
    assert.equal(gitBlobSha1(read(path)), manifest.files[path], path);
  }
});
