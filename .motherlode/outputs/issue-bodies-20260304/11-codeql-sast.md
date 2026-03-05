## Context
Static analysis is missing, leaving security regressions harder to catch automatically.

## Scope (Hard)
Allowed files only:
- `.github/workflows/codeql.yml` (new)
- `README.md` (optional badge/link)

Forbidden:
- Replacing existing CI workflow.

## Tasks
- [ ] Add CodeQL workflow for JavaScript/TypeScript.
- [ ] Trigger on push/PR and weekly schedule.
- [ ] Keep runtime minutes reasonable.

## Acceptance Criteria
- [ ] Motherlode `security.sast` check passes.
- [ ] Workflow syntax valid and runnable in GitHub Actions.

## Test Evidence
- `./.motherlode/scripts/audit.ps1`
- Link first CodeQL run in PR

## Copilot Leash Prompt
```text
Add a minimal safe CodeQL workflow for JS/TS only.

Rules:
- New file only under `.github/workflows/codeql.yml`.
- Do not alter existing CI steps.
- Keep it simple: checkout, init, autobuild/analyze.
```
