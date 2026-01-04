# Neon-Kiez

Repository for the neon open-world dungeon‑crawler game Neon‑Kiez — built in TypeScript.

> NOTE: This README is a concrete, opinionated draft to make the repo immediately usable. It assumes a web build using Vite + TypeScript and Phaser 3 as the game engine. If you use a different engine or build tool, just do it.

---

Table of contents
- [About](#about)
- [Quick links](#quick-links)
- [Prerequisites](#prerequisites)
- [Local development (quickstart)](#local-development-quickstart)
- [Project scripts (package.json)](#project-scripts-packagejson)
- [Controls](#controls)
- [Architecture & project structure](#architecture--project-structure)
- [Gameplay overview & design notes](#gameplay-overview--design-notes)
- [Assets & pipelines](#assets--pipelines)
- [Testing, linting & type-checking](#testing-linting--type-checking)
- [CI / Deployment suggestions](#ci--deployment-suggestions)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License & credits](#license--credits)
- [Contact](#contact)

---

## About
Neon‑Kiez is an open‑world, neon‑themed dungeon crawler built with TypeScript. Players explore procedurally generated sectors of a cyber‑punk city, fight enemies, gather loot and upgrade their character. The project focuses on performance, modular systems, and easy extension.

This README contains concrete commands, folder layout and conventions so contributors can get started quickly.

## Quick links
- Repository: https://github.com/DickHorner/Neon-Kiez
- Issues: https://github.com/DickHorner/Neon-Kiez/issues
- Pull requests: https://github.com/DickHorner/Neon-Kiez/pulls

## Prerequisites
- Node.js 18.x or newer
- npm >= 8 (or yarn / pnpm)
- Git
- Recommended: Chrome/Edge for debugging; VS Code for TypeScript development

## Local development (quickstart)
1. Clone
   git clone https://github.com/DickHorner/Neon-Kiez.git
2. Enter folder
   cd Neon-Kiez
3. Install deps
   npm install
4. Start dev server (Vite)
   npm run dev
5. Open http://localhost:5173

If you prefer yarn or pnpm:
- yarn install && yarn dev
- pnpm install && pnpm dev

## Project scripts (package.json)
Suggested scripts (this README assumes these exist — I can create them if you want):
- dev: start dev server with HMR (vite)
- build: production build (vite build)
- preview: preview production build (vite preview)
- lint: eslint --ext .ts,.tsx src
- format: prettier --write .
- test: vitest run
- typecheck: tsc --noEmit

Example snippet for package.json scripts:
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5174",
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "format": "prettier --write .",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}

If you'd like I can add a ready-to-commit package.json with these scripts and recommended devDependencies.

## Controls
Default control mapping (editable in options):
- Movement: WASD or Arrow keys
- Interact / Action: E or Space
- Attack: Left mouse button / Ctrl
- Aim / Secondary: Right mouse button / Shift
- Toggle inventory / menu: I / Esc
- Gamepad: standard mappings supported (left stick move, A to interact)

Explain control tuning in code: /src/input or /src/systems/input.ts

## Architecture & project structure
Opinionated structure to keep code modular and testable:

- src/
  - main.ts                 # entry, bootstraps engine & scenes
  - boot/                   # preloader / bootstrapping scene
  - scenes/
    - GameScene.ts
    - WorldScene.ts
    - UIScene.ts
  - systems/
    - AssetLoader.ts
    - RenderingSystem.ts
    - PhysicsSystem.ts
    - AISystem.ts
    - SpawnSystem.ts
  - entities/
    - Player.ts
    - Enemy.ts
    - NPC.ts
    - Items/
  - ui/
    - HUD.ts
    - Inventory.ts
    - Dialog.ts
  - utils/
  - types/
  - assets/                 # small placeholders — real assets in /public or /assets
- public/                   # static files served by Vite (images, audio, favicons)
- dist/                     # production output
- package.json
- tsconfig.json
- vite.config.ts
- .eslintrc.cjs
- .prettierrc

Key ideas:
- Keep game logic engine-agnostic where possible (systems operate on data, scenes glue them).
- Entities are lightweight data + small behavior wrappers.
- All resource paths resolved through AssetLoader for centralized caching.

## Gameplay overview & design notes
High-level mechanics (tailor these to your vision):
- Exploration: Open sectors (rooms + streets) connected by portals.
- Combat: Rhythm-based combos + dodge / parry system.
- Loot & progression: Procedural gear with modifiers; currency to purchase permanent upgrades.
- Missions: Dynamic objectives that encourage exploration (escort, survive, retrieve).
- Save system: Local storage + optional cloud sync (future).

Design decisions to document in the repo:
- Entity health / damage model
- Difficulty scaling
- Procedural generation seed & parameters

## Assets & pipelines
Recommendations:
- Sprites: pack into texture atlases (TexturePacker) for cheaper draw calls.
- Audio: OGG for web; separate music and SFX channels; use audio sprites for short SFX.
- Size budget: aim for a compressed total playable-level size < 50 MB for web builds.
- Put raw working files in assets/source and exported optimized files in public/assets.

Naming conventions:
- assets/sprites/<category>/<name>.png
- assets/sfx/<name>.ogg
- assets/music/<track>.ogg

## Testing, linting & type-checking
- Unit tests: Vitest for systems and utility functions
- Integration / E2E: Playwright for smoke tests (optional)
- Linting: ESLint with TypeScript parser and recommended rules
- Formatting: Prettier
- Type-check: tsc --noEmit in CI

Suggested test targets:
- AssetLoader loads expected manifests
- SpawnSystem spawns entities within valid bounds
- AISystem responds to stimuli (unit tests on logic)

## CI / Deployment suggestions
GitHub Actions (recommended checks for PRs):
- Install & cache node modules
- Run lint
- Run typecheck
- Run tests
- Optionally build and upload artifact

Deployment:
- Static host (Vercel / Netlify / GitHub Pages) serving the `dist` directory
- Desktop: Electron packaging
- Web release: host demo + compressed build with a CDN for assets

If you want, I can add a starter GitHub Actions workflow that runs the checks above.

## Contributing
Guidelines:
1. Create an issue for non-trivial changes before coding (helps design discussion).
2. Fork -> branch name `feature/<short>` or `fix/<short>`.
3. Keep PRs focused and include:
   - Short description
   - Motivation & screenshots/video if UI
   - How to test / acceptance criteria
4. Follow linting and run type-check and tests locally before opening PR.

Suggested PR template (put in .github/PULL_REQUEST_TEMPLATE.md):
- What changed?
- Why?
- How to test:
- Do all tests pass locally? (yes/no)
- Screenshots / GIF

Add a CODE_OF_CONDUCT.md (recommended: Contributor Covenant) and CONTRIBUTING.md to the repo.

## Roadmap
Short term (next 2–6 weeks)
- Player movement and core combat
- Level generator + sample sector
- Basic HUD and inventory

Medium term (1–3 months)
- Enemy variety & AI polish
- Save system & progression
- Soundtrack + SFX set

Long term
- City/world expansion and meta-progression
- Multiplayer proof-of-concept
- Releases on itch.io / Steam

## Known issues
- Placeholder: asset streaming is not implemented yet (TODO)
- Placeholder: mobile input not fully tested (TODO)

Please add issues for anything you find; mark them with labels bug / enhancement / help wanted.

## License & credits
Suggested: MIT License. Add a LICENSE file at repo root.

Credits:
- List third-party assets, libraries and attributions in a CREDITS.md file.

## Contact
Maintainer: DickHorner  
Repo: https://github.com/DickHorner/Neon-Kiez

---

Next steps — pick one:
- I can commit this README.md to a new branch and open a PR for you.
- I can regenerate the README to match the exact engine/build tool you use (Phaser? Pixi? Three.js? pure Canvas? Unity/WebGL export?).
- I can also add:
  - package.json scripts and devDependencies scaffold
  - a starter Vite + Phaser template (basic scene + player)
  - GitHub Actions workflow
Tell me which of the three above you want me to do and provide any engine/build-tool choices if different from the assumptions above.
