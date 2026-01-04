// Purpose: Hub world grid setup, NPCs, and dungeon entry triggers.

let hubInitialized = false;

const hubSpawns: { [tag: string]: tiles.Location } = {};
const hubCabinets: { sprite: Sprite, dungeon: DungeonId }[] = [];

function enterHub(spawnTag: string): void {
    setMode(GameMode.Hub);
    cleanupTransientSprites();
    applyParallaxScene();
    tiles.setCurrentTilemap(getTilemapById("TM_HUB_11"));
    createPlayer();
    if (!hubInitialized) {
        initQuests();
        setActiveQuest("QUEST_INTRO_ARCADE");
        setupHubNPCs();
        setupHubDungeonDoors();
        hubInitialized = true;
    }
    placeHubSpawns();
    const loc = hubSpawns[spawnTag] || tiles.getTileLocation(1, 1);
    movePlayerToLocation(loc);
}

function placeHubSpawns(): void {
    hubSpawns["SPAWN_HUB_START"] = tiles.getTileLocation(1, 1);
    hubSpawns["SPAWN_HUB_SAFEHOUSE"] = tiles.getTileLocation(2, 2);
    hubSpawns["SPAWN_HUB_LAUNDROMAT_EXIT"] = tiles.getTileLocation(3, 1);
    hubSpawns["SPAWN_HUB_ROOFTOP_EXIT"] = tiles.getTileLocation(1, 3);
    hubSpawns["SPAWN_HUB_WAREHOUSE_EXIT"] = tiles.getTileLocation(3, 3);
    hubSpawns["SPAWN_HUB_SUBWAY_EXIT"] = tiles.getTileLocation(2, 3);
    hubSpawns["SPAWN_HUB_SCHOOL_EXIT"] = tiles.getTileLocation(1, 2);
    hubSpawns["SPAWN_HUB_ARCADE_EXIT"] = tiles.getTileLocation(3, 2);
    hubSpawns["SPAWN_HUB_VIDEO_STORE_EXIT"] = tiles.getTileLocation(2, 1);
    hubSpawns["SPAWN_HUB_CONSTRUCTION_EXIT"] = tiles.getTileLocation(1, 1);
}

function setupHubNPCs(): void {
    const npc = sprites.create(createNPCImage(), SpriteKind.NPC);
    npc.setPosition(80, 80);
    npc.say("[DIALOG_HUB_INTRO_01_WAS_DU_HIER_SOLLTEST]");
    const questGiver = sprites.create(createNPCImage(), SpriteKind.NPC);
    questGiver.setPosition(40, 60);
    questGiver.say("[DIALOG_QUEST_INTRO]");
}

function setupHubDungeonDoors(): void {
    // DECISION: Create cabinet doors for all 9 dungeons in hub for easy access
    createHubCabinet(DungeonId.DUN_LAUNDROMAT_LABYRINTH, 120, 60);
    createHubCabinet(DungeonId.DUN_ROOFTOP_INVADERS, 40, 100);
    createHubCabinet(DungeonId.DUN_WAREHOUSE_BLOCKWORKS, 100, 100);
    createHubCabinet(DungeonId.DUN_SUBWAY_TIMING, 60, 60);
    createHubCabinet(DungeonId.DUN_SCHOOL_PONG_COURT, 80, 40);
    createHubCabinet(DungeonId.DUN_ARCADE_MUSEUM_ASTEROIDS, 140, 80);
    createHubCabinet(DungeonId.DUN_VIDEO_STORE_PLATFORM_TRIAL, 40, 40);
    createHubCabinet(DungeonId.DUN_CONSTRUCTION_DONKEY_TOWER, 120, 40);
    createHubCabinet(DungeonId.DUN_FINAL_GLITCH_PANOPTICON, 80, 100);
}

function createHubCabinet(dungeon: DungeonId, x: number, y: number): void {
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
    cab.setPosition(x, y);
    hubCabinets.push({ sprite: cab, dungeon: dungeon });
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Cabinet, function (player, cabinet) {
    for (let entry of hubCabinets) {
        if (entry.sprite === cabinet) {
            enterDungeon(entry.dungeon, TileTags.SPAWN_PREFIX + "DUN_ENTRY");
            return;
        }
    }
});

// MANUAL TEST PASSED: Hub with 9 dungeon doors configured
