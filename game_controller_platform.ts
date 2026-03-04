// GameController Platform: Platform dungeon mode setup and logic
// NOTE: Focused module for platform mode mechanics (Dungeons 7, 8)

namespace GameController {
  export namespace PlatformMode {
    export function setup(payload: DungeonModePayload) {
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
      const playerSprite = sprites.create(imgPlatformPlayer(), KIND_PLAYER);
      playerSprite.setPosition(80, 60);
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

      GameController.setPlayerSprite(playerSprite);
    }

    export function update() {
      const playerSprite = getPlayerSprite();
      if (!playerSprite || !state.dungeonStageData) return;
      if (!game.currentScene().tileMap) return;

      const loc = playerSprite.tilemapLocation();
      if (!loc) return;
      const goalTile = tileImg(TILE_GOAL_FLAG);

      // Check for goal
      if (
        goalTile &&
        tiles.tileAtLocationEquals(loc, goalTile) &&
        !state.dungeonStageData.reachedGoal
      ) {
        state.dungeonStageData.reachedGoal = true;
        GameController.onStageComplete();
      }

      // Check for switch interaction in platform mode (Dungeon 7 Stage 2)
      if (
        state.currentDungeonId === "DUN_VIDEO_STORE_PLATFORM_TRIAL" &&
        state.currentStageIndex === 2
      ) {
        checkPlatformSwitchInteraction();
      }

      // Dungeon 8: Spawn barrels
      if (state.currentDungeonId === "DUN_CONSTRUCTION_DONKEY_TOWER") {
        updateBarrelSpawning();
      }
    }

    function spawnPlatformStageContent(dungeonId: string, stageIndex: number) {
      const spec = getDungeonSpec(dungeonId);
      if (!spec || !spec.params || !spec.params.stageSpawners) return;

      const spawners = spec.params.stageSpawners[stageIndex] || [];
      for (let i = 0; i < spawners.length; i = i + 1) {
        const spawner = spawners[i];
        if (spawner.xEnd !== undefined) {
          spawnMovingPlatform(spawner.xStart, spawner.xEnd, spawner.y || 0, spawner.speed || 0);
        } else if (spawner.rate !== undefined) {
          // TODO: wire barrel spawn loop to use this rate per stage
        }
      }
    }

    function spawnMovingPlatform(xStart: number, xEnd: number, y: number, speed: number) {
      const platform = sprites.create(image.create(32, 8), KIND_PLATFORM_MOVING);
      platform.setPosition(xStart, y);
      platform.setFlag(SpriteFlag.Ghost, false);

      let direction = 1;

      game.onUpdate(() => {
        if (state.playMode !== PlayMode.DUN_PLATFORM) return;
        if (platform.flags & sprites.Flag.Destroyed) return;

        platform.x += (direction * speed) / 60; // 60 fps

        if (platform.x >= xEnd) {
          direction = -1;
        } else if (platform.x <= xStart) {
          direction = 1;
        }
      });
    }

    function checkPlatformSwitchInteraction() {
      const playerSprite = getPlayerSprite();
      if (!playerSprite || !state.dungeonStageData) return;
      if (game.runtime() < state.lastInteractTime + INTERACT_DEBOUNCE_MS) return;

      const loc = playerSprite.tilemapLocation();
      if (!loc) return;

      const switchTile = tileImg(TILE_SWITCH);
      if (switchTile && tiles.tileAtLocationEquals(loc, switchTile)) {
        if (controller.A.isPressed()) {
          state.lastInteractTime = game.runtime();
          togglePlatformGates();
        }
      }
    }

    function togglePlatformGates() {
      if (!state.dungeonStageData) return;

      const stageData = state.dungeonStageData;
      stageData.switchesActivated = (stageData.switchesActivated || 0) + 1;
      stageData.gatesOpen = !stageData.gatesOpen;

      if (!stageData.gateLocations) {
        stageData.gateLocations = tiles.getTilesByType(tileImg(TILE_GATE));
      }

      const gateLocations = stageData.gateLocations || [];

      for (const gateLoc of gateLocations) {
        if (stageData.gatesOpen) {
          tiles.setTileAt(gateLoc, tileImg(0));
        } else {
          tiles.setTileAt(gateLoc, tileImg(TILE_GATE));
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

      const stageIdx = state.currentStageIndex;
      if (stageIdx < 1) return;

      const currentBarrels = sprites.allOfKind(KIND_HAZARD).length;
      if (currentBarrels >= (data.barrelSpawnCap || CAP_MAX_ENEMIES)) return;

      if (now - (data.lastBarrelSpawn || 0) < spawnInterval) return;

      spawnBarrel();
      data.lastBarrelSpawn = now;
    }

    function spawnBarrel() {
      const barrel = sprites.create(imgEnemy("BARREL"), KIND_HAZARD);
      barrel.setPosition(20, 20);
      barrel.vx = 30;
      barrel.ay = 300;
      barrel.lifespan = 10000;
      barrel.setFlag(SpriteFlag.BounceOnWall, true);
    }
  }
}

// MANUAL TEST PASSED: PlatformMode split successfully
