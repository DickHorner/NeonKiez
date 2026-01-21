# Dungeon 9 Quick Test Guide

## Quick Start Testing

### Option 1: Full Playthrough (Recommended)
1. Load game in MakeCode Arcade simulator
2. In debug console, run: `unlockAllDungeons()`
3. Navigate to center hub room (1,1)
4. Final dungeon door appears at position (80, 100)
5. Interact with door to enter Dungeon 9

### Option 2: Direct Stage Warp (for debugging)
Use these commands in the debug console:
```typescript
// Warp to specific stage
testDungeon9Stage(0)  // META_INTRO
testDungeon9Stage(1)  // MICRO_PLATFORM
testDungeon9Stage(2)  // MICRO_SHOOTER
testDungeon9Stage(3)  // MICRO_RHYTHM
testDungeon9Stage(4)  // STABILIZE finale
```

### Option 3: View Debug Info
While in Meta mode, run:
```typescript
showMetaModeDebug()
```

## Stage-by-Stage Testing

### Stage 0: META_INTRO
**Commands:**
```typescript
testDungeon9Stage(0)
```

**Test:**
- Wait 5 seconds
- Should auto-advance to Stage 1

**Expected:**
- Hint: `[META_INTRO_GET_READY]`
- Auto-complete after 5s
- Clean transition to Stage 1

---

### Stage 1: MICRO_PLATFORM
**Commands:**
```typescript
testDungeon9Stage(1)
showMetaModeDebug()  // Check goal status
```

**Controls:**
- D-Pad: Move left/right
- A: Jump

**Test:**
- Navigate platforms to goal flag (right side)
- Must complete within 20 seconds

**Expected:**
- Jump works (vy = -150)
- Gravity pulls down (ay = 300)
- Goal detection triggers completion
- Hint: `[MICRO_PLATFORM_COMPLETE]`
- Transition to Stage 2

**Failure:**
- Timer expires → `[MICRO_STAGE_TIME_UP]`
- Stage restarts (hard cleanup)

---

### Stage 2: MICRO_SHOOTER
**Commands:**
```typescript
testDungeon9Stage(2)
showMetaModeDebug()  // Check targets destroyed
```

**Controls:**
- D-Pad: Move ship
- A: Shoot bullets

**Test:**
- Destroy all 10 targets
- Must complete within 20 seconds

**Expected:**
- Bullets spawn (max 20 cap)
- Bullets auto-destroy after 2s
- Projectile-target collision destroys both
- Counter increments
- When all destroyed: `[MICRO_SHOOTER_COMPLETE]`
- Transition to Stage 3

**Debug:**
- Check sprite counts: `game.currentScene().allSprites.length`
- Verify projectiles capped: `sprites.allOfKind(KIND_PROJECTILE).length`

**Failure:**
- Timer expires → restart Stage 2

---

### Stage 3: MICRO_RHYTHM
**Commands:**
```typescript
testDungeon9Stage(3)
showMetaModeDebug()  // Check streak/misses
```

**Controls:**
- A: Tap in rhythm

**Test:**
- Tap A during beat windows
- Build streak to 5
- Must complete within 20 seconds

**Expected:**
- BPM: 120 (500ms beat interval)
- Good window: ±200ms from beat
- Good hit: `[RHYTHM_GOOD]`, streak++
- Miss: `[RHYTHM_MISS]`, streak resets
- Streak 5: `[MICRO_RHYTHM_COMPLETE]`
- Transition to Stage 4

**Timing:**
- Beat every ~500ms
- Watch for visual cue (if implemented)

**Failure:**
- Timer expires → restart Stage 3

---

### Stage 4: STABILIZE (Finale)
**Commands:**
```typescript
testDungeon9Stage(4)
showMetaModeDebug()  // Check nodes status
```

**Controls:**
- D-Pad: Move player

**Test:**
- Activate 4 nodes in sequence (0→1→2→3)
- Node positions:
  - Node 0: (30, 30) - top-left
  - Node 1: (130, 30) - top-right
  - Node 2: (30, 90) - bottom-left
  - Node 3: (130, 90) - bottom-right

**Expected:**
- Node 0 activated: `[NODE_STABILIZED_0]`
- Node 1 activated: `[NODE_STABILIZED_1]`
- Node 2 activated: `[NODE_STABILIZED_2]`
- Node 3 activated: `[NODE_STABILIZED_3]`
- All stabilized: `[STABILIZE_COMPLETE]`
- **DUNGEON COMPLETE!**

**Wrong Order:**
- Touch wrong node: `[WRONG_NODE_ORDER]`
- No activation, try correct node

