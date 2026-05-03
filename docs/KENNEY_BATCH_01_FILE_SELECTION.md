# KENNEY_BATCH_01_FILE_SELECTION.md

Exact file/folder mapping for **Batch 1: Hub visibility and start room**.

Source basis: uploaded `kenney_filelist.txt` generated from the local Kenney All-in-1 3.4.0 installation. The list contains 101,614 files. Many relevant Kenney packs use numbered files such as `tile_0000.png`; without visual image inspection those numbers cannot be honestly mapped to semantic labels like "road" or "door". Therefore this batch uses a two-step workflow:

1. Copy exact candidate pools from the Kenney bundle into `assets/working/palette-tests/kenney-batch1/`.
2. The asset agent visually inspects those candidate pools, chooses the final small subset, and copies only final selected files into `assets/selected/kenney/...`.

Do **not** import full candidate pools into MakeCode Arcade.

Canonical asset IDs come from `.github/ASSET_REQUIREMENTS.md`.

---

## Batch 1 goals

The goal is to make the game visibly playable at boot:

- `SPR_PLAYER_TOPDOWN`
- `SPR_DOOR_DUNGEON`
- `SPR_NPC_SAVEHOUSE`
- `SPR_INTERACT_PROMPT`
- `TM_HUB_11`
- first hub floor/wall/road/prop tiles

---

## Exact staging copy map

### 1) Hub city tiles: RPG Urban Pack

Copy these exact files/folders from local Kenney root:

```text
2D assets/RPG Urban Pack/License.txt
2D assets/RPG Urban Pack/Preview.png
2D assets/RPG Urban Pack/Sample.png
2D assets/RPG Urban Pack/Tilemap/tilemap.png
2D assets/RPG Urban Pack/Tilemap/tilemap_packed.png
2D assets/RPG Urban Pack/Tilemap/tilemap.txt
2D assets/RPG Urban Pack/Tiles/tile_0000.png .. tile_0485.png
2D assets/RPG Urban Pack/Bonus/Tilemap/tilemap.png
2D assets/RPG Urban Pack/Bonus/Tilemap/tilemap_packed.png
2D assets/RPG Urban Pack/Bonus/Tiles/tile_0000.png .. tile_0089.png
```

Stage to:

```text
assets/working/palette-tests/kenney-batch1/hub/RPG Urban Pack/
```

Final selected files should later be copied to:

```text
assets/selected/kenney/hub/RPG Urban Pack/
```

Use for final asset IDs:

```text
T_HUB_FLOOR_01..03
T_HUB_WALL_01..03
T_HUB_EDGE / T_HUB_BORDER
T_HUB_SIGN_01..06
T_HUB_PROP_01..10
T_HUB_DECAL_01..06
TM_HUB_11
```

---

### 2) Hub city fallback tiles: Roguelike City Pack

Copy these exact files/folders from local Kenney root:

```text
2D assets/Roguelike City Pack/License.txt
2D assets/Roguelike City Pack/Preview.png
2D assets/Roguelike City Pack/Sample.png
2D assets/Roguelike City Pack/Tilesheet.txt
2D assets/Roguelike City Pack/Tilemap/tilemap.png
2D assets/Roguelike City Pack/Tilemap/tilemap_packed.png
2D assets/Roguelike City Pack/Tiles/tile_0000.png .. tile_1035.png
```

Stage to:

```text
assets/working/palette-tests/kenney-batch1/hub/Roguelike City Pack/
```

Final selected files should later be copied to:

```text
assets/selected/kenney/hub/Roguelike City Pack/
```

Use for final asset IDs:

```text
T_HUB_FLOOR_01..03
T_HUB_WALL_01..03
T_HUB_EDGE / T_HUB_BORDER
T_HUB_SIGN_01..06
T_HUB_PROP_01..10
T_HUB_DECAL_01..06
SPR_DOOR_DUNGEON or T_MARK_DOOR_<DUN_ID> if visually suitable
```

---

### 3) Top-down character sheet: Roguelike Characters Pack

Copy these exact files from local Kenney root:

```text
2D assets/Roguelike Characters Pack/License.txt
2D assets/Roguelike Characters Pack/Preview.png
2D assets/Roguelike Characters Pack/Sample.png
2D assets/Roguelike Characters Pack/Spritesheet/roguelikeChar_transparent.png
2D assets/Roguelike Characters Pack/Spritesheet/roguelikeChar_magenta.png
2D assets/Roguelike Characters Pack/Spritesheet/spritesheetInfo.txt
```

Stage to:

```text
assets/working/palette-tests/kenney-batch1/hub/Roguelike Characters Pack/
```

Final selected/cropped sprites should later be copied to:

```text
assets/selected/kenney/hub/Roguelike Characters Pack/
```

Use for final asset IDs:

```text
SPR_PLAYER_TOPDOWN
SPR_NPC_SAVEHOUSE
SPR_NPC_GENERIC_01..03
```

Note: This pack is sheet-based, not pre-sliced into named character PNG files. The asset agent must crop final character sprites from the transparent spritesheet.

---

### 4) Input prompt: Input Prompts Pixel 16x

Copy these exact files/folders from local Kenney root:

```text
Icons/Input Prompts Pixel 16×/License.txt
Icons/Input Prompts Pixel 16×/Preview.png
Icons/Input Prompts Pixel 16×/Tilesheet.txt
Icons/Input Prompts Pixel 16×/Tilemap/tilemap.png
Icons/Input Prompts Pixel 16×/Tilemap/tilemap_packed.png
Icons/Input Prompts Pixel 16×/Tiles/tile_0000.png .. tile_0815.png
```

Stage to:

```text
assets/working/palette-tests/kenney-batch1/ui/Input Prompts Pixel 16x/
```

Final selected files should later be copied to:

```text
assets/selected/kenney/ui/Input Prompts Pixel 16x/
```

Use for final asset IDs:

```text
SPR_INTERACT_PROMPT
```

Note: Source folder uses the Unicode `×`; repo folder uses ASCII `x` for safer paths.

---

### 5) Pixel UI sheet: UI Pixel Pack

Copy these exact files from local Kenney root:

```text
UI assets/UI Pixel Pack/Instructions.txt
UI assets/UI Pixel Pack/License.txt
UI assets/UI Pixel Pack/Preview.png
UI assets/UI Pixel Pack/Spritesheet/UIpackSheet_transparent.png
UI assets/UI Pixel Pack/Spritesheet/UIpackSheet_magenta.png
```

Stage to:

```text
assets/working/palette-tests/kenney-batch1/ui/UI Pixel Pack/
```

Final selected/cropped sprites should later be copied to:

```text
assets/selected/kenney/ui/UI Pixel Pack/
```

Use for final asset IDs:

```text
SPR_UI_DIALOG_FRAME
SPR_UI_CURSOR / SPR_UI_SELECTOR
SPR_UI_HEART
```

---

## Final selection rules for the asset agent

After staging, the asset agent must inspect images and choose a **small MakeCode-safe subset**:

### Required final subset size target

| Area | Target count |
|---|---:|
| Hub ground/road/wall tiles | 12-24 tiles |
| Hub props/signs/door candidates | 6-12 sprites/tiles |
| Top-down player/NPC sprites | 3-6 cropped sprites |
| Input prompts | 1 icon |
| UI elements | 2-6 sprites |

### Hard rules

- Do not import all staged candidate files into MakeCode.
- Prefer 16x16 or small assets.
- Prefer transparent PNGs over magenta-background PNGs.
- Avoid perspective mismatch: no isometric/axonometric in Batch 1.
- Keep final files in `assets/selected/kenney/...` only after visual approval by the asset agent.
- Update `docs/ASSET_MANIFEST.md` with final exact filenames and canonical asset IDs from `.github/ASSET_REQUIREMENTS.md`.

---

## Automation

Use `tools/select_kenney_batch1.ps1` to stage the exact candidate pools listed above.

Example:

```powershell
.\tools\select_kenney_batch1.ps1 -KenneyRoot "C:\Path\To\Kenney" -RepoRoot "C:\Path\To\NeonKiez"
```

`-KenneyRoot` must point to the folder containing `2D assets`, `Icons`, `UI assets`, and `Audio`.
