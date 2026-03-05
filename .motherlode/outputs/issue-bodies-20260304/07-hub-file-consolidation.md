## Context
`world_hub.ts` and `world_hub_fixed.ts` represent drift risk and cognitive overhead. Only one should remain as source-of-truth.

## Scope (Hard)
Allowed files only:
- `world_hub.ts`
- `world_hub_fixed.ts`
- `pxt.json`
- `README.md` (if reference update needed)

Forbidden:
- Functional changes beyond consolidation.

## Tasks
- [ ] Decide canonical implementation (currently `world_hub.ts` is referenced in `pxt.json`).
- [ ] Remove or archive non-canonical duplicate with rationale.
- [ ] Verify no dangling references.

## Acceptance Criteria
- [ ] Single authoritative hub implementation.
- [ ] No dead file confusion for contributors.

## Test Evidence
- `npm run build`
- `npm run test`

## Copilot Leash Prompt
```text
Consolidate duplicate hub implementation files with no gameplay changes.

Rules:
- Preserve currently active behavior.
- Prefer deleting or clearly deprecating duplicate file.
- Update references/docs only if required.
```
