const { describe, test } = require("node:test");
const assert = require("node:assert");

// ============================================================================
// PURE VALIDATION HELPERS (copied from world_dungeons.ts for Node.js testing)
// ============================================================================

// Helper function to find duplicates in an array
function findDuplicatesPure(items) {
  const counts = {};
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    counts[item] = (counts[item] || 0) + 1;
  }
  return counts;
}

// Validates dungeon specs (pure function, no runtime dependencies)
// Returns array of error messages (empty if valid)
function validateDungeonRegistryPure(dungeonSpecs) {
  const errors = [];
  const allFlags = [];
  const allStageIds = [];

  // Check 1: Exactly 9 dungeons
  if (dungeonSpecs.length !== 9) {
    errors.push(`FAIL: Expected 9 dungeons, found ${dungeonSpecs.length}`);
  }

  // Check each dungeon spec
  for (let i = 0; i < dungeonSpecs.length; i++) {
    const spec = dungeonSpecs[i];
    const dungeonLabel = `Dungeon ${i + 1} (${spec.id})`;
    const isFinalDungeon = i === dungeonSpecs.length - 1;

    // Check 2: introCutsceneId must be set
    if (!spec.introCutsceneId || spec.introCutsceneId.trim() === "") {
      errors.push(
        `FAIL: ${dungeonLabel} - introCutsceneId is missing or empty`
      );
    }

    // Check 3: stages[] must have 4 stages (5 for final dungeon only)
    const expectedStageCount = isFinalDungeon ? 5 : 4;
    if (!spec.stages || spec.stages.length !== expectedStageCount) {
      errors.push(
        `FAIL: ${dungeonLabel} - Expected ${expectedStageCount} stages, found ${
          spec.stages ? spec.stages.length : 0
        }`
      );
    }

    // Check 4: No missing stage IDs (all stages must have non-empty IDs)
    if (spec.stages) {
      for (let j = 0; j < spec.stages.length; j++) {
        const stageId = spec.stages[j];
        if (!stageId || stageId.trim() === "") {
          errors.push(
            `FAIL: ${dungeonLabel} - Stage ${j} has missing or empty ID`
          );
        } else {
          allStageIds.push(stageId);
        }
      }
    }

    // Check 5: hubReturnSpawnTag must be set (no null-ref at exit)
    if (!spec.hubReturnSpawnTag || spec.hubReturnSpawnTag.trim() === "") {
      errors.push(
        `FAIL: ${dungeonLabel} - hubReturnSpawnTag is missing or empty (null-ref at exit)`
      );
    }

    // Check 6: rewards.flagsSet must exist and contain flags
    if (
      !spec.rewards ||
      !spec.rewards.flagsSet ||
      spec.rewards.flagsSet.length === 0
    ) {
      errors.push(
        `FAIL: ${dungeonLabel} - rewards.flagsSet is missing or empty`
      );
    } else {
      // Collect all flags for uniqueness check
      for (let k = 0; k < spec.rewards.flagsSet.length; k++) {
        const flag = spec.rewards.flagsSet[k];
        if (!flag || flag.trim() === "") {
          errors.push(`FAIL: ${dungeonLabel} - Empty flag in rewards.flagsSet`);
        } else {
          allFlags.push(flag);
        }
      }
    }
  }

  // Check 7: All flags must be unique (no duplicates)
  const flagCounts = findDuplicatesPure(allFlags);
  const flagKeys = Object.keys(flagCounts);
  for (let i = 0; i < flagKeys.length; i = i + 1) {
    const flag = flagKeys[i];
    if (flagCounts[flag] > 1) {
      errors.push(
        `FAIL: Flag "${flag}" is used ${flagCounts[flag]} times (must be unique)`
      );
    }
  }

  // Check 8: All stage IDs must be unique (no duplicates)
  const stageIdCounts = findDuplicatesPure(allStageIds);
  const stageKeys = Object.keys(stageIdCounts);
  for (let i = 0; i < stageKeys.length; i = i + 1) {
    const stageId = stageKeys[i];
    if (stageIdCounts[stageId] > 1) {
      errors.push(
        `FAIL: Stage ID "${stageId}" is used ${
          stageIdCounts[stageId]
        } times (must be unique)`
      );
    }
  }

  return errors;
}

// ============================================================================
// TEST FIXTURES (extracted from constants.ts)
// ============================================================================

