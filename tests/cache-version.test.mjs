import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { STYLESHEET_PATHS, versionedStylesheetUrl, versionReleaseStylesheets } from "../scripts/cache-version.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const cssAssets = Object.fromEntries(STYLESHEET_PATHS.map(p =>
  [p, readFileSync(new URL("../" + p, import.meta.url))]));

test("production stylesheet URLs derive from exact SHA-256 bytes, not an arbitrary release label", () => {
  for (const path of STYLESHEET_PATHS) {
    const expected = createHash("sha256").update(cssAssets[path]).digest("hex");
    assert.equal(versionedStylesheetUrl(path, cssAssets[path]), "./" + path + "?v=" + expected);
    assert.match(expected, /^[0-9a-f]{64}$/);
  }
});

test("changing one CSS byte gives a new browser cache key, while the other stays unchanged", () => {
  const original = versionReleaseStylesheets(source, cssAssets);
  for (const path of STYLESHEET_PATHS) {
    const modified = { ...cssAssets, [path]: Buffer.concat([cssAssets[path], Buffer.from("\n")]) };
    const candidate = versionReleaseStylesheets(source, modified);
    assert.notEqual(candidate, original);
    assert.ok(candidate.includes('href="' + versionedStylesheetUrl(path, modified[path]) + '"'));
    for (const other of STYLESHEET_PATHS.filter(x => x !== path))
      assert.ok(candidate.includes('href="' + versionedStylesheetUrl(other, cssAssets[other]) + '"'));
  }
});

test("release versioning modifies only HEAD references, never approved BODY or CSS files", () => {
  const release = versionReleaseStylesheets(source, cssAssets);
  assert.equal(release.slice(release.indexOf("<body")), source.slice(source.indexOf("<body")));
  assert.equal((release.match(/\?v=[0-9a-f]{64}/g)||[]).length, 2);
  for (const path of STYLESHEET_PATHS) {
    assert.ok(source.includes('href="./' + path + '"'));
    assert.ok(release.includes('href="' + versionedStylesheetUrl(path, cssAssets[path]) + '"'));
    assert.ok(!release.includes('href="./' + path + '"'));
  }
  assert.ok(release.includes('href="' + versionedStylesheetUrl("styles-compact.css", cssAssets["styles-compact.css"]) +
    '" media="screen and (max-height: 400px)"'));
});

test("missing, duplicated or changed approved stylesheet references fail closed", () => {
  assert.throws(() => versionReleaseStylesheets(source.replace('href="./styles.css"', 'href="./unknown.css"'), cssAssets),
    /NO-GO/);
  assert.throws(() => versionReleaseStylesheets(source.replace('href="./styles.css"',
    'href="./styles.css" href="./styles.css"'), cssAssets), /NO-GO/);
  assert.throws(() => versionReleaseStylesheets(source, { ...cssAssets, "styles.css": Buffer.alloc(0) }),
    /NO-GO/);
  assert.throws(() => versionedStylesheetUrl("../styles.css", Buffer.from("a")), /NO-GO/);
});
