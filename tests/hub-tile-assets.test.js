"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const assetFiles = [
  "hub_tiles_door_candidates.jres",
  "hub_tiles_pavement.jres",
  "hub_tiles_road.jres",
  "hub_tiles_savehouse_facade.jres",
  "hub_tiles_street_props.jres",
  "hub_tiles_vegetation.jres",
];

const approvedRepresentatives = [
  "rpgUrbanPavement0036",
  "rpgUrbanRoad0441",
  "rpgUrbanSavehouseFacade0365",
  "rpgUrbanStreetProps0250",
  "rpgUrbanVegetation0259",
  "rpgUrbanDoorCandidates0283",
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("hub tile assets are registered as MakeCode project tiles", () => {
  const pxtJson = readJson("pxt.json");
  const packageJson = readJson("package.json");
  let assetCount = 0;

  assert.equal(
    packageJson.scripts["assets:hub"],
    "node scripts/import-kenney-hub-tiles.js"
  );

  for (const assetFile of assetFiles) {
    assert.ok(pxtJson.files.includes(assetFile));
    const jres = readJson(assetFile);
    const assetIds = Object.keys(jres).filter((id) => id !== "*");
    assetCount += assetIds.length;

    assert.deepEqual(jres["*"], {
      namespace: "myTiles",
      mimeType: "image/x-mkcd-f4",
      dataEncoding: "base64",
    });

    for (const assetId of assetIds) {
      const entry = jres[assetId];
      const data = Buffer.from(entry.data, "base64");

      assert.equal(entry.tilemapTile, true, `${assetId} is not marked as a tile`);
      assert.equal(data[0], 0x87, `${assetId} has an invalid image header`);
      assert.equal(data[1], 4, `${assetId} is not a four-bit image`);
      assert.equal(data.readUInt16LE(2), 16, `${assetId} has the wrong width`);
      assert.equal(data.readUInt16LE(4), 16, `${assetId} has the wrong height`);
    }
  }

  assert.equal(assetCount, 88);
});

test("asset manifest records the approved imported hub-tile baseline", () => {
  const manifest = fs.readFileSync(path.join(repoRoot, "docs/ASSET_MANIFEST.md"), "utf8");

  for (const assetFile of assetFiles) {
    assert.match(manifest, new RegExp(assetFile));
  }
  for (const assetId of approvedRepresentatives) {
    assert.match(manifest, new RegExp(assetId));
  }

  assert.match(manifest, /Center-room implementation is tracked by #12/);
  assert.match(manifest, /additional hub-room work is tracked by #122/);
  assert.doesNotMatch(manifest, /\| TBD \|/);
});
