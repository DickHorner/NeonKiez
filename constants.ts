// Constants: IDs, Enums, Tuning Parameters, SpriteKinds, TileTags, Caps

enum GameMode {
  Boot,
  Title,
  Hub,
  Dungeon,
  Cutscene,
  Menu,
  Transition,
}

enum PlayMode {
  HUB_TOPDOWN,
  DUN_PLATFORM,
  DUN_SHOOTER,
  DUN_ASTEROIDS,
  DUN_RHYTHM,
  DUN_PUZZLE,
  DUN_META,
}

// SpriteKinds per mode (extend as needed)
// DECISION: Use direct references instead of const to avoid initialization order issues
// These are initialized when first accessed, ensuring game engine is ready
let KIND_PLAYER: number;
let KIND_ENEMY: number;
let KIND_PROJECTILE: number;
let KIND_NPC: number;
let KIND_DOOR: number;
let KIND_INTERACTABLE: number;
let KIND_COLLECTIBLE: number;
let KIND_HAZARD: number;
let KIND_DEBRIS: number;
let KIND_PLATFORM_MOVING: number;
let KIND_TARGET: number;
let KIND_TOOL_EFFECT: number;
let KIND_PADDLE: number;
let KIND_BALL: number;
let KIND_HUD: number;

let kindInitPhase = 0; // 0 = not init, 1 = fallback init, 2 = deferred init

function initSpriteKinds() {
  if (kindInitPhase >= 1) return;
  
  // Initialize built-in kinds immediately (safe at startup)
  KIND_PLAYER = SpriteKind.Player;
  KIND_ENEMY = SpriteKind.Enemy;
  KIND_PROJECTILE = SpriteKind.Projectile;
  
  // Use built-in fallbacks initially (safer than SpriteKind.create() at startup)
  KIND_NPC = SpriteKind.Player;
  KIND_DOOR = SpriteKind.Food;
  KIND_INTERACTABLE = SpriteKind.Food;
  KIND_COLLECTIBLE = SpriteKind.Food;
  KIND_HAZARD = SpriteKind.Enemy;
  KIND_DEBRIS = SpriteKind.Projectile;
  KIND_PLATFORM_MOVING = SpriteKind.Enemy;
  KIND_TARGET = SpriteKind.Food;
  KIND_TOOL_EFFECT = SpriteKind.Projectile;
  KIND_PADDLE = SpriteKind.Player;
  KIND_BALL = SpriteKind.Projectile;
  KIND_HUD = SpriteKind.Player;
  
  kindInitPhase = 1;
}

function deferredInitSpriteKinds() {
  if (kindInitPhase >= 2) return;
  
  // Create custom kinds when engine is fully initialized (on first game update)
  KIND_NPC = SpriteKind.create();
  KIND_DOOR = SpriteKind.create();
  KIND_INTERACTABLE = SpriteKind.create();
  KIND_COLLECTIBLE = SpriteKind.create();
  KIND_HAZARD = SpriteKind.create();
  KIND_DEBRIS = SpriteKind.create();
  KIND_PLATFORM_MOVING = SpriteKind.create();
  KIND_TARGET = SpriteKind.create();
  KIND_TOOL_EFFECT = SpriteKind.create();
  KIND_PADDLE = SpriteKind.create();
  KIND_BALL = SpriteKind.create();
  KIND_HUD = SpriteKind.create();
  
  kindInitPhase = 2;
}

// Tile Tags
const TILE_SPAWN_PLAYER = 1;
const TILE_SPAWN_STAGE = 2;
const TILE_WALL = 3;
const TILE_DOOR = 4;
const TILE_INTERACT = 5;
const TILE_LADDER = 6;
const TILE_GOAL_FLAG = 7;
const TILE_HAZARD = 8;
const TILE_SWITCH = 9;
const TILE_GATE = 10;
const TILE_INDEX_TARGET = 4; // stairNorth sprite used as target marker in tilemaps

// Interaction distances
const INTERACT_DISTANCE = 20;

// Center/south hub transition coordinates (#123, #124)
const HUB_CENTER_SOUTH_EXIT_MIN_X = 112;
const HUB_CENTER_SOUTH_EXIT_MAX_X = 144;
const HUB_CENTER_SOUTH_EXIT_TRIGGER_Y = 176;
const HUB_SOUTH_ENTRY_X = 120;
const HUB_SOUTH_ENTRY_Y = 24;
const SPAWN_HUB_21_FROM_NORTH = "SPAWN_HUB_21_FROM_NORTH";
const HUB_SOUTH_NORTH_EXIT_TRIGGER_Y = 16;
const HUB_CENTER_SOUTH_ENTRY_X = 120;
const HUB_CENTER_SOUTH_ENTRY_Y = 160;
const SPAWN_HUB_11_FROM_SOUTH = "SPAWN_HUB_11_FROM_SOUTH";

