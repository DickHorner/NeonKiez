// Playable center hub room built from the imported RPG Urban tile subset.
// Kept separate from assets_stub.ts so the room can later be replaced by an
// editor-authored tilemap without touching unrelated placeholder assets.

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
      assets.tile`rpgUrbanPavement0036`,
      assets.tile`rpgUrbanSavehouseFacade0365`,
      assets.tile`rpgUrbanRoad0441`,
    ],
    TileScale.Sixteen,
  );
}
