// Test suite for dungeon clear gating logic
const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  isDungeonClearedPure,
  checkAllDungeonsClearExceptFinalPure,
  applyDungeonRewardsPure,
  checkFlag,
} = require('./helpers.js');

// Sample dungeon specs matching the game structure
const SAMPLE_DUNGEONS = [
  {
    id: 'DUN_LAUNDROMAT_LABYRINTH',
    rewards: {
      flagsSet: ['FLAG_DUN_01_CLEARED'],
      toolUnlocks: ['TOOL_TAGGER'],
      items: [{ id: 'ITEM_CASSETTE_01', qty: 1 }],
    },
  },
  {
    id: 'DUN_ROOFTOP_INVADERS',
    rewards: {
      flagsSet: ['FLAG_DUN_02_CLEARED'],
      toolUnlocks: ['TOOL_CONFETTI_BOMB'],
      items: [{ id: 'ITEM_TOKEN_BAG_SMALL', qty: 1 }],
    },
  },
  {
    id: 'DUN_WAREHOUSE_BLOCKWORKS',
    rewards: {
      flagsSet: ['FLAG_DUN_03_CLEARED'],
      toolUnlocks: ['TOOL_SOAP_SLIDE'],
      items: [{ id: 'ITEM_KEYCARD_A', qty: 1 }],
    },
  },
  {
    id: 'DUN_SUBWAY_TIMING',
    rewards: {
      flagsSet: ['FLAG_DUN_04_CLEARED'],
      toolUnlocks: ['TOOL_FREEZECAM'],
      items: [{ id: 'ITEM_CASSETTE_02', qty: 1 }],
    },
  },
  {
    id: 'DUN_SCHOOL_PONG_COURT',
    rewards: {
      flagsSet: ['FLAG_DUN_05_CLEARED', 'FLAG_UPG_DASH_COOLDOWN_REDUCED'],
      items: [{ id: 'ITEM_KEYCARD_B', qty: 1 }],
    },
  },
  {
    id: 'DUN_ARCADE_MUSEUM_ASTEROIDS',
    rewards: {
      flagsSet: ['FLAG_DUN_06_CLEARED', 'FLAG_TRAV_MAGNET_GLOVE'],
      items: [{ id: 'ITEM_CASSETTE_03', qty: 1 }],
    },
  },
  {
    id: 'DUN_VIDEO_STORE_PLATFORM_TRIAL',
    rewards: {
      flagsSet: ['FLAG_DUN_07_CLEARED', 'FLAG_UPG_LIGHT_DOUBLE_JUMP'],
      items: [{ id: 'ITEM_STICKER_SET_01', qty: 1 }],
    },
  },
  {
    id: 'DUN_CONSTRUCTION_DONKEY_TOWER',
    rewards: {
      flagsSet: ['FLAG_DUN_08_CLEARED'],
      toolUnlocks: ['TOOL_DECOY_TOY'],
      items: [{ id: 'ITEM_CASSETTE_04', qty: 1 }],
    },
  },
  {
    id: 'DUN_FINAL_GLITCH_PANOPTICON',
    rewards: {
      flagsSet: [
        'FLAG_DUN_09_CLEARED',
        'FLAG_GAME_COMPLETED',
        'FLAG_UNLOCK_FREE_ROAM_PLUS',
        'FLAG_UNLOCK_COSMETIC_MASKS',
      ],
    },
  },
];

