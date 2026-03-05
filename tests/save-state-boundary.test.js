// tests/save-state-boundary.test.js
// Verifies hub room validation and heart clamping logic.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isValidHubRoom, getSafeHubRoom, clampHearts } = require("./helpers.js");

test("isValidHubRoom accepts valid 3x3 grid positions", () => {
  assert.equal(isValidHubRoom(0, 0), true);
  assert.equal(isValidHubRoom(1, 1), true);
  assert.equal(isValidHubRoom(2, 2), true);
});

test("isValidHubRoom rejects out-of-bounds positions", () => {
  assert.equal(isValidHubRoom(-1, 0), false);
  assert.equal(isValidHubRoom(0, 3), false);
  assert.equal(isValidHubRoom(3, 0), false);
});

test("getSafeHubRoom returns input for valid rooms", () => {
  assert.deepEqual(getSafeHubRoom(0, 2), { row: 0, col: 2 });
});

test("getSafeHubRoom falls back to center for invalid rooms", () => {
  assert.deepEqual(getSafeHubRoom(-1, 0), { row: 1, col: 1 });
  assert.deepEqual(getSafeHubRoom(3, 3), { row: 1, col: 1 });
});

test("clampHearts clamps below zero to zero", () => {
  assert.equal(clampHearts(-1, 5), 0);
});

test("clampHearts clamps above max to max", () => {
  assert.equal(clampHearts(10, 5), 5);
});

test("clampHearts passes through valid values unchanged", () => {
  assert.equal(clampHearts(3, 5), 3);
});
