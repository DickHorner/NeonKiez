// Test suite for inventory and flag helper functions
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  checkFlag,
  setFlagPure,
  checkToolUnlocked,
  unlockToolPure,
  addItemPure,
  getItemCountPure,
} = require('./helpers.js');

describe('Flag Helpers', () => {
  it('should return false for non-existent flag', () => {
    const flags = {};
    assert.strictEqual(checkFlag(flags, 'FLAG_TEST'), false);
  });

  it('should return true for existing true flag', () => {
    const flags = { FLAG_TEST: true };
    assert.strictEqual(checkFlag(flags, 'FLAG_TEST'), true);
  });

  it('should return false for existing false flag', () => {
    const flags = { FLAG_TEST: false };
    assert.strictEqual(checkFlag(flags, 'FLAG_TEST'), false);
  });

  it('should set flag to true by default', () => {
    const flags = {};
    const newFlags = setFlagPure(flags, 'FLAG_TEST');
    assert.strictEqual(newFlags.FLAG_TEST, true);
    assert.strictEqual(flags.FLAG_TEST, undefined); // Original unchanged
  });

  it('should set flag to specified value', () => {
    const flags = {};
    const newFlags = setFlagPure(flags, 'FLAG_TEST', false);
    assert.strictEqual(newFlags.FLAG_TEST, false);
  });

  it('should not mutate original flags object', () => {
    const flags = { FLAG_A: true };
    const newFlags = setFlagPure(flags, 'FLAG_B', true);
    assert.strictEqual(flags.FLAG_B, undefined);
    assert.strictEqual(newFlags.FLAG_A, true);
    assert.strictEqual(newFlags.FLAG_B, true);
  });

  it('should handle multiple flags independently', () => {
    const flags = { FLAG_A: true, FLAG_B: false, FLAG_C: true };
    assert.strictEqual(checkFlag(flags, 'FLAG_A'), true);
    assert.strictEqual(checkFlag(flags, 'FLAG_B'), false);
    assert.strictEqual(checkFlag(flags, 'FLAG_C'), true);
    assert.strictEqual(checkFlag(flags, 'FLAG_D'), false);
  });
});

describe('Inventory Helpers', () => {
  it('should return 0 for non-existent item', () => {
    const inventory = {};
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_TEST'), 0);
  });

  it('should return correct count for existing item', () => {
    const inventory = { ITEM_TEST: 5 };
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_TEST'), 5);
  });

  it('should add item to empty inventory', () => {
    const inventory = {};
    const newInventory = addItemPure(inventory, 'ITEM_TEST', 3);
    assert.strictEqual(newInventory.ITEM_TEST, 3);
    assert.strictEqual(inventory.ITEM_TEST, undefined); // Original unchanged
  });

  it('should add to existing item count', () => {
    const inventory = { ITEM_TEST: 5 };
    const newInventory = addItemPure(inventory, 'ITEM_TEST', 3);
    assert.strictEqual(newInventory.ITEM_TEST, 8);
  });

  it('should handle negative quantities', () => {
    const inventory = { ITEM_TEST: 5 };
    const newInventory = addItemPure(inventory, 'ITEM_TEST', -2);
    assert.strictEqual(newInventory.ITEM_TEST, 3);
  });

  it('should not mutate original inventory', () => {
    const inventory = { ITEM_A: 1 };
    const newInventory = addItemPure(inventory, 'ITEM_B', 2);
    assert.strictEqual(inventory.ITEM_B, undefined);
    assert.strictEqual(newInventory.ITEM_A, 1);
    assert.strictEqual(newInventory.ITEM_B, 2);
  });

  it('should handle multiple items independently', () => {
    const inventory = { ITEM_A: 3, ITEM_B: 7, ITEM_C: 1 };
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_A'), 3);
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_B'), 7);
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_C'), 1);
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_D'), 0);
  });

  it('should accumulate multiple additions', () => {
    let inventory = {};
    inventory = addItemPure(inventory, 'ITEM_CASSETTE', 1);
    inventory = addItemPure(inventory, 'ITEM_CASSETTE', 1);
    inventory = addItemPure(inventory, 'ITEM_CASSETTE', 2);
    assert.strictEqual(getItemCountPure(inventory, 'ITEM_CASSETTE'), 4);
  });
});

