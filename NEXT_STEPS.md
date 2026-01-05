# Next Steps for Neon-Kiez

## Immediate Actions (To Get Running in MakeCode)

### 1. Open in MakeCode Arcade
1. Go to https://arcade.makecode.com
2. Import this repository or create new project
3. Add extensions:
   - `microsoft/arcade-background-scroll`
   - `riknoll/arcade-overworld`
   - `microsoft/arcade-storytelling`
   - `riknoll/arcade-mini-menu`

### 2. Create Placeholder Tilemaps (Required)
The code references tilemaps that must be created in the MakeCode tilemap editor:

**Hub Rooms (3×3 grid):**
- TM_HUB_00, TM_HUB_01, TM_HUB_02
- TM_HUB_10, TM_HUB_11, TM_HUB_12
- TM_HUB_20, TM_HUB_21, TM_HUB_22

**Dungeon 7 (Platform) - Priority:**
- TM_DUN_07_STAGE_00_JUMP (simple platform layout)
- TM_DUN_07_STAGE_01_MOVING_SHELVES
- TM_DUN_07_STAGE_02_SWITCH_GATES
- TM_DUN_07_STAGE_03_FINAL_RUN

**Dungeon 6 (Asteroids) - Priority:**
- No tilemaps needed (open space)

**Minimum to Test:**
Just create TM_HUB_11 (center hub room) with:
- Empty 20×15 tile room
- Add tile at location (10, 7) for player spawn
- Add a colored tile to represent a door

### 3. Update assets_stub.ts with Real Tilemaps
After creating tilemaps in editor, update the functions:
```typescript
export function tmHub11(): tiles.TileMapData {
    return tilemap`level1`  // use actual tilemap name from editor
}
```

### 4. Create Basic Sprites
In MakeCode sprite editor, create:
- 16×16 player sprite (any simple character)
- 16×16 door sprite (any colored square)
- 16×16 NPC sprite (any simple character)

