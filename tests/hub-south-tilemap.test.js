"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile, readTilemapAsset } = require("./source-utils.js");

test("south hub room is a native editable MakeCode tilemap asset", () => {
  const hubController = readRepoFile("game_controller_hub.ts");
  const worldHub = readRepoFile("world_hub.ts");
  const tilemap = readTilemapAsset("TM_HUB_21");

  assert.equal(tilemap.tileWidth, 16);
  assert.equal(tilemap.width, 16);
  assert.equal(tilemap.height, 12);
  assert.equal(tilemap.tileIndices.length, 16 * 12);
  assert.equal(tilemap.layerData.length, (16 * 12) / 2);
  assert.deepEqual(tilemap.entry.tileset, [
    "myTiles.transparency16",
    "myTiles.rpgUrbanPavement0036",
    "myTiles.rpgUrbanSavehouseFacade0365",
    "myTiles.rpgUrbanRoad0441",
  ]);

  const openTopColumns = [];
  for (let x = 0; x < tilemap.width; x += 1) {
    if (tilemap.wallAt(x, 0) === 0) {
      openTopColumns.push(x);
    }
    assert.equal(tilemap.wallAt(x, tilemap.height - 1), 2);
  }
  assert.deepEqual(openTopColumns, [7, 8]);

  assert.match(hubController, /assets\.tilemap`TM_HUB_21`/);
  assert.match(worldHub, /"DUN_VIDEO_STORE_PLATFORM_TRIAL"/);
  assert.match(worldHub, /spawnDoor\(dungeonId, HUB_DOOR_X, HUB_DOOR_Y\)/);
});
