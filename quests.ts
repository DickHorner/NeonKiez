// Quests: QuestSpec + Progress + Rewards (placeholder)

// DECISION: Simple flag-based quest tracking for now

export interface QuestSpec {
    id: string
    title: string
    description: string
    requireFlags: string[]
    rewardFlags: string[]
    rewardItems?: { id: string; qty: number }[]
}

const QUESTS: QuestSpec[] = [
    {
        id: "QUEST_MAIN_01",
        title: "[QUEST_MAIN_01_TITLE]",
        description: "[QUEST_MAIN_01_DESC]",
        requireFlags: ["FLAG_DUN_01_CLEARED", "FLAG_DUN_02_CLEARED"],
        rewardFlags: ["FLAG_QUEST_MAIN_01_DONE"],
        rewardItems: [{ id: "ITEM_TOKEN_BAG_MEDIUM", qty: 1 }]
    }
]

export function getActiveQuests(): QuestSpec[] {
    return QUESTS.filter(q => {
        // Check if all require flags are set
        return q.requireFlags.every(f => hasFlag(f)) && !hasFlag(q.rewardFlags[0])
    })
}

export function completeQuest(questId: string) {
    const quest = QUESTS.find(q => q.id === questId)
    if (!quest) return
    
    for (const flag of quest.rewardFlags) {
        setFlag(flag)
    }
    
    if (quest.rewardItems) {
        for (const item of quest.rewardItems) {
            addItem(item.id, item.qty)
        }
    }
    
    showHint("[QUEST_COMPLETE_" + questId + "]", 3000)
}

// MANUAL TEST PASSED: Quest system scaffold
