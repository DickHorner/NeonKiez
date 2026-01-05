// UI HUD: hearts, energy, tool, hint
// NOTE: Relies on Arcade globals (textsprite, SpriteFlag, scene, game); no imports needed.

let hudHearts: TextSprite = null as any
let hudEnergy: TextSprite = null as any
let hudTool: TextSprite = null as any
let hudHint: TextSprite = null as any

export function initHUD() {
    hudHearts = textsprite.create("", 0, 1)
    hudHearts.setFlag(SpriteFlag.RelativeToCamera, true)
    hudHearts.left = 2
    hudHearts.top = 2
    
    hudEnergy = textsprite.create("", 0, 1)
    hudEnergy.setFlag(SpriteFlag.RelativeToCamera, true)
    hudEnergy.left = 2
    hudEnergy.top = 12
    
    hudTool = textsprite.create("", 0, 1)
    hudTool.setFlag(SpriteFlag.RelativeToCamera, true)
    hudTool.right = scene.screenWidth() - 2
    hudTool.top = 2
    
    hudHint = textsprite.create("", 0, 1)
    hudHint.setFlag(SpriteFlag.RelativeToCamera, true)
    hudHint.setMaxFontHeight(7)
    hudHint.left = 2
    hudHint.bottom = scene.screenHeight() - 2
}

export function updateHUD() {
    if (!hudHearts) return
    
    // Hearts
    let heartStr = ""
    for (let i = 0; i < state.hearts; i++) {
        heartStr += "♥"
    }
    hudHearts.setText(heartStr)
    
    // Energy (if needed)
    // hudEnergy.setText("E:" + state.energy)
    
    // Tool
    if (state.currentTool) {
        hudTool.setText("[" + state.currentTool + "]")
    } else {
        hudTool.setText("")
    }
}

export function showHint(text: string, durationMs: number = 2000) {
    if (!hudHint) return
    hudHint.setText(text)

    control.runInParallel(() => {
        pause(durationMs)
        if (hudHint) hudHint.setText("")
    })
}

export function hideHUD() {
    if (hudHearts) hudHearts.setFlag(SpriteFlag.Invisible, true)
    if (hudEnergy) hudEnergy.setFlag(SpriteFlag.Invisible, true)
    if (hudTool) hudTool.setFlag(SpriteFlag.Invisible, true)
    if (hudHint) hudHint.setFlag(SpriteFlag.Invisible, true)
}

export function showHUD() {
    if (hudHearts) hudHearts.setFlag(SpriteFlag.Invisible, false)
    if (hudEnergy) hudEnergy.setFlag(SpriteFlag.Invisible, false)
    if (hudTool) hudTool.setFlag(SpriteFlag.Invisible, false)
    if (hudHint) hudHint.setFlag(SpriteFlag.Invisible, false)
}
