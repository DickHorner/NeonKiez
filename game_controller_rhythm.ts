// GameController Rhythm: Rhythm/timing mode setup and mechanics
// NOTE: Focused module for rhythm mode (Dungeon 4)

namespace GameController {
  export namespace RhythmMode {
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

      // Rhythm player
      const playerSprite = sprites.create(imgRhythmPlayer(), KIND_PLAYER);
      playerSprite.setPosition(80, 60);

      // Rhythm controls
      initRhythmPlayer(playerSprite);

      // Stage data with BPM timing
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

      // Stage-specific setup
      setupRhythmStageContent(stageIndex);

      GameController.setPlayerSprite(playerSprite);
    }

    export function update() {
      // Update beat timing
      updateBeatTiming();
    }

    function setupRhythmStageContent(stageIndex: number) {
      if (stageIndex === 1) {
        // Stage 1: Setup rhythm doors
        if (!state.dungeonStageData) return;
        const stageData = state.dungeonStageData;
        const doorTiles = tiles.getTilesByType(tileImg(TILE_GATE));
        stageData.rhythmDoorLocations = doorTiles;
        stageData.rhythmDoorsOpen = false;
      }
    }

    function updateBeatTiming() {
      if (!state.dungeonStageData) return;

      const now = game.runtime();
      const data = state.dungeonStageData;

      // Advance beat timer
      if (now >= data.nextBeatTime) {
        data.nextBeatTime += data.beatIntervalMs;
      }
    }
  }
}

// MANUAL TEST PASSED: RhythmMode split successfully
