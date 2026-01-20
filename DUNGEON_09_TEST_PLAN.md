# Dungeon 9 (Meta) Test Plan

## Overview
Dungeon 9 is the final dungeon featuring 5 stages:
- Stage 0: META_INTRO (brief tutorial)
- Stage 1: MICRO_PLATFORM (20-second platforming)
- Stage 2: MICRO_SHOOTER (destroy 10 targets)
- Stage 3: MICRO_RHYTHM (achieve streak of 5)
- Stage 4: STABILIZE (finale - activate 4 nodes in sequence)

## Test Scenarios

### Test 1: Entry from Hub
**Steps:**
1. Clear all 8 dungeons first
2. Return to center hub room
3. Check that FLAG_ALL_DUNGEONS_CLEARED is set
4. Verify final door appears at position (80, 100)
5. Interact with door

**Expected:**
- Cutscene plays: `[CUT_DUN_09_ENTRY_BEAT_DIE_WELT_HAKT]`
- Game immediately switches to DUN_META mode
- Stage 0 loads

### Test 2: Stage 0 - META_INTRO
**Steps:**
1. Stage loads with hint `[META_INTRO_GET_READY]`
2. Wait 5 seconds

**Expected:**
- Auto-complete after 5 seconds
- Transition to Stage 1
- Clean cleanup (no leftover sprites)

### Test 3: Stage 1 - MICRO_PLATFORM
**Setup:**
- Stage loads with tilemap TM_DUN_09_STAGE_01_MICRO_PLATFORM
- Platform player sprite spawned
- Gravity enabled (ay = 300)
- Goal tile placed at end

**Steps:**
1. Press A to jump
2. Navigate platforms to goal tile
3. Reach goal before 20 seconds

**Expected:**
- Jump works (vy = -150)
- Gravity pulls player down
- Goal detection triggers stage complete
- Hint shows `[MICRO_PLATFORM_COMPLETE]`
- Transition to Stage 2

**Failure Case:**
- If 20 seconds elapse, show `[MICRO_STAGE_TIME_UP]`
- Hard cleanup via switchPlayMode
- Restart Stage 1

### Test 4: Stage 2 - MICRO_SHOOTER
**Setup:**
- Stage loads with tilemap TM_DUN_09_STAGE_02_MICRO_SHOOTER
- Shooter ship spawned at (80, 100)
- 10 targets spawned in grid pattern
- Timer starts (20 seconds)

**Steps:**
1. Press A to shoot bullets
2. Move with D-pad to aim
3. Destroy all 10 targets

**Expected:**
- Bullets spawn (cap: 20 max)
- Bullet lifespan: 2 seconds (auto-destroy)
- Projectile-target overlap destroys both
- Counter increments
- When all targets destroyed, show `[MICRO_SHOOTER_COMPLETE]`
- Transition to Stage 3

**Failure Case:**
- If 20 seconds elapse, restart Stage 2

### Test 5: Stage 3 - MICRO_RHYTHM
**Setup:**
- Stage loads with tilemap TM_DUN_09_STAGE_03_MICRO_RHYTHM
- Rhythm player spawned
- BPM: 120 (500ms beat interval)
- Streak required: 5
- Timer starts (20 seconds)

**Steps:**
1. Watch for beat window visual cue
2. Press A during good window (±200ms from beat)
3. Build streak to 5

**Expected:**
- Good hit: `[RHYTHM_GOOD]`, streak++
- Miss: `[RHYTHM_MISS]`, streak reset to 0
- Streak reaches 5: show `[MICRO_RHYTHM_COMPLETE]`
- Transition to Stage 4

**Failure Case:**
- If 20 seconds elapse, restart Stage 3

### Test 6: Stage 4 - STABILIZE (Finale)
**Setup:**
- Stage loads with tilemap TM_DUN_09_STAGE_04_STABILIZE
- Puzzle player spawned
- 4 stabilization nodes spawned at corners:
  - Node 0: (30, 30)
  - Node 1: (130, 30)
  - Node 2: (30, 90)
  - Node 3: (130, 90)
- Nodes must be activated in sequence (0→1→2→3)

**Steps:**
1. Move to Node 0 (top-left)
2. Overlap triggers activation
3. Move to Node 1 (top-right)
4. Move to Node 2 (bottom-left)
5. Move to Node 3 (bottom-right)

**Expected:**
- Node 0 activated: `[NODE_STABILIZED_0]`, node destroyed
- Node 1 activated: `[NODE_STABILIZED_1]`, node destroyed
- Node 2 activated: `[NODE_STABILIZED_2]`, node destroyed
- Node 3 activated: `[NODE_STABILIZED_3]`, node destroyed
- All nodes stabilized: `[STABILIZE_COMPLETE]`
- Dungeon complete!

