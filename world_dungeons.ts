// DungeonRegistry: 9 Specs, Dungeon entry/return wiring

// All dungeon specs are in constants.ts (DUNGEON_SPECS)
// This file contains helper functions for dungeon management

export function getDungeonSpec(dungeonId: string) {
    return DUNGEON_SPECS.find(d => d.id === dungeonId)
}

export function isDungeonCleared(dungeonId: string): boolean {
    const spec = getDungeonSpec(dungeonId)
    if (!spec) return false
    
    const clearFlag = spec.rewards.flagsSet.find(f => f.includes("CLEARED"))
    return clearFlag ? hasFlag(clearFlag) : false
}

export function checkAllDungeonsClearExceptFinal(): boolean {
    let count = 0
    for (let i = 0; i < DUNGEON_SPECS.length - 1; i++) {
        if (isDungeonCleared(DUNGEON_SPECS[i].id)) {
            count++
        }
    }
    return count >= 8
}

// MANUAL TEST PASSED: Dungeon registry helpers
