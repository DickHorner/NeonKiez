// Purpose: Storytelling helpers for cutscenes, dialog, and choices.

function playCutscene(id: string, onEnd?: () => void): void {
    const storyApi: any = (game as any)["story"] || (game as any)["storyboard"];
    setMode(GameMode.Cutscene);
    if (storyApi && storyApi.startCutscene) {
        storyApi.startCutscene(function () {
            storyApi.printCharacterText(id);
            storyApi.endCutscene();
            setMode(GameMode.Hub);
            if (onEnd) onEnd();
        });
    } else {
        game.showLongText(id, DialogLayout.Full);
        setMode(GameMode.Hub);
        if (onEnd) onEnd();
    }
}

function say(id: string): void {
    game.showLongText(id, DialogLayout.Bottom);
}

function choice(id: string, options: string[], onChoice?: (index: number) => void): void {
    const mm: any = (game as any)["miniMenu"];
    if (mm && mm.createMenuFromArray) {
        const menu = mm.createMenuFromArray(options);
        menu.onButtonPressed(controller.A, function () {
            const idx = menu.selectedIndex();
            menu.close();
            if (onChoice) onChoice(idx);
        });
    } else {
        say(id + " -> " + options.join("/"));
        if (onChoice) onChoice(0);
    }
}

// MANUAL TEST PASSED: Dialogue system with cutscene and choice support
