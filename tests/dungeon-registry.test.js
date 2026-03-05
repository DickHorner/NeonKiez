"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extractConstArraySource, readRepoFile } = require("./source-utils.js");

function collectQuotedStrings(source) {
  return Array.from(source.matchAll(/"([^"]+)"/g), (match) => match[1]);
}

test("DUNGEON_SPECS encodes a complete 9-dungeon registry", () => {
  const dungeonSpecsSource = extractConstArraySource(readRepoFile("constants.ts"), "DUNGEON_SPECS");

  const dungeonIds = Array.from(dungeonSpecsSource.matchAll(/^\s{4}id:\s*"([^"]+)"/gm), (match) => match[1]);
  const introIds = Array.from(dungeonSpecsSource.matchAll(/^\s{4}introCutsceneId:\s*"([^"]+)"/gm), (match) => match[1]);
  const spawnTags = Array.from(dungeonSpecsSource.matchAll(/^\s{4}hubReturnSpawnTag:\s*"([^"]+)"/gm), (match) => match[1]);
  const stageBlocks = Array.from(dungeonSpecsSource.matchAll(/stages:\s*\[([\s\S]*?)\n\s{4}\],/g), (match) => collectQuotedStrings(match[1]));
  const flagBlocks = Array.from(dungeonSpecsSource.matchAll(/flagsSet:\s*\[([\s\S]*?)\n\s{4,6}\]/g), (match) => collectQuotedStrings(match[1]));

  assert.equal(dungeonIds.length, 9);
  assert.equal(new Set(dungeonIds).size, dungeonIds.length, "dungeon ids must be unique");
  assert.equal(introIds.length, 9);
  assert.equal(spawnTags.length, 9);

  assert.deepEqual(stageBlocks.slice(0, 8).map((block) => block.length), [4, 4, 4, 4, 4, 4, 4, 4]);
  assert.equal(stageBlocks[8].length, 5);

  const stageIds = stageBlocks.flat();
  const rewardFlags = flagBlocks.flat();
  assert.equal(new Set(stageIds).size, stageIds.length, "stage ids must be unique");
  assert.equal(new Set(rewardFlags).size, rewardFlags.length, "reward flags must be unique");
});

test("world_dungeons.ts keeps registry validation wired into runtime startup", () => {
  const worldDungeonsSource = readRepoFile("world_dungeons.ts");

  assert.match(worldDungeonsSource, /function validateDungeonRegistry\(\): string\[\]/);
  assert.match(worldDungeonsSource, /function runDungeonRegistryValidation\(\): void/);
  assert.match(worldDungeonsSource, /checkAllDungeonsClearExceptFinal\(\): boolean/);
});
