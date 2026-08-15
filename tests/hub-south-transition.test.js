"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile, readTilemapAsset } = require("./source-utils.js");

test("center south exit and south north entry remain narrow passable openings", () => {
  const center = readTilemapAsset("TM_HUB_11");
  const south = readTilemapAsset("TM_HUB_21");
  const openingColumns = [7, 8];

  const centerOpeningColumns = [];
  const southOpeningColumns = [];

  for (let x = 0; x < center.width; x += 1) {
    assert.equal(center.wallAt(x, 0), 2);
    if (center.wallAt(x, center.height - 1) === 0) {
      centerOpeningColumns.push(x);
    }
  }

  for (let x = 0; x < south.width; x += 1) {
    if (south.wallAt(x, 0) === 0) {
      southOpeningColumns.push(x);
    }
    assert.equal(south.wallAt(x, south.height - 1), 2);
  }

  assert.deepEqual(centerOpeningColumns, openingColumns);
  assert.deepEqual(southOpeningColumns, openingColumns);
});

test("center and south transitions are guarded and spawn inside their destination rooms", () => {
  const constants = readRepoFile("constants.ts");
  const hub = readRepoFile("game_controller_hub.ts");
  const controller = readRepoFile("game_controller.ts");

  assert.match(constants, /SPAWN_HUB_21_FROM_NORTH/);
  assert.match(constants, /room: \{ row: 2, col: 1 \}/);
  assert.match(constants, /x: HUB_SOUTH_ENTRY_X/);
  assert.match(constants, /y: HUB_SOUTH_ENTRY_Y/);
  assert.match(constants, /SPAWN_HUB_11_FROM_SOUTH/);
  assert.match(constants, /HUB_CENTER_SOUTH_EXIT_TRIGGER_Y = 176/);
  assert.match(constants, /HUB_CENTER_SOUTH_ENTRY_Y = 160/);
  assert.match(hub, /state\.transitionLock/);
  assert.match(hub, /controller\.down\.isPressed\(\)/);
  assert.match(hub, /state\.hubRoom = \{ row: 2, col: 1 \}/);
  assert.match(hub, /spawnTag: SPAWN_HUB_21_FROM_NORTH/);
  assert.match(hub, /state\.hubRoom\.row !== 2 \|\| state\.hubRoom\.col !== 1/);
  assert.match(hub, /controller\.up\.isPressed\(\)/);
  assert.match(hub, /playerSprite\.y > HUB_SOUTH_NORTH_EXIT_TRIGGER_Y/);
  assert.match(hub, /state\.hubRoom = \{ row: 1, col: 1 \}/);
  assert.match(hub, /spawnTag: SPAWN_HUB_11_FROM_SOUTH/);
  assert.match(hub, /assets\.tilemap`TM_HUB_11`/);
  assert.match(hub, /assets\.tilemap`TM_HUB_21`/);
  assert.match(hub, /GameController\.switchPlayMode\(PlayMode\.HUB_TOPDOWN/g);
  assert.match(controller, /state\.playMode === PlayMode\.HUB_TOPDOWN[\s\S]*HubMode\.update\(\)/);
});
