# Architecture Decisions

Decisions recorded in chronological order. Use the ADR template in `.motherlode/templates/ADR.md` for new entries.

## ADR-001: MakeCode Arcade + TypeScript as target platform

Status: Accepted

Context: Need a cross-platform retro-game engine with minimal setup overhead and strong built-in sprite/tilemap tooling.

Decision: Use MakeCode Arcade with TypeScript. All code compiles to the MakeCode runtime and `pxt.json` pins extension versions.

Consequences:
- Positive: Fast simulator loop and approachable tooling.
- Negative: Runtime is not plain Node.js, so tests rely on shims or source-driven checks.

## ADR-002: Single `state.ts` global game state

Status: Accepted

Context: MakeCode Arcade does not provide a dependency-injection container, and gameplay systems need to share progress state.

Decision: Keep runtime state in a single `GameState` object in `state.ts`. Save/load validation bounds derive from runtime caps.

Consequences:
- Positive: Easy inspection and serialization.
- Negative: Modules must stay disciplined to avoid implicit coupling.

## ADR-003: PlayMode state machine in `game_controller.ts`

Status: Accepted

Context: Nine dungeons use different controls, setup, and teardown requirements.

Decision: `switchPlayMode(nextMode, payload)` is the single entry point for mode changes. It always runs cleanup before setup and uses `transitionLock` to block re-entry.

Consequences:
- Positive: Deterministic transitions and fewer resource leaks.
- Negative: Every mode must tolerate full teardown on exit.

## ADR-004: Placeholder-first asset strategy

Status: Accepted

Context: Gameplay scaffolding needs to move faster than final asset delivery.

Decision: Keep all assets as placeholder factories in `assets_stub.ts` until the final asset handoff.

Consequences:
- Positive: Code stays runnable without binary art assets.
- Negative: Visual fidelity stays intentionally temporary during development.

## ADR-005: Dungeon spec data model as single source of truth

Status: Accepted

Context: Dungeon metadata is reused across entry, rewards, validation, and exit flows.

Decision: Represent each dungeon as a `DungeonSpec` entry in `constants.ts`, and drive registry logic from that data.

Consequences:
- Positive: Centralized, auditable dungeon metadata.
- Negative: Spec changes can ripple across tests if fields drift.
