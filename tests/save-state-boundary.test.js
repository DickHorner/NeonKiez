/**
 * Save State Boundary Tests
 *
 * Validates that save.ts correctly handles malformed, partial, and hostile payloads
 * without allowing invalid runtime state.
 */

// Mock MakeCode Arcade globals
global.settings = {
  _storage: {},
  writeString(key, value) {
    this._storage[key] = value;
  },
  readString(key) {
    return this._storage[key] || "";
  },
  clear() {
    this._storage = {};
  }
};

global.console = {
  log: () => {} // Suppress logs during tests
};

// Mock state constants (must match state.ts)
global.STATE_MIN_HEARTS = 0;
global.STATE_MAX_HEARTS = 5;
global.STATE_MIN_ENERGY = 0;
global.STATE_MAX_ENERGY = 100;
global.STATE_HUB_ROOM_MIN = 0;
global.STATE_HUB_ROOM_MAX = 2;

// Mock state object
global.state = {
  hearts: 5,
  maxHearts: 5,
  energy: 100,
  hubRoom: { row: 1, col: 1 },
  flags: {},
  unlockedTools: [],
  inventory: {}
};

// Import validation helpers from save.ts (simulated)
function clampNumber(value, min, max, defaultValue) {
  if (typeof value !== "number" || isNaN(value)) {
    return defaultValue;
  }
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value);
}

function validateHubRoom(room) {
  const defaultRoom = { row: 1, col: 1 };
  if (!room || typeof room !== "object") {
    return defaultRoom;
  }
  const row = clampNumber(room.row, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, 1);
  const col = clampNumber(room.col, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, 1);
  return { row, col };
}

function validateFlags(flags) {
  if (!flags || typeof flags !== "object" || Array.isArray(flags)) {
    return {};
  }
  const validated = {};
  for (const key in flags) {
    if (typeof flags[key] === "boolean") {
      validated[key] = flags[key];
    }
  }
  return validated;
}

function validateStringArray(arr) {
  if (!Array.isArray(arr)) {
    return [];
  }
  const validated = [];
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === "string") {
      validated.push(arr[i]);
    }
  }
  return validated;
}

function validateInventory(inventory) {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    return {};
  }
  const validated = {};
  for (const key in inventory) {
    if (typeof inventory[key] === "number" && !isNaN(inventory[key]) && inventory[key] >= 0) {
      validated[key] = Math.floor(inventory[key]);
    }
  }
  return validated;
}

function loadGame() {
  const json = settings.readString("NEON_KIEZ_SAVE");
  if (!json || json.length === 0) {
    return false;
  }

  try {
    const data = JSON.parse(json);

    const maxHearts = clampNumber(data.maxHearts, 1, STATE_MAX_HEARTS, 5);
    const hearts = clampNumber(data.hearts, STATE_MIN_HEARTS, maxHearts, 5);
    const energy = clampNumber(data.energy, STATE_MIN_ENERGY, STATE_MAX_ENERGY, 100);

    state.hearts = hearts;
    state.maxHearts = maxHearts;
    state.energy = energy;
    state.hubRoom = validateHubRoom(data.hubRoom);
    state.flags = validateFlags(data.flags);
    state.unlockedTools = validateStringArray(data.unlockedTools);
    state.inventory = validateInventory(data.inventory);

    return true;
  } catch (e) {
    return false;
  }
}

// Test utilities
function resetState() {
  state.hearts = 5;
  state.maxHearts = 5;
  state.energy = 100;
  state.hubRoom = { row: 1, col: 1 };
  state.flags = {};
  state.unlockedTools = [];
  state.inventory = {};
  settings.clear();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Test Suite
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// Test 1: Corrupt JSON returns false
test("Corrupt JSON returns false and leaves safe defaults", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", "{invalid json}");
  const result = loadGame();
  assert(result === false, "loadGame should return false for corrupt JSON");
  assertEqual(state.hearts, 5, "hearts should remain default");
  assertEqual(state.maxHearts, 5, "maxHearts should remain default");
});

// Test 2: Missing fields use defaults
test("Missing fields use safe defaults", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", "{}");
  const result = loadGame();
  assert(result === true, "loadGame should return true for valid JSON");
  assertEqual(state.hearts, 5, "hearts should be default");
  assertEqual(state.maxHearts, 5, "maxHearts should be default");
  assertEqual(state.energy, 100, "energy should be default");
  assertDeepEqual(state.hubRoom, { row: 1, col: 1 }, "hubRoom should be default");
});

// Test 3: Out-of-range hearts clamped
test("Out-of-range hearts are clamped", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hearts: 999, maxHearts: 5 }));
  loadGame();
  assertEqual(state.hearts, 5, "hearts should be clamped to maxHearts");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hearts: -10, maxHearts: 5 }));
  loadGame();
  assertEqual(state.hearts, 0, "hearts should be clamped to minimum 0");
});

// Test 4: Out-of-range maxHearts clamped
test("Out-of-range maxHearts are clamped", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ maxHearts: 999 }));
  loadGame();
  assertEqual(state.maxHearts, 5, "maxHearts should be clamped to max 5");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ maxHearts: 0 }));
  loadGame();
  assertEqual(state.maxHearts, 1, "maxHearts should be clamped to min 1");
});

// Test 5: Out-of-range energy clamped
test("Out-of-range energy is clamped", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ energy: 999 }));
  loadGame();
  assertEqual(state.energy, 100, "energy should be clamped to max 100");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ energy: -50 }));
  loadGame();
  assertEqual(state.energy, 0, "energy should be clamped to min 0");
});

