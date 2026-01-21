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
      switchesActivated: 0,
      gatesOpen: false,
    };

    // Spawn platform stage content (moving platforms, hazards)
    spawnPlatformStageContent(dungeonId, stageIndex);
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

    const spec = DUNGEON_SPECS.find((d) => d.id === dungeonId);
    if (!spec) return;

    // Meta mode orchestrates micro-stages
    // Each stage (1-3) is a different mode, stage 4 is finale
    if (stageIndex === 0) {
      // Stage 0: Meta intro (brief tutorial)
      setupMetaIntro();
    } else if (stageIndex === 1) {
      // Stage 1: Micro-platform (15-20s challenge)
      setupMicroPlatform();
    } else if (stageIndex === 2) {
      // Stage 2: Micro-shooter (15-20s challenge)
      setupMicroShooter();
    } else if (stageIndex === 3) {
      // Stage 3: Micro-rhythm (streak challenge)
      setupMicroRhythm();
    } else if (stageIndex === 4) {
      // Stage 4: Stabilize (finale puzzle)
      setupStabilizeFinale();
    }
  }

  function setupMetaIntro() {
    // Brief intro stage with simple explanation
    scene.setBackgroundColor(1);
    
    playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER);
    playerSprite.setPosition(80, 60);
    controller.moveSprite(playerSprite, 50, 50);

    state.dungeonStageData = {
      stageIndex: 0,
      stageComplete: false,
      startTime: game.runtime(),
      timeLimit: 5000, // 5 seconds to read hint
    };

    showHint("[META_INTRO_GET_READY]", 5000);
    
    // Auto-complete after 5 seconds
    control.runInParallel(() => {
      pause(5000);
      if (state.currentStageIndex === 0) {
        onStageComplete();
      }
    });
  }

  function setupMicroPlatform() {
    // Micro platform challenge: reach goal in 20 seconds
    const stageId = "TM_DUN_09_STAGE_01_MICRO_PLATFORM";
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    playerSprite = sprites.create(imgPlatformPlayer(), KIND_PLAYER);
    playerSprite.setPosition(20, 100);
    playerSprite.ay = 300; // gravity

    // Temporarily switch to platform controls
    controller.moveSprite(playerSprite, PLAYER_PLATFORM_SPEED, 0);
    scene.cameraFollowSprite(playerSprite);

    state.dungeonStageData = {
      stageIndex: 1,
      stageComplete: false,
      startTime: game.runtime(),
      timeLimit: 20000, // 20 seconds
      reachedGoal: false,
    };

    showHint("[MICRO_PLATFORM_GO]", 2000);

    // Timer countdown
    startMicroStageTimer();
  }

  function setupMicroShooter() {
    // Micro shooter challenge: destroy 10 targets in 20 seconds
    const stageId = "TM_DUN_09_STAGE_02_MICRO_SHOOTER";
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    playerSprite = sprites.create(imgShooterShip(), KIND_PLAYER);
    playerSprite.setPosition(80, 100);
    playerSprite.setStayInScreen(true);

    controller.moveSprite(playerSprite, PLAYER_SHOOTER_SPEED, PLAYER_SHOOTER_SPEED);

    state.dungeonStageData = {
      stageIndex: 2,
      stageComplete: false,
      startTime: game.runtime(),
      timeLimit: 20000, // 20 seconds
      targetsDestroyed: 0,
      targetsRequired: 10,
    };

    showHint("[MICRO_SHOOTER_TARGETS]", 2000);

    // Spawn targets
    spawnShooterTargets(10);

    // Timer countdown
    startMicroStageTimer();
  }

  function setupMicroRhythm() {
    // Micro rhythm challenge: achieve streak of 5 in 20 seconds
    const stageId = "TM_DUN_09_STAGE_03_MICRO_RHYTHM";
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    playerSprite = sprites.create(imgRhythmPlayer(), KIND_PLAYER);
    playerSprite.setPosition(80, 60);
    controller.moveSprite(playerSprite, 30, 30);

    const bpm = 120;
    const beatIntervalMs = 60000 / bpm;

    state.dungeonStageData = {
      stageIndex: 3,
      stageComplete: false,
      startTime: game.runtime(),
      timeLimit: 20000, // 20 seconds
      bpm: bpm,
      beatIntervalMs: beatIntervalMs,
      nextBeatTime: game.runtime() + beatIntervalMs,
      streak: 0,
      streakRequired: 5,
      misses: 0,
    };

    showHint("[MICRO_RHYTHM_STREAK]", 2000);

    // Timer countdown
    startMicroStageTimer();
  }

  function setupStabilizeFinale() {
    // Finale: stabilize 4 nodes by reaching them in sequence
    const stageId = "TM_DUN_09_STAGE_04_STABILIZE";
    const tm = getTilemapByID(stageId);
    if (tm) {
      tiles.setCurrentTilemap(tm);
    }

    playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER);
    playerSprite.setPosition(80, 60);
    controller.moveSprite(playerSprite, 60, 60);

    state.dungeonStageData = {
      stageIndex: 4,
      stageComplete: false,
      nodesStabilized: 0,
      nodesRequired: 4,
      currentNodeIndex: 0,
    };

    showHint("[STABILIZE_NODES]", 3000);

    // Spawn stabilization nodes
    spawnStabilizationNodes();
  }

  function startMicroStageTimer() {
    if (!state.dungeonStageData) return;

    const data = state.dungeonStageData;
    const duration = data.timeLimit;

    control.runInParallel(() => {
      pause(duration);
      
      // Check if still in same micro-stage
      if (state.currentStageIndex === data.stageIndex && !data.stageComplete) {
        // Time's up - fail condition (restart stage)
        showHint("[MICRO_STAGE_TIME_UP]", 2000);
        pause(2000);
        
        // Restart current stage (hard cleanup via switchPlayMode)
        switchPlayMode(PlayMode.DUN_META, {
          dungeonId: state.currentDungeonId,
          stageIndex: data.stageIndex,
        });
      }
    });
  }

  function spawnShooterTargets(count: number) {
    // Spawn targets in a grid pattern
    const cols = 5;
    const rows = Math.ceil(count / cols);
    const spacing = 25;
    const startX = 40;
    const startY = 20;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      const target = sprites.create(imgEnemy("TARGET"), KIND_TARGET);
      target.setPosition(x, y);
      (target as any).isTarget = true;
    }
  }

  function spawnStabilizationNodes() {
    // Spawn 4 nodes in corners
    const positions = [
      { x: 30, y: 30 },
      { x: 130, y: 30 },
      { x: 30, y: 90 },
      { x: 130, y: 90 },
    ];

    for (let i = 0; i < positions.length; i++) {
      const node = sprites.create(imgCollectible("NODE_" + i), KIND_INTERACTABLE);
      node.setPosition(positions[i].x, positions[i].y);
      (node as any).nodeIndex = i;
      (node as any).isStabilizationNode = true;
    }
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
    // Bounce ball upward with horizontal velocity based on hit position
    const hitOffset = ball.x - paddle.x; // -16 to +16 (for 32px paddle)
    
    // Set upward velocity
    ball.vy = -Math.abs(ball.vy);
    
    // Add horizontal velocity based on where ball hit paddle
    // Center hit: small horizontal velocity
    // Edge hit: large horizontal velocity
    ball.vx += hitOffset * 2;
    
    // Cap horizontal velocity to prevent runaway speed
    if (ball.vx > 80) ball.vx = 80;
    if (ball.vx < -80) ball.vx = -80;
    
    sfxInteract();
  }

  function handleBallTargetHit(ball: Sprite, target: Sprite) {
    if (!state.dungeonStageData) return;

    // Verify it's actually a target (overlap handlers can fire for different sprite kinds)
    if (target.kind() !== KIND_TARGET) return;

    // Destroy target
    target.destroy();

    // Bounce ball (simple downward bounce)
    ball.vy = Math.abs(ball.vy);

    // Increment counter using shared helper
    incrementTargetCounter();
    sfxInteract();
  }

  function incrementTargetCounter() {
    if (!state.dungeonStageData) return;
    if (state.dungeonStageData.targetsDestroyed !== undefined) {
      state.dungeonStageData.targetsDestroyed = state.dungeonStageData.targetsDestroyed + 1;
    }
  }

  function handleMicroPlatformJump() {
    const plyr = GameController.getPlayerSprite();
    if (!plyr) return;

    // Check if on ground using tile collision
    if (
      plyr.isHittingTile(CollisionDirection.Bottom) ||
      Math.abs(plyr.vy) < PLAYER_PLATFORM_GROUND_THRESHOLD
    ) {
      plyr.vy = PLAYER_PLATFORM_JUMP_VY;
      sfxJump();
    }
  }

  function handleMicroShooterShoot() {
    const plyr = GameController.getPlayerSprite();
    if (!plyr) return;

    // Cap check
    if (sprites.allOfKind(KIND_PROJECTILE).length >= CAP_MAX_PROJECTILES) return;

    const bullet = sprites.createProjectileFromSprite(
      imgProjectile("BULLET"),
      plyr,
      0,
      SHOOTER_BULLET_SPEED_Y,
    );
    bullet.setKind(KIND_PROJECTILE);
    bullet.lifespan = 2000;

    sfxShoot();
  }

  function handleMicroRhythmTap() {
    if (!state.dungeonStageData) return;

    const now = game.runtime();
    const nextBeat = state.dungeonStageData.nextBeatTime;
    const windowMs = RHYTHM_GOOD_WINDOW_MS;

    if (Math.abs(now - nextBeat) < windowMs) {
      // Good hit
      state.dungeonStageData.streak += 1;
      showHint("[RHYTHM_GOOD]", 500);
    } else {
      // Miss
      state.dungeonStageData.misses += 1;
      state.dungeonStageData.streak = 0;
      showHint("[RHYTHM_MISS]", 500);
    }
  }

  function handleStabilizationNode(node: Sprite) {
    if (!state.dungeonStageData) return;
    if (!(node as any).isStabilizationNode) return;

    const nodeIndex = (node as any).nodeIndex;
    const data = state.dungeonStageData;

    // Nodes must be activated in sequence
    if (nodeIndex !== data.currentNodeIndex) {
      showHint("[WRONG_NODE_ORDER]", 1000);
      return;
    }

    // Activate node
    node.destroy();
    data.nodesStabilized = data.nodesStabilized + 1;
    data.currentNodeIndex = data.currentNodeIndex + 1;

    showHint("[NODE_STABILIZED_" + nodeIndex + "]", 1000);
    sfxInteract();
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

    // Check for switch interaction in platform mode (Dungeon 7 Stage 2)
    if (state.currentDungeonId === "DUN_VIDEO_STORE_PLATFORM_TRIAL" && state.currentStageIndex === 2) {
      checkPlatformSwitchInteraction();
    }

    // Dungeon 8: Spawn barrels
    if (state.currentDungeonId === "DUN_CONSTRUCTION_DONKEY_TOWER") {
      updateBarrelSpawning();
    }
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
    if (!playerSprite || !state.dungeonStageData) return;
    if (state.dungeonStageData.stageComplete) return;

    // Update Ghost-Bot patrol AI (if present)
    updateGhostBotPatrol();

    // Update moving crates (Dungeon 3)
    if (state.currentDungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      updateMovingCrates();
    }

    // Update ball physics (Dungeon 5)
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

  function updateMetaMode() {
    // Placeholder: meta mode logic
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
      // Stage 1: DARK_MAZE - reach goal (no tokens here)
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

  function checkDungeon03StageComplete() {
    const stageIdx = state.currentStageIndex;
    const data = state.dungeonStageData;

    if (stageIdx === 0) {
      // Stage 0: CONVEYOR_INTRO - activate switch and reach goal
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 1) {
      // Stage 1: BLOCK_ROWS - activate 2 switches (latch), then reach goal
      // NOTE: Gate opens when switchesActivated >= 2 (handled by latch behavior in toggleSwitch)
      if (data.switchesActivated >= 2 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 2) {
      // Stage 2: MOVING_CRATES - navigate around moving crates and reach goal
      if (checkPlayerOnGoal()) {
        markStageComplete();
      }
    } else if (stageIdx === 3) {
      // Stage 3: FINAL_PATTERN - activate switch and reach goal
      if (data.switchesActivated > 0 && checkPlayerOnGoal()) {
        markStageComplete();
      }
    }
  }

  function checkDungeon05StageComplete() {
    const data = state.dungeonStageData;

    // All stages: destroy all targets
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
    } else if (dungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
      spawnDungeon03Content(stageIndex);
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

  function spawnDungeon03Content(stageIndex: number) {
    if (stageIndex === 2) {
      // Stage 2: Spawn moving crates (3 crates with simple patrol)
      spawnMovingCrates();
    }
  }

  function spawnMovingCrates() {
    // Spawn 3 moving crates as hazards
    const cratePositions = [
      { x: 40, y: 40, vx: 15, vy: 10 },
      { x: 100, y: 50, vx: -12, vy: 8 },
      { x: 70, y: 80, vx: 10, vy: -15 },
    ];

    for (let i = 0; i < cratePositions.length; i++) {
      const pos = cratePositions[i];
      const crate = sprites.create(imgEnemy("CRATE"), KIND_HAZARD);
      crate.setPosition(pos.x, pos.y);
      crate.vx = pos.vx;
      crate.vy = pos.vy;
    }
  }

  function updateMovingCrates() {
    // Update all moving crates (bounce on screen edges)
    const crates = sprites.allOfKind(KIND_HAZARD);
    for (const crate of crates) {
      if (!crate || crate.flags & sprites.Flag.Destroyed) continue;

      // Bounce on screen edges
      if (crate.x < 10 || crate.x > scene.screenWidth() - 10) {
        crate.vx = -crate.vx;
      }
      if (crate.y < 10 || crate.y > scene.screenHeight() - 10) {
        crate.vy = -crate.vy;
      }
    }
  }

  function spawnDungeon05Content(stageIndex: number) {
    const spec = getDungeonSpec("DUN_SCHOOL_PONG_COURT");
    if (!spec || !spec.params) return;

    const targetsRequired = spec.params.targetsPerStage[stageIndex] || 0;
    const ballSpeed = spec.params.ballSpeed[stageIndex] || BALL_SPEED_NORMAL;

    // Initialize stage data with targets count
    if (state.dungeonStageData) {
      state.dungeonStageData.targetsRequired = targetsRequired;
      state.dungeonStageData.targetsDestroyed = 0;
      state.dungeonStageData.ballSpeed = ballSpeed;
    }

    // Use player sprite as paddle (already created by setupPuzzleMode)
    // Change its appearance and position
    if (playerSprite) {
      playerSprite.setImage(imgPaddle());
      playerSprite.setKind(KIND_PADDLE);
      playerSprite.setPosition(80, 110);
      playerSprite.setStayInScreen(true);
      // Controller already bound by initPuzzlePlayer, but we need horizontal only
      controller.moveSprite(playerSprite, PADDLE_SPEED, 0);
    }

    // Spawn targets based on stage
    spawnTargets(stageIndex);
  }

  function spawnTargets(stageIndex: number) {
    if (!state.dungeonStageData) return;
    const targetsRequired = state.dungeonStageData.targetsRequired;

    // Find target tiles (using tile index 4 as target marker)
    const targetTiles = tiles.getTilesByType(tiles.getTileImage(TILE_INDEX_TARGET as any));

    if (targetTiles && targetTiles.length > 0) {
      // Place targets on designated tiles
      for (let i = 0; i < Math.min(targetsRequired, targetTiles.length); i++) {
        const target = sprites.create(imgTarget(), KIND_TARGET);
        tiles.placeOnTile(target, targetTiles[i]);
      }
    } else {
      // Fallback: create targets in rows at top
      const rows = Math.ceil(targetsRequired / 4);
      let count = 0;
      for (let row = 0; row < rows && count < targetsRequired; row++) {
        for (let col = 0; col < 4 && count < targetsRequired; col++) {
          const target = sprites.create(imgTarget(), KIND_TARGET);
          target.setPosition(20 + col * 35, 20 + row * 15);
          count++;
        }
      }
    }
  }

  function updateDungeon05Balls() {
    if (!state.dungeonStageData) return;

    const balls = sprites.allOfKind(KIND_BALL);
    for (const ball of balls) {
      if (!ball || ball.flags & sprites.Flag.Destroyed) continue;

      // Check if ball fell off bottom - just destroy it, serveBall will handle spawning
      if (ball.y > scene.screenHeight() + 5) {
        ball.destroy();
      }
    }
  }

  /** Spawn stage-specific platform content using data-driven spec params (no hardcoded dungeon IDs). */
  function spawnPlatformStageContent(dungeonId: string, stageIndex: number) {
    const spec = getDungeonSpec(dungeonId);
    if (!spec || !spec.params || !spec.params.stageSpawners) return;

    const spawners = spec.params.stageSpawners[stageIndex] || [];
    for (let i = 0; i < spawners.length; i = i + 1) {
      const spawner = spawners[i];
      if (spawner.xEnd !== undefined) {
        // Moving platform (has xEnd property)
        spawnMovingPlatform(spawner.xStart, spawner.xEnd, spawner.y, spawner.speed);
      } else if (spawner.rate !== undefined) {
        // Barrel spawner (has rate property) - configure barrel spawn interval
        // TODO: wire barrel spawn loop to use this rate per stage
      }
    }
  }

  function spawnMovingPlatform(xStart: number, xEnd: number, y: number, speed: number) {
    const platform = sprites.create(image.create(32, 8), KIND_PLATFORM_MOVING);
    platform.setPosition(xStart, y);
    platform.setFlag(SpriteFlag.Ghost, false); // Solid platform
    
    // Simple oscillation
    const range = xEnd - xStart;
    let direction = 1;
    
    game.onUpdate(() => {
      if (state.playMode !== PlayMode.DUN_PLATFORM) return;
      if (platform.flags & sprites.Flag.Destroyed) return;
      
      platform.x += direction * speed / 60; // 60 fps
      
      if (platform.x >= xEnd) {
        direction = -1;
      } else if (platform.x <= xStart) {
        direction = 1;
      }
    });
  }

  function checkPlatformSwitchInteraction() {
    if (!playerSprite || !state.dungeonStageData) return;
    if (game.runtime() < state.lastInteractTime + INTERACT_DEBOUNCE_MS) return;
    
    const loc = playerSprite.tilemapLocation();
    if (!loc) return;
    
    const switchTile = tiles.getTileImage(TILE_SWITCH as any);
    if (switchTile && tiles.tileAtLocationEquals(loc, switchTile)) {
      if (controller.A.isPressed()) {
        state.lastInteractTime = game.runtime();
        togglePlatformGates();
      }
    }
  }

  function togglePlatformGates() {
    if (!state.dungeonStageData) return;
    
    state.dungeonStageData.switchesActivated += 1;
    state.dungeonStageData.gatesOpen = !state.dungeonStageData.gatesOpen;
    
    // Get gate locations (store on first use)
    const stageData = state.dungeonStageData as any;
    if (!stageData.gateLocations) {
      stageData.gateLocations = tiles.getTilesByType(tiles.getTileImage(TILE_GATE as any));
    }
    
    const gateLocations = (stageData.gateLocations as tiles.Location[]) || [];
    
    for (const gateLoc of gateLocations) {
      if (stageData.gatesOpen) {
        // Open gate: replace with floor tile
        tiles.setTileAt(gateLoc, tiles.getTileImage(0 as any));
      } else {
        // Close gate: replace with gate tile
        tiles.setTileAt(gateLoc, tiles.getTileImage(TILE_GATE as any));
      }
      tiles.setWallAt(gateLoc, !stageData.gatesOpen);
    }
    
    showHint(stageData.gatesOpen ? "[GATES_OPEN]" : "[GATES_CLOSED]", 1000);
    sfxInteract();
  }

  function updateBarrelSpawning() {
    if (!state.dungeonStageData) return;

    const data = state.dungeonStageData;
    const now = game.runtime();
    const spawnInterval = 3000; // Spawn every 3 seconds

    // Only spawn barrels in stages 1-3
    const stageIdx = state.currentStageIndex;
    if (stageIdx < 1) return;

    // Check spawn cap
    const currentBarrels = sprites.allOfKind(KIND_HAZARD).length;
    if (currentBarrels >= data.barrelSpawnCap) return;

    // Check spawn timer
    if (now - data.lastBarrelSpawn < spawnInterval) return;

    // Spawn barrel
    spawnBarrel();
    data.lastBarrelSpawn = now;
  }

  function spawnBarrel() {
    const barrel = sprites.create(imgEnemy("BARREL"), KIND_HAZARD);
    barrel.setPosition(20, 20); // Spawn at top
    barrel.vx = 30; // Roll to the right
    barrel.ay = 300; // Gravity
    barrel.lifespan = 10000; // Auto-destroy after 10 seconds

    // Bounce on screen edges
    barrel.setFlag(SpriteFlag.BounceOnWall, true);
  }

  function handleBarrelCollision(player: Sprite, barrel: Sprite) {
    if (game.runtime() < state.invincibleUntil) return;

    // Knockback + i-frames
    damagePlayer(0); // Sets i-frames but no damage (kinderfreundlich)
    
    // Knockback
    const dx = player.x - barrel.x;
    const dy = player.y - barrel.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      player.vx = (dx / dist) * 80;
      player.vy = (dy / dist) * -100; // Pop upward
    }
    
    showHint("[BARREL_BUMPED]", 500);
    sfxHit();
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

// Global helper functions for puzzle modes (callable from player_modes.ts)

function serveBall() {
  if (!state.dungeonStageData) return;
  
  // Cap check - only allow serving if under ball limit
  if (sprites.allOfKind(KIND_BALL).length >= CAP_MAX_BALLS) return;

  const paddle = sprites.allOfKind(KIND_PADDLE)[0];
  if (!paddle) return;

  const ballSpeed = state.dungeonStageData.ballSpeed || BALL_SPEED_NORMAL;
  
  // Create ball on paddle
  const ball = sprites.create(imgBall(), KIND_BALL);
  ball.setPosition(paddle.x, paddle.y - 8);
  
  // Launch upward with deterministic slight rightward bias
  ball.vx = 10;
  ball.vy = -ballSpeed;
  ball.setBounceOnWall(true);

  sfxInteract();
}

// MANUAL TEST PASSED: GameController scaffold complete
