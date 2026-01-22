// GameController Puzzle Modes: Puzzle stage logic and dungeon-specific puzzle content
// NOTE: Focused module for puzzle mode mechanics (Dungeons 1, 3, 5)

namespace GameController {
  export namespace PuzzleMode {
    export function update() {
      if (!getPlayerSprite() || !state.dungeonStageData) return;
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

    export function spawnContent(dungeonId: string, stageIndex: number) {
      if (dungeonId === "DUN_LAUNDROMAT_LABYRINTH") {
        spawnDungeon01Content(stageIndex);
      } else if (dungeonId === "DUN_WAREHOUSE_BLOCKWORKS") {
        spawnDungeon03Content(stageIndex);
      } else if (dungeonId === "DUN_SCHOOL_PONG_COURT") {
        spawnDungeon05Content(stageIndex);
      }
    }

    function updateGhostBotPatrol() {
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
      const playerSprite = GameController.getPlayerSprite();
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
      GameController.onStageComplete();
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
      const tokenTiles = tiles.getTilesByType(tiles.getTileImage(11 as any));

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

      const patrolSpeed = 20;
      ghostBot.vx = patrolSpeed;
    }

    function spawnDungeon03Content(stageIndex: number) {
      if (stageIndex === 2) {
        spawnMovingCrates();
      }
    }

    function spawnMovingCrates() {
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

      if (state.dungeonStageData) {
        state.dungeonStageData.targetsRequired = targetsRequired;
        state.dungeonStageData.targetsDestroyed = 0;
        state.dungeonStageData.ballSpeed = ballSpeed;
      }

      const playerSprite = getPlayerSprite();
      if (playerSprite) {
        playerSprite.setImage(imgPaddle());
        playerSprite.setKind(KIND_PADDLE);
        playerSprite.setPosition(80, 110);
        playerSprite.setStayInScreen(true);
        controller.moveSprite(playerSprite, PADDLE_SPEED, 0);
      }

      spawnTargets(stageIndex);

      // Serve an initial ball if none are active
      serveBall();
    }

    function spawnTargets(stageIndex: number) {
      if (!state.dungeonStageData) return;
      const targetsRequired = state.dungeonStageData.targetsRequired;

      const targetTiles = tiles.getTilesByType(tiles.getTileImage(TILE_INDEX_TARGET as any));

      if (targetTiles && targetTiles.length > 0) {
        for (let i = 0; i < Math.min(targetsRequired, targetTiles.length); i++) {
          const target = sprites.create(imgTarget(), KIND_TARGET);
          tiles.placeOnTile(target, targetTiles[i]);
        }
      } else {
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

        // Check if ball fell off bottom
        if (ball.y > scene.screenHeight() + 5) {
          ball.destroy();
        }
      }
    }

    export function serveBall() {
      if (!state.dungeonStageData) return;

      // Cap: only one ball at a time
      if (sprites.allOfKind(KIND_BALL).length >= CAP_MAX_BALLS) return;

      const paddle = sprites.allOfKind(KIND_PADDLE)[0];
      if (!paddle) return;

      const ballSpeed = state.dungeonStageData.ballSpeed || BALL_SPEED_NORMAL;

      const ball = sprites.create(imgBall(), KIND_BALL);
      ball.setPosition(paddle.x, paddle.y - 10);
      ball.vx = 0;
      ball.vy = -ballSpeed;
      ball.setFlag(SpriteFlag.AutoDestroy, true);
    }

    export function handleBallPaddleBounce(ball: Sprite, paddle: Sprite) {
      // Only bounce if ball is moving downward (prevent rapid re-bounces)
      if (ball.vy < 0) return;

      // Bounce ball upward with horizontal velocity based on hit position
      const hitOffset = ball.x - paddle.x; // -16 to +16 (for 32px paddle)

      // Set upward velocity
      ball.vy = -Math.abs(ball.vy);

      // Add horizontal velocity based on where ball hit paddle
      ball.vx += hitOffset * 2;

      // Cap horizontal velocity
      if (ball.vx > 80) ball.vx = 80;
      if (ball.vx < -80) ball.vx = -80;

      sfxInteract();
    }

    export function handleBallTargetHit(ball: Sprite, target: Sprite) {
      if (!state.dungeonStageData) return;

      // Verify it's actually a target
      if (target.kind() !== KIND_TARGET) return;

      // Destroy target
      target.destroy();

      // Bounce ball
      ball.vy = Math.abs(ball.vy);

      // Increment counter
      incrementTargetCounter();
      sfxInteract();
    }

    function incrementTargetCounter() {
      if (!state.dungeonStageData) return;
      if (state.dungeonStageData.targetsDestroyed !== undefined) {
        state.dungeonStageData.targetsDestroyed += 1;
      }
    }
  }
}

// MANUAL TEST PASSED: PuzzleMode split successfully
