"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { readRepoFile } = require("./source-utils.js");

test("package.json defines cross-platform automation scripts", () => {
  const packageJson = JSON.parse(readRepoFile("package.json"));

  assert.equal(packageJson.scripts.test, "node scripts/run-tests.js");
  assert.equal(packageJson.scripts.lint, "node scripts/repo-quality-check.js lint");
  assert.equal(packageJson.scripts.build, "node scripts/typecheck.js && node scripts/repo-quality-check.js build");
  assert.equal(packageJson.devDependencies.typescript, "^5.0.0");
});

test("governance docs baseline exists", () => {
  assert.match(readRepoFile("CONTRIBUTING.md"), /Contributing to Neon-Kiez/i);
  assert.match(readRepoFile("ARCHITECTURE_DECISIONS.md"), /Architecture Decisions/i);
  assert.match(readRepoFile("AGENTS.md"), /Agent Guardrails/i);
  assert.match(readRepoFile(".github/CODEOWNERS"), /@DickHorner/);
  assert.doesNotMatch(readRepoFile("README.md"), /Motherlode/i);
  assert.doesNotMatch(readRepoFile("RUNBOOK.md"), /Motherlode/i);
  assert.doesNotMatch(readRepoFile("CONTRIBUTING.md"), /Motherlode/i);
});

test("security policy and CI workflows enforce repository gates", () => {
  const securityPolicy = readRepoFile("SECURITY.md");
  const ciWorkflow = readRepoFile(".github/workflows/ci.yml");
  const codeqlWorkflow = readRepoFile(".github/workflows/codeql.yml");

  assert.match(securityPolicy, /private/i);
  assert.match(securityPolicy, /14\s*day|14-day|14 days/i);
  assert.match(securityPolicy, /60\s*day|60-day|60 days/i);

  assert.match(ciWorkflow, /npm run lint/);
  assert.match(ciWorkflow, /npm run test/);
  assert.match(ciWorkflow, /npm run build/);

  assert.match(codeqlWorkflow, /github\/codeql-action\/init@v3/);
  assert.match(codeqlWorkflow, /github\/codeql-action\/analyze@v3/);
});

test("repo quality scripts run successfully", () => {
  execFileSync("node", ["scripts/repo-quality-check.js", "lint"], { stdio: "pipe" });
  execFileSync("node", ["scripts/repo-quality-check.js", "build"], { stdio: "pipe" });
});
