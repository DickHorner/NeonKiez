"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extractFunctionSource, readRepoFile } = require("./source-utils.js");

test("south hub room uses imported tiles with a 16x12 wall boundary", () => {
  const assets = readRepoFile("assets_stub.ts");
  const worldHub = readRepoFile("world_hub.ts");
  const tilemap = extractFunctionSource(assets, "tmHub21");

  assert.match(tilemap, /hex`10000c00/);
  assert.match(tilemap, /assets\.tile`rpgUrbanPavement0036`/);
  assert.match(tilemap, /assets\.tile`rpgUrbanSavehouseFacade0365`/);
  assert.match(tilemap, /assets\.tile`rpgUrbanRoad0441`/);
  assert.match(tilemap, /TileScale\.Sixteen/);
  assert.match(tilemap, /2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2/);

  assert.match(assets, /if \(id === "TM_HUB_21"\) return tmHub21\(\)/);
  assert.match(worldHub, /"DUN_VIDEO_STORE_PLATFORM_TRIAL"/);
  assert.match(worldHub, /spawnDoor\(dungeonId, HUB_DOOR_X, HUB_DOOR_Y\)/);
});
