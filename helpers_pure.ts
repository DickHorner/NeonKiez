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
// helpers_pure.ts
// Pure TypeScript functions extracted from game logic for deterministic Node.js testing.
// No MakeCode runtime dependencies.
//
// NOTE: Type interfaces here intentionally mirror constants.ts. They are
// duplicated (not imported) because helpers_pure.ts must compile as a
// stand-alone ES module under Node.js, whereas constants.ts targets the
// MakeCode runtime (module: none, no ES imports). Keep these in sync.

// ---- Minimal type re-exports (mirror constants.ts, no runtime dependency) ----

interface DungeonReward {
  flagsSet: string[];
  toolUnlocks?: string[];
  items?: { id: string; qty: number }[];
}

interface DungeonParams {
  tokensPerStage?: number[];
  switchToggleBehavior?: string;
  switchRequiredForStage?: number[];
  wavesPerStage?: number[];
  coreHP?: number;
  bpm?: number;
  missLimit?: number;
  streakTargets?: number[];
  targetsPerStage?: number[];
  ballSpeed?: number[];
  splitDepth?: number;
  surviveTimeS?: number;
  stageSpawners?: object[][];
  barrelSpawnCap?: number;
  microStageDurationS?: number;
}

interface DungeonSpec {
  id: string;
  playMode: number;
  introCutsceneId: string;
  stages: string[];
  hubReturnSpawnTag: string;
  rewards: DungeonReward;
  params?: DungeonParams;
}

interface DungeonStageData {
  stageIndex: number;
  stageComplete?: boolean;
  reachedGoal?: boolean;
  switchesActivated?: number;
  gatesOpen?: boolean;
  barrelSpawnCap?: number;
  lastBarrelSpawn?: number;
  wavesComplete?: number;
  enemiesAlive?: number;
  bpm?: number;
  beatIntervalMs?: number;
  nextBeatTime?: number;
  streak?: number;
  misses?: number;
  streakRequired?: number;
  rhythmDoorsOpen?: boolean;
  tokensCollected?: number;
  tokensRequired?: number;
  ballSpeed?: number;
  debrisCount?: number;
  partsCollected?: number;
  nodesStabilized?: number;
  nodesRequired?: number;
  currentNodeIndex?: number;
  startTime?: number;
  timeLimit?: number;
  targetsDestroyed?: number;
  targetsRequired?: number;
}

interface HubModePayload {
  hubRoom?: { row: number; col: number };
  spawnTag?: string | null;
}

interface DungeonModePayload {
  dungeonId: string;
  stageIndex: number;
}

// ---- Pure game logic functions ----

export function unlockToolIdempotent(tools: string[], toolId: string): string[] {
  if (tools.indexOf(toolId) < 0) {
    return tools.concat([toolId]);
  }
  return tools;
}

export function applyRewards(
  flags: { [k: string]: boolean },
  inventory: { [k: string]: number },
  tools: string[],
  reward: DungeonReward
): { flags: { [k: string]: boolean }; inventory: { [k: string]: number }; tools: string[] } {
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

export function checkAllDungeonsClearExceptFinalPure(flags: { [k: string]: boolean }): boolean {
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

export function isValidHubRoom(row: number, col: number): boolean {
  return row >= 0 && row <= 2 && col >= 0 && col <= 2;
}

export function getSafeHubRoom(
  row: number,
  col: number
): { row: number; col: number } {
  if (isValidHubRoom(row, col)) return { row, col };
  return { row: 1, col: 1 };
}

export function clampHearts(hearts: number, max: number): number {
  if (hearts < 0) return 0;
  if (hearts > max) return max;
  return hearts;
}

export function initPlatformStageData(stageIndex: number): DungeonStageData {
  return {
    stageIndex: stageIndex,
    reachedGoal: false,
    switchesActivated: 0,
    gatesOpen: false,
  };
}

export function initRhythmStageData(
  stageIndex: number,
  bpm: number,
  nowMs: number
): DungeonStageData {
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
