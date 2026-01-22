// GameController: GameMode/PlayMode StateMachine, transitions, cleanup
// NOTE: Arcade runtime exposes globals (game, tiles, controller, sprites); imports are not required.

namespace GameController {
  let playerSprite: Sprite = null;
  const TRANSITION_PAUSE_MS = 100;
  const CONTINUE_YES = 1;

  export function start() {
    initState();
    
    // Run dungeon registry validation
    runDungeonRegistryValidation();
    
    registerGlobalHandlers();
    setGameMode(GameMode.Title);
    showTitle();
  }

  function showTitle() {
    scene.setBackgroundColor(1);
    game.splash("[TITLE_NEON_KIEZ]");
    if (hasSaveData()) {
      const cont = game.askForNumber("Continue? 1=Yes 0=New", 1);
      if (cont === CONTINUE_YES) {
        loadGame();
      }
    }
    startHub();
  }

  function startHub() {
    setGameMode(GameMode.Hub);
    switchPlayMode(PlayMode.HUB_TOPDOWN, {
      hubRoom: state.hubRoom,
      spawnTag: null,
    });
  }

  // ============ MODE SWITCHING (THE HEART) ============

  export function switchPlayMode(nextMode: number, payload: any) {
    if (state.transitionLock) return;

    state.transitionLock = true;

    // Cleanup current mode
    cleanupCurrentPlayMode();

    // Setup next mode
    state.playMode = nextMode;
    setupNextPlayMode(nextMode, payload);

    state.transitionLock = false;
  }

  function cleanupCurrentPlayMode() {
    // Destroy all sprites except HUD elements
    const allSprites = game.currentScene().allSprites;
    for (const s of allSprites) {
      if (s.flags & SpriteFlag.RelativeToCamera) continue;
      const sprite = s as Sprite;
      sprite.destroy();
    }

    // Reset camera
    scene.centerCameraAt(80, 60);

    // Reset background scroll
    scroller.setLayerImage(scroller.BackgroundLayer.Layer0, image.create(1, 1));
    scroller.setLayerImage(scroller.BackgroundLayer.Layer1, image.create(1, 1));

    // Clear tilemap
    tiles.setCurrentTilemap(null);

    // Reset player reference
    playerSprite = null;

    // Clear mode-specific state
    state.dungeonStageData = null;
  }

  function setupNextPlayMode(mode: number, payload: any) {
    if (mode === PlayMode.HUB_TOPDOWN) {
      setupHubMode(payload);
    } else if (mode === PlayMode.DUN_PLATFORM) {
      setupPlatformMode(payload);
    } else if (mode === PlayMode.DUN_SHOOTER) {
      setupShooterMode(payload);
    } else if (mode === PlayMode.DUN_ASTEROIDS) {
      setupAsteroidsMode(payload);
    } else if (mode === PlayMode.DUN_RHYTHM) {
      setupRhythmMode(payload);
    } else if (mode === PlayMode.DUN_PUZZLE) {
      setupPuzzleMode(payload);
    } else if (mode === PlayMode.DUN_META) {
      setupMetaMode(payload);
    }

    updateHUD();
  }

  // ============ HUB MODE SETUP ============

  function setupHubMode(payload: any) {
    HubMode.setup(payload);
  }

  // ============ DUNGEON MODE SETUPS ============

  function setupPlatformMode(payload: any) {
    PlatformMode.setup(payload);
  }

  function setupShooterMode(payload: any) {
    ShooterMode.setup(payload);
  }

  function setupAsteroidsMode(payload: any) {
    AsteroidsMode.setup(payload);
  }

  function setupRhythmMode(payload: any) {
    RhythmMode.setup(payload);
  }

  function setupPuzzleMode(payload: any) {
    const dungeonId = payload.dungeonId;
    const stageIndex = payload.stageIndex || 0;

    state.currentDungeonId = dungeonId;
    state.currentStageIndex = stageIndex;

    const spec = DUNGEON_SPECS.find((d) => d.id === dungeonId);
    if (!spec) return;

    const idx = stageIndex | 0;
    const stageId = spec.stages[idx];
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    // Puzzle player (top-down or cursor)
    playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER);

    // Find spawn tile
    const spawnTiles = tiles.getTilesByType(tiles.getTileImage(1 as any));
    if (spawnTiles && spawnTiles.length > 0) {
      tiles.placeOnTile(playerSprite, spawnTiles[0]);
    } else {
      playerSprite.setPosition(80, 60);
    }

    // Puzzle controls
    initPuzzlePlayer(playerSprite);

    // Get tokens required for this stage (Dungeon 1 specific)
    let tokensRequired = 0;
    if (dungeonId === "DUN_LAUNDROMAT_LABYRINTH" && spec.params && spec.params.tokensPerStage) {
      tokensRequired = spec.params.tokensPerStage[idx] || 0;
    }