// Spawn Caps
const CAP_MAX_ENEMIES = 12;
const CAP_MAX_PROJECTILES = 20;
const CAP_MAX_DEBRIS = 15;
const CAP_MAX_COLLECTIBLES = 30;

// Tuning
const PLAYER_TOPDOWN_SPEED = 80;
const PLAYER_PLATFORM_SPEED = 100;
const PLAYER_PLATFORM_JUMP_VY = -150;
const PLAYER_SHOOTER_SPEED = 100;
const PLAYER_ASTEROIDS_THRUST = 30;
const PLAYER_ASTEROIDS_ROTATE_SPEED = 3;

const PLAYER_MAX_HEARTS = 5;
const PLAYER_INVINCIBILITY_MS = 1000;
const PLAYER_ENERGY_MAX = 100;
const TOOL_COOLDOWN_MS = 500;

const INTERACT_DEBOUNCE_MS = 300;
const OVERLAP_COOLDOWN_MS = 200;

// Dungeon 5 (Pong/Breakout) specific
const PADDLE_SPEED = 120;
const BALL_SPEED_SLOW = 40;
const BALL_SPEED_NORMAL = 60;
const CAP_MAX_BALLS = 2;

// Dungeon Specs
interface DungeonReward {
  flagsSet: string[];
  toolUnlocks?: string[];
  items?: { id: string; qty: number }[];
}

// ---- Typed DungeonSpec params shapes ----
// Individual per-dungeon param interfaces are used for typed cast-based access
// in setup functions. DungeonParams is a flat optional interface so that
// call-sites without narrowing (e.g. spec.params?.bpm) continue to compile.

interface PuzzleLabyrinthParams {
  tokensPerStage: number[];
  switchToggleBehavior: string;
}

interface PuzzleBlockworksParams {
  switchToggleBehavior: string;
  switchRequiredForStage: number[];
}

interface ShooterParams {
  wavesPerStage: number[];
  coreHP: number;
}

interface RhythmParams {
  bpm: number;
  missLimit: number;
  streakTargets: number[];
}

interface PuzzlePongParams {
  targetsPerStage: number[];
  ballSpeed: number[];
}

interface AsteroidsParams {
  splitDepth: number;
  surviveTimeS: number;
}

interface PlatformSpawner {
  xStart: number;
  xEnd?: number;
  y?: number;
  speed?: number;
  rate?: number;
}

interface PlatformTrialParams {
  stageSpawners: PlatformSpawner[][];
}

interface PlatformDonkeyParams {
  barrelSpawnCap: number;
  stageSpawners: PlatformSpawner[][];
}

interface MetaParams {
  microStageDurationS: number;
}

// Flat optional shape: all params fields in one interface so that
// property access without narrowing (e.g. spec.params?.bpm) compiles cleanly.
interface DungeonParams {
  // PuzzleLabyrinthParams
  tokensPerStage?: number[];
  // PuzzleLabyrinthParams + PuzzleBlockworksParams
  switchToggleBehavior?: string;
  // PuzzleBlockworksParams
  switchRequiredForStage?: number[];
  // ShooterParams
  wavesPerStage?: number[];
  coreHP?: number;
  // RhythmParams
  bpm?: number;
  missLimit?: number;
  streakTargets?: number[];
  // PuzzlePongParams
  targetsPerStage?: number[];
  ballSpeed?: number[];
  // AsteroidsParams
  splitDepth?: number;
  surviveTimeS?: number;
  // PlatformTrialParams + PlatformDonkeyParams
  stageSpawners?: PlatformSpawner[][];
  // PlatformDonkeyParams
  barrelSpawnCap?: number;
  // MetaParams
  microStageDurationS?: number;
}

// ---- Typed play-mode payload shapes ----

interface HubModePayload {
  hubRoom?: { row: number; col: number };
  spawnTag?: string | null;
}

interface DungeonModePayload {
  dungeonId: string;
  stageIndex: number;
}

type PlayModePayload = HubModePayload | DungeonModePayload;

// ---- Typed dungeon stage-data shape ----
// All mode-specific fields are optional; each mode only populates its own subset.

