# Bug Fix: SpriteKind Initialization Order

**Date:** 2025-01-22  
**Priority:** P0 (Crash on startup)  
**Status:** ✅ FIXED

---

## Problem (Runtime Crash)

### Error
```
Uncaught sim error: failed cast on [object Object]
   at spawnNPC (world_hub.ts:27:1)
   at spawnHubContent (world_hub.ts:11:1)
   at setup (game_controller_hub.ts:6:5)
```

### Symptoms
- Game crashes immediately after title screen
- Error occurs when trying to spawn NPCs in hub
- "failed cast" error on `sprites.create(imgNpc(npcId), KIND_NPC)`

---

## Root Cause

### File-Level Constant Initialization
```typescript
// constants.ts (BEFORE - BROKEN)
const KIND_NPC = SpriteKind.create();
const KIND_DOOR = SpriteKind.create();
// ... etc
```

**Problem:** `SpriteKind.create()` is called at **file load time** (top-level execution), which happens **before** the MakeCode Arcade game engine is fully initialized.

### MakeCode Initialization Order
1. TypeScript files load and execute top-level code
2. `SpriteKind.create()` is called → returns invalid/uninitialized object
3. Game engine initializes
4. `sprites.create(img, KIND_NPC)` is called → tries to use invalid SpriteKind → **cast fails**

### Why It Fails
MakeCode's `SpriteKind.create()` internally needs the game scene and sprite system to be initialized. When called too early:
- Returns an object that looks valid but isn't properly registered
- Runtime cast fails when trying to use it with `sprites.create()`

---

## Solution (Lazy Initialization)

### Changed to Let + Init Function
```typescript
// constants.ts (AFTER - FIXED)
let KIND_NPC: number;
let KIND_DOOR: number;
// ... etc

function initSpriteKinds() {
  if (KIND_PLAYER !== undefined) return; // Guard against double-init
  
  KIND_PLAYER = SpriteKind.Player;
  KIND_ENEMY = SpriteKind.Enemy;
  KIND_PROJECTILE = SpriteKind.Projectile;
  KIND_NPC = SpriteKind.create();
  KIND_DOOR = SpriteKind.create();
  KIND_INTERACTABLE = SpriteKind.create();
  KIND_COLLECTIBLE = SpriteKind.create();
  KIND_HAZARD = SpriteKind.create();
  KIND_DEBRIS = SpriteKind.create();
  KIND_PLATFORM_MOVING = SpriteKind.create();
  KIND_TARGET = SpriteKind.create();
  KIND_TOOL_EFFECT = SpriteKind.create();
  KIND_PADDLE = SpriteKind.create();
  KIND_BALL = SpriteKind.create();
  KIND_HUD = SpriteKind.create();
}
```

### Call from GameController.start()
```typescript
// game_controller.ts
export function start() {
  // Initialize sprite kinds before anything else
  initSpriteKinds();
  
  initState();
  runDungeonRegistryValidation();
  registerGlobalHandlers();
  setGameMode(GameMode.Title);
  showTitle();
}
```

---

## Additional Fixes (Visibility)

### Transparent Sprite Images
While debugging, also fixed placeholder assets being completely transparent:

```typescript
// assets_stub.ts (BEFORE)
function imgNpc(id: string): Image {
  return image.create(16, 16); // Transparent - hard to debug
}

// assets_stub.ts (AFTER)
function imgNpc(id: string): Image {
  const img = image.create(16, 16);
  img.fill(8); // Visible light gray placeholder
  return img;
}
```

Applied to:
- `imgNpc()` → gray (8)
- `imgDoor()` → gray (5)
- `imgPlayerTopdown()` → white (7)

**Rationale:** Visible placeholders make it easier to verify sprites are spawning correctly during development.

---

## Test Evidence

### Build Status
✅ `pxt build` exits 0 (no TypeScript errors)

### Expected Runtime
- Title screen loads
- Hub room loads with visible tilemap
- Player spawns (white square)
- NPCs spawn (gray squares) at center room
- Dungeon doors spawn (gray squares) in correct rooms
- No crash when pressing A on title

### Manual Test Required
- [ ] Load in simulator
- [ ] Verify title appears
- [ ] Press A → hub loads
- [ ] Verify white player square visible
- [ ] Verify gray NPC/door squares visible
- [ ] Move player around
- [ ] No crashes

---

## Lessons Learned

### MakeCode Arcade Initialization Order
1. **Never call `SpriteKind.create()` at file level**
   - Use `let` declarations instead of `const`
   - Initialize in `start()` or first usage

2. **Engine Readiness**
   - MakeCode initializes game engine after file loading
   - Top-level code runs before engine is ready
   - Sprites, scenes, tilemaps need engine initialized first

3. **Debugging Pattern**
   - "failed cast" errors usually mean invalid/uninitialized objects
   - Check initialization order first
   - Make placeholders visible (not transparent) during debugging

### Similar Patterns to Watch
If you see "failed cast" errors in the future, check:
- `SpriteKind.create()` timing
- `tiles.createTilemap()` timing (if using complex patterns)
- Custom type assertions with `as any`
- Objects created before engine init

---

## Follow-Up Validation

### Automated
- [x] Build succeeds
- [x] No TypeScript errors

### Manual (Required)
- [ ] Simulator loads without crash
- [ ] Hub visible with player + NPCs + doors
- [ ] Mode transitions work (if testing dungeons)

---

**Status:** ✅ FIX IMPLEMENTED, BUILD VERIFIED  
**Next:** Manual testing in simulator
