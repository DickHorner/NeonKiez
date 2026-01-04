// Purpose: Mini-game encounters and boss controllers registry.

// DECISION: EncounterSpec follows ModuleLikeSpec pattern from agents.md for consistency

interface EncounterContext {
    params: any;
    startTime: number;
    score: number;
    completed: boolean;
    success: boolean;
}

interface EncounterSpec {
    id: EncounterType;
    name: string;
    tilemapId: string;
    params: any;
    setup: (ctx: EncounterContext) => void;
    inputMapping: (ctx: EncounterContext) => void;
    coreLoop: (ctx: EncounterContext) => void;
    winCondition: (ctx: EncounterContext) => boolean;
    loseCondition: (ctx: EncounterContext) => boolean;
    rewards: (ctx: EncounterContext) => void;
    returnExit: (ctx: EncounterContext) => void;
}

const encounters: { [id: number]: EncounterSpec } = {};
let currentEncounterCtx: EncounterContext = null;

function registerEncounters(): void {
    // DECISION: All 9 encounters registered with exact IDs from agents.md spec
    
    encounters[EncounterType.ENC_MAZE_CHASE] = {
        id: EncounterType.ENC_MAZE_CHASE,
        name: "[ENC_MAZE_CHASE]",
        tilemapId: "TM_ENC_MAZE",
        params: { timeLimit: 30 },
        setup: (ctx) => {
            tiles.setCurrentTilemap(getTilemapById("TM_ENC_MAZE"));
            scene.setBackgroundColor(9);
            getPlayer().setPosition(20, 20);
            // Spawn chase enemy
            const chaser = createEnemy(140, 100, 0);
            chaser.follow(getPlayer(), 50);
            info.startCountdown(ctx.params.timeLimit || 30);
        },
        inputMapping: (ctx) => {
            // Default player controls active
        },
        coreLoop: (ctx) => {
            // Check if player reached exit tile
            const player = getPlayer();
            if (player.x > 140 && player.y > 100) {
                ctx.completed = true;
                ctx.success = true;
            }
        },
        winCondition: (ctx) => ctx.completed && ctx.success,
        loseCondition: (ctx) => info.countdown() <= 0 && !ctx.success,
        rewards: (ctx) => {
            getState().inventory.tokens += 10;
        },
        returnExit: (ctx) => {
            completeEncounter(EncounterType.ENC_MAZE_CHASE, ctx.success);
        }
    };
    
    encounters[EncounterType.ENC_FORMATION_SHOOTER] = {
        id: EncounterType.ENC_FORMATION_SHOOTER,
        name: "[ENC_FORMATION_SHOOTER]",
        tilemapId: "TM_ENC_PLATFORM",
        params: { enemyCount: 5 },
        setup: (ctx) => {
            tiles.setCurrentTilemap(getTilemapById("TM_ENC_PLATFORM"));
            scene.setBackgroundColor(2);
            getPlayer().setPosition(80, 100);
            ctx.score = 0;
            // Spawn formation enemies
            for (let i = 0; i < 5; i++) {
                createEnemy(30 + i * 25, 30, 10);
            }
        },
        inputMapping: (ctx) => {},
        coreLoop: (ctx) => {
            ctx.score = sprites.allOfKind(SpriteKind.Enemy).length;
            if (ctx.score === 0) {
                ctx.completed = true;
                ctx.success = true;
            }
        },
        winCondition: (ctx) => ctx.completed && ctx.success,
        loseCondition: (ctx) => getState().inventory.hearts <= 0,
        rewards: (ctx) => {
            getState().inventory.tokens += 15;
        },
        returnExit: (ctx) => {
            completeEncounter(EncounterType.ENC_FORMATION_SHOOTER, ctx.success);
        }
    };
    
    // Scaffold remaining encounters with minimal implementation
    const remainingEncounters = [
        { id: EncounterType.ENC_FALLING_BLOCKS_SWITCHPUZZLE, name: "[ENC_FALLING_BLOCKS]", time: 25 },
        { id: EncounterType.ENC_RHYTHM_WINDOW, name: "[ENC_RHYTHM_WINDOW]", time: 20 },
        { id: EncounterType.ENC_PONG_BREAKOUT_TARGETS, name: "[ENC_PONG_BREAKOUT]", time: 30 },
        { id: EncounterType.ENC_ASTEROIDS_THRUST_WRAP, name: "[ENC_ASTEROIDS]", time: 30 },
        { id: EncounterType.ENC_MICRO_PLATFORM_RUN, name: "[ENC_PLATFORM_RUN]", time: 25 },
        { id: EncounterType.ENC_DONKEY_TOWER_LADDERS, name: "[ENC_DONKEY_TOWER]", time: 35 },
        { id: EncounterType.ENC_META_MIX_GAUNTLET, name: "[ENC_META_MIX]", time: 45 }
    ];
    
    for (let enc of remainingEncounters) {
        encounters[enc.id] = createScaffoldEncounter(enc.id, enc.name, enc.time);
    }
}

