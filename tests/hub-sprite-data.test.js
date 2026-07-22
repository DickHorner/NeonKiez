"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./source-utils.js");

test("hub sprites store metadata through the Sprite.data bag", () => {
  const worldHub = readRepoFile("world_hub.ts");
  const hubController = readRepoFile("game_controller_hub.ts");

  assert.match(worldHub, /function setHubSpriteData\(sprite: Sprite, key: string, value: any\)/);
  assert.match(worldHub, /const data = sprite\.data;/);
  assert.match(worldHub, /data\[key\] = value/);
  assert.match(worldHub, /function readHubSpriteData\(sprite: Sprite, key: string\): any/);

  assert.match(worldHub, /setHubSpriteData\(npc, HUB_SPRITE_DATA_IS_NPC, true\)/);
  assert.match(worldHub, /setHubSpriteData\(npc, HUB_SPRITE_DATA_DIALOG_ID, dialogId\)/);
  assert.match(worldHub, /setHubSpriteData\(door, HUB_SPRITE_DATA_IS_DOOR, true\)/);
  assert.match(worldHub, /setHubSpriteData\(door, HUB_SPRITE_DATA_DUNGEON_ID, dungeonId\)/);
  assert.match(hubController, /readHubSpriteData\(s, HUB_SPRITE_DATA_IS_DOOR\)/);
  assert.match(hubController, /readHubSpriteData\(s, HUB_SPRITE_DATA_IS_NPC\)/);

  assert.doesNotMatch(worldHub, /(?:npc|door)\.data\[/);
  assert.doesNotMatch(hubController, /s\.data\[/);
  assert.doesNotMatch(worldHub, /\(npc as any\)\.(?:isNPC|dialogId)/);
  assert.doesNotMatch(worldHub, /\(door as any\)\.(?:isDoor|dungeonId)/);
  assert.doesNotMatch(hubController, /as HubSprite/);
});
