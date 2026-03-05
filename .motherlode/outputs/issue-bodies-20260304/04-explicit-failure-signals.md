## Context
Critical flow paths rely on silent `return;` exits, which obscures why actions fail and slows debugging.

## Scope (Hard)
Allowed files only:
- `game_controller.ts`
- `game_controller_hub.ts`
- `world_dungeons.ts`
- `debug.ts`
- `tests/failure-signals.test.js` (new)

Forbidden:
- UI copy redesign.
- Gameplay changes unrelated to observability.

## Tasks
- [ ] Introduce lightweight fail-reason signaling for critical guard exits.
- [ ] Log only in debug mode or via a single gated helper.
- [ ] Cover missing spec / missing player / invalid stage transitions.
- [ ] Add tests for expected fail-reason emissions.

## Acceptance Criteria
- [ ] Critical early exits have diagnosable reason codes.
- [ ] No noisy logs in normal flow.
- [ ] Tests verify guard reason coverage.

## Test Evidence
- `npm run test`
- `npm run lint`
- `npm run build`

## Copilot Leash Prompt
```text
Add observability to silent guard exits in core controller paths.

Rules:
- Do not alter control flow outcomes.
- Add reason codes + gated debug logging only.
- Keep helper centralized and tiny.
- Add focused tests for reason emission.
```
