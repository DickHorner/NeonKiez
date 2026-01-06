// UI HUD: hearts, energy, tool, hint
// NOTE: Uses Arcade rendering API instead of textsprite extension (which may not be loaded)

let hudHeartsText = ""
let hudToolText = ""
let hudHintText = ""
let hudHintEndTime = 0

function initHUD() {
    // HUD uses screen text rendering instead of sprite-based text
    hudHeartsText = ""
    hudToolText = ""
    hudHintText = ""
    hudHintEndTime = 0
}

function updateHUD() {
    // Hearts display
    let heartStr = ""
    for (let i = 0; i < state.hearts; i++) {
        heartStr += "♥"
    }
    hudHeartsText = heartStr
    
    // Tool display
    if (state.currentTool) {
        hudToolText = "[" + state.currentTool + "]"
    } else {
        hudToolText = ""
    }
    
    // Render HUD on screen
    screen.print(hudHeartsText, 2, 2, 1, image.font8)
    if (hudToolText) {
        screen.print(hudToolText, scene.screenWidth() - 50, 2, 1, image.font8)
    }
    
    // Show hint if active
    if (game.runtime() < hudHintEndTime) {
        screen.print(hudHintText, 2, scene.screenHeight() - 10, 1, image.font5)
    }
}

function showHint(text: string, durationMs: number = 2000) {
    hudHintText = text
    hudHintEndTime = game.runtime() + durationMs
}

function hideHUD() {
    // No-op: HUD is screen-rendered, not sprite-based
}

function showHUD() {
    // No-op: HUD is screen-rendered, not sprite-based
}
