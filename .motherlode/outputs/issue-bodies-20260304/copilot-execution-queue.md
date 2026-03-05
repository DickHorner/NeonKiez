# Copilot Execution Queue (2026-03-04)

Use this order to minimize merge conflicts and maximize signal.

1. #67 Save-state trust boundary
2. #68 Hub payload bounds guards
3. #69 Type-hardening core contracts
4. #70 Explicit failure signals for critical exits
5. #71 Dungeon registry deterministic tests
6. #72 Transition safety regression tests
7. #74 Risk-based core tests wave 1
8. #73 Hub file consolidation
9. #75 Governance docs baseline
10. #76 CODEOWNERS bus-factor baseline
11. #77 CodeQL SAST workflow baseline

## Universal Copilot Starter Prompt

```text
Work only on issue #<NUMBER> from DickHorner/NeonKiez.

Hard constraints:
- Follow the issue body exactly (scope, allowed files, forbidden files).
- Keep patch small and reversible.
- No unrelated refactors.
- If blocked, stop and report the exact blocker and proposed minimal workaround.

Quality gates:
- npm run lint
- npm run test
- npm run build
- For governance/security issues: ./.motherlode/scripts/audit.ps1

Output format:
1) Summary of files changed
2) Why each change was needed
3) Exact command outputs (pass/fail)
4) Remaining risks
```

## PR Title Convention

`[#<issue>] <short imperative summary>`

Examples:
- `[#67] Harden save deserialization and clamp runtime state`
- `[#72] Add transition lock and cleanup regression tests`
