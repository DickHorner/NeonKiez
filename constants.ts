// Constants: IDs, Enums, Tuning Parameters, SpriteKinds, TileTags, Caps

enum GameMode {
    Boot,
    Title,
    Hub,
    Dungeon,
    Cutscene,
    Menu,
    Transition
}

enum PlayMode {
    HUB_TOPDOWN,
    DUN_PLATFORM,
    DUN_SHOOTER,
    DUN_ASTEROIDS,
    DUN_RHYTHM,
    DUN_PUZZLE,
    DUN_META
}

// SpriteKinds per mode (extend as needed)
const KIND_PLAYER = SpriteKind.Player
const KIND_ENEMY = SpriteKind.Enemy
const KIND_PROJECTILE = SpriteKind.Projectile
const KIND_NPC = SpriteKind.create()
const KIND_DOOR = SpriteKind.create()
const KIND_INTERACTABLE = SpriteKind.create()
const KIND_COLLECTIBLE = SpriteKind.create()
const KIND_HAZARD = SpriteKind.create()
const KIND_DEBRIS = SpriteKind.create()
const KIND_PLATFORM_MOVING = SpriteKind.create()
const KIND_TARGET = SpriteKind.create()
const KIND_TOOL_EFFECT = SpriteKind.create()
// Tile Tags
const TILE_SPAWN_PLAYER = 1
const TILE_SPAWN_STAGE = 2
const TILE_WALL = 3
const TILE_DOOR = 4
const TILE_INTERACT = 5
const TILE_LADDER = 6
const TILE_GOAL_FLAG = 7
const TILE_HAZARD = 8
const TILE_SWITCH = 9
const TILE_GATE = 10

// Interaction distances
const INTERACT_DISTANCE = 20

// Spawn Caps
const CAP_MAX_ENEMIES = 12
const CAP_MAX_PROJECTILES = 20
const CAP_MAX_DEBRIS = 15
const CAP_MAX_COLLECTIBLES = 30

// Tuning
const PLAYER_TOPDOWN_SPEED = 80
const PLAYER_PLATFORM_SPEED = 100
const PLAYER_PLATFORM_JUMP_VY = -150
const PLAYER_SHOOTER_SPEED = 100
const PLAYER_ASTEROIDS_THRUST = 30
const PLAYER_ASTEROIDS_ROTATE_SPEED = 3

const PLAYER_MAX_HEARTS = 5
const PLAYER_INVINCIBILITY_MS = 1000
const PLAYER_ENERGY_MAX = 100
const TOOL_COOLDOWN_MS = 500

const INTERACT_DEBOUNCE_MS = 300
const OVERLAP_COOLDOWN_MS = 200

// Dungeon Specs
interface DungeonReward {
    flagsSet: string[]
    toolUnlocks?: string[]
    items?: { id: string; qty: number }[]
}

