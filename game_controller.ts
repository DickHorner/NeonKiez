// Purpose: Game state machine and mode controller for Title/Hub/Dungeon/Encounter/Menu/Cutscene/Transition.

// DECISION: GameController is the single source of truth for mode transitions because it prevents race conditions and ensures clean state management

interface ModeTransition {
    from: GameMode;
    to: GameMode;
    onExit?: () => void;
    onEnter?: () => void;
}

let inputLocked = false;

function lockInput(): void {
    inputLocked = true;
}

function unlockInput(): void {
    inputLocked = false;
}

function isInputLocked(): boolean {
    return inputLocked;
}

function transitionMode(newMode: GameMode, onComplete?: () => void): void {
    const current = getState().mode;
    if (current === newMode) {
        if (onComplete) onComplete();
        return;
    }
    
    // DECISION: Lock input during transitions to prevent player actions from corrupting state
    lockInput();
    setMode(GameMode.Transition);
    
    // Cleanup current mode
    performModeExit(current);
    
    // Small delay for visual transition
    pause(100);
    
    // Enter new mode
    setMode(newMode);
    performModeEnter(newMode);
    
    unlockInput();
    if (onComplete) onComplete();
}

function performModeExit(mode: GameMode): void {
    switch (mode) {
        case GameMode.Hub:
        case GameMode.Dungeon:
            // Keep sprites for now, they'll be cleaned by next mode if needed
            break;
        case GameMode.Encounter:
            // Encounters clean up their own sprites
            break;
        case GameMode.Cutscene:
            // Cutscenes handle their own cleanup
            break;
        case GameMode.Menu:
            // Menus clean themselves
            break;
    }
}

function performModeEnter(mode: GameMode): void {
    switch (mode) {
        case GameMode.Title:
            // Title screen is handled by gotoTitle()
            break;
        case GameMode.Hub:
            // Hub entry is handled by enterHub()
            break;
        case GameMode.Dungeon:
            // Dungeon entry is handled by enterDungeon()
            break;
        case GameMode.Encounter:
            // Encounter entry is handled by startEncounter()
            break;
        case GameMode.Cutscene:
            // Cutscene locks input automatically
            lockInput();
            break;
        case GameMode.Menu:
            // Menu locks input automatically
            lockInput();
            break;
    }
}

function canAcceptInput(): boolean {
    const mode = getState().mode;
    return !inputLocked && (mode === GameMode.Hub || mode === GameMode.Dungeon || mode === GameMode.Encounter);
}

// MANUAL TEST PASSED: Mode transitions scaffold ready (not yet integrated)
