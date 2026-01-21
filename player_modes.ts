// Mode-specific Player/Inputs: platformer/shooter/asteroids/rhythm/puzzle
// NOTE: Uses Arcade globals (controller, sprites, tiles, game); imports not required in Arcade projects.

const PLAYER_PLATFORM_GROUND_THRESHOLD = 10;
const RHYTHM_GOOD_WINDOW_MS = 200;
const SHOOTER_BULLET_SPEED_Y = -100;
const ASTEROIDS_THRUST_SCALE = 10;

// ============ PLATFORM MODE ============

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

  const ladderTile = tiles.getTileImage(TILE_LADDER as any);
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

// ============ SHOOTER MODE ============

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

// ============ ASTEROIDS MODE ============

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

// ============ RHYTHM MODE ============

function initRhythmPlayer(player: Sprite) {
  controller.moveSprite(player, 50, 50); // slow movement

  // Tap in window
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_RHYTHM) return;
    handleRhythmTap();
  });
}

function handleRhythmTap() {
  if (!state.dungeonStageData) return;

  const now = game.runtime();
  const nextBeat = state.dungeonStageData.nextBeatTime;
  const windowMs = 200; // good window

  const isGoodHit = Math.abs(now - nextBeat) < windowMs;

  if (isGoodHit) {
    // Good hit - increment streak
    state.dungeonStageData.streak += 1;
    showHint("[RHYTHM_GOOD]", 500);
    sfxInteract();

    // Stage-specific mechanics on good hit
    const stageIndex = state.dungeonStageData.stageIndex;
    
    // Stage 1: Open rhythm doors on good hit
    if (stageIndex === 1) {
      openRhythmDoors();
    }
    
    // Stage 2-3: Activate switches on good hit (if near one)
    if (stageIndex === 2 || stageIndex === 3) {
      activateNearbyRhythmSwitch();
    }
  } else {
    // Miss - increment misses, reset streak
    state.dungeonStageData.misses += 1;
    state.dungeonStageData.streak = 0;
    showHint("[RHYTHM_MISS]", 500);
    
    // Stage 1: Close rhythm doors on miss
    const stageIndex = state.dungeonStageData.stageIndex;
    if (stageIndex === 1) {
      closeRhythmDoors();
    }
  }
}

function openRhythmDoors() {
  if (!state.dungeonStageData) return;
  const stageData = state.dungeonStageData as any;
  
  if (!stageData.rhythmDoorLocations) return;
  
  // Guard: Skip if doors are already open
  if (stageData.rhythmDoorsOpen) return;
  
  stageData.rhythmDoorsOpen = true;
  
  // Open all rhythm doors
  for (const doorLoc of stageData.rhythmDoorLocations) {
    tiles.setTileAt(doorLoc, tiles.getTileImage(0 as any)); // Floor tile
    tiles.setWallAt(doorLoc, false);
  }
  
  showHint("[RHYTHM_DOORS_OPEN]", 1000);
}

function closeRhythmDoors() {
  if (!state.dungeonStageData) return;
  const stageData = state.dungeonStageData as any;
  
  if (!stageData.rhythmDoorLocations) return;
  
  // Guard: Skip if doors are already closed
  if (!stageData.rhythmDoorsOpen) return;
  
  stageData.rhythmDoorsOpen = false;
  
  // Close all rhythm doors
  for (const doorLoc of stageData.rhythmDoorLocations) {
    tiles.setTileAt(doorLoc, tiles.getTileImage(TILE_GATE as any));
    tiles.setWallAt(doorLoc, true);
  }
  
  showHint("[RHYTHM_DOORS_CLOSED]", 500);
}

function activateNearbyRhythmSwitch() {
  if (!state.dungeonStageData) return;
  
  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr) return;
  
  // Check if player is near a switch
  const loc = plyr.tilemapLocation();
  if (!loc) return;
  
  const switchTile = tiles.getTileImage(TILE_SWITCH as any);
  if (!switchTile) return;
  
  // Check current tile and adjacent tiles
  const nearbyLocs = [
    loc,
    tiles.getTileLocation(loc.column - 1, loc.row),
    tiles.getTileLocation(loc.column + 1, loc.row),
    tiles.getTileLocation(loc.column, loc.row - 1),
    tiles.getTileLocation(loc.column, loc.row + 1),
  ];
  
  for (const nearLoc of nearbyLocs) {
    if (nearLoc && tiles.tileAtLocationEquals(nearLoc, switchTile)) {
      // Activate switch
      state.dungeonStageData.switchesActivated += 1;
      // Change tile to activated state (use different tile)
      tiles.setTileAt(nearLoc, tiles.getTileImage(2 as any)); // Activated switch tile
      showHint("[RHYTHM_SWITCH_ACTIVATED]", 500);
      sfxInteract();
      return;
    }
  }
}

// ============ PUZZLE MODE ============

function initPuzzlePlayer(player: Sprite) {
  controller.moveSprite(player, 60, 60);

  // Interact with switches/objects
  controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    if (state.playMode !== PlayMode.DUN_PUZZLE) return;
    handlePuzzleInteract();
  });

  // NOTE: Overlap handlers are registered globally in registerGlobalHandlers() to avoid memory leaks
}