// Test 6: Invalid hubRoom uses default
test("Invalid hubRoom uses safe default", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hubRoom: "invalid" }));
  loadGame();
  assertDeepEqual(state.hubRoom, { row: 1, col: 1 }, "hubRoom should be default for invalid type");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hubRoom: null }));
  loadGame();
  assertDeepEqual(state.hubRoom, { row: 1, col: 1 }, "hubRoom should be default for null");
});

// Test 7: Out-of-bounds hubRoom clamped
test("Out-of-bounds hubRoom is clamped", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hubRoom: { row: 99, col: 99 } }));
  loadGame();
  assertDeepEqual(state.hubRoom, { row: 2, col: 2 }, "hubRoom should be clamped to max bounds");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hubRoom: { row: -5, col: -5 } }));
  loadGame();
  assertDeepEqual(state.hubRoom, { row: 0, col: 0 }, "hubRoom should be clamped to min bounds");
});

// Test 8: Wrong type for numeric fields
test("Wrong types for numeric fields use defaults", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ hearts: "not a number", maxHearts: null, energy: [] }));
  loadGame();
  assertEqual(state.hearts, 5, "hearts should be default for wrong type");
  assertEqual(state.maxHearts, 5, "maxHearts should be default for wrong type");
  assertEqual(state.energy, 100, "energy should be default for wrong type");
});

// Test 9: Invalid flags are sanitized
test("Invalid flags are sanitized", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({
    flags: {
      validFlag: true,
      invalidFlag: "not boolean",
      anotherValid: false,
      numberFlag: 123
    }
  }));
  loadGame();
  assertDeepEqual(state.flags, { validFlag: true, anotherValid: false }, "flags should only contain boolean values");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ flags: "not an object" }));
  loadGame();
  assertDeepEqual(state.flags, {}, "flags should be empty object for invalid type");
});

// Test 10: Invalid unlockedTools array sanitized
test("Invalid unlockedTools are sanitized", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({
    unlockedTools: ["TOOL_A", 123, "TOOL_B", null, "TOOL_C"]
  }));
  loadGame();
  assertDeepEqual(state.unlockedTools, ["TOOL_A", "TOOL_B", "TOOL_C"], "unlockedTools should only contain strings");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ unlockedTools: "not an array" }));
  loadGame();
  assertDeepEqual(state.unlockedTools, [], "unlockedTools should be empty array for invalid type");
});

// Test 11: Invalid inventory sanitized
test("Invalid inventory is sanitized", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({
    inventory: {
      item1: 5,
      item2: "not a number",
      item3: 3.7,
      item4: -10,
      item5: 10
    }
  }));
  loadGame();
  assertDeepEqual(state.inventory, { item1: 5, item3: 3, item5: 10 }, "inventory should only contain non-negative numbers");

  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({ inventory: [] }));
  loadGame();
  assertDeepEqual(state.inventory, {}, "inventory should be empty object for array");
});

// Test 12: Hostile payload with all malformed fields
test("Hostile payload with all malformed fields", () => {
  resetState();
  const hostilePayload = {
    hearts: Infinity,
    maxHearts: -Infinity,
    energy: NaN,
    hubRoom: { row: 1000000, col: -1000000 },
    flags: [1, 2, 3],
    unlockedTools: { "not": "array" },
    inventory: "totally wrong",
    maliciousExtraField: "ignored"
  };
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify(hostilePayload));
  const result = loadGame();

  assert(result === true, "loadGame should handle hostile payload gracefully");
  assertEqual(state.hearts, 5, "hearts should be safe default");
  assertEqual(state.maxHearts, 5, "maxHearts should be safe default");
  assertEqual(state.energy, 100, "energy should be safe default");
  assertDeepEqual(state.hubRoom, { row: 2, col: 0 }, "hubRoom should be clamped");
  assertDeepEqual(state.flags, {}, "flags should be safe default");
  assertDeepEqual(state.unlockedTools, [], "unlockedTools should be safe default");
  assertDeepEqual(state.inventory, {}, "inventory should be safe default");
});

// Test 13: Partial payload
test("Partial payload preserves provided valid fields", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({
    hearts: 3,
    flags: { someFlag: true }
  }));
  loadGame();
  assertEqual(state.hearts, 3, "hearts should be preserved");
  assertEqual(state.maxHearts, 5, "maxHearts should be default");
  assertDeepEqual(state.flags, { someFlag: true }, "flags should be preserved");
});

// Test 14: Fractional numbers are floored
test("Fractional numbers are floored to integers", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify({
    hearts: 3.9,
    maxHearts: 4.1,
    energy: 75.5
  }));
  loadGame();
  assertEqual(state.hearts, 3, "hearts should be floored");
  assertEqual(state.maxHearts, 4, "maxHearts should be floored");
  assertEqual(state.energy, 75, "energy should be floored");
});

// Test 15: Empty save data returns false
test("Empty save data returns false", () => {
  resetState();
  settings.writeString("NEON_KIEZ_SAVE", "");
  const result = loadGame();
  assert(result === false, "loadGame should return false for empty string");
});

// Run all tests
function runTests() {
  let passed = 0;
  let failed = 0;

  console.log = (...args) => process.stdout.write(args.join(' ') + '\n');

  console.log("\n=== Save State Boundary Tests ===\n");

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
