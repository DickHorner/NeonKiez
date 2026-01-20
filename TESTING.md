# Testing Guide for Neon-Kiez

**Version:** 1.0  
**Last Updated:** 2026-01-20  
**Purpose:** Reproducible manual testing for story-driven retro game (MakeCode Arcade)

---

## Overview

This document provides a **Golden Path** for testing the Neon-Kiez game, ensuring that anyone can reproduce tests and verify functionality. The game is a story-driven retro experience built for MakeCode Arcade with TypeScript.

**Non-Goals:**
- Automated testing (this is manual testing only)
- Performance benchmarking (covered separately)

---

## Prerequisites

### Required Setup

1. **MakeCode Arcade Access**
   - Open https://arcade.makecode.com
   - Import this repository OR create new project and paste code

2. **Extensions Required**
   - `microsoft/arcade-background-scroll` (Parallax)
   - `riknoll/arcade-overworld` (Hub room-grid)
   - `microsoft/arcade-storytelling` (Cutscenes/dialogs)
   - `riknoll/arcade-mini-menu` (Menus)

3. **Hardware/Simulator**
   - MakeCode Arcade simulator (web browser)
   - OR physical hardware (PyGamer, PyBadge, etc.)
   - Controller support recommended

### Before Testing

- Clear browser cache if testing major changes
- Ensure all TypeScript files compile without errors
- Check that assets_stub.ts placeholder functions exist

---

## Golden Path Testing Sequence

### Test 1: Boot and Title Screen

**Steps:**
1. Start the game in MakeCode Arcade simulator
2. Observe the title screen

**Expected Results:**
- ✅ Title screen appears with placeholder text: `[TITLE_NEON_KIEZ]`
- ✅ Background color: solid color (ID 1)
- ✅ If save data exists: prompt appears "Continue? 1=Yes 0=New"
- ✅ If no save data: proceeds directly to Hub

**Pass Criteria:**
- No crashes on boot
- Title screen displayed
- Continue/New Game prompt works (if applicable)

**Debug Notes:**
- Check `GameController.start()` in game_controller.ts
- Verify `showTitle()` executes without errors

---

### Test 2: Hub World Entry

**Steps:**
1. From title screen, select "New Game" (0) or Continue (1)
2. Observe hub world initialization

**Expected Results:**
- ✅ Game mode switches to `GameMode.Hub`
- ✅ Play mode switches to `PlayMode.HUB_TOPDOWN`
- ✅ Player sprite spawns at hub center (room 1,1)
- ✅ HUD displays:
  - Hearts (5/5 for new game, saved value for continue)
  - Tool slot (empty initially)
  - Energy bar (if implemented)
- ✅ Hub tilemap loaded (or empty placeholder if not created)

**Pass Criteria:**
- Player visible and controllable
- No sprite duplication
- HUD elements visible
- No console errors

**Debug Notes:**
- Use `showDebugOverlay()` to verify:
  - Mode: `HUB_TOPDOWN`
  - Hearts: 5
  - Tools: 0 (new game)
  - Flags: varies (continue game)
- Check `setupHubMode()` in game_controller.ts

---

### Test 3: Hub Movement and Controls

**Steps:**
1. In hub world, press D-Pad (Arrow keys) in all 4 directions
2. Move player around the room
3. Test collision with walls (if tilemap exists)

**Expected Results:**
- ✅ Player responds to D-Pad input immediately
- ✅ Movement speed: ~80 pixels/second (`PLAYER_TOPDOWN_SPEED`)
- ✅ Player sprite faces correct direction (if animations exist)
- ✅ Camera follows player (centered)
- ✅ Collision with walls prevents movement (if walls exist)

**Pass Criteria:**
- Smooth 4-directional movement
- No stuck states
- No jittery camera

**Debug Notes:**
- Movement implemented in `updateTopDownPlayer()` (player_topdown.ts)
- Verify `controller.dx` and `controller.dy` values
- Check sprite velocity with debug overlay

---

### Test 4: Hub Interaction (Doors)

**Steps:**
1. Move player near a door sprite (if placed)
2. Press A button when within `INTERACT_DISTANCE` (20 pixels)
3. Observe dungeon entry flow

