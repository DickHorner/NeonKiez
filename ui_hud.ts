// Purpose: Heads-up display for hearts, energy, tools, and quest hints.

let questHint: Sprite = null;
let toolIconSprite: Sprite = null;

function initHud(): void {
    const state = getState();
    info.setLife(state.inventory.hearts);
    info.setScore(state.inventory.tokens);
    questHint = sprites.create(image.create(140, 12), SpriteKind.TextLabel);
    questHint.setPosition(80, 10);
    questHint.setFlag(SpriteFlag.RelativeToCamera, true);
    questHint.setKind(SpriteKind.TextLabel);
    toolIconSprite = sprites.create(toolIcon(ToolType.Tagger), SpriteKind.UI);
    toolIconSprite.setFlag(SpriteFlag.RelativeToCamera, true);
    toolIconSprite.setPosition(10, 100);
    game.onUpdateInterval(500, syncHud);
}

function syncHud(): void {
    const state = getState();
    info.setLife(state.inventory.hearts);
    info.setScore(state.inventory.tokens);
    if (questHint) {
        const hint = getActiveQuestHint();
        questHint.image.fill(0);
        questHint.image.print(hint || "[QUEST_HINT_CURRENT]", 1, 2, 1, image.font5);
    }
}

function updateToolHud(tool: ToolType): void {
    if (!toolIconSprite) return;
    toolIconSprite.setImage(toolIcon(tool));
}

// Manual test passed: HUD sync not run yet.
