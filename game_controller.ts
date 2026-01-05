// GameController: GameMode/PlayMode StateMachine, transitions, cleanup
// NOTE: Arcade runtime exposes globals (game, tiles, controller, sprites); imports are not required.

namespace GameController {
    let playerSprite: Sprite = null
    const TRANSITION_PAUSE_MS = 100
    const CONTINUE_YES = 1

    export function start() {
    // Initialize
    initState()
    initHUD()
    
    // Register global event handlers (once only)
    registerGlobalHandlers()
    
    // Show title
    setGameMode(GameMode.Title)
    showTitle()
}

function showTitle() {
    scene.setBackgroundColor(1)
    game.splash("[TITLE_NEON_KIEZ]")
    
    // Check for save
    if (hasSaveData()) {
        const cont = game.askForNumber("Continue? 1=Yes 0=New", 1)
        if (cont === CONTINUE_YES) {
            loadGame()
        }
    }
    
    // Start hub
    startHub()
}

    function startHub() {
        setGameMode(GameMode.Hub)
        switchPlayMode(PlayMode.HUB_TOPDOWN, {
            hubRoom: state.hubRoom,
            spawnTag: null
        })
    }

    // ============ MODE SWITCHING (THE HEART) ============

    export function switchPlayMode(nextMode: number, payload: any) {
    if (state.transitionLock) return
    
    state.transitionLock = true
    
    // Cleanup current mode
    cleanupCurrentPlayMode()
    
    // Setup next mode
    state.playMode = nextMode
    setupNextPlayMode(nextMode, payload)
    
    state.transitionLock = false
}

function cleanupCurrentPlayMode() {
    // Destroy all sprites except HUD elements
    const allSprites = game.currentScene().allSprites
    for (const s of allSprites) {

        if (s.flags & SpriteFlag.RelativeToCamera) continue
        const sprite = s as Sprite
        sprite.destroy()
    }
    
    // Reset camera
    scene.centerCameraAt(80, 60)
    
    // Reset background scroll
    scroller.setLayerImage(scroller.BackgroundLayer.Layer0, image.create(1, 1))
    scroller.setLayerImage(scroller.BackgroundLayer.Layer1, image.create(1, 1))
    
    // Clear tilemap
    tiles.setCurrentTilemap(null)
    
    // Reset player reference
    playerSprite = null
    
    // Clear mode-specific state
    state.dungeonStageData = null
}

function setupNextPlayMode(mode: number, payload: any) {
    if (mode === PlayMode.HUB_TOPDOWN) {
        setupHubMode(payload)
    } else if (mode === PlayMode.DUN_PLATFORM) {
        setupPlatformMode(payload)
    } else if (mode === PlayMode.DUN_SHOOTER) {
        setupShooterMode(payload)
    } else if (mode === PlayMode.DUN_ASTEROIDS) {
        setupAsteroidsMode(payload)
    } else if (mode === PlayMode.DUN_RHYTHM) {
        setupRhythmMode(payload)
    } else if (mode === PlayMode.DUN_PUZZLE) {
        setupPuzzleMode(payload)
    } else if (mode === PlayMode.DUN_META) {
        setupMetaMode(payload)
    }
    
    updateHUD()
}

// ============ HUB MODE SETUP ============

function setupHubMode(payload: any) {
    // Update hub room if specified
    if (payload && payload.hubRoom) {
        state.hubRoom = payload.hubRoom
    }
    
    // Load hub room
    const roomId = HUB_ROOM_IDS[state.hubRoom.row][state.hubRoom.col]
    const tm = getTilemapByID(roomId)
    if (tm) {
        tiles.setCurrentTilemap(tm)
    }
    
    // Spawn player
    playerSprite = sprites.create(imgPlayerTopdown(), KIND_PLAYER)
    
    // Find spawn point
    if (payload && payload.spawnTag) {
        // TODO: find tile by tag
        playerSprite.setPosition(80, 60)
    } else {
        playerSprite.setPosition(80, 60)
    }
    
    // Set up hub player controller
    controller.moveSprite(playerSprite, PLAYER_TOPDOWN_SPEED, PLAYER_TOPDOWN_SPEED)
    scene.cameraFollowSprite(playerSprite)
    
    // Parallax (placeholder layers)
    scroller.scrollBackgroundWithSpeed(-10, 0, scroller.BackgroundLayer.Layer0)
    
    // Spawn NPCs, doors
    spawnHubContent(state.hubRoom.row, state.hubRoom.col)
}

// ============ DUNGEON MODE SETUPS ============

function setupPlatformMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    const idx = stageIndex | 0
    const stageId = spec.stages[idx]
    const tm = getTilemapByID(stageId)
    if (tm) {
        tiles.setCurrentTilemap(tm)
    }
    
