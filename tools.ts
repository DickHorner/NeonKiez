// Tools: FreezeCam/Confetti/Soap/Decoy/Tagger (global, may be disabled per mode)
// NOTE: Arcade runtime globals (game, sprites) are available without imports.

export function useTool(toolId: string) {
    // Check cooldown
    if (game.runtime() < state.toolCooldownUntil) {
        return
    }
    
    // Check if tool is unlocked
    if (!hasTool(toolId)) {
        return
    }
    
    // Use tool based on current playMode
    if (toolId === TOOL_FREEZECAM) {
        useFreezeCam()
    } else if (toolId === TOOL_CONFETTI_BOMB) {
        useConfettiBomb()
    } else if (toolId === TOOL_SOAP_SLIDE) {
        useSoapSlide()
    } else if (toolId === TOOL_DECOY_TOY) {
        useDecoyToy()
    } else if (toolId === TOOL_TAGGER) {
        useTagger()
    }
    
    state.toolCooldownUntil = game.runtime() + TOOL_COOLDOWN_MS
    sfxToolUse()
}

function useFreezeCam() {
    // Placeholder: freeze cone in direction player faces
    // Stun enemies in cone for 3s
    showHint("[TOOL_FREEZECAM_USED]", 1000)
}

function useConfettiBomb() {
    // Placeholder: AoE stun around player
    showHint("[TOOL_CONFETTI_BOMB_USED]", 1000)
}

function useSoapSlide() {
    // Placeholder: create slippery area
    showHint("[TOOL_SOAP_SLIDE_USED]", 1000)
}

function useDecoyToy() {
    // Placeholder: spawn lure sprite
    showHint("[TOOL_DECOY_TOY_USED]", 1000)
}

function useTagger() {
    // Placeholder: mark nearest interactable
    showHint("[TOOL_TAGGER_USED]", 1000)
}

export function cycleToolSelection() {
    if (state.unlockedTools.length === 0) {
        state.currentTool = null
        return
    }
    
    let currentIndex = -1
    if (state.currentTool) {
        currentIndex = state.unlockedTools.indexOf(state.currentTool)
    }
    
    currentIndex = (currentIndex + 1) % state.unlockedTools.length
    state.currentTool = state.unlockedTools[currentIndex]
    
    updateHUD()
}
