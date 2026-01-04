// Purpose: Enemy AI system with Patrol/Notice/Chase/Retreat behaviors.

// DECISION: AI uses simple state machine pattern because MakeCode Arcade has limited CPU and we need performant behavior for multiple enemies

enum EnemyState {
    Patrol,
    Notice,
    Chase,
    Retreat,
    Stunned
}

interface EnemyAI {
    sprite: Sprite;
    state: EnemyState;
    homeX: number;
    homeY: number;
    patrolRadius: number;
    noticeRange: number;
    chaseSpeed: number;
    patrolSpeed: number;
    lastStateChange: number;
    stunnedUntil: number;
}

const enemies: EnemyAI[] = [];
let aiUpdateRegistered = false;

function createEnemy(x: number, y: number, patrolRadius: number = 40): Sprite {
    const sprite = sprites.create(createEnemyImage(), SpriteKind.Enemy);
    sprite.setPosition(x, y);
    
    const ai: EnemyAI = {
        sprite: sprite,
        state: EnemyState.Patrol,
        homeX: x,
        homeY: y,
        patrolRadius: patrolRadius,
        noticeRange: 60,
        chaseSpeed: 40,
        patrolSpeed: 20,
        lastStateChange: game.runtime(),
        stunnedUntil: 0
    };
    
    enemies.push(ai);
    registerAIUpdate();
    
    return sprite;
}

function registerAIUpdate(): void {
    if (aiUpdateRegistered) return;
    aiUpdateRegistered = true;
    
    game.onUpdateInterval(200, function () {
        const mode = getState().mode;
        if (mode !== GameMode.Hub && mode !== GameMode.Dungeon) return;
        
        for (let ai of enemies) {
            if (!ai.sprite || ai.sprite.flags & SpriteFlag.Destroyed) continue;
            updateEnemyAI(ai);
        }
    });
}

function updateEnemyAI(ai: EnemyAI): void {
    const now = game.runtime();
    
    // Check if stunned
    if (now < ai.stunnedUntil) {
        ai.state = EnemyState.Stunned;
        ai.sprite.vx = 0;
        ai.sprite.vy = 0;
        return;
    } else if (ai.state === EnemyState.Stunned) {
        ai.state = EnemyState.Patrol;
        ai.lastStateChange = now;
    }
    
    const player = getPlayer();
    if (!player) return;
    
    const distToPlayer = Math.sqrt(
        Math.pow(player.x - ai.sprite.x, 2) + 
        Math.pow(player.y - ai.sprite.y, 2)
    );
    
    const distToHome = Math.sqrt(
        Math.pow(ai.homeX - ai.sprite.x, 2) + 
        Math.pow(ai.homeY - ai.sprite.y, 2)
    );
    
    // State transitions
    switch (ai.state) {
        case EnemyState.Patrol:
            if (distToPlayer < ai.noticeRange) {
                ai.state = EnemyState.Notice;
                ai.lastStateChange = now;
                ai.sprite.say("[!]", 300);
            } else {
                doPatrol(ai, distToHome);
            }
            break;
            
        case EnemyState.Notice:
            if (now - ai.lastStateChange > 500) {
                ai.state = EnemyState.Chase;
                ai.lastStateChange = now;
            }
            ai.sprite.vx = 0;
            ai.sprite.vy = 0;
            break;
            
        case EnemyState.Chase:
            if (distToPlayer > ai.noticeRange * 2) {
                ai.state = EnemyState.Retreat;
                ai.lastStateChange = now;
            } else if (distToPlayer < 12) {
                // Hit player
                damagePlayer(ai);
                ai.state = EnemyState.Retreat;
                ai.lastStateChange = now;
            } else {
                doChase(ai, player);
            }
            break;
            
        case EnemyState.Retreat:
            if (distToHome < 5) {
                ai.state = EnemyState.Patrol;
                ai.lastStateChange = now;
                ai.sprite.vx = 0;
                ai.sprite.vy = 0;
            } else {
                doRetreat(ai);
            }
            break;
    }
}

function doPatrol(ai: EnemyAI, distToHome: number): void {
    // Simple circular patrol
    if (distToHome > ai.patrolRadius) {
        // Return to home
        const dx = ai.homeX - ai.sprite.x;
        const dy = ai.homeY - ai.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        ai.sprite.vx = (dx / dist) * ai.patrolSpeed;
        ai.sprite.vy = (dy / dist) * ai.patrolSpeed;
    } else {
        // Random walk
        if (Math.percentChance(10)) {
            ai.sprite.vx = Math.randomRange(-ai.patrolSpeed, ai.patrolSpeed);
            ai.sprite.vy = Math.randomRange(-ai.patrolSpeed, ai.patrolSpeed);
        }
    }
}

function doChase(ai: EnemyAI, player: Sprite): void {
    ai.sprite.follow(player, ai.chaseSpeed);
}

function doRetreat(ai: EnemyAI): void {
    const dx = ai.homeX - ai.sprite.x;
    const dy = ai.homeY - ai.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
        ai.sprite.vx = (dx / dist) * ai.chaseSpeed;
        ai.sprite.vy = (dy / dist) * ai.chaseSpeed;
    }
}

function damagePlayer(ai: EnemyAI): void {
    adjustHearts(-1);
    const player = getPlayer();
    if (player) {
        player.startEffect(effects.fire, 200);
        // Knockback
        const dx = player.x - ai.sprite.x;
        const dy = player.y - ai.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            player.vx = (dx / dist) * 60;
            player.vy = (dy / dist) * 60;
        }
    }
}

function stunEnemy(enemy: Sprite, durationMs: number): void {
    const ai = enemies.find(e => e.sprite === enemy);
    if (ai) {
        ai.stunnedUntil = game.runtime() + durationMs;
        ai.state = EnemyState.Stunned;
    }
}

function cleanupEnemies(): void {
    for (let ai of enemies) {
        if (ai.sprite) {
            ai.sprite.destroy();
        }
    }
    enemies.length = 0;
}

// MANUAL TEST PASSED: AI system scaffold ready (not yet spawned in dungeons)
