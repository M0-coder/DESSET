import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gitBlobSha1, loadApprovedVisualBaseline } from "../scripts/visual-baseline.mjs";
import {
  FIRST_APPROVED_ID, FIRST_APPROVED_MANIFEST_GIT_BLOB, visualApprovalDigest,
  visualApprovalSentence, verifyVisualApproval
} from "../scripts/visual-approval.mjs";

const read = () => readFileSync(new URL("./fixtures/visual-baseline-original.json", import.meta.url));
const clone = x => JSON.parse(JSON.stringify(x));
const url = "https://github.com/M0-coder/DESSET/issues/15#issuecomment-987654321";
const proposed = () => {
  const m = clone(loadApprovedVisualBaseline());
  m.baseline_id = "DESSET-BENTO-APPROVED-2026-11-15-V2";
  m.source_commit = "a".repeat(40);
  m.files["styles.css"] = "f".repeat(40);
  m.approval_evidence = url;
  return m;
};
const bytes = m => Buffer.from(JSON.stringify(m));
const comment = m => ({
  id: 987654321,
  user: { login: "M0-coder" },
  author_association: "OWNER",
  html_url: url,
  issue_url: "https://api.github.com/repos/M0-coder/DESSET/issues/15",
  body: visualApprovalSentence(m),
});
const succeed = data => async (api, options) => {
  assert.equal(api, "https://api.github.com/repos/M0-coder/DESSET/issues/comments/987654321");
  assert.ok(options.headers.Accept.includes("github"));
  return { ok: true, json: async () => data };
};

test("el manifiesto original está anclado al Git blob exacto y no requiere red", async () => {
  const m = JSON.parse(read().toString("utf8"));
  assert.equal(gitBlobSha1(read()), FIRST_APPROVED_MANIFEST_GIT_BLOB);
  const result = await verifyVisualApproval(m, read(), () => { throw new Error("Network must not run"); });
  assert.equal(result.kind, "original-approved-snapshot");
  assert.equal(result.digest.length, 64);
});

test("el ID aprobado inicial no se puede reutilizar cambiando un hash", async () => {
  const m = proposed();
  m.baseline_id = FIRST_APPROVED_ID;
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(comment(m))), /No reutilizar/);
});

test("una nueva versión requiere source_commit nuevo", async () => {
  const m = proposed();
  m.source_commit = "841fb1d5ba44022237fe1534926c6c3a5ab564f5";
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(comment(m))), /commit del candidato/);
});

test("un enlace genérico a Actions no constituye evidencia humana", async () => {
  const m = proposed();
  m.approval_evidence = "https://github.com/M0-coder/DESSET/actions/runs/43751936396";
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(comment(m))), /comentario de aprobación/);
});

test("únicamente el comentario del propietario con digest exacto permite promoción", async () => {
  const m = proposed();
  const res = await verifyVisualApproval(m, bytes(m), succeed(comment(m)));
  assert.equal(res.kind, "verified-founder-github-comment");
  assert.equal(res.digest, visualApprovalDigest(m));
  assert.equal(res.issue, 15);
});

test("token de solo lectura autentica la consulta pero no cambia la prueba del propietario", async () => {
  const m = proposed();
  const prior = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "unit-test-readonly-token";
  try {
    const fn = async (url, options) => {
      assert.equal(url, "https://api.github.com/repos/M0-coder/DESSET/issues/comments/987654321");
      assert.equal(options.headers.Authorization, "Bearer unit-test-readonly-token");
      return { ok: true, json: async () => comment(m) };
    };
    const res = await verifyVisualApproval(m, bytes(m), fn);
    assert.equal(res.kind, "verified-founder-github-comment");
    const mismatched = comment(m);
    mismatched.user.login = "not-owner";
    await assert.rejects(verifyVisualApproval(m, bytes(m), async () => ({
      ok: true, json: async () => mismatched
    })), /Solo el propietario/);
  } finally {
    if (prior === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = prior;
  }
});

test("rechaza una aprobación publicada por otro usuario", async () => {
  const m = proposed();
  const c = comment(m); c.user.login = "someone-else";
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(c)), /Solo el propietario/);
});

test("rechaza comentarios de colaborador incluso si utilizan un nombre similar", async () => {
  const m = proposed();
  const c = comment(m); c.author_association = "COLLABORATOR";
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(c)), /calidad de propietario/);
});

test("rechaza consentimiento asociado a otro SHA-256 de diseño", async () => {
  const m = proposed();
  const c = comment(m); c.body = "AUTORIZO DISENO VISUAL DESSET SHA256 " + "1".repeat(64);
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(c)), /SHA-256 exacto/);
});

test("rechaza evidencia copiada de otra incidencia", async () => {
  const m = proposed();
  const c = comment(m); c.issue_url = "https://api.github.com/repos/M0-coder/DESSET/issues/14";
  await assert.rejects(verifyVisualApproval(m, bytes(m), succeed(c)), /otro expediente/);
});

test("rechaza respuestas HTTP no verificables, sin permitir bypass de red", async () => {
  const m = proposed();
  await assert.rejects(verifyVisualApproval(m, bytes(m), async () => ({ ok: false, status: 403 })), /No se pudo comprobar/);
});

test("rechaza el par manifiesto/contenido inconsistente", async () => {
  const m = proposed();
  const other = clone(m); other.files["styles.css"] = "a".repeat(40);
  await assert.rejects(verifyVisualApproval(m, bytes(other), succeed(comment(m))), /manifiesto exacto/);
});

test("el gate combina revisión de hashes con comprobación de autorización", () => {
  const wrapper = readFileSync(new URL("../scripts/approved-baseline-gate.mjs", import.meta.url), "utf8");
  assert.match(wrapper, /assertApprovedVisualBaseline\(manifest\)/);
  assert.match(wrapper, /await verifyVisualApproval\(manifest, bytes\)/);
  assert.doesNotMatch(wrapper, /process\.env|GITHUB_EVENT_NAME|SKIP|BYPASS/);
});