    // Stage data (dungeon-specific)
    state.dungeonStageData = {
      stageIndex: stageIndex,
      tokensCollected: 0,
      tokensRequired: tokensRequired,
      switchesActivated: 0,
      gatesOpen: false,
      stageComplete: false,
    };

    // Spawn stage-specific content
    PuzzleMode.spawnContent(dungeonId, stageIndex);
  }

  function setupMetaMode(payload: any) {
    MetaMode.setup(payload);
  }

  // ============ GLOBAL EVENT HANDLERS (registered once) ============

  function registerGlobalHandlers() {
    // Initialize HUD on first update (after extensions are loaded)
    let hudInitialized = false;

    // Pause menu
    controller.menu.onEvent(ControllerButtonEvent.Pressed, () => {
      if (
        state.gameMode === GameMode.Hub ||
        state.gameMode === GameMode.Dungeon
      ) {
        showPauseMenu();
      }
    });

    // Tool use
    controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
      if (state.currentTool && !state.transitionLock) {
        useTool(state.currentTool);
      }
    });

    // Interact
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
      handleInteract();
    });

    // Puzzle mode: Token collection (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_PLAYER, KIND_COLLECTIBLE, (sprite, collectible) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (game.runtime() < state.lastOverlapTime + OVERLAP_COOLDOWN_MS) return;
      
      collectToken(collectible);
      state.lastOverlapTime = game.runtime();
    });

    // Puzzle mode: Ghost-Bot collision (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_PLAYER, KIND_ENEMY, (player, enemy) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (game.runtime() < state.invincibleUntil) return;
      
      handleGhostBotCollision(player, enemy);
    });

    // Meta mode: Projectile hits target (registered globally)
    sprites.onOverlap(KIND_PROJECTILE, KIND_TARGET, (projectile, target) => {
      if (state.playMode !== PlayMode.DUN_META) return;
      if (state.currentStageIndex !== 2) return; // Only in micro-shooter stage
      
      handleTargetHit(projectile, target);
    });

    // Meta mode: Stabilization node interaction (registered globally)
    sprites.onOverlap(KIND_PLAYER, KIND_INTERACTABLE, (player, node) => {
      if (state.playMode !== PlayMode.DUN_META) return;
      if (state.currentStageIndex !== 4) return; // Only in stabilize stage
      if (game.runtime() < state.lastOverlapTime + OVERLAP_COOLDOWN_MS) return;
      
      handleStabilizationNode(node);
      state.lastOverlapTime = game.runtime();
    });

    // Dungeon 5: Ball + Paddle collision (bounce physics)
    sprites.onOverlap(KIND_BALL, KIND_PADDLE, (ball, paddle) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (state.currentDungeonId !== "DUN_SCHOOL_PONG_COURT") return;
      
      handleBallPaddleBounce(ball, paddle);
    });

    // Dungeon 5: Ball + Target collision (destroy target)
    sprites.onOverlap(KIND_BALL, KIND_TARGET, (ball, target) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (state.currentDungeonId !== "DUN_SCHOOL_PONG_COURT") return;
      
      handleBallTargetHit(ball, target);
    });

    // Game update loop
    game.onUpdate(() => {
      // Initialize HUD on first update (after extensions are loaded)
      if (!hudInitialized) {
        initHUD();
        hudInitialized = true;
      }
      updateGameLoop();
    });
  }

  function handleTargetHit(projectile: Sprite, target: Sprite) {
    if (!state.dungeonStageData) return;

    // Verify it's actually a target (overlap handlers can fire for different sprite kinds)
    if (target.kind() !== KIND_TARGET) return;

    // Destroy both projectile and target
    projectile.destroy();
    target.destroy();

    // Increment counter using shared helper
    incrementTargetCounter();
    sfxInteract();
  }

  function handleBallPaddleBounce(ball: Sprite, paddle: Sprite) {
    PuzzleMode.handleBallPaddleBounce(ball, paddle);
  }

  function handleBallTargetHit(ball: Sprite, target: Sprite) {
    PuzzleMode.handleBallTargetHit(ball, target);
  }

  function incrementTargetCounter() {
    // Delegated to PuzzleMode
  }

  function handleMicroPlatformJump() {
    MetaMode.handleMicroPlatformJump();
  }

  function handleMicroShooterShoot() {
    MetaMode.handleMicroShooterShoot();
  }

  function handleMicroRhythmTap() {
    MetaMode.handleMicroRhythmTap();
  }

  function handleStabilizationNode(node: Sprite) {
    MetaMode.handleStabilizationNode(node);
  }

  function handleInteract() {
    // Meta mode actions
    if (state.playMode === PlayMode.DUN_META) {
      const stageIdx = state.currentStageIndex;
      if (stageIdx === 1) {
        handleMicroPlatformJump();
      } else if (stageIdx === 2) {
        handleMicroShooterShoot();
      } else if (stageIdx === 3) {
        handleMicroRhythmTap();
      }
      return;
    }

    // Hub mode interactions
    HubMode.handleInteract();
  }

  // ============ DUNGEON ENTRY ============

  export function enterDungeon(dungeonId: string) {
    const spec = DUNGEON_SPECS.find((d) => d.id === dungeonId);
    if (!spec) return;

    // Transition → Cutscene → Dungeon
    setGameMode(GameMode.Transition);
    pause(TRANSITION_PAUSE_MS);

    setGameMode(GameMode.Cutscene);
    playCutscene(spec.introCutsceneId, () => {
      // IMMEDIATE mode switch after cutscene
      setGameMode(GameMode.Dungeon);
      switchPlayMode(spec.playMode, {
        dungeonId: dungeonId,
        stageIndex: 0,
      });
    });
  }

  export function exitDungeon() {
    if (!state.currentDungeonId) return;

    const spec = DUNGEON_SPECS.find((d) => d.id === state.currentDungeonId);
    if (!spec) return;

    // Return to hub
    setGameMode(GameMode.Hub);
    switchPlayMode(PlayMode.HUB_TOPDOWN, {
      spawnTag: spec.hubReturnSpawnTag,
    });

    state.currentDungeonId = null;
    state.currentStageIndex = 0;
  }

  export function completeDungeon() {
    if (!state.currentDungeonId) return;

    const spec = DUNGEON_SPECS.find((d) => d.id === state.currentDungeonId);
    if (!spec) return;

    // Apply rewards
    for (const flag of spec.rewards.flagsSet) {
      setFlag(flag);
    }

    if (spec.rewards.toolUnlocks) {
      for (const tool of spec.rewards.toolUnlocks) {
        unlockTool(tool);
      }
    }

    if (spec.rewards.items) {
      for (const item of spec.rewards.items) {
        addItem(item.id, item.qty);
      }
    }

    // Check if all dungeons (1-8) are now cleared to unlock final dungeon
    if (checkAllDungeonsClearExceptFinal()) {
      setFlag("FLAG_ALL_DUNGEONS_CLEARED");
      // Show special message
      control.runInParallel(() => {
        pause(1000);
        game.splash("[FINAL_DUNGEON_UNLOCKED]");
      });
    }

    saveGame();

    // Return to hub
    exitDungeon();
  }

  // ============ GAME LOOP ============

  function updateGameLoop() {
    // Update HUD
    if (
      state.gameMode === GameMode.Hub ||
      state.gameMode === GameMode.Dungeon
    ) {
      updateHUD();
    }

    // Mode-specific updates
    if (state.playMode === PlayMode.DUN_PLATFORM) {
      updatePlatformMode();
    } else if (state.playMode === PlayMode.DUN_SHOOTER) {
      updateShooterMode();
    } else if (state.playMode === PlayMode.DUN_ASTEROIDS) {
      updateAsteroidsMode();
    } else if (state.playMode === PlayMode.DUN_RHYTHM) {
      updateRhythmMode();
    } else if (state.playMode === PlayMode.DUN_PUZZLE) {
      updatePuzzleMode();
    } else if (state.playMode === PlayMode.DUN_META) {
      updateMetaMode();
    }
  }

  function updatePlatformMode() {
    PlatformMode.update();
  }

  function updateShooterMode() {
    // Wave/enemy management (placeholder)
  }

  function updateAsteroidsMode() {
    // Debris/parts management (placeholder)
  }

  function updateRhythmMode() {
    if (!playerSprite || !state.dungeonStageData) return;

    const now = game.runtime();
    const data = state.dungeonStageData;

    // DECISION: Guard against invalid or zero beatIntervalMs to avoid divide-by-zero
    if (data.beatIntervalMs > 0 && now >= data.nextBeatTime) {
      const beatsBehind = now - data.nextBeatTime;
      const beatsToAdvance = Math.floor(beatsBehind / data.beatIntervalMs) + 1;
      data.nextBeatTime += beatsToAdvance * data.beatIntervalMs;
      // Visual cue for beat window (placeholder)
    }
  }

  function updatePuzzleMode() {
    PuzzleMode.update();
  }

  function updateMetaMode() {
    MetaMode.update();
  }



  export function onStageComplete() {
    if (!state.currentDungeonId) return;

    const spec = DUNGEON_SPECS.find((d) => d.id === state.currentDungeonId);
    if (!spec) return;

    const nextStageIndex = state.currentStageIndex + 1;

    if (nextStageIndex >= spec.stages.length) {
      // Dungeon complete
      completeDungeon();
    } else {
      // Next stage
      switchPlayMode(state.playMode, {
        dungeonId: state.currentDungeonId,
        stageIndex: nextStageIndex,
      });
    }
  }

  export function getPlayerSprite(): Sprite {
    return playerSprite;
  }

  export function setPlayerSprite(sprite: Sprite) {
    playerSprite = sprite;
  }
}

// Global accessors for playerSprite (used by sub-modules)
function getPlayerSprite(): Sprite {
  return GameController.getPlayerSprite();
}

function setPlayerSprite(sprite: Sprite) {
  GameController.setPlayerSprite(sprite);
}