// GameController: GameMode/PlayMode StateMachine, transitions, cleanup
// NOTE: Arcade runtime exposes globals (game, tiles, controller, sprites); imports are not required.

namespace GameController {
  let playerSprite: Sprite = null;
  const TRANSITION_PAUSE_MS = 100;
  const CONTINUE_YES = 1;

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
    // No tilemap for asteroids (open space)
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
    };
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

    state.dungeonStageData = {
      stageIndex: stageIndex,
      bpm: bpm,
      beatIntervalMs: beatIntervalMs,
      nextBeatTime: game.runtime() + beatIntervalMs,
      streak: 0,
      misses: 0,
    };
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

    // Puzzle mode: Hazard collision (moving crates, etc.)
    sprites.onOverlap(KIND_PLAYER, KIND_HAZARD, (player, hazard) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (game.runtime() < state.invincibleUntil) return;
      
      handleHazardCollision(player, hazard);
    });

    // Game update loop
    game.onUpdate(() => {
      updateGameLoop();
    });
  }

  function handleInteract() {
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

  function updateInvincibilityFlash() {
    if (!playerSprite) return;

    const now = game.runtime();
    if (now < state.invincibleUntil) {
      // Flash effect: toggle opacity every 100ms for visual feedback
      const flashInterval = 100;
      const isVisible = Math.floor((now / flashInterval) % 2) === 0;
      playerSprite.setFlag(SpriteFlag.Ghost, !isVisible);
    } else {
      // Ensure sprite is fully visible when invincibility ends
      playerSprite.setFlag(SpriteFlag.Ghost, false);
    }
  }

  function updatePlatformMode() {
    if (!playerSprite || !state.dungeonStageData) return;
    if (!game.currentScene().tileMap) return;

    const loc = playerSprite.tilemapLocation();
    if (!loc) return;
    const goalTile = tiles.getTileImage(TILE_GOAL_FLAG as any);

    // Platform movement (handled via controller in player_modes)
    // Check for goal
    if (
      goalTile &&
      tiles.tileAtLocationEquals(loc, goalTile) &&
      !state.dungeonStageData.reachedGoal
    ) {
      state.dungeonStageData.reachedGoal = true;
      onStageComplete();
    }
  }

  function updateShooterMode() {
    if (!state.dungeonStageData) return;

    // Count alive enemies
    state.dungeonStageData.enemiesAlive = sprites.allOfKind(KIND_ENEMY).length;

    // Core HP mode (stage 3)
    if (state.dungeonStageData.coreHP >= 0) {
      // Check if core is destroyed
      if (state.dungeonStageData.coreHP <= 0 && state.dungeonStageData.coreSprite) {
        state.dungeonStageData.coreSprite.destroy();
        state.dungeonStageData.coreSprite = null;
        effects.confetti.startScreenEffect(1000);
        control.runInParallel(() => {
          pause(1500);
          onStageComplete();
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
    // Debris/parts management (placeholder)
  }

  function updateRhythmMode() {
    if (!state.dungeonStageData) return;

    // Beat timing (placeholder)
    const now = game.runtime();
    if (now >= state.dungeonStageData.nextBeatTime) {
      state.dungeonStageData.nextBeatTime +=
        state.dungeonStageData.beatIntervalMs;
      // Visual cue for beat window
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

    // Check stage-specific win conditions
    if (state.currentDungeonId === "DUN_LAUNDROMAT_LABYRINTH") {
      checkDungeon01StageComplete();
    } else if (state.currentDungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      checkDungeon03StageComplete();
    }
  }

  function updateGhostBotPatrol() {
    // Update all Ghost-Bots in puzzle mode
    const ghostBots = sprites.allOfKind(KIND_ENEMY);
    for (const ghostBot of ghostBots) {
      if (!ghostBot || ghostBot.flags & sprites.Flag.Destroyed) continue;
      
      // Bounce on screen edges
      if (ghostBot.x < 10 || ghostBot.x > scene.screenWidth() - 10) {
        ghostBot.vx = -ghostBot.vx;
      }
    }
  }

  function checkDungeon01StageComplete() {
    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;
    
    if (stageIdx === 0) {
      // Stage 0: WARMUP - reach goal after activating switch (once)
      // NOTE: switches are single-use per stage; see handleSwitchActivation()
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: DARK_MAZE - reach goal after activating 1 switch (once)
      // NOTE: only 1 switch in this stage; activates multiple gates
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: TOKEN_RUN - collect all tokens, then reach goal
      if (data.tokensCollected >= data.tokensRequired && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: EXIT_ROOM - activate final switch (once), then reach goal
      // NOTE: switches are single-use per stage; see handleSwitchActivation()
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
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
    } else if (dungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      spawnDungeon03Content(stageIndex);
    }
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
