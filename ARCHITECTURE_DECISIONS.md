# Architecture Decisions

Decisions recorded in chronological order. Use the [ADR template](.motherlode/templates/ADR.md) for new entries.

---

## ADR-001: MakeCode Arcade + TypeScript as target platform

**Status:** Accepted

**Context:** Need a cross-platform retro-game engine suitable for a 10-year-old audience, with minimal setup overhead and built-in sprite/tilemap tooling.

**Decision:** Use [MakeCode Arcade](https://arcade.makecode.com/) with TypeScript. All code compiles to the MakeCode runtime; the `pxt.json` manifest pins extension versions.

**Consequences:**
- Positive: Instant simulator; no separate build pipeline for gameplay testing; kid-friendly output.
- Negative: Runtime is not standard Node.js; unit tests require shims (`arcade_shims.ts`).

---

## ADR-002: Single `state.ts` global game state

**Status:** Accepted

**Context:** MakeCode Arcade does not provide a dependency-injection container. A shared mutable state object is the practical choice for a small codebase.

**Decision:** All runtime state lives in a single exported `GameState` object in `state.ts`. Validated constants (`STATE_MIN_HEARTS`, `STATE_MAX_HEARTS`, etc.) guard every mutation.

**Consequences:**
- Positive: Easy to inspect; save/load is one serialization call.
- Negative: All modules share the same object — discipline required to avoid implicit coupling.

---

## ADR-003: PlayMode StateMachine in `game_controller.ts`

**Status:** Accepted

**Context:** Nine dungeons each require a completely different control scheme, spawn pool, and HUD state. Switching modes must be deterministic and leak-free.

**Decision:** `switchPlayMode(next, payload)` is the single entry-point for all mode changes. It always runs `cleanupCurrentPlayMode()` before `setupNextPlayMode()`. A `transitionLock` flag blocks re-entrant calls.

**Consequences:**
- Positive: No sprite/timer leaks between modes; event handlers registered once with early-return guards.
- Negative: All mode logic must be written to tolerate a full teardown on exit.

---

## ADR-004: Placeholder-first asset strategy

**Status:** Accepted

**Context:** Human artists deliver sprites, tilemaps, and audio after the code scaffold is complete.

**Decision:** All assets are created via factory functions in `assets_stub.ts` returning coloured placeholder images. Naming follows strict prefixes (`SPR_*`, `TM_*`, `SFX_*`, `BGM_*`). Text is referenced by ID only (`[CUT_DUN_01_ENTRY_BEAT_...]`).

**Consequences:**
- Positive: Code compiles and runs without any real assets; no merge conflicts when artists deliver.
- Negative: Simulator output looks placeholder until artists replace assets.

---

## ADR-005: Dungeon-spec data model as single source of truth

**Status:** Accepted

**Context:** Nine dungeons with different modes, stages, rewards, and return points. Hard-coding this in procedural logic would create high change amplification.

**Decision:** Each dungeon is described by a `DungeonSpec` object in `constants.ts`. All dungeon entry/exit logic reads from the spec. Adding a dungeon means adding one spec entry.

**Consequences:**
- Positive: Dungeon catalogue is readable and auditable; no logic duplication.
- Negative: Spec must be kept in sync when dungeon behaviour diverges significantly.

---

## ADR-006: Node.js test harness with arcade shims

**Status:** Accepted

**Context:** MakeCode Arcade code cannot run in Node.js directly; it uses a proprietary runtime API.

**Decision:** `arcade_shims.ts` stubs out MakeCode globals so that unit tests in `tests/*.test.js` can import and exercise game logic (state validation, save/load boundaries, governance checks) without the full simulator.

**Consequences:**
- Positive: Fast, scriptable CI-compatible tests for logic layers.
- Negative: Shims must be kept in sync with any MakeCode API used in tested modules.
