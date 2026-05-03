# ASSET_PIPELINE.md

Workflow for selecting and integrating Kenney assets into NeonKiez.

## Principles
- Keep the original Kenney All-in-1 archive outside the repository.
- Copy only curated subsets into `assets/selected/kenney/`.
- Use 16x16 assets where possible for MakeCode Arcade.
- Test palette mapping before importing large subsets.
- Keep asset IDs stable; replace asset contents rather than changing code references.

## Directory map

- `assets/source/kenney/`: source note only, no full archive.
- `assets/selected/kenney/`: curated subsets used by the game.
- `assets/working/`: temporary resized, palette-test, or spritesheet files.
- `docs/ASSET_SOURCES.md`: source and license tracking.
- `docs/ASSET_MANIFEST.md`: selected asset inventory.

## Batch workflow

1. Pick one small batch, e.g. Hub base tiles, Platform sprites, or Asteroids sprites.
2. Copy only the required files into `assets/selected/kenney/<area>/`.
3. Update `docs/ASSET_MANIFEST.md`.
4. Import/adapt the subset into MakeCode assets.
5. Update factories in `assets_stub.ts` or the relevant asset wrapper.
6. Run a manual smoke test.
7. Document test evidence in the PR.