// Valid dungeon specs (matches production data)
const VALID_DUNGEON_SPECS = [
  {
    id: "DUN_LAUNDROMAT_LABYRINTH",
    playMode: 4, // DUN_PUZZLE
    introCutsceneId: "CUT_DUN_01_ENTRY_BEAT_WASCHMASCHINEN_SINGEN",
    stages: [
      "TM_DUN_01_STAGE_00_WARMUP",
      "TM_DUN_01_STAGE_01_DARK_MAZE",
      "TM_DUN_01_STAGE_02_TOKEN_RUN",
      "TM_DUN_01_STAGE_03_EXIT_ROOM",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_01",
    rewards: {
      flagsSet: ["FLAG_DUN_01_CLEARED"],
      toolUnlocks: ["TOOL_TAGGER"],
      items: [{ id: "ITEM_CASSETTE_01", qty: 1 }],
    },
  },
  {
    id: "DUN_ROOFTOP_INVADERS",
    playMode: 2, // DUN_SHOOTER
    introCutsceneId: "CUT_DUN_02_ENTRY_BEAT_WIND_UEBER_NEON",
    stages: [
      "TM_DUN_02_STAGE_00_RANGE",
      "TM_DUN_02_STAGE_01_FORMATIONS",
      "TM_DUN_02_STAGE_02_ALARM",
      "TM_DUN_02_STAGE_03_CORE",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_02",
    rewards: {
      flagsSet: ["FLAG_DUN_02_CLEARED"],
      toolUnlocks: ["TOOL_CONFETTI_BOMB"],
      items: [{ id: "ITEM_TOKEN_BAG_SMALL", qty: 1 }],
    },
  },
  {
    id: "DUN_WAREHOUSE_BLOCKWORKS",
    playMode: 4, // DUN_PUZZLE
    introCutsceneId: "CUT_DUN_03_ENTRY_BEAT_GABELSTAPLER_GRUESST",
    stages: [
      "TM_DUN_03_STAGE_00_CONVEYOR_INTRO",
      "TM_DUN_03_STAGE_01_BLOCK_ROWS",
      "TM_DUN_03_STAGE_02_MOVING_CRATES",
      "TM_DUN_03_STAGE_03_FINAL_PATTERN",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_03",
    rewards: {
      flagsSet: ["FLAG_DUN_03_CLEARED"],
      toolUnlocks: ["TOOL_SOAP_SLIDE"],
      items: [{ id: "ITEM_KEYCARD_A", qty: 1 }],
    },
  },
  {
    id: "DUN_SUBWAY_TIMING",
    playMode: 3, // DUN_RHYTHM
    introCutsceneId: "CUT_DUN_04_ENTRY_BEAT_TAKT_IM_TUNNEL",
    stages: [
      "TM_DUN_04_STAGE_00_BEAT_TUTORIAL",
      "TM_DUN_04_STAGE_01_DOORS",
      "TM_DUN_04_STAGE_02_SWITCH_CHAIN",
      "TM_DUN_04_STAGE_03_FINAL_STREAK",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_04",
    rewards: {
      flagsSet: ["FLAG_DUN_04_CLEARED"],
      toolUnlocks: ["TOOL_FREEZECAM"],
      items: [{ id: "ITEM_CASSETTE_02", qty: 1 }],
    },
  },
  {
    id: "DUN_SCHOOL_PONG_COURT",
    playMode: 4, // DUN_PUZZLE
    introCutsceneId: "CUT_DUN_05_ENTRY_BEAT_PAUSENKLINGEL_PING",
    stages: [
      "TM_DUN_05_STAGE_00_PADDLE_LEARN",
      "TM_DUN_05_STAGE_01_TARGETS",
      "TM_DUN_05_STAGE_02_REFLECTORS",
      "TM_DUN_05_STAGE_03_FINAL_CLEAR",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_05",
    rewards: {
      flagsSet: ["FLAG_DUN_05_CLEARED", "FLAG_UPG_DASH_COOLDOWN_REDUCED"],
      items: [{ id: "ITEM_KEYCARD_B", qty: 1 }],
    },
  },
  {
    id: "DUN_ARCADE_MUSEUM_ASTEROIDS",
    playMode: 2, // DUN_ASTEROIDS
    introCutsceneId: "CUT_DUN_06_ENTRY_BEAT_SCHWERELLOS_IM_MUSEUM",
    stages: [
      "TM_DUN_06_STAGE_00_THRUST",
      "TM_DUN_06_STAGE_01_SPLIT",
      "TM_DUN_06_STAGE_02_PARTS_RUSH",
      "TM_DUN_06_STAGE_03_SURVIVE",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_06",
    rewards: {
      flagsSet: ["FLAG_DUN_06_CLEARED", "FLAG_TRAV_MAGNET_GLOVE"],
      items: [{ id: "ITEM_CASSETTE_03", qty: 1 }],
    },
  },
  {
    id: "DUN_VIDEO_STORE_PLATFORM_TRIAL",
    playMode: 1, // DUN_PLATFORM
    introCutsceneId: "CUT_DUN_07_ENTRY_BEAT_VHS_REGAL_RUETTELT",
    stages: [
      "TM_DUN_07_STAGE_00_JUMP",
      "TM_DUN_07_STAGE_01_MOVING_SHELVES",
      "TM_DUN_07_STAGE_02_SWITCH_GATES",
      "TM_DUN_07_STAGE_03_FINAL_RUN",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_07",
    rewards: {
      flagsSet: ["FLAG_DUN_07_CLEARED", "FLAG_UPG_LIGHT_DOUBLE_JUMP"],
      items: [{ id: "ITEM_STICKER_SET_01", qty: 1 }],
    },
  },
  {
    id: "DUN_CONSTRUCTION_DONKEY_TOWER",
    playMode: 1, // DUN_PLATFORM
    introCutsceneId: "CUT_DUN_08_ENTRY_BEAT_BAUSTELLE_RUMMST",
    stages: [
      "TM_DUN_08_STAGE_00_LADDERS",
      "TM_DUN_08_STAGE_01_BARRELS",
      "TM_DUN_08_STAGE_02_TRICK_LADDERS",
      "TM_DUN_08_STAGE_03_TOP_PLATFORM",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_08",
    rewards: {
      flagsSet: ["FLAG_DUN_08_CLEARED"],
      toolUnlocks: ["TOOL_DECOY_TOY"],
      items: [{ id: "ITEM_CASSETTE_04", qty: 1 }],
    },
  },
  {
    id: "DUN_FINAL_GLITCH_PANOPTICON",
    playMode: 5, // DUN_META
    introCutsceneId: "CUT_DUN_09_ENTRY_BEAT_DIE_WELT_HAKT",
    stages: [
      "TM_DUN_09_STAGE_00_META_INTRO",
      "TM_DUN_09_STAGE_01_MICRO_PLATFORM",
      "TM_DUN_09_STAGE_02_MICRO_SHOOTER",
      "TM_DUN_09_STAGE_03_MICRO_RHYTHM",
      "TM_DUN_09_STAGE_04_STABILIZE",
    ],
    hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_09",
    rewards: {
      flagsSet: [
        "FLAG_DUN_09_CLEARED",
        "FLAG_GAME_COMPLETED",
        "FLAG_UNLOCK_FREE_ROAM_PLUS",
        "FLAG_UNLOCK_COSMETIC_MASKS",
      ],
    },
  },
];

// ============================================================================
// TESTS
// ============================================================================

describe("Dungeon Registry Validation", () => {
  test("valid dungeon registry passes all checks", () => {
    const errors = validateDungeonRegistryPure(VALID_DUNGEON_SPECS);
    assert.strictEqual(errors.length, 0, `Expected no errors, got: ${errors}`);
  });

  test("detects incorrect dungeon count", () => {
    const tooFew = VALID_DUNGEON_SPECS.slice(0, 5);
    const errors = validateDungeonRegistryPure(tooFew);
    assert.ok(
      errors.some((e) => e.includes("Expected 9 dungeons")),
      "Should detect wrong dungeon count"
    );
  });

  test("detects missing introCutsceneId", () => {
    const specs = [
      ...VALID_DUNGEON_SPECS.slice(0, 8),
      { ...VALID_DUNGEON_SPECS[8], introCutsceneId: "" },
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("introCutsceneId is missing or empty")),
      "Should detect missing introCutsceneId"
    );
  });

  test("detects incorrect stage count for regular dungeon", () => {
    const specs = [
      { ...VALID_DUNGEON_SPECS[0], stages: ["STAGE_1", "STAGE_2"] },
      ...VALID_DUNGEON_SPECS.slice(1),
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("Expected 4 stages")),
      "Should detect wrong stage count for regular dungeon"
    );
  });

  test("detects incorrect stage count for final dungeon", () => {
    const specs = [
      ...VALID_DUNGEON_SPECS.slice(0, 8),
      { ...VALID_DUNGEON_SPECS[8], stages: ["STAGE_1", "STAGE_2", "STAGE_3"] },
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("Expected 5 stages")),
      "Should detect wrong stage count for final dungeon"
    );
  });

  test("detects empty stage IDs", () => {
    const specs = [
      { ...VALID_DUNGEON_SPECS[0], stages: ["STAGE_1", "", "STAGE_3", "STAGE_4"] },
      ...VALID_DUNGEON_SPECS.slice(1),
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("missing or empty ID")),
      "Should detect empty stage ID"
    );
  });

  test("detects missing hubReturnSpawnTag", () => {
    const specs = [
      { ...VALID_DUNGEON_SPECS[0], hubReturnSpawnTag: "" },
      ...VALID_DUNGEON_SPECS.slice(1),
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("hubReturnSpawnTag is missing or empty")),
      "Should detect missing hubReturnSpawnTag"
    );
  });

  test("detects missing rewards.flagsSet", () => {
    const specs = [
      { ...VALID_DUNGEON_SPECS[0], rewards: { flagsSet: [] } },
      ...VALID_DUNGEON_SPECS.slice(1),
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes("rewards.flagsSet is missing or empty")),
      "Should detect missing rewards.flagsSet"
    );
  });

  test("detects duplicate flags across dungeons", () => {
    const specs = [
      ...VALID_DUNGEON_SPECS.slice(0, 8),
      {
        ...VALID_DUNGEON_SPECS[8],
        rewards: {
          ...VALID_DUNGEON_SPECS[8].rewards,
          flagsSet: [
            ...VALID_DUNGEON_SPECS[8].rewards.flagsSet,
            "FLAG_DUN_01_CLEARED", // Duplicate from dungeon 1
          ],
        },
      },
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) => e.includes('Flag "FLAG_DUN_01_CLEARED" is used')),
      "Should detect duplicate flag"
    );
  });

  test("detects duplicate stage IDs across dungeons", () => {
    const specs = [
      ...VALID_DUNGEON_SPECS.slice(0, 1),
      {
        ...VALID_DUNGEON_SPECS[1],
        stages: [
          "TM_DUN_01_STAGE_00_WARMUP", // Duplicate from dungeon 1
          "TM_DUN_02_STAGE_01_FORMATIONS",
          "TM_DUN_02_STAGE_02_ALARM",
          "TM_DUN_02_STAGE_03_CORE",
        ],
      },
      ...VALID_DUNGEON_SPECS.slice(2),
    ];
    const errors = validateDungeonRegistryPure(specs);
    assert.ok(
      errors.some((e) =>
        e.includes('Stage ID "TM_DUN_01_STAGE_00_WARMUP" is used')
      ),
      "Should detect duplicate stage ID"
    );
  });

  test("counts are correct for valid registry", () => {
    // Should have exactly 9 dungeons
    assert.strictEqual(VALID_DUNGEON_SPECS.length, 9);

    // First 8 dungeons should have 4 stages each
    for (let i = 0; i < 8; i++) {
      assert.strictEqual(
        VALID_DUNGEON_SPECS[i].stages.length,
        4,
        `Dungeon ${i + 1} should have 4 stages`
      );
    }

    // Final dungeon should have 5 stages
    assert.strictEqual(
      VALID_DUNGEON_SPECS[8].stages.length,
      5,
      "Final dungeon should have 5 stages"
    );

    // All dungeons should have required fields
    for (let i = 0; i < VALID_DUNGEON_SPECS.length; i++) {
      const spec = VALID_DUNGEON_SPECS[i];
      assert.ok(spec.id, `Dungeon ${i + 1} should have id`);
      assert.ok(spec.introCutsceneId, `Dungeon ${i + 1} should have introCutsceneId`);
      assert.ok(spec.hubReturnSpawnTag, `Dungeon ${i + 1} should have hubReturnSpawnTag`);
      assert.ok(spec.rewards, `Dungeon ${i + 1} should have rewards`);
      assert.ok(spec.rewards.flagsSet, `Dungeon ${i + 1} should have rewards.flagsSet`);
      assert.ok(
        spec.rewards.flagsSet.length > 0,
        `Dungeon ${i + 1} should have at least one flag`
      );
    }
  });

  test("all stage IDs are unique", () => {
    const allStageIds = [];
    for (const spec of VALID_DUNGEON_SPECS) {
      allStageIds.push(...spec.stages);
    }

    const counts = findDuplicatesPure(allStageIds);
    const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);

    assert.strictEqual(
      duplicates.length,
      0,
      `Found duplicate stage IDs: ${duplicates.map(([id, count]) => `${id}(${count})`).join(", ")}`
    );
  });

  test("all reward flags are unique", () => {
    const allFlags = [];
    for (const spec of VALID_DUNGEON_SPECS) {
      allFlags.push(...spec.rewards.flagsSet);
    }

    const counts = findDuplicatesPure(allFlags);
    const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);

    assert.strictEqual(
      duplicates.length,
      0,
      `Found duplicate flags: ${duplicates.map(([id, count]) => `${id}(${count})`).join(", ")}`
    );
  });
});
