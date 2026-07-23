"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile, extractFunctionSource, extractConstArraySource } = require("./source-utils.js");

test("Dungeon 7 spec registers TM_DUN_07_STAGE_00_JUMP in constants.ts", () => {
  const constantsSource = readRepoFile("constants.ts");
  const dungeonSpecsSource = extractConstArraySource(constantsSource, "DUNGEON_SPECS");

  assert.match(
    dungeonSpecsSource,
    /id:\s*"DUN_VIDEO_STORE_PLATFORM_TRIAL"[\s\S]*?playMode:\s*PlayMode\.DUN_PLATFORM[\s\S]*?"TM_DUN_07_STAGE_00_JUMP"/
  );
  assert.match(
    dungeonSpecsSource,
    /id:\s*"DUN_VIDEO_STORE_PLATFORM_TRIAL"[\s\S]*?hubReturnSpawnTag:\s*"SPAWN_HUB_FROM_DUN_07"/
  );
});

test("tmDun07Stage00 tilemap factory builds valid 20x10 tilemap with goal tile", () => {
  const assetsSource = readRepoFile("assets_stub.ts");
  const stage0Fn = extractFunctionSource(assetsSource, "tmDun07Stage00");

  // Hex buffer string must be 808 characters (404 bytes: 4-byte header + 200 tile bytes + 200 wall bytes)
  const hexMatch = stage0Fn.match(/hex`([0-9a-fA-F]+)`/);
  assert.ok(hexMatch, "tmDun07Stage00 must contain a hex literal");
  const hex = hexMatch[1];
  assert.equal(hex.length, 808, "hex buffer length must be 808 characters for 20x10 grid with wall layer");

  const buf = Buffer.from(hex, "hex");
  const width = buf.readUInt16LE(0);
  const height = buf.readUInt16LE(2);
  assert.equal(width, 20);
  assert.equal(height, 10);

  // Check tile array (bytes 4..204) contains TILE_GOAL_FLAG (7)
  const tiles = buf.subarray(4, 4 + width * height);
  assert.ok(tiles.includes(7), "tile array must contain goal tile flag (7)");

  // Check getTilemapByID routing
  const getTilemapFn = extractFunctionSource(assetsSource, "getTilemapByID");
  assert.match(
    getTilemapFn,
    /if\s*\(\s*id\s*===\s*"TM_DUN_07_STAGE_00_JUMP"\s*\)\s*return\s+tmDun07Stage00\(\);/
  );
});

test("imgPlatformPlayer produces a visible player sprite", () => {
  const assetsSource = readRepoFile("assets_stub.ts");
  const imgPlatformFn = extractFunctionSource(assetsSource, "imgPlatformPlayer");

  assert.match(imgPlatformFn, /img\.fill\(\d+\);/);
});

test("game_controller_platform.ts explicitly routes Stage 0 completion to completeDungeon", () => {
  const platformControllerSource = readRepoFile("game_controller_platform.ts");
  const updateFn = extractFunctionSource(platformControllerSource, "update");

  assert.match(
    updateFn,
    /state\.currentDungeonId\s*===\s*"DUN_VIDEO_STORE_PLATFORM_TRIAL"\s*&&\s*state\.currentStageIndex\s*===\s*0[\s\S]*?GameController\.completeDungeon\(\);/
  );
});
