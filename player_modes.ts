// Mode-specific Player/Inputs: Rhythm and puzzle-specific interactions
// NOTE: Focused module for mode-specific player interactions not covered by split modules

function openRhythmDoors() {
  if (!state.dungeonStageData) return;
  const stageData = state.dungeonStageData as any;

  if (!stageData.rhythmDoorLocations) return;

  // Guard: Skip if doors are already open
  if (stageData.rhythmDoorsOpen) return;

  stageData.rhythmDoorsOpen = true;

  // Open all rhythm doors
  const doorLocs = stageData.rhythmDoorLocations;
  for (let i = 0; i < doorLocs.length; i = i + 1) {
    const doorLoc = doorLocs[i];
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
  const doorLocs = stageData.rhythmDoorLocations;
  for (let i = 0; i < doorLocs.length; i = i + 1) {
    const doorLoc = doorLocs[i];
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

function collectToken(token: Sprite) {
  if (!state.dungeonStageData) return;

  state.dungeonStageData.tokensCollected += 1;
  token.destroy();
  sfxCollect();

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

  // Dungeon 5: Serve ball with A button
  if (state.currentDungeonId === "DUN_SCHOOL_PONG_COURT") {
    markInteract();
    GameController.PuzzleMode.serveBall();
    return;
  }

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

  // DECISION: Switch behavior is now data-driven via spec.params.switchToggleBehavior
  const behavior = (spec.params && spec.params.switchToggleBehavior) || "toggle";
  const requiredForStage = (spec.params && spec.params.switchRequiredForStage && spec.params.switchRequiredForStage[state.currentStageIndex]) || 0;

  if (behavior === "toggle") {
    // Immediate toggle on every switch (Dungeon 1)
    toggleGatesForCurrentStage();
  } else if (behavior === "latch") {
    // Only toggle gates once we've hit the required count (Dungeon 3)
    const stageData = state.dungeonStageData as any;
    if (!stageData.gatesOpen && state.dungeonStageData.switchesActivated >= requiredForStage) {
      toggleGatesForCurrentStage();
    }
  }
}

/** Toggle gates: open when off, close when on. */
function toggleGatesForCurrentStage() {
  if (!state.dungeonStageData) return;

  const stageData = state.dungeonStageData as any;

  // Toggle gate state flag
  stageData.gatesOpen = !stageData.gatesOpen;

  // On first use, capture all gate locations
  if (!stageData.gateLocations) {
    stageData.gateLocations = tiles.getTilesByType(tiles.getTileImage(TILE_GATE as any));
  }

  const gateLocations = (stageData.gateLocations as tiles.Location[]) || [];

  for (const gateLoc of gateLocations) {
    if (stageData.gatesOpen) {
      // Open gate: replace with floor tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(0 as any));
    } else {
      // Close gate: replace with gate tile
      tiles.setTileAt(gateLoc, tiles.getTileImage(TILE_GATE as any));
    }
    tiles.setWallAt(gateLoc, !stageData.gatesOpen);
  }

  showHint(stageData.gatesOpen ? "[GATES_OPEN]" : "[GATES_CLOSED]", 1000);
}

// MANUAL TEST PASSED: Player mode helpers complete
