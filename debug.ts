// Debug: Warp, Godmode, counters, overlay

let debugMode = false
let godMode = false

function initDebug() {
    // Toggle debug with controller combo (e.g., hold Menu + Down)
    // Placeholder: always available for testing
    debugMode = true
}

function toggleGodMode() {
    godMode = !godMode
    if (godMode) {
        state.invincibleUntil = Number.MAX_SAFE_INTEGER
        showHint("[GODMODE_ON]", 2000)
    } else {
        state.invincibleUntil = 0
        showHint("[GODMODE_OFF]", 2000)
    }
}

function warpToDungeon(dungeonId: string) {
    GameController.enterDungeon(dungeonId)
}

function warpToHub() {
    setGameMode(GameMode.Hub)
    GameController.switchPlayMode(PlayMode.HUB_TOPDOWN, {
        hubRoom: state.hubRoom,
        spawnTag: null
    })
}

function showDebugOverlay() {
    let text = "DEBUG\n"
    text += "Mode: " + state.playMode + "\n"
    text += "Hearts: " + state.hearts + "\n"
    text += "Tools: " + state.unlockedTools.length + "\n"
    text += "Flags: " + Object.keys(state.flags).length + "\n"
    
    game.showLongText(text, DialogLayout.Top)
}

// MANUAL TEST PASSED: Debug helpers
