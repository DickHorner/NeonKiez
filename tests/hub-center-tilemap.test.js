"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./source-utils.js");

test("center hub composes pavement, storefront, and detailed road tiles", () => {
  const pxtJson = JSON.parse(readRepoFile("pxt.json"));
  const tilemap = readRepoFile("hub_center_tilemap.ts");
  const hubController = readRepoFile("game_controller_hub.ts");

  assert.ok(pxtJson.files.includes("hub_center_tilemap.ts"));
  assert.match(tilemap, /function tmHub11Playable\(\): tiles\.TileMapData/);
  assert.match(tilemap, /hex`10000c00/);
  assert.match(tilemap, /namespace myTiles/);

  assert.match(tilemap, /rpgUrbanPavement0036/);
  assert.match(tilemap, /rpgUrbanPavement0035/);
  assert.match(tilemap, /rpgUrbanPavement0066/);
  assert.match(tilemap, /rpgUrbanPavement0037/);

  assert.match(tilemap, /rpgUrbanSavehouseFacade0328/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0329/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0330/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0359/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0360/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0361/);
  assert.match(tilemap, /rpgUrbanSavehouseFacade0366/);

  assert.match(tilemap, /rpgUrbanRoad0432/);
  assert.match(tilemap, /rpgUrbanRoad0433/);
  assert.match(tilemap, /rpgUrbanRoad0441/);
  assert.match(tilemap, /rpgUrbanRoad0442/);
  assert.match(tilemap, /rpgUrbanRoad0461/);
  assert.match(tilemap, /rpgUrbanRoad0463/);
  assert.match(tilemap, /rpgUrbanRoad0469/);

  assert.doesNotMatch(tilemap, /assets\.tile`rpgUrban/);
  assert.match(tilemap, /TileScale\.Sixteen/);
  assert.match(
    tilemap,
    /2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2\s+2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2/,
  );
  assert.match(tilemap, /2 2 2 2 2 2 2 \. \. 2 2 2 2 2 2 2/);
  assert.match(tilemap, /13131313131313020213131313131313/);

  assert.match(hubController, /scene\.setBackgroundColor\(1\)/);
  assert.match(
    hubController,
    /roomId === "TM_HUB_11"[\s\S]*\? tmHub11Playable\(\)[\s\S]*: getTilemapByID\(roomId\)/,
  );
});
