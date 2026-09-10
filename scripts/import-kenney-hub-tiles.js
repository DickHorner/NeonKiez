#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const tileSize = 16;

// Reviewed palette derived from the 88 selected RPG Urban hub tiles.
// Every visible color is taken verbatim from the Kenney source tiles; indices
// 5/7/8 keep door/player/NPC placeholders distinct while assets are unfinished.
const HUB_URBAN_PALETTE = [
  "#000000",
  "#5c6278",
  "#a09cca",
  "#b2acc1",
  "#836a62",
  "#dc8652",
  "#c6bc9f",
  "#d1ddef",
  "#38cbab",
  "#296360",
  "#39a077",
  "#7a77a4",
  "#2e8864",
  "#3f4488",
  "#ae5242",
  "#793445",
].map(parseHexColor);

function parseHexColor(value) {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

function collectPngFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPngFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function loadPngReader() {
  try {
    return require("pngjs").PNG;
  } catch (rootError) {
    try {
      const pxtCorePackage = require.resolve("pxt-core/package.json", { paths: [repoRoot] });
      const pngjsModule = require.resolve("pngjs", { paths: [path.dirname(pxtCorePackage)] });
      return require(pngjsModule).PNG;
    } catch (nestedError) {
      throw new Error(
        "pngjs is unavailable. Run npm install in the NeonKiez repository before importing assets."
      );
    }
  }
}

function readPng(filePath) {
  const PNG = loadPngReader();
  const image = PNG.sync.read(fs.readFileSync(filePath));

  if (image.width !== tileSize || image.height !== tileSize) {
    throw new Error(
      `${path.basename(filePath)} must be ${tileSize}x${tileSize}, got ${image.width}x${image.height}`
    );
  }

  return image;
}

function nearestPaletteIndex(red, green, blue, palette = HUB_URBAN_PALETTE) {
  let bestIndex = 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 1; index < palette.length; index += 1) {
    const color = palette[index];
    const redDelta = red - color[0];
    const greenDelta = green - color[1];
    const blueDelta = blue - color[2];
    const distance = redDelta * redDelta + greenDelta * greenDelta + blueDelta * blueDelta;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function quantizeRgba(rgba, width, height, palette = HUB_URBAN_PALETTE) {
  if (rgba.length !== width * height * 4) {
    throw new Error("RGBA buffer length does not match image dimensions");
  }

  const pixels = new Uint8Array(width * height);

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    const alpha = rgba[offset + 3];

    if (alpha === 0) {
      pixels[pixel] = 0;
      continue;
    }
    if (alpha !== 255) {
      throw new Error("Semi-transparent pixels are not supported; alpha must be 0 or 255");
    }

    pixels[pixel] = nearestPaletteIndex(
      rgba[offset],
      rgba[offset + 1],
      rgba[offset + 2],
      palette
    );
  }

  return pixels;
}

function encodeF4(pixels, width, height) {
  if (pixels.length !== width * height) {
    throw new Error("Indexed pixel buffer length does not match image dimensions");
  }

  const bytesPerColumn = Math.ceil(height / 2);
  const paddedBytesPerColumn = Math.ceil(bytesPerColumn / 4) * 4;
  const result = Buffer.alloc(8 + width * paddedBytesPerColumn);

  result[0] = 0x87;
  result[1] = 4;
  result.writeUInt16LE(width, 2);
  result.writeUInt16LE(height, 4);

  let outputOffset = 8;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 2) {
      const low = pixels[x + y * width] & 0x0f;
      const high = y + 1 < height ? (pixels[x + (y + 1) * width] & 0x0f) << 4 : 0;
      result[outputOffset] = low | high;
      outputOffset += 1;
    }
    outputOffset = 8 + (x + 1) * paddedBytesPerColumn;
  }

  return result;
}

function makeAssetId(group, fileName) {
  const sourceIndex = path.basename(fileName, path.extname(fileName)).replace(/^tile_/, "");
  const groupPart = group.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return `rpgUrban${groupPart[0].toUpperCase()}${groupPart.slice(1)}${sourceIndex}`;
}

function makeDisplayName(group, fileName) {
  const sourceIndex = path.basename(fileName, path.extname(fileName)).replace(/^tile_/, "");
  return `RPG Urban / ${group.replaceAll("_", " ")} / ${sourceIndex}`;
}

function getTileGroup(tilesRoot, filePath) {
  const relativePath = path.relative(tilesRoot, filePath);
  const [group] = relativePath.split(path.sep);
  if (!group || group === "." || group === "..") {
    throw new Error(`Expected ${filePath} to be inside a group directory below ${tilesRoot}`);
  }

  return group;
}

function buildJres(tiles) {
  const jres = {
    "*": {
      namespace: "myTiles",
      mimeType: "image/x-mkcd-f4",
      dataEncoding: "base64",
    },
  };

  for (const tile of tiles) {
    const assetId = tile.assetId || makeAssetId(tile.group, tile.fileName);
    if (jres[assetId]) {
      throw new Error(`Duplicate asset id: ${assetId}`);
    }

    const indexedPixels = quantizeRgba(tile.rgba, tile.width, tile.height);
    jres[assetId] = {
      data: encodeF4(indexedPixels, tile.width, tile.height).toString("base64"),
      tilemapTile: true,
      displayName: tile.displayName || makeDisplayName(tile.group, tile.fileName),
    };
  }

  return jres;
}

