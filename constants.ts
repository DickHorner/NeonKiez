// Purpose: Shared enums, kinds, tile tags, and configuration constants.

enum GameMode {
    Boot,
    Title,
    Hub,
    Dungeon,
    Encounter,
    Cutscene,
    Menu,
    Transition
}

enum ToolType {
    None,
    FreezeCam,
    ConfettiBomb,
    SoapSlide,
    DecoyToy,
    Tagger
}

// DECISION: DungeonId enum matches exact IDs from agents.md spec because these are the non-negotiable dungeon identifiers
enum DungeonId {
    None,
    DUN_LAUNDROMAT_LABYRINTH,
    DUN_ROOFTOP_INVADERS,
    DUN_WAREHOUSE_BLOCKWORKS,
    DUN_SUBWAY_TIMING,
    DUN_SCHOOL_PONG_COURT,
    DUN_ARCADE_MUSEUM_ASTEROIDS,
    DUN_VIDEO_STORE_PLATFORM_TRIAL,
    DUN_CONSTRUCTION_DONKEY_TOWER,
    DUN_FINAL_GLITCH_PANOPTICON
}

enum EncounterType {
    None,
    ENC_MAZE_CHASE,
    ENC_FORMATION_SHOOTER,
    ENC_FALLING_BLOCKS_SWITCHPUZZLE,
    ENC_RHYTHM_WINDOW,
    ENC_PONG_BREAKOUT_TARGETS,
    ENC_ASTEROIDS_THRUST_WRAP,
    ENC_MICRO_PLATFORM_RUN,
    ENC_DONKEY_TOWER_LADDERS,
    ENC_META_MIX_GAUNTLET
}

enum QuestFlag {
    None = 0,
    TOOL_TAGGER_UNLOCKED = 1,
    TOOL_CONFETTI_UNLOCKED = 2,
    TOOL_SOAP_UNLOCKED = 3,
    TOOL_FREEZECAM_UNLOCKED = 4,
    TOOL_DECOY_UNLOCKED = 5,
    GAME_COMPLETED = 6
}

namespace SpriteKind {
    export const NPC = SpriteKind.create();
    export const Collectible = SpriteKind.create();
    export const Tool = SpriteKind.create();
    export const ToolFreeze = SpriteKind.create();
    export const ToolSoap = SpriteKind.create();
    export const ToolTagger = SpriteKind.create();
    export const Cabinet = SpriteKind.create();
    export const Debug = SpriteKind.create();
    export const UI = SpriteKind.create();
    export const TextLabel = SpriteKind.create();
}

namespace TileTags {
    export const HUB_DOOR_PREFIX = "TILE_DOOR_HUB_FROM_";
    export const DUNGEON_DOOR_PREFIX = "TILE_DOOR_";
    export const CHECKPOINT_PREFIX = "TILE_CHECKPOINT_";
    export const TOKEN_SPAWN = "TILE_TOKEN_SPAWN";
    export const SPAWN_PREFIX = "SPAWN_";
}

const SAVE_SLOT_KEY = "neon-kiez-save";
const SAVE_VERSION = 1;
const PLAYER_DEFAULT_HEARTS = 3;
const PLAYER_MAX_HEARTS = 5;
const PLAYER_MAX_ENERGY = 100;
const PLAYER_ENERGY_REGEN = 3;
const HUB_GRID_SIZE = 3;
const PARALLAX_LAYER_SKY = 0;
const PARALLAX_LAYER_NEAR = 1;

// Tool parameters
const CONFETTI_BOMB_RADIUS = 48;
const DECOY_TOY_RADIUS = 80;

// Dungeon parameters
const DUNGEON_ENEMY_SPAWN_CHANCE = 50; // Percentage chance for third enemy

// Tile tags for spawning
namespace TileTags {
    export const BOSS_CABINET_SPAWN = "TILE_BOSS_SPAWN";
    export const ENEMY_SPAWN_1 = "TILE_ENEMY_SPAWN_1";
    export const ENEMY_SPAWN_2 = "TILE_ENEMY_SPAWN_2";
    export const ENEMY_SPAWN_3 = "TILE_ENEMY_SPAWN_3";
}

// MANUAL TEST PASSED: Constants and enums match agents.md specification
