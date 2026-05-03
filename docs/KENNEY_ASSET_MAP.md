# KENNEY_ASSET_MAP.md

Mapping from the purchased Kenney All-in-1 package overview to NeonKiez repo folders.

Canonical asset IDs come from `.github/ASSET_REQUIREMENTS.md`. This document must not introduce parallel asset naming schemes.

## Important rules

- Use only Kenney All-in-1 assets unless the project owner explicitly approves another source.
- Do not commit the full purchased archive.
- Copy only curated subsets into `assets/selected/kenney/`.
- Prefer 2D, pixel, UI, icon, and audio packs. Avoid 3D packs for v1.0.
- MakeCode Arcade target: 16x16 tiles where possible, small sprite sets, limited palette, no giant sheets.

## Package name normalization

The `Source package path in Kenney bundle` column always uses the original Kenney folder name. The `Copy to repo folder` column is the exact repo target and may use a filesystem-safe normalized folder name.

Normalization is allowed only when explicitly shown in this table:

- Replace the Unicode multiplication sign `×` with ASCII `x`.
- Remove parentheses only when the target path explicitly shows the normalized variant.
- Replace `&` with `and` only when the target path explicitly shows the normalized variant.
- Never infer a normalized path. Use the exact `Copy to repo folder` value.

Recommended pattern:

```text
assets/selected/kenney/<area>/<Package Name or normalized package name>/...
```

## Priority legend

- P0: needed first for visibility / MVP functionality.
- P1: needed for playable v1.0 content.
- P2: polish / optional for v1.0.
- Avoid: do not use for v1.0 unless explicitly approved.

---

## Hub / Neon City

Target folder: `assets/selected/kenney/hub/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `2D assets/RPG Urban Pack` | `assets/selected/kenney/hub/RPG Urban Pack/` | Hub streets, sidewalks, buildings, doors, city props | Primary hub pack. Use as first source for `TM_HUB_00..22`. |
| P0 | `2D assets/Roguelike City Pack` | `assets/selected/kenney/hub/Roguelike City Pack/` | Compact city tiles, urban props | Good fallback for MakeCode-friendly small tiles. |
| P1 | `2D assets/Character Pack` | `assets/selected/kenney/hub/Character Pack/` | Hub NPCs / civilian silhouettes | Select only small readable characters. |
| P1 | `2D assets/Character Pack Redux` | `assets/selected/kenney/hub/Character Pack Redux/` | Hub NPC variants | Alternative to Character Pack. |
| P1 | `2D assets/Roguelike Characters Pack` | `assets/selected/kenney/hub/Roguelike Characters Pack/` | Top-down NPCs / player placeholder | Prefer if sprites are small and readable. |
| P1 | `2D assets/Robot Pack` | `assets/selected/kenney/hub/Robot Pack/` | Friendly bots, comic blockers, dungeon bots | Good for child-friendly non-human enemies. |
| P1 | `2D assets/Generic Items` | `assets/selected/kenney/hub/Generic Items/` | Collectibles, savehouse props, inventory objects | Use for small props/items. |
| P2 | `2D assets/Emote Pack` | `assets/selected/kenney/hub/Emote Pack/` | NPC feedback bubbles | Optional UX polish. |

Canonical asset IDs from `.github/ASSET_REQUIREMENTS.md`:

- `SPR_PLAYER_TOPDOWN`
- `ANIM_PLAYER_TOPDOWN_WALK`
- `SPR_NPC_GENERIC_01..03`
- `SPR_NPC_SAVEHOUSE`
- `ANIM_NPC_IDLE`
- `SPR_DOOR_DUNGEON`
- `SPR_DOOR_FINAL`
- `SPR_INTERACT_PROMPT`
- `T_HUB_FLOOR_01..03`
- `T_HUB_WALL_01..03`
- `T_HUB_EDGE` / `T_HUB_BORDER`
- `T_HUB_SIGN_01..06`
- `T_HUB_PROP_01..10`
- `T_HUB_DECAL_01..06`
- `T_MARK_SPAWN_<TAG>`
- `T_MARK_DOOR_<DUN_ID>`
- `T_MARK_EXIT`
- `T_MARK_NPC_<ID>`
- `TM_HUB_00..22`

---

## Overworld / Outskirts

Target folder: `assets/selected/kenney/overworld/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P1 | `2D assets/Tiny Town` | `assets/selected/kenney/overworld/Tiny Town/` | Simple overworld/outskirts tiles | Use if hub needs edge/outskirts rooms. |
| P1 | `2D assets/Foliage Pack` | `assets/selected/kenney/overworld/Foliage Pack/` | Trees, bushes, outdoor props | Select small readable objects only. |
| P1 | `2D assets/Foliage Sprites` | `assets/selected/kenney/overworld/Foliage Sprites/` | Outdoor sprite props | Alternative/extension to Foliage Pack. |
| P1 | `2D assets/Road Textures` | `assets/selected/kenney/overworld/Road Textures/` | Roads / asphalt / pavement | Check tile size and palette first. |
| P1 | `2D assets/Road Textures (Classic)` | `assets/selected/kenney/overworld/Road Textures Classic/` | Classic road texture fallback | Normalized repo folder removes parentheses. |
| P2 | `2D assets/Cartography Pack` | `assets/selected/kenney/overworld/Cartography Pack/` | Map/minimap style graphics | Optional; not core gameplay. |

