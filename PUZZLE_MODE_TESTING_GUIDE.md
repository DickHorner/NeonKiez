# Puzzle Mode v1.0 - Testing Guide

## Overview
This guide provides a comprehensive testing plan for Puzzle mode dungeons 1, 3, and 5.

## Quick Start
1. Open project in MakeCode Arcade (https://arcade.makecode.com)
2. Navigate to hub and interact with dungeon doors
3. Follow stage-by-stage instructions below

---

## Dungeon 1: DUN_LAUNDROMAT_LABYRINTH (Switch/Gate/Token)

**Location:** Hub room (0, 0) - Top-left room  
**Mode:** DUN_PUZZLE  
**Return Spawn:** Hub (0, 0) at (80, 80)

### Stage 0: WARMUP (Tutorial)
- **Objective:** Activate switch + reach goal
- **Expected:** 
  - Find switch tile (buttonTeal sprite)
  - Press A to activate switch
  - Gates toggle open
  - Move to goal tile (chestClosed)
  - Stage completes

### Stage 1: DARK_MAZE (Navigation)
- **Objective:** Navigate maze and reach goal
- **Expected:**
  - No tokens or switches required
  - Find path through maze
  - Reach goal to complete

### Stage 2: TOKEN_RUN (Collection)
- **Objective:** Collect 5 tokens + reach goal
- **Expected:**
  - 5 tokens spawn at tile markers (or scattered)
  - Ghost-Bot patrols horizontally
  - Ghost-Bot collision: harmless knockback + i-frames
  - Collect all tokens (HUD should show count)
  - Reach goal when all collected

### Stage 3: EXIT_ROOM (Final)
- **Objective:** Activate switch + reach goal
- **Expected:**
  - Large gate puzzle
  - Switch activates gates
  - Reach goal to complete dungeon

**Rewards on Completion:**
- TOOL_TAGGER unlocked
- ITEM_CASSETTE_01 received
- FLAG_DUN_01_CLEARED set

---

## Dungeon 3: DUN_WAREHOUSE_BLOCKWORKS (Moving Crates/Latch)

**Location:** Hub room (0, 2) - Top-right room  
**Mode:** DUN_PUZZLE  
**Return Spawn:** Hub (0, 2) at (80, 80)

### Stage 0: CONVEYOR_INTRO (Tutorial)
- **Objective:** Activate switch + reach goal
- **Expected:**
  - Simple tutorial layout
  - 1 switch activates gate
  - Reach goal to complete

### Stage 1: BLOCK_ROWS (Latch System)
- **Objective:** Activate 2 switches + reach goal
- **Expected:**
  - 2 switches placed symmetrically
  - Gates only open after BOTH switches activated (latch behavior)
  - First switch: gates stay closed
  - Second switch: gates open and stay open
  - Reach goal to complete

### Stage 2: MOVING_CRATES (Navigation)
- **Objective:** Navigate around moving crates + reach goal
- **Expected:**
  - 3 moving crates spawn with different velocities
  - Crates bounce on screen edges
  - Crate collision: harmless knockback (no damage)
  - Navigate safely to goal

### Stage 3: FINAL_PATTERN (Final)
- **Objective:** Activate switch + reach goal
- **Expected:**
  - Central switch
  - Full gate barrier
  - Switch opens gates
  - Reach goal to complete dungeon

**Rewards on Completion:**
- TOOL_SOAP_SLIDE unlocked
- ITEM_KEYCARD_A received
- FLAG_DUN_03_CLEARED set

---

## Dungeon 5: DUN_SCHOOL_PONG_COURT (Pong/Breakout)

**Location:** Hub room (1, 2) - Right middle room  
**Mode:** DUN_PUZZLE  
**Return Spawn:** Hub (1, 2) at (80, 80)

### Stage 0: PADDLE_LEARN (Tutorial)
- **Objective:** Destroy 3 targets
- **Expected:**
  - Player sprite transforms into paddle (horizontal-only movement)
  - Press A to serve ball (fixed velocity vx=10, vy=-40 slow)
  - Ball bounces off walls, paddle, and targets
  - Paddle bounce adds horizontal spread based on hit position
  - Center hit: small horizontal velocity
  - Edge hit: large horizontal velocity
  - Max 2 balls can be active at once
  - Ball falls off bottom: auto-destroy, serve again
  - Destroy all 3 targets to complete

### Stage 1: TARGETS (Breakout)
- **Objective:** Destroy 8 targets
- **Expected:**
  - Faster ball speed (60 vs 40)
  - Targets in breakout formation (rows)
  - Ball/target collision: target destroyed, ball bounces down
  - Complete when all 8 destroyed

### Stage 2: REFLECTORS (Trick Shots)
- **Objective:** Destroy 6 targets
- **Expected:**
  - Angled walls for trick shots
  - Targets positioned around reflectors
  - Complete when all 6 destroyed

### Stage 3: FINAL_CLEAR (Challenge)
- **Objective:** Destroy 12 targets
- **Expected:**
  - Combined challenge
  - Multiple formations
  - Complete when all 12 destroyed

**Rewards on Completion:**
- ITEM_KEYCARD_B received
- FLAG_DUN_05_CLEARED set
- FLAG_UPG_DASH_COOLDOWN_REDUCED set

---

## General Testing Notes

### Performance Checks
- [ ] No progressive slowdown during gameplay
- [ ] Caps enforced:
  - Max 2 balls in Dungeon 5
  - Max 3 crates in Dungeon 3
- [ ] Sprite cleanup on mode switch
- [ ] No memory leaks after multiple runs

### Deterministic Behavior
- [ ] Dungeon 3 crates move with fixed velocities
- [ ] Dungeon 5 ball serves with fixed initial velocity (vx=10)
- [ ] Same inputs produce same results (no random spawns)

### Edge Cases
- [ ] Ball doesn't get stuck re-bouncing on paddle
- [ ] Crates don't spawn on top of each other
- [ ] Gates respond correctly to switch count
- [ ] Return to hub works from all dungeons
- [ ] No null-ref errors on stage transitions

### UI/Feedback
- [ ] HUD shows correct info
- [ ] Placeholder text IDs display (e.g., [TOKEN_COLLECTED])
- [ ] SFX plays on interactions
- [ ] Stage complete hint shows before advancing

---

## Debug Tools

Use Debug Warp menu (if available) to quickly test:
- Warp to specific dungeon
- Warp to specific stage
- Toggle god mode for testing

---

## Bug Report Template

**Dungeon:** [1/3/5]  
**Stage:** [0-3]  
**Issue:** [Description]  
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [etc.]

**Expected:** [What should happen]  
**Actual:** [What actually happened]  
**Screenshot/Video:** [If available]

---

## Success Criteria

All 3 dungeons (12 stages total) must:
- ✅ Load without errors
- ✅ Complete without crashes
- ✅ Show deterministic behavior
- ✅ Maintain stable performance (no slowdown)
- ✅ Return to hub correctly
- ✅ Award rewards properly
