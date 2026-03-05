## Context
Motherlode audit still fails governance docs checks that affect contributor consistency.

## Scope (Hard)
Allowed files only:
- `CONTRIBUTING.md` (new)
- `ARCHITECTURE_DECISIONS.md` (new)
- `AGENTS.md` (new at repo root)
- `README.md` (links only)

Forbidden:
- Policy text that conflicts with existing .motherlode constitution.

## Tasks
- [ ] Add CONTRIBUTING with branch/PR/test expectations.
- [ ] Add architecture decision summary for current scaffold choices.
- [ ] Add root AGENTS.md pointing to repo guardrails.
- [ ] Link docs from README.

## Acceptance Criteria
- [ ] Motherlode checks for contributing/architecture/agents pass.
- [ ] Docs include concrete commands (`npm run lint/test/build`).

## Test Evidence
- `./.motherlode/scripts/audit.ps1`

## Copilot Leash Prompt
```text
Close governance documentation gaps exactly as specified.

Rules:
- Keep docs concise and actionable.
- Align with existing Motherlode constitution.
- Add command examples that match package scripts.
```
