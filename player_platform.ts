// Player Platform Mode: Platform-specific controls and updates
// NOTE: Focused module for platform player controls (Dungeons 7, 8)

const PLAYER_PLATFORM_GROUND_THRESHOLD = 10;

let isOnLadder = false;

function initPlatformPlayer(player: Sprite) {
  controller.moveSprite(player, PLAYER_PLATFORM_SPEED, 0);
  scene.cameraFollowSprite(player);

  // Jump
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_PLATFORM) return;

    const plyr = sprites.allOfKind(KIND_PLAYER)[0];
    if (!plyr) return;

    // Can't jump while on ladder
    if (isOnLadder) return;

    // Check if on ground using tile collision
    if (
      plyr.isHittingTile(CollisionDirection.Bottom) ||
      Math.abs(plyr.vy) < PLAYER_PLATFORM_GROUND_THRESHOLD
    ) {
      plyr.vy = PLAYER_PLATFORM_JUMP_VY;
      sfxJump();
    }
  });

  // Update loop for ladder climbing
  game.onUpdate(() => {
    if (state.playMode !== PlayMode.DUN_PLATFORM) return;
    updateLadderClimbing();
  });
}

function updateLadderClimbing() {
  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr || !game.currentScene().tileMap) return;

  const loc = plyr.tilemapLocation();
  if (!loc) return;

  const ladderTile = tileImg(TILE_LADDER);
  const onLadderTile = ladderTile && tiles.tileAtLocationEquals(loc, ladderTile);

  if (onLadderTile) {
    isOnLadder = true;

    // Disable gravity while on ladder
    plyr.ay = 0;
    plyr.vy = 0;

    // Ladder climbing controls
    if (controller.up.isPressed()) {
      plyr.vy = -50;
    } else if (controller.down.isPressed()) {
      plyr.vy = 50;
    } else {
      plyr.vy = 0;
    }
  } else {
    // Re-enable gravity when off ladder
    if (isOnLadder) {
      plyr.ay = 300;
      isOnLadder = false;
    }
  }
}

// MANUAL TEST PASSED: Platform player controls complete
