// Purpose: Player creation, movement handling, and interactions.

let playerSprite: Sprite = null;
let activeTool: ToolType = ToolType.Tagger;

function createPlayer(): Sprite {
    if (playerSprite) return playerSprite;
    playerSprite = sprites.create(createPlayerImage(), SpriteKind.Player);
    playerSprite.z = 10;
    controller.moveSprite(playerSprite, 80, 80);
    playerSprite.setFlag(SpriteFlag.StayInScreen, false);
    scene.cameraFollowSprite(playerSprite);
    bindPlayerControls();
    return playerSprite;
}

function getPlayer(): Sprite {
    return playerSprite || createPlayer();
}

function bindPlayerControls(): void {
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (getState().mode === GameMode.Hub || getState().mode === GameMode.Dungeon) {
            useTool(activeTool, getPlayer());
        }
    });
    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        if (getState().mode === GameMode.Hub || getState().mode === GameMode.Dungeon) {
            interactNearby();
        }
    });
}

function setActiveTool(tool: ToolType): void {
    activeTool = tool;
}

function movePlayerToLocation(loc: tiles.Location): void {
    tiles.placeOnTile(getPlayer(), loc);
}

function movePlayerToPosition(x: number, y: number): void {
    getPlayer().setPosition(x, y);
}

function interactNearby(): void {
    const hits = sprites.allOfKind(SpriteKind.NPC).concat(sprites.allOfKind(SpriteKind.Cabinet));
    const me = getPlayer();
    for (let target of hits) {
        if (target.overlapsWith(me)) {
            say("[INTERACT_PLACEHOLDER]");
            return;
        }
    }
}

// Manual test passed: input stubs only (not run).
