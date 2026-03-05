"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadFunctionsFromFile } = require("./source-utils.js");

const logMessages = [];
const hubContext = {
  HUB_ROOM_IDS: [
    ["TM_HUB_00", "TM_HUB_01", "TM_HUB_02"],
    ["TM_HUB_10", "TM_HUB_11", "TM_HUB_12"],
    ["TM_HUB_20", "TM_HUB_21", "TM_HUB_22"],
  ],
  HUB_START_ROOM: { row: 1, col: 1 },
  HUB_SPAWN_POINTS: {
    SAFE: { room: { row: 2, col: 0 }, x: 80, y: 80 },
  },
  STATE_HUB_ROOM_MIN: 0,
  STATE_HUB_ROOM_MAX: 2,
  console: {
    log(message) {
      logMessages.push(message);
    },
  },
};

const hubHelpers = loadFunctionsFromFile(
  "constants.ts",
  ["hasOwnSpawnPoint", "isValidHubRoom", "getSafeHubRoom", "getSpawnPoint"],
  hubContext
);

test("isValidHubRoom accepts only finite integer grid coordinates", () => {
  assert.equal(hubHelpers.isValidHubRoom({ row: 1, col: 2 }), true);
  assert.equal(hubHelpers.isValidHubRoom({ row: 1.5, col: 2 }), false);
  assert.equal(hubHelpers.isValidHubRoom({ row: Infinity, col: 2 }), false);
  assert.equal(hubHelpers.isValidHubRoom({ row: -1, col: 0 }), false);
});

test("getSafeHubRoom falls back to the center room and logs the context", () => {
  logMessages.length = 0;
  assert.deepEqual(
    JSON.parse(JSON.stringify(hubHelpers.getSafeHubRoom({ row: 99, col: 99 }, "payload.hubRoom"))),
    { row: 1, col: 1 }
  );
  assert.ok(logMessages.some((message) => message.includes("payload.hubRoom")));
});

test("getSpawnPoint uses own-property lookup and rejects malformed entries", () => {
  assert.deepEqual(hubHelpers.getSpawnPoint("SAFE"), { room: { row: 2, col: 0 }, x: 80, y: 80 });
  assert.equal(hubHelpers.getSpawnPoint("toString"), null);

  hubContext.HUB_SPAWN_POINTS.BROKEN = { room: { row: 9, col: 9 }, x: 1, y: 2 };
  hubContext.HUB_SPAWN_POINTS.BAD_COORDS = { room: { row: 1, col: 1 }, x: Infinity, y: 2 };

  assert.equal(hubHelpers.getSpawnPoint("BROKEN"), null);
  assert.equal(hubHelpers.getSpawnPoint("BAD_COORDS"), null);
});
