// Playable center hub room built from the imported RPG Urban tile subset.
// Kept separate from assets_stub.ts so the room can later be replaced by an
// editor-authored tilemap without touching unrelated placeholder assets.

namespace myTiles {
  // These fixed instances connect the JRES payloads to the Arcade tile factory.
  // Without them, assets.tile resolves the names to null at runtime.
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanPavement0036 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0365 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0441 = image.ofBuffer(hex``);
}

function tmHub11Playable(): tiles.TileMapData {
  return tiles.createTilemap(
    hex`10000c00010101010101010101010101010101010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101000000000000000000000000000001010000000000000000000000000000010100000000000000000000000000000101020202020202020202020202020201010202020202020202020202020202010100000000000000000000000000000101010101010101010101010101010101`,
    img`
      2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 . . . . . . . . . . . . . . 2
      2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    `,
    [
      myTiles.rpgUrbanPavement0036,
      myTiles.rpgUrbanSavehouseFacade0365,
      myTiles.rpgUrbanRoad0441,
    ],
    TileScale.Sixteen,
  );
}
