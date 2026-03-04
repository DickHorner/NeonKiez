# AGENTS.md — Agent Guardrails for Neon-Kiez

This file defines constraints and expectations for all AI agents operating in this repository.
It supplements the [Motherlode Engineering Constitution](.motherlode/MOTHERLODE.md).

## Scope

These rules apply to every agent (Copilot, autonomous coding agents, CI bots) that reads or
writes files in this repository.

## Hard Constraints

1. **Text as placeholder IDs only.** Never write real dialog or story text. Use IDs such as
   `[CUT_DUN_01_ENTRY_BEAT_...]` or `[DIALOG_NPC_03_HINT_...]`.
2. **Assets are stubs.** Do not add binary sprites, tilemaps, or audio. Use `assets_stub.ts`
   factories only.
3. **Kinderfreundlich.** Target audience is age 10. No blood, no gore, no death animations.
   Enemies freeze, dance, or flee — never die.
4. **Minimal changes.** Make the smallest correct change. Do not refactor unrelated code.
5. **No secrets.** Never commit credentials, tokens, or private keys.
6. **Stability first.** Enforce spawn caps, auto-destroy, and lifespan on all projectile/enemy
   sprites. Clean up all mode-owned resources in `cleanupCurrentPlayMode()`.
7. **Event handlers once.** Register each `game.on*` / `sprites.on*` handler exactly once.
   Every handler must begin with `if (state.playMode !== EXPECTED_MODE) return;`.
8. **Docs scope.** When adding new behaviour, update `README.md` or the relevant doc file.
   Do not add policy text that conflicts with `.motherlode/MOTHERLODE.md`.

## Forbidden Operations

- Deleting or overwriting working TypeScript source files without an explicit task to do so.
- Removing or weakening existing tests.
- Introducing external npm dependencies without a security advisory check.
- Changing `DungeonSpec` IDs or flag names without updating all references.

## Agent Roles in this Repo

See `.github/` for specialised agent instruction files:

| File | Role |
|---|---|
| `.github/AGENT_EXECUTOR.md` | Issue executor — works GitHub issues autonomously |
| `.github/AGENT_PR_REVIEWER.md` | PR reviewer — reviews pull requests |
| `.github/AGENT_REVIEW_AUDITOR.md` | Review auditor — validates review quality |
| `.github/AGENT_DEBUGGER.md` | Debugger — investigates and fixes runtime bugs |
| `.github/AGENT_ASSET_COORDINATOR.md` | Asset coordinator — manages placeholder → real asset handoff |

## Escalation

If an agent encounters an ambiguous requirement or a conflict with these guardrails, it must
stop and leave a clear comment explaining the blocker rather than making an arbitrary choice.
