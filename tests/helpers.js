// tests/helpers.js
// Node.js CJS wrapper around pure helpers for use in tests.
"use strict";

// Inline the pure helpers (no TypeScript runtime needed for Node.js tests)

function unlockToolIdempotent(tools, toolId) {
  if (tools.indexOf(toolId) < 0) {
    return tools.concat([toolId]);
  }
  return tools;
}

function applyRewards(flags, inventory, tools, reward) {
  const newFlags = Object.assign({}, flags);
  let newInventory = Object.assign({}, inventory);
  let newTools = tools.slice();

  for (let i = 0; i < reward.flagsSet.length; i++) {
    newFlags[reward.flagsSet[i]] = true;
  }

  if (reward.toolUnlocks) {
    for (let i = 0; i < reward.toolUnlocks.length; i++) {
      newTools = unlockToolIdempotent(newTools, reward.toolUnlocks[i]);
    }
  }

  if (reward.items) {
    for (let i = 0; i < reward.items.length; i++) {
      const item = reward.items[i];
      newInventory[item.id] = (newInventory[item.id] || 0) + item.qty;
    }
  }

  return { flags: newFlags, inventory: newInventory, tools: newTools };
}

function checkAllDungeonsClearExceptFinalPure(flags) {
  const required = [
    "FLAG_DUN_01_CLEARED",
    "FLAG_DUN_02_CLEARED",
    "FLAG_DUN_03_CLEARED",
    "FLAG_DUN_04_CLEARED",
    "FLAG_DUN_05_CLEARED",
    "FLAG_DUN_06_CLEARED",
    "FLAG_DUN_07_CLEARED",
    "FLAG_DUN_08_CLEARED",
  ];
  for (let i = 0; i < required.length; i++) {
    if (!flags[required[i]]) return false;
  }
  return true;
}

function isValidHubRoom(row, col) {
  return row >= 0 && row <= 2 && col >= 0 && col <= 2;
}

function getSafeHubRoom(row, col) {
  if (isValidHubRoom(row, col)) return { row, col };
  return { row: 1, col: 1 };
}

function clampHearts(hearts, max) {
  if (hearts < 0) return 0;
  if (hearts > max) return max;
  return hearts;
}

function initPlatformStageData(stageIndex) {
  return {
    stageIndex: stageIndex,
    reachedGoal: false,
    switchesActivated: 0,
    gatesOpen: false,
  };
}

function initRhythmStageData(stageIndex, bpm, nowMs) {
  const beatIntervalMs = 60000 / bpm;
  return {
    stageIndex: stageIndex,
    bpm: bpm,
    beatIntervalMs: beatIntervalMs,
    nextBeatTime: nowMs + beatIntervalMs,
    streak: 0,
    misses: 0,
  };
}

module.exports = {
  unlockToolIdempotent,
  applyRewards,
  checkAllDungeonsClearExceptFinalPure,
  isValidHubRoom,
  getSafeHubRoom,
  clampHearts,
  initPlatformStageData,
  initRhythmStageData,
};
