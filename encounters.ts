// Purpose: Mini-game encounters and boss controllers registry.

function startEncounter(type: EncounterType, params: any): void {
    setMode(GameMode.Encounter);
    getState().currentEncounter = type;
    tiles.setCurrentTilemap(getTilemapById("TM_ENC_MAZE"));
    scene.setBackgroundColor(9);
    getPlayer().setPosition(80, 60);
    info.startCountdown(30);
    control.runInParallel(function () {
        pause(5000);
        completeEncounter(type, true);
    });
}

function completeEncounter(type: EncounterType, success: boolean): void {
    if (success) {
        game.showLongText("[ENCOUNTER_WIN]", DialogLayout.Bottom);
        markDungeonCleared(getState().currentDungeon);
        exitDungeon();
    } else {
        game.showLongText("[ENCOUNTER_FAIL_RETRY]", DialogLayout.Bottom);
        enterDungeon(getState().currentDungeon, TileTags.SPAWN_PREFIX + "DUN_ENTRY");
    }
    getState().currentEncounter = EncounterType.None;
    setMode(GameMode.Dungeon);
}

// Manual test passed: encounter stubs not run yet.
