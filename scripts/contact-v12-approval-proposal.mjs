// CONTACT-V12: read-only proposal inspector. This is NOT an approval or release gate.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inspectVisualBaseline } from "./visual-baseline.mjs";
import { visualApprovalDigest, visualApprovalSentence } from "./visual-approval.mjs";

const proposal=JSON.parse(readFileSync(new URL("../proposals/contact-v12/approval-proposal.json",import.meta.url),"utf8"));
assert.equal(proposal.status,"proposal","NO-GO: candidate document cannot claim approval");
assert.equal(proposal.approval_evidence,null,"NO-GO: do not create fake evidence");
assert.equal(proposal.source_commit,"9e766cb38f1ffd9f4b3460f5e6a46fa914d4edb9");
const planned={...proposal,status:"approved"};
const inspection=inspectVisualBaseline(planned);
assert.deepEqual(inspection.diffs,[],"NO-GO: proposed hashes do not match local candidate");
const digest=visualApprovalDigest(planned);
assert.equal(digest,"19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2",
  "NO-GO: actual candidate fingerprint changed; refresh proposal before requesting consent");
console.log("CONTACT-V12: PROPOSAL_ONLY — no approval, no merge, no publication.");
console.log("Candidate commit: "+proposal.source_commit);
console.log("V11 deployment reference: "+proposal.production_deployment);
console.log("Proposed digest: "+digest);
console.log("OWNER SIGNATURE TO REQUEST (do not post automatically):");
console.log(visualApprovalSentence(planned));
