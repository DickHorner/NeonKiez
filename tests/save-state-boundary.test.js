"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadFunctionsFromFile } = require("./source-utils.js");

const consoleMessages = [];
const saveHelpers = loadFunctionsFromFile(
  "save.ts",
  [
    "isDangerousObjectKey",
    "clampNumber",
    "logNormalization",
    "validateHubRoom",
    "validateFlags",
    "validateStringArray",
    "validateInventory",
  ],
  {
    HUB_START_ROOM: { row: 1, col: 1 },
    STATE_MIN_HEARTS: 0,
    STATE_MAX_HEARTS: 5,
    STATE_MIN_ENERGY: 0,
    STATE_MAX_ENERGY: 100,
    STATE_HUB_ROOM_MIN: 0,
    STATE_HUB_ROOM_MAX: 2,
    console: {
      log(message) {
        consoleMessages.push(message);
      },
    },
  }
);

test("clampNumber rejects NaN and infinities by using the default", () => {
  assert.equal(saveHelpers.clampNumber(NaN, 0, 5, 3), 3);
  assert.equal(saveHelpers.clampNumber(Infinity, 0, 5, 3), 3);
  assert.equal(saveHelpers.clampNumber(-Infinity, 0, 5, 3), 3);
});

test("validateHubRoom clamps out-of-range rows and columns", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(saveHelpers.validateHubRoom({ row: 99, col: -8 }))), { row: 2, col: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(saveHelpers.validateHubRoom(null))), { row: 1, col: 1 });
});

test("validateFlags strips dangerous keys and keeps a null prototype", () => {
  const payload = JSON.parse("{\"valid\":true,\"constructor\":false,\"prototype\":true,\"__proto__\":{\"polluted\":true}}");
  const result = saveHelpers.validateFlags(payload);

  assert.equal(result.valid, true);
  assert.equal(result.constructor, undefined);
  assert.equal(result.prototype, undefined);
  assert.equal(result.__proto__, undefined);
  assert.equal(Object.getPrototypeOf(result), null);
  assert.equal({}.polluted, undefined);
});

test("validateInventory strips dangerous keys and floors numeric quantities", () => {
  const payload = JSON.parse("{\"coin\":3.9,\"constructor\":9,\"prototype\":2,\"__proto__\":4}");
  const result = saveHelpers.validateInventory(payload);

  assert.equal(result.coin, 3);
  assert.equal(result.constructor, undefined);
  assert.equal(result.prototype, undefined);
  assert.equal(result.__proto__, undefined);
  assert.equal(Object.getPrototypeOf(result), null);
});

test("validateStringArray keeps only strings", () => {
  assert.deepEqual(
    Array.from(saveHelpers.validateStringArray(["TOOL_A", 42, "TOOL_B"], "unlockedTools")),
    ["TOOL_A", "TOOL_B"]
  );
  assert.deepEqual(Array.from(saveHelpers.validateStringArray("bad", "unlockedTools")), []);
});

test("save normalization emits deterministic log messages", () => {
  consoleMessages.length = 0;
  saveHelpers.validateHubRoom({ row: 10, col: 10 });
  assert.ok(consoleMessages.some((message) => message.includes("[SAVE] normalized hubRoom")));
});
