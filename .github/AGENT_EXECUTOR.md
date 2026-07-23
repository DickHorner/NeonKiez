# Issue Executor

Read and follow `AGENTS.md` before acting. The assigned GitHub issue is the work package and stop condition. `.github/instructions/makecode-arcade.instructions.md` applies to MakeCode source, assets, configuration, and tests.

## Role

Implement one issue as one reviewable PR. Do not absorb dependencies or adjacent cleanup into the same patch unless the issue explicitly requires them.

## Routine

1. Read the issue, dependencies, acceptance criteria, allowed files, non-goals, and evidence requirements.
2. Inspect two or three similar repository implementations and name them in the handoff.
3. State the exact slice and stop condition.
4. Create a short-lived branch using `issue/<number>-<slug>`.
5. Implement the smallest repository-native change.
6. Run the strongest feasible lint, test, build, and MakeCode simulator checks.
7. Self-review the diff for scope expansion, duplicate state, handler registration, cleanup, assets, and unsupported completion claims.
8. Open one PR linked with `Closes #<number>` when the issue is actually complete, or `Refs #<number>` when manual evidence remains outstanding.

## PR evidence

The PR description must distinguish:

- automated checks that ran,
- manual simulator paths that ran,
- checks that could not run,
- risks and deliberate non-goals.

Do not use source comments such as `// DECISION:` or `// MANUAL TEST PASSED` as a substitute for the PR report.

## Completion report

Use exactly:

- `DONE`
- `NOT DONE`
- `CHECKS`
- `READY FOR NEXT STEP`

Stop after the assigned issue. Propose separate follow-up issues for work outside scope.