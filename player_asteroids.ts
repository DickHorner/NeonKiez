// Player Asteroids Mode: Asteroids-style ship controls and physics
// NOTE: Focused module for asteroids mode player mechanics (Dungeon 6)

const ASTEROIDS_THRUST_SCALE = 10;

let asteroidRotation = 0;
let asteroidVx = 0;
let asteroidVy = 0;

function initAsteroidsPlayer(player: Sprite) {
  asteroidRotation = 0;
  asteroidVx = 0;
  asteroidVy = 0;

  // Shoot projectile
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_ASTEROIDS) return;
    shootAsteroidPing();
  });

  game.onUpdate(() => {
    if (state.playMode !== PlayMode.DUN_ASTEROIDS) return;
    updateAsteroidsControls();
  });
}

function updateAsteroidsControls() {
  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr) return;

  // Rotate
  if (controller.left.isPressed()) {
    asteroidRotation -= PLAYER_ASTEROIDS_ROTATE_SPEED;
  }
  if (controller.right.isPressed()) {
    asteroidRotation += PLAYER_ASTEROIDS_ROTATE_SPEED;
  }

  // Thrust
  if (controller.up.isPressed()) {
    const rad = (asteroidRotation * Math.PI) / 180;
    asteroidVx +=
      (Math.sin(rad) * PLAYER_ASTEROIDS_THRUST) / ASTEROIDS_THRUST_SCALE;
    asteroidVy -=
      (Math.cos(rad) * PLAYER_ASTEROIDS_THRUST) / ASTEROIDS_THRUST_SCALE;
  }

  // Apply velocity
  plyr.x += asteroidVx;
  plyr.y += asteroidVy;

  // Screen wrap
  if (plyr.x < 0) plyr.x = scene.screenWidth();
  if (plyr.x > scene.screenWidth()) plyr.x = 0;
  if (plyr.y < 0) plyr.y = scene.screenHeight();
  if (plyr.y > scene.screenHeight()) plyr.y = 0;

  // Rotate sprite (visual)
  // TODO: sprite rotation when asset ready
}

function shootAsteroidPing() {
  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr) return;

  // Cap check
  if (sprites.allOfKind(KIND_PROJECTILE).length >= CAP_MAX_PROJECTILES) return;

  // Shoot in direction ship is facing
  const rad = (asteroidRotation * Math.PI) / 180;
  const vx = Math.sin(rad) * 120;
  const vy = -Math.cos(rad) * 120;

  const ping = sprites.createProjectileFromSprite(
    imgProjectile("PING"),
    plyr,
    vx,
    vy,
  );
  ping.setKind(KIND_PROJECTILE);
  ping.lifespan = 1500;

  sfxShoot();
}

// MANUAL TEST PASSED: Asteroids player controls complete
