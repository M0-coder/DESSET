import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/cloudflare-pages-production.yml", import.meta.url),
  "utf8",
);

test("production publish requires human dispatch from main", () => {
  assert.match(workflow, /^  workflow_dispatch:\s*$/m);
  assert.doesNotMatch(workflow, /^  push:/m);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /inputs\.confirm == 'PUBLICAR_DESSET'/);
  assert.doesNotMatch(workflow, /DESSET_AUTO_DEPLOY/);
});

test("Wrangler is version-pinned and security-audited without production credentials", () => {
  const tool = workflow.indexOf("      - name: Install and audit pinned Wrangler outside Git (no credentials)");
  const credential = workflow.indexOf("      - name: Validate Cloudflare credentials and destination");
  assert.ok(tool > 0 && credential > tool, "Toolchain audit must precede credentials");
  const section = workflow.slice(tool, credential);
  assert.match(section, /TOOL_DIR="\$RUNNER_TEMP\/desset-wrangler-v4\.162\.0"/);
  assert.match(section, /npm install --prefix "\$TOOL_DIR".*wrangler@4\.162\.0/);
  assert.match(section, /npm audit --prefix "\$TOOL_DIR" --audit-level=high --json/);
  assert.match(section, /git status --porcelain=v1/);
  assert.doesNotMatch(section, /CLOUDFLARE_API_TOKEN|CF_TOKEN|Authorization: Bearer/);
  assert.doesNotMatch(workflow, /cloudflare\/wrangler-action|wranglerVersion: "4\.136\.3"/);
});

test("deploy uses the isolated CLI, approved SHA, and a clean Git checkout", () => {
  const deploy = workflow.slice(
    workflow.indexOf("      - name: Deploy validated static assets to existing Pages project"),
    workflow.indexOf("      - name: Verify Cloudflare published exact commit and static mode"),
  );
  assert.match(deploy, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(deploy, /git status --porcelain=v1/);
  assert.match(deploy, /desset-wrangler-v4\.162\.0\/node_modules\/\.bin\/wrangler/);
  assert.match(deploy, /pages deploy "\$GITHUB_WORKSPACE\/dist-cloudflare-release-candidate"/);
  assert.match(deploy, /--project-name=desset-institucional/);
  assert.match(deploy, /--branch=release-approved/);
  assert.match(deploy, /--commit-hash="\$GITHUB_SHA"/);
});

test("post-deployment Cloudflare metadata must prove a clean published commit", () => {
  const begin = workflow.indexOf("      - name: Verify Cloudflare published exact commit and static mode");
  const end = workflow.indexOf("      - name: Live HTTPS smoke after deployment");
  assert.ok(begin > 0 && end > begin, "Expected post-deployment verification before public smoke");
  const verification = workflow.slice(begin, end);
  assert.match(verification, /\.result\.canonical_deployment\.latest_stage\.status == "success"/);
  assert.match(verification, /\.result\.canonical_deployment\.deployment_trigger\.metadata\.commit_hash == \$sha/);
  assert.match(verification, /\.result\.canonical_deployment\.deployment_trigger\.metadata\.commit_dirty == false/);
  assert.match(verification, /\.result\.canonical_deployment\.uses_functions == false/);
  assert.doesNotMatch(workflow, /--commit-dirty(?:=|\s+)false/, "No forged clean commit flag");
});