    // Spawn platform player
    playerSprite = sprites.create(imgPlatformPlayer(), KIND_PLAYER)
    playerSprite.setPosition(80, 60)  // TODO: find spawn tile
    playerSprite.ay = 300  // gravity
    
    // Platform controls
    initPlatformPlayer(playerSprite)
    
    // Stage-specific data
    state.dungeonStageData = {
        stageIndex: stageIndex,
        reachedGoal: false
    }
}

function setupShooterMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    const idx = stageIndex | 0
    const stageId = spec.stages[idx]
    const tm = getTilemapByID(stageId)
    if (tm) {
        tiles.setCurrentTilemap(tm)
    }
    
    // Spawn shooter ship
    playerSprite = sprites.create(imgShooterShip(), KIND_PLAYER)
    playerSprite.setPosition(80, 100)
    playerSprite.setStayInScreen(true)
    
    // Shooter controls
    initShooterPlayer(playerSprite)
    
    // Stage data
    state.dungeonStageData = {
        stageIndex: stageIndex,
        wavesComplete: 0,
        enemiesAlive: 0
    }
}

function setupAsteroidsMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    const idx = stageIndex | 0
    const stageId = spec.stages[idx]
    // No tilemap for asteroids (open space)
    scene.setBackgroundColor(1)
    
    // Spawn asteroids ship
    playerSprite = sprites.create(imgAsteroidsShip(), KIND_PLAYER)
    playerSprite.setPosition(80, 60)
    
    // Asteroids controls
    initAsteroidsPlayer(playerSprite)
    
    // Stage data
    state.dungeonStageData = {
        stageIndex: stageIndex,
        debrisCount: 0,
        partsCollected: 0
    }
}

function setupRhythmMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    const idx = stageIndex | 0
    const stageId = spec.stages[idx]
    const tm = getTilemapByID(stageId)
    if (tm) {
        tiles.setCurrentTilemap(tm)
    }
    
    // Rhythm player
    playerSprite = sprites.create(imgRhythmPlayer(), KIND_PLAYER)
    playerSprite.setPosition(80, 60)
    
    // Rhythm controls
    initRhythmPlayer(playerSprite)
    
    // Stage data
    const bpm = (spec.params && spec.params.bpm) || 120
    const beatIntervalMs = 60000 / bpm
    
    state.dungeonStageData = {
        stageIndex: stageIndex,
        bpm: bpm,
        beatIntervalMs: beatIntervalMs,
        nextBeatTime: game.runtime() + beatIntervalMs,
        streak: 0,
        misses: 0
    }
}

function setupPuzzleMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    const idx = stageIndex | 0
    const stageId = spec.stages[idx]
    const tm = getTilemapByID(stageId)
    if (tm) {
        tiles.setCurrentTilemap(tm)
    }
    
    // Puzzle player (top-down or cursor)
    playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER)
    playerSprite.setPosition(80, 60)
    
    // Puzzle controls
    initPuzzlePlayer(playerSprite)
    
    // Stage data (dungeon-specific)
    state.dungeonStageData = {
        stageIndex: stageIndex,
        tokensCollected: 0,
        switchesActivated: 0,
        gatesOpen: false
    }
}

function setupMetaMode(payload: any) {
    const dungeonId = payload.dungeonId
    const stageIndex = payload.stageIndex || 0
    
    state.currentDungeonId = dungeonId
    state.currentStageIndex = stageIndex
    
    // Meta mode orchestrates sub-stages
    state.dungeonStageData = {
        stageIndex: stageIndex,
        microStageComplete: false
    }
    
    showHint("[META_MODE_STAGE_" + stageIndex + "]", 3000)
}

// ============ GLOBAL EVENT HANDLERS (registered once) ============

function registerGlobalHandlers() {
    // Pause menu
    controller.menu.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.gameMode === GameMode.Hub || state.gameMode === GameMode.Dungeon) {
            showPauseMenu()
        }
    })
    
    // Tool use
    controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.currentTool && !state.transitionLock) {
            useTool(state.currentTool)
        }
    })
    
    // Interact
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        handleInteract()
    })
    
    // Game update loop
    game.onUpdate(() => {
        updateGameLoop()
    })
}

