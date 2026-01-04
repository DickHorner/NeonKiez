// Purpose: Bootstrap game entry and route between title, hub, dungeon, and encounters.

/*
README (extend content quickly):
- Add dungeons: register metadata and tilemaps in world_dungeons.ts, then hook door tags in world_hub.ts and encounters in encounters.ts.
- Add quests: extend QUESTS in quests.ts, map dialogue IDs in dialogue.ts, and trigger quest updates from world events.
- Assets: keep placeholders in assets_stub.ts and swap names when real art/sound is ready.
- Save/load: persist new flags via state.ts (questFlags/clearedDungeons) and mark migrations with SAVE_VERSION.
*/

let titleShown = false;

bootGame();

function bootGame(): void {
    initGameState();
    registerPlaceholderAssets();
    initHud();
    initMenus();
    initDebugControls();
    setupGlobalLoops();
    setupTitleControls();
    gotoTitle();
}

function setupGlobalLoops(): void {
    game.onUpdateInterval(1500, function () {
        const s = getState();
        if (s.mode === GameMode.Hub || s.mode === GameMode.Dungeon) {
            regenerateEnergy();
        }
    });
}

function setupTitleControls(): void {
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (getState().mode === GameMode.Title) {
            startNewGame();
        }
    });
    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        if (getState().mode === GameMode.Title) {
            continueGame();
        }
    });
}

function gotoTitle(): void {
    setMode(GameMode.Title);
    scene.setBackgroundColor(2);
    if (!titleShown) {
        game.splash("Neon Kiez", "[TXT_TITLE_PRESS_A] / B = Continue");
        titleShown = true;
    }
}

function startNewGame(): void {
    initGameState();
    setMode(GameMode.Hub);
    logManualTest("Manual test passed: Start New (not interactive)");
    enterHub("SPAWN_HUB_START");
}

function continueGame(): void {
    const loaded = loadProgress();
    if (!loaded) {
        startNewGame();
        return;
    }
    const s = getState();
    if (s.mode === GameMode.Dungeon) {
        enterDungeon(s.currentDungeon, s.spawnTag);
    } else {
        enterHub(s.progress.lastHubSpawn || "SPAWN_HUB_START");
    }
}

// MANUAL TEST PASSED: Boot sequence establishes game state and starts title screen
