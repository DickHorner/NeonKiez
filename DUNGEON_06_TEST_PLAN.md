# Dungeon 6 (Asteroids) Test Plan

## Objective
Verify that Dungeon 6 (DUN_ARCADE_MUSEUM_ASTEROIDS) is fully playable with all 4 stages working correctly.

## Prerequisites
- Hub world is accessible
- Player can navigate to hub room (2,0)

## Test Procedure

### 1. Entry Test
**Steps:**
1. Navigate to hub room (2,0)
2. Locate the Dungeon 6 door
3. Interact with the door (press A when near)

**Expected Results:**
- Intro cutscene plays: "[CUT_DUN_06_ENTRY_BEAT_SCHWERELLOS_IM_MUSEUM]"
- Game transitions to Asteroids mode
- Stage 0 loads with space background
- Player ship spawns at center
- 3 debris spawn at screen edges

**Acceptance Criteria:**
- [ ] Door is visible in hub room (2,0)
- [ ] Cutscene triggers on door interaction
- [ ] Mode switches to DUN_ASTEROIDS after cutscene
- [ ] Player ship spawns correctly
- [ ] Initial debris spawn correctly

---

### 2. Stage 0: THRUST Tutorial
**Objective:** Learn basic controls and clear 3 debris

**Controls Test:**
- Left/Right: Rotate ship
- Up: Thrust forward
- A: Shoot projectile
- Screen wrap works for ship and debris

**Win Condition:** Clear all 3 debris

**Steps:**
1. Rotate ship using Left/Right
2. Thrust using Up
3. Shoot debris using A
4. Verify ship wraps at screen edges
5. Clear all debris

**Expected Results:**
- Ship rotates smoothly
- Thrust accelerates ship in facing direction
- Projectiles fire in facing direction
- Debris destroyed on projectile hit
- Stage completes when all debris cleared
- Stage 1 loads automatically

**Acceptance Criteria:**
- [ ] All controls work as expected
- [ ] Screen wrap works for ship
- [ ] Screen wrap works for debris
- [ ] Debris destroyed by projectiles
- [ ] Stage completes after clearing all debris
- [ ] Stage 1 loads after completion

---

### 3. Stage 1: SPLIT Mechanic
**Objective:** Clear debris with splitting mechanic (depth 2)

**Win Condition:** Clear all debris (original + split children)

**Steps:**
1. Shoot large debris (16px)
2. Observe debris split into 2 smaller pieces (8px)
3. Shoot smaller debris
4. Verify they split again or destroy completely
5. Clear all debris

**Expected Results:**
- 5 debris spawn initially
- Hit large debris → splits into 2 smaller (8px)
- Hit smaller debris → splits into smaller or destroys
- Max split depth is 2 (from params.splitDepth)
- Stage completes when all debris cleared
- Stage 2 loads automatically

**Acceptance Criteria:**
- [ ] Initial debris count is 5
- [ ] Debris split on projectile hit
- [ ] Split depth respects max of 2
- [ ] Debris cap (CAP_MAX_DEBRIS = 15) enforced
- [ ] Stage completes after clearing all debris
- [ ] Stage 2 loads after completion

---

### 4. Stage 2: PARTS_RUSH Collection
**Objective:** Collect 10 parts from destroyed debris

**Win Condition:** Collect 10 parts

**Steps:**
1. Shoot debris
2. Collect parts that spawn from destroyed debris
3. Monitor parts collected count
4. Continue until 10 parts collected

**Expected Results:**
- 8 debris spawn initially
- Destroyed debris drop collectible parts
- Parts have 8-second lifespan
- Parts disappear if not collected in time
- HUD shows parts collected count
- Stage completes when 10 parts collected
- Stage 3 loads automatically

**Acceptance Criteria:**
- [ ] Initial debris count is 8
- [ ] Parts spawn when debris destroyed
- [ ] Parts have limited lifespan (8s)
- [ ] Parts collected on player overlap
- [ ] Hint "[PART_COLLECTED]" shown on collect
- [ ] Parts count tracked correctly
- [ ] Stage completes at 10 parts
- [ ] Stage 3 loads after completion

---

### 5. Stage 3: SURVIVE Timer
**Objective:** Survive for 60 seconds

**Win Condition:** Survive for 60 seconds without losing all hearts

**Steps:**
1. Note start time
2. Dodge debris
3. Shoot debris to clear space
4. Monitor timer
5. Survive for 60 seconds

