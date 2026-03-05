"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extractFunctionSource, readRepoFile } = require("./source-utils.js");

test("failure_signals.ts defines the expected reasons and nullable state", () => {
  const source = readRepoFile("failure_signals.ts");

  for (const reason of [
    "TRANSITION_LOCKED",
    "SPEC_NOT_FOUND",
    "NO_CURRENT_DUNGEON",
    "NO_DUNGEON_STAGE_DATA",
    "NO_PLAYER_SPRITE",
    "WRONG_PLAY_MODE",
    "INTERACT_COOLDOWN",
  ]) {
    assert.match(source, new RegExp(reason + "\\s*="));
  }

  assert.match(source, /FailureReason \| null/);
  assert.match(source, /string \| null/);
  assert.match(source, /function getLastFailure\(\): \{ reason: FailureReason \| null; context: string \| null \}/);
});

test("critical controller guards now emit failure signals", () => {
  const controllerSource = readRepoFile("game_controller.ts");

  assert.match(extractFunctionSource(controllerSource, "switchPlayMode"), /FailureReason\.TRANSITION_LOCKED/);
  assert.match(extractFunctionSource(controllerSource, "enterDungeon"), /FailureReason\.SPEC_NOT_FOUND/);
  assert.match(extractFunctionSource(controllerSource, "exitDungeon"), /FailureReason\.NO_CURRENT_DUNGEON/);
  assert.match(extractFunctionSource(controllerSource, "completeDungeon"), /FailureReason\.NO_CURRENT_DUNGEON/);
  assert.match(extractFunctionSource(controllerSource, "updateRhythmMode"), /FailureReason\.NO_PLAYER_SPRITE/);
  assert.match(extractFunctionSource(controllerSource, "updateRhythmMode"), /FailureReason\.NO_DUNGEON_STAGE_DATA/);
});

test("hub interactions and debug helpers surface failure state", () => {
  const hubSource = readRepoFile("game_controller_hub.ts");
  const debugSource = readRepoFile("debug.ts");

  assert.match(hubSource, /FailureReason\.WRONG_PLAY_MODE/);
  assert.match(hubSource, /FailureReason\.INTERACT_COOLDOWN/);
  assert.match(debugSource, /function toggleFailureSignalsDebug/);
  assert.match(debugSource, /function showLastFailure/);
  assert.match(debugSource, /getLastFailure\(\)/);
});