function loadTiles(batchRoot) {
  const tilesRoot = path.join(batchRoot, "tiles");
  if (!fs.existsSync(tilesRoot) || !fs.statSync(tilesRoot).isDirectory()) {
    throw new Error(`Missing tiles directory: ${tilesRoot}`);
  }

  const files = collectPngFiles(tilesRoot);
  if (files.length === 0) {
    throw new Error(`No PNG tiles found below ${tilesRoot}`);
  }

  return files.map((filePath) => {
    const image = readPng(filePath);
    return {
      group: getTileGroup(tilesRoot, filePath),
      fileName: path.basename(filePath),
      width: image.width,
      height: image.height,
      rgba: image.data,
    };
  });
}

function findTile(tiles, group, sourceIndex) {
  const fileName = `tile_${String(sourceIndex).padStart(4, "0")}.png`;
  const tile = tiles.find((candidate) =>
    candidate.group === group && candidate.fileName === fileName
  );

  if (!tile) {
    throw new Error(`Missing source tile for composite: ${group}/${fileName}`);
  }

  return tile;
}

function compositeRgba(layers) {
  if (!layers.length) {
    throw new Error("Composite requires at least one layer");
  }

  const length = layers[0].rgba.length;
  const result = new Uint8Array(length);

  for (const layer of layers) {
    if (layer.rgba.length !== length) {
      throw new Error("Composite layers must have matching dimensions");
    }

    for (let offset = 0; offset < length; offset += 4) {
      const alpha = layer.rgba[offset + 3];
      if (alpha === 0) continue;
      if (alpha !== 255) {
        throw new Error("Composite layers must use only fully transparent or opaque pixels");
      }

      result[offset] = layer.rgba[offset];
      result[offset + 1] = layer.rgba[offset + 1];
      result[offset + 2] = layer.rgba[offset + 2];
      result[offset + 3] = 255;
    }
  }

  return result;
}

function makeReadyTile(assetId, displayName, layers) {
  return {
    group: "ready",
    fileName: assetId,
    assetId,
    displayName,
    width: tileSize,
    height: tileSize,
    rgba: compositeRgba(layers),
  };
}

function buildReadyTiles(tiles) {
  const pavement = findTile(tiles, "pavement", 36);
  const road = findTile(tiles, "road", 441);
  const storefrontMiddle = findTile(tiles, "savehouse_facade", 360);
  const ready = [];

  const pavementProps = [164, 165, 166, 168, 169, 190, 223, 250, 254, 279, 280, 305, 306];
  for (const sourceIndex of pavementProps) {
    ready.push(makeReadyTile(
      `rpgUrbanReadyStreetProps${String(sourceIndex).padStart(4, "0")}Pavement`,
      `RPG Urban / READY / pavement prop / ${String(sourceIndex).padStart(4, "0")}`,
      [pavement, findTile(tiles, "street_props", sourceIndex)],
    ));
  }

  const roadProps = [221, 222, 307];
  for (const sourceIndex of roadProps) {
    ready.push(makeReadyTile(
      `rpgUrbanReadyStreetProps${String(sourceIndex).padStart(4, "0")}Road`,
      `RPG Urban / READY / road prop / ${String(sourceIndex).padStart(4, "0")}`,
      [road, findTile(tiles, "street_props", sourceIndex)],
    ));
  }

  const vegetation = [259, 260, 265, 286, 287];
  for (const sourceIndex of vegetation) {
    ready.push(makeReadyTile(
      `rpgUrbanReadyVegetation${String(sourceIndex).padStart(4, "0")}Pavement`,
      `RPG Urban / READY / pavement vegetation / ${String(sourceIndex).padStart(4, "0")}`,
      [pavement, findTile(tiles, "vegetation", sourceIndex)],
    ));
  }

  const storefronts = [
    { awning: 328, frame: 359, suffix: "Left" },
    { awning: 329, frame: null, suffix: "Middle" },
    { awning: 330, frame: 361, suffix: "Right" },
    { awning: 331, frame: null, suffix: "NarrowLeft" },
    { awning: 332, frame: null, suffix: "NarrowRight" },
  ];
  for (const storefront of storefronts) {
    const layers = [storefrontMiddle];
    if (storefront.frame) {
      layers.push(findTile(tiles, "savehouse_facade", storefront.frame));
    }
    layers.push(findTile(tiles, "savehouse_facade", storefront.awning));
    ready.push(makeReadyTile(
      `rpgUrbanReadyStorefront${storefront.suffix}`,
      `RPG Urban / READY / storefront / ${storefront.suffix}`,
      layers,
    ));
  }

  return ready;
}

function main(args) {
  if (args.length !== 1) {
    throw new Error(
      "Usage: npm run assets:hub -- /path/to/NeonKiez_RPG_Urban_Hub_Batch_01"
    );
  }

  const batchRoot = path.resolve(args[0]);
  const tiles = loadTiles(batchRoot);
  const groups = new Map();

  for (const tile of tiles) {
    const groupTiles = groups.get(tile.group) || [];
    groupTiles.push(tile);
    groups.set(tile.group, groupTiles);
  }

  for (const [group, groupTiles] of groups) {
    const outputPath = path.join(repoRoot, `hub_tiles_${group}.jres`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(buildJres(groupTiles), null, 4) + "\n",
      "utf8"
    );
    console.log(`Wrote ${groupTiles.length} ${group} tiles to ${outputPath}`);
  }

  const readyTiles = buildReadyTiles(tiles);
  const readyOutputPath = path.join(repoRoot, "hub_tiles_ready.jres");
  fs.writeFileSync(
    readyOutputPath,
    JSON.stringify(buildJres(readyTiles), null, 4) + "\n",
    "utf8"
  );
  console.log(`Wrote ${readyTiles.length} ready tiles to ${readyOutputPath}`);
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  HUB_URBAN_PALETTE,
  buildJres,
  buildReadyTiles,
  compositeRgba,
  encodeF4,
  getTileGroup,
  makeAssetId,
  quantizeRgba,
};
