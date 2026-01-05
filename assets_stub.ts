// Placeholder Assets: Factories for sprites/tilemaps/sounds (humans will replace)

// ============ SPRITES ============

export function imgPlayerTopdown(): Image {
    return image.create(16, 16)  // placeholder: solid square
}

export function imgPlatformPlayer(): Image {
    return image.create(16, 16)
}

export function imgShooterShip(): Image {
    return image.create(16, 16)
}

export function imgAsteroidsShip(): Image {
    return image.create(12, 12)
}

export function imgRhythmPlayer(): Image {
    return image.create(16, 16)
}

export function imgPuzzlePlayer(): Image {
    return image.create(16, 16)
}

export function imgNpc(id: string): Image {
    return image.create(16, 16)
}

export function imgDoor(id: string): Image {
    return image.create(16, 16)
}

export function imgEnemy(id: string): Image {
    return image.create(16, 16)
}

export function imgProjectile(id: string): Image {
    return image.create(4, 4)
}

export function imgDebris(size: number): Image {
    return image.create(size, size)
}

export function imgCollectible(id: string): Image {
    return image.create(8, 8)
}

export function imgToolEffect(toolId: string): Image {
    return image.create(16, 16)
}

// ============ TILEMAPS ============

// Hub rooms (3x3 grid)
export function tmHub00(): tiles.TileMapData { return null as any }
export function tmHub01(): tiles.TileMapData { return null as any }
export function tmHub02(): tiles.TileMapData { return null as any }
export function tmHub10(): tiles.TileMapData { return null as any }
export function tmHub11(): tiles.TileMapData { return null as any }
export function tmHub12(): tiles.TileMapData { return null as any }
export function tmHub20(): tiles.TileMapData { return null as any }
export function tmHub21(): tiles.TileMapData { return null as any }
export function tmHub22(): tiles.TileMapData { return null as any }

// Dungeon 1 stages
export function tmDun01Stage00(): tiles.TileMapData { return null as any }
export function tmDun01Stage01(): tiles.TileMapData { return null as any }
export function tmDun01Stage02(): tiles.TileMapData { return null as any }
export function tmDun01Stage03(): tiles.TileMapData { return null as any }

// Dungeon 2 stages
export function tmDun02Stage00(): tiles.TileMapData { return null as any }
export function tmDun02Stage01(): tiles.TileMapData { return null as any }
export function tmDun02Stage02(): tiles.TileMapData { return null as any }
export function tmDun02Stage03(): tiles.TileMapData { return null as any }

// Dungeon 3 stages
export function tmDun03Stage00(): tiles.TileMapData { return null as any }
export function tmDun03Stage01(): tiles.TileMapData { return null as any }
export function tmDun03Stage02(): tiles.TileMapData { return null as any }
export function tmDun03Stage03(): tiles.TileMapData { return null as any }

// Dungeon 4 stages
export function tmDun04Stage00(): tiles.TileMapData { return null as any }
export function tmDun04Stage01(): tiles.TileMapData { return null as any }
export function tmDun04Stage02(): tiles.TileMapData { return null as any }
export function tmDun04Stage03(): tiles.TileMapData { return null as any }

// Dungeon 5 stages
export function tmDun05Stage00(): tiles.TileMapData { return null as any }
export function tmDun05Stage01(): tiles.TileMapData { return null as any }
export function tmDun05Stage02(): tiles.TileMapData { return null as any }
export function tmDun05Stage03(): tiles.TileMapData { return null as any }

// Dungeon 6 stages
export function tmDun06Stage00(): tiles.TileMapData { return null as any }
export function tmDun06Stage01(): tiles.TileMapData { return null as any }
export function tmDun06Stage02(): tiles.TileMapData { return null as any }
export function tmDun06Stage03(): tiles.TileMapData { return null as any }

// Dungeon 7 stages
export function tmDun07Stage00(): tiles.TileMapData { return null as any }
export function tmDun07Stage01(): tiles.TileMapData { return null as any }
export function tmDun07Stage02(): tiles.TileMapData { return null as any }
export function tmDun07Stage03(): tiles.TileMapData { return null as any }

// Dungeon 8 stages
export function tmDun08Stage00(): tiles.TileMapData { return null as any }
export function tmDun08Stage01(): tiles.TileMapData { return null as any }
export function tmDun08Stage02(): tiles.TileMapData { return null as any }
export function tmDun08Stage03(): tiles.TileMapData { return null as any }

// Dungeon 9 stages
export function tmDun09Stage00(): tiles.TileMapData { return null as any }
export function tmDun09Stage01(): tiles.TileMapData { return null as any }
export function tmDun09Stage02(): tiles.TileMapData { return null as any }
export function tmDun09Stage03(): tiles.TileMapData { return null as any }
export function tmDun09Stage04(): tiles.TileMapData { return null as any }

// ============ SOUNDS ============

export function sfxInteract() { /* music.play(music.createSoundEffect(...)) */ }
export function sfxHit() { }
export function sfxJump() { }
export function sfxShoot() { }
export function sfxCollect() { }
export function sfxDoorOpen() { }
export function sfxToolUse() { }

