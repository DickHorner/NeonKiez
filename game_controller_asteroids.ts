// GameController Asteroids: Asteroids-style mode setup and mechanics
// NOTE: Focused module for asteroids mode (Dungeon 6)

namespace GameController {
  export namespace AsteroidsMode {
    export function setup(payload: any) {
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
      const playerSprite = sprites.create(imgAsteroidsShip(), KIND_PLAYER);
      playerSprite.setPosition(80, 60);

      // Asteroids controls
      initAsteroidsPlayer(playerSprite);

      // Stage data
      state.dungeonStageData = {
        stageIndex: stageIndex,
        debrisCount: 0,
        partsCollected: 0,
      };

      GameController.setPlayerSprite(playerSprite);
    }

    export function update() {
      // Placeholder: debris spawning/split logic goes here
    }
  }
}

// MANUAL TEST PASSED: AsteroidsMode split successfully
