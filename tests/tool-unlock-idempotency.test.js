// Test suite for tool unlock idempotency
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  unlockToolPure,
  checkToolUnlocked,
  applyDungeonRewardsPure,
} = require('./helpers.js');

describe('Tool Unlock Idempotency', () => {
  it('should unlock tool exactly once on first call', () => {
    const tools = [];
    const result = unlockToolPure(tools, 'TOOL_FREEZECAM');
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result, ['TOOL_FREEZECAM']);
  });

  it('should return same array on duplicate unlock attempt', () => {
    let tools = ['TOOL_FREEZECAM'];
    const result = unlockToolPure(tools, 'TOOL_FREEZECAM');
    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result, ['TOOL_FREEZECAM']);
  });

  it('should maintain idempotency over multiple calls', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_TAGGER');
    assert.strictEqual(tools.length, 1);

    tools = unlockToolPure(tools, 'TOOL_TAGGER');
    assert.strictEqual(tools.length, 1);

    tools = unlockToolPure(tools, 'TOOL_TAGGER');
    assert.strictEqual(tools.length, 1);

    tools = unlockToolPure(tools, 'TOOL_TAGGER');
    assert.strictEqual(tools.length, 1);

    assert.deepStrictEqual(tools, ['TOOL_TAGGER']);
  });

  it('should maintain idempotency with different tools', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_A');
    tools = unlockToolPure(tools, 'TOOL_B');
    tools = unlockToolPure(tools, 'TOOL_A'); // duplicate
    tools = unlockToolPure(tools, 'TOOL_C');
    tools = unlockToolPure(tools, 'TOOL_B'); // duplicate
    tools = unlockToolPure(tools, 'TOOL_A'); // duplicate

    assert.strictEqual(tools.length, 3);
    assert.deepStrictEqual(tools, ['TOOL_A', 'TOOL_B', 'TOOL_C']);
  });

  it('should maintain idempotency when unlocking all game tools', () => {
    const allTools = [
      'TOOL_FREEZECAM',
      'TOOL_CONFETTI_BOMB',
      'TOOL_SOAP_SLIDE',
      'TOOL_DECOY_TOY',
      'TOOL_TAGGER',
    ];

    let tools = [];

    // First pass - unlock all
    for (const tool of allTools) {
      tools = unlockToolPure(tools, tool);
    }
    assert.strictEqual(tools.length, 5);

    // Second pass - attempt to unlock all again
    for (const tool of allTools) {
      tools = unlockToolPure(tools, tool);
    }
    assert.strictEqual(tools.length, 5);

    // Third pass - attempt to unlock all again
    for (const tool of allTools) {
      tools = unlockToolPure(tools, tool);
    }
    assert.strictEqual(tools.length, 5);

    assert.deepStrictEqual(tools, allTools);
  });

  it('should maintain idempotency in random order unlocks', () => {
    let tools = [];
    const unlockSequence = [
      'TOOL_C',
      'TOOL_A',
      'TOOL_B',
      'TOOL_C', // dup
      'TOOL_A', // dup
      'TOOL_D',
      'TOOL_B', // dup
      'TOOL_E',
      'TOOL_C', // dup
    ];

    for (const tool of unlockSequence) {
      tools = unlockToolPure(tools, tool);
    }

    assert.strictEqual(tools.length, 5);
    assert.deepStrictEqual(tools, ['TOOL_C', 'TOOL_A', 'TOOL_B', 'TOOL_D', 'TOOL_E']);
  });
});

describe('Tool Unlock via Dungeon Rewards Idempotency', () => {
  it('should unlock tool via reward application', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_01_CLEARED'],
      toolUnlocks: ['TOOL_TAGGER'],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(result.tools.length, 1);
    assert.strictEqual(checkToolUnlocked(result.tools, 'TOOL_TAGGER'), true);
  });

  it('should maintain idempotency when applying same reward multiple times', () => {
    let flags = {};
    let tools = [];
    let inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_01_CLEARED'],
      toolUnlocks: ['TOOL_TAGGER'],
    };

    // Apply rewards first time
    const result1 = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    flags = result1.flags;
    tools = result1.tools;
    inventory = result1.inventory;
    assert.strictEqual(tools.length, 1);

    // Apply rewards second time (simulating duplicate dungeon clear)
    const result2 = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    flags = result2.flags;
    tools = result2.tools;
    inventory = result2.inventory;
    assert.strictEqual(tools.length, 1);

    // Apply rewards third time
    const result3 = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(result3.tools.length, 1);
    assert.deepStrictEqual(result3.tools, ['TOOL_TAGGER']);
  });

  it('should maintain idempotency across multiple dungeon rewards', () => {
    let flags = {};
    let tools = [];
    let inventory = {};

    const dungeon1Rewards = {
      flagsSet: ['FLAG_DUN_01_CLEARED'],
      toolUnlocks: ['TOOL_TAGGER'],
    };

    const dungeon2Rewards = {
      flagsSet: ['FLAG_DUN_02_CLEARED'],
      toolUnlocks: ['TOOL_CONFETTI_BOMB'],
    };

    const dungeon4Rewards = {
      flagsSet: ['FLAG_DUN_04_CLEARED'],
      toolUnlocks: ['TOOL_FREEZECAM'],
    };

    // Apply dungeon 1 rewards
    let result = applyDungeonRewardsPure(flags, tools, inventory, dungeon1Rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 1);

    // Apply dungeon 2 rewards
    result = applyDungeonRewardsPure(flags, tools, inventory, dungeon2Rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 2);

    // Apply dungeon 1 rewards again (duplicate)
    result = applyDungeonRewardsPure(flags, tools, inventory, dungeon1Rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 2);

    // Apply dungeon 4 rewards
    result = applyDungeonRewardsPure(flags, tools, inventory, dungeon4Rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 3);

    // Apply dungeon 2 rewards again (duplicate)
    result = applyDungeonRewardsPure(flags, tools, inventory, dungeon2Rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 3);

    assert.deepStrictEqual(tools, ['TOOL_TAGGER', 'TOOL_CONFETTI_BOMB', 'TOOL_FREEZECAM']);
  });

  it('should handle reward with multiple tool unlocks idempotently', () => {
    let flags = {};
    let tools = [];
    let inventory = {};

    const rewards = {
      flagsSet: ['FLAG_SPECIAL'],
      toolUnlocks: ['TOOL_A', 'TOOL_B', 'TOOL_C'],
    };

    // First application
    let result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 3);

    // Second application (all should be idempotent)
    result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    flags = result.flags;
    tools = result.tools;
    inventory = result.inventory;
    assert.strictEqual(tools.length, 3);

    // Third application
    result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(result.tools.length, 3);
    assert.deepStrictEqual(result.tools, ['TOOL_A', 'TOOL_B', 'TOOL_C']);
  });
});

