// Purpose: Kinderfreundliche tool abilities and related effects (no violence/gore).

// DECISION: Tools follow non-violent mechanics as per agents.md - enemies are stunned/frozen/distracted, never killed

interface ToolSpec {
    type: ToolType;
    name: string;
    energyCost: number;
    cooldownMs: number;
    onUse: (source: Sprite) => void;
}

let lastToolUse = 0;
let toolOverlapRegistered = false;

const toolSpecs: { [id: number]: ToolSpec } = {};

function initTools(): void {
    toolSpecs[ToolType.FreezeCam] = {
        type: ToolType.FreezeCam,
        name: "FreezeCam",
        energyCost: 15,
        cooldownMs: 1000,
        onUse: (source: Sprite) => {
            const cone = sprites.createProjectileFromSprite(img`
                . . 1 1 1 . .
                . 1 1 1 1 1 .
                1 1 1 1 1 1 1
                1 1 1 1 1 1 1
                1 1 1 1 1 1 1
                . 1 1 1 1 1 .
                . . 1 1 1 . .
            `, source, source.vx, source.vy);
            cone.lifespan = 400;
            cone.setFlag(SpriteFlag.GhostThroughWalls, true);
            cone.setFlag(SpriteFlag.AutoDestroy, true);
            cone.setKind(SpriteKind.ToolFreeze);
            source.startEffect(effects.coolRadial, 300);
        }
    };
    toolSpecs[ToolType.ConfettiBomb] = {
        type: ToolType.ConfettiBomb,
        name: "ConfettiBomb",
        energyCost: 20,
        cooldownMs: 1200,
        onUse: (source: Sprite) => {
            source.startEffect(effects.confetti, 500);
            for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
                if (e.overlapsWith(source) || Math.abs(source.x - e.x) < 32 || Math.abs(source.y - e.y) < 32) {
                    e.say("[STUN_DANCE]", 400);
                    e.vx = e.vx / 4;
                    e.vy = e.vy / 4;
                }
            }
        }
    };
    toolSpecs[ToolType.SoapSlide] = {
        type: ToolType.SoapSlide,
        name: "SoapSlide",
        energyCost: 10,
        cooldownMs: 900,
        onUse: (source: Sprite) => {
            const puddle = sprites.create(img`
                . . 5 5 5 5 . .
                . 5 5 5 5 5 5 .
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                . 5 5 5 5 5 5 .
                . . 5 5 5 5 . .
            `, SpriteKind.ToolSoap);
            puddle.setPosition(source.x, source.y);
            puddle.lifespan = 800;
            puddle.setFlag(SpriteFlag.GhostThroughWalls, true);
        }
    };
    toolSpecs[ToolType.DecoyToy] = {
        type: ToolType.DecoyToy,
        name: "DecoyToy",
        energyCost: 12,
        cooldownMs: 1500,
        onUse: (source: Sprite) => {
            const decoy = sprites.create(createNPCImage(), SpriteKind.Tool);
            decoy.setPosition(source.x + 12, source.y);
            decoy.lifespan = 1500;
            decoy.say("[LOOK_AT_ME]", 400);
            for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
                e.follow(decoy, 30);
            }
        }
    };
    toolSpecs[ToolType.Tagger] = {
        type: ToolType.Tagger,
        name: "Tagger",
        energyCost: 5,
        cooldownMs: 400,
        onUse: (source: Sprite) => {
            const marker = sprites.createProjectileFromSprite(img`
                8 8 8
                8 8 8
                8 8 8
            `, source, 80, 0);
            marker.lifespan = 400;
            marker.setFlag(SpriteFlag.AutoDestroy, true);
            marker.setKind(SpriteKind.ToolTagger);
        }
    };
    registerToolOverlaps();
}

function useTool(tool: ToolType, source: Sprite): void {
    if (!toolSpecs[ToolType.FreezeCam]) initTools();
    const spec = toolSpecs[tool] || toolSpecs[ToolType.Tagger];
    const now = game.runtime();
    if (now - lastToolUse < spec.cooldownMs) return;
    if (getState().inventory.energy < spec.energyCost) {
        game.showLongText("[LOW_ENERGY]", DialogLayout.Bottom);
        return;
    }
    adjustEnergy(-spec.energyCost);
    spec.onUse(source);
    lastToolUse = now;
}

function registerToolOverlaps(): void {
    if (toolOverlapRegistered) return;
    toolOverlapRegistered = true;
    sprites.onOverlap(SpriteKind.ToolFreeze, SpriteKind.Enemy, function (proj: Sprite, enemy: Sprite) {
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.say("[FROZEN]", 500);
        enemy.startEffect(effects.ashes, 300);
        proj.destroy();
    });
    sprites.onOverlap(SpriteKind.ToolSoap, SpriteKind.Enemy, function (puddle: Sprite, enemy: Sprite) {
        enemy.vx = enemy.vx * -1;
        enemy.vy = enemy.vy * -1;
        enemy.say("[SLIP!]", 300);
    });
    sprites.onOverlap(SpriteKind.ToolTagger, SpriteKind.Enemy, function (marker: Sprite, enemy: Sprite) {
        enemy.say("[TAGGED]", 300);
        enemy.startEffect(effects.spray, 200);
        marker.destroy();
    });
}

// MANUAL TEST PASSED: All 5 tools (FreezeCam, ConfettiBomb, SoapSlide, DecoyToy, Tagger) implemented with non-violent effects
