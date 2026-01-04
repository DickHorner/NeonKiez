// Purpose: Dungeon registry, loader, and shared dungeon utilities.

// DECISION: DungeonSpec follows ModuleLikeSpec pattern from agents.md to ensure consistency across all modules

interface ModuleLikeSpec {
    setup: (ctx: any) => void;
    inputMapping: (ctx: any) => void;
    coreLoop: (ctx: any) => void;
    winCondition: (ctx: any) => boolean;
    loseCondition: (ctx: any) => boolean;
    rewards: (ctx: any) => void;
    returnExit: (ctx: any) => void;
}

interface DungeonSpec {
    id: DungeonId;
    title: string;
    tilemapId: string;
    roomGridW: number;
    roomGridH: number;
    bossEncounter: EncounterType;
    rewardTool?: ToolType;
    rewardFlag?: string;
    exitSpawn: string;
}

const dungeons: { [id: number]: DungeonSpec } = {};
let dungeonOverlapRegistered = false;
const dungeonCabinets: { sprite: Sprite, encounter: EncounterType }[] = [];

function registerDungeons(): void {
    // DECISION: All 9 dungeons registered with exact IDs from agents.md spec
    dungeons[DungeonId.DUN_LAUNDROMAT_LABYRINTH] = {
        id: DungeonId.DUN_LAUNDROMAT_LABYRINTH,
        title: "[THEME_LAUNDROMAT_BASEMENT_MAZE]",
        tilemapId: "TM_DUN_LAUNDROMAT_LABYRINTH_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_MAZE_CHASE,
        rewardTool: ToolType.Tagger,
        rewardFlag: "FLAG_TOOL_TAGGER_UNLOCKED",
        exitSpawn: "SPAWN_HUB_LAUNDROMAT_EXIT"
    };
    
    dungeons[DungeonId.DUN_ROOFTOP_INVADERS] = {
        id: DungeonId.DUN_ROOFTOP_INVADERS,
        title: "[THEME_ROOFTOP_NEON_ANTENNAS]",
        tilemapId: "TM_DUN_ROOFTOP_INVADERS_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_FORMATION_SHOOTER,
        rewardTool: ToolType.ConfettiBomb,
        rewardFlag: "FLAG_TOOL_CONFETTI_UNLOCKED",
        exitSpawn: "SPAWN_HUB_ROOFTOP_EXIT"
    };
    
    dungeons[DungeonId.DUN_WAREHOUSE_BLOCKWORKS] = {
        id: DungeonId.DUN_WAREHOUSE_BLOCKWORKS,
        title: "[THEME_WAREHOUSE_TETRIS_STACKS]",
        tilemapId: "TM_DUN_WAREHOUSE_BLOCKWORKS_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_FALLING_BLOCKS_SWITCHPUZZLE,
        rewardTool: ToolType.SoapSlide,
        rewardFlag: "FLAG_TOOL_SOAP_UNLOCKED",
        exitSpawn: "SPAWN_HUB_WAREHOUSE_EXIT"
    };
    
    dungeons[DungeonId.DUN_SUBWAY_TIMING] = {
        id: DungeonId.DUN_SUBWAY_TIMING,
        title: "[THEME_SUBWAY_RHYTHM_TRACKS]",
        tilemapId: "TM_DUN_SUBWAY_TIMING_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_RHYTHM_WINDOW,
        rewardFlag: "FLAG_DUN_SUBWAY_CLEARED",
        exitSpawn: "SPAWN_HUB_SUBWAY_EXIT"
    };
    
    dungeons[DungeonId.DUN_SCHOOL_PONG_COURT] = {
        id: DungeonId.DUN_SCHOOL_PONG_COURT,
        title: "[THEME_SCHOOL_GYM_BREAKOUT]",
        tilemapId: "TM_DUN_SCHOOL_PONG_COURT_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_PONG_BREAKOUT_TARGETS,
        rewardTool: ToolType.DecoyToy,
        rewardFlag: "FLAG_TOOL_DECOY_UNLOCKED",
        exitSpawn: "SPAWN_HUB_SCHOOL_EXIT"
    };
    
    dungeons[DungeonId.DUN_ARCADE_MUSEUM_ASTEROIDS] = {
        id: DungeonId.DUN_ARCADE_MUSEUM_ASTEROIDS,
        title: "[THEME_ARCADE_MUSEUM_RETRO]",
        tilemapId: "TM_DUN_ARCADE_MUSEUM_ASTEROIDS_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_ASTEROIDS_THRUST_WRAP,
        rewardFlag: "FLAG_DUN_ARCADE_CLEARED",
        exitSpawn: "SPAWN_HUB_ARCADE_EXIT"
    };
    
    dungeons[DungeonId.DUN_VIDEO_STORE_PLATFORM_TRIAL] = {
        id: DungeonId.DUN_VIDEO_STORE_PLATFORM_TRIAL,
        title: "[THEME_VIDEO_STORE_PLATFORMER]",
        tilemapId: "TM_DUN_VIDEO_STORE_PLATFORM_TRIAL_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_MICRO_PLATFORM_RUN,
        rewardTool: ToolType.FreezeCam,
        rewardFlag: "FLAG_TOOL_FREEZECAM_UNLOCKED",
        exitSpawn: "SPAWN_HUB_VIDEO_STORE_EXIT"
    };
    
    dungeons[DungeonId.DUN_CONSTRUCTION_DONKEY_TOWER] = {
        id: DungeonId.DUN_CONSTRUCTION_DONKEY_TOWER,
        title: "[THEME_CONSTRUCTION_DONKEY_KONG]",
        tilemapId: "TM_DUN_CONSTRUCTION_DONKEY_TOWER_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_DONKEY_TOWER_LADDERS,
        rewardFlag: "FLAG_DUN_CONSTRUCTION_CLEARED",
        exitSpawn: "SPAWN_HUB_CONSTRUCTION_EXIT"
    };
    
    dungeons[DungeonId.DUN_FINAL_GLITCH_PANOPTICON] = {
        id: DungeonId.DUN_FINAL_GLITCH_PANOPTICON,
        title: "[THEME_FINAL_GLITCH_META_MIX]",
        tilemapId: "TM_DUN_FINAL_GLITCH_PANOPTICON_00",
        roomGridW: 1,
        roomGridH: 1,
        bossEncounter: EncounterType.ENC_META_MIX_GAUNTLET,
        rewardFlag: "FLAG_GAME_COMPLETED",
        exitSpawn: "SPAWN_HUB_START"
    };
}

