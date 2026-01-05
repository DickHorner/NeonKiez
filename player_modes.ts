// Mode-specific Player/Inputs: platformer/shooter/asteroids/rhythm/puzzle
// NOTE: Uses Arcade globals (controller, sprites, tiles, game); imports not required in Arcade projects.

const PLAYER_PLATFORM_GROUND_THRESHOLD = 10
const RHYTHM_GOOD_WINDOW_MS = 200
const SHOOTER_BULLET_SPEED_Y = -100
const ASTEROIDS_THRUST_SCALE = 10

// ============ PLATFORM MODE ============

function initPlatformPlayer(player: Sprite) {
    controller.moveSprite(player, PLAYER_PLATFORM_SPEED, 0)
    scene.cameraFollowSprite(player)
    
    // Jump
    controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
        if (state.playMode !== PlayMode.DUN_PLATFORM) return
        
        const plyr = GameController.getPlayerSprite()
        if (!plyr) return
        
        // Check if on ground using tile collision
        if (plyr.isHittingTile(CollisionDirection.Bottom) || Math.abs(plyr.vy) < PLAYER_PLATFORM_GROUND_THRESHOLD) {
            plyr.vy = PLAYER_PLATFORM_JUMP_VY
            sfxJump()
        }
    })
}

// ============ SHOOTER MODE ============

function initShooterPlayer(player: Sprite) {
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
    
    const bullet = sprites.createProjectileFromSprite(imgProjectile("BULLET"), plyr, 0, SHOOTER_BULLET_SPEED_Y)
    bullet.setKind(KIND_PROJECTILE)
    bullet.lifespan = 2000
    
    sfxShoot()
}

// ============ ASTEROIDS MODE ============

let asteroidRotation = 0
let asteroidVx = 0
let asteroidVy = 0

function initAsteroidsPlayer(player: Sprite) {
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
        asteroidVx += Math.sin(rad) * PLAYER_ASTEROIDS_THRUST / ASTEROIDS_THRUST_SCALE
        asteroidVy -= Math.cos(rad) * PLAYER_ASTEROIDS_THRUST / ASTEROIDS_THRUST_SCALE
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

function initRhythmPlayer(player: Sprite) {
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

function initPuzzlePlayer(player: Sprite) {
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
    if (!loc || !game.currentScene().tileMap) return

    const switchTile = tiles.getTileImage(TILE_SWITCH)
    if (switchTile && tiles.tileAtLocationEquals(loc, switchTile)) {
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
