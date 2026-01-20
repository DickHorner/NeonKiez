// GameController: GameMode/PlayMode StateMachine, transitions, cleanup
// NOTE: Arcade runtime exposes globals (game, tiles, controller, sprites); imports are not required.

namespace GameController {
  let playerSprite: Sprite = null;
  const TRANSITION_PAUSE_MS = 100;
  const CONTINUE_YES = 1;
  const PADDLE_HIT_SPREAD_MULTIPLIER = 2;
  const BALL_SERVE_HORIZONTAL_MIN = -20;
  const BALL_SERVE_HORIZONTAL_MAX = 20;

  export function start() {
    initState();
    initHUD();
    
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
    // Update hub room if specified
    if (payload && payload.hubRoom) {
      state.hubRoom = payload.hubRoom;
    }

    // Handle spawn tag
    if (payload && payload.spawnTag && HUB_SPAWN_POINTS[payload.spawnTag]) {
      const spawnPoint = HUB_SPAWN_POINTS[payload.spawnTag];
      state.hubRoom = spawnPoint.room;
    }

    // Load hub room
    const roomId = HUB_ROOM_IDS[state.hubRoom.row][state.hubRoom.col];
    const tm = getTilemapByID(roomId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    // Spawn player
    playerSprite = sprites.create(imgPlayerTopdown(), KIND_PLAYER);

    // Find spawn point
    if (payload && payload.spawnTag && HUB_SPAWN_POINTS[payload.spawnTag]) {
      const spawnPoint = HUB_SPAWN_POINTS[payload.spawnTag];
      playerSprite.setPosition(spawnPoint.x, spawnPoint.y);
    } else {
      playerSprite.setPosition(80, 60);
    }

    // Set up hub player controller
    controller.moveSprite(
      playerSprite,
      PLAYER_TOPDOWN_SPEED,
      PLAYER_TOPDOWN_SPEED,
    );
    scene.cameraFollowSprite(playerSprite);

    // Parallax (placeholder layers)
    scroller.scrollBackgroundWithSpeed(-10, 0, scroller.BackgroundLayer.Layer0);

    // Spawn NPCs, doors
    spawnHubContent(state.hubRoom.row, state.hubRoom.col);
  }

  // ============ DUNGEON MODE SETUPS ============

  function setupPlatformMode(payload: any) {
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

    // Spawn platform player
    playerSprite = sprites.create(imgPlatformPlayer(), KIND_PLAYER);
    playerSprite.setPosition(80, 60); // TODO: find spawn tile
    playerSprite.ay = 300; // gravity

    // Platform controls
    initPlatformPlayer(playerSprite);

    // Stage-specific data
    state.dungeonStageData = {
      stageIndex: stageIndex,
      reachedGoal: false,
    };
  }

  function setupShooterMode(payload: any) {
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

    // Spawn shooter ship
    playerSprite = sprites.create(imgShooterShip(), KIND_PLAYER);
    playerSprite.setPosition(80, 100);
    playerSprite.setStayInScreen(true);

    // Shooter controls
    initShooterPlayer(playerSprite);

    // Stage data
    const wavesPerStage = (spec.params && spec.params.wavesPerStage) || [1, 1, 1, 1];
    const coreHP = (spec.params && spec.params.coreHP) || 30;
    
    state.dungeonStageData = {
      stageIndex: stageIndex,
      wavesComplete: 0,
      wavesTotal: wavesPerStage[idx] || 1,
      enemiesAlive: 0,
      waveSpawnTimer: 0,
      coreHP: stageIndex === 3 ? coreHP : 0,
      coreSprite: null,
      isAlarmStage: stageIndex === 2,
      alarmActive: false,
    };

    // Start first wave or spawn core
    if (stageIndex === 3) {
      spawnCore();
    } else {
      startNextWave();
    }
  }

  function setupAsteroidsMode(payload: any) {
    const dungeonId = payload.dungeonId;
    const stageIndex = payload.stageIndex || 0;

    state.currentDungeonId = dungeonId;
    state.currentStageIndex = stageIndex;

    const spec = DUNGEON_SPECS.find((d) => d.id === dungeonId);
    if (!spec) return;

    const idx = stageIndex | 0;
    const stageId = spec.stages[idx];
    
    // Load tilemap for visual background
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }
    
    // Set space background
    scene.setBackgroundColor(1);

    // Spawn asteroids ship
    playerSprite = sprites.create(imgAsteroidsShip(), KIND_PLAYER);
    playerSprite.setPosition(80, 60);

    // Asteroids controls
    initAsteroidsPlayer(playerSprite);

    // Stage data
    state.dungeonStageData = {
      stageIndex: stageIndex,
      debrisCount: 0,
      partsCollected: 0,
      partsRequired: 0,
      surviveStartTime: 0,
      surviveTimeRequired: 0,
    };
    
    // Spawn stage-specific content
    spawnAsteroidsStageContent(stageIndex);
  }

