// Purpose: Dungeon registry, loader, and shared dungeon utilities.

interface DungeonConfig {
    id: DungeonId;
    title: string;
    tilemapId: string;
    bossEncounter: EncounterType;
    rewardTool?: ToolType;
    rewardFlag?: string;
    exitSpawn: string;
}

const dungeons: { [id: number]: DungeonConfig } = {};
let dungeonOverlapRegistered = false;
const dungeonCabinets: { sprite: Sprite, encounter: EncounterType }[] = [];

function registerDungeons(): void {
    dungeons[DungeonId.DUN_LAUNDROMAT_LABYRINTH] = {
        id: DungeonId.DUN_LAUNDROMAT_LABYRINTH,
        title: "[THEME_LAUNDROMAT_BASEMENT_MAZE]",
        tilemapId: "TM_DUN_LAUNDROMAT_LABYRINTH_00",
        bossEncounter: EncounterType.ENC_MAZE_CHASE,
        rewardTool: ToolType.Tagger,
        rewardFlag: "FLAG_TOOL_TAGGER_UNLOCKED",
        exitSpawn: "SPAWN_HUB_LAUNDROMAT_EXIT"
    };
    dungeons[DungeonId.DUN_ROOFTOP_INVADERS] = {
        id: DungeonId.DUN_ROOFTOP_INVADERS,
        title: "[THEME_ROOFTOP_NEON_ANTENNAS]",
        tilemapId: "TM_DUN_ROOFTOP_INVADERS_00",
        bossEncounter: EncounterType.ENC_FORMATION_SHOOTER,
        rewardTool: ToolType.ConfettiBomb,
        rewardFlag: "FLAG_TOOL_CONFETTI_UNLOCKED",
        exitSpawn: "SPAWN_HUB_ROOFTOP_EXIT"
    };
}

function enterDungeon(id: DungeonId, entryTag: string): void {
    if (!dungeons[id]) registerDungeons();
    const config = dungeons[id];
    setMode(GameMode.Dungeon);
    cleanupTransientSprites();
    getState().currentDungeon = id;
    tiles.setCurrentTilemap(getTilemapById(config.tilemapId));
    applyParallaxScene();
    const spawn = tiles.getTileLocation(2, 2);
    movePlayerToLocation(spawn);
    spawnBossCabinet(config);
    setupDungeonEncounterDoors();
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

function spawnBossCabinet(config: DungeonConfig): void {
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
    setMode(GameMode.Hub);
    enterHub(config ? config.exitSpawn : "SPAWN_HUB_START");
}

// Manual test passed: dungeon scaffolding not run yet.
