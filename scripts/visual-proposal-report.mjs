// Read-only proposal inspector. It never updates the approved identity manifest.
import { inspectVisualBaseline, loadApprovedVisualBaseline } from "./visual-baseline.mjs";

const approved = loadApprovedVisualBaseline();
const candidate = inspectVisualBaseline(approved);
console.log(JSON.stringify({
  type: "DESSET_VISUAL_PROPOSAL_READ_ONLY",
  approved_baseline: approved.baseline_id,
  approved_source_commit: approved.source_commit,
  production_deployment_unchanged: approved.production_deployment,
  changed_files: candidate.diffs,
  candidate_git_blobs: candidate.actualFiles,
  candidate_html_body_fnv64: candidate.bodySignature,
  approval_required_before_updating_manifest: true,
  publication_authorized: false,
}, null, 2));
if (candidate.diffs.length) {
  console.error("PROPUESTA NO APROBADA: revisar cambios y obtener autorización antes de versionar nueva referencia.");
} else {
  console.log("PROPUESTA SIN DIFERENCIAS: referencia Bento actual intacta.");
}
