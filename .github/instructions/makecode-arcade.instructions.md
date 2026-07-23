---
applyTo: "**/*.ts,**/*.jres,pxt.json,tests/**/*.test.js"
---

# MakeCode Arcade repository rules

Follow `AGENTS.md` first. These rules add technical constraints for MakeCode Arcade files.

## Runtime and architecture

- Treat `state.gameMode` and `state.playMode` as authoritative flow state.
- Route play-mode changes through `GameController.switchPlayMode()` so cleanup, setup, camera, tilemap, sprite, and HUD state stay coherent.
- Register global event handlers once. Guard handlers immediately by play mode and any narrower room, dungeon, stage, or cooldown condition.
- Avoid per-frame scans when an overlap, tile, input, or state-change event can own the behavior.
- Add caps, lifespan, auto-destroy, cleanup, debounce, or invulnerability only where the concrete behavior requires them.

## MakeCode syntax and dependencies

- Use repository-local MakeCode Arcade TypeScript idioms rather than general web TypeScript patterns.
- When an extension API is unclear, inspect its checked-in source under `pxt_modules/` before using it.
- Do not add an extension or npm dependency unless the assigned issue requires it.
- Keep `pxt.json` valid, ordered consistently with surrounding entries, and free of duplicate files.
- Preserve global namespace and source-order assumptions used by MakeCode; do not introduce ES module imports unless the repository already uses them for that file class.

## Assets and tilemaps

- Existing imported JRES assets are real repository assets, not disposable stubs.
- New assets must follow the established JRES/import pipeline and palette constraints unless the issue explicitly defines another path.
- Validate image headers, dimensions, payload lengths, tile indices, wall layers, and `pxt.json` registration when changing generated or imported assets.
- Placeholder sprite factories may remain placeholders until a dedicated asset issue replaces them.
- Do not encode runtime proof in comments such as `MANUAL TEST PASSED`; attach reproducible evidence to the PR.

## Text and audience

- Use placeholder IDs for unapproved dialog and story copy.
- Keep feedback and language appropriate for a target age of 10.

## Required proof

Run the strongest applicable subset of:

- `npm run lint`
- `npm run test`
- `npm run build`
- the exact MakeCode simulator path named by the issue

A successful Node test or type check does not substitute for simulator evidence when the issue concerns rendering, input, collisions, camera behavior, transitions, timing, or audio.