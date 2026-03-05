# Contributing to Neon-Kiez

Thank you for contributing! Follow these guidelines to keep changes consistent and reviewable.

## Branches

- Branch from `main`: `feat/<topic>`, `fix/<topic>`, or `docs/<topic>`.
- Keep branches short-lived; open a PR as soon as work is ready for review.

## Pull Requests

- One logical change per PR.
- PR title: `[TYPE] Short description` — types: `feat`, `fix`, `docs`, `refactor`, `chore`.
- Fill in the PR description explaining what changed and why.
- Link any related issue (`Closes #<n>`).
- All CI checks must pass before requesting review.

## Testing

Run the test suite before pushing:

```bash
npm test
```

Run linting/type-checking:

```bash
npm run lint
```

Build the project:

```bash
npm run build
```

New behavior must have corresponding test coverage. Tests live in `tests/` and follow the `*.test.js` pattern.

## Code Style

- TypeScript only; no `any` unless unavoidable and documented.
- No real dialog text — use placeholder IDs (`[CUT_DUN_01_ENTRY_BEAT_...]`).
- Assets are stubs in `assets_stub.ts`; do not add binary assets to the repo.
- Sprite/tilemap/sound naming convention: `SPR_*`, `TM_*`, `SFX_*`, `BGM_*`.

## Guardrails

- Kinderfreundlich (target age 10): no blood, no gore, enemies freeze/dance/flee only.
- Caps on all spawns; auto-destroy + lifespan enforced.
- Event handlers registered once; each begins with `if (state.playMode !== EXPECTED) return;`.
- Align with the [Motherlode Engineering Constitution](.motherlode/MOTHERLODE.md).
