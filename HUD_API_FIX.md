# HUD API Fix — Root Cause Analysis

## Problem (Build Blocker P0)

14 TypeScript errors (TS2339) blocking compilation:
- Property 'setFlag' does not exist on type 'TextSprite'
- Property 'right' does not exist on type 'TextSprite'  
- Property 'bottom' does not exist on type 'TextSprite'
- Property 'setMaxFontHeight' does not exist on type 'TextSprite'

## Root Cause

**story.TextSprite is NOT a standard Sprite.**

### Inheritance Chain Investigation
```typescript
// arcade-storytelling/shapeSprites.ts
export class TextSprite extends ShapeSprite { ... }
export class ShapeSprite extends sprites.BaseSprite { ... }

// game/basesprite.ts  
export class BaseSprite implements SpriteLike { ... }
```

`story.TextSprite` inherits from `sprites.BaseSprite`, which provides:
- ✅ z-ordering
- ✅ id assignment
- ✅ __draw() / __update() lifecycle

But **does NOT** provide:
- ❌ `setFlag()` method
- ❌ Positioning properties (`left`, `right`, `top`, `bottom`, `x`, `y`)
- ❌ Font control methods
- ❌ Standard Sprite game object capabilities

### story.TextSprite API (Complete)
```typescript
// ONLY these methods exist:
setText(text: string)
getWidth(): number
getHeight(): number
drawShape(left: number, top: number, color: number)

// From ShapeSprite parent:
left: number  // ✅ EXISTS (manual positioning for rendering)
top: number   // ✅ EXISTS
color: number
setColor(color: number)
```

**KEY INSIGHT:** `story.TextSprite.left` and `.top` are **render coordinates**, not game-world positioning. They have no relation to camera, sprites, or game space.

## Solution (Implemented)

**Replace story.TextSprite with standard Sprites using text images.**

### Implementation Pattern
```typescript
function createTextImage(text: string, color: number): Image {
  const font = image.getFontForText(text);
  const w = Math.max(1, font.charWidth * text.length);
  const h = font.charHeight;
  const img = image.create(w, h);
  if (text) img.print(text, 0, 0, color);
  return img;
}

// Create HUD sprites
hudHearts = sprites.create(createTextImage("♥♥♥", 2), KIND_HUD);
hudHearts.setFlag(SpriteFlag.RelativeToCamera, true); // ✅ Now works!
hudHearts.left = 2;  // ✅ Now works!
hudHearts.top = 2;   // ✅ Now works!

// Update text dynamically
hudHearts.setImage(createTextImage(newText, 2));
hudTool.right = scene.screenWidth() - 2; // ✅ Maintain right alignment
```

## Files Modified

### ui_hud.ts (Complete Rewrite)
- **Before:** `story.TextSprite` with `.setText()` calls
- **After:** Standard `Sprite` with `.setImage(createTextImage(...))` calls
- Added `createTextImage()` helper factory
- Maintained all positioning logic (left/right/top/bottom)
- Maintained RelativeToCamera flag for HUD overlay
- Maintains alignment after text updates

### constants.ts
- Added `const KIND_HUD = SpriteKind.create();`

## Test Evidence

**Build Status:** ✅ Exit Code 0 (no TypeScript errors)

All 14 TS2339 errors resolved:
- ✅ `setFlag()` now available (standard Sprite method)
- ✅ `left/right/top/bottom` now available (standard Sprite properties)
- ✅ `setMaxFontHeight()` no longer needed (font is baked into image)

## Follow-up Validation Required

### Manual Testing Needed:
1. **HUD Visibility:** Start game → Hub mode → verify hearts display top-left
2. **HUD Updates:** Take damage → verify heart count updates
3. **Tool Display:** Acquire tool → verify tool name shows top-right
4. **Hint Display:** Trigger hint → verify text shows bottom-left for 2s
5. **Camera Independence:** Move player → verify HUD stays fixed to screen
6. **Mode Transitions:** Hub → Dungeon → return → verify HUD persists correctly

### Performance Check:
- HUD update frequency: Only on state change (damage/tool/hint)
- No per-frame regeneration (images cached in sprites)
- Text image allocation: ~100 bytes per HUD element (negligible)

## Lessons Learned (Post-Mortem)

1. **Extension API Research:** Always read source (`pxt_modules/<extension>/*.ts`) before assuming API compatibility
2. **Type System Trust:** If TypeScript says "property does not exist", believe it — no workarounds
3. **Naming Ambiguity:** `TextSprite` sounds like it should be a text-capable Sprite, but it's actually a custom renderer
4. **Correct Pattern:** MakeCode Arcade text overlays should use `image.print()` → `sprites.create()` → `setFlag(RelativeToCamera)`

## Architecture Decision Record

**Decision:** Use standard Sprites with text images for HUD, not story.TextSprite

**Rationale:**
- story.TextSprite designed for narrative/dialog rendering (fullscreen, no game-world interaction)
- HUD requires game-object capabilities (flags, positioning, z-ordering, visibility)
- Standard Sprite API well-documented and stable
- Text-to-image conversion is cheap and cacheable

**Tradeoffs:**
- ✅ Pro: Full Sprite API available (setFlag, positioning, collision, etc.)
- ✅ Pro: RelativeToCamera flag works as expected
- ✅ Pro: No dependency on arcade-storytelling for core HUD
- ⚠️ Con: Text updates require image regeneration (acceptable for low-frequency HUD updates)
- ⚠️ Con: Fixed-width fonts only (acceptable for retro aesthetic)

**Status:** IMPLEMENTED, BUILD VERIFIED

## Manual Test Plan (Human Required)

```
[SMOKE TEST]
1. Load game in simulator
2. Verify HUD appears (hearts, empty tool slot)
3. PASS if visible, FAIL if blank/error

[FUNCTIONAL TEST]
4. Trigger damage (if possible in hub)
5. Verify heart count decrements
6. Acquire first tool (debug warp if needed)
7. Verify tool name shows top-right
8. PASS if updates work, FAIL if stale

[TRANSITION TEST]
9. Enter any dungeon
10. Verify HUD remains visible
11. Return to hub
12. Verify HUD still functional
13. PASS if persists across modes, FAIL if crashes

[CAMERA TEST]
14. Move player to edge of hub room
15. Verify HUD stays fixed to screen corners
16. PASS if HUD doesn't scroll with world
```

**Expected Outcome:** All tests PASS  
**If FAIL:** Revert to direct `screen.print()` in update loop (fallback plan)

---

**MANUAL TEST PASSED:** _(human fills this in after testing)_

**Fix Verified By:** _(name + date)_
