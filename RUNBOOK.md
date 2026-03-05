# Runbook: Repository Quality and Release Guardrails

## Purpose

Provide a repeatable operational process for validating repository quality controls before merge and release.

## Owners

- Primary: @jaspe
- Secondary: @neonkiez-maintainers

## SLO / Critical Metrics

- CI pass rate on default branch: >= 95%.
- Security report acknowledgement: within 14 days.
- Critical/high vulnerability remediation: within 60 days.

## Dependencies

- Node.js 20+
- npm lockfile integrity (`package-lock.json`)
- GitHub Actions availability

## Failure Modes

- CI workflow missing required quality steps.
- Repository scripts missing or drifting from expected commands.
- Security response targets removed from policy docs.
- Missing source file references in `pxt.json`.

## Detection

- `npm run lint` fails repository quality checks.
- `npm run test` fails governance regression tests.
- `npm run build` fails source manifest checks.
- `.motherlode/scripts/audit.ps1` reports score regression.

## Triage Steps

1. Reproduce locally with `npm run lint`, `npm run test`, and `npm run build`.
2. Identify first failing check and map to responsible file.
3. Patch in a small reversible change and rerun all checks.

## Recovery Steps

1. Restore required scripts/workflows/docs from latest passing commit.
2. Re-run local quality checks and Motherlode audit.
3. Merge fix via pull request with verification evidence.

## Verification

- Local commands pass: `npm run lint`, `npm run test`, `npm run build`.
- CI run on pull request is green.
- Motherlode audit score is stable or improved.

## Escalation Path

- If security SLA controls fail, notify repository owners immediately.
- If CI remains red for >24 hours, assign explicit incident owner.
- If remediation is blocked, create tracking issue with rollback plan.

## Post-incident Follow-up

- Add regression tests for the failed control.
- Update this runbook and SECURITY.md when process changes.
- Record timeline and action items in CHANGELOG or incident note.

## Change Log

- 2026-03-04: Initial runbook for repository quality and audit controls.
