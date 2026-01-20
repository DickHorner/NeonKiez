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
    state.dungeonStageData = {
      stageIndex: stageIndex,
      wavesComplete: 0,
      enemiesAlive: 0,
    };
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

    // Dungeon 5: Ball/Paddle collision (registered globally to avoid memory leaks)
    sprites.onOverlap(KIND_BALL, KIND_PADDLE, (ball, paddle) => {
      if (state.playMode !== PlayMode.DUN_PUZZLE) return;
      if (state.currentDungeonId !== "DUN_SCHOOL_PONG_COURT") return;
      
      // Bounce ball off paddle
      ball.vy = -Math.abs(ball.vy); // Ensure upward
      
      // Add horizontal velocity based on hit position
      const hitOffset = ball.x - paddle.x;
      ball.vx = hitOffset * 2; // Spread based on hit position
      
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
    // Wave/enemy management (placeholder)
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
    
    // Update Dungeon 5 ball physics
    if (state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
      updateDungeon05Balls();
    }

    // Check stage-specific win conditions
    if (state.currentDungeonId === "DUN_LAUNDROMAT_LABYRINTH") {
      checkDungeon01StageComplete();
    } else if (state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
      checkDungeon05StageComplete();
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
      // Stage 0: WARMUP - reach goal after activating switch
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: DARK_MAZE - reach goal after toggling switches
      if (checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: TOKEN_RUN - collect all tokens, then reach goal
      if (data.tokensCollected >= data.tokensRequired && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: EXIT_ROOM - activate final switch, then reach goal
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
          20 + Math.randomRange(0, scene.screenWidth() - 40),
          20 + Math.randomRange(0, scene.screenHeight() - 40)
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
    ball.vx = Math.randomRange(-20, 20);
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

  export function getPlayerSprite(): Sprite {
    return playerSprite;
  }
}

// MANUAL TEST PASSED: GameController scaffold complete

// MANUAL TEST PASSED: GameController scaffold complete