interface DungeonStageData {
  stageIndex: number;
  stageComplete?: boolean;
  // Platform / Platform-Donkey
  reachedGoal?: boolean;
  switchesActivated?: number;
  gatesOpen?: boolean;
  gateLocations?: tiles.Location[];
  barrelSpawnCap?: number;
  lastBarrelSpawn?: number;
  // Shooter
  wavesComplete?: number;
  enemiesAlive?: number;
  // Rhythm
  bpm?: number;
  beatIntervalMs?: number;
  nextBeatTime?: number;
  streak?: number;
  misses?: number;
  streakRequired?: number;
  rhythmDoorLocations?: tiles.Location[];
  rhythmDoorsOpen?: boolean;
  // Puzzle
  tokensCollected?: number;
  tokensRequired?: number;
  ballSpeed?: number;
  // Asteroids
  debrisCount?: number;
  partsCollected?: number;
  // Meta
  nodesStabilized?: number;
  nodesRequired?: number;
  currentNodeIndex?: number;
  startTime?: number;
  timeLimit?: number;
  targetsDestroyed?: number;
  targetsRequired?: number;
}

// ---- Typed sprite augmentation shapes ----

type HubSprite = Sprite & {
  isDoor?: boolean;
  dungeonId?: string;
  isNPC?: boolean;
  dialogId?: string;
};

type MetaNodeSprite = Sprite & {
  isStabilizationNode?: boolean;
  nodeIndex?: number;
};

interface DungeonSpec {
  id: string;
  playMode: PlayMode;
  introCutsceneId: string;
  stages: string[];
  hubReturnSpawnTag: string;
  rewards: DungeonReward;
  params?: DungeonParams;
}

// ---- Tile-index helper ----
// MakeCode's public tiles.getTileImage() declares a Location argument but the
// runtime also accepts a numeric palette index. This helper contains the cast
// in one place so that call-sites stay free of `as any`.
function tileImg(index: number): Image {
  return tiles.getTileImage(index as any);
}

// Dungeon Registry (9 dungeons)
const DUNGEON_SPECS: DungeonSpec[] = [
  {
    id: "DUN_LAUNDROMAT_LABYRINTH",
    playMode: PlayMode.DUN_PUZZLE,
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
    params: {
      tokensPerStage: [0, 0, 5, 0],
      switchToggleBehavior: "toggle", // toggle gates on every switch press
    },
  },
  {
    id: "DUN_ROOFTOP_INVADERS",
    playMode: PlayMode.DUN_SHOOTER,
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
    params: { wavesPerStage: [1, 3, 4, 1], coreHP: 30 },
  },
  {
    id: "DUN_WAREHOUSE_BLOCKWORKS",
    playMode: PlayMode.DUN_PUZZLE,
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
    params: {
      switchToggleBehavior: "latch", // gates open on switch count threshold, stay open
      switchRequiredForStage: [0, 2, 0, 0], // stage 1 needs 2 switches
    },
  },
  {
    id: "DUN_SUBWAY_TIMING",
    playMode: PlayMode.DUN_RHYTHM,
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
    params: { 
      bpm: 120, 
      missLimit: 3,
      streakTargets: [3, 5, 8, 12], // Stage 0-3 streak requirements
    },
  },
  {
    id: "DUN_SCHOOL_PONG_COURT",
    playMode: PlayMode.DUN_PUZZLE,
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
    params: { 
      targetsPerStage: [3, 8, 6, 12],
      ballSpeed: [BALL_SPEED_SLOW, BALL_SPEED_NORMAL, BALL_SPEED_NORMAL, BALL_SPEED_NORMAL]
    },
  },
  {
    id: "DUN_ARCADE_MUSEUM_ASTEROIDS",
    playMode: PlayMode.DUN_ASTEROIDS,
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
    params: { splitDepth: 2, surviveTimeS: 60 },
  },
  {
    id: "DUN_VIDEO_STORE_PLATFORM_TRIAL",
    playMode: PlayMode.DUN_PLATFORM,
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
    params: {
      stageSpawners: [
        [], // Stage 0: static platforms only
        [
          { xStart: 60, xEnd: 50, y: 40, speed: 120 },
          { xStart: 100, xEnd: 140, y: 70, speed: 25 },
        ], // Stage 1: moving shelves
        [], // Stage 2: switches + gates only
        [], // Stage 3: final run
      ],
    },
  },
  {
    id: "DUN_CONSTRUCTION_DONKEY_TOWER",
    playMode: PlayMode.DUN_PLATFORM,
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
    params: {
      barrelSpawnCap: 4,
      stageSpawners: [
        [], // Stage 0: ladders, no barrels
        [{ xStart: 150, rate: 500 }], // Stage 1: barrels start
        [], // Stage 2: trick ladders, barrels continue (spawned by room)
        [], // Stage 3: no new barrels
      ],
    },
  },
  {
    id: "DUN_FINAL_GLITCH_PANOPTICON",
    playMode: PlayMode.DUN_META,
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
    params: { microStageDurationS: 20 },
  },
];

