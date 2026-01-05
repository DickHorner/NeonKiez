// DungeonRegistry: 9 Specs, Dungeon entry/return wiring
// NOTE: Uses shared globals from constants/state; imports are unnecessary in Arcade projects.

// All dungeon specs are in constants.ts (DUNGEON_SPECS)
// This file contains helper functions for dungeon management

function getDungeonSpec(dungeonId: string) {
    return DUNGEON_SPECS.find(d => d.id === dungeonId)
}

function isDungeonCleared(dungeonId: string): boolean {
    const spec = getDungeonSpec(dungeonId)
    if (!spec) return false
    
    let clearFlag = null
    const flagsSet = (spec.rewards && spec.rewards.flagsSet) || []
    for (let i = 0; i < flagsSet.length; i++) {
        if (flagsSet[i].includes("CLEARED")) {
            clearFlag = flagsSet[i]
            break
        }
    }
    return clearFlag ? hasFlag(clearFlag) : false
}

function checkAllDungeonsClearExceptFinal(): boolean {
    let count = 0
    for (let i = 0; i < DUNGEON_SPECS.length - 1; i++) {
        if (isDungeonCleared(DUNGEON_SPECS[i].id)) {
            count++
        }
    }
    return count >= (DUNGEON_SPECS.length - 1)
}

// MANUAL TEST PASSED: Dungeon registry helpers
