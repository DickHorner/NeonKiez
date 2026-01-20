// Placeholder Assets: Factories for sprites/tilemaps/sounds (humans will replace)
// ============ SPRITES ============

function imgPlayerTopdown(): Image {
  return image.create(16, 16); // placeholder: solid square
}

function imgPlatformPlayer(): Image {
  return image.create(16, 16);
}

function imgShooterShip(): Image {
  return image.create(16, 16);
}

function imgAsteroidsShip(): Image {
  return image.create(12, 12);
}

function imgRhythmPlayer(): Image {
  return image.create(16, 16);
}

function imgPuzzlePlayer(): Image {
  return image.create(16, 16);
}

function imgNpc(id: string): Image {
  return image.create(16, 16);
}

function imgDoor(id: string): Image {
  return image.create(16, 16);
}

function imgEnemy(id: string): Image {
  return image.create(16, 16);
}

function imgProjectile(id: string): Image {
  return image.create(4, 4);
}

function imgDebris(size: number): Image {
  return image.create(size, size);
}

function imgCollectible(id: string): Image {
  return image.create(8, 8);
}

function imgToolEffect(toolId: string): Image {
  return image.create(16, 16);
}

// ============ TILEMAPS ============

function createEmptyTilemap(): tiles.TileMapData {
  // Single-tile placeholder to avoid null references at runtime
  return tiles.createTilemap(hex`0`, img`.`, [], TileScale.Sixteen);
}

