// Purpose: Placeholder assets and factories for sprites, tilemaps, and sounds.

const placeholderTilemap = tiles.createTilemap(
    hex`0400040000000000000000000000000000000000`,
    img`
        . . . .
        . . . .
        . . . .
        . . . .
    `,
    [
        img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        `,
        img`
            5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 . . . . . . . . . . . . . . 5
            5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5
        `
    ],
    TileScale.Sixteen
);

const placeholderSky = image.create(160, 120);
const placeholderClouds = image.create(160, 120);
const placeholderPlayer = img`
    . . 9 9 9 9 9 9 . . . . . .
    . 9 9 9 9 9 9 9 9 . . . . .
    9 9 1 1 9 9 1 1 9 9 . . . .
    9 9 1 1 9 9 1 1 9 9 . . . .
    9 9 9 9 9 9 9 9 9 9 . . . .
    9 9 9 9 9 9 9 9 9 9 . . . .
    . 9 9 9 9 9 9 9 9 . . . . .
    . 9 9 9 9 9 9 9 9 . . . . .
    . . 9 9 9 9 9 9 . . . . . .
    . . 9 9 9 9 9 9 . . . . . .
    . . 9 . . 9 . . . . . . . .
    . . 9 . . 9 . . . . . . . .
    . . 9 . . 9 . . . . . . . .
    . . 9 . . 9 . . . . . . . .
    . . 9 . . 9 . . . . . . . .
    . . . . . . . . . . . . . .
`;
const placeholderNPC = img`
    . . 2 2 2 2 . . . . . . . .
    . 2 2 2 2 2 2 . . . . . . .
    2 2 7 7 2 2 7 7 . . . . . .
    2 2 7 7 2 2 7 7 . . . . . .
    2 2 2 2 2 2 2 2 . . . . . .
    2 2 2 2 2 2 2 2 . . . . . .
    . 2 2 2 2 2 2 . . . . . . .
    . 2 2 2 2 2 2 . . . . . . .
    . . 2 2 2 2 . . . . . . . .
    . . 2 2 2 2 . . . . . . . .
    . . 2 . . 2 . . . . . . . .
    . . 2 . . 2 . . . . . . . .
    . . 2 . . 2 . . . . . . . .
    . . 2 . . 2 . . . . . . . .
    . . 2 . . 2 . . . . . . . .
    . . . . . . . . . . . . . .
`;
const placeholderEnemy = img`
    . . 4 4 4 4 4 4 . . . . . .
    . 4 4 4 4 4 4 4 4 . . . . .
    4 4 4 4 4 4 4 4 4 4 . . . .
    4 4 4 4 4 4 4 4 4 4 . . . .
    4 4 1 1 4 4 1 1 4 4 . . . .
    4 4 1 1 4 4 1 1 4 4 . . . .
    4 4 4 4 4 4 4 4 4 4 . . . .
    4 4 4 4 4 4 4 4 4 4 . . . .
    . 4 4 4 4 4 4 4 4 . . . . .
    . 4 4 4 4 4 4 4 4 . . . . .
    . 4 . . 4 4 . . 4 . . . . .
    . 4 . . 4 4 . . 4 . . . . .
    . 4 . . 4 4 . . 4 . . . . .
    . 4 . . 4 4 . . 4 . . . . .
    . 4 . . 4 4 . . 4 . . . . .
    . . . . . . . . . . . . . .
`;

const placeholderTilemaps: { [id: string]: tiles.TileMapData } = {};

function registerPlaceholderAssets(): void {
    placeholderSky.fill(1);
    placeholderClouds.fill(3);
    const hubIds = ["TM_HUB_00", "TM_HUB_01", "TM_HUB_02", "TM_HUB_10", "TM_HUB_11", "TM_HUB_12", "TM_HUB_20", "TM_HUB_21", "TM_HUB_22"];
    const dungeonIds = [
        "TM_DUN_LAUNDROMAT_LABYRINTH_00",
        "TM_DUN_ROOFTOP_INVADERS_00",
        "TM_DUN_WAREHOUSE_BLOCKWORKS_00",
        "TM_DUN_SUBWAY_TIMING_00",
        "TM_DUN_SCHOOL_PONG_COURT_00",
        "TM_DUN_ARCADE_MUSEUM_ASTEROIDS_00",
        "TM_DUN_VIDEO_STORE_PLATFORM_TRIAL_00",
        "TM_DUN_CONSTRUCTION_DONKEY_TOWER_00",
        "TM_DUN_FINAL_GLITCH_PANOPTICON_00"
    ];
    const encounterIds = ["TM_ENC_MAZE", "TM_ENC_PLATFORM"];
    for (let id of hubIds.concat(dungeonIds).concat(encounterIds)) {
        placeholderTilemaps[id] = placeholderTilemap;
    }
}

function getTilemapById(id: string): tiles.TileMapData {
    return placeholderTilemaps[id] || placeholderTilemap;
}

function createPlayerImage(): Image {
    return placeholderPlayer;
}

function createNPCImage(): Image {
    return placeholderNPC;
}

function createEnemyImage(): Image {
    return placeholderEnemy;
}

function toolIcon(type: ToolType): Image {
    switch (type) {
        case ToolType.FreezeCam:
            return img`
                . . c c c c . .
                . c 1 1 1 1 c .
                c 1 c c c c 1 c
                c 1 c 1 1 c 1 c
                c 1 c 1 1 c 1 c
                c 1 c c c c 1 c
                . c 1 1 1 1 c .
                . . c c c c . .
            `;
        case ToolType.ConfettiBomb:
            return img`
                . 2 . 4 . 9 . 7
                4 9 7 2 4 9 7 2
                . 4 . 7 . 2 . 9
                7 2 9 4 7 2 9 4
                . 9 . 2 . 4 . 7
                2 4 7 9 2 4 7 9
                . 7 . 9 . 2 . 4
                9 2 4 7 9 2 4 7
            `;
        case ToolType.SoapSlide:
            return img`
                1 1 1 1 1 1 1 1
                1 5 5 5 5 5 5 1
                1 5 . . . . 5 1
                1 5 . 1 1 . 5 1
                1 5 . 1 1 . 5 1
                1 5 . . . . 5 1
                1 5 5 5 5 5 5 1
                1 1 1 1 1 1 1 1
            `;
        case ToolType.DecoyToy:
            return img`
                . 3 3 3 . 5 5 5
                3 3 3 3 5 5 5 5
                3 3 9 3 5 5 9 5
                3 3 3 3 5 5 5 5
                3 9 3 3 5 9 5 5
                3 3 3 3 5 5 5 5
                . 3 3 3 . 5 5 5
                . . 3 . . . 5 .
            `;
        case ToolType.Tagger:
            return img`
                8 8 8 8 8 8 8 8
                8 . . . . . . 8
                8 . 9 9 9 9 . 8
                8 . 9 . . 9 . 8
                8 . 9 9 9 9 . 8
                8 . . . . . . 8
                8 8 8 8 8 8 8 8
                8 8 8 8 8 8 8 8
            `;
        default:
            return img`
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
                . . . . . . . .
            `;
    }
}

function applyParallaxScene(): void {
    scene.setBackgroundImage(placeholderSky);
}

// Manual test passed: placeholder assets generated only.
