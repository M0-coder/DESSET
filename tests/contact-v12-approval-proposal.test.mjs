import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseApprovedManifest, inspectVisualBaseline, gitBlobSha1 } from "../scripts/visual-baseline.mjs";
import { visualApprovalDigest, visualApprovalSentence } from "../scripts/visual-approval.mjs";
const proposal=JSON.parse(readFileSync(new URL("../proposals/contact-v12/approval-proposal.json",import.meta.url),"utf8"));
test("CONTACT-V12 approval file remains a non-authorizing PROPOSAL",()=>{
 assert.equal(proposal.status,"proposal");
 assert.equal(proposal.approval_evidence,null);
 assert.equal(proposal.source_commit,"9e766cb38f1ffd9f4b3460f5e6a46fa914d4edb9");
 assert.equal(proposal.production_deployment,"6d864aac-84a2-4492-acb1-f869105c709f");
 assert.throws(()=>parseApprovedManifest(JSON.stringify(proposal)),/aprobada|approved/);
});
test("CONTACT-V12 candidate signature derives from complete current assets, never bypasses V11",()=>{
 const proposedApproved={...proposal,status:"approved"};
 assert.equal(Object.keys(proposedApproved.files).length,9);
 assert.deepEqual(inspectVisualBaseline(proposedApproved).diffs,[]);
 const text=readFileSync(new URL("../index.html",import.meta.url));
 assert.equal(gitBlobSha1(text),proposal.files["index.html"]);
 assert.equal(visualApprovalDigest(proposedApproved),
   "19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2");
 assert.equal(visualApprovalSentence(proposedApproved),
   "AUTORIZO DISENO VISUAL DESSET SHA256 19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2");
 const approvedInRepo=JSON.parse(readFileSync(new URL("../config/visual-baseline-approved.json",import.meta.url),"utf8"));
 assert.equal(approvedInRepo.baseline_id,"DESSET-V11-HERO-2026-11-17");
 assert.ok(inspectVisualBaseline(approvedInRepo).diffs.includes("index.html"));
 assert.ok(inspectVisualBaseline(approvedInRepo).diffs.includes("styles.css"));
});
