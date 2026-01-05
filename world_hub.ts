// Hub-Grid (3×3), NPCs, Doors, Savehouse

// Hub content spawning (called after tilemap loaded)

const HUB_SAVEHOUSE_NPC_X = 50
const HUB_SAVEHOUSE_NPC_Y = 50
const HUB_DOOR_X = 80
const HUB_DOOR_Y = 80
const HUB_FINAL_DOOR_Y = 100

function spawnHubContent(roomRow: number, roomCol: number) {
    // Spawn NPCs
    if (roomRow === 1 && roomCol === 1) {
        // Center room: savehouse + main NPCs
        spawnNPC("NPC_SAVEHOUSE_KEEPER", HUB_SAVEHOUSE_NPC_X, HUB_SAVEHOUSE_NPC_Y, "DIALOG_NPC_SAVEHOUSE_WELCOME")
    }
    
    // Spawn dungeon doors
    spawnDungeonDoors(roomRow, roomCol)
}

function spawnNPC(npcId: string, x: number, y: number, dialogId: string) {
    const npc = sprites.create(imgNpc(npcId), KIND_NPC)
    npc.setPosition(x, y)
    ;(npc as any).dialogId = dialogId
}

function spawnDungeonDoors(roomRow: number, roomCol: number) {
    // Distribute 9 dungeons across hub rooms
    // DECISION: Each room has 1 door

    const doorMap = [
        ["DUN_LAUNDROMAT_LABYRINTH", "DUN_ROOFTOP_INVADERS", "DUN_WAREHOUSE_BLOCKWORKS"],
        ["DUN_SUBWAY_TIMING", null, "DUN_SCHOOL_PONG_COURT"],
        ["DUN_ARCADE_MUSEUM_ASTEROIDS", "DUN_VIDEO_STORE_PLATFORM_TRIAL", "DUN_CONSTRUCTION_DONKEY_TOWER"]
    ]

    if (roomRow < 0 || roomCol < 0 || roomRow >= doorMap.length || roomCol >= doorMap[roomRow].length) {
        return
    }

    const dungeonId = doorMap[roomRow][roomCol]
    if (dungeonId) {
        spawnDoor(dungeonId, HUB_DOOR_X, HUB_DOOR_Y)
    }
    
    // Final dungeon door in center (unlocks after clearing others)
    if (roomRow === 1 && roomCol === 1 && hasFlag("FLAG_ALL_DUNGEONS_CLEARED")) {
        spawnDoor("DUN_FINAL_GLITCH_PANOPTICON", HUB_DOOR_X, HUB_FINAL_DOOR_Y)
    }
}

function spawnDoor(dungeonId: string, x: number, y: number) {
    const door = sprites.create(imgDoor(dungeonId), KIND_DOOR)
    door.setPosition(x, y)
    ;(door as any).dungeonId = dungeonId
}

function interactWithSavehouse() {
    healPlayer(state.maxHearts)
    saveGame()
    showHint("[SAVEHOUSE_SAVED]", 2000)
}

// MANUAL TEST PASSED: Hub content spawn scaffold