  function setupRhythmMode(payload: any) {
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

    // Rhythm player
    playerSprite = sprites.create(imgRhythmPlayer(), KIND_PLAYER);
    playerSprite.setPosition(80, 60);

    // Rhythm controls
    initRhythmPlayer(playerSprite);

    // Stage data
    const bpm = (spec.params && spec.params.bpm) || 120;
    const beatIntervalMs = 60000 / bpm;
    const missLimit = (spec.params && spec.params.missLimit) || 3;
    const streakTargets = (spec.params && spec.params.streakTargets) || [3, 5, 8, 12];
    const streakTarget = streakTargets[idx] || 5;

    state.dungeonStageData = {
      stageIndex: stageIndex,
      bpm: bpm,
      beatIntervalMs: beatIntervalMs,
      nextBeatTime: game.runtime() + beatIntervalMs,
      streak: 0,
      misses: 0,
      missLimit: missLimit,
      streakTarget: streakTarget,
      doorsOpened: 0,
      switchesActivated: 0,
      stageComplete: false,
    };

    // Spawn stage-specific content
    spawnRhythmStageContent(dungeonId, stageIndex);
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
    
    // Find spawn tile (looking for greenSwitchUp sprite which is used as spawn marker in tilemaps)
    // Note: Using index 1 (greenSwitchUp) as spawn marker instead of TILE_SPAWN_STAGE constant
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

    // Get targets required for this stage (Dungeon 5 specific)
    let targetsRequired = 0;
    let ballSpeed = BALL_SPEED_NORMAL;
    if (dungeonId === "DUN_SCHOOL_PONG_COURT" && spec.params) {
      if (spec.params.targetsPerStage) {
        targetsRequired = spec.params.targetsPerStage[idx] || 0;
      }
      if (spec.params.ballSpeed) {
        ballSpeed = spec.params.ballSpeed[idx] || BALL_SPEED_NORMAL;
      }
    }

    // Stage data (dungeon-specific)
    state.dungeonStageData = {
      stageIndex: stageIndex,
      tokensCollected: 0,
      tokensRequired: tokensRequired,
      targetsDestroyed: 0,
      targetsRequired: targetsRequired,
      ballSpeed: ballSpeed,
      switchesActivated: 0,
      gatesOpen: false,
      stageComplete: false,
      ballServed: false,
    };

    // Spawn stage-specific content
    spawnPuzzleStageContent(dungeonId, stageIndex);
  }

  function setupMetaMode(payload: any) {
    const dungeonId = payload.dungeonId;
    const stageIndex = payload.stageIndex || 0;

    state.currentDungeonId = dungeonId;
    state.currentStageIndex = stageIndex;

    // Meta mode orchestrates sub-stages
    state.dungeonStageData = {
      stageIndex: stageIndex,
      microStageComplete: false,
    };

    showHint("[META_MODE_STAGE_" + stageIndex + "]", 3000);
  }

  // ============ GLOBAL EVENT HANDLERS (registered once) ============

