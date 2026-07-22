"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./source-utils.js");

test("center hub uses imported urban tiles with a boundary layout", () => {
  const pxtJson = JSON.parse(readRepoFile("pxt.json"));
  const tilemap = readRepoFile("hub_center_tilemap.ts");
  const hubController = readRepoFile("game_controller_hub.ts");

  assert.ok(pxtJson.files.includes("hub_center_tilemap.ts"));
  assert.match(tilemap, /function tmHub11Playable\(\): tiles\.TileMapData/);
  assert.match(tilemap, /hex`10000c00/);
  assert.match(tilemap, /namespace myTiles/);
  assert.match(tilemap, /export const rpgUrbanPavement0036 = image\.ofBuffer\(hex``\)/);
  assert.match(tilemap, /export const rpgUrbanSavehouseFacade0365 = image\.ofBuffer\(hex``\)/);
  assert.match(tilemap, /export const rpgUrbanRoad0441 = image\.ofBuffer\(hex``\)/);
  assert.match(tilemap, /myTiles\.rpgUrbanPavement0036/);
  assert.match(tilemap, /myTiles\.rpgUrbanSavehouseFacade0365/);
  assert.match(tilemap, /myTiles\.rpgUrbanRoad0441/);
  assert.doesNotMatch(tilemap, /assets\.tile`rpgUrban/);
  assert.match(tilemap, /TileScale\.Sixteen/);
  assert.match(tilemap, /2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2/);

  assert.match(hubController, /scene\.setBackgroundColor\(1\)/);
  assert.match(
    hubController,
    /roomId === "TM_HUB_11"[\s\S]*\? tmHub11Playable\(\)[\s\S]*: getTilemapByID\(roomId\)/,
  );
});
