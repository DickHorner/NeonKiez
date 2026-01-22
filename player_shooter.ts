// Player Shooter Mode: Top-down shooter controls and bullet spawning
// NOTE: Focused module for shooter mode player mechanics (Dungeon 2)

const SHOOTER_BULLET_SPEED_Y = -100;

function initShooterPlayer(player: Sprite) {
  controller.moveSprite(player, PLAYER_SHOOTER_SPEED, PLAYER_SHOOTER_SPEED);

  // Shoot
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_SHOOTER) return;
    shootBullet();
  });
}

function shootBullet() {
  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr) return;

  // Cap check
  if (sprites.allOfKind(KIND_PROJECTILE).length >= CAP_MAX_PROJECTILES) return;

  const bullet = sprites.createProjectileFromSprite(
    imgProjectile("BULLET"),
    plyr,
    0,
    SHOOTER_BULLET_SPEED_Y,
  );
  bullet.setKind(KIND_PROJECTILE);
  bullet.lifespan = 2000;

  sfxShoot();
}

// MANUAL TEST PASSED: Shooter player controls complete