**Expected Results:**
- ✅ Interaction triggers when A pressed near door
- ✅ Cutscene plays with placeholder text (e.g., `[CUT_DUN_01_ENTRY_BEAT_WASCHMASCHINEN_SINGEN]`)
- ✅ Game mode switches to `GameMode.Cutscene` then `GameMode.Dungeon`
- ✅ Play mode switches to dungeon-specific mode (e.g., `PlayMode.DUN_PUZZLE` for Dungeon 1)
- ✅ **IMMEDIATE** mode switch after cutscene (no delay)
- ✅ Hub cleanup: all hub sprites destroyed
- ✅ Dungeon setup: new sprites/tilemap loaded

**Pass Criteria:**
- Interaction debounce works (no double-trigger)
- Mode switch clean (no leftover sprites)
- Cutscene skippable (if implemented)

**Debug Notes:**
- Check `handleDoorInteraction()` in world_hub.ts
- Verify `GameController.enterDungeon()` flow
- Use debug overlay to confirm mode change
- Check console for transition lock status

---

### Test 5: Dungeon Mode - Platform (Dungeon 7)

**Steps:**
1. Enter Dungeon 7 (Video Store Platform Trial)
2. Test platform movement controls
3. Navigate through Stage 0

**Expected Results:**
- ✅ Player sprite changes to platform mode sprite
- ✅ Controls:
  - Left/Right: horizontal movement (~100 px/s)
  - A: Jump (vy = -150)
  - Down: drop through platforms (optional)
- ✅ Gravity applied to player
- ✅ Player lands on platforms
- ✅ Stage tilemap loaded: `TM_DUN_07_STAGE_00_JUMP`
- ✅ Goal tile detection: reaching goal completes stage

**Pass Criteria:**
- Jump feels responsive
- Landing detection works
- No falling through solid platforms
- Goal detection triggers stage advance

**Debug Notes:**
- Input handled in `updatePlatformMode()` (player_modes.ts)
- Check `setupPlatformMode()` in game_controller.ts
- Verify gravity constant and collision detection
- Use debug overlay: Mode should show `DUN_PLATFORM`

---

### Test 6: Dungeon Stage Progression

**Steps:**
1. Complete Stage 0 by reaching goal tile
2. Observe stage advance
3. Continue through Stages 1-3

**Expected Results:**
- ✅ Stage complete detection triggers
- ✅ Message: `[STAGE_COMPLETE]` or similar
- ✅ Next stage loads automatically
- ✅ Player respawns at stage spawn point
- ✅ Stage counter increments (internal state)
- ✅ After final stage: dungeon complete flow

**Pass Criteria:**
- No stage skip bugs
- No duplicate stage loads
- Smooth transitions between stages

**Debug Notes:**
- Check `advanceDungeonStage()` in game_controller.ts
- Verify `state.dungeonStageData.currentStageIndex`
- Console log stage transitions

---

### Test 7: Dungeon Completion and Rewards

**Steps:**
1. Complete final stage of a dungeon (Stage 3 typically)
2. Observe reward application
3. Return to hub

**Expected Results:**
- ✅ Completion message displayed
- ✅ Rewards applied:
  - Flags set (e.g., `FLAG_DUN_07_CLEARED`)
  - Tools unlocked (e.g., `TOOL_DOUBLE_JUMP` for Dungeon 7)
  - Items added to inventory (if applicable)
- ✅ Game mode switches to `GameMode.Hub`
- ✅ Play mode switches to `PlayMode.HUB_TOPDOWN`
- ✅ Player spawns at `hubReturnSpawnTag` location
- ✅ HUD updates: new tool visible in slot

**Pass Criteria:**
- Rewards persist in state
- Hub return spawn works correctly
- No duplicate rewards on re-entry

**Debug Notes:**
- Check `completeDungeon()` in game_controller.ts
- Verify `applyDungeonRewards()` in world_dungeons.ts
- Use debug overlay: Tools count should increment
- Check flags with `Object.keys(state.flags)`

---

### Test 8: Save and Continue

**Steps:**
1. Play for a few minutes (complete 1 dungeon)
2. Trigger save (interact with Savehouse in hub, or auto-save)
3. Close simulator
4. Restart game
5. Select "Continue" (1)

**Expected Results:**
- ✅ Save data persists using MakeCode `settings` block
- ✅ Restored state:
  - Hearts (current value)
  - Unlocked tools
  - Completed dungeon flags
  - Current hub room
  - Inventory items