describe('Tool Unlock Helpers', () => {
  it('should return false for tool not in list', () => {
    const tools = [];
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_TEST'), false);
  });

  it('should return true for tool in list', () => {
    const tools = ['TOOL_A', 'TOOL_B'];
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_A'), true);
  });

  it('should unlock new tool', () => {
    const tools = [];
    const newTools = unlockToolPure(tools, 'TOOL_TEST');
    assert.strictEqual(newTools.length, 1);
    assert.strictEqual(newTools[0], 'TOOL_TEST');
    assert.strictEqual(tools.length, 0); // Original unchanged
  });

  it('should not duplicate existing tool', () => {
    const tools = ['TOOL_A'];
    const newTools = unlockToolPure(tools, 'TOOL_A');
    assert.strictEqual(newTools.length, 1);
    assert.strictEqual(newTools[0], 'TOOL_A');
  });

  it('should maintain tool unlock idempotency', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_FREEZECAM');
    tools = unlockToolPure(tools, 'TOOL_FREEZECAM');
    tools = unlockToolPure(tools, 'TOOL_FREEZECAM');
    assert.strictEqual(tools.length, 1);
    assert.strictEqual(tools[0], 'TOOL_FREEZECAM');
  });

  it('should preserve order when unlocking multiple tools', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_A');
    tools = unlockToolPure(tools, 'TOOL_B');
    tools = unlockToolPure(tools, 'TOOL_C');
    assert.strictEqual(tools.length, 3);
    assert.strictEqual(tools[0], 'TOOL_A');
    assert.strictEqual(tools[1], 'TOOL_B');
    assert.strictEqual(tools[2], 'TOOL_C');
  });

  it('should handle interleaved unlock attempts', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_A');
    tools = unlockToolPure(tools, 'TOOL_B');
    tools = unlockToolPure(tools, 'TOOL_A'); // duplicate
    tools = unlockToolPure(tools, 'TOOL_C');
    tools = unlockToolPure(tools, 'TOOL_B'); // duplicate
    assert.strictEqual(tools.length, 3);
    assert.deepStrictEqual(tools, ['TOOL_A', 'TOOL_B', 'TOOL_C']);
  });
});

describe('State Helper Invariants', () => {
  it('should maintain flag immutability across operations', () => {
    const initial = { FLAG_A: true };
    const afterB = setFlagPure(initial, 'FLAG_B', true);
    const afterC = setFlagPure(afterB, 'FLAG_C', true);

    // Original unchanged
    assert.deepStrictEqual(initial, { FLAG_A: true });
    // Each step preserves previous state
    assert.deepStrictEqual(afterB, { FLAG_A: true, FLAG_B: true });
    assert.deepStrictEqual(afterC, { FLAG_A: true, FLAG_B: true, FLAG_C: true });
  });

  it('should maintain inventory immutability across operations', () => {
    const initial = { ITEM_A: 1 };
    const afterB = addItemPure(initial, 'ITEM_B', 2);
    const afterA = addItemPure(afterB, 'ITEM_A', 3);

    // Original unchanged
    assert.deepStrictEqual(initial, { ITEM_A: 1 });
    // Each step preserves previous state
    assert.deepStrictEqual(afterB, { ITEM_A: 1, ITEM_B: 2 });
    assert.deepStrictEqual(afterA, { ITEM_A: 4, ITEM_B: 2 });
  });

  it('should maintain tool list immutability across operations', () => {
    const initial = ['TOOL_A'];
    const afterB = unlockToolPure(initial, 'TOOL_B');
    const afterC = unlockToolPure(afterB, 'TOOL_C');

    // Original unchanged
    assert.deepStrictEqual(initial, ['TOOL_A']);
    // Each step preserves previous state
    assert.deepStrictEqual(afterB, ['TOOL_A', 'TOOL_B']);
    assert.deepStrictEqual(afterC, ['TOOL_A', 'TOOL_B', 'TOOL_C']);
  });
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
