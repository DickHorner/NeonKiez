// Purpose: Quest definitions, progression, and reward triggers.

interface QuestStep {
    id: string;
    hint: string;
    requiredFlag?: string;
}

interface QuestData {
    id: string;
    titlePlaceholder: string;
    steps: QuestStep[];
    flagsRequired: string[];
    flagsSetOnComplete: string[];
    reward?: () => void;
}

const QUESTS: QuestData[] = [
    {
        id: "QUEST_INTRO_ARCADE",
        titlePlaceholder: "[QUEST_INTRO_ARCADE]",
        steps: [
            { id: "FIND_ARCADE", hint: "[QUEST_FIND_ARCADE]" },
            { id: "CLEAR_FIRST_DUNGEON", hint: "[QUEST_CLEAR_LAUNDROMAT]" },
            { id: "TURN_IN_REWARD", hint: "[QUEST_RETURN_SAFEHOUSE]" }
        ],
        flagsRequired: [],
        flagsSetOnComplete: ["FLAG_INTRO_DONE"],
        reward: () => {
            unlockTool(ToolType.Tagger);
            setQuestFlag("FLAG_TOOL_TAGGER_UNLOCKED");
        }
    }
];

let activeQuestId = QUESTS[0].id;
const questProgress: { [id: string]: number } = {};

function initQuests(): void {
    for (let quest of QUESTS) {
        questProgress[quest.id] = 0;
    }
}

function setActiveQuest(id: string): void {
    activeQuestId = id;
}

function advanceQuest(id: string): void {
    const quest = QUESTS.find(q => q.id === id);
    if (!quest) return;
    questProgress[id] = Math.min(quest.steps.length, questProgress[id] + 1);
    if (questProgress[id] >= quest.steps.length) {
        for (let flag of quest.flagsSetOnComplete) {
            setQuestFlag(flag);
        }
        if (quest.reward) quest.reward();
    }
}

function getActiveQuestHint(): string {
    const quest = QUESTS.find(q => q.id === activeQuestId);
    if (!quest) return "[QUEST_NONE]";
    const idx = questProgress[quest.id] || 0;
    if (idx >= quest.steps.length) return quest.titlePlaceholder + " [DONE]";
    return quest.steps[idx].hint;
}

// MANUAL TEST PASSED: Quest system with steps and rewards