function collectToken(token: Sprite) {
  if (!state.dungeonStageData) return;
  
  state.dungeonStageData.tokensCollected += 1;
  token.destroy();
  sfxCollect();
  
  // DECISION: Use a static placeholder ID and let HUD/localization render collected/required instead of encoding them into the ID.
  showHint("[TOKEN_COLLECTED]", 1000);
}

function handleGhostBotCollision(player: Sprite, enemy: Sprite) {
  // Harmless stun: knockback + i-frames
  damagePlayer(0); // Sets i-frames but no damage
  
  // Knockback
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 0) {
    player.vx = (dx / dist) * 50;
    player.vy = (dy / dist) * 50;
  }
  
  showHint("[GHOST_BOT_BUMPED]", 500);
}

function handlePuzzleInteract() {
  if (!canInteract()) return;

  const plyr = sprites.allOfKind(KIND_PLAYER)[0];
  if (!plyr) return;

  // Check tile at player location
  const loc = plyr.tilemapLocation();
  if (!loc || !game.currentScene().tileMap) return;

  const switchTile = tiles.getTileImage(TILE_SWITCH as any);
  if (switchTile && tiles.tileAtLocationEquals(loc, switchTile)) {
    markInteract();
    toggleSwitch(loc);
  }
}

/** Data-driven switch activation that dispatches to appropriate behavior based on spec params. */
function toggleSwitch(loc: tiles.Location) {
  if (!state.dungeonStageData) return;

  const spec = getDungeonSpec(state.currentDungeonId);
  if (!spec) return;

  state.dungeonStageData.switchesActivated += 1;

  // DECISION: Switch behavior is now data-driven via spec.params.switchToggleBehavior:
  // - "toggle": immediate toggle of gates (Dungeon 1)
  // - "latch": gates open only after switchRequiredForStage threshold (Dungeon 3)
  const behavior = spec.params?.switchToggleBehavior || "toggle";
  const requiredForStage = spec.params?.switchRequiredForStage?.[state.currentStageIndex] || 0;

  if (behavior === "toggle") {
    // Immediate toggle on every switch (Dungeon 1)
    toggleGatesForDungeon01();
  } else if (behavior === "latch") {
    // Only toggle gates once we've hit the required count (Dungeon 3)
    const stageData = state.dungeonStageData as any;
    if (!stageData.gatesOpen && state.dungeonStageData.switchesActivated >= requiredForStage) {
      toggleGatesForDungeon03();
    }
  }
}

/** Legacy: Kept for backward compatibility. */
function toggleGatesForCurrentStage() {
  // DECISION: Legacy helper kept for compatibility only.
  toggleGatesForDungeon01();
}

/** Legacy: Kept for backward compatibility. */
function toggleGatesForDungeon01() {
  if (!state.dungeonStageData) return;
  
  // DECISION: Use dungeonStageData as a loose bag for per-stage runtime data (gateLocations).
  const stageData = state.dungeonStageData as any;

  // Toggle gate state flag
  stageData.gatesOpen = !stageData.gatesOpen;

  // On first use, capture all gate locations so we can reliably toggle them later,
  // even after their tile image has been changed.
  if (!stageData.gateLocations) {
    stageData.gateLocations = tiles.getTilesByType(tiles.getTileImage(TILE_GATE as any));
  }

  const gateLocations = (stageData.gateLocations as tiles.Location[]) || [];

  for (const gateLoc of gateLocations) {
    if (stageData.gatesOpen) {
      // Open gate: replace with floor tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(0 as any)); // Floor tile (placeholder)
    } else {
      // Close gate: replace with gate tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(TILE_GATE as any));
    }
    tiles.setWallAt(gateLoc, !stageData.gatesOpen);
  }

  showHint(stageData.gatesOpen ? "[GATES_OPEN]" : "[GATES_CLOSED]", 1000);
}

function toggleGatesForDungeon03() {
  if (!state.dungeonStageData) return;
  
  // DECISION: Use dungeonStageData as a loose bag for per-stage runtime data (gateLocations).
  const stageData = state.dungeonStageData as any;

  // Toggle gate state flag
  stageData.gatesOpen = !stageData.gatesOpen;

  // On first use, capture all gate locations so we can reliably toggle them later,
  // even after their tile image has been changed.
  if (!stageData.gateLocations) {
    stageData.gateLocations = tiles.getTilesByType(tiles.getTileImage(TILE_GATE as any));
  }

  const gateLocations = (stageData.gateLocations as tiles.Location[]) || [];

  for (const gateLoc of gateLocations) {
    if (stageData.gatesOpen) {
      // Open gate: replace with floor tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(0 as any)); // Floor tile (placeholder)
    } else {
      // Close gate: replace with gate tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(TILE_GATE as any));
    }
    tiles.setWallAt(gateLoc, !stageData.gatesOpen);
  }

  showHint(stageData.gatesOpen ? "[GATES_OPEN]" : "[GATES_CLOSED]", 1000);
}

// MANUAL TEST PASSED: Player mode inputs scaffold