Canonical asset IDs:

- `TM_OVERWORLD_01..02` if used.

---

## UI / HUD / Input prompts

Target folder: `assets/selected/kenney/ui/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `Icons/Input Prompts Pixel 16×` | `assets/selected/kenney/ui/Input Prompts Pixel 16x/` | Interact prompt, tutorial hints | Normalized repo folder replaces `×` with `x`. |
| P0 | `UI assets/UI Pixel Pack` | `assets/selected/kenney/ui/UI Pixel Pack/` | HUD frames, small UI panels, buttons | Primary pixel UI pack. |
| P0 | `Icons/Game Icons` | `assets/selected/kenney/ui/Game Icons/` | Tool icons, inventory icons, reward icons | Primary icon source. |
| P1 | `Icons/Game Icons Expansion` | `assets/selected/kenney/ui/Game Icons Expansion/` | Additional icons | Use only if base Game Icons is insufficient. |
| P1 | `UI assets/Cursor Pixel Pack` | `assets/selected/kenney/ui/Cursor Pixel Pack/` | Menu cursor / selector | Pixel-friendly. |
| P1 | `2D assets/Development Essentials` | `assets/selected/kenney/ui/Development Essentials/` | Debug markers, simple placeholders | Good for development-only visuals. |
| P1 | `Icons/1-Bit Input Prompts Pixel 16×` | `assets/selected/kenney/ui/1-Bit Input Prompts Pixel 16x/` | Minimal input prompt fallback | Normalized repo folder replaces `×` with `x`. |
| P2 | `UI assets/UI Pack - Sci-fi` | `assets/selected/kenney/ui/UI Pack - Sci-fi/` | Neon/glitch menu accents | Optional polish; verify style/palette. |
| P2 | `UI assets/UI Pack` | `assets/selected/kenney/ui/UI Pack/` | Generic UI fallback | Use sparingly. |
| P2 | `UI assets/UI Pack - Pixel Adventure` | `assets/selected/kenney/ui/UI Pack - Pixel Adventure/` | Pixel menu fallback | Optional. |

Canonical asset IDs:

- `SPR_UI_HEART`
- `SPR_UI_TOOL_ICON_<TOOL_ID>`
- `SPR_UI_CURSOR` / `SPR_UI_SELECTOR`
- `SPR_UI_DIALOG_FRAME`
- `SPR_UI_POPUP_ICON_INFO` / `WARN` / `OK`
- `SPR_INTERACT_PROMPT`
- `SPR_RHYTHM_BEAT_INDICATOR`
- `SPR_RHYTHM_WINDOW_GOOD` / `OK` / `MISS`
- `SPR_RHYTHM_TRACK_MARKERS`

---

## Platform modes: D07 Video Store Platform Trial, D08 Construction Donkey Tower

Target folder: `assets/selected/kenney/modes/platform/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `2D assets/Pixel Platformer` | `assets/selected/kenney/modes/platform/Pixel Platformer/` | Platform player, ground, hazards, collectibles | Primary platform source. |
| P0 | `2D assets/Platformer Characters 1` | `assets/selected/kenney/modes/platform/Platformer Characters 1/` | Platform characters / enemies | Use for D07/D08 characters if style fits. |
| P0 | `2D assets/Pixel Platformer Industrial Expansion` | `assets/selected/kenney/modes/platform/Pixel Platformer Industrial Expansion/` | Construction / warehouse / industrial tiles | Primary D08 construction source. |
| P1 | `2D assets/Platformer Pack Industrial` | `assets/selected/kenney/modes/platform/Platformer Pack Industrial/` | Girders, ladders, industrial props | D08 Donkey Tower candidate. |
| P1 | `2D assets/Platformer Assets Pixel` | `assets/selected/kenney/modes/platform/Platformer Assets Pixel/` | Pixel platform tiles | Alternative to Pixel Platformer. |
| P1 | `2D assets/Platformer Assets Extra Animations & Enemies` | `assets/selected/kenney/modes/platform/Platformer Assets Extra Animations and Enemies/` | Extra enemy animations | Normalized repo folder replaces `&` with `and`; use sparingly. |
| P1 | `2D assets/Pixel Platformer Blocks` | `assets/selected/kenney/modes/platform/Pixel Platformer Blocks/` | Platforms / blocks / stage geometry | Good for simple geometry. |
| P2 | `2D assets/1-Bit Platformer Pack` | `assets/selected/kenney/modes/platform/1-Bit Platformer Pack/` | Low-color fallback | Only if style direction changes. |
| P2 | `2D assets/Pico-8 Platformer` | `assets/selected/kenney/modes/platform/Pico-8 Platformer/` | Palette-friendly fallback | Optional. |

