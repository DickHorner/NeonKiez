// Playable center hub room built from the imported RPG Urban tile subset.
// Kept separate from assets_stub.ts so the room can later be replaced by an
// editor-authored tilemap without touching unrelated placeholder assets.

namespace myTiles {
  // These fixed instances connect the JRES payloads to the Arcade tile factory.
  // Without them, assets.tile resolves the names to null at runtime.
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanPavement0035 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanPavement0036 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanPavement0037 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanPavement0066 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0328 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0329 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0330 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0359 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0360 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0361 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0365 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanSavehouseFacade0366 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0433 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0441 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0442 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0460 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0461 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0463 = image.ofBuffer(hex``);
  //% fixedInstance jres blockIdentity=images._tile
  export const rpgUrbanRoad0469 = image.ofBuffer(hex``);
}

function tmHub11Playable(): tiles.TileMapData {
  return tiles.createTilemap(
    hex`10000c00080e0505050505050505050505050f09081006060606060612120606060606110908000000000000000000000000000009080000000000000000000000000000090800000000000000000000000000000908000000000000000000000000000009080101010101010101010101010101090a02020202020202020202020202020b0a02030203020302030203020302030b0a0202020c02020202020d020202020b0a02020202020202020202020202020b01010101010101020201010101010101`,
    img`
      2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
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
      2 2 2 2 2 2 2 . . 2 2 2 2 2 2 2
    `,
    [
      myTiles.rpgUrbanPavement0036,
      myTiles.rpgUrbanPavement0066,
      myTiles.rpgUrbanRoad0441,
      myTiles.rpgUrbanRoad0433,
      myTiles.rpgUrbanRoad0460,
      myTiles.rpgUrbanSavehouseFacade0329,
      myTiles.rpgUrbanSavehouseFacade0360,
      myTiles.rpgUrbanSavehouseFacade0365,
      myTiles.rpgUrbanPavement0035,
      myTiles.rpgUrbanPavement0037,
      myTiles.rpgUrbanRoad0461,
      myTiles.rpgUrbanRoad0463,
      myTiles.rpgUrbanRoad0442,
      myTiles.rpgUrbanRoad0469,
      myTiles.rpgUrbanSavehouseFacade0328,
      myTiles.rpgUrbanSavehouseFacade0330,
      myTiles.rpgUrbanSavehouseFacade0359,
      myTiles.rpgUrbanSavehouseFacade0361,
      myTiles.rpgUrbanSavehouseFacade0366,
    ],
    TileScale.Sixteen,
  );
}
