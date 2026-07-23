# Copilot instructions for Neon-Kiez

Before changing code, read and follow `AGENTS.md`. It is the repository-wide source of truth for agent working method.

## Scope and precedence

1. The assigned GitHub issue defines the work package and stop condition.
2. `AGENTS.md` defines how the work is performed and proved.
3. `.github/instructions/*.instructions.md` adds path-specific technical rules.
4. `docs/PROJECT_GUIDE.md` provides product and architecture context; it is not permission to implement adjacent roadmap items.
5. Current code, tests, and local extension sources define repository-native APIs and syntax.

When instructions conflict, do not guess. Preserve the narrower issue scope and report the conflict.

## Required behavior

- Inspect two or three similar implementations before editing.
- Make the smallest repository-native patch.
- Reuse existing state, loaders, validators, cleanup paths, and test patterns.
- Do not create speculative abstractions, alternate sources of truth, generic frameworks, or new dependencies.
- Do not modify unrelated files merely because they look outdated.
- Treat runtime claims as unverified until supported by the required MakeCode simulator evidence.
- Put decisions, risks, checks, and unverified items in the PR report rather than explanatory source comments.
- Stop when the issue acceptance criteria are met.

## Reporting

Use these headings in the final handoff:

- `DONE`
- `NOT DONE`
- `CHECKS`
- `READY FOR NEXT STEP`

Name the repository precedents inspected and distinguish automated checks from manual simulator checks.