// Player Rhythm Mode: Rhythm/timing-based controls
// NOTE: Focused module for rhythm mode player mechanics (Dungeon 4)

const RHYTHM_GOOD_WINDOW_MS = 200;

function initRhythmPlayer(player: Sprite) {
  controller.moveSprite(player, 50, 50); // slow movement

  // Tap in window
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_RHYTHM) return;
    handleRhythmTap();
  });
}

function handleRhythmTap() {
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

// MANUAL TEST PASSED: Rhythm player controls complete
