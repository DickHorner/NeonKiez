// UI Menu: Pause/Inventory/Questlog/Debug-Warp (mini-menu)
// NOTE: Uses Arcade runtime globals (game, DialogLayout); imports are unnecessary.
function showPauseMenu() {
  // Placeholder: simple menu
  const choice = game.askForNumber("PAUSE 0=Continue 1=Save 2=Exit", 0);

  if (choice === 1) {
    saveGame();
  } else if (choice === 2) {
    saveGame();
    game.reset();
  }
}

function showInventory() {
  // Placeholder: list items
  let text = "INVENTORY:\n";
  const itemIds = Object.keys(state.inventory);
  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i];
    text += itemId + ": " + state.inventory[itemId] + "\\n";
  }
  game.showLongText(text, DialogLayout.Center);
}

function showQuestLog() {
  game.showLongText("[QUEST_LOG_PLACEHOLDER]", DialogLayout.Center);
}

function showDebugWarpMenu() {
  // Debug warp menu for testing
  const choice = game.askForNumber(
    "WARP: 0=Hub 1=Dun01 2=Dun02 9=GodMode",
    1
  );

  if (choice === 0) {
    warpToHub();
  } else if (choice === 1) {
    warpToDungeon("DUN_LAUNDROMAT_LABYRINTH");
  } else if (choice === 2) {
    warpToDungeon("DUN_ROOFTOP_INVADERS");
  } else if (choice === 9) {
    toggleGodMode();
  }
}
