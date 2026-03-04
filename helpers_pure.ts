// Pure helper functions (no runtime dependencies) - extracted for testing
// These are pure functions that can be tested in isolation

/**
 * Check if a flag exists in the flags object
 */
function checkFlag(flags: { [key: string]: boolean }, flag: string): boolean {
  return !!flags[flag];
}

/**
 * Set a flag in the flags object (returns new flags object)
 */
function setFlagPure(flags: { [key: string]: boolean }, flag: string, value: boolean = true): { [key: string]: boolean } {
  const newFlags = { ...flags };
  newFlags[flag] = value;
  return newFlags;
}

/**
 * Check if a tool exists in the tools array
 */
function checkToolUnlocked(tools: string[], toolId: string): boolean {
  return tools.indexOf(toolId) >= 0;
}

/**
 * Add a tool to the tools array if not already present (returns new array)
 */
function unlockToolPure(tools: string[], toolId: string): string[] {
  if (tools.indexOf(toolId) < 0) {
    return [...tools, toolId];
  }
  return tools;
}

/**
 * Add an item to inventory (returns new inventory object)
 */
function addItemPure(inventory: { [itemId: string]: number }, itemId: string, qty: number): { [itemId: string]: number } {
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
function getItemCountPure(inventory: { [itemId: string]: number }, itemId: string): number {
  return inventory[itemId] || 0;
}

/**
 * Check if a dungeon is cleared based on flags
 * A dungeon is cleared if any of its reward flags contains "CLEARED"
 */
function isDungeonClearedPure(flags: { [key: string]: boolean }, dungeonFlagsSet: string[]): boolean {
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
function checkAllDungeonsClearExceptFinalPure(
  flags: { [key: string]: boolean },
  dungeonSpecs: Array<{ rewards: { flagsSet: string[] } }>
): boolean {
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
function applyDungeonRewardsPure(
  flags: { [key: string]: boolean },
  tools: string[],
  inventory: { [itemId: string]: number },
  rewards: {
    flagsSet: string[];
    toolUnlocks?: string[];
    items?: { id: string; qty: number }[];
  }
): {
  flags: { [key: string]: boolean };
  tools: string[];
  inventory: { [itemId: string]: number };
} {
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
function isValidHubRoomPure(row: number, col: number, minRow: number = 0, maxRow: number = 2, minCol: number = 0, maxCol: number = 2): boolean {
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

/**
 * Clamp a number between min and max
 */
function clampNumber(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
