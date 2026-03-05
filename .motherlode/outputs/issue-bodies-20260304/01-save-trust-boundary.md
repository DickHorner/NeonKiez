## Context
Save data is a trust boundary. `loadGame()` currently accepts JSON payload values without schema validation or bounds clamping, which can inject invalid runtime state and break progression.

## Scope (Hard)
Allowed files only:
- `save.ts`
- `state.ts` (only if adding helper types/constants)
- `tests/repo-governance.test.js` (only if needed for script integration)
- `tests/save-state-boundary.test.js` (new)

Forbidden:
- Any gameplay feature changes outside state normalization.
- Any asset/tilemap changes.
- Any edits in mode controllers.

## Tasks
- [ ] Add explicit save payload types and runtime guards for each field.
- [ ] Clamp numeric fields (`hearts`, `maxHearts`, `energy`) to valid ranges.
- [ ] Validate `hubRoom` row/col bounds with safe fallback.
- [ ] Ignore unknown keys and malformed nested values safely.
- [ ] Emit deterministic debug log on rejected/normalized fields.
- [ ] Add tests for malformed, partial, and hostile payloads.

## Acceptance Criteria
- [ ] Invalid save payload cannot crash boot flow.
- [ ] Loaded state always satisfies invariant ranges.
- [ ] Corrupt JSON returns `false` and leaves safe defaults.
- [ ] New tests cover at least: missing fields, wrong types, out-of-range numbers, invalid hubRoom.

## Test Evidence
Run and paste output:
- `npm run test`
- `npm run lint`
- `npm run build`

## Copilot Leash Prompt
```text
You are fixing a single trust-boundary bug set. Do only this issue.

Goal:
Harden save-state deserialization in `save.ts` so invalid or hostile persisted payloads cannot produce illegal runtime state.

Rules:
1) Edit only allowed files listed in the issue.
2) Do not modify gameplay behavior except sanitizing loaded state values.
3) Prefer small pure helper functions for validation/clamping.
4) Keep changes reversible and under 200 LOC net-new.
5) Add deterministic tests for malformed payload cases.
6) Provide a short invariants table in PR description.

Done when:
- All acceptance criteria pass.
- `npm run test && npm run lint && npm run build` all pass.
```
