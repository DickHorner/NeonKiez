// Purpose: Global game state container, flags, and progress helpers.

interface InventoryState {
    hearts: number;
    energy: number;
    tokens: number;
    stickers: number;
    cassettes: number;
    keycards: string[];
    toolsUnlocked: ToolType[];
    upgrades: string[];
}

interface ProgressState {
    questFlags: { [id: string]: boolean };
    clearedDungeons: { [id: number]: boolean };
    lastHubSpawn: string;
    manualNotes: string[];
}

interface DebugState {
    enabled: boolean;
    godMode: boolean;
    showHitboxes: boolean;
    warpTarget?: string;
}

interface GameState {
    mode: GameMode;
    currentDungeon: DungeonId;
    currentEncounter: EncounterType;
    spawnTag: string;
    inventory: InventoryState;
    progress: ProgressState;
    debug: DebugState;
    saveVersion: number;
    player?: Sprite;
}

interface SaveData {
    version: number;
    mode: GameMode;
    currentDungeon: DungeonId;
    currentEncounter: EncounterType;
    spawnTag: string;
    inventory: InventoryState;
    questFlags: string[];
    clearedDungeons: number[];
    lastHubSpawn: string;
}

let gameState: GameState = createDefaultGameState();

function createDefaultGameState(): GameState {
    return {
        mode: GameMode.Boot,
        currentDungeon: DungeonId.None,
        currentEncounter: EncounterType.None,
        spawnTag: "SPAWN_HUB_START",
        inventory: {
            hearts: PLAYER_DEFAULT_HEARTS,
            energy: PLAYER_MAX_ENERGY,
            tokens: 0,
            stickers: 0,
            cassettes: 0,
            keycards: [],
            toolsUnlocked: [ToolType.Tagger],
            upgrades: []
        },
        progress: {
            questFlags: {},
            clearedDungeons: {},
            lastHubSpawn: "SPAWN_HUB_START",
            manualNotes: []
        },
        debug: {
            enabled: false,
            godMode: false,
            showHitboxes: false
        },
        saveVersion: SAVE_VERSION
    };
}

function initGameState(): void {
    gameState = createDefaultGameState();
}

function getState(): GameState {
    return gameState;
}

function setMode(mode: GameMode): void {
    gameState.mode = mode;
}

function updateSpawn(tag: string): void {
    gameState.spawnTag = tag;
    gameState.progress.lastHubSpawn = tag;
}

function unlockTool(tool: ToolType): void {
    if (gameState.inventory.toolsUnlocked.indexOf(tool) < 0) {
        gameState.inventory.toolsUnlocked.push(tool);
    }
}

function addKeycard(id: string): void {
    if (gameState.inventory.keycards.indexOf(id) < 0) {
        gameState.inventory.keycards.push(id);
    }
}

function markDungeonCleared(id: DungeonId): void {
    gameState.progress.clearedDungeons[id] = true;
}

function setQuestFlag(flagId: string, value: boolean = true): void {
    gameState.progress.questFlags[flagId] = value;
}

function hasQuestFlag(flagId: string): boolean {
    return !!gameState.progress.questFlags[flagId];
}

function adjustHearts(delta: number): void {
    if (gameState.debug.godMode) return;
    gameState.inventory.hearts = Math.constrain(gameState.inventory.hearts + delta, 0, PLAYER_MAX_HEARTS);
}

function adjustEnergy(delta: number): void {
    gameState.inventory.energy = Math.constrain(gameState.inventory.energy + delta, 0, PLAYER_MAX_ENERGY);
}

function regenerateEnergy(): void {
    adjustEnergy(PLAYER_ENERGY_REGEN);
}

function toSaveData(): SaveData {
    return {
        version: SAVE_VERSION,
        mode: gameState.mode,
        currentDungeon: gameState.currentDungeon,
        currentEncounter: gameState.currentEncounter,
        spawnTag: gameState.spawnTag,
        inventory: gameState.inventory,
        questFlags: Object.keys(gameState.progress.questFlags).filter(k => gameState.progress.questFlags[k]),
        clearedDungeons: Object.keys(gameState.progress.clearedDungeons).map(k => parseInt(k)),
        lastHubSpawn: gameState.progress.lastHubSpawn
    };
}

function applySaveData(data: SaveData): void {
    initGameState();
    gameState.mode = data.mode;
    gameState.currentDungeon = data.currentDungeon;
    gameState.currentEncounter = data.currentEncounter;
    gameState.spawnTag = data.spawnTag || "SPAWN_HUB_START";
    gameState.inventory = data.inventory || gameState.inventory;
    gameState.progress.lastHubSpawn = data.lastHubSpawn || gameState.progress.lastHubSpawn;
    for (let flag of data.questFlags) {
        gameState.progress.questFlags[flag] = true;
    }
    for (let id of data.clearedDungeons) {
        gameState.progress.clearedDungeons[id] = true;
    }
}

function logManualTest(note: string): void {
    gameState.progress.manualNotes.push(note);
}

function cleanupTransientSprites(): void {
    destroyKind(SpriteKind.NPC);
    destroyKind(SpriteKind.Enemy);
    destroyKind(SpriteKind.Collectible);
    destroyKind(SpriteKind.Tool);
    destroyKind(SpriteKind.ToolFreeze);
    destroyKind(SpriteKind.ToolSoap);
    destroyKind(SpriteKind.ToolTagger);
    destroyKind(SpriteKind.Cabinet);
    destroyKind(SpriteKind.Debug);
    destroyKind(SpriteKind.Projectile);
}

function destroyKind(kind: number): void {
    for (let s of sprites.allOfKind(kind)) {
        if (s.kind() !== SpriteKind.Player && s.kind() !== SpriteKind.UI && s.kind() !== SpriteKind.TextLabel) {
            s.destroy();
        }
    }
}

// MANUAL TEST PASSED: State scaffolding with proper save/load support
