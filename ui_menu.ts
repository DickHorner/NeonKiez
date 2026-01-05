// UI Menu: Pause/Inventory/Questlog/Debug-Warp (mini-menu)
// NOTE: Uses Arcade runtime globals (game, DialogLayout); imports are unnecessary.

function showPauseMenu() {
    // Placeholder: simple menu
    const choice = game.askForNumber("PAUSE 0=Continue 1=Save 2=Exit", 0)

    if (choice === 1) {
        saveGame()
    } else if (choice === 2) {
        saveGame()
        game.reset()
    }
}

function showInventory() {
    // Placeholder: list items
    let text = "INVENTORY:\n"
    for (const itemId in state.inventory) {
        text += itemId + ": " + state.inventory[itemId] + "\n"
    }
    game.showLongText(text, DialogLayout.Center)
}

function showQuestLog() {
    game.showLongText("[QUEST_LOG_PLACEHOLDER]", DialogLayout.Center)
}

function showDebugWarpMenu() {
    // Placeholder: warp to dungeons
    game.showLongText("[DEBUG_WARP_MENU]", DialogLayout.Center)
}
