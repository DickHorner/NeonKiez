// tests/transition-safety.test.js
// Verifies typed payload and stage-data contracts enforced by the type-hardening pass.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  initPlatformStageData,
  initRhythmStageData,
} = require("./helpers.js");

// ---- HubModePayload shape ----
test("HubModePayload: accepts only hubRoom or spawnTag", () => {
  const hubPayload = { hubRoom: { row: 1, col: 1 }, spawnTag: null };
  assert.ok(hubPayload.hubRoom);
  assert.equal(hubPayload.spawnTag, null);
});

// ---- DungeonModePayload shape ----
test("DungeonModePayload: requires dungeonId and stageIndex", () => {
  const dunPayload = { dungeonId: "DUN_LAUNDROMAT_LABYRINTH", stageIndex: 0 };
  assert.equal(typeof dunPayload.dungeonId, "string");
  assert.equal(typeof dunPayload.stageIndex, "number");
});

// ---- DungeonStageData shape ----
test("initPlatformStageData produces correct shape", () => {
  const data = initPlatformStageData(2);
  assert.equal(data.stageIndex, 2);
  assert.equal(data.reachedGoal, false);
  assert.equal(data.switchesActivated, 0);
  assert.equal(data.gatesOpen, false);
  // Optional fields absent by default
  assert.equal(data.bpm, undefined);
  assert.equal(data.tokensCollected, undefined);
});

test("initRhythmStageData computes beatIntervalMs from bpm", () => {
  const data = initRhythmStageData(1, 120, 0);
  assert.equal(data.stageIndex, 1);
  assert.equal(data.bpm, 120);
  assert.equal(data.beatIntervalMs, 500); // 60000/120
  assert.equal(data.streak, 0);
  assert.equal(data.misses, 0);
  assert.equal(data.nextBeatTime, 500);
});

test("initRhythmStageData handles non-standard BPM", () => {
  const data = initRhythmStageData(0, 60, 1000);
  assert.equal(data.beatIntervalMs, 1000); // 60000/60
  assert.equal(data.nextBeatTime, 2000);
});
