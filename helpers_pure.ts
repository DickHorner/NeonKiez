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
