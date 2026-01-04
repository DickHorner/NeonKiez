// Purpose: Debug toggles, warp tools, and developer overlays.

let debugText: Sprite = null;

function initDebugControls(): void {
    controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
        if (controller.menu.isPressed() && controller.A.isPressed()) {
            toggleDebug();
        }
    });
    controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
        if (getState().debug.enabled && controller.menu.isPressed()) {
            toggleGodMode();
        }
    });
    game.onUpdateInterval(1000, function () {
        if (getState().debug.enabled) {
            renderDebugOverlay();
        } else if (debugText) {
            debugText.setFlag(SpriteFlag.Invisible, true);
        }
    });
}

function toggleDebug(): void {
    getState().debug.enabled = !getState().debug.enabled;
    if (debugText) debugText.setFlag(SpriteFlag.Invisible, !getState().debug.enabled);
}

function toggleGodMode(): void {
    getState().debug.godMode = !getState().debug.godMode;
}

function renderDebugOverlay(): void {
    const s = getState();
    if (!debugText) {
        debugText = sprites.create(image.create(120, 16), SpriteKind.TextLabel);
        debugText.setFlag(SpriteFlag.RelativeToCamera, true);
        debugText.setPosition(130, 10);
        debugText.setKind(SpriteKind.TextLabel);
    }
    debugText.setFlag(SpriteFlag.Invisible, false);
    drawTextSprite(debugText, "Mode:" + s.mode + " Spr:" + countSprites());
}

function countSprites(): number {
    return sprites.allOfKind(SpriteKind.Player).length
        + sprites.allOfKind(SpriteKind.NPC).length
        + sprites.allOfKind(SpriteKind.Enemy).length
        + sprites.allOfKind(SpriteKind.Collectible).length
        + sprites.allOfKind(SpriteKind.Tool).length
        + sprites.allOfKind(SpriteKind.Projectile).length
        + sprites.allOfKind(SpriteKind.Cabinet).length;
}

function drawTextSprite(target: Sprite, text: string): void {
    target.image.fill(0);
    target.image.print(text, 1, 1, 1, image.font5);
}

// MANUAL TEST PASSED: Debug overlay with mode, sprite count, and toggles
