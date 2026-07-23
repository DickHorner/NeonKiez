# Contributing to Neon-Kiez

Follow `AGENTS.md` for repository-wide working standards and `.github/instructions/makecode-arcade.instructions.md` for MakeCode-specific rules.

## Branches

- Branch from `master`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, or `issue/<number>-<slug>`.
- Keep branches short-lived.
- Keep one logical issue-sized change per PR.

## Pull requests

- Explain what changed, why it belongs in the touched files, and which repository precedents were followed.
- Link the related issue. Use `Closes #<n>` only when its acceptance criteria and required evidence are complete.
- Record deliberate non-goals and unverified checks.
- Avoid drive-by refactors and formatting-only changes in feature patches.

## Checks

Run the applicable commands before requesting review:

```bash
npm run lint
npm run test
npm run build
```

New behavior should have focused coverage under `tests/` using the existing `*.test.js` patterns. Rendering, input, collision, camera, transition, timing, audio, and gameplay work also requires the MakeCode simulator path named by the issue.

## Repository conventions

- Use repository-local MakeCode Arcade TypeScript idioms.
- Use placeholder IDs for unapproved dialog and story copy.
- Keep language and feedback appropriate for a target age of 10.
- Preserve existing imported JRES assets and their validation pipeline.
- Add or replace assets only through a dedicated, reviewable asset task.
- Follow established identifiers such as `TM_*`, `SFX_*`, `BGM_*`, `DIALOG_*`, `CUT_*`, and `QUEST_*`.
- Register global event handlers once and guard them by the relevant play mode and state.
- Route mode changes through `GameController.switchPlayMode()`.
- Do not add dependencies or extensions without a concrete issue requirement.

## Evidence

Source comments are not test evidence. Put command results, simulator steps, screenshots, clips, risks, and remaining uncertainty in the PR description or review thread.