describe('Tool Unlock State Consistency', () => {
  it('should maintain consistent state across save/load simulation', () => {
    let tools = [];

    // Unlock tools
    tools = unlockToolPure(tools, 'TOOL_FREEZECAM');
    tools = unlockToolPure(tools, 'TOOL_TAGGER');

    // Simulate save
    const savedTools = [...tools];

    // Continue unlocking
    tools = unlockToolPure(tools, 'TOOL_SOAP_SLIDE');
    tools = unlockToolPure(tools, 'TOOL_FREEZECAM'); // duplicate

    // Simulate load
    let loadedTools = [...savedTools];

    // Continue from loaded state
    loadedTools = unlockToolPure(loadedTools, 'TOOL_SOAP_SLIDE');
    loadedTools = unlockToolPure(loadedTools, 'TOOL_FREEZECAM'); // duplicate

    assert.deepStrictEqual(tools, loadedTools);
  });

  it('should preserve tool order deterministically', () => {
    const sequence1 = ['TOOL_A', 'TOOL_B', 'TOOL_C'];
    const sequence2 = ['TOOL_B', 'TOOL_A', 'TOOL_C'];

    let tools1 = [];
    for (const tool of sequence1) {
      tools1 = unlockToolPure(tools1, tool);
    }

    let tools2 = [];
    for (const tool of sequence2) {
      tools2 = unlockToolPure(tools2, tool);
    }

    // Different unlock order = different array order
    assert.deepStrictEqual(tools1, ['TOOL_A', 'TOOL_B', 'TOOL_C']);
    assert.deepStrictEqual(tools2, ['TOOL_B', 'TOOL_A', 'TOOL_C']);
    assert.strictEqual(tools1.length, tools2.length);
  });

  it('should handle empty tool rewards gracefully', () => {
    const flags = {};
    const tools = ['TOOL_EXISTING'];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_NO_TOOLS'],
      // No toolUnlocks
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.deepStrictEqual(result.tools, ['TOOL_EXISTING']);
  });

  it('should handle undefined tool unlocks gracefully', () => {
    const flags = {};
    const tools = ['TOOL_EXISTING'];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_NO_TOOLS'],
      toolUnlocks: undefined,
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.deepStrictEqual(result.tools, ['TOOL_EXISTING']);
  });
});

describe('Tool Unlock Edge Cases', () => {
  it('should handle tool unlock with special characters', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_WITH_UNDERSCORE');
    tools = unlockToolPure(tools, 'TOOL-WITH-DASH');
    tools = unlockToolPure(tools, 'tool.with.dots');

    assert.strictEqual(tools.length, 3);
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_WITH_UNDERSCORE'), true);
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL-WITH-DASH'), true);
    assert.strictEqual(checkToolUnlocked(tools, 'tool.with.dots'), true);
  });

  it('should handle case-sensitive tool IDs', () => {
    let tools = [];
    tools = unlockToolPure(tools, 'TOOL_A');
    tools = unlockToolPure(tools, 'tool_a');
    tools = unlockToolPure(tools, 'Tool_A');

    // All are different due to case sensitivity
    assert.strictEqual(tools.length, 3);
  });

  it('should maintain idempotency with large number of unlock attempts', () => {
    let tools = [];

    // Unlock same tool 100 times
    for (let i = 0; i < 100; i++) {
      tools = unlockToolPure(tools, 'TOOL_SPAM');
    }

    assert.strictEqual(tools.length, 1);
    assert.deepStrictEqual(tools, ['TOOL_SPAM']);
  });

  it('should handle interleaved unlock and check operations', () => {
    let tools = [];

    tools = unlockToolPure(tools, 'TOOL_A');
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_A'), true);
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_B'), false);

    tools = unlockToolPure(tools, 'TOOL_B');
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_A'), true);
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_B'), true);

    tools = unlockToolPure(tools, 'TOOL_A'); // duplicate
    assert.strictEqual(checkToolUnlocked(tools, 'TOOL_A'), true);
    assert.strictEqual(tools.length, 2);
  });
});
