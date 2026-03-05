## Context
Current tests focus on governance automation; gameplay/core correctness lacks automated coverage.

## Scope (Hard)
Allowed files only:
- `tests/*.test.js` (new targeted suites)
- `scripts/repo-quality-check.js` (only if wiring needed)
- `package.json` (only if script include needed)
- minimal pure helper extraction from core files only when strictly required

Forbidden:
- Asset implementation.
- Feature additions.

## Tasks
- [ ] Add first wave of risk-based tests for:
  - inventory and flag helpers
  - dungeon clear gating logic
  - tool unlock idempotency
- [ ] Keep tests deterministic and runtime-independent.

## Acceptance Criteria
- [ ] At least 3 new risk-based suites in CI.
- [ ] Tests target behavior, not snapshots.

## Test Evidence
- `npm run test`

## Copilot Leash Prompt
```text
Expand risk-based automated tests for core game logic without touching assets or adding features.

Priorities:
1) state helper invariants
2) dungeon clear gating
3) tool unlock idempotency

Keep production edits tiny and only to expose pure test seams.
```

