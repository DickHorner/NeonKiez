#!/usr/bin/env node

/**
 * Repository Quality Check Script
 *
 * Runs basic quality checks for the NeonKiez repository.
 * This is a minimal implementation that can be extended.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

function checkFileExists(filePath, description) {
  const fullPath = path.join(REPO_ROOT, filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${description}: ${filePath}`);
  return exists;
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(REPO_ROOT, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  const status = exists ? '✓' : '✗';
  console.log(`${status} ${description}: ${dirPath}`);
  return exists;
}

function runQualityCheck() {
  console.log('=== NeonKiez Repository Quality Check ===\n');

  let passed = 0;
  let total = 0;

  console.log('Core Files:');
  total++;
  passed += checkFileExists('package.json', 'Package manifest') ? 1 : 0;
  total++;
  passed += checkFileExists('pxt.json', 'MakeCode project file') ? 1 : 0;
  total++;
  passed += checkFileExists('tsconfig.json', 'TypeScript config') ? 1 : 0;

  console.log('\nGame Logic Files:');
  total++;
  passed += checkFileExists('main.ts', 'Main entry point') ? 1 : 0;
  total++;
  passed += checkFileExists('constants.ts', 'Constants') ? 1 : 0;
  total++;
  passed += checkFileExists('state.ts', 'State management') ? 1 : 0;
  total++;
  passed += checkFileExists('save.ts', 'Save/load logic') ? 1 : 0;
  total++;
  passed += checkFileExists('game_controller.ts', 'Game controller') ? 1 : 0;
  total++;
  passed += checkFileExists('world_dungeons.ts', 'Dungeon registry') ? 1 : 0;

  console.log('\nTest Infrastructure:');
  total++;
  passed += checkDirectory('tests', 'Tests directory') ? 1 : 0;
  total++;
  passed += checkDirectory('scripts', 'Scripts directory') ? 1 : 0;
  total++;
  passed += checkFileExists('tests/helpers.js', 'Test helpers') ? 1 : 0;
  total++;
  passed += checkFileExists('tests/inventory-flags.test.js', 'Inventory/flags tests') ? 1 : 0;
  total++;
  passed += checkFileExists('tests/dungeon-gating.test.js', 'Dungeon gating tests') ? 1 : 0;
  total++;
  passed += checkFileExists('tests/tool-unlock-idempotency.test.js', 'Tool unlock tests') ? 1 : 0;

  console.log(`\n=== Quality Check Summary ===`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Status: ${passed === total ? '✓ PASS' : '✗ FAIL'}`);

  process.exit(passed === total ? 0 : 1);
}

if (require.main === module) {
  runQualityCheck();
}

module.exports = { runQualityCheck };
