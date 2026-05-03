# ASSET_MANIFEST.md

Tracks curated assets that are selected from the Kenney bundle and imported or prepared for MakeCode Arcade.

Use `docs/KENNEY_ASSET_MAP.md` to choose source package folders and destination folders. This manifest is updated when concrete files are copied into `assets/selected/kenney/` and/or imported into MakeCode assets.

## Batch 1 target manifest (to be filled with concrete filenames after local copy)

| Asset ID | Type | Source Pack / Folder | Repo File | Used In | Imported Into MakeCode | Notes |
|---|---|---|---|---|---|---|
| SPR_PLAYER_TOPDOWN | sprite | `2D assets/Roguelike Characters Pack` or `2D assets/Character Pack` | `assets/selected/kenney/hub/<source-package>/<file>.png` | Hub player | no | Pick one small readable top-down character. |
| SPR_DOOR_DUNGEON | sprite/tile | `2D assets/RPG Urban Pack` or `2D assets/Roguelike City Pack` | `assets/selected/kenney/hub/<source-package>/<file>.png` | Hub dungeon doors | no | Needs to be clearly visible in hub. |
| SPR_NPC_SAVEHOUSE | sprite | `2D assets/Roguelike Characters Pack` or `2D assets/Character Pack` | `assets/selected/kenney/hub/<source-package>/<file>.png` | Savehouse NPC | no | Use friendly/non-threatening character. |
| SPR_INPUT_A | icon | `Icons/Input Prompts Pixel 16×` | `assets/selected/kenney/ui/Input Prompts Pixel 16x/<file>.png` | Interact prompt | no | Rename `×` to `x` in repo path. |
| TM_HUB_11 | tilemap | `2D assets/RPG Urban Pack` + `2D assets/Roguelike City Pack` | MakeCode Asset Editor / tilemap asset | Hub start room | no | Build from curated tiles after palette test. |

## Full manifest

| Asset ID | Type | Source Pack / Folder | Repo File | Used In | Imported Into MakeCode | Notes |
|---|---|---|---|---|---|---|
| TBD | TBD | Kenney All-in-1 | TBD | TBD | no | Fill this table per asset batch. |