**Expected Results:**
- 6 debris spawn initially
- New debris spawn every 3 seconds (max 8 on screen)
- Timer counts up from 0 to 60 seconds
- Player takes damage on debris collision (with i-frames)
- Stage completes after 60 seconds
- Dungeon completion triggered

**Acceptance Criteria:**
- [ ] Initial debris count is 6
- [ ] Debris spawn continuously (every 3s)
- [ ] Debris cap enforced (max 8)
- [ ] Timer tracked correctly
- [ ] Player damage on collision
- [ ] I-frames prevent rapid damage
- [ ] Stage completes after 60 seconds
- [ ] Dungeon completion triggered

---

### 6. Dungeon Completion
**Objective:** Verify rewards and return to hub

**Steps:**
1. Complete Stage 3
2. Verify rewards applied
3. Verify return to hub

**Expected Results:**
- Rewards applied:
  - FLAG_DUN_06_CLEARED set
  - FLAG_TRAV_MAGNET_GLOVE set
  - ITEM_CASSETTE_03 added to inventory
- Game saves
- Player returns to hub room (2,0)
- Player spawns at SPAWN_HUB_FROM_DUN_06 (x:80, y:80)

**Acceptance Criteria:**
- [ ] FLAG_DUN_06_CLEARED set
- [ ] FLAG_TRAV_MAGNET_GLOVE set
- [ ] ITEM_CASSETTE_03 in inventory
- [ ] Game auto-saves
- [ ] Return to hub room (2,0)
- [ ] Spawn point correct

---

## Edge Cases & Error Conditions

### Debris Cap Enforcement
**Test:** Spawn more debris than CAP_MAX_DEBRIS (15)
**Expected:** No more than 15 debris on screen at once

### Projectile Cap Enforcement
**Test:** Spam shoot button
**Expected:** No more than CAP_MAX_PROJECTILES (20) on screen at once

### Screen Wrap Edge Cases
**Test:** Ship at exact screen boundary
**Expected:** Smooth wrap without visual glitches

### Collision I-Frames
**Test:** Player hit by debris, immediately hit again
**Expected:** Second hit doesn't damage (1000ms i-frames)

### Part Lifespan
**Test:** Don't collect part for 8+ seconds
**Expected:** Part disappears

### Stage 3 Periodic Spawning
**Test:** Clear all debris in Stage 3
**Expected:** New debris spawn after 3 seconds

---

## Performance Checks

### Memory/Sprite Management
- [ ] All debris destroyed on stage transition
- [ ] No sprite leaks between stages
- [ ] Cleanup on dungeon exit works

### Frame Rate
- [ ] No lag with max debris (15)
- [ ] Smooth movement at all times
- [ ] Screen wrap doesn't cause stutter

---

## Regression Tests

### Hub Navigation
- [ ] Can still navigate hub after returning
- [ ] Other dungeons still accessible
- [ ] Hub state preserved

### Save/Load
- [ ] Dungeon completion saved
- [ ] Flags persist after reload
- [ ] Items persist after reload

---

## Test Evidence

### Manual Test Log
```
Date: 2026-01-20
Tester: Copilot Agent

Test Run #1:
- Entry: [PENDING]
- Stage 0: [PENDING]
- Stage 1: [PENDING]
- Stage 2: [PENDING]
- Stage 3: [PENDING]
- Completion: [PENDING]
- Return: [PENDING]

Notes:
- Implementation complete, manual testing required in MakeCode Arcade simulator
```

---

## Known Limitations

1. **Visual Assets:** All sprites are placeholders (solid squares)
2. **Sound Effects:** SFX functions are stubs (no actual sound)
3. **Background Music:** BGM functions are stubs
4. **Sprite Rotation:** Ship rotation is tracked but not visually applied (TODO in code)
5. **Text Localization:** All text is placeholder IDs

---

## Success Criteria Summary

✅ Implementation Complete:
- [x] 4 tilemaps created (TM_DUN_06_STAGE_00-03)
- [x] Debris spawn system implemented
- [x] Split mechanics implemented (depth 2)
- [x] Stage objectives implemented (clear/collect/survive)
- [x] Collision handlers implemented
- [x] Shooting mechanic added
- [x] Hub room with door created
- [x] Return spawn point configured

⏳ Manual Testing Required:
- [ ] Full playthrough test
- [ ] Edge case verification
- [ ] Performance validation

🎯 Acceptance Criteria from Issue:
- [ ] Dungeon 6 komplett spielbar (4 stages playable)
- [ ] Return spawn point funktioniert (return to hub works)
- [ ] 1 kompletter Run + Return (one complete run + return)