Canonical asset IDs:

- `SPR_PLAT_PLAYER`
- `ANIM_PLAT_WALK`
- `SPR_PLAT_ENEMY_01..02`
- `SPR_PLAT_COLLECTIBLE`
- `T_PLAT_GROUND_01..02`
- `T_PLAT_PLATFORM_01..02`
- `T_PLAT_LADDER`
- `T_PLAT_HAZARD_01`
- `T_PLAT_GOAL`
- `SPR_DONKEY_PLAYER`
- `SPR_DONKEY_BARREL`
- `SPR_DONKEY_BOSS`
- `T_DONKEY_GIRDER_01..02`
- `T_DONKEY_LADDER`
- `T_DONKEY_HAZARD`
- `TM_D07_STAGE_00..03`
- `TM_D08_STAGE_00..03`

---

## Shooter mode: D02 Rooftop Invaders

Target folder: `assets/selected/kenney/modes/shooter/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `2D assets/Topdown Shooter (Pixel)` | `assets/selected/kenney/modes/shooter/Topdown Shooter Pixel/` | Player ship, enemies, bullets | Normalized repo folder removes parentheses. |
| P1 | `2D assets/Topdown Shooter` | `assets/selected/kenney/modes/shooter/Topdown Shooter/` | Higher-res source/fallback | Use only selected small sprites if palette/size works. |
| P1 | `2D assets/Pixel Shmup` | `assets/selected/kenney/modes/shooter/Pixel Shmup/` | Invader-like enemies, bullets, powerups | Good for classic arcade feel. |
| P1 | `2D assets/Space Shooter Redux` | `assets/selected/kenney/modes/shooter/Space Shooter Redux/` | Enemy formations / projectiles / core | Can be shared with asteroids. |
| P2 | `2D assets/Shooting Gallery` | `assets/selected/kenney/modes/shooter/Shooting Gallery/` | Targets / harmless target icons | Optional if needing non-violent target visuals. |

Canonical asset IDs:

- `SPR_SHOOTER_PLAYER_SHIP`
- `SPR_SHOOTER_BULLET`
- `SPR_SHOOTER_ENEMY_01..03`
- `SPR_SHOOTER_CORE`
- `SPR_FX_HIT_SPARK`
- `T_SHOOTER_ARENA_FLOOR` / `BORDER`
- `TM_D02_STAGE_00..03`

---

## Asteroids mode: D06 Arcade Museum Asteroids

Target folder: `assets/selected/kenney/modes/asteroids/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `2D assets/Space Shooter Redux` | `assets/selected/kenney/modes/asteroids/Space Shooter Redux/` | Ship, asteroids/rocks, bullets | Primary asteroids source. |
| P1 | `2D assets/Space Shooter Extension` | `assets/selected/kenney/modes/asteroids/Space Shooter Extension/` | Extra ship/rock/projectile variants | Use only if Redux lacks needed shapes. |
| P1 | `2D assets/Simple Space` | `assets/selected/kenney/modes/asteroids/Simple Space/` | Simple ships/rocks/background objects | Good MakeCode-friendly fallback. |
| P1 | `2D assets/Pixel Shmup` | `assets/selected/kenney/modes/asteroids/Pixel Shmup/` | Pixel bullets/FX | Optional shared shooter source. |
| P2 | `2D assets/Planets` | `assets/selected/kenney/modes/asteroids/Planets/` | Background-only planets | Optional; do not overfill memory. |