- ✅ Player spawns at saved location
- ✅ HUD reflects saved state

**Pass Criteria:**
- No data loss
- No corruption (e.g., negative hearts)
- Continue game matches saved state

**Debug Notes:**
- Save/load in `save.ts`
- Check `serializeState()` and `deserializeState()`
- Verify `settings.writeBuffer()` success
- Debug overlay shows correct values after continue

---

### Test 9: Mode-Specific Testing (All 7 PlayModes)

#### HubTopDown
- **Already tested in Tests 1-3**

#### DUN_PLATFORM (Dungeons 7, 8)
- **Already tested in Tests 5-6**

#### DUN_SHOOTER (Dungeon 2)
**Steps:**
1. Enter Dungeon 2 (Rooftop Invaders)
2. Test shooting controls
3. Verify enemy waves

**Expected Results:**
- ✅ Controls: D-Pad move, A = shoot
- ✅ Bullets spawn with cap (`CAP_MAX_PROJECTILES = 20`)
- ✅ Bullets auto-destroy (lifespan)
- ✅ Enemy waves spawn with cap (`CAP_MAX_ENEMIES = 12`)
- ✅ Collision detection: bullet hits enemy (confetti/sparks, no gore)

#### DUN_ASTEROIDS (Dungeon 6)
**Steps:**
1. Enter Dungeon 6 (Arcade Museum Asteroids)
2. Test thrust and rotation
3. Verify debris mechanics

**Expected Results:**
- ✅ Controls: Left/Right = rotate, Up = thrust, A = shoot (optional)
- ✅ Screen wrap works (edges loop)
- ✅ Debris spawn with cap (`CAP_MAX_DEBRIS = 15`)
- ✅ Debris split on hit (size reduces)
- ✅ Collectible parts appear

#### DUN_RHYTHM (Dungeon 4)
**Steps:**
1. Enter Dungeon 4 (Subway Timing)
2. Test beat window detection
3. Verify streak tracking

**Expected Results:**
- ✅ Beat timing window visible (UI indicator)
- ✅ A button press within window = success
- ✅ Press outside window = miss
- ✅ Streak counter increments/resets correctly
- ✅ Goal: reach target streak to complete stage

#### DUN_PUZZLE (Dungeons 1, 3, 5)
**Steps:**
1. Enter any Puzzle dungeon
2. Test switch interaction
3. Verify gate/door mechanics

**Expected Results:**
- ✅ A button interacts with switches
- ✅ Switches toggle gates/doors
- ✅ Token collection (if applicable)
- ✅ Goal detection: all puzzles solved

#### DUN_META (Dungeon 9)
**Steps:**
1. Enter Dungeon 9 (Final Glitch Panopticon)
2. Test mode switching between micro-stages

**Expected Results:**
- ✅ Micro-stages switch modes (platform → shooter → rhythm)
- ✅ Each micro-stage: 15-20 seconds
- ✅ Cleanup between micro-stages (no leftover sprites)
- ✅ Final stage: "stabilize nodes" complete

**Pass Criteria (All Modes):**
- Controls responsive
- Caps enforced (no spawn spam)
- Cleanup on exit
- No mode-specific crashes

---

### Test 10: Tools System

**Steps:**
1. Unlock a tool (complete a dungeon with tool reward)
2. Equip tool from menu (if implemented) or auto-equip
3. Use tool in hub and in compatible dungeon

**Expected Results:**
- ✅ Tool unlocked: added to `state.unlockedTools`
- ✅ Tool visible in HUD
- ✅ B button uses tool
- ✅ Tool cooldown enforced (`TOOL_COOLDOWN_MS = 500`)
- ✅ Tool effects:
  - `TOOL_FREEZECAM`: freeze cone effect
  - `TOOL_CONFETTI_BOMB`: AoE stun (enemies dance)
  - `TOOL_SOAP_SLIDE`: slippery area
  - `TOOL_DECOY_TOY`: lure sprite
  - `TOOL_TAGGER`: mark/hint overlay
- ✅ Tool disabled in incompatible modes (shows "disabled" in HUD)

**Pass Criteria:**
- Tool usage feels satisfying
- No spam (cooldown works)
- Effects visible and functional

**Debug Notes:**
- Tools defined in `tools.ts`
- Check `useTool()` function
- Verify cooldown timer

---

