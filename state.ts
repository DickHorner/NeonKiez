// GameState: flags, inventory, unlocked tools, current hub room, playMode

interface GameState {
    // Flow
    gameMode: number  // GameMode enum
    playMode: number  // PlayMode enum
    
    // Player stats
    hearts: number
    maxHearts: number
    energy: number
    
    // Hub location
    hubRoom: { row: number; col: number }
    
    // Flags (quest progress, dungeon clears, etc)
    flags: { [key: string]: boolean }
    
    // Tools
    unlockedTools: string[]
    currentTool: string | null
    toolCooldownUntil: number
    
    // Inventory
    inventory: { [itemId: string]: number }
    
    // Dungeon progress
    currentDungeonId: string | null
    currentStageIndex: number
    dungeonStageData: any  // mode-specific stage state
    
    // Transitions
    transitionLock: boolean
    
    // Input debounce
    lastInteractTime: number
    lastOverlapTime: number
    
    // Player invincibility
    invincibleUntil: number
}

export let state: GameState = null as any

export function initState() {
    state = {
        gameMode: 0,  // Boot
        playMode: 0,  // HUB_TOPDOWN
        
        hearts: 5,
        maxHearts: 5,
        energy: 100,
        
        hubRoom: { row: 1, col: 1 },
        
        flags: {},
        
        unlockedTools: [],
        currentTool: null,
        toolCooldownUntil: 0,
        
        inventory: {},
        
        currentDungeonId: null,
        currentStageIndex: 0,
        dungeonStageData: null,
        
        transitionLock: false,
        
        lastInteractTime: 0,
        lastOverlapTime: 0,
        
        invincibleUntil: 0
    }
}

export function setGameMode(mode: number) {
    state.gameMode = mode
}

export function setPlayMode(mode: number) {
    state.playMode = mode
}

export function setFlag(flag: string, value: boolean = true) {
    state.flags[flag] = value
}

export function hasFlag(flag: string): boolean {
    return !!state.flags[flag]
}

export function unlockTool(toolId: string) {
    if (state.unlockedTools.indexOf(toolId) < 0) {
        state.unlockedTools.push(toolId)
    }
}

export function hasTool(toolId: string): boolean {
    return state.unlockedTools.indexOf(toolId) >= 0
}

export function addItem(itemId: string, qty: number) {
    if (!state.inventory[itemId]) {
        state.inventory[itemId] = 0
    }
    state.inventory[itemId] += qty
}

export function getItemCount(itemId: string): number {
    return state.inventory[itemId] || 0
}

export function damagePlayer(amount: number) {
    if (game.runtime() < state.invincibleUntil) return
    
    state.hearts -= amount
    if (state.hearts < 0) state.hearts = 0
    
    state.invincibleUntil = game.runtime() + 1000  // PLAYER_INVINCIBILITY_MS
    
    // TODO: feedback (flash, sound)
}

export function healPlayer(amount: number) {
    state.hearts += amount
    if (state.hearts > state.maxHearts) state.hearts = state.maxHearts
}

export function canInteract(): boolean {
    return game.runtime() > state.lastInteractTime + 300  // INTERACT_DEBOUNCE_MS
}

export function markInteract() {
    state.lastInteractTime = game.runtime()
}
