# ASSET_PIPELINE.md

Workflow for selecting and integrating Kenney assets into NeonKiez.

## Principles
- Keep the original Kenney All-in-1 archive outside the repository.
- Copy only curated subsets into `assets/selected/kenney/`.
- Use 16x16 assets where possible for MakeCode Arcade.
- Test palette mapping before importing large subsets.
- Keep asset IDs stable; replace asset contents rather than changing code references.
- Use `docs/KENNEY_ASSET_MAP.md` as the source-of-truth for package-folder-to-repo-folder mapping.

## Directory map

- `assets/source/kenney/`: source note only, no full archive.
- `assets/selected/kenney/`: curated subsets used by the game.
- `assets/working/`: temporary resized, palette-test, or spritesheet files.
- `docs/ASSET_SOURCES.md`: source and license tracking.
- `docs/ASSET_MANIFEST.md`: selected asset inventory.
- `docs/KENNEY_ASSET_MAP.md`: exact Kenney package-folder mapping and first import batches.

## Batch workflow

1. Open `docs/KENNEY_ASSET_MAP.md` and choose the next batch.
2. Copy only the required files from the listed Kenney package folders into the listed `assets/selected/kenney/<area>/<Package Name>/` target.
3. Update `docs/ASSET_MANIFEST.md` with the selected files and expected MakeCode asset IDs.
4. Import/adapt the subset into MakeCode assets.
5. Update factories in `assets_stub.ts` or the relevant asset wrapper.
6. Run a manual smoke test.
7. Document test evidence in the PR.

## First recommended batch

Start with Batch 1 from `docs/KENNEY_ASSET_MAP.md`:

- `2D assets/RPG Urban Pack` -> `assets/selected/kenney/hub/RPG Urban Pack/`
- `2D assets/Roguelike City Pack` -> `assets/selected/kenney/hub/Roguelike City Pack/`
- `2D assets/Roguelike Characters Pack` -> `assets/selected/kenney/hub/Roguelike Characters Pack/`
- `Icons/Input Prompts Pixel 16×` -> `assets/selected/kenney/ui/Input Prompts Pixel 16x/`
- `UI assets/UI Pixel Pack` -> `assets/selected/kenney/ui/UI Pixel Pack/`

Goal: `SPR_PLAYER_TOPDOWN`, `SPR_DOOR_DUNGEON`, `SPR_NPC_SAVEHOUSE`, `TM_HUB_11`, and one visible A-button prompt.
