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
  "hub_tiles_ready.jres",
];

const approvedRepresentatives = [
  "rpgUrbanPavement0036",
  "rpgUrbanRoad0441",
  "rpgUrbanSavehouseFacade0365",
  "rpgUrbanStreetProps0250",
  "rpgUrbanVegetation0259",
  "rpgUrbanDoorCandidates0283",
  "rpgUrbanReadyStreetProps0250Pavement",
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function assertValidF4(data, assetId) {
  assert.equal(data[0], 0x87, `${assetId} has an invalid image header`);
  assert.equal(data[1], 4, `${assetId} is not a four-bit image`);

  const width = data.readUInt16LE(2);
  const height = data.readUInt16LE(4);
  assert.equal(width, 16, `${assetId} has the wrong width`);
  assert.equal(height, 16, `${assetId} has the wrong height`);

  const bytesPerColumn = Math.ceil(height / 2);
  const paddedBytesPerColumn = Math.ceil(bytesPerColumn / 4) * 4;
  const expectedLength = 8 + width * paddedBytesPerColumn;
  assert.equal(data.length, expectedLength, `${assetId} has an invalid F4 payload length`);
}

function assertOpaqueF4(data, assetId) {
  const width = data.readUInt16LE(2);
  const height = data.readUInt16LE(4);
  const bytesPerColumn = Math.ceil(height / 2);
  const paddedBytesPerColumn = Math.ceil(bytesPerColumn / 4) * 4;

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const packed = data[8 + x * paddedBytesPerColumn + Math.floor(y / 2)];
      const color = y % 2 === 0 ? packed & 0x0f : (packed >> 4) & 0x0f;
      assert.notEqual(color, 0, `${assetId} contains a transparent pixel at ${x},${y}`);
    }
  }
}

test("hub tile assets are registered and declared for editable tilemaps", () => {
  const pxtJson = readJson("pxt.json");
  const packageJson = readJson("package.json");
  const declarations = ["hub_tiles.ts", "hub_tiles_ready.ts"]
    .map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8"))
    .join("\n");
  let assetCount = 0;
  let readyCount = 0;

  assert.equal(
    packageJson.scripts["assets:hub"],
    "node scripts/import-kenney-hub-tiles.js"
  );
  assert.ok(pxtJson.files.includes("hub_tiles.ts"));
  assert.ok(pxtJson.files.includes("hub_tiles_ready.ts"));

  for (const assetFile of assetFiles) {
    assert.ok(pxtJson.files.includes(assetFile));
    const jres = readJson(assetFile);
    const assetIds = Object.keys(jres).filter((id) => id !== "*");
    assetCount += assetIds.length;

    if (assetFile === "hub_tiles_ready.jres") {
      readyCount = assetIds.length;
    }

    assert.deepEqual(jres["*"], {
      namespace: "myTiles",
      mimeType: "image/x-mkcd-f4",
      dataEncoding: "base64",
    });

    for (const assetId of assetIds) {
      const entry = jres[assetId];
      const data = Buffer.from(entry.data, "base64");

      assert.equal(entry.tilemapTile, true, `${assetId} is not marked as a tile`);
      assertValidF4(data, assetId);
      if (assetFile === "hub_tiles_ready.jres") {
        assertOpaqueF4(data, assetId);
      }
      assert.match(
        declarations,
        new RegExp(`export const ${assetId} = image\\.ofBuffer`),
        `${assetId} is not declared for generated tilemap code`,
      );
    }
  }

  assert.equal(assetCount, 114);
  assert.equal(readyCount, 26);
});

test("F4 validation rejects truncated and dimensionally inconsistent payloads", () => {
  const valid = Buffer.from(readJson("hub_tiles_pavement.jres").rpgUrbanPavement0036.data, "base64");
  const truncated = valid.subarray(0, valid.length - 1);
  const wrongWidth = Buffer.from(valid);
  wrongWidth.writeUInt16LE(15, 2);

  assert.throws(() => assertValidF4(truncated, "truncated"), /invalid F4 payload length/);
  assert.throws(() => assertValidF4(wrongWidth, "wrong-width"), /wrong width/);
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