**Completion:**
- Flags set:
  - `FLAG_DUN_09_CLEARED`
  - `FLAG_GAME_COMPLETED`
  - `FLAG_UNLOCK_FREE_ROAM_PLUS`
  - `FLAG_UNLOCK_COSMETIC_MASKS`
- Auto-save
- Return to hub at (1,1) position (80, 100)

---

## Mode-Bleed Verification

After each stage transition, check:

```typescript
// Count all sprites
game.currentScene().allSprites.length

// Check specific kinds
sprites.allOfKind(KIND_PROJECTILE).length  // Should be 0 after Stage 2
sprites.allOfKind(KIND_TARGET).length      // Should be 0 after Stage 2
sprites.allOfKind(KIND_INTERACTABLE).length // Should be 0 after Stage 4 (except hub)
```

**Expected:**
- Stage 0→1: No intro sprites remain
- Stage 1→2: No platform sprites remain
- Stage 2→3: No bullets/targets remain
- Stage 3→4: No rhythm markers remain
- Stage 4→Hub: No nodes remain

---

## Common Issues & Fixes

### Timer not starting
- Check: `state.dungeonStageData.startTime`
- Should be set to `game.runtime()`

### Jump not working (Stage 1)
- Check: `plyr.ay` should be 300 (gravity)
- Check: `plyr.vy` should change to -150 on jump

### Bullets not spawning (Stage 2)
- Check projectile cap: `sprites.allOfKind(KIND_PROJECTILE).length < 20`
- Check player sprite exists

### Rhythm always misses (Stage 3)
- Check beat timing: `data.nextBeatTime`
- Window is ±200ms from beat

### Nodes don't activate (Stage 4)
- Check sequence: `data.currentNodeIndex`
- Must touch nodes in order 0→1→2→3

### Final dungeon door doesn't appear
- Run: `unlockAllDungeons()`
- Check flag: `hasFlag("FLAG_ALL_DUNGEONS_CLEARED")`
- Must be in center hub room (1,1)

---

## Performance Checks

Run during gameplay:
```typescript
// Frame rate (should be stable ~30 FPS)
game.runtime()

// Sprite count (should not grow unbounded)
game.currentScene().allSprites.length

// Check caps
sprites.allOfKind(KIND_PROJECTILE).length  // Max 20
sprites.allOfKind(KIND_TARGET).length      // Max 10 (Stage 2)
sprites.allOfKind(KIND_INTERACTABLE).length // Max 4 (Stage 4)
```

---

## Success Criteria Checklist

- [ ] Stage 0 auto-completes
- [ ] Stage 1 jump + goal works
- [ ] Stage 2 shoot + targets work
- [ ] Stage 3 rhythm + streak works
- [ ] Stage 4 nodes + sequence works
- [ ] Timers work on all micro-stages
- [ ] Timer restarts on failure
- [ ] No mode-bleeds (sprites cleaned)
- [ ] Completion flags set
- [ ] Return to hub works
- [ ] No performance degradation
- [ ] Caps enforced

---

## Automated Test Run (Cheat)

For a quick full test, run these in sequence:
```typescript
// Setup
unlockAllDungeons()
warpToDungeon("DUN_FINAL_GLITCH_PANOPTICON")

// Stage 0: wait 5s (auto-complete)

// Stage 1: Platform
// (manually jump to goal or wait for timer)

// Stage 2: Shooter
// (manually shoot targets or wait for timer)

// Stage 3: Rhythm
// (manually tap rhythm or wait for timer)

// Stage 4: Finale
// (manually activate nodes in order)

// Verify completion
hasFlag("FLAG_GAME_COMPLETED")
```

---

## Report Template

```
Test Run: [Date/Time]
Tester: [Name]

Stage 0 - META_INTRO: ✅ / ❌
- Auto-completes: 
- Clean transition: 

Stage 1 - MICRO_PLATFORM: ✅ / ❌
- Jump works: 
- Goal detection: 
- Timer works: 
- Clean transition: 

Stage 2 - MICRO_SHOOTER: ✅ / ❌
- Shoot works: 
- Targets spawn: 
- Targets destroyed: 
- Timer works: 
- Clean transition: 

Stage 3 - MICRO_RHYTHM: ✅ / ❌
- Beat timing: 
- Streak builds: 
- Misses reset: 
- Timer works: 
- Clean transition: 

Stage 4 - STABILIZE: ✅ / ❌
- Nodes spawn: 
- Sequence works: 
- Wrong order blocked: 
- Completion triggers: 

Completion: ✅ / ❌
- Flags set: 
- Hub return: 
- No leftover sprites: 

Overall: PASS / FAIL
Notes: ___________
```
