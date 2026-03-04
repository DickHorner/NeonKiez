// Hub Room Guard Tests
// Tests for bounds checking and fallback safety in hub room payload handling

// Mock MakeCode Arcade environment for testing
const mockConsole = {
  logs: [],
  log: function(...args) {
    this.logs.push(args.join(' '));
  }
};

// Test suite for hub room validation
function testIsValidHubRoom() {
  const tests = [
    // Valid cases
    { room: { row: 0, col: 0 }, expected: true, name: "valid top-left" },
    { room: { row: 1, col: 1 }, expected: true, name: "valid center" },
    { room: { row: 2, col: 2 }, expected: true, name: "valid bottom-right" },

    // Negative indices
    { room: { row: -1, col: 1 }, expected: false, name: "negative row" },
    { room: { row: 1, col: -1 }, expected: false, name: "negative col" },
    { room: { row: -5, col: -10 }, expected: false, name: "both negative" },

    // Overflow indices
    { room: { row: 3, col: 1 }, expected: false, name: "row overflow" },
    { room: { row: 1, col: 3 }, expected: false, name: "col overflow" },
    { room: { row: 100, col: 100 }, expected: false, name: "large overflow" },

    // Non-numeric values
    { room: { row: "1", col: 1 }, expected: false, name: "string row" },
    { room: { row: 1, col: "1" }, expected: false, name: "string col" },
    { room: { row: null, col: 1 }, expected: false, name: "null row" },
    { room: { row: 1, col: undefined }, expected: false, name: "undefined col" },
    { room: { row: NaN, col: 1 }, expected: false, name: "NaN row" },
    { room: { row: 1, col: NaN }, expected: false, name: "NaN col" },
    { room: { row: Infinity, col: 1 }, expected: false, name: "Infinity row" },
    { room: { row: 1, col: -Infinity }, expected: false, name: "-Infinity col" },

    // Missing properties
    { room: { row: 1 }, expected: false, name: "missing col" },
    { room: { col: 1 }, expected: false, name: "missing row" },
    { room: {}, expected: false, name: "empty object" },

    // Invalid types
    { room: null, expected: false, name: "null" },
    { room: undefined, expected: false, name: "undefined" },
    { room: "string", expected: false, name: "string instead of object" },
    { room: 123, expected: false, name: "number instead of object" },
    { room: [1, 1], expected: false, name: "array instead of object" },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    // Simulate isValidHubRoom function logic
    const result = isValidHubRoomMock(test.room);

    if (result === test.expected) {
      passed++;
      console.log(`✓ ${test.name}`);
    } else {
      failed++;
      console.log(`✗ ${test.name} - Expected ${test.expected}, got ${result}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Mock implementation matching the actual isValidHubRoom
function isValidHubRoomMock(room) {
  const HUB_ROOM_IDS = [
    ["TM_HUB_00", "TM_HUB_01", "TM_HUB_02"],
    ["TM_HUB_10", "TM_HUB_11", "TM_HUB_12"],
    ["TM_HUB_20", "TM_HUB_21", "TM_HUB_22"],
  ];

  if (!room || typeof room !== "object") return false;
  if (typeof room.row !== "number" || typeof room.col !== "number") return false;
  // Guard against NaN, Infinity, and other non-finite numbers
  if (!isFinite(room.row) || !isFinite(room.col)) return false;
  if (room.row < 0 || room.row >= HUB_ROOM_IDS.length) return false;
  if (room.col < 0 || room.col >= HUB_ROOM_IDS[0].length) return false;
  return true;
}

// Test getSafeHubRoom fallback behavior
function testGetSafeHubRoom() {
  const HUB_START_ROOM = { row: 1, col: 1 };
  mockConsole.logs = [];

  const tests = [
    // Valid - should return as-is
    { room: { row: 0, col: 0 }, shouldFallback: false, name: "valid room passes through" },
    { room: { row: 2, col: 1 }, shouldFallback: false, name: "valid bottom-center passes through" },

    // Invalid - should fallback
    { room: { row: -1, col: 1 }, shouldFallback: true, name: "negative falls back" },
    { room: { row: 10, col: 10 }, shouldFallback: true, name: "overflow falls back" },
    { room: null, shouldFallback: true, name: "null falls back" },
    { room: { row: "1", col: 1 }, shouldFallback: true, name: "string falls back" },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const initialLogCount = mockConsole.logs.length;
    const result = getSafeHubRoomMock(test.room, "test-context");
    const debugLogged = mockConsole.logs.length > initialLogCount;

    const isValid = isValidHubRoomMock(result);
    const fellBack = JSON.stringify(result) === JSON.stringify(HUB_START_ROOM);

    if (!isValid) {
      failed++;
      console.log(`✗ ${test.name} - Result is invalid: ${JSON.stringify(result)}`);
    } else if (test.shouldFallback && !fellBack) {
      failed++;
      console.log(`✗ ${test.name} - Expected fallback to HUB_START_ROOM, got ${JSON.stringify(result)}`);
    } else if (!test.shouldFallback && fellBack) {
      failed++;
      console.log(`✗ ${test.name} - Unexpected fallback to HUB_START_ROOM`);
    } else if (test.shouldFallback && !debugLogged) {
      failed++;
      console.log(`✗ ${test.name} - Fallback occurred but no debug log`);
    } else {
      passed++;
      console.log(`✓ ${test.name}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.log(`Debug logs generated: ${mockConsole.logs.length}`);
  return failed === 0;
}

// Mock implementation matching getSafeHubRoom
function getSafeHubRoomMock(room, debugContext) {
  const HUB_START_ROOM = { row: 1, col: 1 };

  if (isValidHubRoomMock(room)) {
    return room;
  }
  mockConsole.log("DEBUG: Hub room fallback triggered - " + debugContext + " - invalid room:", room);
  return HUB_START_ROOM;
}

// Run all tests
console.log("=== Hub Room Guard Tests ===\n");
console.log("--- Testing isValidHubRoom ---");
const test1Pass = testIsValidHubRoom();

console.log("\n--- Testing getSafeHubRoom ---");
const test2Pass = testGetSafeHubRoom();

console.log("\n=== Summary ===");
if (test1Pass && test2Pass) {
  console.log("All tests passed ✓");
  process.exit(0);
} else {
  console.log("Some tests failed ✗");
  process.exit(1);
}
