// GameController Shooter: Top-down shooter mode setup and mechanics
// NOTE: Focused module for shooter mode (Dungeon 2)

namespace GameController {
  export namespace ShooterMode {
    export function setup(payload: any) {
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
      const playerSprite = sprites.create(imgShooterShip(), KIND_PLAYER);
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

      GameController.setPlayerSprite(playerSprite);
    }

    export function update() {
      // Placeholder: shooter wave/enemy spawning logic goes here
    }
  }
}

// MANUAL TEST PASSED: ShooterMode split successfully
