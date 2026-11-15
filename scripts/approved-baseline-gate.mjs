// Fail closed: CI and manual release verify approved visuals and proof of founder authorization.
// Initial public Bento is pinned by manifest blob; any later design requires verifiable owner approval.
import { readFileSync } from "node:fs";
import { assertApprovedVisualBaseline, loadApprovedVisualBaseline } from "./visual-baseline.mjs";
import { verifyVisualApproval } from "./visual-approval.mjs";

const manifest = loadApprovedVisualBaseline();
assertApprovedVisualBaseline(manifest);
const bytes = readFileSync(new URL("../config/visual-baseline-approved.json", import.meta.url));
const approval = await verifyVisualApproval(manifest, bytes);
console.log("GATE VISUAL PASS: " + manifest.baseline_id +
  " · hashes de archivos + BODY + noindex verificados; aprobación: " + approval.kind);
