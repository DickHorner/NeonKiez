# Dungeon 1 (Puzzle) - Test Plan

## Manual Test Procedure

### Prerequisites
1. Open project in MakeCode Arcade editor
2. Enable debug mode (should be enabled by default in debug.ts)
3. Have access to warp menu (Menu button during gameplay)

### Test 1: Direct Warp to Dungeon 1

**Steps:**
1. Start the game
2. Press Menu button
3. Choose option 2 (Exit to warp menu)
4. Choose option 1 (Warp to Dungeon 1)

**Expected Result:**
- Cutscene plays: `[CUT_DUN_01_ENTRY_BEAT_WASCHMASCHINEN_SINGEN]`
- Game switches to puzzle mode immediately after cutscene
- Stage 0 tilemap loads (WARMUP corridor)
- Player spawns at spawn point (tile marked with `1`)
- Can see switch and gate in the corridor

### Test 2: Stage 0 - WARMUP Tutorial

**Objective:** Activate switch, pass through gate, reach goal

**Steps:**
1. Move player to switch (tile marked with `9`)
2. Press A to activate switch
3. Gates should open (gate tiles become passable)
4. Move to goal flag (tile marked with `7`)

**Expected Result:**
- Switch activation shows hint: `[SWITCH_ACTIVATED]`
- Gates open with visual change
- Reaching goal shows: `[STAGE_COMPLETE]`
- Auto-advance to Stage 1

### Test 3: Stage 1 - DARK_MAZE

**Objective:** Navigate maze using light switches, reach goal

**Steps:**
1. Player spawns at start
2. Navigate to first switch
3. Press A to activate
4. Gates toggle (open/close)
5. Navigate to second switch
6. Press A to toggle again
7. Find path to goal flag

**Expected Result:**
- Each switch toggle shows hint
- Gates toggle between open/closed states
- Maze walls block movement correctly
- Reaching goal advances to Stage 2

### Test 4: Stage 2 - TOKEN_RUN

**Objective:** Collect 5 tokens while avoiding Ghost-Bot, reach goal

**Steps:**
1. Player spawns at start
2. Observe Ghost-Bot patrolling horizontally
3. Collect tokens (6 placed at various locations, need 5)
4. If Ghost-Bot touches player:
   - Player gets knockback
   - Brief invincibility (i-frames)
   - No damage (harmless stun)
5. After collecting 5 tokens, move to goal

**Expected Result:**
- Token collection shows: `[TOKEN_COLLECTED_X_OF_5]`
- Ghost-Bot patrols without causing damage
- Collision with Ghost-Bot shows: `[GHOST_BOT_BUMPED]`
- Cannot complete until 5 tokens collected
- Reaching goal with 5 tokens advances to Stage 3

### Test 5: Stage 3 - EXIT_ROOM

**Objective:** Activate final switch to open large gate, reach goal

**Steps:**
1. Player spawns at start
2. Observe large gate blocking lower area
3. Move to switch (upper area)
4. Press A to activate
5. Gate opens
6. Move through gate to goal flag

**Expected Result:**
- Switch activation opens all gate tiles
- Player can pass through gate area
- Reaching goal completes dungeon
- Rewards applied:
  - FLAG_DUN_01_CLEARED set
  - TOOL_TAGGER unlocked
  - ITEM_CASSETTE_01 received
- Returns to hub at spawn point SPAWN_HUB_FROM_DUN_01

### Test 6: Hub Return

**Objective:** Verify return spawn point works

**Steps:**
1. After dungeon completion
2. Observe player spawn location in hub

**Expected Result:**
- Player spawns in Hub room (0,0) at coordinates (80, 80)
- Dungeon 1 door is visible and can be re-entered if desired
- All rewards from dungeon are present in inventory/flags

### Test 7: Full Run Without Warp

**Objective:** Complete dungeon through normal hub entry

**Steps:**
1. Start game fresh
2. Navigate hub to room (0,0)
3. Find Dungeon 1 door
4. Press A to interact with door
5. Complete all 4 stages as per Tests 2-5

**Expected Result:**
- Same as individual tests, but with proper hub entry flow
- Return spawn works correctly

## Test Evidence Checklist

- [ ] Stage 0 completes and advances
- [ ] Stage 1 switch mechanics work
- [ ] Stage 2 token collection works (5 required)
- [ ] Stage 2 Ghost-Bot collision is harmless
- [ ] Stage 3 large gate opens
- [ ] All 4 stages can be completed in sequence
- [ ] Rewards are applied on completion
- [ ] Return spawn point works (Hub room 0,0)
- [ ] Dungeon can be re-entered after completion

## Known Issues / Notes

- Tilemaps use placeholder sprites (dungeon/castle theme)
- All text is placeholder IDs
- Ghost-Bot AI is simple horizontal patrol
- Gates may not have smooth animations (instant toggle)
- Hub room (0,0) is minimal placeholder

## Success Criteria

✅ **PASS**: All 4 stages completable in sequence  
✅ **PASS**: Return spawn point brings player to Hub room (0,0)  
✅ **PASS**: All rewards applied correctly  
✅ **PASS**: Dungeon 1 fully playable end-to-end
