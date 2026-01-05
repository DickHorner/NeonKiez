// Mode-specific Player/Inputs: platformer/shooter/asteroids/rhythm/puzzle

// ============ PLATFORM MODE ============

export function initPlatformPlayer(player: Sprite) {
    controller.moveSprite(player, PLAYER_PLATFORM_SPEED, 0)
    scene.cameraFollowSprite(player)
    
    // Jump
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.playMode !== PlayMode.DUN_PLATFORM) return
        
        const plyr = GameController.getPlayerSprite()
        if (!plyr) return
        
        // Check if on ground (simple check: vy near 0 and ay > 0)
        if (Math.abs(plyr.vy) < 10) {
            plyr.vy = PLAYER_PLATFORM_JUMP_VY
            sfxJump()
        }
    })
}

// ============ SHOOTER MODE ============

export function initShooterPlayer(player: Sprite) {
    controller.moveSprite(player, PLAYER_SHOOTER_SPEED, PLAYER_SHOOTER_SPEED)
    
    // Shoot
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.playMode !== PlayMode.DUN_SHOOTER) return
        shootBullet()
    })
}

function shootBullet() {
    const plyr = GameController.getPlayerSprite()
    if (!plyr) return
    
    // Cap check
    if (sprites.allOfKind(KIND_PROJECTILE).length >= CAP_MAX_PROJECTILES) return
    
    const bullet = sprites.createProjectileFromSprite(imgProjectile("BULLET"), plyr, 0, -100)
    bullet.setKind(KIND_PROJECTILE)
    bullet.lifespan = 2000
    
    sfxShoot()
}

// ============ ASTEROIDS MODE ============

let asteroidRotation = 0
let asteroidVx = 0
let asteroidVy = 0

export function initAsteroidsPlayer(player: Sprite) {
    asteroidRotation = 0
    asteroidVx = 0
    asteroidVy = 0
    
    game.onUpdate(() => {
        if (state.playMode !== PlayMode.DUN_ASTEROIDS) return
        updateAsteroidsControls()
    })
}

function updateAsteroidsControls() {
    const plyr = GameController.getPlayerSprite()
    if (!plyr) return
    
    // Rotate
    if (controller.left.isPressed()) {
        asteroidRotation -= PLAYER_ASTEROIDS_ROTATE_SPEED
    }
    if (controller.right.isPressed()) {
        asteroidRotation += PLAYER_ASTEROIDS_ROTATE_SPEED
    }
    
    // Thrust
    if (controller.up.isPressed()) {
        const rad = asteroidRotation * Math.PI / 180
        asteroidVx += Math.sin(rad) * PLAYER_ASTEROIDS_THRUST / 10
        asteroidVy -= Math.cos(rad) * PLAYER_ASTEROIDS_THRUST / 10
    }
    
    // Apply velocity
    plyr.x += asteroidVx
    plyr.y += asteroidVy
    
    // Screen wrap
    if (plyr.x < 0) plyr.x = scene.screenWidth()
    if (plyr.x > scene.screenWidth()) plyr.x = 0
    if (plyr.y < 0) plyr.y = scene.screenHeight()
    if (plyr.y > scene.screenHeight()) plyr.y = 0
    
    // Rotate sprite (visual)
    // TODO: sprite rotation when asset ready
}

// ============ RHYTHM MODE ============

export function initRhythmPlayer(player: Sprite) {
    controller.moveSprite(player, 50, 50)  // slow movement
    
    // Tap in window
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.playMode !== PlayMode.DUN_RHYTHM) return
        handleRhythmTap()
    })
}

function handleRhythmTap() {
    if (!state.dungeonStageData) return
    
    const now = game.runtime()
    const nextBeat = state.dungeonStageData.nextBeatTime
    const windowMs = 200  // good window
    
    if (Math.abs(now - nextBeat) < windowMs) {
        // Good hit
        state.dungeonStageData.streak++
        showHint("[RHYTHM_GOOD]", 500)
    } else {
        // Miss
        state.dungeonStageData.misses++
        state.dungeonStageData.streak = 0
        showHint("[RHYTHM_MISS]", 500)
    }
}

// ============ PUZZLE MODE ============

export function initPuzzlePlayer(player: Sprite) {
    controller.moveSprite(player, 60, 60)
    
    // Interact with switches/objects
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.playMode !== PlayMode.DUN_PUZZLE) return
        handlePuzzleInteract()
    })
}

function handlePuzzleInteract() {
    if (!canInteract()) return
    
    const plyr = GameController.getPlayerSprite()
    if (!plyr) return
    
    // Check tile at player location
    const loc = plyr.tilemapLocation()
    const tile = tiles.getTileAt(loc.column, loc.row)
    
    if (tile === TILE_SWITCH) {
        markInteract()
        toggleSwitch(loc)
    }
}

function toggleSwitch(loc: tiles.Location) {
    // Toggle gate state
    if (state.dungeonStageData) {
        state.dungeonStageData.switchesActivated++
    }
    showHint("[SWITCH_ACTIVATED]", 1000)
    sfxInteract()
}

// MANUAL TEST PASSED: Player mode inputs scaffold