### Test 11: Debug Features

**Steps:**
1. Enable debug mode (always enabled in current build)
2. Use debug overlay: call `showDebugOverlay()`
3. Test warp functions
4. Test godmode

**Expected Results:**
- ✅ Debug overlay shows:
  - Current mode (PlayMode)
  - Hearts
  - Tools count
  - Flags count
- ✅ Warp to dungeon: `warpToDungeon("DUN_LAUNDROMAT_LABYRINTH")`
- ✅ Warp to hub: `warpToHub()`
- ✅ Godmode toggle: `toggleGodMode()`
  - When enabled: `state.invincibleUntil = 0x7fffffff`
  - Hint message: `[GODMODE_ON]`
- ✅ Registry validation: `validateRegistry()`

**Pass Criteria:**
- Debug functions execute without errors
- Warp changes mode correctly
- Godmode prevents damage

**Debug Notes:**
- All debug functions in `debug.ts`
- Check console for validation output
- Verify hints display

---

### Test 12: Stability and Performance (10-Minute Run)

**Steps:**
1. Play continuously for 10 minutes:
   - Navigate hub
   - Enter/exit 3 dungeons
   - Use tools repeatedly
   - Spawn enemies/projectiles

**Expected Results:**
- ✅ No progressive slowdown
- ✅ Sprite count remains stable (check with debug overlay if available)
- ✅ No memory leaks (no increasing lag)
- ✅ Caps enforced:
  - Enemies: max 12
  - Projectiles: max 20
  - Debris: max 15
  - Collectibles: max 30
- ✅ Mode cleanup works (no sprite accumulation)

**Pass Criteria:**
- Game remains smooth
- No crashes
- Consistent frame rate

**Debug Notes:**
- Monitor sprite counts via `sprites.allOfKind(KIND).length`
- Check `cleanupCurrentPlayMode()` effectiveness
- Verify `AutoDestroy` and `Lifespan` on projectiles

---

## Expected Results Summary Table

| Test # | Test Name | Key Expected Result | Pass? |
|--------|-----------|---------------------|-------|
| 1 | Boot & Title | Title screen displays, continue prompt works | ☐ |
| 2 | Hub Entry | Player spawns, HUD visible, mode = HUB_TOPDOWN | ☐ |
| 3 | Hub Movement | 4-directional movement, collision works | ☐ |
| 4 | Hub Interaction | Door → cutscene → dungeon mode switch | ☐ |
| 5 | Platform Mode | Jump/gravity/landing work | ☐ |
| 6 | Stage Progression | Stages advance correctly | ☐ |
| 7 | Rewards | Flags/tools applied, hub return works | ☐ |
| 8 | Save/Continue | State persists and restores correctly | ☐ |
| 9 | All Modes | Each PlayMode functions correctly | ☐ |
| 10 | Tools System | Tools unlock, use, cooldown correctly | ☐ |
| 11 | Debug Features | Overlay, warp, godmode work | ☐ |
| 12 | Stability | 10-min run without slowdown | ☐ |

---

## Debug Overlay Usage

### How to Access Debug Overlay

**In-Game:**
```typescript
// Debug mode is always enabled in current build
// Call from console or add to controls:
showDebugOverlay()
```

**What It Shows:**
```
DEBUG
Mode: <current PlayMode number>
Hearts: <current hearts / max hearts>
Tools: <unlocked tools count>
Flags: <flags set count>
```

### Common Debug Commands

```typescript
// Show debug info
showDebugOverlay()

// Enable invincibility
toggleGodMode()

// Warp to a dungeon
warpToDungeon("DUN_LAUNDROMAT_LABYRINTH")
// Other dungeon IDs:
// - DUN_ROOFTOP_INVADERS
// - DUN_WAREHOUSE_BLOCKWORKS
// - DUN_SUBWAY_TIMING
// - DUN_SCHOOL_PONG_COURT
// - DUN_ARCADE_MUSEUM_ASTEROIDS
// - DUN_VIDEO_STORE_PLATFORM_TRIAL
// - DUN_CONSTRUCTION_DONKEY_TOWER
// - DUN_FINAL_GLITCH_PANOPTICON

// Warp back to hub
warpToHub()

// Validate dungeon registry
validateRegistry()
```

### Debug Overlay Interpretation

