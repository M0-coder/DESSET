/**
 * HERO-V11: read-only confirmation of the now SIGNED visual manifest.
 * Historical filename preserved to avoid breaking review references.
 * Never writes the manifest, merges a PR, or publishes anything.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadApprovedVisualBaseline, assertApprovedVisualBaseline } from "../../scripts/visual-baseline.mjs";
import { visualApprovalDigest, verifyVisualApproval } from "../../scripts/visual-approval.mjs";

const manifest = loadApprovedVisualBaseline();
const bytes = readFileSync(new URL("../../config/visual-baseline-approved.json", import.meta.url));
assert.equal(manifest.baseline_id, "DESSET-V11-HERO-2026-11-17",
  "NO-GO: reference is not signed V11");
assert.equal(manifest.source_commit, "5f1d5b711889868a1e14ab75a74448f91b34a59b");
assert.equal(manifest.production_deployment, "b118e080-24c8-412a-8ae7-ab52af7506f3",
  "This is the PRIOR V10 deployment, never claim V11 already published");
assert.equal(manifest.approval_evidence,
  "https://github.com/M0-coder/DESSET/issues/55#issuecomment-6964660907");
const digest = visualApprovalDigest(manifest);
assert.equal(digest, "e35904f0682fd466f8fe5aa24513f9b7648048ae041d4e7dc27887cae1da2e1f",
  "NO-GO: SHA-256 of signed design changed");
const integrity = assertApprovedVisualBaseline(manifest);
const evidence = await verifyVisualApproval(manifest, bytes);
assert.equal(evidence.kind, "verified-founder-github-comment");
assert.equal(evidence.issue, 55);
assert.equal(evidence.commentId, 6964660907);
console.log(JSON.stringify({
  kind: "HERO_V11_OWNER_APPROVED_MANIFEST_READ_ONLY",
  integrity_differences: integrity.diffs,
  approved_digest_sha256: digest,
  verified_approval: evidence.kind,
  approval_comment: manifest.approval_evidence,
  merge_authorized: false,
  publication_authorized: false,
}, null, 2));
