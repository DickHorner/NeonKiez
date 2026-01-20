# Dungeon 3 Test Plan - Warehouse Blockworks

## Overview
This document outlines the testing plan for Dungeon 3 (DUN_WAREHOUSE_BLOCKWORKS), a puzzle-based dungeon with 4 stages focused on conveyor belts, blocks, and gate puzzles.

## Test Environment
- **Dungeon ID**: `DUN_WAREHOUSE_BLOCKWORKS`
- **PlayMode**: `DUN_PUZZLE`
- **Hub Entry**: Room [0, 2] (top-right corner)
- **Return Spawn**: `SPAWN_HUB_FROM_DUN_03` → Room [0, 2] at (80, 80)

## Pre-Test Checklist
- [ ] Project compiles without errors
- [ ] All 4 stage tilemaps are defined
- [ ] Hub room [0, 2] has dungeon door
- [ ] Return spawn point is configured

## Test Cases

### TC-DUN03-001: Entry Flow
**Steps:**
1. Start game, navigate to hub room [0, 2]
2. Interact with Dungeon 3 door
3. Watch intro cutscene: `[CUT_DUN_03_ENTRY_BEAT_GABELSTAPLER_GRUESST]`
4. Verify immediate switch to `DUN_PUZZLE` mode

**Expected:**
- Cutscene plays (placeholder text)
- Mode switches immediately to Puzzle
- Stage 0 tilemap loads
- Player spawns at green switch marker

### TC-DUN03-002: Stage 0 - Conveyor Intro
**Objective:** Learn basic conveyor and gate mechanics

**Steps:**
1. Move player around the stage
2. Activate the switch (tile 9 - buttonTeal)
3. Verify gate (tile 10 - purpleOuterWest0 row) opens
4. Move to goal tile (tile 7 - chestClosed)

**Expected:**
- Switch activation increments `switchesActivated`
- Gates toggle open/closed state
- Reaching goal triggers stage complete
- Advances to Stage 1

### TC-DUN03-003: Stage 1 - Block Rows
**Objective:** Fill block rows to toggle gates

**Steps:**
1. Activate first switch at position [5, 4]
2. Activate second switch at position [13, 4]
3. Verify gates (row 5) open after both switches
4. Reach goal tile

**Expected:**
- Both switches must be activated (`switchesActivated >= 2`)
- Gates open only after both switches
- Stage completes on goal reach
- Advances to Stage 2

### TC-DUN03-004: Stage 2 - Moving Crates
**Objective:** Navigate past moving crate obstacles

**Steps:**
1. Observe 3 crates spawning and moving
2. Verify crates bounce on screen edges
3. Navigate around crates to goal
4. Reach goal tile

**Expected:**
- 3 crates spawn with KIND_HAZARD
- Crates patrol with bouncing behavior
- Goal is reachable without hitting crates
- Stage completes on goal reach
- Advances to Stage 3

### TC-DUN03-005: Stage 3 - Final Pattern
**Objective:** Activate final switch to unlock gate

**Steps:**
1. Activate switch at position [7, 5]
2. Verify gate (row 6) opens
3. Reach goal tile

**Expected:**
- Switch activation opens gate
- Goal becomes accessible
- Stage completes on goal reach
- Dungeon completion triggers

### TC-DUN03-006: Completion & Return
**Steps:**
1. Complete Stage 3
2. Verify rewards applied:
   - Flag: `FLAG_DUN_03_CLEARED`
   - Tool: `TOOL_SOAP_SLIDE` unlocked
   - Item: `ITEM_KEYCARD_A` (qty: 1)
3. Verify return to hub
4. Verify spawn location is room [0, 2] at (80, 80)

**Expected:**
- All rewards applied to state
- Game saves progress
- Returns to hub at correct location
- Player can re-enter dungeon (optional)

## Integration Tests

### IT-DUN03-001: Switch & Gate System
**Test:** Verify switch/gate mechanics work for Dungeon 3

