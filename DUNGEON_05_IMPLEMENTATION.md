# Dungeon 5 Implementation Documentation

## Overview
Dungeon 5 (DUN_SCHOOL_PONG_COURT) - Pong/Breakout style puzzle dungeon

## Implementation Details

### 1. Tilemaps (assets_stub.ts)
- **Stage 0 (PADDLE_LEARN)**: Simple arena for learning paddle movement with slow ball
- **Stage 1 (TARGETS)**: Breakout-style layout with 8 targets in top rows
- **Stage 2 (REFLECTORS)**: Angled wall placements for trick shots with 6 targets
- **Stage 3 (FINAL_CLEAR)**: Combined challenge with 12 targets in multiple formations

### 2. Constants (constants.ts)
- Added `KIND_PADDLE` and `KIND_BALL` sprite kinds
- Added paddle/ball physics constants:
  - `PADDLE_SPEED = 120`
  - `BALL_SPEED_SLOW = 40` (for Stage 0)
  - `BALL_SPEED_NORMAL = 60` (for Stages 1-3)
  - `CAP_MAX_BALLS = 2`
- Updated Dungeon 5 spec with params:
  - `targetsPerStage: [3, 8, 6, 12]`
  - `ballSpeed: [BALL_SPEED_SLOW, BALL_SPEED_NORMAL, BALL_SPEED_NORMAL, BALL_SPEED_NORMAL]`

### 3. Game Mechanics (game_controller.ts)

#### Paddle Control
- Paddle spawned at bottom center (80, 110)
- Left/Right movement via controller.moveSprite()
- Stays on screen (setStayInScreen)

#### Ball Physics
- Ball spawned on paddle when A button pressed
- Upward velocity with slight random horizontal spread
- BounceOnWall flag enabled for wall collisions
- Ball/Paddle collision: bounce upward, add horizontal velocity based on hit position
- Ball/Target collision: bounce and destroy target
- Ball falls off bottom: destroy and allow re-serve

#### Overlap Handlers (registered globally)
- `KIND_BALL` + `KIND_PADDLE`: Paddle bounce mechanic
- `KIND_BALL` + `KIND_TARGET`: Target destruction

#### Stage Progression
- **spawnDungeon05Content()**: Spawns paddle and targets per stage
- **serveBall()**: Ball serving logic (A button)
- **updateDungeon05Balls()**: Ball fall-off detection
- **checkDungeon05StageComplete()**: Win condition (all targets destroyed)

### 4. Win Conditions
Each stage completes when `targetsDestroyed >= targetsRequired`:
- Stage 0: 3 targets
- Stage 1: 8 targets
- Stage 2: 6 targets
- Stage 3: 12 targets

### 5. Rewards
Upon dungeon completion:
- Flag: `FLAG_DUN_05_CLEARED`
- Flag: `FLAG_UPG_DASH_COOLDOWN_REDUCED`
- Item: `ITEM_KEYCARD_B` (qty: 1)

### 6. Hub Integration
- Door in Hub room (1, 2) - right middle room
- Return spawn point: `SPAWN_HUB_FROM_DUN_05` at (80, 80) in room (1, 2)

## Testing Instructions

### Manual Test
1. Start game
2. Navigate to Hub room (1, 2)
3. Interact with Dungeon 5 door
4. Watch intro cutscene: `[CUT_DUN_05_ENTRY_BEAT_PAUSENKLINGEL_PING]`
5. **Stage 0**: Press A to serve ball, move paddle left/right to bounce, destroy 3 targets
6. **Stage 1**: Repeat with 8 targets in breakout formation
7. **Stage 2**: Use angled walls for trick shots, destroy 6 targets
8. **Stage 3**: Final challenge with 12 targets
9. Complete dungeon, verify rewards received
10. Verify return to Hub at correct spawn point

### Debug Test
- Use `testDungeon05()` function in debug.ts to warp directly to dungeon

## Implementation Status
- [x] 4 tilemaps created
- [x] Paddle/ball mechanics implemented
- [x] Target spawning system
- [x] Ball physics (bounce, fall-off)
- [x] Win conditions per stage
- [x] Hub door configured
- [x] Return spawn point configured
- [ ] Full playthrough test (manual)
- [ ] Verify all 4 stages complete successfully
- [ ] Verify return to hub works

## Notes
- Ball speed is slower in Stage 0 (BALL_SPEED_SLOW = 40) for learning
- Stages 1-3 use normal ball speed (BALL_SPEED_NORMAL = 60)
- Max 2 balls on screen (CAP_MAX_BALLS)
- Targets placed via tile markers (stairNorth sprite = index 4)
- Fallback: targets arranged in rows if no tile markers found