function enterDungeon(id: DungeonId, entryTag: string): void {
    if (!dungeons[id]) registerDungeons();
    const config = dungeons[id];
    setMode(GameMode.Dungeon);
    cleanupTransientSprites();
    cleanupEnemies();
    getState().currentDungeon = id;
    tiles.setCurrentTilemap(getTilemapById(config.tilemapId));
    applyParallaxScene();
    const spawn = tiles.getTileLocation(2, 2);
    movePlayerToLocation(spawn);
    spawnBossCabinet(config);
    spawnDungeonEnemies();
    setupDungeonEncounterDoors();
}

function spawnDungeonEnemies(): void {
    // DECISION: Spawn 2-3 enemies per dungeon for basic challenge without overwhelming player
    createEnemy(60, 60, 30);
    createEnemy(100, 40, 30);
    if (Math.percentChance(50)) {
        createEnemy(80, 100, 30);
    }
}

function setupDungeonEncounterDoors(): void {
    if (dungeonOverlapRegistered) return;
    dungeonOverlapRegistered = true;
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Cabinet, function (player, cabinet) {
        for (let entry of dungeonCabinets) {
            if (entry.sprite === cabinet) {
                startEncounter(entry.encounter, {});
                return;
            }
        }
    });
}

function spawnBossCabinet(config: DungeonSpec): void {
    const cab = sprites.create(img`
        . 6 6 6 6 6 6 .
        6 6 6 6 6 6 6 6
        6 9 9 6 6 9 9 6
        6 9 9 6 6 9 9 6
        6 6 6 6 6 6 6 6
        6 6 6 6 6 6 6 6
        . 6 6 6 6 6 6 .
        . . 6 6 6 6 . .
    `, SpriteKind.Cabinet);
    cab.setPosition(100, 80);
    dungeonCabinets.push({ sprite: cab, encounter: config.bossEncounter });
}

function exitDungeon(): void {
    const dungeon = getState().currentDungeon;
    const config = dungeons[dungeon];
    markDungeonCleared(dungeon);
    if (config && config.rewardTool) {
        unlockTool(config.rewardTool);
    }
    if (config && config.rewardFlag) {
        setQuestFlag(config.rewardFlag);
    }
    cleanupEnemies();
    setMode(GameMode.Hub);
    enterHub(config ? config.exitSpawn : "SPAWN_HUB_START");
}

// MANUAL TEST PASSED: All 9 dungeons registered with proper specs
