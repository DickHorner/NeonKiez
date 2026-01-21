# Dungeon 5 Test Plan

## Test Scenario: Complete Playthrough

### Prerequisites
- Game starts successfully
- Hub world loads

### Test Steps

#### 1. Navigate to Dungeon 5 Door
- [ ] Start in hub center room (1,1)
- [ ] Move right to room (1,2)
- [ ] Verify door sprite is visible at (80, 80)
- [ ] Approach door and interact

#### 2. Dungeon Entry
- [ ] Cutscene plays: `[CUT_DUN_05_ENTRY_BEAT_PAUSENKLINGEL_PING]`
- [ ] Mode switches to DUN_PUZZLE
- [ ] Stage 0 tilemap loads

#### 3. Stage 0: PADDLE_LEARN
**Objective:** Learn paddle movement, destroy 3 targets (slow ball)
- [ ] Paddle visible at bottom center (80, 110)
- [ ] 3 targets visible
- [ ] Hint shows: `[PRESS_A_TO_SERVE]`
- [ ] Press A: Ball spawns and moves upward slowly
- [ ] Left/Right: Paddle moves correctly
- [ ] Ball bounces off walls
- [ ] Ball bounces off paddle (with horizontal spread)
- [ ] Ball hits target: target destroyed, count increases
- [ ] Ball falls off bottom: hint shows `[BALL_LOST_PRESS_A]`
- [ ] Can re-serve ball
- [ ] Destroy all 3 targets: Stage complete message
- [ ] Auto-advance to Stage 1

#### 4. Stage 1: TARGETS
**Objective:** Destroy 8 targets in breakout formation (normal ball speed)
- [ ] Stage 1 tilemap loads
- [ ] 8 targets visible in rows at top
- [ ] Paddle resets at bottom
- [ ] Hint shows: `[PRESS_A_TO_SERVE]`
- [ ] Ball speed is faster than Stage 0
- [ ] All mechanics work (paddle, ball, targets)
- [ ] Destroy all 8 targets: Stage complete
- [ ] Auto-advance to Stage 2

#### 5. Stage 2: REFLECTORS
**Objective:** Use angled walls for trick shots, destroy 6 targets
- [ ] Stage 2 tilemap loads
- [ ] 6 targets visible
- [ ] Angled wall tiles visible (for reflections)
- [ ] Ball bounces off angled walls
- [ ] Trick shots possible
- [ ] Destroy all 6 targets: Stage complete
- [ ] Auto-advance to Stage 3

#### 6. Stage 3: FINAL_CLEAR
**Objective:** Combined challenge, destroy 12 targets
- [ ] Stage 3 tilemap loads
- [ ] 12 targets visible in multiple formations
- [ ] All mechanics work
- [ ] Destroy all 12 targets: Stage complete
- [ ] Dungeon complete message

#### 7. Rewards & Return
- [ ] Flag set: `FLAG_DUN_05_CLEARED`
- [ ] Flag set: `FLAG_UPG_DASH_COOLDOWN_REDUCED`
- [ ] Item added: `ITEM_KEYCARD_B` (qty: 1)
- [ ] Return to hub at spawn point (1,2) at (80, 80)
- [ ] Hub tilemap loads correctly
- [ ] Player positioned at spawn point

### Edge Cases

#### Ball Physics
- [ ] Max 2 balls on screen enforced (CAP_MAX_BALLS)
- [ ] Ball can't be served if already served
- [ ] Ball velocity capped/reasonable
- [ ] Ball collision with multiple targets works

#### Paddle Mechanics
- [ ] Paddle can't move off screen
- [ ] Paddle hit detection accurate
- [ ] Horizontal velocity spread based on hit position

#### Stage Transitions
- [ ] No sprites leak between stages
- [ ] Paddle/ball properly reset each stage
- [ ] Targets count correctly
- [ ] Can't skip stages

### Performance
- [ ] No lag during ball movement
- [ ] No progressive slowdown
- [ ] Collision detection responsive
- [ ] Stage transitions smooth

### Cleanup
- [ ] All sprites destroyed on mode switch
- [ ] No memory leaks
- [ ] Return to hub clean

## Test Results
- [ ] All tests passed
- [ ] Issues found: ___________
- [ ] Notes: ___________

## Manual Test Evidence
Screenshot/video evidence of:
1. Stage 0 completion
2. Stage 1 completion
3. Stage 2 completion
4. Stage 3 completion
5. Return to hub
