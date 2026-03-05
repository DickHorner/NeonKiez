## Context
Ownership clarity and bus factor remain below constitution baseline.

## Scope (Hard)
Allowed files only:
- `.github/CODEOWNERS` (new)
- `README.md` (optional reference)

Forbidden:
- Broad ownership claims without maintainers confirmed.

## Tasks
- [ ] Add CODEOWNERS with at least two owners for critical paths.
- [ ] Ensure core game files, build pipeline, and security docs have explicit owners.

## Acceptance Criteria
- [ ] Motherlode `docs.codeowners` and `ownership.bus_factor` pass.
- [ ] At least 2 unique owners in CODEOWNERS.

## Test Evidence
- `./.motherlode/scripts/audit.ps1`

## Copilot Leash Prompt
```text
Add CODEOWNERS to satisfy ownership clarity and bus-factor >=2.

Constraints:
- Include at least two distinct maintainers across critical paths.
- Keep file concise and auditable.
```
