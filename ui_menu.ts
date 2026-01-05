// UI Menu: Pause/Inventory/Questlog/Debug-Warp (mini-menu)

export function showPauseMenu() {
    // Placeholder: simple menu
    const choice = game.ask("PAUSE", "Continue|Save|Exit")
    
    if (choice) {
        // Continue
    } else {
        // Save or exit
        saveGame()
    }
}

export function showInventory() {
    // Placeholder: list items
    let text = "INVENTORY:\n"
    for (const itemId in state.inventory) {
        text += itemId + ": " + state.inventory[itemId] + "\n"
    }
    game.showLongText(text, DialogLayout.Center)
}

export function showQuestLog() {
    game.showLongText("[QUEST_LOG_PLACEHOLDER]", DialogLayout.Center)
}

export function showDebugWarpMenu() {
    // Placeholder: warp to dungeons
    game.showLongText("[DEBUG_WARP_MENU]", DialogLayout.Center)
}