describe('Dungeon Clear Detection', () => {
  it('should detect uncleared dungeon with no flags', () => {
    const flags = {};
    const dungeon1Flags = ['FLAG_DUN_01_CLEARED'];
    assert.strictEqual(isDungeonClearedPure(flags, dungeon1Flags), false);
  });

  it('should detect cleared dungeon with CLEARED flag set', () => {
    const flags = { FLAG_DUN_01_CLEARED: true };
    const dungeon1Flags = ['FLAG_DUN_01_CLEARED'];
    assert.strictEqual(isDungeonClearedPure(flags, dungeon1Flags), true);
  });

  it('should detect cleared dungeon with CLEARED flag among multiple flags', () => {
    const flags = { FLAG_DUN_05_CLEARED: true, FLAG_UPG_DASH_COOLDOWN_REDUCED: true };
    const dungeon5Flags = ['FLAG_DUN_05_CLEARED', 'FLAG_UPG_DASH_COOLDOWN_REDUCED'];
    assert.strictEqual(isDungeonClearedPure(flags, dungeon5Flags), true);
  });

  it('should not detect cleared dungeon if CLEARED flag is false', () => {
    const flags = { FLAG_DUN_01_CLEARED: false };
    const dungeon1Flags = ['FLAG_DUN_01_CLEARED'];
    assert.strictEqual(isDungeonClearedPure(flags, dungeon1Flags), false);
  });

  it('should handle dungeon with no CLEARED flag gracefully', () => {
    const flags = { FLAG_SOME_OTHER: true };
    const nonClearedFlags = ['FLAG_SOME_OTHER'];
    assert.strictEqual(isDungeonClearedPure(flags, nonClearedFlags), false);
  });

  it('should correctly identify first CLEARED flag in list', () => {
    const flags = { FLAG_DUN_09_CLEARED: true };
    const dungeon9Flags = [
      'FLAG_DUN_09_CLEARED',
      'FLAG_GAME_COMPLETED',
      'FLAG_UNLOCK_FREE_ROAM_PLUS',
    ];
    assert.strictEqual(isDungeonClearedPure(flags, dungeon9Flags), true);
  });
});

describe('All Dungeons Clear Gating (Except Final)', () => {
  it('should return false when no dungeons are cleared', () => {
    const flags = {};
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );
  });

  it('should return false when only some dungeons are cleared', () => {
    const flags = {
      FLAG_DUN_01_CLEARED: true,
      FLAG_DUN_02_CLEARED: true,
      FLAG_DUN_03_CLEARED: true,
    };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );
  });

  it('should return true when all dungeons except final are cleared', () => {
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
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      true
    );
  });

  it('should return true even if final dungeon is also cleared', () => {
    const flags = {
      FLAG_DUN_01_CLEARED: true,
      FLAG_DUN_02_CLEARED: true,
      FLAG_DUN_03_CLEARED: true,
      FLAG_DUN_04_CLEARED: true,
      FLAG_DUN_05_CLEARED: true,
      FLAG_DUN_06_CLEARED: true,
      FLAG_DUN_07_CLEARED: true,
      FLAG_DUN_08_CLEARED: true,
      FLAG_DUN_09_CLEARED: true,
    };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      true
    );
  });

  it('should handle edge case of exactly 7 cleared (missing one)', () => {
    const flags = {
      FLAG_DUN_01_CLEARED: true,
      FLAG_DUN_02_CLEARED: true,
      FLAG_DUN_03_CLEARED: true,
      FLAG_DUN_04_CLEARED: true,
      FLAG_DUN_05_CLEARED: true,
      FLAG_DUN_06_CLEARED: true,
      FLAG_DUN_07_CLEARED: true,
      // FLAG_DUN_08_CLEARED missing
    };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );
  });

  it('should not count final dungeon clear toward gating requirement', () => {
    const flags = {
      FLAG_DUN_09_CLEARED: true, // Only final cleared
    };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );
  });
});

