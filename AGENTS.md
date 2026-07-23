# AGENTS.md — Machine-Respect Agent Guardrails for Neon-Kiez

This file is the repository-local source of truth for AI agents that inspect, edit, review, or test this repository.

## Operating standard

Act as a sober senior maintainer of the current repository.

- AI gives speed.
- The repository gives shape.
- The machine gives limits.
- Evidence gives release permission.

## Required workflow

1. **Context** — Read the issue, repository structure, and two or three similar implementations before editing.
2. **Idiom** — Follow the existing MakeCode Arcade and repository syntax, file placement, naming, validation, and test patterns.
3. **Slice** — State the exact goal, non-goals, and stop condition. Treat the assigned issue as the scope boundary.
4. **Shape** — Identify state ownership, invariants, failure paths, and relevant runtime or memory costs.
5. **Patch** — Make the smallest repository-native change that satisfies the issue.
6. **Delete the weird** — Remove unnecessary indirection, flags, duplicate decision paths, and speculative seams.
7. **Prove** — Run the strongest feasible lint, test, build, and simulator checks. Mark anything not verified.
8. **Report** — Use these headings: `DONE`, `NOT DONE`, `CHECKS`, `READY FOR NEXT STEP`.
9. **Stop** — Do not expand organically into adjacent issues.

## Hard constraints

- Use placeholder IDs for dialog and story text unless an issue explicitly supplies approved copy.
- Keep content appropriate for a target age of 10: no gore, execution imagery, or kill-focused language.
- Never commit credentials, tokens, private keys, or private user data.
- Register global `game.on*`, `controller.*.onEvent`, and `sprites.on*` handlers once; guard them by play mode and relevant state.
- Preserve `state.gameMode` and `state.playMode` as authoritative flow state.
- Route mode changes through `GameController.switchPlayMode()` and its cleanup/setup path.
- Enforce caps, lifespans, cleanup, and debouncing where the runtime behavior requires them.
- Do not introduce npm dependencies or MakeCode extensions without a concrete issue requirement and reviewable justification.
- Do not weaken or delete tests merely to make a change pass.
- Do not add architecture, plugin points, options, or abstractions for hypothetical future work.
- Do not perform formatting waves, drive-by refactors, or unrelated documentation rewrites inside a feature patch.
- Do not claim completion from source inspection alone when the acceptance criteria require MakeCode runtime evidence.

## Repository evidence

A change is complete only when a maintainer can quickly answer:

- What changed and why here?
- Which existing implementations were used as precedent?
- Which invariants and failure paths were checked?
- Which automated and manual checks ran?
- What was deliberately not changed?

Source comments such as `MANUAL TEST PASSED` are not evidence. Put reproducible evidence in the PR or issue report.

## Repository-specific references

- Product and architecture context: `docs/PROJECT_GUIDE.md`
- MakeCode and asset rules: `.github/instructions/makecode-arcade.instructions.md`
- Contribution and command conventions: `CONTRIBUTING.md`
- Architecture decisions: `ARCHITECTURE_DECISIONS.md`

If these documents conflict, this file controls agent working method; the assigned issue controls scope; current code and tests control repository shape.