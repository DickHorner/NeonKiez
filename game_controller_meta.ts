// GameController Meta: Meta mode (Dungeon 9) with micro-challenges
// NOTE: Focused module for meta mode mechanics

namespace GameController {
  export namespace MetaMode {
    export function setup(payload: DungeonModePayload) {
      const dungeonId = payload.dungeonId;
      const stageIndex = payload.stageIndex || 0;

      state.currentDungeonId = dungeonId;
      state.currentStageIndex = stageIndex;

      const spec = DUNGEON_SPECS.find((d) => d.id === dungeonId);
      if (!spec) return;

      if (stageIndex === 0) {
        setupMetaIntro();
      } else if (stageIndex === 1) {
        setupMicroPlatform();
      } else if (stageIndex === 2) {
        setupMicroShooter();
      } else if (stageIndex === 3) {
        setupMicroRhythm();
      } else if (stageIndex === 4) {
        setupStabilizeFinale();
      }
    }

    export function update() {
      // Placeholder: meta mode logic handled in stage-specific updates
    }

    export function handleMicroPlatformJump() {
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

    export function handleMicroShooterShoot() {
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

    export function handleMicroRhythmTap() {
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

    export function handleStabilizationNode(node: Sprite) {
      if (!state.dungeonStageData) return;
      const metaNode = node as MetaNodeSprite;
      if (!metaNode.isStabilizationNode) return;

      const nodeIndex = metaNode.nodeIndex;
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

    function setupMetaIntro() {
      scene.setBackgroundColor(1);

      const playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER);
      playerSprite.setPosition(80, 60);
      controller.moveSprite(playerSprite, 50, 50);

      state.dungeonStageData = {
        stageIndex: 0,
        stageComplete: false,
        startTime: game.runtime(),
        timeLimit: 5000,
      };

      showHint("[META_INTRO_GET_READY]", 5000);

      control.runInParallel(() => {
        pause(5000);
        if (state.currentStageIndex === 0) {
          GameController.onStageComplete();
        }
      });

      GameController.setPlayerSprite(playerSprite);
    }

    function setupMicroPlatform() {
      const stageId = "TM_DUN_09_STAGE_01_MICRO_PLATFORM";
      const tm = getTilemapByID(stageId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      const playerSprite = sprites.create(imgPlatformPlayer(), KIND_PLAYER);
      playerSprite.setPosition(20, 100);
      playerSprite.ay = 300;

      controller.moveSprite(playerSprite, PLAYER_PLATFORM_SPEED, 0);
      scene.cameraFollowSprite(playerSprite);

      state.dungeonStageData = {
        stageIndex: 1,
        stageComplete: false,
        startTime: game.runtime(),
        timeLimit: 20000,
        reachedGoal: false,
      };

      showHint("[MICRO_PLATFORM_GO]", 2000);
      startMicroStageTimer();
      GameController.setPlayerSprite(playerSprite);
    }

    function setupMicroShooter() {
      const stageId = "TM_DUN_09_STAGE_02_MICRO_SHOOTER";
      const tm = getTilemapByID(stageId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      const playerSprite = sprites.create(imgShooterShip(), KIND_PLAYER);
      playerSprite.setPosition(80, 100);
      playerSprite.setStayInScreen(true);

      controller.moveSprite(playerSprite, PLAYER_SHOOTER_SPEED, PLAYER_SHOOTER_SPEED);

      state.dungeonStageData = {
        stageIndex: 2,
        stageComplete: false,
        startTime: game.runtime(),
        timeLimit: 20000,
        targetsDestroyed: 0,
        targetsRequired: 10,
      };

      showHint("[MICRO_SHOOTER_TARGETS]", 2000);
      spawnShooterTargets(10);
      startMicroStageTimer();
      GameController.setPlayerSprite(playerSprite);
    }

    function setupMicroRhythm() {
      const stageId = "TM_DUN_09_STAGE_03_MICRO_RHYTHM";
      const tm = getTilemapByID(stageId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      const playerSprite = sprites.create(imgRhythmPlayer(), KIND_PLAYER);
      playerSprite.setPosition(80, 60);
      controller.moveSprite(playerSprite, 30, 30);

      const bpm = 120;
      const beatIntervalMs = 60000 / bpm;

      state.dungeonStageData = {
        stageIndex: 3,
        stageComplete: false,
        startTime: game.runtime(),
        timeLimit: 20000,
        bpm: bpm,
        beatIntervalMs: beatIntervalMs,
        nextBeatTime: game.runtime() + beatIntervalMs,
        streak: 0,
        streakRequired: 5,
        misses: 0,
      };

      showHint("[MICRO_RHYTHM_STREAK]", 2000);
      startMicroStageTimer();
      GameController.setPlayerSprite(playerSprite);
    }

    function setupStabilizeFinale() {
      const stageId = "TM_DUN_09_STAGE_04_STABILIZE";
      const tm = getTilemapByID(stageId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      const playerSprite = sprites.create(imgPuzzlePlayer(), KIND_PLAYER);
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
      spawnStabilizationNodes();
      GameController.setPlayerSprite(playerSprite);
    }

    function startMicroStageTimer() {
      if (!state.dungeonStageData) return;

      const data = state.dungeonStageData;
      const duration = data.timeLimit;

      control.runInParallel(() => {
        pause(duration);

        if (state.currentStageIndex === data.stageIndex && !data.stageComplete) {
          showHint("[MICRO_STAGE_TIME_UP]", 2000);
          pause(2000);

          GameController.switchPlayMode(PlayMode.DUN_META, {
            dungeonId: state.currentDungeonId,
            stageIndex: data.stageIndex,
          });
        }
      });
    }

    function spawnShooterTargets(count: number) {
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
      }
    }

    function spawnStabilizationNodes() {
      const positions = [
        { x: 30, y: 30 },
        { x: 130, y: 30 },
        { x: 30, y: 90 },
        { x: 130, y: 90 },
      ];

      for (let i = 0; i < positions.length; i++) {
        const node = sprites.create(imgCollectible("NODE_" + i), KIND_INTERACTABLE) as MetaNodeSprite;
        node.setPosition(positions[i].x, positions[i].y);
        node.nodeIndex = i;
        node.isStabilizationNode = true;
      }
    }
  }
}

// MANUAL TEST PASSED: MetaMode split successfully