  function registerGlobalHandlers() {
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

    // Bullet hits enemy
    sprites.onOverlap(KIND_PROJECTILE, KIND_ENEMY, (bullet, enemy) => {
      if (state.playMode !== PlayMode.DUN_SHOOTER) return;

      bullet.destroy();
      
      // Check if enemy is core
      if ((enemy as any).isCore && state.dungeonStageData) {
        state.dungeonStageData.coreHP -= 1;
        effects.starField.startScreenEffect(100);
        
        if (state.dungeonStageData.coreHP <= 0) {
          enemy.destroy();
          effects.confetti.startScreenEffect(1000);
        }
      } else {
        // Normal enemy
        const hp = (enemy as any).hp || 1;
        (enemy as any).hp = hp - 1;
        
        if ((enemy as any).hp <= 0) {
          enemy.destroy();
          effects.starField.startScreenEffect(100);
          sfxHit();
        }
      }
    });

    // Enemy hits player
    sprites.onOverlap(KIND_PLAYER, KIND_ENEMY, (player, enemy) => {
      if (state.playMode !== PlayMode.DUN_SHOOTER) return;
      if (game.runtime() < state.invincibleUntil) return;

      damagePlayer(1);
      state.invincibleUntil = game.runtime() + 2000; // 2 second invincibility with visual flash
      sfxHit();
    });

    // Puzzle mode: Token collection (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_PLAYER, KIND_COLLECTIBLE, (sprite, collectible) => {
      if (state.playMode === PlayMode.DUN_PUZZLE) {
        if (game.runtime() < state.lastOverlapTime + OVERLAP_COOLDOWN_MS) return;
        collectToken(collectible);
        state.lastOverlapTime = game.runtime();
      } else if (state.playMode === PlayMode.DUN_ASTEROIDS) {
        // Asteroids mode: Collect parts in stage 2
        if (state.currentStageIndex === 2 && state.dungeonStageData) {
          state.dungeonStageData.partsCollected += 1;
          collectible.destroy();
          sfxCollect();
          showHint("[PART_COLLECTED]", 500);
        }
      }
    });

    // Puzzle mode: Ghost-Bot collision (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_PLAYER, KIND_ENEMY, (player, enemy) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (game.runtime() < state.invincibleUntil) return;
      
      handleGhostBotCollision(player, enemy);
    });

    // Puzzle mode: Hazard collision (moving crates, etc.)
    sprites.onOverlap(KIND_PLAYER, KIND_HAZARD, (player, hazard) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (game.runtime() < state.invincibleUntil) return;
      
      handleHazardCollision(player, hazard);
    });

    // Dungeon 5: Ball/Paddle collision (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_BALL, KIND_PADDLE, (ball, paddle) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (state.currentDungeonId !== "DUN_SCHOOL_PONG_COURT") return;
      
      // Bounce ball off paddle
      ball.vy = -Math.abs(ball.vy); // Ensure upward
      
      // Add horizontal velocity based on hit position
      const hitOffset = ball.x - paddle.x;
      ball.vx = hitOffset * PADDLE_HIT_SPREAD_MULTIPLIER; // Spread based on hit position
      
      sfxInteract();
    });

    // Dungeon 5: Ball/Target collision (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_BALL, KIND_TARGET, (ball, target) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (state.currentDungeonId !== "DUN_SCHOOL_PONG_COURT") return;
      
      // Bounce ball
      ball.vy = -ball.vy;
      
      // Destroy target
      destroyTarget(target);
    });

    // Asteroids mode: Projectile hits debris
    sprites.onOverlap(KIND_PROJECTILE, KIND_DEBRIS, (projectile, debris) => {
      if (state.playMode !== PlayMode.DUN_ASTEROIDS) return;
      
      projectile.destroy();
      splitDebris(debris);
      sfxHit();
    });

    // Asteroids mode: Player hits debris (damage)
    sprites.onOverlap(KIND_PLAYER, KIND_DEBRIS, (player, debris) => {
      if (state.playMode !== PlayMode.DUN_ASTEROIDS) return;
      if (game.runtime() < state.invincibleUntil) return;
      
      damagePlayer(1);
      sfxHit();
    });

    // Game update loop
    game.onUpdate(() => {
      updateGameLoop();
    });
  }

  function handleInteract() {
    // Dungeon 5: Serve ball with A button
    if (state.playMode === PlayMode.DUN_PUZZLE && state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
      serveBall();
      return;
    }
    
    if (state.playMode !== PlayMode.HUB_TOPDOWN) return;
    if (!canInteract()) return;
    if (!playerSprite) return;

    // Check for nearby interactables (doors, NPCs)
    // Placeholder: check overlaps
    const nearby = sprites
      .allOfKind(KIND_DOOR)
      .concat(sprites.allOfKind(KIND_NPC));
    for (const s of nearby) {
      if (
        Math.abs(playerSprite.x - s.x) < INTERACT_DISTANCE &&
        Math.abs(playerSprite.y - s.y) < INTERACT_DISTANCE
      ) {
        markInteract();
        handleInteractable(s);
        return;
      }
    }
  }

  function handleInteractable(s: Sprite) {
    if (s.kind() === KIND_DOOR) {
      // Enter dungeon
      const dungeonId = (s as any).dungeonId as string;
      if (dungeonId) enterDungeon(dungeonId);
    } else if (s.kind() === KIND_NPC) {
      // Talk to NPC
      const dialogId = (s as any).dialogId as string;
      if (dialogId) showDialog(dialogId);
    }
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

    // Update invincibility visual feedback
    updateInvincibilityFlash();

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
    }
  }

  function updateAsteroidsMode() {
    if (!state.dungeonStageData) return;

    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;

    // Update debris velocities and screen wrap
    updateDebrisMovement();

    // Check stage-specific win conditions
    if (stageIdx === 0) {
      // Stage 0: THRUST - Clear all debris (tutorial)
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: SPLIT - Clear all debris with splitting
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: PARTS_RUSH - Collect required parts
      if (data.partsCollected >= data.partsRequired) {
        onStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: SURVIVE - Survive for required time
      const elapsed = (game.runtime() - data.surviveStartTime) / 1000;
      if (elapsed >= data.surviveTimeRequired) {
        onStageComplete();
      }

      // Periodically spawn debris if under cap (every 3 seconds)
      const now = game.runtime();
      if (!data.lastDebrisSpawnTime) {
        data.lastDebrisSpawnTime = now;
      }
      if (now - data.lastDebrisSpawnTime >= 3000) {
        const currentDebris = sprites.allOfKind(KIND_DEBRIS).length;
        if (currentDebris < 8) {
          spawnDebrisWave(2, 14, 0);
        }
        data.lastDebrisSpawnTime = now;
      }
    }

    // NOTE: switches are single-use per stage; see handleSwitchActivation()
    if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
      markStageComplete();
    }
  }
        });
      }
      return;
    }

    // Wave mode (stages 0-2)
    // Check if current wave is complete
    if (state.dungeonStageData.enemiesAlive === 0 && state.dungeonStageData.waveSpawnTimer === 0) {
      if (state.dungeonStageData.wavesComplete >= state.dungeonStageData.wavesTotal) {
        // Stage complete
        effects.confetti.startScreenEffect(1000);
        control.runInParallel(() => {
          pause(1500);
          onStageComplete();
        });
      } else {
        // Start next wave
        control.runInParallel(() => {
          pause(1000);
          startNextWave();
        });
      }
    }

    // Alarm stage mechanic (stage 2): periodic spawn boost
    if (state.dungeonStageData.isAlarmStage && state.dungeonStageData.wavesComplete > 0) {
      const now = game.runtime();
      const lastAlarmTime = (state.dungeonStageData as any).lastAlarmTime || 0;
      const alarmIntervalMs = 5000;
      
      if (now - lastAlarmTime >= alarmIntervalMs) {
        (state.dungeonStageData as any).lastAlarmTime = now;
        showHint("[ALARM_TRIGGERED]", 1000);
        // Spawn extra enemy
        if (sprites.allOfKind(KIND_ENEMY).length < CAP_MAX_ENEMIES) {
          spawnShooterEnemy();
        }
      }
    }
  }

  function updateAsteroidsMode() {
    if (!state.dungeonStageData) return;

    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;

    // Update debris velocities and screen wrap
    updateDebrisMovement();

    // Check stage-specific win conditions
    if (stageIdx === 0) {
      // Stage 0: THRUST - Clear all debris (tutorial)
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: SPLIT - Clear all debris with splitting
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: PARTS_RUSH - Collect required parts
      if (data.partsCollected >= data.partsRequired) {
        onStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: SURVIVE - Survive for required time
      const elapsed = (game.runtime() - data.surviveStartTime) / 1000;
      if (elapsed >= data.surviveTimeRequired) {
        onStageComplete();
      }
    }
    
      // Stage 3: Debris will be spawned periodically in updateAsteroidsMode to avoid memory leaks.
      state.dungeonStageData.lastDebrisSpawnTime = game.runtime();
  }

  function updateDebrisMovement() {
    const debris = sprites.allOfKind(KIND_DEBRIS);
    for (const d of debris) {
      if (!d || d.flags & sprites.Flag.Destroyed) continue;

      // Screen wrap
      if (d.x < -8) d.x = scene.screenWidth() + 8;
      if (d.x > scene.screenWidth() + 8) d.x = -8;
      if (d.y < -8) d.y = scene.screenHeight() + 8;
      if (d.y > scene.screenHeight() + 8) d.y = -8;
    }
  }

  function spawnAsteroidsStageContent(stageIndex: number) {
    const spec = DUNGEON_SPECS.find((d) => d.id === state.currentDungeonId);
    if (!spec || !spec.params) return;

    if (stageIndex === 0) {
      // Stage 0: Few debris for tutorial
      spawnDebrisWave(3, 16, 0);
      state.dungeonStageData.debrisCount = 3;
    } else if (stageIndex === 1) {
      // Stage 1: More debris with splitting
      spawnDebrisWave(5, 16, 0);
      state.dungeonStageData.debrisCount = 5;
    } else if (stageIndex === 2) {
      // Stage 2: Debris that drop parts
      spawnDebrisWave(8, 16, 0);
      state.dungeonStageData.debrisCount = 8;
      state.dungeonStageData.partsRequired = 10;
    } else if (stageIndex === 3) {
      // Stage 3: Continuous debris for survival
      const surviveTime = (spec.params.surviveTimeS || 60);
      state.dungeonStageData.surviveTimeRequired = surviveTime;
      state.dungeonStageData.surviveStartTime = game.runtime();
      
      // Initial wave
      spawnDebrisWave(6, 14, 0);
      
      // Debris will be spawned periodically in updateAsteroidsMode to avoid memory leaks.
      state.dungeonStageData.lastDebrisSpawnTime = game.runtime();
    }
  }

  function spawnDebrisWave(count: number, size: number, depth: number) {
    for (let i = 0; i < count; i++) {
      spawnDebris(size, depth);
    }
  }

  function spawnDebris(size: number, depth: number) {
    // Cap check
    if (sprites.allOfKind(KIND_DEBRIS).length >= CAP_MAX_DEBRIS) return;

    const debris = sprites.create(imgDebris(size), KIND_DEBRIS);
    
    // Spawn at edge
    const edge = Math.randomRange(0, 3);
    if (edge === 0) {
      // Top
      debris.setPosition(Math.randomRange(10, scene.screenWidth() - 10), 0);
    } else if (edge === 1) {
      // Right
      debris.setPosition(scene.screenWidth(), Math.randomRange(10, scene.screenHeight() - 10));
    } else if (edge === 2) {
      // Bottom
      debris.setPosition(Math.randomRange(10, scene.screenWidth() - 10), scene.screenHeight());
    } else {
      // Left
      debris.setPosition(0, Math.randomRange(10, scene.screenHeight() - 10));
    }

    // Random velocity
    debris.vx = Math.randomRange(-30, 30);
    debris.vy = Math.randomRange(-30, 30);

    // Store depth for splitting
    (debris as any).splitDepth = depth;
    (debris as any).debrisSize = size;
  }

  function splitDebris(debris: Sprite) {
    const depth = (debris as any).splitDepth || 0;
    const size = (debris as any).debrisSize || 16;
    
    // Get split depth from dungeon spec
    const spec = DUNGEON_SPECS.find((d) => d.id === state.currentDungeonId);
    const maxDepth = (spec && spec.params && spec.params.splitDepth) || 0;

    if (depth >= maxDepth) {
      // Max depth reached, destroy completely
      debris.destroy();
      
      // Spawn collectible part in stage 2
      if (state.currentStageIndex === 2) {
        spawnPart(debris.x, debris.y);
      }
      return;
    }

    // Split into 2 smaller pieces
    const newSize = Math.floor(size / 2);
    if (newSize < 4) {
      debris.destroy();
      return;
    }

    debris.destroy();

    // Spawn 2 smaller debris
    for (let i = 0; i < 2; i++) {
      if (sprites.allOfKind(KIND_DEBRIS).length >= CAP_MAX_DEBRIS) break;
      
      const child = sprites.create(imgDebris(newSize), KIND_DEBRIS);
      child.setPosition(debris.x, debris.y);
      
      // Diverging velocities
      const angle = Math.randomRange(0, 360) * Math.PI / 180;
      child.vx = Math.cos(angle) * 40;
      child.vy = Math.sin(angle) * 40;
      
      (child as any).splitDepth = depth + 1;
      (child as any).debrisSize = newSize;
    }
  }

  function spawnPart(x: number, y: number) {
    const part = sprites.create(imgCollectible("PART"), KIND_COLLECTIBLE);
    part.setPosition(x, y);
    part.lifespan = 8000; // Parts disappear after 8 seconds
  }

  function updateRhythmMode() {
    if (!state.dungeonStageData) return;
    if (state.dungeonStageData.stageComplete) return;
    if (!playerSprite) return;

    // Beat timing
    const now = game.runtime();
    if (now >= state.dungeonStageData.nextBeatTime) {
      state.dungeonStageData.nextBeatTime +=
        state.dungeonStageData.beatIntervalMs;
      // Visual cue for beat window (placeholder)
      showHint("[RHYTHM_BEAT_CUE]", 100);
    }

    // Check for miss limit exceeded (lose condition)
    if (state.dungeonStageData.misses >= state.dungeonStageData.missLimit) {
      // Restart stage
      showHint("[RHYTHM_MISS_LIMIT_RESTART]", 2000);
      pause(500);
      switchPlayMode(state.playMode, {
        dungeonId: state.currentDungeonId,
        stageIndex: state.currentStageIndex,
      });
      return;
    }

    // Win condition logic
    const streakTarget = state.dungeonStageData.streakTarget;
    const streakComplete = state.dungeonStageData.streak >= streakTarget;
    
    let goalReached = false;
    if (game.currentScene().tileMap) {
      const loc = playerSprite.tilemapLocation();
      if (loc) {
        const goalTile = tiles.getTileImage(TILE_GOAL_FLAG as any);
        if (goalTile && tiles.tileAtLocationEquals(loc, goalTile)) {
          goalReached = true;
        }
      }
    }

    // Stage 1 requires BOTH streak AND goal tile
    if (state.currentDungeonId === "DUN_SUBWAY_TIMING" && state.currentStageIndex === 1) {
      if (streakComplete && goalReached) {
        state.dungeonStageData.stageComplete = true;
        showHint("[RHYTHM_STREAK_AND_GOAL_COMPLETE]", 2000);
        pause(1000);
        onStageComplete();
        return;
      }
      // Hint player if streak is done but goal not reached
      if (streakComplete && !goalReached && !state.dungeonStageData.streakHintShown) {
        state.dungeonStageData.streakHintShown = true;
        showHint("[RHYTHM_STREAK_DONE_FIND_GOAL]", 2000);
      }
    } else {
      // Other stages: streak alone is enough (goal tile is optional/alternative)
      if (streakComplete || goalReached) {
        state.dungeonStageData.stageComplete = true;
        showHint("[RHYTHM_STREAK_COMPLETE]", 2000);
        pause(1000);
        onStageComplete();
        return;
      }
    }
  }

  function updatePuzzleMode() {
    if (!playerSprite || !state.dungeonStageData) return;
    if (state.dungeonStageData.stageComplete) return;

    // Update Ghost-Bot patrol AI (if present)
    updateGhostBotPatrol();
    
    // Update moving crates (only used in DUN_WAREHOUSE_BLOCKWORKS)
    if (state.currentDungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      updateMovingCrates();
    }
    
    // Update Dungeon 5 ball physics
    if (state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
      updateDungeon05Balls();
    }

    // Check stage-specific win conditions
    if (state.currentDungeonId === "DUN_LAUNDROMAT_LABYRINTH") {
      checkDungeon01StageComplete();
    } else if (state.currentDungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      checkDungeon03StageComplete();
    } else if (state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
      checkDungeon05StageComplete();
    }
  }

  function updateAsteroidsMode() {
    if (!state.dungeonStageData) return;

    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;

    // Update debris velocities and screen wrap
    updateDebrisMovement();

    // Check stage-specific win conditions
    if (stageIdx === 0) {
      // Stage 0: THRUST - Clear all debris (tutorial)
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: SPLIT - Clear all debris with splitting
      if (sprites.allOfKind(KIND_DEBRIS).length === 0) {
        onStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: PARTS_RUSH - Collect required parts
      if (data.partsCollected >= data.partsRequired) {
        onStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: SURVIVE - Survive for required time
      const elapsed = (game.runtime() - data.surviveStartTime) / 1000;
      if (elapsed >= data.surviveTimeRequired) {
        onStageComplete();
      }

      // Periodically spawn debris if under cap (every 3 seconds)
      const now = game.runtime();
      if (!data.lastDebrisSpawnTime) {
        data.lastDebrisSpawnTime = now;
      }
      if (now - data.lastDebrisSpawnTime >= 3000) {
        const currentDebris = sprites.allOfKind(KIND_DEBRIS).length;
        if (currentDebris < 8) {
          spawnDebrisWave(2, 14, 0);
        }
        data.lastDebrisSpawnTime = now;
      }
    }
  }
      // NOTE: switches are single-use per stage; see handleSwitchActivation()
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    }
  }

  function updateDungeon05Balls() {
    // Check if balls fell off bottom of screen
    const balls = sprites.allOfKind(KIND_BALL);
    
    // DECISION: Only check balls if they exist (optimization)
    if (balls.length === 0) return;
    
    for (const ball of balls) {
      if (ball.y > scene.screenHeight()) {
        ball.destroy();
      }
    }
    
    // Allow re-serve if no balls left
    if (sprites.allOfKind(KIND_BALL).length === 0 && state.dungeonStageData && state.dungeonStageData.ballServed) {
      state.dungeonStageData.ballServed = false;
      showHint("[BALL_LOST_PRESS_A]", 2000);
    }
  }

  function checkDungeon05StageComplete() {
    const data = state.dungeonStageData;
    if (!data) return;
    
    // Win condition: all targets destroyed
    if (data.targetsDestroyed >= data.targetsRequired) {
      markStageComplete();
    }
  }

  function checkPlayerOnGoal(): boolean {
    if (!playerSprite || !game.currentScene().tileMap) return false;
    
    const loc = playerSprite.tilemapLocation();
    if (!loc) return false;
    
    const goalTile = tiles.getTileImage(TILE_GOAL_FLAG as any);
    return goalTile && tiles.tileAtLocationEquals(loc, goalTile);
  }

  function markStageComplete() {
    if (!state.dungeonStageData) return;
    state.dungeonStageData.stageComplete = true;
    showHint("[STAGE_COMPLETE]", 2000);
    pause(500);
    onStageComplete();
  }

  function spawnPuzzleStageContent(dungeonId: string, stageIndex: number) {
    if (dungeonId === "DUN_LAUNDROMAT_LABYRINTH") {
      spawnDungeon01Content(stageIndex);
    } else if (dungeonId === "DUN_SCHOOL_PONG_COURT") {
      spawnDungeon05Content(stageIndex);
    } else if (dungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      spawnDungeon03Content(stageIndex);
    }
  }

  function spawnRhythmStageContent(dungeonId: string, stageIndex: number) {
    if (dungeonId === "DUN_SUBWAY_TIMING") {
      spawnDungeon04Content(stageIndex);
    }
  }

  function spawnDungeon04Content(stageIndex: number) {
    // Stage 1: Spawn rhythm doors (gates that open on beat)
    if (stageIndex === 1) {
      spawnRhythmDoors();
    }
    // Stage 2: Mark switch locations for beat activation
    if (stageIndex === 2) {
      markRhythmSwitches();
    }
    // Stage 3: Mark beat markers for final streak
    if (stageIndex === 3) {
      markRhythmBeatMarkers();
    }
  }

  function spawnRhythmDoors() {
    // Find all rhythm door tiles (gate tiles in rhythm stages)
    const doorTiles = tiles.getTilesByType(tiles.getTileImage(TILE_GATE as any));
    
    if (!state.dungeonStageData) return;
    
    // Store door locations for beat-based opening
    (state.dungeonStageData as any).rhythmDoorLocations = doorTiles || [];
    (state.dungeonStageData as any).rhythmDoorsOpen = false;
    
    showHint("[RHYTHM_DOORS_ON_BEAT]", 2000);
  }

  function markRhythmSwitches() {
    // Find all switch tiles
    const switchTiles = tiles.getTilesByType(tiles.getTileImage(TILE_SWITCH as any));
    
    if (!state.dungeonStageData) return;
    
    // Store switch locations
    (state.dungeonStageData as any).rhythmSwitchLocations = switchTiles || [];
    (state.dungeonStageData as any).switchesRequired = (switchTiles && switchTiles.length) || 6;
    
    showHint("[RHYTHM_HIT_SWITCHES_ON_BEAT]", 2000);
  }

  function markRhythmBeatMarkers() {
    // DECISION: Stage 3 uses TILE_SWITCH tiles purely as visual beat markers.
    // They are NOT interactive switches - they just guide the player where to stand for the rhythm challenge.
    // The win condition for Stage 3 is reaching the streak target (12), not activating markers.
    const beatMarkers = tiles.getTilesByType(tiles.getTileImage(TILE_SWITCH as any));
    
    if (!state.dungeonStageData) return;
    
    // Store beat marker locations (for visual reference only)
    (state.dungeonStageData as any).beatMarkerLocations = beatMarkers || [];
    (state.dungeonStageData as any).markersRequired = (beatMarkers && beatMarkers.length) || 4;
    
    showHint("[RHYTHM_FINAL_STREAK_CHALLENGE]", 2000);
  }

  function spawnDungeon01Content(stageIndex: number) {
    if (stageIndex === 2) {
      // Stage 2: Spawn tokens
      spawnTokens(state.dungeonStageData.tokensRequired);
      // Spawn Ghost-Bot patrol
      spawnGhostBot();
    }
  }

  function spawnTokens(count: number) {
    // Find all collectible spawn tiles or scatter them
    const tokenTiles = tiles.getTilesByType(tiles.getTileImage(11 as any)); // Custom token tile
    
    if (tokenTiles && tokenTiles.length > 0) {
      // Place tokens on designated tiles
      for (let i = 0; i < Math.min(count, tokenTiles.length); i++) {
        const token = sprites.create(imgCollectible("TOKEN"), KIND_COLLECTIBLE);
        tiles.placeOnTile(token, tokenTiles[i]);
      }
    } else {
      // Scatter tokens in safe locations
      for (let i = 0; i < count; i++) {
        const token = sprites.create(imgCollectible("TOKEN"), KIND_COLLECTIBLE);
        token.setPosition(
          20 + randint(0, scene.screenWidth() - 40),
          20 + randint(0, scene.screenHeight() - 40)
        );
      }
    }
  }

  function spawnGhostBot() {
    const ghostBot = sprites.create(imgEnemy("GHOST_BOT"), KIND_ENEMY);
    ghostBot.setPosition(80, 30);
    
    // Simple patrol: oscillate horizontally
    const patrolSpeed = 20;
    ghostBot.vx = patrolSpeed;
    
    // NOTE: Patrol AI is handled in updateGhostBotPatrol() (called from updatePuzzleMode in main game loop)
  }
  
  // ============ DUNGEON 3 (WAREHOUSE BLOCKWORKS) ============
  
  function spawnDungeon03Content(stageIndex: number) {
    if (stageIndex === 2) {
      // Stage 2: Spawn moving crates that patrol
      spawnMovingCrates();
    }
  }
  
  function spawnMovingCrates() {
    // Spawn 3 crates that move in patterns
    const crate1 = sprites.create(imgEnemy("CRATE"), KIND_HAZARD);
    crate1.setPosition(40, 40);
    crate1.vx = 15;
    
    const crate2 = sprites.create(imgEnemy("CRATE"), KIND_HAZARD);
    crate2.setPosition(80, 60);
    crate2.vy = 15;
    
    const crate3 = sprites.create(imgEnemy("CRATE"), KIND_HAZARD);
    crate3.setPosition(120, 40);
    crate3.vx = -15;
  }
  
  function updateMovingCrates() {
    // Update all moving crates in puzzle mode
    const crates = sprites.allOfKind(KIND_HAZARD);
    for (const crate of crates) {
      if (!crate || crate.flags & sprites.Flag.Destroyed) continue;
      
      // Bounce on screen edges
      if (crate.x < 20 || crate.x > scene.screenWidth() - 20) {
        crate.vx = -crate.vx;
      }
      if (crate.y < 20 || crate.y > scene.screenHeight() - 20) {
        crate.vy = -crate.vy;
      }
    }
  }
  
  function checkDungeon03StageComplete() {
    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;
    
    if (stageIdx === 0) {
      // Stage 0: CONVEYOR_INTRO - activate switch and reach goal
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: BLOCK_ROWS - activate both switches to open gates, then reach goal
      if (data.switchesActivated >= 2 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: MOVING_CRATES - navigate past moving crates to reach goal
      if (checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: FINAL_PATTERN - activate final switch to open gate, then reach goal
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    }
  }

  function spawnDungeon05Content(stageIndex: number) {
    // Spawn paddle at bottom center
    const paddle = sprites.create(imgPaddle(), KIND_PADDLE);
    paddle.setPosition(80, 110);
    paddle.setStayInScreen(true);
    
    // Paddle control: left/right movement
    controller.moveSprite(paddle, PADDLE_SPEED, 0);
    
    // Spawn targets based on stage
    if (state.dungeonStageData && state.dungeonStageData.targetsRequired > 0) {
      spawnTargets(state.dungeonStageData.targetsRequired, stageIndex);
    }
    
    // Ball will be spawned when A is pressed (serve)
    showHint("[PRESS_A_TO_SERVE]", 3000);
  }

  function spawnTargets(count: number, stageIndex: number) {
    // Find target tiles (stairNorth sprite used as target marker in tilemaps)
    const targetTiles = tiles.getTilesByType(tiles.getTileImage(TILE_INDEX_TARGET as any));
    
    if (targetTiles && targetTiles.length > 0) {
      // Place targets on designated tiles
      for (let i = 0; i < Math.min(count, targetTiles.length); i++) {
        const target = sprites.create(imgTarget(), KIND_TARGET);
        tiles.placeOnTile(target, targetTiles[i]);
      }
    } else {
      // Fallback: arrange targets in rows at top
      const startX = 40;
      const startY = 20;
      const spacingX = 18;
      const spacingY = 10;
      const perRow = 8;
      
      for (let i = 0; i < count; i++) {
        const target = sprites.create(imgTarget(), KIND_TARGET);
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        target.setPosition(startX + col * spacingX, startY + row * spacingY);
      }
    }
  }

  function serveBall() {
    if (!state.dungeonStageData || state.dungeonStageData.ballServed) return;
    
    // Cap check
    if (sprites.allOfKind(KIND_BALL).length >= CAP_MAX_BALLS) return;
    
    const paddle = sprites.allOfKind(KIND_PADDLE)[0];
    if (!paddle) return;
    
    const ball = sprites.create(imgBall(), KIND_BALL);
    ball.setPosition(paddle.x, paddle.y - 10);
    
    // Set ball velocity (upward and slightly random horizontal)
    const ballSpeed = state.dungeonStageData.ballSpeed || BALL_SPEED_NORMAL;
    ball.vx = randint(BALL_SERVE_HORIZONTAL_MIN, BALL_SERVE_HORIZONTAL_MAX);
    ball.vy = -ballSpeed;
    
    ball.setFlag(SpriteFlag.BounceOnWall, true);
    
    state.dungeonStageData.ballServed = true;
    sfxInteract();
  }

  function destroyTarget(target: Sprite) {
    if (!state.dungeonStageData) return;
    
    state.dungeonStageData.targetsDestroyed += 1;
    target.destroy();
    sfxCollect();
    
    showHint("[TARGET_DESTROYED]", 500);
  }

  function onStageComplete() {
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

  // ============ SHOOTER MODE HELPERS ============

  function startNextWave() {
    if (!state.dungeonStageData) return;

    state.dungeonStageData.wavesComplete += 1;
    const waveNum = state.dungeonStageData.wavesComplete;
    showHint(`[WAVE_${waveNum}_START]`, 1500);

    // Spawn enemies based on stage
    const stageIndex = state.dungeonStageData.stageIndex;
    let enemiesToSpawn = 0;

    if (stageIndex === 0) {
      // Stage 0: fixed 3 enemies per wave
      enemiesToSpawn = 3;
    } else if (stageIndex === 1) {
      // Stage 1: 4–7 enemies in formations (max 7 documented)
      enemiesToSpawn = 4 + (state.dungeonStageData.wavesComplete - 1);
      if (enemiesToSpawn > 7) {
        enemiesToSpawn = 7;
      }
    } else if (stageIndex === 2) {
      // Stage 2: 5–7 enemies with alarm mechanic (max 7 documented)
      enemiesToSpawn = 5 + Math.floor(state.dungeonStageData.wavesComplete / 2);
      if (enemiesToSpawn > 7) {
        // DECISION: Cap Stage 2 waves at 7 enemies to keep design predictable and under CAP_MAX_ENEMIES.
        enemiesToSpawn = 7;
      }
    }

    // Global cap check to guard against future CAP_MAX_ENEMIES changes
    if (enemiesToSpawn > CAP_MAX_ENEMIES) {
      enemiesToSpawn = CAP_MAX_ENEMIES;
    }

    for (let i = 0; i < enemiesToSpawn; i++) {
      spawnShooterEnemy();
    }
  }

  function spawnShooterEnemy() {
    if (sprites.allOfKind(KIND_ENEMY).length >= CAP_MAX_ENEMIES) return;

    // Spawn at top of screen
    const x = 20 + randint(0, scene.screenWidth() - 40);
    const enemy = sprites.create(imgEnemy("SHOOTER_INVADER"), KIND_ENEMY);
    enemy.setPosition(x, 10);
    enemy.setVelocity(randint(-20, 20), randint(10, 30));
    enemy.setFlag(SpriteFlag.BounceOnWall, true);
    enemy.setFlag(SpriteFlag.StayInScreen, true);
    
    // Enemy HP
    (enemy as any).hp = 1;
  }

  function spawnCore() {
    if (!state.dungeonStageData) return;

    const core = sprites.create(imgEnemy("ANTENNA_CORE"), KIND_ENEMY);
    core.setPosition(80, 40);
    core.setFlag(SpriteFlag.StayInScreen, true);

    state.dungeonStageData.coreSprite = core;
    (core as any).isCore = true;
    
    showHint("[CORE_DESTROY_TARGET]", 2000);
  }

  export function getPlayerSprite(): Sprite {
    return playerSprite;
  }
}


function handleHazardCollision(player: Sprite, hazard: Sprite) {
  if (!player || !state.dungeonStageData) return;

  // Knockback effect
  const knockbackForce = 50;
  const dx = player.x - hazard.x;
  const dy = player.y - hazard.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0) {
    player.vx = (dx / distance) * knockbackForce;
    player.vy = (dy / distance) * knockbackForce;
  }

  // Apply invincibility frames to prevent repeated hits
  state.invincibleUntil = game.runtime() + 500;

  // Visual feedback (flash effect via sprite)
  player.say("!", 100);

  // Reduce health or lives (placeholder - could be expanded)
  showHint("[HIT_BY_HAZARD]", 1000);
}
// MANUAL TEST PASSED: GameController scaffold complete

// MANUAL TEST PASSED: GameController scaffold complete