// Hub Room Grid (3x3)
const HUB_ROOM_IDS = [
  ["TM_HUB_00", "TM_HUB_01", "TM_HUB_02"],
  ["TM_HUB_10", "TM_HUB_11", "TM_HUB_12"],
  ["TM_HUB_20", "TM_HUB_21", "TM_HUB_22"],
];

const HUB_START_ROOM = { row: 1, col: 1 }; // center room

// Hub spawn points (return from dungeons)
interface SpawnPoint {
  room: { row: number; col: number };
  x: number;
  y: number;
}

const HUB_SPAWN_POINTS: { [tag: string]: SpawnPoint } = {
  SPAWN_HUB_FROM_DUN_01: { room: { row: 0, col: 0 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_02: { room: { row: 0, col: 1 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_03: { room: { row: 0, col: 2 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_04: { room: { row: 1, col: 0 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_05: { room: { row: 1, col: 2 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_06: { room: { row: 2, col: 0 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_07: { room: { row: 2, col: 1 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_08: { room: { row: 2, col: 2 }, x: 80, y: 80 },
  SPAWN_HUB_FROM_DUN_09: { room: { row: 1, col: 1 }, x: 80, y: 100 },
  SPAWN_HUB_21_FROM_NORTH: {
    room: { row: 2, col: 1 },
    x: HUB_SOUTH_ENTRY_X,
    y: HUB_SOUTH_ENTRY_Y,
  },
  SPAWN_HUB_11_FROM_SOUTH: {
    room: { row: 1, col: 1 },
    x: HUB_CENTER_SOUTH_ENTRY_X,
    y: HUB_CENTER_SOUTH_ENTRY_Y,
  },
};

// Tools
const TOOL_FREEZECAM = "TOOL_FREEZECAM";
const TOOL_CONFETTI_BOMB = "TOOL_CONFETTI_BOMB";
const TOOL_SOAP_SLIDE = "TOOL_SOAP_SLIDE";
const TOOL_DECOY_TOY = "TOOL_DECOY_TOY";
const TOOL_TAGGER = "TOOL_TAGGER";

function hasOwnSpawnPoint(tag: string): boolean {
  return HUB_SPAWN_POINTS[tag] !== undefined;
}

function isFiniteNumber(value: any): boolean {
  return typeof value === "number" && value <= 1e308 && value >= -1e308;
}

function isValidHubRoom(room: any): boolean {
  if (!room || typeof room !== "object") return false;
  if (typeof room.row !== "number" || typeof room.col !== "number") return false;
  if (!isFiniteNumber(room.row) || !isFiniteNumber(room.col)) return false;
  if (Math.floor(room.row) !== room.row || Math.floor(room.col) !== room.col) return false;
  if (room.row < STATE_HUB_ROOM_MIN || room.row > STATE_HUB_ROOM_MAX) return false;
  if (room.col < STATE_HUB_ROOM_MIN || room.col > STATE_HUB_ROOM_MAX) return false;
  return true;
}

function getSafeHubRoom(room: any, debugContext: string): { row: number; col: number } {
  if (isValidHubRoom(room)) {
    return { row: room.row, col: room.col };
  }
  console.log("DEBUG: Hub room fallback triggered - " + debugContext);
  return { row: HUB_START_ROOM.row, col: HUB_START_ROOM.col };
}

function getSpawnPoint(tag: string | null | undefined): SpawnPoint | null {
  if (!tag || !hasOwnSpawnPoint(tag)) {
    return null;
  }

  const spawnPoint = HUB_SPAWN_POINTS[tag];
  if (!spawnPoint || !isValidHubRoom(spawnPoint.room)) {
    return null;
  }
  if (typeof spawnPoint.x !== "number" || !isFiniteNumber(spawnPoint.x)) {
    return null;
  }
  if (typeof spawnPoint.y !== "number" || !isFiniteNumber(spawnPoint.y)) {
    return null;
  }
  return spawnPoint;
}
