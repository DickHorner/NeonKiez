"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

test("hub tile assets are registered as MakeCode project tiles", () => {
  const pxtJson = readJson("pxt.json");
  const packageJson = readJson("package.json");
  const jres = readJson("hub_tiles.jres");
  const assetIds = Object.keys(jres).filter((id) => id !== "*");

  assert.ok(pxtJson.files.includes("hub_tiles.jres"));
  assert.equal(
    packageJson.scripts["assets:hub"],
    "node scripts/import-kenney-hub-tiles.js"
  );
  assert.deepEqual(jres["*"], {
    namespace: "myTiles",
    mimeType: "image/x-mkcd-f4",
    dataEncoding: "base64",
  });
  assert.equal(assetIds.length, 88);

  for (const assetId of assetIds) {
    const entry = jres[assetId];
    const data = Buffer.from(entry.data, "base64");

    assert.equal(entry.tilemapTile, true, `${assetId} is not marked as a tile`);
    assert.equal(data[0], 0x87, `${assetId} has an invalid image header`);
    assert.equal(data[1], 4, `${assetId} is not a four-bit image`);
    assert.equal(data.readUInt16LE(2), 16, `${assetId} has the wrong width`);
    assert.equal(data.readUInt16LE(4), 16, `${assetId} has the wrong height`);
  }
});
