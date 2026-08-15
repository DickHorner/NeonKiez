"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extractFunctionSource, readRepoFile } = require("./source-utils.js");

test("center south exit and south north entry remain narrow passable openings", () => {
  const center = extractFunctionSource(readRepoFile("hub_center_tilemap.ts"), "tmHub11Playable");
  const south = extractFunctionSource(readRepoFile("assets_stub.ts"), "tmHub21");
  const opening = "2 2 2 2 2 2 2 . . 2 2 2 2 2 2 2";
  const openingColumns = [7, 8];

  const centerRows = center.match(/^\s*2.*$/gm);
  const southRows = south.match(/^\s*2.*$/gm);
  const centerOpeningTiles = centerRows[centerRows.length - 1].trim().split(/\s+/);
  const southOpeningTiles = southRows[0].trim().split(/\s+/);
  assert.equal(centerRows[0].trim(), "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2");
  assert.equal(centerRows[centerRows.length - 1].trim(), opening);
  assert.equal(southRows[0].trim(), opening);
  assert.equal(southRows[southRows.length - 1].trim(), "2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2");
  assert.deepEqual(
    centerOpeningTiles
      .map((tile, index) => tile === "." ? index : -1)
      .filter((index) => index >= 0),
    openingColumns,
  );
  assert.deepEqual(
    southOpeningTiles
      .map((tile, index) => tile === "." ? index : -1)
      .filter((index) => index >= 0),
    openingColumns,
  );
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
  assert.match(hub, /GameController\.switchPlayMode\(PlayMode\.HUB_TOPDOWN/g);
  assert.match(controller, /state\.playMode === PlayMode\.HUB_TOPDOWN[\s\S]*HubMode\.update\(\)/);
});
