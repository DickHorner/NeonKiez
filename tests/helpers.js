// Pure helper functions for testing
// These are JavaScript versions of the TypeScript helpers for Node.js testing

/**
 * Check if a flag exists in the flags object
 */
function checkFlag(flags, flag) {
  return !!flags[flag];
}

/**
 * Set a flag in the flags object (returns new flags object)
 */
function setFlagPure(flags, flag, value = true) {
  const newFlags = { ...flags };
  newFlags[flag] = value;
  return newFlags;
}

/**
 * Check if a tool exists in the tools array
 */
function checkToolUnlocked(tools, toolId) {
  return tools.indexOf(toolId) >= 0;
}

/**
 * Add a tool to the tools array if not already present (returns new array)
 */
function unlockToolPure(tools, toolId) {
  if (tools.indexOf(toolId) < 0) {
    return [...tools, toolId];
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

/**
 * Add an item to inventory (returns new inventory object)
 */
function addItemPure(inventory, itemId, qty) {
  const newInventory = { ...inventory };
  if (!newInventory[itemId]) {
    newInventory[itemId] = 0;
  }
  newInventory[itemId] += qty;
  return newInventory;
}

/**
 * Get item count from inventory
 */
function getItemCountPure(inventory, itemId) {
  return inventory[itemId] || 0;
}

/**
 * Check if a dungeon is cleared based on flags
 */
function isDungeonClearedPure(flags, dungeonFlagsSet) {
  let clearFlag = null;
  for (let i = 0; i < dungeonFlagsSet.length; i++) {
    if (dungeonFlagsSet[i].includes("CLEARED")) {
      clearFlag = dungeonFlagsSet[i];
      break;
    }
  }
  return clearFlag ? checkFlag(flags, clearFlag) : false;
}

/**
 * Check if all dungeons except final are cleared
 */
function checkAllDungeonsClearExceptFinalPure(flags, dungeonSpecs) {
  let count = 0;
  for (let i = 0; i < dungeonSpecs.length - 1; i++) {
    if (isDungeonClearedPure(flags, dungeonSpecs[i].rewards.flagsSet)) {
      count++;
    }
  }
  return count >= dungeonSpecs.length - 1;
}

/**
 * Apply dungeon rewards to game state (pure function)
 */
function applyDungeonRewardsPure(flags, tools, inventory, rewards) {
  let newFlags = { ...flags };
  let newTools = [...tools];
  let newInventory = { ...inventory };

  // Apply flags
  for (let i = 0; i < rewards.flagsSet.length; i++) {
    newFlags = setFlagPure(newFlags, rewards.flagsSet[i], true);
  }

  // Apply tool unlocks
  if (rewards.toolUnlocks) {
    for (let i = 0; i < rewards.toolUnlocks.length; i++) {
      newTools = unlockToolPure(newTools, rewards.toolUnlocks[i]);
    }
  }

  // Apply items
  if (rewards.items) {
    for (let i = 0; i < rewards.items.length; i++) {
      const item = rewards.items[i];
      newInventory = addItemPure(newInventory, item.id, item.qty);
    }
  }

  return { flags: newFlags, tools: newTools, inventory: newInventory };
}

/**
 * Validate hub room coordinates
 */
function isValidHubRoomPure(row, col, minRow = 0, maxRow = 2, minCol = 0, maxCol = 2) {
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

/**
 * Clamp a number between min and max
 */
function clampNumber(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

module.exports = {
  checkFlag,
  setFlagPure,
  checkToolUnlocked,
  unlockToolPure,
  addItemPure,
  getItemCountPure,
  isDungeonClearedPure,
  checkAllDungeonsClearExceptFinalPure,
  applyDungeonRewardsPure,
  isValidHubRoomPure,
  clampNumber,
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
