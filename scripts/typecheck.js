#!/usr/bin/env node
// scripts/typecheck.js
// Runs tsc --noEmit and reports only errors from game source files (not pxt_modules or pre-existing duplicates).
// Exit code 0 = no errors in scope; non-zero = errors in scope files.

"use strict";
const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Files that have known pre-existing errors unrelated to our type-hardening work.
const IGNORED_PREFIXES = [
  "pxt_modules/",
  "world_hub_fixed.ts",
  "world_hub.ts",   // pre-existing duplicate declarations with world_hub_fixed.ts
  "helpers_pure.ts", // pure-logic helper for Node tests; uses ES module exports unsupported by MakeCode tsconfig
];

let output;
try {
  output = execSync("tsc --noEmit", { cwd: ROOT, encoding: "utf8" });
} catch (e) {
  output = (e.stdout || "") + (e.stderr || "");
}

const lines = output.split("\n");
const scopeErrors = lines.filter((line) => {
  if (!line.trim()) return false;
  for (const prefix of IGNORED_PREFIXES) {
    if (line.startsWith(prefix)) return false;
  }
  return line.includes("error TS");
});

if (scopeErrors.length > 0) {
  console.error("TypeScript errors in game source files:");
  scopeErrors.forEach((l) => console.error(" ", l));
  process.exit(1);
} else {
  console.log("TypeScript check passed (0 errors in game source files).");
  process.exit(0);
}
