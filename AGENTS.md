# AGENTS.md - Agent Guardrails for Neon-Kiez

This file defines constraints and expectations for AI agents operating in this repository.
It supplements the [Motherlode Engineering Constitution](.motherlode/MOTHERLODE.md).

## Scope

These rules apply to every agent (Copilot, autonomous coding agents, CI bots) that reads or writes files in this repository.

## Hard Constraints

1. Text as placeholder IDs only. Never write real dialog or story text.
2. Assets are stubs. Do not add binary sprites, tilemaps, or audio.
3. Kinderfreundlich. Target audience is age 10.
4. Minimal changes. Make the smallest correct change.
5. No secrets. Never commit credentials, tokens, or private keys.
6. Stability first. Enforce spawn caps, auto-destroy, and cleanup of mode-owned resources.
7. Event handlers once. Register each `game.on*` or `sprites.on*` handler exactly once.
8. Docs scope. When adding new behavior, update `README.md` or the relevant doc file.

## Forbidden Operations

- Deleting or overwriting working TypeScript source files without an explicit task.
- Removing or weakening existing tests.
- Introducing external npm dependencies without review.
- Changing `DungeonSpec` IDs or flag names without updating references.

## Escalation

If an agent encounters an ambiguous requirement or a conflict with these guardrails, it must stop and leave a clear explanation instead of making an arbitrary choice.
