// tests/dungeon-gating.test.js
// Verifies that the final dungeon unlock gate requires all 8 previous dungeons cleared.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { checkAllDungeonsClearExceptFinalPure } = require("./helpers.js");

test("returns false when no dungeons are cleared", () => {
  assert.equal(checkAllDungeonsClearExceptFinalPure({}), false);
});

test("returns false when only some dungeons are cleared", () => {
  const flags = {
    FLAG_DUN_01_CLEARED: true,
    FLAG_DUN_02_CLEARED: true,
    FLAG_DUN_03_CLEARED: true,
  };
  assert.equal(checkAllDungeonsClearExceptFinalPure(flags), false);
});

test("returns true when all 8 dungeons are cleared", () => {
  const flags = {
    FLAG_DUN_01_CLEARED: true,
    FLAG_DUN_02_CLEARED: true,
    FLAG_DUN_03_CLEARED: true,
    FLAG_DUN_04_CLEARED: true,
    FLAG_DUN_05_CLEARED: true,
    FLAG_DUN_06_CLEARED: true,
    FLAG_DUN_07_CLEARED: true,
    FLAG_DUN_08_CLEARED: true,
  };
  assert.equal(checkAllDungeonsClearExceptFinalPure(flags), true);
});

test("returns false when dungeon 8 is missing even if 1-7 are cleared", () => {
  const flags = {
    FLAG_DUN_01_CLEARED: true,
    FLAG_DUN_02_CLEARED: true,
    FLAG_DUN_03_CLEARED: true,
    FLAG_DUN_04_CLEARED: true,
    FLAG_DUN_05_CLEARED: true,
    FLAG_DUN_06_CLEARED: true,
    FLAG_DUN_07_CLEARED: true,
  };
  assert.equal(checkAllDungeonsClearExceptFinalPure(flags), false);
});