Canonical asset IDs:

- `SPR_AST_PLAYER_SHIP`
- `ANIM_AST_THRUST`
- `SPR_AST_BULLET`
- `SPR_AST_ROCK_L`
- `SPR_AST_ROCK_M`
- `SPR_AST_ROCK_S`
- `SPR_FX_POOF`
- `SPR_BG_STARFIELD_TILE`

---

## Puzzle modes: D01 Laundromat Labyrinth, D03 Warehouse Blockworks, D05 School Pong Court

Target folder: `assets/selected/kenney/modes/puzzle/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `2D assets/Puzzle Assets` | `assets/selected/kenney/modes/puzzle/Puzzle Assets/` | Switches, blocks, targets, puzzle icons | Primary puzzle source. |
| P1 | `2D assets/Puzzle Assets 2` | `assets/selected/kenney/modes/puzzle/Puzzle Assets 2/` | Extra puzzle pieces / targets | Use if needed. |
| P0 | `2D assets/Sokoban Pack` | `assets/selected/kenney/modes/puzzle/Sokoban Pack/` | Crates, target pads, push-block logic | Primary D03 source. |
| P1 | `2D assets/Block Pack (Pixel)` | `assets/selected/kenney/modes/puzzle/Block Pack Pixel/` | Grid blocks / simple obstacles | Normalized repo folder removes parentheses. |
| P1 | `2D assets/Boardgame Pack` | `assets/selected/kenney/modes/puzzle/Boardgame Pack/` | Tokens, markers, simple symbols | Useful for D01 tokens and D05 targets. |
| P1 | `2D assets/Physics Assets` | `assets/selected/kenney/modes/puzzle/Physics Assets/` | Balls, paddles, simple physics props | D05 Pong Court candidate. |
| P1 | `2D assets/Rolling Ball Assets` | `assets/selected/kenney/modes/puzzle/Rolling Ball Assets/` | Ball variants / rolling objects | D05 or marble-like mini-mechanics. |
| P1 | `2D assets/Generic Items` | `assets/selected/kenney/modes/puzzle/Generic Items/` | Collectibles / keys / tokens | Shared with hub if needed. |

Canonical asset IDs:

- `SPR_PLAYER_PUZZLE`
- `SPR_TOKEN_LAUNDRY`
- `SPR_SWITCH_01`
- `SPR_GATE_01`
- `SPR_PROP_WASHER` / `DRYER`
- `SPR_PLAYER_BLOCK`
- `SPR_BLOCK_CRATE`
- `SPR_TARGET_PAD`
- `SPR_SWITCH_02`
- `SPR_PONG_PADDLE_PLAYER`
- `SPR_PONG_PADDLE_AI`
- `SPR_PONG_BALL`
- `SPR_PONG_TARGETS_01..03`
- `T_PUZ_FLOOR_01..02`
- `T_PUZ_WALL_01..02`
- `T_PUZ_SWITCH_TILE`
- `T_PUZ_GATE_TILE`
- `T_WAREHOUSE_FLOOR_01..02`
- `T_WAREHOUSE_WALL_01..02`
- `T_WAREHOUSE_CONVEYOR`
- `T_COURT_FLOOR` / `LINES`
- `TM_D01_STAGE_00..03`
- `TM_D03_STAGE_00..03`
- `TM_D05_STAGE_00..03`

---

## Rhythm mode: D04 Subway Timing

Target folder: `assets/selected/kenney/modes/rhythm/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `Icons/Input Prompts Pixel 16×` | `assets/selected/kenney/modes/rhythm/Input Prompts Pixel 16x/` | Tap prompts / timing input hints | Normalized repo folder replaces `×` with `x`. |
| P0 | `UI assets/UI Pixel Pack` | `assets/selected/kenney/modes/rhythm/UI Pixel Pack/` | Timing window, beat ring UI | Primary rhythm UI source. |
| P1 | `Icons/Game Icons` | `assets/selected/kenney/modes/rhythm/Game Icons/` | Good/Miss icons, door indicators | Shared with global UI. |
| P1 | `2D assets/RPG Urban Pack` | `assets/selected/kenney/modes/rhythm/RPG Urban Pack/` | Subway-ish walls/floors if suitable | Use only selected urban/interior pieces. |
| P1 | `2D assets/Roguelike Interior Pack` | `assets/selected/kenney/modes/rhythm/Roguelike Interior Pack/` | Interior corridors / doors | Candidate for D04 staging. |

