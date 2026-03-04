/**
 * Repository Governance Tests
 *
 * Basic structural and governance checks for the repository.
 */

const fs = require('fs');
const path = require('path');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test 1: Save.ts exists
test("save.ts file exists", () => {
  const filePath = path.join(__dirname, '..', 'save.ts');
  assert(fs.existsSync(filePath), "save.ts should exist");
});

// Test 2: State.ts exists
test("state.ts file exists", () => {
  const filePath = path.join(__dirname, '..', 'state.ts');
  assert(fs.existsSync(filePath), "state.ts should exist");
});

// Test 3: Save.ts contains validation helpers
test("save.ts contains validation helpers", () => {
  const filePath = path.join(__dirname, '..', 'save.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('clampNumber'), "save.ts should contain clampNumber function");
  assert(content.includes('validateHubRoom'), "save.ts should contain validateHubRoom function");
  assert(content.includes('validateFlags'), "save.ts should contain validateFlags function");
  assert(content.includes('validateStringArray'), "save.ts should contain validateStringArray function");
  assert(content.includes('validateInventory'), "save.ts should contain validateInventory function");
});

// Test 4: State.ts contains validation constants
test("state.ts contains validation constants", () => {
  const filePath = path.join(__dirname, '..', 'state.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('STATE_MIN_HEARTS'), "state.ts should contain STATE_MIN_HEARTS");
  assert(content.includes('STATE_MAX_HEARTS'), "state.ts should contain STATE_MAX_HEARTS");
  assert(content.includes('STATE_MIN_ENERGY'), "state.ts should contain STATE_MIN_ENERGY");
  assert(content.includes('STATE_MAX_ENERGY'), "state.ts should contain STATE_MAX_ENERGY");
  assert(content.includes('STATE_HUB_ROOM_MIN'), "state.ts should contain STATE_HUB_ROOM_MIN");
  assert(content.includes('STATE_HUB_ROOM_MAX'), "state.ts should contain STATE_HUB_ROOM_MAX");
});

// Run all tests
function runTests() {
  let passed = 0;
  let failed = 0;

  console.log("\n=== Repository Governance Tests ===\n");

  for (const test of tests) {
    try {
      test.fn();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${test.name}`);
      console.log(`  ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this is the main module
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
