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

test("V10 preserves original monospace typography and only appends scoped finishing CSS", () => {
  const at = css.indexOf(marker);
  assert.ok(at > 0, "V10 pilot marker missing");
  assert.equal(css.indexOf(marker, at + marker.length), -1, "duplicate V10 marker");
  assert.equal(gitBlobSha1(Buffer.from(css.slice(0, at).trimEnd() + "\n")),
    manifest.files["styles.css"], "historical CSS changed before the isolated pilot");
  const pilot = css.slice(at);
  assert.match(css, /font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace/);
  const candidateFamilies = [...pilot.matchAll(/font-family\s*:\s*([^;}]+)[;}]/gi)].map(match => match[1].trim());
  assert.ok(candidateFamilies.length > 0, "The candidate must declare that it inherits the approved font");
  assert.ok(candidateFamilies.every(value => value === "inherit"), "The original monospace face must remain unchanged");
  assert.doesNotMatch(pilot, /PP Mondwest|Space Grotesk|@font-face|@import/i);
  assert.match(pilot, /\.tile--intro \.intro-skyline\s*\{/);
  assert.match(pilot, /\.tile--intro \.intro-wordmark\s*\{/);
  assert.match(pilot, /\.tile--intro\s*\{/);
  assert.match(pilot, /body\[data-theme="dark"\] \.tile--intro\s*\{/);
  assert.match(pilot, /\.tile--intro::after\s*\{/);
  assert.match(pilot, /pointer-events:none/);
  assert.doesNotMatch(pilot, /@font-face|@import|url\s*\(\s*["']?https?:/i);
  assert.doesNotMatch(pilot, /\.board\s*\{|\.intro-eye\s*\{|\.brand-symbol\s*\{|\.tile--visual\s*\{/);
  assert.notEqual(gitBlobSha1(Buffer.from(css)), manifest.files["styles.css"],
    "the unapproved pilot must not accidentally pass the historical visual gate");
});

test("candidate adds city and label only to the first card, preserving 10-tile approved HTML", () => {
  const label = '          <span class="intro-wordmark" aria-hidden="true">DESSET</span>';
  assert.equal(html.split(label).length, 2, "Exactly one decorative wordmark");
  const match = html.match(/\n        <svg class="intro-skyline"[^\n]*<\/svg>/g);
  assert.equal(match?.length, 1, "The hero skyline must be one self-contained SVG");
  const skyline = match[0];
  assert.match(skyline, /aria-hidden="true"/);
  assert.match(skyline, /viewBox="0 0 180 56"/);
  assert.doesNotMatch(skyline, /<script|foreignObject|onload|href=|https?:|data:/i);
  const originalHtml = html.replace("\n" + label, "").replace(skyline, "");
  assert.equal(gitBlobSha1(Buffer.from(originalHtml)), manifest.files["index.html"],
    "Everything outside the two new first-card elements must be byte-for-byte identical");
  assert.doesNotMatch(html, /DESSET®|DESSET&reg;|DESSET&#174;/i);
  assert.equal((html.match(/class="tile tile--/g) || []).length, 10);
  assert.match(html, /COMERCIO<br>Y <span class="brand-word">LOGÍSTICA<\/span>\.<br><span>UNA MISMA VISIÓN\.<\/span>/);
  assert.match(html, /data-detail="project">CONOCER EL PROYECTO/);
  assert.match(html, /<picture class="intro-eye">/);
  assert.match(html, /<source media="\(prefers-reduced-motion: reduce\)" srcset="\.\/assets\/desset-eye-still\.png">/);
  assert.match(html, /<img src="\.\/assets\/desset-eye\.gif" width="496" height="499"/);
});

// Count actual GIF image descriptors; searching raw bytes for 0x2C is unsafe,
// because compressed image data may contain the same value.
function gifFrameCount(bytes) {
  assert.match(bytes.subarray(0, 6).toString("ascii"), /^GIF8[79]a$/);
  let offset = 13;
  if(bytes[10] & 0x80) offset += 3 * (2 ** ((bytes[10] & 7) + 1));
  const skipBlocks = () => {
    for(;;) {
      assert.ok(offset < bytes.length, "GIF sub-block missing terminator");
      const length = bytes[offset++];
      if(!length) return;
      offset += length;
      assert.ok(offset <= bytes.length, "GIF sub-block exceeds file size");
    }
  };
  let count = 0;
  let complete = false;
  while(offset < bytes.length) {
    const type = bytes[offset++];
    if(type === 0x3b) { complete = true; break; }
    if(type === 0x21) {
      offset++; // extension label
      skipBlocks();
    } else if(type === 0x2c) {
      offset += 8; // image position and dimensions
      const packed = bytes[offset++];
      if(packed & 0x80) offset += 3 * (2 ** ((packed & 7) + 1));
      offset++; // LZW minimum code size
      skipBlocks();
      count++;
    } else {
      throw new Error("Unsupported GIF block type: " + type);
    }
  }
  assert.ok(complete, "GIF trailer absent");
  return count;
}

test("animated GIF and still fallback retain their approved binary hashes", () => {
  const gif = read("assets/desset-eye.gif");
  const still = read("assets/desset-eye-still.png");
  assert.equal(gif.subarray(0,3).toString(), "GIF");
  assert.equal(gif.readUInt16LE(6), 496);
  assert.equal(gif.readUInt16LE(8), 499);
  assert.ok(gifFrameCount(gif) > 1, "The approved eye must remain an animated multi-frame GIF");
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
