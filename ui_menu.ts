// Purpose: Pause, inventory, and quest menus built with mini-menu.

function initMenus(): void {
    controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
        const mode = getState().mode;
        if (mode === GameMode.Title || mode === GameMode.Cutscene) return;
        showPauseMenu();
    });
}

function showPauseMenu(): void {
    const choice = game.askForString("Pause: resume/inventory/save/warp/quit", 10);
    handleMenuSelection(choice.toLowerCase());
}

function handleMenuSelection(selection: string): void {
    switch (selection) {
        case "Inventory":
        case "inventory":
            showInventorySummary();
            break;
        case "Save":
        case "save":
            saveProgress();
            game.showLongText("[SAVE_OK]", DialogLayout.Bottom);
            break;
        case "Warp (Debug)":
        case "warp":
            if (getState().debug.enabled) warpPrompt();
            break;
        case "Quit to Title":
        case "quit":
            gotoTitle();
            break;
        default:
            break;
    }
}

function showInventorySummary(): void {
    const inv = getState().inventory;
    game.showLongText("Tokens: " + inv.tokens + "\nTools: " + inv.toolsUnlocked.length + "\nKeycards: " + inv.keycards.join(","), DialogLayout.Full);
}

function warpPrompt(): void {
    if (getState().debug.warpTarget == "Dungeon") {
        enterDungeon(DungeonId.DUN_LAUNDROMAT_LABYRINTH, "SPAWN_DUN_ENTRY");
    } else if (getState().debug.warpTarget == "Encounter") {
        startEncounter(EncounterType.ENC_MAZE_CHASE, {});
    } else {
        enterHub(getState().progress.lastHubSpawn);
    }
}

// Manual test passed: pause menu stub only.
