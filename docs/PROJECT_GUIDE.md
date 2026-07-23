# Neon-Kiez project guide

This document provides product and architecture context. It does not define agent working method and does not expand the scope of an assigned issue. Agent behavior is governed by `AGENTS.md`.

## Product shape

Neon-Kiez is a story-driven, child-appropriate retro game built with MakeCode Arcade TypeScript.

- The hub uses top-down exploration across a 3x3 room grid.
- Dungeons switch immediately into their assigned play mode after a short story beat.
- Dungeon modes include platform, shooter, asteroids, rhythm, puzzle, and meta gameplay.
- Dialog and story text remain placeholder IDs until approved copy is supplied.
- Feedback should use comic, non-graphic language and presentation suitable for a target age of 10.

## Architectural invariants

- `state.gameMode` owns high-level flow.
- `state.playMode` owns the active gameplay system.
- `GameController.switchPlayMode()` owns cleanup and setup for play-mode changes.
- `DungeonSpec` data is the source of truth for dungeon IDs, modes, stages, rewards, and hub return tags.
- Global event handlers are registered once and guarded by the active mode and narrower state.
- Hub room location is stored in `state.hubRoom`.
- Runtime-owned sprites, timers, camera state, backgrounds, tilemaps, and temporary state must be cleaned up during mode changes.

## Repository map

- `main.ts` — minimal bootstrap
- `constants.ts` — IDs, enums, tuning values, sprite kinds, and limits
- `state.ts` — runtime state
- `save.ts` — persistence and validation
- `game_controller.ts` and `game_controller_*.ts` — mode switching and mode setup
- `player_*.ts` — mode-specific player controls
- `world_hub.ts` — hub NPC and dungeon-door content
- `world_dungeons.ts` — dungeon registry and specifications
- `assets_stub.ts`, `hub_*_tilemap.ts`, and `hub_tiles_*.jres` — placeholder factories and imported hub assets
- `tests/` — Node-based repository and source regression tests
- `pxt_modules/` — local extension sources used to verify MakeCode APIs

## Current hub direction

The hub is intended to become a connected 3x3 room grid. Work should proceed through narrow room- or transition-specific issues rather than implementing the entire grid in one patch.

Imported RPG Urban tiles are an established visual baseline. They are registered as JRES assets and must be referenced through repository-supported MakeCode tile instances. Placeholder player, NPC, door, and mode sprites can be replaced only by dedicated asset work.

## Dungeon catalogue

1. `DUN_LAUNDROMAT_LABYRINTH` — puzzle/maze
2. `DUN_ROOFTOP_INVADERS` — top-down shooter
3. `DUN_WAREHOUSE_BLOCKWORKS` — block/conveyor puzzle
4. `DUN_SUBWAY_TIMING` — rhythm/timing
5. `DUN_SCHOOL_PONG_COURT` — pong/breakout puzzle
6. `DUN_ARCADE_MUSEUM_ASTEROIDS` — asteroids
7. `DUN_VIDEO_STORE_PLATFORM_TRIAL` — side-scrolling platformer
8. `DUN_CONSTRUCTION_DONKEY_TOWER` — platform/ladders
9. `DUN_FINAL_GLITCH_PANOPTICON` — meta finale

The exact stage IDs, rewards, and current implementation status live in `world_dungeons.ts`, tests, and issue tracking. Do not copy stale values from documentation into code without verifying the repository.

## Evidence expectations

Automated checks cover repository structure, source contracts, and build constraints. MakeCode simulator evidence remains necessary for rendering, input, collision, camera, transition, timing, audio, and gameplay acceptance criteria.