Canonical asset IDs:

- `SPR_RHYTHM_BEAT_INDICATOR`
- `SPR_RHYTHM_WINDOW_GOOD` / `OK` / `MISS`
- `SPR_RHYTHM_TRACK_MARKERS`
- `SPR_RHYTHM_TRAIN_DOOR`
- `TM_D04_STAGE_00..03`

---

## Shared FX / particles

Target folder: `assets/selected/kenney/ui/`

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P1 | `2D assets/Explosion Pack` | `assets/selected/kenney/ui/Explosion Pack/` | Comic hit/spark frames | Use non-violent sparks/poofs only; no destruction language. |
| P1 | `2D assets/Particle Pack` | `assets/selected/kenney/ui/Particle Pack/` | Collect/win FX | Small subset only. |
| P1 | `2D assets/Smoke Particles` | `assets/selected/kenney/ui/Smoke Particles/` | Respawn/poof FX | Keep frame count low. |
| P2 | `2D assets/Splat Pack` | `assets/selected/kenney/ui/Splat Pack/` | Avoid unless non-gory and clearly comic | Do not use blood-like splats. |

Canonical asset IDs:

- `SPR_FX_SPARK_01..02`
- `SPR_FX_POOF_01..02`
- `SPR_FX_CONFETTI_01..02`
- `SPR_FX_GLOW_01..02`
- `SPR_FX_HIT_SPARK`

---

## Audio

Target folder: `assets/selected/kenney/audio/`

Audio files from Kenney can be used as references or, where technically supported, converted/rebuilt into MakeCode-compatible sound/music expressions. Avoid large audio imports in v1.0.

| Priority | Source package path in Kenney bundle | Copy to repo folder | Use for | Notes |
|---|---|---|---|---|
| P0 | `Audio/Interface Sounds` | `assets/selected/kenney/audio/Interface Sounds/` | Menu navigation, confirm/back | First audio batch. |
| P0 | `Audio/UI Audio` | `assets/selected/kenney/audio/UI Audio/` | UI feedback, prompts | Use with Interface Sounds. |
| P1 | `Audio/Digital Audio` | `assets/selected/kenney/audio/Digital Audio/` | Save, collect, mode transition | Good retro digital cues. |
| P1 | `Audio/Retro Sounds 1` | `assets/selected/kenney/audio/Retro Sounds 1/` | Arcade SFX | Use small subset. |
| P1 | `Audio/Retro Sounds 2` | `assets/selected/kenney/audio/Retro Sounds 2/` | Arcade SFX variants | Use only if needed. |
| P1 | `Audio/Sci-Fi Sounds` | `assets/selected/kenney/audio/Sci-Fi Sounds/` | Shooter/Asteroids SFX | D02/D06. |
| P1 | `Audio/RPG Audio` | `assets/selected/kenney/audio/RPG Audio/` | Collect/save/interact alternatives | Hub/Dungeons. |
| P1 | `Audio/Impact Sounds` | `assets/selected/kenney/audio/Impact Sounds/` | Soft hit/impact feedback | Use non-violent, gentle impacts. |
| P2 | `Audio/Music Jingles` | `assets/selected/kenney/audio/Music Jingles/` | Stage clear / dungeon clear | Optional. |
| P2 | `Audio/Music Loops` | `assets/selected/kenney/audio/Music Loops/` | Hub/dungeon loops | Optional; verify MakeCode strategy. |

Canonical sound IDs:

- `SFX_UI_MOVE`
- `SFX_UI_CONFIRM`
- `SFX_UI_BACK`
- `SFX_DOOR_ENTER`
- `SFX_DOOR_LOCKED`
- `SFX_SAVE`
- `SFX_COLLECT`
- `SFX_HIT`
- `SFX_HURT`
- `SFX_WIN_STAGE`
- `SFX_WIN_DUNGEON`
- `SFX_LOSE` / `SFX_RESPAWN`
- `SFX_TRANSITION`
- `SFX_PUZ_SWITCH`
- `SFX_PUZ_GATE`
- `SFX_SHOOTER_SHOT`
- `SFX_SHOOTER_HIT`
- `SFX_SHOOTER_CORE_DOWN`
- `SFX_BLOCK_PUSH`
- `SFX_BLOCK_PLACE`
- `SFX_RHYTHM_TICK`
- `SFX_RHYTHM_HIT_GOOD` / `MISS`
- `SFX_PONG_BOUNCE`
- `SFX_PONG_SCORE` / `TARGET_BREAK`
- `SFX_AST_THRUST`
- `SFX_AST_SHOT`
- `SFX_AST_BREAK`
- `SFX_PLAT_JUMP`
- `SFX_PLAT_LAND`
- `SFX_PLAT_HURT`
- `SFX_BARREL_ROLL`
- `SFX_CLIMB`
- `SFX_META_WARP`
- `SFX_META_PHASE_CLEAR`

---

## Avoid for v1.0

Do not copy these unless explicitly approved:

| Source package category/path | Reason |
|---|---|
| `3D assets/*` | MakeCode Arcade target is 2D; 3D models are out of scope for v1.0. |
| `2D assets/Isometric *` | Current requirement is top-down/orthogonal hub; isometric may cause perspective mismatch. |
| `2D assets/Axonometric Blocks` | Perspective mismatch unless a later 2.5D decision is made. |
| `2D assets/Monochrome Pirates`, `Pirate Pack`, `RTS Medieval`, `Fantasy UI Borders` | Theme mismatch for NeonKiez v1.0. |
| Full audio/music libraries | Too much repo weight; select only needed cues. |
| Full spritesheets without curation | Memory/readability risk in MakeCode Arcade. |

---

## First asset batches

### Batch 1: Hub visibility and start room

Copy curated files from:

- `2D assets/RPG Urban Pack` -> `assets/selected/kenney/hub/RPG Urban Pack/`
- `2D assets/Roguelike City Pack` -> `assets/selected/kenney/hub/Roguelike City Pack/`
- `2D assets/Roguelike Characters Pack` -> `assets/selected/kenney/hub/Roguelike Characters Pack/`
- `Icons/Input Prompts Pixel 16×` -> `assets/selected/kenney/ui/Input Prompts Pixel 16x/`
- `UI assets/UI Pixel Pack` -> `assets/selected/kenney/ui/UI Pixel Pack/`

Goal:

- `SPR_PLAYER_TOPDOWN`
- `SPR_DOOR_DUNGEON`
- `SPR_NPC_SAVEHOUSE`
- `SPR_INTERACT_PROMPT`
- `TM_HUB_11`

### Batch 2: Full hub grid

Copy curated files from:

- `2D assets/RPG Urban Pack`
- `2D assets/Roguelike City Pack`
- `2D assets/Generic Items`
- `2D assets/Robot Pack`

Goal:

- `TM_HUB_00..22`
- all dungeon doors visible
- savehouse visible
- hub props added without clutter

### Batch 3: Platform dungeons

Copy curated files from:

- `2D assets/Pixel Platformer`
- `2D assets/Platformer Characters 1`
- `2D assets/Pixel Platformer Industrial Expansion`
- `2D assets/Platformer Pack Industrial`

Goal: D07 and D08 visible and playable.

### Batch 4: Shooter and Asteroids dungeons

Copy curated files from:

- `2D assets/Topdown Shooter (Pixel)`
- `2D assets/Pixel Shmup`
- `2D assets/Space Shooter Redux`
- `2D assets/Simple Space`

Goal: D02 and D06 visible and playable.

### Batch 5: Puzzle and Rhythm dungeons

Copy curated files from:

- `2D assets/Puzzle Assets`
- `2D assets/Sokoban Pack`
- `2D assets/Boardgame Pack`
- `2D assets/Physics Assets`
- `UI assets/UI Pixel Pack`
- `Icons/Game Icons`

Goal: D01, D03, D04, D05 readable and playable.

### Batch 6: Audio pass 1

Copy curated files from:

- `Audio/Interface Sounds`
- `Audio/UI Audio`
- `Audio/Digital Audio`
- `Audio/Retro Sounds 1`
- `Audio/Sci-Fi Sounds`

Goal: Basic interaction, collect, win, shooter, asteroids, platform and rhythm cues.