describe('Dungeon Rewards Application', () => {
  it('should apply flags from rewards', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_01_CLEARED', 'FLAG_BONUS'],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_DUN_01_CLEARED'), true);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_BONUS'), true);
  });

  it('should apply tool unlocks from rewards', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_04_CLEARED'],
      toolUnlocks: ['TOOL_FREEZECAM'],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.deepStrictEqual(result.tools, ['TOOL_FREEZECAM']);
  });

  it('should apply items from rewards', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_01_CLEARED'],
      items: [{ id: 'ITEM_CASSETTE_01', qty: 1 }],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(result.inventory.ITEM_CASSETTE_01, 1);
  });

  it('should apply all reward types simultaneously', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_DUN_02_CLEARED'],
      toolUnlocks: ['TOOL_CONFETTI_BOMB'],
      items: [{ id: 'ITEM_TOKEN_BAG_SMALL', qty: 1 }],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_DUN_02_CLEARED'), true);
    assert.deepStrictEqual(result.tools, ['TOOL_CONFETTI_BOMB']);
    assert.strictEqual(result.inventory.ITEM_TOKEN_BAG_SMALL, 1);
  });

  it('should preserve existing state when applying rewards', () => {
    const flags = { FLAG_EXISTING: true };
    const tools = ['TOOL_EXISTING'];
    const inventory = { ITEM_EXISTING: 3 };
    const rewards = {
      flagsSet: ['FLAG_NEW'],
      toolUnlocks: ['TOOL_NEW'],
      items: [{ id: 'ITEM_NEW', qty: 2 }],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);

    // Original state preserved
    assert.strictEqual(checkFlag(result.flags, 'FLAG_EXISTING'), true);
    assert.strictEqual(result.tools.includes('TOOL_EXISTING'), true);
    assert.strictEqual(result.inventory.ITEM_EXISTING, 3);

    // New state added
    assert.strictEqual(checkFlag(result.flags, 'FLAG_NEW'), true);
    assert.strictEqual(result.tools.includes('TOOL_NEW'), true);
    assert.strictEqual(result.inventory.ITEM_NEW, 2);
  });

  it('should handle multiple flags in reward', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: [
        'FLAG_DUN_09_CLEARED',
        'FLAG_GAME_COMPLETED',
        'FLAG_UNLOCK_FREE_ROAM_PLUS',
        'FLAG_UNLOCK_COSMETIC_MASKS',
      ],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_DUN_09_CLEARED'), true);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_GAME_COMPLETED'), true);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_UNLOCK_FREE_ROAM_PLUS'), true);
    assert.strictEqual(checkFlag(result.flags, 'FLAG_UNLOCK_COSMETIC_MASKS'), true);
  });

  it('should handle multiple items in reward', () => {
    const flags = {};
    const tools = [];
    const inventory = {};
    const rewards = {
      flagsSet: ['FLAG_BONUS'],
      items: [
        { id: 'ITEM_CASSETTE_01', qty: 1 },
        { id: 'ITEM_CASSETTE_02', qty: 1 },
        { id: 'ITEM_TOKEN_BAG_SMALL', qty: 2 },
      ],
    };

    const result = applyDungeonRewardsPure(flags, tools, inventory, rewards);
    assert.strictEqual(result.inventory.ITEM_CASSETTE_01, 1);
    assert.strictEqual(result.inventory.ITEM_CASSETTE_02, 1);
    assert.strictEqual(result.inventory.ITEM_TOKEN_BAG_SMALL, 2);
  });

  it('should not mutate original state objects', () => {
    const flags = { FLAG_A: true };
    const tools = ['TOOL_A'];
    const inventory = { ITEM_A: 1 };
    const rewards = {
      flagsSet: ['FLAG_B'],
      toolUnlocks: ['TOOL_B'],
      items: [{ id: 'ITEM_B', qty: 1 }],
    };

    applyDungeonRewardsPure(flags, tools, inventory, rewards);

    // Original state unchanged
    assert.deepStrictEqual(flags, { FLAG_A: true });
    assert.deepStrictEqual(tools, ['TOOL_A']);
    assert.deepStrictEqual(inventory, { ITEM_A: 1 });
  });
});

describe('Dungeon Gating Progressive Scenarios', () => {
  it('should track progressive dungeon completion', () => {
    let flags = {};

    // Initially, no dungeons cleared
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );

    // Clear dungeons 1-4
    flags = { ...flags, FLAG_DUN_01_CLEARED: true };
    flags = { ...flags, FLAG_DUN_02_CLEARED: true };
    flags = { ...flags, FLAG_DUN_03_CLEARED: true };
    flags = { ...flags, FLAG_DUN_04_CLEARED: true };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );

    // Clear dungeons 5-7
    flags = { ...flags, FLAG_DUN_05_CLEARED: true };
    flags = { ...flags, FLAG_DUN_06_CLEARED: true };
    flags = { ...flags, FLAG_DUN_07_CLEARED: true };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      false
    );

    // Clear dungeon 8 - final gate should open
    flags = { ...flags, FLAG_DUN_08_CLEARED: true };
    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      true
    );
  });

  it('should handle dungeon clear in non-sequential order', () => {
    const flags = {
      FLAG_DUN_08_CLEARED: true,
      FLAG_DUN_01_CLEARED: true,
      FLAG_DUN_05_CLEARED: true,
      FLAG_DUN_03_CLEARED: true,
      FLAG_DUN_07_CLEARED: true,
      FLAG_DUN_02_CLEARED: true,
      FLAG_DUN_04_CLEARED: true,
      FLAG_DUN_06_CLEARED: true,
    };

    assert.strictEqual(
      checkAllDungeonsClearExceptFinalPure(flags, SAMPLE_DUNGEONS),
      true
    );
  });
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
