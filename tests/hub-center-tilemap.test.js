"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./source-utils.js");

test("center hub uses imported urban tiles with boundary collisions", () => {
  const pxtJson = JSON.parse(readRepoFile("pxt.json"));
  const tilemap = readRepoFile("hub_center_tilemap.ts");
  const hubController = readRepoFile("game_controller_hub.ts");

  assert.ok(pxtJson.files.includes("hub_center_tilemap.ts"));
  assert.match(tilemap, /function tmHub11Playable\(\): tiles\.TileMapData/);
  assert.match(tilemap, /hex`10000c00/);
  assert.match(tilemap, /assets\.tile`rpgUrbanPavement0036`/);
  assert.match(tilemap, /assets\.tile`rpgUrbanSavehouseFacade0365`/);
  assert.match(tilemap, /assets\.tile`rpgUrbanRoad0441`/);
  assert.match(tilemap, /TileScale\.Sixteen/);
  assert.match(tilemap, /2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2/);

  assert.match(hubController, /scene\.setBackgroundColor\(15\)/);
  assert.match(
    hubController,
    /roomId === "TM_HUB_11"[\s\S]*\? tmHub11Playable\(\)[\s\S]*: getTilemapByID\(roomId\)/,
  );
});