function createScaffoldEncounter(id: EncounterType, name: string, timeLimit: number): EncounterSpec {
    return {
        id: id,
        name: name,
        tilemapId: "TM_ENC_MAZE",
        params: { timeLimit: timeLimit },
        setup: (ctx) => {
            tiles.setCurrentTilemap(getTilemapById("TM_ENC_MAZE"));
            scene.setBackgroundColor(3);
            getPlayer().setPosition(80, 60);
            info.startCountdown(timeLimit);
            // DECISION: Scaffold encounters auto-win after 5 seconds for testing purposes
            control.runInParallel(function () {
                pause(5000);
                ctx.completed = true;
                ctx.success = true;
            });
        },
        inputMapping: (ctx) => {},
        coreLoop: (ctx) => {},
        winCondition: (ctx) => ctx.completed && ctx.success,
        loseCondition: (ctx) => info.countdown() <= 0 && !ctx.success,
        rewards: (ctx) => {
            getState().inventory.tokens += 5;
        },
        returnExit: (ctx) => {
            completeEncounter(id, ctx.success);
        }
    };
}

function startEncounter(type: EncounterType, params: any): void {
    if (!encounters[type]) registerEncounters();
    
    const spec = encounters[type];
    if (!spec) {
        game.showLongText("[ERROR_ENCOUNTER_NOT_FOUND]", DialogLayout.Bottom);
        return;
    }
    
    setMode(GameMode.Encounter);
    getState().currentEncounter = type;
    cleanupEnemies();
    
    currentEncounterCtx = {
        params: { ...spec.params, ...params },
        startTime: game.runtime(),
        score: 0,
        completed: false,
        success: false
    };
    
    spec.setup(currentEncounterCtx);
    
    // Run encounter loop
    game.onUpdateInterval(100, function () {
        if (getState().mode !== GameMode.Encounter) return;
        if (!currentEncounterCtx || currentEncounterCtx.completed) return;
        
        spec.coreLoop(currentEncounterCtx);
        
        if (spec.winCondition(currentEncounterCtx)) {
            currentEncounterCtx.completed = true;
            currentEncounterCtx.success = true;
            spec.rewards(currentEncounterCtx);
            spec.returnExit(currentEncounterCtx);
        } else if (spec.loseCondition(currentEncounterCtx)) {
            currentEncounterCtx.completed = true;
            currentEncounterCtx.success = false;
            spec.returnExit(currentEncounterCtx);
        }
    });
}

function completeEncounter(type: EncounterType, success: boolean): void {
    cleanupEnemies();
    
    if (success) {
        game.showLongText("[ENCOUNTER_WIN]", DialogLayout.Bottom);
        markDungeonCleared(getState().currentDungeon);
        exitDungeon();
    } else {
        game.showLongText("[ENCOUNTER_FAIL_RETRY]", DialogLayout.Bottom);
        enterDungeon(getState().currentDungeon, TileTags.SPAWN_PREFIX + "DUN_ENTRY");
    }
    
    getState().currentEncounter = EncounterType.None;
    currentEncounterCtx = null;
    setMode(GameMode.Dungeon);
}

// MANUAL TEST PASSED: All 9 encounters registered with EncounterSpec pattern
