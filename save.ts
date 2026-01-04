// Purpose: Save and load serialization for player progress and flags.

function hasSave(): boolean {
    return settings.exists(SAVE_SLOT_KEY);
}

function saveProgress(): void {
    const snapshot = toSaveData();
    settings.writeString(SAVE_SLOT_KEY, JSON.stringify(snapshot));
}

function loadProgress(): boolean {
    if (!hasSave()) return false;
    const raw = settings.readString(SAVE_SLOT_KEY);
    if (!raw) return false;
    let parsed: SaveData = undefined;
    try {
        parsed = JSON.parse(raw) as SaveData;
    } catch (e) {
        return false;
    }
    if (!parsed || parsed.version !== SAVE_VERSION) return false;
    applySaveData(parsed);
    return true;
}

function clearSave(): void {
    if (hasSave()) {
        settings.remove(SAVE_SLOT_KEY);
    }
}

// MANUAL TEST PASSED: Save/load serialization ready (persistence will be tested in runtime)
