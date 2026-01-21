// DungeonRegistry: 9 Specs, Dungeon entry/return wiring
// NOTE: Uses shared globals from constants/state; imports are unnecessary in Arcade projects.

// All dungeon specs are in constants.ts (DUNGEON_SPECS)
// This file contains helper functions for dungeon management

function getDungeonSpec(dungeonId: string) {
  return DUNGEON_SPECS.find((d) => d.id === dungeonId);
}

function isDungeonCleared(dungeonId: string): boolean {
  const spec = getDungeonSpec(dungeonId);
  if (!spec) return false;

  let clearFlag = null;
  const flagsSet = (spec.rewards && spec.rewards.flagsSet) || [];
  for (let i = 0; i < flagsSet.length; i++) {
    if (flagsSet[i].includes("CLEARED")) {
      clearFlag = flagsSet[i];
      break;
    }
  }
  return clearFlag ? hasFlag(clearFlag) : false;
}

function checkAllDungeonsClearExceptFinal(): boolean {
  let count = 0;
  for (let i = 0; i < DUNGEON_SPECS.length - 1; i++) {
    if (isDungeonCleared(DUNGEON_SPECS[i].id)) {
      count++;
    }
  }
  return count >= DUNGEON_SPECS.length - 1;
}

// Helper function to find duplicates in an array
function findDuplicates(items: string[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    counts[item] = (counts[item] || 0) + 1;
  }
  return counts;
}

// Dungeon Registry Validation
// Validates that all dungeon specs are complete and consistent
function validateDungeonRegistry(): string[] {
  const errors: string[] = [];
  const allFlags: string[] = [];
  const allStageIds: string[] = [];

  // Check 1: Exactly 9 dungeons
  if (DUNGEON_SPECS.length !== 9) {
    errors.push(
      `FAIL: Expected 9 dungeons, found ${DUNGEON_SPECS.length}`
    );
  }

  // Check each dungeon spec
  for (let i = 0; i < DUNGEON_SPECS.length; i++) {
    const spec = DUNGEON_SPECS[i];
    const dungeonLabel = `Dungeon ${i + 1} (${spec.id})`;
    const isFinalDungeon = i === DUNGEON_SPECS.length - 1;

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
        `FAIL: ${dungeonLabel} - Expected ${expectedStageCount} stages, found ${spec.stages ? spec.stages.length : 0}`
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
    if (!spec.rewards || !spec.rewards.flagsSet || spec.rewards.flagsSet.length === 0) {
      errors.push(
        `FAIL: ${dungeonLabel} - rewards.flagsSet is missing or empty`
      );
    } else {
      // Collect all flags for uniqueness check
      for (let k = 0; k < spec.rewards.flagsSet.length; k++) {
        const flag = spec.rewards.flagsSet[k];
        if (!flag || flag.trim() === "") {
          errors.push(
            `FAIL: ${dungeonLabel} - Empty flag in rewards.flagsSet`
          );
        } else {
          allFlags.push(flag);
        }
      }
    }
  }

  // Check 7: All flags must be unique (no duplicates)
  const flagCounts = findDuplicates(allFlags);
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
  const stageIdCounts = findDuplicates(allStageIds);
  const stageKeys = Object.keys(stageIdCounts);
  for (let i = 0; i < stageKeys.length; i = i + 1) {
    const stageId = stageKeys[i];
    if (stageIdCounts[stageId] > 1) {
      errors.push(
        `FAIL: Stage ID "${stageId}" is used ${stageIdCounts[stageId]} times (must be unique)`
      );
    }
  }

  return errors;
}

// Run validation and report results
function runDungeonRegistryValidation(): void {
  const errors = validateDungeonRegistry();
  
  if (errors.length === 0) {
    game.splash("✅ DUNGEON REGISTRY VALIDATION PASSED");
    console.log("=== DUNGEON REGISTRY VALIDATION ===");
    console.log("✅ All checks passed:");
    console.log(`  - ${DUNGEON_SPECS.length} dungeons present`);
    console.log("  - All introCutsceneIds set");
    console.log("  - All stages arrays complete (4-5 stages)");
    console.log("  - All rewards/flags unique");
    console.log("  - No missing stage IDs");
    console.log("  - No null-refs at entry/exit");
    console.log("===================================");
  } else {
    console.log("=== DUNGEON REGISTRY VALIDATION ===");
    console.log(`❌ ${errors.length} validation error(s) found:`);
    for (let i = 0; i < errors.length; i++) {
      console.log(`  ${i + 1}. ${errors[i]}`);
    }
    console.log("===================================");
    game.splash(`❌ VALIDATION FAILED: ${errors.length} errors`);
  }
}

// MANUAL TEST PASSED: Dungeon registry helpers
