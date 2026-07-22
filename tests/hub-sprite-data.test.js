"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./source-utils.js");

test("hub sprites store metadata in Sprite.data", () => {
  const worldHub = readRepoFile("world_hub.ts");
  const hubController = readRepoFile("game_controller_hub.ts");

  assert.match(worldHub, /npc\.data\[HUB_SPRITE_DATA_IS_NPC\] = true/);
  assert.match(worldHub, /npc\.data\[HUB_SPRITE_DATA_DIALOG_ID\] = dialogId/);
  assert.match(worldHub, /door\.data\[HUB_SPRITE_DATA_IS_DOOR\] = true/);
  assert.match(worldHub, /door\.data\[HUB_SPRITE_DATA_DUNGEON_ID\] = dungeonId/);

  assert.match(hubController, /s\.data\[HUB_SPRITE_DATA_IS_DOOR\]/);
  assert.match(hubController, /s\.data\[HUB_SPRITE_DATA_IS_NPC\]/);

  assert.doesNotMatch(worldHub, /\(npc as any\)\.(?:isNPC|dialogId)/);
  assert.doesNotMatch(worldHub, /\(door as any\)\.(?:isDoor|dungeonId)/);
  assert.doesNotMatch(hubController, /as HubSprite/);
});
