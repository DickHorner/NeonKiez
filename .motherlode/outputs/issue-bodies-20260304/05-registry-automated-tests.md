## Context
Dungeon registry validation exists but is only manually exercised; there are no deterministic automated tests protecting these invariants.

## Scope (Hard)
Allowed files only:
- `world_dungeons.ts`
- `tests/dungeon-registry.test.js` (new)
- `package.json` (only if test script needs include)

Forbidden:
- Editing real dungeon content IDs unless test harness needs fixtures.

## Tasks
- [ ] Extract pure validation helper inputs where needed.
- [ ] Add unit tests for count, uniqueness, required fields, stage counts.
- [ ] Ensure tests run in Node without Arcade runtime dependencies.

## Acceptance Criteria
- [ ] Registry invariants covered by deterministic tests.
- [ ] Tests fail on duplicate stage IDs and duplicate flags.

## Test Evidence
- `npm run test`

## Copilot Leash Prompt
```text
Add deterministic unit tests for dungeon registry invariants with minimal production refactor.

Constraints:
- Keep runtime behavior unchanged.
- Prefer extracting pure helper(s) from existing validation logic.
- Do not touch assets or mode controllers.
```
