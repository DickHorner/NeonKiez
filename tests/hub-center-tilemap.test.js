"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile, readTilemapAsset } = require("./source-utils.js");

test("center hub is a native editable MakeCode tilemap asset", () => {
  const pxtJson = JSON.parse(readRepoFile("pxt.json"));
  const hubController = readRepoFile("game_controller_hub.ts");
  const tilemap = readTilemapAsset("TM_HUB_11");

  assert.ok(pxtJson.files.includes("tilemap.g.jres"));
  assert.ok(pxtJson.files.includes("tilemap.g.ts"));
  assert.ok(!pxtJson.files.includes("hub_center_tilemap.ts"));

  assert.equal(tilemap.tileWidth, 16);
  assert.equal(tilemap.width, 16);
  assert.equal(tilemap.height, 12);
  assert.equal(tilemap.tileIndices.length, 16 * 12);
  assert.equal(tilemap.layerData.length, (16 * 12) / 2);
  assert.equal(tilemap.entry.tileset[0], "myTiles.hubTransparency16");

  for (const tileId of [
    "myTiles.rpgUrbanPavement0036",
    "myTiles.rpgUrbanPavement0066",
    "myTiles.rpgUrbanRoad0441",
    "myTiles.rpgUrbanRoad0433",
    "myTiles.rpgUrbanSavehouseFacade0328",
    "myTiles.rpgUrbanSavehouseFacade0329",
    "myTiles.rpgUrbanSavehouseFacade0330",
    "myTiles.rpgUrbanSavehouseFacade0359",
    "myTiles.rpgUrbanSavehouseFacade0360",
    "myTiles.rpgUrbanSavehouseFacade0361",
    "myTiles.rpgUrbanSavehouseFacade0366",
  ]) {
    assert.ok(tilemap.entry.tileset.includes(tileId), tileId + " missing from TM_HUB_11");
  }

  for (let x = 0; x < tilemap.width; x += 1) {
    assert.equal(tilemap.wallAt(x, 0), 2);
    assert.equal(tilemap.wallAt(x, 1), 2);
  }

  const openBottomColumns = [];
  for (let x = 0; x < tilemap.width; x += 1) {
    if (tilemap.wallAt(x, tilemap.height - 1) === 0) {
      openBottomColumns.push(x);
    }
  }
  assert.deepEqual(openBottomColumns, [7, 8]);

  assert.match(hubController, /assets\.tilemap`TM_HUB_11`/);
  assert.doesNotMatch(hubController, /tmHub11Playable/);
});
