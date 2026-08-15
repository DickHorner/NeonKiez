"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { HUB_URBAN_PALETTE } = require("../scripts/import-kenney-hub-tiles.js");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readPalette(source, name) {
  const pattern = "const " + name + " = hex`([\\s\\S]*?)`;";
  const match = source.match(new RegExp(pattern));
  assert.ok(match, `${name} is missing`);
  const colors = match[1].match(/[0-9a-fA-F]{6}/g) || [];
  assert.equal(colors.length, 16, `${name} must contain 16 RGB colors`);
  return colors.map((color) => color.toLowerCase());
}

test("hub palette matches the importer palette and switches with game mode", () => {
  const pxtJson = JSON.parse(read("pxt.json"));
  const paletteSource = read("hub_palette.ts");
  const stateSource = read("state.ts");
  const runtimePalette = readPalette(paletteSource, "HUB_URBAN_PALETTE");
  const importerPalette = HUB_URBAN_PALETTE.map(
    ([red, green, blue]) => [red, green, blue]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
  );

  assert.ok(pxtJson.files.includes("hub_palette.ts"));
  assert.ok(pxtJson.files.indexOf("hub_palette.ts") < pxtJson.files.indexOf("state.ts"));
  assert.deepEqual(runtimePalette, importerPalette);
  readPalette(paletteSource, "DEFAULT_ARCADE_PALETTE");
  assert.match(
    stateSource,
    /image\.setPalette\([\s\S]*mode === GameMode\.Hub \? HUB_URBAN_PALETTE : DEFAULT_ARCADE_PALETTE/,
  );
});
