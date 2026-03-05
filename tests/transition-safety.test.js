"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extractFunctionSource, readRepoFile } = require("./source-utils.js");

const controllerSource = readRepoFile("game_controller.ts");
const switchPlayModeSource = extractFunctionSource(controllerSource, "switchPlayMode");
const cleanupSource = extractFunctionSource(controllerSource, "cleanupCurrentPlayMode");

test("switchPlayMode guards re-entry before taking the transition lock", () => {
  const guardIndex = switchPlayModeSource.indexOf("if (state.transitionLock)");
  const lockIndex = switchPlayModeSource.indexOf("state.transitionLock = true");

  assert.ok(guardIndex >= 0, "transitionLock guard missing");
  assert.ok(lockIndex >= 0, "transitionLock assignment missing");
  assert.ok(guardIndex < lockIndex, "guard must happen before taking the lock");
});

test("switchPlayMode follows lock -> cleanup -> setup -> unlock order", () => {
  const lockIndex = switchPlayModeSource.indexOf("state.transitionLock = true");
  const cleanupIndex = switchPlayModeSource.indexOf("cleanupCurrentPlayMode();");
  const setupIndex = switchPlayModeSource.indexOf("setupNextPlayMode(nextMode, payload);");
  const unlockIndex = switchPlayModeSource.indexOf("state.transitionLock = false");

  assert.ok(lockIndex < cleanupIndex, "cleanup must happen after the lock is taken");
  assert.ok(cleanupIndex < setupIndex, "setup must happen after cleanup");
  assert.ok(setupIndex < unlockIndex, "unlock must happen after setup");
});

test("cleanupCurrentPlayMode clears runtime-owned state safely", () => {
  assert.match(cleanupSource, /RelativeToCamera/);
  assert.match(cleanupSource, /tiles\.setCurrentTilemap\(null\)/);
  assert.match(cleanupSource, /playerSprite = null/);
  assert.match(cleanupSource, /state\.dungeonStageData = null/);
  assert.match(cleanupSource, /setLayerImage\(scroller\.BackgroundLayer\.Layer0/);
  assert.match(cleanupSource, /setLayerImage\(scroller\.BackgroundLayer\.Layer1/);
});