export function bgmHub() { }
export function bgmDun01() { }
export function bgmDun02() { }
export function bgmDun03() { }
export function bgmDun04() { }
export function bgmDun05() { }
export function bgmDun06() { }
export function bgmDun07() { }
export function bgmDun08() { }
export function bgmDun09() { }

// ============ TILEMAP LOADER ============

export function getTilemapByID(id: string): tiles.TileMapData {
    // Hub
    if (id === "TM_HUB_00") return tmHub00()
    if (id === "TM_HUB_01") return tmHub01()
    if (id === "TM_HUB_02") return tmHub02()
    if (id === "TM_HUB_10") return tmHub10()
    if (id === "TM_HUB_11") return tmHub11()
    if (id === "TM_HUB_12") return tmHub12()
    if (id === "TM_HUB_20") return tmHub20()
    if (id === "TM_HUB_21") return tmHub21()
    if (id === "TM_HUB_22") return tmHub22()
    
    // Dungeon 1
    if (id === "TM_DUN_01_STAGE_00_WARMUP") return tmDun01Stage00()
    if (id === "TM_DUN_01_STAGE_01_DARK_MAZE") return tmDun01Stage01()
    if (id === "TM_DUN_01_STAGE_02_TOKEN_RUN") return tmDun01Stage02()
    if (id === "TM_DUN_01_STAGE_03_EXIT_ROOM") return tmDun01Stage03()
    
    // Dungeon 2
    if (id === "TM_DUN_02_STAGE_00_RANGE") return tmDun02Stage00()
    if (id === "TM_DUN_02_STAGE_01_FORMATIONS") return tmDun02Stage01()
    if (id === "TM_DUN_02_STAGE_02_ALARM") return tmDun02Stage02()
    if (id === "TM_DUN_02_STAGE_03_CORE") return tmDun02Stage03()
    
    // Dungeon 3
    if (id === "TM_DUN_03_STAGE_00_CONVEYOR_INTRO") return tmDun03Stage00()
    if (id === "TM_DUN_03_STAGE_01_BLOCK_ROWS") return tmDun03Stage01()
    if (id === "TM_DUN_03_STAGE_02_MOVING_CRATES") return tmDun03Stage02()
    if (id === "TM_DUN_03_STAGE_03_FINAL_PATTERN") return tmDun03Stage03()
    
    // Dungeon 4
    if (id === "TM_DUN_04_STAGE_00_BEAT_TUTORIAL") return tmDun04Stage00()
    if (id === "TM_DUN_04_STAGE_01_DOORS") return tmDun04Stage01()
    if (id === "TM_DUN_04_STAGE_02_SWITCH_CHAIN") return tmDun04Stage02()
    if (id === "TM_DUN_04_STAGE_03_FINAL_STREAK") return tmDun04Stage03()
    
    // Dungeon 5
    if (id === "TM_DUN_05_STAGE_00_PADDLE_LEARN") return tmDun05Stage00()
    if (id === "TM_DUN_05_STAGE_01_TARGETS") return tmDun05Stage01()
    if (id === "TM_DUN_05_STAGE_02_REFLECTORS") return tmDun05Stage02()
    if (id === "TM_DUN_05_STAGE_03_FINAL_CLEAR") return tmDun05Stage03()
    
    // Dungeon 6
    if (id === "TM_DUN_06_STAGE_00_THRUST") return tmDun06Stage00()
    if (id === "TM_DUN_06_STAGE_01_SPLIT") return tmDun06Stage01()
    if (id === "TM_DUN_06_STAGE_02_PARTS_RUSH") return tmDun06Stage02()
    if (id === "TM_DUN_06_STAGE_03_SURVIVE") return tmDun06Stage03()
    
    // Dungeon 7
    if (id === "TM_DUN_07_STAGE_00_JUMP") return tmDun07Stage00()
    if (id === "TM_DUN_07_STAGE_01_MOVING_SHELVES") return tmDun07Stage01()
    if (id === "TM_DUN_07_STAGE_02_SWITCH_GATES") return tmDun07Stage02()
    if (id === "TM_DUN_07_STAGE_03_FINAL_RUN") return tmDun07Stage03()
    
    // Dungeon 8
    if (id === "TM_DUN_08_STAGE_00_LADDERS") return tmDun08Stage00()
    if (id === "TM_DUN_08_STAGE_01_BARRELS") return tmDun08Stage01()
    if (id === "TM_DUN_08_STAGE_02_TRICK_LADDERS") return tmDun08Stage02()
    if (id === "TM_DUN_08_STAGE_03_TOP_PLATFORM") return tmDun08Stage03()
    
    // Dungeon 9
    if (id === "TM_DUN_09_STAGE_00_META_INTRO") return tmDun09Stage00()
    if (id === "TM_DUN_09_STAGE_01_MICRO_PLATFORM") return tmDun09Stage01()
    if (id === "TM_DUN_09_STAGE_02_MICRO_SHOOTER") return tmDun09Stage02()
    if (id === "TM_DUN_09_STAGE_03_MICRO_RHYTHM") return tmDun09Stage03()
    if (id === "TM_DUN_09_STAGE_04_STABILIZE") return tmDun09Stage04()
    
    return null as any  // fallback
}
