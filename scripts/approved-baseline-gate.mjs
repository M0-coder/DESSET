// Fail closed: main and PR CI verify the versioned, approved visual manifest.
// A design proposal is inspected independently; this gate never auto-approves.
import { assertApprovedVisualBaseline, loadApprovedVisualBaseline } from "./visual-baseline.mjs";

const manifest = loadApprovedVisualBaseline();
assertApprovedVisualBaseline(manifest);
console.log("GATE VISUAL PASS: " + manifest.baseline_id + " · 7 blobs Git + BODY + noindex verificados.");
