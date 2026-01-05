// Story wrapper: playCutscene/say/choice with placeholder texts
// NOTE: MakeCode Arcade supplies game/DialogLayout globals; no imports required here.

// DECISION: Using storytelling extension (story.* API)
// All texts are placeholder IDs, humans will replace

export function playCutscene(cutsceneId: string, onComplete?: () => void) {
    // Placeholder: show text briefly
    game.showLongText("[" + cutsceneId + "]", DialogLayout.Bottom)
    if (onComplete) onComplete()
}

export function showDialog(dialogId: string, onComplete?: () => void) {
    game.showLongText("[" + dialogId + "]", DialogLayout.Bottom)
    if (onComplete) onComplete()
}

export function showChoice(promptId: string, options: string[], onSelect: (index: number) => void) {
    // Placeholder: just pick first option for now
    game.showLongText("[" + promptId + "]", DialogLayout.Bottom)
    onSelect(0)
}
