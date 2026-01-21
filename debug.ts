// Debug: Warp, Godmode, counters, overlay

let debugMode = false;
let godMode = false;

function initDebug() {
  // Toggle debug with controller combo (e.g., hold Menu + Down)
  // Placeholder: always available for testing
  debugMode = true;
}

function toggleGodMode() {
  godMode = !godMode;
  if (godMode) {
    // Use a large timestamp instead of MAX_SAFE_INTEGER (not defined in Arcade runtime)
    state.invincibleUntil = 0x7fffffff;
    showHint("[GODMODE_ON]", 2000);
  } else {
    state.invincibleUntil = 0;
    showHint("[GODMODE_OFF]", 2000);
  }
}

function warpToDungeon(dungeonId: string) {
  GameController.enterDungeon(dungeonId);
}

function warpToHub() {
  setGameMode(GameMode.Hub);
  GameController.switchPlayMode(PlayMode.HUB_TOPDOWN, {
    hubRoom: state.hubRoom,
    spawnTag: null,
  });
}

function showDebugOverlay() {
  let text = "DEBUG\n";
  text += "Mode: " + state.playMode + "\n";
  text += "Hearts: " + state.hearts + "\n";
  text += "Tools: " + state.unlockedTools.length + "\n";
  text += "Flags: " + Object.keys(state.flags).length + "\n";

  game.showLongText(text, DialogLayout.Top);
}

function validateRegistry() {
  runDungeonRegistryValidation();
}

function testDungeon05() {
  // Quick test: warp to Dungeon 5 Stage 0
  warpToDungeon("DUN_SCHOOL_PONG_COURT");
  showHint("[TEST_DUNGEON_05_STARTED]", 3000);
}

function unlockAllDungeons() {
  // Unlock all 8 dungeons to access Dungeon 9
  for (let i = 0; i < DUNGEON_SPECS.length - 1; i++) {
    const spec = DUNGEON_SPECS[i];
    for (const flag of spec.rewards.flagsSet) {
      setFlag(flag);
    }
    if (spec.rewards.toolUnlocks) {
      for (const tool of spec.rewards.toolUnlocks) {
        unlockTool(tool);
      }
    }
  }
  setFlag("FLAG_ALL_DUNGEONS_CLEARED");
  showHint("[DEBUG_ALL_DUNGEONS_UNLOCKED]", 2000);
  saveGame();
}

function testDungeon9Stage(stageIndex: number) {
  // Quick warp to specific Dungeon 9 stage
  setGameMode(GameMode.Dungeon);
  GameController.switchPlayMode(PlayMode.DUN_META, {
    dungeonId: "DUN_FINAL_GLITCH_PANOPTICON",
    stageIndex: stageIndex,
  });
  showHint("[DEBUG_WARP_DUN09_STAGE_" + stageIndex + "]", 2000);
}

function showMetaModeDebug() {
  if (state.playMode !== PlayMode.DUN_META || !state.dungeonStageData) {
    showHint("[NOT_IN_META_MODE]", 2000);
    return;
  }

  const data = state.dungeonStageData;
  let text = "META MODE DEBUG\n";
  text += "Stage: " + state.currentStageIndex + "\n";
  
  if (state.currentStageIndex === 1) {
    text += "Goal reached: " + (data.reachedGoal ? "YES" : "NO") + "\n";
  } else if (state.currentStageIndex === 2) {
    text += "Targets destroyed: " + (data.targetsDestroyed || 0) + "/" + (data.targetsRequired || 0) + "\n";
  } else if (state.currentStageIndex === 3) {
    text += "Streak: " + (data.streak || 0) + "/" + (data.streakRequired || 0) + "\n";
    text += "Misses: " + (data.misses || 0) + "\n";
  } else if (state.currentStageIndex === 4) {
    text += "Nodes: " + (data.nodesStabilized || 0) + "/" + (data.nodesRequired || 0) + "\n";
    text += "Current: " + (data.currentNodeIndex || 0) + "\n";
  }

  game.showLongText(text, DialogLayout.Top);
}

// MANUAL TEST PASSED: Debug helpers
// MANUAL TEST PASSED: Dungeon 9 debug functions added
