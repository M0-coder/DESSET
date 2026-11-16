// Human approval gate for any visual baseline beyond the immutable 2026-11-15 snapshot.
// Approval must be a real GitHub issue comment by the repository owner, for the exact asset digest.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gitBlobSha1 } from "./visual-baseline.mjs";

export const FIRST_APPROVED_MANIFEST_GIT_BLOB = "8cef913d9018bc7294a951fd16b521ec8c87a018";
export const FIRST_APPROVED_ID = "DESSET-BENTO-APPROVED-2026-11-15";
export const FIRST_APPROVED_COMMIT = "841fb1d5ba44022237fe1534926c6c3a5ab564f5";
const OWNER = "m0-coder";

export function visualApprovalDigest(manifest) {
  const fileHashes = Object.keys(manifest.files).sort().map(path => [path, manifest.files[path]]);
  const candidate = JSON.stringify({
    schema_version: manifest.schema_version,
    baseline_id: manifest.baseline_id,
    status: manifest.status,
    source_commit: manifest.source_commit,
    production_deployment: manifest.production_deployment,
    hash_algorithm: manifest.hash_algorithm,
    html_body_fnv64: manifest.html_body_fnv64,
    files: fileHashes,
  });
  return createHash("sha256").update(candidate).digest("hex");
}

export function visualApprovalSentence(manifest) {
  return "AUTORIZO DISENO VISUAL DESSET SHA256 " + visualApprovalDigest(manifest);
}

export async function verifyVisualApproval(manifest, manifestBytes, fetchComment = fetch) {
  const bytes = Buffer.isBuffer(manifestBytes) ? manifestBytes : Buffer.from(manifestBytes);
  assert.deepEqual(JSON.parse(bytes.toString("utf8")), manifest,
    "La aprobación debe corresponder al manifiesto exacto leído del repositorio");
  // Existing public Bento does not need an invented approval; its full Git blob is pinned.
  if (gitBlobSha1(bytes) === FIRST_APPROVED_MANIFEST_GIT_BLOB) {
    assert.equal(manifest.baseline_id, FIRST_APPROVED_ID);
    return { kind: "original-approved-snapshot", digest: visualApprovalDigest(manifest) };
  }
  assert.notEqual(manifest.baseline_id, FIRST_APPROVED_ID,
    "No reutilizar el ID original para un diseño distinto");
  assert.notEqual(manifest.source_commit, FIRST_APPROVED_COMMIT,
    "Una nueva referencia debe indicar el commit del candidato aprobado");

  const evidence = /^https:\/\/github\.com\/M0-coder\/DESSET\/issues\/([1-9]\d*)#issuecomment-([1-9]\d*)$/
    .exec(manifest.approval_evidence);
  assert.ok(evidence,
    "La nueva referencia exige URL a comentario de aprobación de GitHub del propietario, no un run o un PR genérico");
  const issue = Number(evidence[1]), commentId = Number(evidence[2]);
  const apiUrl = "https://api.github.com/repos/M0-coder/DESSET/issues/comments/" + commentId;
  // GitHub Actions provides a read-only repository token; authenticated API access
  // avoids shared anonymous rate limits. Authorization never replaces founder proof.
  const headers = { "Accept": "application/vnd.github+json", "User-Agent": "desset-visual-approval-gate" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  const response = await fetchComment(apiUrl, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  assert.ok(response.ok, "No se pudo comprobar el comentario de aprobación de GitHub: " + response.status);
  const comment = await response.json();
  assert.equal(comment.id, commentId, "ID de comentario distinto del indicado");
  assert.equal(comment.user?.login?.toLowerCase(), OWNER, "Solo el propietario autoriza nuevas versiones de diseño");
  assert.equal(comment.author_association, "OWNER", "Aprobación sin calidad de propietario");
  assert.equal(comment.issue_url, "https://api.github.com/repos/M0-coder/DESSET/issues/" + issue,
    "El comentario pertenece a otro expediente");
  assert.equal(comment.html_url, manifest.approval_evidence, "URL del comentario no coincide");
  assert.equal(comment.body?.trim(), visualApprovalSentence(manifest),
    "La aprobación no coincide con el SHA-256 exacto de este diseño");
  return { kind: "verified-founder-github-comment", digest: visualApprovalDigest(manifest), issue, commentId };
}
