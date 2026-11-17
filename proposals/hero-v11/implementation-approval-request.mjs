/**
 * HERO-V11 visual approval REQUEST only.
 * Calculates the future exact digest without modifying the protected manifest.
 * The existing approved V10 baseline must continue to fail on this draft.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  gitBlobSha1, htmlBodyFnv64, inspectVisualBaseline, loadApprovedVisualBaseline
} from "../../scripts/visual-baseline.mjs";
import { visualApprovalSentence, visualApprovalDigest } from "../../scripts/visual-approval.mjs";

const main = new URL("../../", import.meta.url);
const read = path => readFileSync(new URL("../../" + path, import.meta.url));
const approvedV10 = loadApprovedVisualBaseline();
assert.equal(approvedV10.baseline_id, "DESSET-V10-HERO-2026-11-17");
assert.deepEqual(inspectVisualBaseline(approvedV10).diffs,
  ["index.html", "styles.css", "index.html#body"],
  "NO-GO: only first-tile HTML and stylesheet may differ from V10");
const newHtml = read("index.html");
const newCss = read("styles.css");
const candidate = {
  ...approvedV10,
  baseline_id: "DESSET-V11-HERO-2026-11-17",
  source_commit: "5f1d5b711889868a1e14ab75a74448f91b34a59b",
  // The last known LIVE deployment before V11, not a V11 deployment.
  production_deployment: "b118e080-24c8-412a-8ae7-ab52af7506f3",
  // Not a valid approval URL intentionally; do NOT use this as the active manifest.
  approval_evidence: "PENDING_EXACT_DIGEST_OWNER_GITHUB_COMMENT",
  html_body_fnv64: htmlBodyFnv64(newHtml.toString("utf8")),
  files: {
    ...approvedV10.files,
    "index.html": gitBlobSha1(newHtml),
    "styles.css": gitBlobSha1(newCss),
  },
};
const approvedDiskBytes = read("config/visual-baseline-approved.json");
assert.equal(JSON.parse(approvedDiskBytes.toString()).baseline_id,
  "DESSET-V10-HERO-2026-11-17",
  "NO-GO: proposal must not overwrite the active V10 manifest");

console.log(JSON.stringify({
  kind: "HERO_V11_FUTURE_MANIFEST_REQUEST_READ_ONLY",
  current_baseline: approvedV10.baseline_id,
  publication_authorized: false,
  merge_authorized: false,
  can_pass_production_gate: false,
  exact_sha256_for_owner_review: visualApprovalDigest(candidate),
  requested_owner_sentence: visualApprovalSentence(candidate),
  manifest_to_review_only_not_activate: candidate
}, null, 2));
