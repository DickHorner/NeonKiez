// Save/Load: serialize/deserialize, persist, continue/new game
// NOTE: MakeCode Arcade provides settings/JSON globals; imports are intentionally omitted.

// DECISION: Using settings block for persistence (simple key-value)

function saveGame() {
    // Serialize state to JSON
    const data = {
        hearts: state.hearts,
        maxHearts: state.maxHearts,
        energy: state.energy,
        hubRoom: state.hubRoom,
        flags: state.flags,
        unlockedTools: state.unlockedTools,
        inventory: state.inventory
    }
    
    settings.writeString("NEON_KIEZ_SAVE", JSON.stringify(data))
}

function loadGame(): boolean {
    const json = settings.readString("NEON_KIEZ_SAVE")
    if (!json || json.length === 0) {
        return false
    }
    
    try {
        const data = JSON.parse(json)
        state.hearts = data.hearts || 5
        state.maxHearts = data.maxHearts || 5
        state.energy = data.energy || 100
        state.hubRoom = data.hubRoom || { row: 1, col: 1 }
        state.flags = data.flags || {}
        state.unlockedTools = data.unlockedTools || []
        state.inventory = data.inventory || {}
        return true
    } catch (e) {
        return false
    }
}

function hasSaveData(): boolean {
    const json = settings.readString("NEON_KIEZ_SAVE")
    return json && json.length > 0
}

function deleteSave() {
    settings.writeString("NEON_KIEZ_SAVE", "")
}
