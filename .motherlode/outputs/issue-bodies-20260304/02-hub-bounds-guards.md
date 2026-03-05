## Context
Hub setup trusts `payload.hubRoom` and direct room indexing without bounds checks. Invalid values can fault room lookup and break startup transitions.

## Scope (Hard)
Allowed files only:
- `game_controller_hub.ts`
- `constants.ts` (only if adding helper constants)
- `tests/hub-room-guard.test.js` (new)

Forbidden:
- Door/NPC feature work.
- Any dungeons/mode mechanics.
- Asset or UI changes.

## Tasks
- [ ] Validate `payload.hubRoom` shape and bounds before assigning to state.
- [ ] Validate spawn-tag lookup and fallback deterministically.
- [ ] Guard room ID lookup with safe fallback to center room.
- [ ] Add clear debug hints when fallback is used.
- [ ] Add tests for negative/overflow/non-numeric row/col.

## Acceptance Criteria
- [ ] No out-of-bounds array access from hub setup.
- [ ] Invalid input always falls back to `HUB_START_ROOM`.
- [ ] Existing valid flow behavior unchanged.

## Test Evidence
Run and paste output:
- `npm run test`
- `npm run lint`
- `npm run build`

## Copilot Leash Prompt
```text
Implement strict bounds guards for hub room payload handling.

Constraints:
- Edit only `game_controller_hub.ts`, optional constants helper, and new focused tests.
- Keep functional behavior unchanged for valid payloads.
- Add explicit fallback path to HUB_START_ROOM and debug hint.
- No refactor beyond this defect class.

Deliver:
- Minimal patch with tests.
- Proof commands and output snippets.
```
