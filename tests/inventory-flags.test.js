// tests/inventory-flags.test.js
// Verifies reward application: flags set, tools unlocked, items added.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { applyRewards } = require("./helpers.js");

test("applyRewards sets flags", () => {
  const { flags } = applyRewards(
    {},
    {},
    [],
    { flagsSet: ["FLAG_DUN_01_CLEARED"] }
  );
  assert.equal(flags["FLAG_DUN_01_CLEARED"], true);
});

test("applyRewards unlocks tools idempotently", () => {
  const { tools: t1 } = applyRewards(
    {},
    {},
    [],
    { flagsSet: [], toolUnlocks: ["TOOL_TAGGER"] }
  );
  const { tools: t2 } = applyRewards(
    {},
    {},
    t1,
    { flagsSet: [], toolUnlocks: ["TOOL_TAGGER"] }
  );
  assert.equal(t2.length, 1);
});

test("applyRewards adds items to inventory", () => {
  const { inventory } = applyRewards(
    {},
    {},
    [],
    { flagsSet: [], items: [{ id: "ITEM_CASSETTE_01", qty: 1 }] }
  );
  assert.equal(inventory["ITEM_CASSETTE_01"], 1);
});

test("applyRewards accumulates item quantities", () => {
  const { inventory: inv1 } = applyRewards(
    {},
    {},
    [],
    { flagsSet: [], items: [{ id: "ITEM_TOKEN_BAG_SMALL", qty: 2 }] }
  );
  const { inventory: inv2 } = applyRewards(
    {},
    inv1,
    [],
    { flagsSet: [], items: [{ id: "ITEM_TOKEN_BAG_SMALL", qty: 3 }] }
  );
  assert.equal(inv2["ITEM_TOKEN_BAG_SMALL"], 5);
});
