"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  HUB_URBAN_PALETTE,
  buildJres,
  compositeRgba,
  encodeF4,
  getTileGroup,
  makeAssetId,
  quantizeRgba,
} = require("../scripts/import-kenney-hub-tiles.js");

test("encodes MakeCode F4 images column-first with four-byte column padding", () => {
  const encoded = encodeF4(Uint8Array.from([1, 3, 2, 4]), 2, 2);

  assert.deepEqual(
    Array.from(encoded),
    [0x87, 0x04, 0x02, 0x00, 0x02, 0x00, 0x00, 0x00, 0x21, 0, 0, 0, 0x43, 0, 0, 0]
  );
});

test("maps transparent and exact hub-palette pixels to MakeCode palette indices", () => {
  const rgba = Uint8Array.from([
    255, 255, 255, 0,
    ...HUB_URBAN_PALETTE[1], 255,
    ...HUB_URBAN_PALETTE[5], 255,
    ...HUB_URBAN_PALETTE[7], 255,
    ...HUB_URBAN_PALETTE[8], 255,
  ]);

  assert.equal(HUB_URBAN_PALETTE.length, 16);
  assert.deepEqual(Array.from(quantizeRgba(rgba, 5, 1)), [0, 1, 5, 7, 8]);
});

test("rejects semi-transparent source pixels", () => {
  const rgba = Uint8Array.from([255, 255, 255, 128]);

  assert.throws(
    () => quantizeRgba(rgba, 1, 1),
    /Semi-transparent pixels are not supported/
  );
});

test("composites opaque overlay pixels while preserving the base under transparency", () => {
  const base = {
    rgba: Uint8Array.from([
      10, 20, 30, 255,
      40, 50, 60, 255,
    ]),
  };
  const overlay = {
    rgba: Uint8Array.from([
      100, 110, 120, 0,
      130, 140, 150, 255,
    ]),
  };

  assert.deepEqual(
    Array.from(compositeRgba([base, overlay])),
    [10, 20, 30, 255, 130, 140, 150, 255],
  );
});

test("builds stable myTiles JRES entries", () => {
  const rgba = new Uint8Array(16 * 16 * 4);
  for (let offset = 0; offset < rgba.length; offset += 4) {
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = 255;
  }

  const jres = buildJres([
    {
      group: "pavement",
      fileName: "tile_0008.png",
      width: 16,
      height: 16,
      rgba,
    },
  ]);

  assert.equal(makeAssetId("pavement", "tile_0008.png"), "rpgUrbanPavement0008");
  assert.deepEqual(jres["*"], {
    namespace: "myTiles",
    mimeType: "image/x-mkcd-f4",
    dataEncoding: "base64",
  });
  assert.equal(jres.rpgUrbanPavement0008.tilemapTile, true);
  assert.equal(jres.rpgUrbanPavement0008.displayName, "RPG Urban / pavement / 0008");

  const decoded = Buffer.from(jres.rpgUrbanPavement0008.data, "base64");
  assert.equal(decoded[0], 0x87);
  assert.equal(decoded[1], 4);
  assert.equal(decoded.readUInt16LE(2), 16);
  assert.equal(decoded.readUInt16LE(4), 16);
});

test("groups nested tiles by the top-level category directory", () => {
  assert.equal(
    getTileGroup(
      "/tmp/NeonKiez_RPG_Urban_Hub_Batch_01/tiles",
      "/tmp/NeonKiez_RPG_Urban_Hub_Batch_01/tiles/pavement/variant_a/tile_0001.png"
    ),
    "pavement"
  );
});