| Display | Meaning | Expected Values |
|---------|---------|-----------------|
| Mode: 0 | PlayMode.HUB_TOPDOWN | Hub exploration |
| Mode: 1 | PlayMode.DUN_PLATFORM | Platform dungeon |
| Mode: 2 | PlayMode.DUN_SHOOTER | Shooter dungeon |
| Mode: 3 | PlayMode.DUN_ASTEROIDS | Asteroids dungeon |
| Mode: 4 | PlayMode.DUN_RHYTHM | Rhythm dungeon |
| Mode: 5 | PlayMode.DUN_PUZZLE | Puzzle dungeon |
| Mode: 6 | PlayMode.DUN_META | Meta dungeon (final) |
| Hearts: 5 | Full health | Max = 5 for new game |
| Tools: 0-5 | Unlocked tools | Increases as dungeons completed |
| Flags: varies | Game progression | Increases with completions |

---

## Testing Workflow for New Testers

### Quick Start (5-Minute Smoke Test)

1. **Boot** → Verify title screen (Test 1)
2. **Hub** → Move player around (Tests 2-3)
3. **Door** → Enter any dungeon (Test 4)
4. **Play** → Complete 1 stage (Tests 5-6)
5. **Return** → Exit to hub (Test 7)

**Result:** If all 5 steps pass, core systems work.

### Full Test (30-Minute Comprehensive Test)

1. Run Tests 1-12 in order
2. Mark pass/fail in summary table
3. Document any failures with:
   - Screenshot (if possible)
   - Console error messages
   - Steps to reproduce

### Regression Test (After Code Changes)

1. Run Quick Start (5-min)
2. Run tests relevant to changed code
3. Run Test 12 (stability)

---

## Known Limitations (Not Bugs)

These are **by design** and not test failures:

- **All assets are placeholders**: Sprites, tilemaps, sounds use placeholder IDs
- **All texts are placeholder IDs**: `[TITLE_NEON_KIEZ]`, `[CUT_DUN_...]`, etc.
- **Tilemaps may return null**: Must be created in MakeCode editor
- **No enemy AI yet**: Enemies not spawned in most dungeons (scaffold only)
- **No actual sprites/sounds**: Using `image.create()` and stub functions

---

## Common Issues and Solutions

### Issue: Title screen doesn't appear
- **Cause:** Extensions not loaded
- **Solution:** Add all 4 required extensions in MakeCode

### Issue: Player doesn't spawn
- **Cause:** Tilemap missing or spawn tile not placed
- **Solution:** Create hub tilemap with spawn tile (tag = 1)

### Issue: Controls don't work
- **Cause:** Mode check failing in input handler
- **Solution:** Verify `state.playMode` matches expected mode

### Issue: Dungeon entry crashes
- **Cause:** Dungeon spec missing or invalid
- **Solution:** Run `validateRegistry()` to check specs

### Issue: Mode switch leaves old sprites
- **Cause:** Cleanup not destroying all sprites
- **Solution:** Check `cleanupCurrentPlayMode()` logic

### Issue: Progressive slowdown
- **Cause:** Spawn caps not enforced
- **Solution:** Verify caps in spawn functions

---

## Test Evidence Checklist

After running tests, provide evidence:

- [ ] **Quick smoke test run ok** (5-min test)
- [ ] **Full test run ok** (30-min test)
- [ ] **Summary table completed** (all tests marked pass/fail)
- [ ] **Debug overlay confirmed working**
- [ ] **At least 1 dungeon playable end-to-end**
- [ ] **Save/Continue verified**
- [ ] **10-minute stability run completed**

**Evidence Format:**
```
Test run: YYYY-MM-DD
Tester: <name>
Result: PASS / FAIL
Notes: <brief summary>
```

---

## Acceptance Criteria ✅

Per issue requirements:

- [x] Golden Path step sequence documented
- [x] Expected Results for each step documented
- [x] Debug overlay notes documented
- [ ] 1 person (not author) can execute tests successfully

**Final Test Evidence:** *(to be filled by tester)*
> Test run ok / Test run failed: <reason>

---

## Next Steps

1. Share this document with testers
2. Run tests and gather feedback
3. Update document based on feedback
4. Iterate until tests are reproducible by anyone

**Questions?** Check README.md, IMPLEMENTATION_STATUS.md, or ask the development team.

---

**End of Testing Guide** 🎮✨