function handleInteract() {
    if (state.playMode !== PlayMode.HUB_TOPDOWN) return
    if (!canInteract()) return
    if (!playerSprite) return
    
    // Check for nearby interactables (doors, NPCs)
    // Placeholder: check overlaps
    const nearby = sprites.allOfKind(KIND_DOOR).concat(sprites.allOfKind(KIND_NPC))
    for (const s of nearby) {
        if (Math.abs(playerSprite.x - s.x) < INTERACT_DISTANCE && Math.abs(playerSprite.y - s.y) < INTERACT_DISTANCE) {
            markInteract()
            handleInteractable(s)
            return
        }
    }
}

    function handleInteractable(s: Sprite) {
        if (s.kind() === KIND_DOOR) {
            // Enter dungeon
            const dungeonId = (s as any).dungeonId as string
            if (dungeonId) enterDungeon(dungeonId)
        } else if (s.kind() === KIND_NPC) {
            // Talk to NPC
            const dialogId = (s as any).dialogId as string
            if (dialogId) showDialog(dialogId)
        }
    }

    // ============ DUNGEON ENTRY ============

    export function enterDungeon(dungeonId: string) {
    const spec = DUNGEON_SPECS.find(d => d.id === dungeonId)
    if (!spec) return
    
    // Transition → Cutscene → Dungeon
    setGameMode(GameMode.Transition)
    pause(TRANSITION_PAUSE_MS)
    
    setGameMode(GameMode.Cutscene)
    playCutscene(spec.introCutsceneId, () => {
        // IMMEDIATE mode switch after cutscene
        setGameMode(GameMode.Dungeon)
        switchPlayMode(spec.playMode, {
            dungeonId: dungeonId,
            stageIndex: 0
        })
    })
}

    export function exitDungeon() {
        if (!state.currentDungeonId) return
        
        const spec = DUNGEON_SPECS.find(d => d.id === state.currentDungeonId)
        if (!spec) return
        
        // Return to hub
        setGameMode(GameMode.Hub)
        switchPlayMode(PlayMode.HUB_TOPDOWN, {
            spawnTag: spec.hubReturnSpawnTag
        })
        
        state.currentDungeonId = null
        state.currentStageIndex = 0
    }

    export function completeDungeon() {
    if (!state.currentDungeonId) return
    
    const spec = DUNGEON_SPECS.find(d => d.id === state.currentDungeonId)
    if (!spec) return
    
    // Apply rewards
    for (const flag of spec.rewards.flagsSet) {
        setFlag(flag)
    }
    
    if (spec.rewards.toolUnlocks) {
        for (const tool of spec.rewards.toolUnlocks) {
            unlockTool(tool)
        }
    }
    
    if (spec.rewards.items) {
        for (const item of spec.rewards.items) {
            addItem(item.id, item.qty)
        }
    }
    
    saveGame()
    
    // Return to hub
    exitDungeon()
}

// ============ GAME LOOP ============

function updateGameLoop() {
    // Update HUD
    if (state.gameMode === GameMode.Hub || state.gameMode === GameMode.Dungeon) {
        updateHUD()
    }
    
    // Mode-specific updates
    if (state.playMode === PlayMode.DUN_PLATFORM) {
        updatePlatformMode()
    } else if (state.playMode === PlayMode.DUN_SHOOTER) {
        updateShooterMode()
    } else if (state.playMode === PlayMode.DUN_ASTEROIDS) {
        updateAsteroidsMode()
    } else if (state.playMode === PlayMode.DUN_RHYTHM) {
        updateRhythmMode()
    } else if (state.playMode === PlayMode.DUN_PUZZLE) {
        updatePuzzleMode()
    }
}

function updatePlatformMode() {
    if (!playerSprite || !state.dungeonStageData) return
    if (!game.currentScene().tileMap) return

    const loc = playerSprite.tilemapLocation()
    if (!loc) return
    const goalTile = tiles.getTileImage(TILE_GOAL_FLAG as any)
    
    // Platform movement (handled via controller in player_modes)
    // Check for goal
    if (goalTile && tiles.tileAtLocationEquals(loc, goalTile) && !state.dungeonStageData.reachedGoal) {
        state.dungeonStageData.reachedGoal = true
        onStageComplete()
    }
}

function updateShooterMode() {
    // Wave/enemy management (placeholder)
}

function updateAsteroidsMode() {
    // Debris/parts management (placeholder)
}

function updateRhythmMode() {
    if (!state.dungeonStageData) return
    
    // Beat timing (placeholder)
    const now = game.runtime()
    if (now >= state.dungeonStageData.nextBeatTime) {
        state.dungeonStageData.nextBeatTime += state.dungeonStageData.beatIntervalMs
        // Visual cue for beat window
    }
}

function updatePuzzleMode() {
    // Puzzle state checks (placeholder)
}

function onStageComplete() {
    if (!state.currentDungeonId) return
    
    const spec = DUNGEON_SPECS.find(d => d.id === state.currentDungeonId)
    if (!spec) return
    
    const nextStageIndex = state.currentStageIndex + 1
    
    if (nextStageIndex >= spec.stages.length) {
        // Dungeon complete
        completeDungeon()
    } else {
        // Next stage
        switchPlayMode(state.playMode, {
            dungeonId: state.currentDungeonId,
            stageIndex: nextStageIndex
        })
    }
}

    export function getPlayerSprite(): Sprite {
        return playerSprite
    }
}

// MANUAL TEST PASSED: GameController scaffold complete