**Steps:**
1. Activate switch in any stage
2. Verify `toggleGatesForDungeon03()` is called
3. Check gate tiles toggle correctly
4. Verify walls are set/unset properly

**Expected:**
- Switch triggers gate logic
- Gate locations are captured on first toggle
- Gates persist state correctly
- No runtime errors

### IT-DUN03-002: Moving Crates AI
**Test:** Verify moving crate behavior

**Steps:**
1. Enter Stage 2
2. Observe crate movement for 30 seconds
3. Verify crates don't leave screen
4. Verify no infinite spawning

**Expected:**
- Crates spawn once (cap: 3)
- Bouncing works at edges
- No progressive slowdown
- Cleanup on stage exit

### IT-DUN03-003: Stage Progression
**Test:** Verify 4-stage flow

**Steps:**
1. Complete each stage in sequence
2. Verify no skipping
3. Verify stage data resets between stages

**Expected:**
- Stages progress 0→1→2→3
- Each stage has clean state
- No carry-over bugs
- Final stage triggers completion

## Performance Tests

### PT-DUN03-001: No Memory Leaks
**Test:** Play through entire dungeon multiple times

**Steps:**
1. Enter dungeon
2. Complete all 4 stages
3. Return to hub
4. Repeat 3 times

**Expected:**
- No progressive slowdown
- Sprites cleanup properly
- No accumulating objects
- Stable framerate

## Edge Cases

### EC-DUN03-001: Early Exit
**Test:** Exit dungeon before completion

**Steps:**
1. Enter dungeon
2. Pause and select exit (if available)
3. Verify cleanup

**Expected:**
- Proper cleanup on early exit
- No rewards applied
- Can re-enter dungeon
- No corrupted state

### EC-DUN03-002: Switch Spam
**Test:** Spam switch activation

**Steps:**
1. Rapidly press interact on switch
2. Verify no duplicate activations
3. Check switch counter is correct

**Expected:**
- Debounce prevents spam
- Counter increments only once per press
- Gates toggle correctly
- No visual glitches

## Manual Test Evidence

### Evidence Requirements
- [ ] Screenshot: Hub room [0, 2] with door
- [ ] Screenshot: Each of 4 stages
- [ ] Screenshot: Switch activated (gates open)
- [ ] Screenshot: Moving crates in Stage 2
- [ ] Screenshot: Completion message
- [ ] Screenshot: Return to hub with rewards

### Test Log Template
```
Date: ___________
Tester: _________
Build: __________

Stage 0: [ ] PASS [ ] FAIL - Notes: _______________
Stage 1: [ ] PASS [ ] FAIL - Notes: _______________
Stage 2: [ ] PASS [ ] FAIL - Notes: _______________
Stage 3: [ ] PASS [ ] FAIL - Notes: _______________
Return: [ ] PASS [ ] FAIL - Notes: _______________

Issues Found:
1. _______________________________________________
2. _______________________________________________

Overall Result: [ ] PASS [ ] FAIL
```

## Acceptance Criteria

All of the following must pass:

- [x] All 4 stage tilemaps created with placeholder graphics
- [x] Switch mechanics implemented (toggle gates)
- [x] Moving crates spawn and patrol (Stage 2)
- [x] Stage progression logic complete
- [x] Win conditions defined for each stage
- [x] Rewards apply on completion
- [x] Return spawn point configured
- [ ] Full playthrough tested (manual)
- [ ] No critical bugs or crashes

## Known Limitations
- Assets are placeholders
- Conveyor belts are visual only (no actual movement logic yet)
- Block pushing not implemented (future feature)
- Pattern validation is simplified (switch-based instead of block positioning)

## Next Steps After Testing
1. If tests pass: Mark issue as complete
2. If tests fail: Document bugs and fix
3. Consider adding:
   - Visual conveyor belt animation
   - Block pushing mechanics
   - More complex gate patterns
   - Sound effects for switches/gates
