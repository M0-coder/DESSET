import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseApprovedManifest, inspectVisualBaseline, gitBlobSha1, loadApprovedVisualBaseline, assertApprovedVisualBaseline } from "../scripts/visual-baseline.mjs";
import { loadHistoricalV11Manifest } from "./helpers/contact-v12-history.mjs";
import { publishedV12Read } from "./helpers/theme-v13-history.mjs";
import { visualApprovalDigest, visualApprovalSentence } from "../scripts/visual-approval.mjs";
const proposal=JSON.parse(readFileSync(new URL("../proposals/contact-v12/approval-proposal.json",import.meta.url),"utf8"));
const read=path=>readFileSync(new URL("../"+path,import.meta.url));
const v12Read=publishedV12Read(read);
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
 assert.deepEqual(inspectVisualBaseline(proposedApproved,v12Read).diffs,[]);
 const text=v12Read("index.html");
 assert.equal(gitBlobSha1(text),proposal.files["index.html"]);
 assert.equal(visualApprovalDigest(proposedApproved),
   "19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2");
 assert.equal(visualApprovalSentence(proposedApproved),
   "AUTORIZO DISENO VISUAL DESSET SHA256 19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2");
 const approvedInRepo=loadApprovedVisualBaseline();
 assert.equal(approvedInRepo.baseline_id,"DESSET-V12-CONTACT-2026-11-17");
 assert.equal(approvedInRepo.approval_evidence,"https://github.com/M0-coder/DESSET/issues/58#issuecomment-6968083138");
 assert.deepEqual(approvedInRepo.files,proposal.files);
 assert.deepEqual(assertApprovedVisualBaseline(approvedInRepo,v12Read).diffs,[]);
 assert.deepEqual(inspectVisualBaseline(approvedInRepo).diffs.sort(),["index.html","styles.css","index.html#body"].sort());
 const frozenV11=loadHistoricalV11Manifest();
 assert.ok(inspectVisualBaseline(frozenV11).diffs.includes("index.html"));
 assert.ok(inspectVisualBaseline(frozenV11).diffs.includes("styles.css"));
});