Update assets_stub.ts:
```typescript
export function imgPlayerTopdown(): Image {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        // ... your pixel art
    `
}
```

### 5. Test Basic Flow
1. Run in simulator
2. Should see title screen
3. Click through to hub
4. Player should spawn and be controllable
5. If working: approach door and press A to test dungeon entry

## Phase 1: Platform Mode (Full Implementation)

### Files to Modify: game_controller.ts, player_modes.ts

1. **Add Platform Physics**:
```typescript
// In updatePlatformMode():
// Check if player on ground
if (playerSprite.isHittingTile(CollisionDirection.Bottom)) {
    // can jump
}
```

2. **Add Moving Platforms**:
```typescript
// In setupPlatformMode():
const platform = sprites.create(img`...`, KIND_PLATFORM_MOVING)
platform.x = 50
platform.y = 80
platform.vx = 20
```

3. **Add Goal Detection** (already scaffolded):
```typescript
// Check for TILE_GOAL_FLAG and trigger stage complete
```

4. **Test Each Stage**:
   - Stage 0: Simple jumps
   - Stage 1: Moving platforms
   - Stage 2: Switch + gate
   - Stage 3: Combination

## Phase 2: Asteroids Mode (Full Implementation)

### Files to Modify: game_controller.ts, player_modes.ts

1. **Spawn Initial Debris**:
```typescript
// In setupAsteroidsMode():
for (let i = 0; i < 3; i++) {
    spawnDebris(3)  // size 3 = large
}
```

2. **Implement Split Mechanic**:
```typescript
sprites.onDestroyed(KIND_DEBRIS, (sprite) => {
    const size = sprite.data
    if (size > 1) {
        spawnDebris(size - 1)
        spawnDebris(size - 1)
    }
})
```

3. **Add Parts Collection**:
```typescript
// Spawn collectible parts
const part = sprites.create(imgCollectible("PART"), KIND_COLLECTIBLE)
sprites.onOverlap(KIND_PLAYER, KIND_COLLECTIBLE, (player, part) => {
    state.dungeonStageData.partsCollected++
    part.destroy()
})
```

4. **Add Survive Timer** (Stage 3):
```typescript
// Track elapsed time, complete when target reached
```

## Phase 3: Hub Room Transitions

### Files to Modify: game_controller.ts, player_topdown.ts

1. **Use arcade-overworld for Grid**:
```typescript
// Instead of single tilemap, use overworld.setTilemap() per room
// Handle transitions on edge crossing
```

2. **Implement Edge Detection**:
```typescript
game.onUpdate(() => {
    if (playerSprite.x < 0) {
        // Move to left room
        changeRoom(state.hubRoom.row, state.hubRoom.col - 1)
    }
    // Similar for other edges
})
```

## Phase 4: Add Enemies & Hazards

### New File: enemies.ts

1. **Simple Enemy AI**:
```typescript
export function spawnPatrolEnemy(x: number, y: number) {
    const enemy = sprites.create(imgEnemy("PATROL"), KIND_ENEMY)
    enemy.x = x
    enemy.y = y
    enemy.vx = 20
    
    // Bounce at walls
    scene.onHitWall(KIND_ENEMY, (sprite) => {
        sprite.vx *= -1
    })
}
```

2. **Overlap Damage**:
```typescript
sprites.onOverlap(KIND_PLAYER, KIND_ENEMY, (player, enemy) => {
    damagePlayer(1)
})
```

3. **Spawn Cap Enforcement**:
```typescript
// Before spawning, check:
if (sprites.allOfKind(KIND_ENEMY).length >= CAP_MAX_ENEMIES) return
```

## Phase 5: Shooter Mode

### Implementation Steps:
1. Create wave system
2. Spawn enemies in formations
3. Enemy shoot back (with cap)
4. Core boss with HP bar

## Phase 6: Rhythm Mode

### Implementation Steps:
1. Visual beat indicator
2. Window timing checks (already scaffolded)
3. Door unlock on streak
4. Miss penalty with restart

## Phase 7: Puzzle Modes

### Implementation Steps:
1. Switch/gate wiring
2. Token collection
3. Block pushing mechanics
4. Paddle/ball physics

## Phase 8: Meta Mode (Dungeon 9)

### Implementation Steps:
1. Micro-stage orchestrator
2. Quick mode switches (15-20s each)
3. Aggregate score/completion

## Phase 9: Polish

1. **Sound Effects**: Add to assets_stub.ts sound functions
2. **Visual Effects**: Confetti, sparks, freeze effects for tools
3. **Better HUD**: Replace textsprites with images
4. **Music**: Per dungeon BGM
5. **Particle Effects**: Tool usage, hits, collectibles

## Phase 10: Content Population

1. Fill all 9 hub rooms with:
   - NPCs with dialogs
   - Doors to dungeons
   - Savehouse (center room)
   - Decorations

2. Create all dungeon stages (36 stages total)

3. Write quest specs (add to quests.ts)

4. Replace all placeholder texts with real dialog

## Testing Checklist

- [ ] Title → Hub works
- [ ] Hub movement smooth
- [ ] Door interaction opens cutscene
- [ ] Dungeon mode switches immediately
- [ ] Player controls work per mode
- [ ] Stage progression works
- [ ] Rewards applied on completion
- [ ] Return to hub works
- [ ] Save/Continue works
- [ ] Tool unlocking works
- [ ] Tool usage works
- [ ] 10-minute run no slowdown
- [ ] All 9 dungeons completable
- [ ] Final dungeon unlocks after 8 cleared

## Performance Monitoring

Watch for:
- Sprite count (use debug.showDebugOverlay())
- Projectile cap enforcement
- Enemy cap enforcement
- Memory usage in long runs
- Frame rate drops

## Content Creation Workflow

1. **Design stage layout** (paper/digital sketch)
2. **Create tilemap** in MakeCode editor
3. **Add tilemap reference** to assets_stub.ts
4. **Test in game**
5. **Add enemies/hazards** (if needed)
6. **Balance difficulty**
7. **Add rewards** to dungeon spec

## Ready to Go!

The architecture is complete. Focus on:
1. Creating tilemaps
2. Adding sprites
3. Testing mode by mode
4. Iterating on gameplay

Good luck! 🎮✨