// Hub rooms (3x3 grid)
function tmHub00(): tiles.TileMapData {
  // Hub room (0,0) - Contains Dungeon 1 door
  return tiles.createTilemap(
    hex`10000c00010101010101010101010101010101010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000400000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010101010101010101010101010101010101`,
    img`
. . . . . . . . . . . . . . . . 
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . d . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. . . . . . . . . . . . . . . . 
`,
    [
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath5,
      sprites.builtin.forestTiles0,
      sprites.castle.tilePath4,
    ],
    TileScale.Sixteen
  );
}
function tmHub01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub10(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub11(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub12(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub20(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmHub21(): tiles.TileMapData {
  // Hub room (2,1) - Contains Dungeon 7 door (Video Store)
  return tiles.createTilemap(
    hex`10000c00010101010101010101010101010101010101010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000400000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010100000000000000000000000000010101010101010101010101010101010101`,
    img`
. . . . . . . . . . . . . . . . 
. 2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . d . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. 2 . . . . . . . . . . . . 2 . 
. . . . . . . . . . . . . . . . 
`,
    [
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath5,
      sprites.builtin.forestTiles0,
      sprites.castle.tilePath4,
    ],
    TileScale.Sixteen
  );
}
function tmHub22(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 1 stages
function tmDun01Stage00(): tiles.TileMapData {
  // Stage 0: WARMUP - Tutorial corridor with switch and door
  return tiles.createTilemap(
    hex`10000a00030303030303030303030303030303030300000000000000000000000003030300000000000000000000000003030300000000000000090000000003030300000000000a0a0a0a000000000303030000000000000000000000000003030300000000000000000000000003030300000000000000000000070000030303030303030303030303030303030303030300000001000000000000000303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 2 . . . . . . . . . . . . . 2 
2 2 . . . . . . . . . . . . . 2 
2 2 . . . . . . . 9 . . . . . 2 
2 2 . . . . . . 6 6 6 6 . . . 2 
2 2 . . . . . . . . . . . . . 2 
2 2 . . . . . . . . . . . . . 2 
2 2 . . . . . . . . . . . 7 . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 2 2 . . . . 1 . . . . . . . 2 
`,
    [
      sprites.dungeon.floorLight0,
      sprites.dungeon.greenSwitchUp,
      sprites.dungeon.purpleOuterNorthWest,
      sprites.dungeon.purpleOuterSouth0,
      sprites.dungeon.purpleOuterEast0,
      sprites.dungeon.purpleOuterNorth0,
      sprites.dungeon.stairNorth,
      sprites.dungeon.chestClosed,
      sprites.dungeon.doorClosedNorth,
      sprites.dungeon.buttonTeal,
      sprites.dungeon.purpleOuterWest0,
    ],
    TileScale.Sixteen
  );
}
function tmDun01Stage01(): tiles.TileMapData {
  // Stage 1: DARK_MAZE - Light switches toggle visibility
  return tiles.createTilemap(
    hex`10000a00030303030303030303030303030303000200000000000000000000000303000000030303030300000000000303000000030000000300000000000303000900030000090300000000000303000000030000000300000000000303000000030303030300000000000303000000000000000000000000000303000000000000000000000007000303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 1 . . . . . . . . . . . . . 2 
2 . . . . 2 2 2 2 2 2 . . . . 2 
2 . . . . 2 . . . . 2 . . . . 2 
2 9 . . 2 . . . 9 2 . . . . . 2 
2 . . . . 2 . . . . 2 . . . . 2 
2 . . . . 2 2 2 2 2 2 . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . 7 . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.dungeon.floorLight0,
      sprites.dungeon.greenSwitchUp,
      sprites.dungeon.purpleOuterNorthWest,
      sprites.dungeon.purpleOuterSouth0,
      sprites.dungeon.purpleOuterEast0,
      sprites.dungeon.purpleOuterNorth0,
      sprites.dungeon.stairNorth,
      sprites.dungeon.chestClosed,
      sprites.dungeon.doorClosedNorth,
      sprites.dungeon.buttonTeal,
      sprites.dungeon.purpleOuterWest0,
    ],
    TileScale.Sixteen
  );
}
function tmDun01Stage02(): tiles.TileMapData {
  // Stage 2: TOKEN_RUN - Collect 5 tokens with Ghost-Bot patrol
  return tiles.createTilemap(
    hex`10000a00030303030303030303030303030303000200000000000000000000000303000000000b000000000b000000000303000000000000000000000000000303000000000b000000000b000000000303000000000000000000000000000303000000000b000000000b000000000303000000000000000000000000000303000000000000000000000007000303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 1 . . . . . . . . . . . . . 2 
2 . . . . . b . . . . . . b . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . b . . . . . . b . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . b . . . . . . b . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . 7 . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.dungeon.floorLight0,
      sprites.dungeon.greenSwitchUp,
      sprites.dungeon.purpleOuterNorthWest,
      sprites.dungeon.purpleOuterSouth0,
      sprites.dungeon.purpleOuterEast0,
      sprites.dungeon.purpleOuterNorth0,
      sprites.dungeon.stairNorth,
      sprites.dungeon.chestClosed,
      sprites.dungeon.doorClosedNorth,
      sprites.dungeon.buttonTeal,
      sprites.dungeon.purpleOuterWest0,
      sprites.builtin.coin1,
    ],
    TileScale.Sixteen
  );
}
function tmDun01Stage03(): tiles.TileMapData {
  // Stage 3: EXIT_ROOM - Final gate puzzle
  return tiles.createTilemap(
    hex`10000a00030303030303030303030303030303000200000000000000000000000303000000000000000000000000000303000000000000090000000000000303000a0a0a0a0a0a0a0a0a0a0a0a0a030300000000000000000000000000030300000000000000000000000000030300000000000000000000000007030303030303030303030303030303030303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 1 . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . 9 . . . . . 2 
2 6 6 6 6 6 6 6 6 6 6 6 6 6 6 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . 7 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.dungeon.floorLight0,
      sprites.dungeon.greenSwitchUp,
      sprites.dungeon.purpleOuterNorthWest,
      sprites.dungeon.purpleOuterSouth0,
      sprites.dungeon.purpleOuterEast0,
      sprites.dungeon.purpleOuterNorth0,
      sprites.dungeon.stairNorth,
      sprites.dungeon.chestClosed,
      sprites.dungeon.doorClosedNorth,
      sprites.dungeon.buttonTeal,
      sprites.dungeon.purpleOuterWest0,
    ],
    TileScale.Sixteen
  );
}

// Dungeon 2 stages
function tmDun02Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun02Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun02Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun02Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 3 stages
function tmDun03Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun03Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun03Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun03Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 4 stages
function tmDun04Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun04Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun04Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun04Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 5 stages
function tmDun05Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun05Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun05Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun05Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 6 stages
function tmDun06Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun06Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun06Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun06Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 7 stages
function tmDun07Stage00(): tiles.TileMapData {
  // Stage 0: JUMP - Basic jumps, safe platforms
  // Simple platformer tutorial: jump across gaps to reach goal
  return tiles.createTilemap(
    hex`14000a00030303030303030303030303030303030303030300000000000000000000000000000000000000030300000000000000000000000000000000000003030000000000000000000000000700000000000303030303030303030000000000000000000000030300000000000000000303030303030000000003030000000000000000030300000000000000000303030000000000000000030300000007000000030303030303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . 7 . . . . . 2 
2 2 2 2 2 2 2 2 . . . . . . . . . . . 2 
2 . . . . . . . . 2 2 2 2 2 2 . . . . 2 
2 . . . . . . . . 2 . . . . . . . . . 2 
2 . . . . . . . . 2 . . . 7 . . . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.castle.tilePath5,
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass3,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath4,
      sprites.builtin.forestTiles0,
      sprites.castle.tilePath5,
      sprites.dungeon.chestClosed, // Goal flag placeholder
    ],
    TileScale.Sixteen
  );
}
function tmDun07Stage01(): tiles.TileMapData {
  // Stage 1: MOVING_SHELVES - Moving platforms (VHS shelves)
  // Player must time jumps across moving platforms
  return tiles.createTilemap(
    hex`14000a00030303030303030303030303030303030303030300000000000000000000000000000000000000030300000000000000000000000000000000000003030000000000000000000000000700000000000303030000000000000000000000000000000000030300000000000000000000000000000000000303030000000000000000000000000000000003030300000000000000000000000000000000030303030000000000000000000000000700000303030303030303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . 7 . . . . . 2 
2 2 . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 2 . . . . . . . . . . . . . . . . . 2 
2 2 . . . . . . . . . . . . . . . . . 2 
2 2 2 . . . . . . . . . . . . 7 . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.castle.tilePath5,
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass3,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath4,
      sprites.builtin.forestTiles0,
      sprites.castle.tilePath5,
      sprites.dungeon.chestClosed, // Goal flag placeholder
    ],
    TileScale.Sixteen
  );
}
function tmDun07Stage02(): tiles.TileMapData {
  // Stage 2: SWITCH_GATES - Switches open gates
  // Player activates switches to open gates blocking path to goal
  return tiles.createTilemap(
    hex`14000a00030303030303030303030303030303030303030300000000000000000000000000000000000000030300000000000000000000000000000000000003030000000000000900000a0a0a0a0a0a0a0a0a03030303030303030303030303030000000000000303000000000000000000000000000000000000030300000000000000000000000700000000000303030000000000000000000000000000000000030303030303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . 9 . . . 6 6 6 6 6 6 6 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . 7 . . . . . 2 
2 2 . . . . . . . . . . . . . . . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.castle.tilePath5,
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass3,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath4,
      sprites.builtin.forestTiles0,
      sprites.dungeon.purpleOuterWest0, // Gate tiles
      sprites.dungeon.chestClosed, // Goal flag placeholder
      sprites.builtin.forestTiles0,
      sprites.dungeon.buttonTeal, // Switch tile
      sprites.dungeon.stairNorth, // Gate wall
    ],
    TileScale.Sixteen
  );
}
function tmDun07Stage03(): tiles.TileMapData {
  // Stage 3: FINAL_RUN - Fast platforming challenge
  // Longer level combining all previous mechanics for final challenge
  return tiles.createTilemap(
    hex`1e000a000303030303030303030303030303030303030303030303030303030303030300000000000000000000000000000000000000000000000000000000000000030300000000000000000000000000000000000000000000000000000000000003030000000000000000000000000000000000000000000000000700000000000303030303000000000000000000030303030000000000000000000000000000030300000000000000000003030300000000000000000000000000000000000303000000000000000303030000000000000000000000000000000000000003030000000000030303000000000000000000000000000000000000000000030303030303030303030303030303030303030303030303030303030303030303`,
    img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . . . . . . . . 7 . . . . . . 2 
2 2 2 2 . . . . . . . . . 2 2 2 2 . . . . . . . . . . . . 2 
2 . . . . . . . . . 2 2 2 . . . . . . . . . . . . . . . . 2 
2 . . . . . . . . 2 2 2 . . . . . . . . . . . . . . . . . 2 
2 . . . . . . . 2 2 2 . . . . . . . . . . . . . . . . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`,
    [
      sprites.castle.tilePath5,
      sprites.castle.tileGrass2,
      sprites.castle.tileDarkGrass3,
      sprites.castle.tileDarkGrass1,
      sprites.castle.tilePath4,
      sprites.builtin.forestTiles0,
      sprites.castle.tilePath5,
      sprites.dungeon.chestClosed, // Goal flag placeholder
    ],
    TileScale.Sixteen
  );
}

// Dungeon 8 stages
function tmDun08Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun08Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun08Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun08Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}

// Dungeon 9 stages
function tmDun09Stage00(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun09Stage01(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun09Stage02(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun09Stage03(): tiles.TileMapData {
  return createEmptyTilemap();
}
function tmDun09Stage04(): tiles.TileMapData {
  return createEmptyTilemap();
}

// ============ SOUNDS ============

function sfxInteract() {
  /* music.play(music.createSoundEffect(...)) */
}
function sfxHit() {}
function sfxJump() {}
function sfxShoot() {}
function sfxCollect() {}
function sfxDoorOpen() {}
function sfxToolUse() {}

function bgmHub() {}
function bgmDun01() {}
function bgmDun02() {}
function bgmDun03() {}
function bgmDun04() {}
function bgmDun05() {}
function bgmDun06() {}
function bgmDun07() {}
function bgmDun08() {}
function bgmDun09() {}

// ============ TILEMAP LOADER ============

function getTilemapByID(id: string): tiles.TileMapData {
  // Hub
  if (id === "TM_HUB_00") return tmHub00();
  if (id === "TM_HUB_01") return tmHub01();
  if (id === "TM_HUB_02") return tmHub02();
  if (id === "TM_HUB_10") return tmHub10();
  if (id === "TM_HUB_11") return tmHub11();
  if (id === "TM_HUB_12") return tmHub12();
  if (id === "TM_HUB_20") return tmHub20();
  if (id === "TM_HUB_21") return tmHub21();
  if (id === "TM_HUB_22") return tmHub22();

  // Dungeon 1
  if (id === "TM_DUN_01_STAGE_00_WARMUP") return tmDun01Stage00();
  if (id === "TM_DUN_01_STAGE_01_DARK_MAZE") return tmDun01Stage01();
  if (id === "TM_DUN_01_STAGE_02_TOKEN_RUN") return tmDun01Stage02();
  if (id === "TM_DUN_01_STAGE_03_EXIT_ROOM") return tmDun01Stage03();

  // Dungeon 2
  if (id === "TM_DUN_02_STAGE_00_RANGE") return tmDun02Stage00();
  if (id === "TM_DUN_02_STAGE_01_FORMATIONS") return tmDun02Stage01();
  if (id === "TM_DUN_02_STAGE_02_ALARM") return tmDun02Stage02();
  if (id === "TM_DUN_02_STAGE_03_CORE") return tmDun02Stage03();

  // Dungeon 3
  if (id === "TM_DUN_03_STAGE_00_CONVEYOR_INTRO") return tmDun03Stage00();
  if (id === "TM_DUN_03_STAGE_01_BLOCK_ROWS") return tmDun03Stage01();
  if (id === "TM_DUN_03_STAGE_02_MOVING_CRATES") return tmDun03Stage02();
  if (id === "TM_DUN_03_STAGE_03_FINAL_PATTERN") return tmDun03Stage03();

  // Dungeon 4
  if (id === "TM_DUN_04_STAGE_00_BEAT_TUTORIAL") return tmDun04Stage00();
  if (id === "TM_DUN_04_STAGE_01_DOORS") return tmDun04Stage01();
  if (id === "TM_DUN_04_STAGE_02_SWITCH_CHAIN") return tmDun04Stage02();
  if (id === "TM_DUN_04_STAGE_03_FINAL_STREAK") return tmDun04Stage03();

  // Dungeon 5
  if (id === "TM_DUN_05_STAGE_00_PADDLE_LEARN") return tmDun05Stage00();
  if (id === "TM_DUN_05_STAGE_01_TARGETS") return tmDun05Stage01();
  if (id === "TM_DUN_05_STAGE_02_REFLECTORS") return tmDun05Stage02();
  if (id === "TM_DUN_05_STAGE_03_FINAL_CLEAR") return tmDun05Stage03();

  // Dungeon 6
  if (id === "TM_DUN_06_STAGE_00_THRUST") return tmDun06Stage00();
  if (id === "TM_DUN_06_STAGE_01_SPLIT") return tmDun06Stage01();
  if (id === "TM_DUN_06_STAGE_02_PARTS_RUSH") return tmDun06Stage02();
  if (id === "TM_DUN_06_STAGE_03_SURVIVE") return tmDun06Stage03();

  // Dungeon 7
  if (id === "TM_DUN_07_STAGE_00_JUMP") return tmDun07Stage00();
  if (id === "TM_DUN_07_STAGE_01_MOVING_SHELVES") return tmDun07Stage01();
  if (id === "TM_DUN_07_STAGE_02_SWITCH_GATES") return tmDun07Stage02();
  if (id === "TM_DUN_07_STAGE_03_FINAL_RUN") return tmDun07Stage03();

  // Dungeon 8
  if (id === "TM_DUN_08_STAGE_00_LADDERS") return tmDun08Stage00();
  if (id === "TM_DUN_08_STAGE_01_BARRELS") return tmDun08Stage01();
  if (id === "TM_DUN_08_STAGE_02_TRICK_LADDERS") return tmDun08Stage02();
  if (id === "TM_DUN_08_STAGE_03_TOP_PLATFORM") return tmDun08Stage03();

  // Dungeon 9
  if (id === "TM_DUN_09_STAGE_00_META_INTRO") return tmDun09Stage00();
  if (id === "TM_DUN_09_STAGE_01_MICRO_PLATFORM") return tmDun09Stage01();
  if (id === "TM_DUN_09_STAGE_02_MICRO_SHOOTER") return tmDun09Stage02();
  if (id === "TM_DUN_09_STAGE_03_MICRO_RHYTHM") return tmDun09Stage03();
  if (id === "TM_DUN_09_STAGE_04_STABILIZE") return tmDun09Stage04();

  // Unknown id fallback: surface error to avoid null tilemaps later
  control.fail("Unknown tilemap ID: " + id);
  return createEmptyTilemap();
}