interface DungeonSpec {
    id: string
    playMode: PlayMode
    introCutsceneId: string
    stages: string[]
    hubReturnSpawnTag: string
    rewards: DungeonReward
    params?: any
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
            "TM_DUN_01_STAGE_03_EXIT_ROOM"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_01",
        rewards: {
            flagsSet: ["FLAG_DUN_01_CLEARED"],
            toolUnlocks: ["TOOL_TAGGER"],
            items: [{ id: "ITEM_CASSETTE_01", qty: 1 }]
        },
        params: { tokensPerStage: [0, 0, 5, 0] }
    },
    {
        id: "DUN_ROOFTOP_INVADERS",
        playMode: PlayMode.DUN_SHOOTER,
        introCutsceneId: "CUT_DUN_02_ENTRY_BEAT_WIND_UEBER_NEON",
        stages: [
            "TM_DUN_02_STAGE_00_RANGE",
            "TM_DUN_02_STAGE_01_FORMATIONS",
            "TM_DUN_02_STAGE_02_ALARM",
            "TM_DUN_02_STAGE_03_CORE"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_02",
        rewards: {
            flagsSet: ["FLAG_DUN_02_CLEARED"],
            toolUnlocks: ["TOOL_CONFETTI_BOMB"],
            items: [{ id: "ITEM_TOKEN_BAG_SMALL", qty: 1 }]
        },
        params: { wavesPerStage: [1, 3, 4, 1], coreHP: 30 }
    },
    {
        id: "DUN_WAREHOUSE_BLOCKWORKS",
        playMode: PlayMode.DUN_PUZZLE,
        introCutsceneId: "CUT_DUN_03_ENTRY_BEAT_GABELSTAPLER_GRUESST",
        stages: [
            "TM_DUN_03_STAGE_00_CONVEYOR_INTRO",
            "TM_DUN_03_STAGE_01_BLOCK_ROWS",
            "TM_DUN_03_STAGE_02_MOVING_CRATES",
            "TM_DUN_03_STAGE_03_FINAL_PATTERN"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_03",
        rewards: {
            flagsSet: ["FLAG_DUN_03_CLEARED"],
            toolUnlocks: ["TOOL_SOAP_SLIDE"],
            items: [{ id: "ITEM_KEYCARD_A", qty: 1 }]
        }
    },
    {
        id: "DUN_SUBWAY_TIMING",
        playMode: PlayMode.DUN_RHYTHM,
        introCutsceneId: "CUT_DUN_04_ENTRY_BEAT_TAKT_IM_TUNNEL",
        stages: [
            "TM_DUN_04_STAGE_00_BEAT_TUTORIAL",
            "TM_DUN_04_STAGE_01_DOORS",
            "TM_DUN_04_STAGE_02_SWITCH_CHAIN",
            "TM_DUN_04_STAGE_03_FINAL_STREAK"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_04",
        rewards: {
            flagsSet: ["FLAG_DUN_04_CLEARED"],
            toolUnlocks: ["TOOL_FREEZECAM"],
            items: [{ id: "ITEM_CASSETTE_02", qty: 1 }]
        },
        params: { bpm: 120, missLimit: 3 }
    },
    {
        id: "DUN_SCHOOL_PONG_COURT",
        playMode: PlayMode.DUN_PUZZLE,
        introCutsceneId: "CUT_DUN_05_ENTRY_BEAT_PAUSENKLINGEL_PING",
        stages: [
            "TM_DUN_05_STAGE_00_PADDLE_LEARN",
            "TM_DUN_05_STAGE_01_TARGETS",
            "TM_DUN_05_STAGE_02_REFLECTORS",
            "TM_DUN_05_STAGE_03_FINAL_CLEAR"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_05",
        rewards: {
            flagsSet: ["FLAG_DUN_05_CLEARED", "FLAG_UPG_DASH_COOLDOWN_REDUCED"],
            items: [{ id: "ITEM_KEYCARD_B", qty: 1 }]
        }
    },
    {
        id: "DUN_ARCADE_MUSEUM_ASTEROIDS",
        playMode: PlayMode.DUN_ASTEROIDS,
        introCutsceneId: "CUT_DUN_06_ENTRY_BEAT_SCHWERELLOS_IM_MUSEUM",
        stages: [
            "TM_DUN_06_STAGE_00_THRUST",
            "TM_DUN_06_STAGE_01_SPLIT",
            "TM_DUN_06_STAGE_02_PARTS_RUSH",
            "TM_DUN_06_STAGE_03_SURVIVE"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_06",
        rewards: {
            flagsSet: ["FLAG_DUN_06_CLEARED", "FLAG_TRAV_MAGNET_GLOVE"],
            items: [{ id: "ITEM_CASSETTE_03", qty: 1 }]
        },
        params: { splitDepth: 2, surviveTimeS: 60 }
    },
    {
        id: "DUN_VIDEO_STORE_PLATFORM_TRIAL",
        playMode: PlayMode.DUN_PLATFORM,
        introCutsceneId: "CUT_DUN_07_ENTRY_BEAT_VHS_REGAL_RUETTELT",
        stages: [
            "TM_DUN_07_STAGE_00_JUMP",
            "TM_DUN_07_STAGE_01_MOVING_SHELVES",
            "TM_DUN_07_STAGE_02_SWITCH_GATES",
            "TM_DUN_07_STAGE_03_FINAL_RUN"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_07",
        rewards: {
            flagsSet: ["FLAG_DUN_07_CLEARED", "FLAG_UPG_LIGHT_DOUBLE_JUMP"],
            items: [{ id: "ITEM_STICKER_SET_01", qty: 1 }]
        }
    },
    {
        id: "DUN_CONSTRUCTION_DONKEY_TOWER",
        playMode: PlayMode.DUN_PLATFORM,
        introCutsceneId: "CUT_DUN_08_ENTRY_BEAT_BAUSTELLE_RUMMST",
        stages: [
            "TM_DUN_08_STAGE_00_LADDERS",
            "TM_DUN_08_STAGE_01_BARRELS",
            "TM_DUN_08_STAGE_02_TRICK_LADDERS",
            "TM_DUN_08_STAGE_03_TOP_PLATFORM"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_08",
        rewards: {
            flagsSet: ["FLAG_DUN_08_CLEARED"],
            toolUnlocks: ["TOOL_DECOY_TOY"],
            items: [{ id: "ITEM_CASSETTE_04", qty: 1 }]
        },
        params: { barrelSpawnCap: 4 }
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
            "TM_DUN_09_STAGE_04_STABILIZE"
        ],
        hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_09",
        rewards: {
            flagsSet: [
                "FLAG_DUN_09_CLEARED",
                "FLAG_GAME_COMPLETED",
                "FLAG_UNLOCK_FREE_ROAM_PLUS",
                "FLAG_UNLOCK_COSMETIC_MASKS"
            ]
        },
        params: { microStageDurationS: 20 }
    }
]

// Hub Room Grid (3x3)
const HUB_ROOM_IDS = [
    ["TM_HUB_00", "TM_HUB_01", "TM_HUB_02"],
    ["TM_HUB_10", "TM_HUB_11", "TM_HUB_12"],
    ["TM_HUB_20", "TM_HUB_21", "TM_HUB_22"]
]

const HUB_START_ROOM = { row: 1, col: 1 } // center room

// Tools
const TOOL_FREEZECAM = "TOOL_FREEZECAM"
const TOOL_CONFETTI_BOMB = "TOOL_CONFETTI_BOMB"
const TOOL_SOAP_SLIDE = "TOOL_SOAP_SLIDE"
const TOOL_DECOY_TOY = "TOOL_DECOY_TOY"
const TOOL_TAGGER = "TOOL_TAGGER"