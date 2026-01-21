# Dungeon 8 Test Plan - Construction Donkey Tower

## Overview
Test plan for Dungeon 8 (DUN_CONSTRUCTION_DONKEY_TOWER), a platform dungeon featuring ladder climbing and barrel hazards.

## Test Cases

### TC1: Dungeon Entry
**Steps:**
1. Start game and navigate to Hub room (2,2)
2. Approach Dungeon 8 door at position (80, 80)
3. Press A to interact with door

**Expected:**
- Intro cutscene plays: `[CUT_DUN_08_ENTRY_BEAT_BAUSTELLE_RUMMST]`
- Mode switches to DUN_PLATFORM immediately after cutscene
- Stage 0 tilemap loads: TM_DUN_08_STAGE_00_LADDERS
- Player spawns at spawn position with gravity enabled

### TC2: Stage 0 - Ladder Tutorial
**Steps:**
1. Complete TC1 to enter dungeon
2. Move player to ladder tile (marked with TILE_LADDER = 6)
3. Press Up/Down on D-Pad while on ladder
4. Navigate to goal tile (TILE_GOAL_FLAG = 7)

**Expected:**
- Ladder tiles at positions visible on tilemap
- Player can climb ladders with Up/Down
- Gravity disabled while on ladder
- Left/Right movement still works on ladder
- Reaching goal tile triggers stage completion
- Auto-advances to Stage 1

### TC3: Stage 1 - Barrel Hazards
**Steps:**
1. Complete TC2 to reach Stage 1
2. Wait for barrel spawn (every 3 seconds)
3. Allow barrel to collide with player
4. Navigate to goal while avoiding barrels

**Expected:**
- Barrels spawn at top position (20, 20)
- Maximum 4 barrels on screen (barrelSpawnCap)
- Barrels roll with vx=30 and gravity
- Barrels bounce on walls
- Barrels auto-destroy after 10 seconds
- Collision causes knockback (no damage, kinderfreundlich)
- Player gets i-frames after collision
- Hint displayed: `[BARREL_BUMPED]`
- Can reach goal and advance to Stage 2

### TC4: Stage 2 - Trick Ladders
**Steps:**
1. Complete TC3 to reach Stage 2
2. Navigate ladders with gaps
3. Barrels continue spawning
4. Reach goal tile

**Expected:**
- Ladder sections have gaps requiring jumps
- Barrel spawning continues with same cap
- Timing required to avoid barrels while climbing
- Can reach goal and advance to Stage 3

### TC5: Stage 3 - Top Platform (Final)
**Steps:**
1. Complete TC4 to reach Stage 3
2. Navigate final ladder climb
3. Barrels spawning at higher rate
4. Reach goal tile

**Expected:**
- Final climb layout loaded
- Barrels continue spawning with cap
- Reaching goal completes dungeon
- Rewards applied:
  - FLAG_DUN_08_CLEARED set
  - TOOL_DECOY_TOY unlocked
  - ITEM_CASSETTE_04 added to inventory
- Returns to hub at spawn point SPAWN_HUB_FROM_DUN_08

### TC6: Hub Return
**Steps:**
1. Complete TC5 to finish dungeon
2. Verify spawn location

**Expected:**
- Player returns to Hub room (2,2)
- Spawn position: (80, 80)
- Game mode switches to GameMode.Hub
- Play mode switches to PlayMode.HUB_TOPDOWN
- Top-down controls active
- Dungeon cleared flag persists in save data

### TC7: Ladder Climbing Mechanics
**Steps:**
1. Enter Dungeon 8 Stage 0
2. Move to ladder tile
3. Test all ladder interactions:
   - Up to climb up
   - Down to climb down
   - Left/Right to move horizontally on ladder
   - Jump while on ladder (should not work)
   - Move off ladder to side

**Expected:**
- Up/Down moves player vertically at 50 pixels/sec
- Left/Right movement preserved
- Cannot jump while on ladder
- Gravity disabled only while on ladder tile
- Gravity re-enabled when leaving ladder
- Smooth transition on/off ladder

### TC8: Barrel Spawn Cap
**Steps:**
1. Enter Dungeon 8 Stage 1
2. Wait for 4 barrels to spawn
3. Wait for additional spawn attempts
4. Destroy/avoid a barrel (wait 10s for auto-destroy)
5. Wait for next spawn

**Expected:**
- Maximum 4 barrels spawn
- No 5th barrel spawns while 4 active
- After barrel destroyed, new barrel can spawn
- Spawn interval: 3 seconds
- No performance issues with multiple barrels

### TC9: Barrel Physics
**Steps:**
1. Enter Dungeon 8 Stage 1
2. Observe barrel behavior

**Expected:**
- Barrels spawn at (20, 20)
- Initial velocity: vx=30, vy=0
- Gravity applied: ay=300
- Bounce on screen edges
- Lifespan: 10 seconds (auto-destroy)
- BounceOnWall flag set correctly

### TC10: Dungeon Registry Validation
**Steps:**
1. Run dungeon registry validation

**Expected:**
- Dungeon 8 has 4 stages (not 5)
- All stage IDs are unique
- introCutsceneId is set
- hubReturnSpawnTag is set
- rewards.flagsSet contains FLAG_DUN_08_CLEARED
- No validation errors

## Manual Testing Checklist
- [ ] TC1: Dungeon Entry
- [ ] TC2: Stage 0 - Ladder Tutorial
- [ ] TC3: Stage 1 - Barrel Hazards
- [ ] TC4: Stage 2 - Trick Ladders
- [ ] TC5: Stage 3 - Top Platform (Final)
- [ ] TC6: Hub Return
- [ ] TC7: Ladder Climbing Mechanics
- [ ] TC8: Barrel Spawn Cap
- [ ] TC9: Barrel Physics
- [ ] TC10: Dungeon Registry Validation

## Known Limitations
- Placeholder tilemaps (visual assets to be replaced by designers)
- Placeholder sprites for player, barrels
- Placeholder sound effects
- No visual ladder climbing animation (future enhancement)

## Success Criteria
- All 10 test cases pass
- Full dungeon run (entry → 4 stages → completion → hub return) works without crashes
- Barrel spawn cap enforced correctly
- Ladder climbing feels smooth and responsive
- No performance degradation during barrel spawning
