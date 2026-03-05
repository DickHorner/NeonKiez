## Context
Core flow code heavily uses `any`, weakening TypeScript guarantees and making regressions hard to detect.

## Scope (Hard)
Allowed files only:
- `constants.ts`
- `state.ts`
- `game_controller.ts`
- `game_controller_hub.ts`
- `game_controller_platform.ts`
- `game_controller_rhythm.ts`
- `game_controller_meta.ts`

Forbidden:
- Asset files.
- New game features.
- Large architecture rewrites.

## Tasks
- [ ] Replace high-impact `any` with typed interfaces for:
  - play-mode payloads
  - dungeon stage data in active modes
  - `DungeonSpec.params` narrowed shape where currently consumed
- [ ] Remove `null as any` initialization where safe alternatives exist.
- [ ] Keep compile/runtime behavior unchanged.

## Acceptance Criteria
- [ ] `any` count reduced in listed files by >= 60%.
- [ ] No new `any` introduced elsewhere.
- [ ] Existing scripts pass.

## Test Evidence
Run and paste output:
- `npm run test`
- `npm run lint`
- `npm run build`

## Copilot Leash Prompt
```text
Perform a type-hardening pass only in listed core files.

Guardrails:
- No feature changes.
- Prefer small interfaces and type aliases over generic unions unless required.
- Keep runtime code shape stable.
- Stop after reducing high-risk `any` usage; do not chase perfection.

Success:
- Substantial `any` reduction with passing quality gates.
```
