# Dungeon 4 (Rhythm Mode) Test Plan

## Overview

Dungeon 4 (DUN_SUBWAY_TIMING) is a rhythm-based dungeon where players must tap in time with a beat to progress through 4 stages.

## Spec Reference

- **ID**: DUN_SUBWAY_TIMING
- **PlayMode**: DUN_RHYTHM
- **Intro Cutscene**: CUT_DUN_04_ENTRY_BEAT_TAKT_IM_TUNNEL
- **BPM**: 120 (500ms per beat)
- **Miss Limit**: 3
- **Return Spawn**: SPAWN_HUB_FROM_DUN_04 (Hub room [1, 0])

## Stages

### Stage 0: BEAT_TUTORIAL
- **Objective**: Learn the beat window (3 streak)
- **Mechanics**: Simple open room, player learns to tap on beat
- **Win**: Reach streak of 3 good hits
- **Lose**: Miss limit (3 misses)

### Stage 1: DOORS
- **Objective**: Navigate through rhythm doors (5 streak)
- **Mechanics**: Doors open only when tapping on beat, close on miss
- **Door Count**: 3 rhythm gates
- **Win**: Reach streak of 5 good hits + reach goal
- **Lose**: Miss limit (3 misses)

### Stage 2: SWITCH_CHAIN
- **Objective**: Activate switches in sequence (8 streak)
- **Mechanics**: Player must be near switch and tap on beat to activate
- **Switch Count**: 6 switches
- **Win**: Reach streak of 8 good hits
- **Lose**: Miss limit (3 misses)

### Stage 3: FINAL_STREAK
- **Objective**: Final streak challenge (12 streak)
- **Mechanics**: Pure rhythm challenge with beat markers
- **Beat Markers**: 4 markers to guide player
- **Win**: Reach streak of 12 good hits
- **Lose**: Miss limit (3 misses)

## Test Cases

### TC1: Entry Flow
1. Start from Hub room [1, 0]
2. Interact with Dungeon 4 door
3. **Verify**: Cutscene plays (CUT_DUN_04_ENTRY_BEAT_TAKT_IM_TUNNEL)
4. **Verify**: Mode switches immediately to DUN_RHYTHM
5. **Verify**: Stage 0 loads (TM_DUN_04_STAGE_00_BEAT_TUTORIAL)

### TC2: Beat Timing (Stage 0)
1. Enter Stage 0
2. Wait for beat cue
3. Press A within 200ms window of beat
4. **Verify**: "[RHYTHM_GOOD]" hint shows
5. **Verify**: Streak increments (1, 2, 3)
6. Press A outside 200ms window
7. **Verify**: "[RHYTHM_MISS]" hint shows
8. **Verify**: Streak resets to 0
9. **Verify**: Miss counter increments

### TC3: Stage 0 Win Condition
1. Enter Stage 0
2. Hit 3 beats in a row (streak = 3)
3. **Verify**: "[RHYTHM_STREAK_COMPLETE]" hint shows
4. **Verify**: Stage advances to Stage 1

### TC4: Stage 0 Lose Condition
1. Enter Stage 0
2. Miss 3 beats (misses = 3)
3. **Verify**: "[RHYTHM_MISS_LIMIT_RESTART]" hint shows
4. **Verify**: Stage restarts (Stage 0 reloads)
5. **Verify**: Streak and miss counters reset

### TC5: Stage 1 Rhythm Doors
1. Enter Stage 1
2. **Verify**: 3 doors (gates) are present and closed
3. Hit beat (good timing)
4. **Verify**: Doors open
5. **Verify**: "[RHYTHM_DOORS_OPEN]" hint shows
6. Miss beat
7. **Verify**: Doors close
8. **Verify**: "[RHYTHM_DOORS_CLOSED]" hint shows

### TC6: Stage 1 Win Condition
1. Enter Stage 1
2. Build streak to 5 by hitting beats
3. Navigate through open doors to goal
4. **Verify**: Stage advances to Stage 2

### TC7: Stage 2 Switch Activation
1. Enter Stage 2
2. **Verify**: 6 switches are present
3. Move near a switch
4. Hit beat (good timing) while near switch
5. **Verify**: Switch activates (tile changes)
6. **Verify**: "[RHYTHM_SWITCH_ACTIVATED]" hint shows
7. **Verify**: switchesActivated counter increments
8. Repeat until streak = 8
9. **Verify**: Stage advances to Stage 3

### TC8: Stage 3 Final Streak
1. Enter Stage 3
2. **Verify**: 4 beat markers are visible
3. Build streak to 12 by hitting beats
4. **Verify**: Stage completes

### TC9: Dungeon Completion & Rewards
1. Complete Stage 3
2. **Verify**: Rewards applied:
   - FLAG_DUN_04_CLEARED is set
   - TOOL_FREEZECAM is unlocked
   - ITEM_CASSETTE_02 is added to inventory
3. **Verify**: Mode switches back to HUB_TOPDOWN
4. **Verify**: Player spawns at SPAWN_HUB_FROM_DUN_04 (room [1, 0] at x:80, y:80)

### TC10: Full Run Test
1. Enter Dungeon 4 from Hub
2. Complete all 4 stages in sequence
3. **Verify**: Total time < 5 minutes (reasonable for rhythm gameplay)
4. **Verify**: No crashes or freezes
5. **Verify**: Return to Hub works
6. **Verify**: Can re-enter dungeon (should be marked cleared)

## Pass Criteria

- ✅ All 10 test cases pass
- ✅ Beat timing feels responsive (200ms window)
- ✅ Visual/audio cues for beat are clear
- ✅ Stage transitions are smooth
- ✅ Win/lose conditions work as specified
- ✅ Rewards are applied correctly
- ✅ Return spawn point works

## Known Limitations

- Visual cues are placeholders (text hints only)
- Audio is placeholder (no actual music/sounds)
- Tilemaps are functional but not visually polished

## MANUAL TEST PASSED

- [ ] TC1: Entry Flow
- [ ] TC2: Beat Timing
- [ ] TC3: Stage 0 Win
- [ ] TC4: Stage 0 Lose
- [ ] TC5: Stage 1 Doors
- [ ] TC6: Stage 1 Win
- [ ] TC7: Stage 2 Switches
- [ ] TC8: Stage 3 Streak
- [ ] TC9: Completion & Rewards
- [ ] TC10: Full Run Test