**Wrong Order Case:**
- Touch Node 1 before Node 0: `[WRONG_NODE_ORDER]`, nothing happens
- Touch Node 3 before Node 2: `[WRONG_NODE_ORDER]`, nothing happens

### Test 7: Dungeon Completion
**Steps:**
1. Complete Stage 4
2. Verify rewards applied

**Expected Rewards:**
- `FLAG_DUN_09_CLEARED` set
- `FLAG_GAME_COMPLETED` set
- `FLAG_UNLOCK_FREE_ROAM_PLUS` set
- `FLAG_UNLOCK_COSMETIC_MASKS` set
- Save game auto-triggered
- Return to hub at spawn point `SPAWN_HUB_FROM_DUN_09`
- Player spawned at center room (1, 1) at position (80, 100)

### Test 8: Mode-Bleed Prevention (Critical)
**Test After Each Stage:**
1. Verify all sprites from previous stage destroyed
2. Verify camera reset
3. Verify tilemap changed
4. Verify input handlers work correctly
5. Verify no projectiles/enemies from previous stage persist

**Verification Points:**
- After Stage 0→1: No intro sprites remain
- After Stage 1→2: No platform sprites/projectiles remain
- After Stage 2→3: No shooter bullets/targets remain
- After Stage 3→4: No rhythm beat markers remain
- After Stage 4→Hub: No finale nodes remain

**How to Test:**
- Use debug overlay to count sprites per kind
- Verify KIND_PROJECTILE count = 0 after shooter stage
- Verify KIND_TARGET count = 0 after shooter stage
- Verify KIND_INTERACTABLE count = 0 after finale (except hub NPCs)

### Test 9: Failure Recovery
**Test Each Stage:**
1. Let timer expire
2. Verify clean restart

**Expected:**
- Hard cleanup via `switchPlayMode(DUN_META, {dungeonId, stageIndex})`
- Stage reloads fresh
- No artifacts from failed attempt

### Test 10: Performance
**Steps:**
1. Run full Dungeon 9 (all 5 stages)
2. Monitor frame rate
3. Check sprite counts

**Expected:**
- No progressive slowdown
- Sprite caps respected:
  - Projectiles: max 20
  - Targets: max 10 (stage 2 only)
  - Nodes: max 4 (stage 4 only)
- Auto-destroy on projectiles (lifespan: 2000ms)

## Success Criteria
- ✅ All 5 stages playable
- ✅ No mode-bleeds between stages
- ✅ Clean transitions (hard cleanup works)
- ✅ Completion flags set correctly
- ✅ Rewards applied
- ✅ Return to hub works
- ✅ No memory leaks (sprites cleaned up)
- ✅ No progressive slowdown

## Known Limitations
- All assets are placeholders (image.create)
- All texts are placeholder IDs (will be replaced)
- Visual cues minimal (hints only)
- No music/SFX (stub functions)

## Manual Test Evidence Template
```
Test Run: [Date]
Tester: [Name]

Stage 0 - META_INTRO:
[ ] Auto-completes after 5s
[ ] Clean transition to Stage 1

Stage 1 - MICRO_PLATFORM:
[ ] Jump works
[ ] Goal detection works
[ ] Timer works / restarts on fail
[ ] Clean transition to Stage 2

Stage 2 - MICRO_SHOOTER:
[ ] Shoot works
[ ] Targets spawn (10)
[ ] Targets destroyed on hit
[ ] Timer works / restarts on fail
[ ] Clean transition to Stage 3

Stage 3 - MICRO_RHYTHM:
[ ] Beat timing works
[ ] Streak builds
[ ] Streak resets on miss
[ ] Timer works / restarts on fail
[ ] Clean transition to Stage 4

Stage 4 - STABILIZE:
[ ] Nodes spawn (4)
[ ] Sequence enforcement works
[ ] Wrong order blocked
[ ] All nodes stabilized = complete
[ ] Clean transition to Hub

Completion:
[ ] Flags set correctly
[ ] Rewards applied
[ ] Hub spawn correct
[ ] No leftover sprites

Mode-Bleed Check:
[ ] No platform sprites after Stage 1
[ ] No shooter sprites after Stage 2
[ ] No rhythm sprites after Stage 3
[ ] No finale sprites after Stage 4

Performance:
[ ] No slowdown
[ ] Caps respected
[ ] Auto-destroy works

Overall: PASS / FAIL
Notes: ___________
```
