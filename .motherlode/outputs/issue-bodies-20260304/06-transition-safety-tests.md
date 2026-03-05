## Context
Transition safety is a core correctness risk. We need regression tests for `transitionLock`, cleanup invariants, and mode-switch idempotency.

## Scope (Hard)
Allowed files only:
- `game_controller.ts`
- `tests/transition-safety.test.js` (new)
- small test helper under `tests/helpers/*` if required

Forbidden:
- New game features.
- Any changes in dungeon content.

## Tasks
- [ ] Isolate transition logic into testable helper(s) as needed.
- [ ] Add tests for lock preventing re-entry.
- [ ] Add tests for cleanup reset expectations.
- [ ] Add tests for idempotent mode switch behavior.

## Acceptance Criteria
- [ ] Transition regression tests fail if lock/cleanup contract breaks.
- [ ] Existing behavior unchanged.

## Test Evidence
- `npm run test`
- `npm run lint`

## Copilot Leash Prompt
```text
Create a small test seam around transition safety and add regression tests.

Do:
- Keep patch minimal.
- Validate lock, cleanup, and idempotency contracts.

Do not:
- Change gameplay semantics.
```
