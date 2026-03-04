// tests/repo-governance.test.js
// Governance checks: verifies that any-count in core controller files is reduced.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const SCOPE_FILES = [
  "constants.ts",
  "state.ts",
  "game_controller.ts",
  "game_controller_hub.ts",
  "game_controller_platform.ts",
  "game_controller_rhythm.ts",
  "game_controller_meta.ts",
];

// Pattern matches `: any`, `as any`, `<any>` but NOT comment-only lines
// and NOT inline comment portions.
function countAny(source) {
  const lines = source.split("\n");
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//")) continue; // skip comment-only lines
    // Strip inline comment before matching
    const commentIdx = line.indexOf("//");
    const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const matches = codePart.match(/: any\b|as any\b|<any>/g);
    if (matches) count += matches.length;
  }
  return count;
}

// Original baseline measured before type-hardening pass: 34 occurrences.
const ORIGINAL_COUNT = 34;
const REQUIRED_REDUCTION_PCT = 60;

test("any count in scope files reduced by >= 60% vs baseline", () => {
  let total = 0;
  for (const file of SCOPE_FILES) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    total += countAny(src);
  }
  const reductionPct = ((ORIGINAL_COUNT - total) / ORIGINAL_COUNT) * 100;
  assert.ok(
    reductionPct >= REQUIRED_REDUCTION_PCT,
    `any reduction ${reductionPct.toFixed(1)}% < ${REQUIRED_REDUCTION_PCT}% (found ${total} remaining, need ≤ ${Math.floor(ORIGINAL_COUNT * (1 - REQUIRED_REDUCTION_PCT / 100))})`
  );
});

test("no `any` remains in scope files", () => {
  for (const file of SCOPE_FILES) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    const count = countAny(src);
    assert.equal(
      count,
      0,
      `${file} still contains ${count} 'any' usage(s)`
    );
  }
});
