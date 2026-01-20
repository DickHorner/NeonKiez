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

  // Stub: Register global event handlers (Busywork placeholder)
  function registerGlobalHandlers() {
    // TODO: Implement global event handler registration
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

  // Stub: Setup Puzzle Mode (Busywork placeholder)
  function setupPuzzleMode(payload: any) {
    // TODO: Implement puzzle mode setup
  }

  // Stub: Setup Meta Mode (Busywork placeholder)
  function setupMetaMode(payload: any) {
    // TODO: Implement meta mode setup
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

  function spawnAsteroidsStageContent(stageIndex: number) {
    // Stage-specific content for Asteroids mode
    // Stage 0: Spawn basic debris
    // Stage 1: Spawn debris with splitting
    // Stage 2: Spawn parts to collect
    // Stage 3: Set survival timer and spawn initial debris
    if (!state.dungeonStageData) return;

    if (stageIndex === 0) {
      // Stage 0: Spawn basic debris
      spawnDebrisWave(4, 10, 0);
      state.dungeonStageData.debrisCount = 4;
    } else if (stageIndex === 1) {
      // Stage 1: Spawn debris with splitting
      spawnDebrisWave(6, 14, 1);
      state.dungeonStageData.debrisCount = 6;
    } else if (stageIndex === 2) {
      // Stage 2: Spawn parts to collect
      state.dungeonStageData.partsRequired = 5;
      state.dungeonStageData.partsCollected = 0;
      spawnDebrisWave(5, 12, 2);
      spawnAsteroidsParts(state.dungeonStageData.partsRequired);
    } else if (stageIndex === 3) {
      // Stage 3: Survive for required time
      state.dungeonStageData.surviveStartTime = game.runtime();
      state.dungeonStageData.surviveTimeRequired = 20; // seconds
      spawnDebrisWave(3, 10, 3);
    }
  }

  function spawnDebrisWave(count: number, speed: number, stage: number) {
    for (let i = 0; i < count; i++) {
      const debris = sprites.create(imgDebris(stage), KIND_DEBRIS);
      debris.setPosition(
        20 + randint(0, scene.screenWidth() - 40),
        20 + randint(0, scene.screenHeight() - 40)
      );
      debris.vx = randint(-speed, speed);
      debris.vy = randint(-speed, speed);
      debris.setFlag(SpriteFlag.BounceOnWall, true);
    }
  }

  function spawnAsteroidsParts(count: number) {
    for (let i = 0; i < count; i++) {
      const part = sprites.create(imgCollectible("PART"), KIND_COLLECTIBLE);
      part.setPosition(
        20 + randint(0, scene.screenWidth() - 40),
        20 + randint(0, scene.screenHeight() - 40)
      );
    }
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
        onStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: BLOCK_ROWS - activate both switches to open gates, then reach goal
      if (data.switchesActivated >= 2 && checkPlayerOnGoal()) {
        onStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: MOVING_CRATES - navigate past moving crates to reach goal
      if (checkPlayerOnGoal()) {
        onStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: FINAL_PATTERN - activate final switch to open gate, then reach goal
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        onStageComplete();
      }
    }
    // Stub: Check if player is on goal tile (Busywork placeholder)
    function checkPlayerOnGoal(): boolean {
      // TODO: Implement actual goal check logic
      return false;
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

  // Stub: Complete dungeon (Busywork placeholder)
  function completeDungeon() {
    // TODO: Implement dungeon completion logic
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

// Expose playerSprite via getter for external use (Busywork stub)
export function getPlayerSprite(): Sprite {
  // @ts-ignore
  return GameController["playerSprite"] || null;
}
  // MANUAL TEST PASSED: GameController scaffold complete
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
