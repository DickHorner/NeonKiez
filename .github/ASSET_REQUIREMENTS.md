# ASSET_REQUIREMENTS.md — NeonKiez (MakeCode Arcade) v1.0
Stand: benötigt für spielbares Release. (Keine 3D-Modelle: MakeCode Arcade ist 2D.)

## 0) Globale Regeln (für alle Assets)
- Standard-Tilegröße: 16x16
- Klare Silhouetten, hohe Lesbarkeit (Kinderfreundlichkeit)
- Kein Gore, keine „Kill“-Ästhetik (Comic-FX)
- Nur Subsets importieren (Performance/Übersicht)

## 1) Global / Shared (überall genutzt)

### 1.1 UI / HUD (Sprites + ggf. kleine Animationen)
- [ ] SPR_UI_HEART (oder 2–3 Zustände: voll/halb/leer)
- [ ] SPR_UI_TOOL_ICON_<TOOL_ID> (für alle Tools, die es in v1.0 gibt)
- [ ] SPR_UI_CURSOR / SPR_UI_SELECTOR (für Menüs)
- [ ] SPR_UI_DIALOG_FRAME (optional; sonst Standard-Dialog)
- [ ] SPR_UI_POPUP_ICON_INFO / WARN / OK (optional)

### 1.2 Globale VFX (kinderfreundlich)
- [ ] SPR_FX_SPARK_01..02 (Treffer ohne Gewalt)
- [ ] SPR_FX_POOF_01..02 (Teleport/Disappear)
- [ ] SPR_FX_CONFETTI_01..02 (Win/Reward)
- [ ] SPR_FX_GLOW_01..02 (Neon-Highlight, optional)

### 1.3 Globale SFX (MakeCode: Sound-Expressions, keine WAV/MP3)
- [ ] SFX_UI_MOVE
- [ ] SFX_UI_CONFIRM
- [ ] SFX_UI_BACK
- [ ] SFX_DOOR_ENTER
- [ ] SFX_DOOR_LOCKED (wenn final door gated)
- [ ] SFX_SAVE
- [ ] SFX_COLLECT
- [ ] SFX_HIT (comic)
- [ ] SFX_HURT (sanft)
- [ ] SFX_WIN_STAGE
- [ ] SFX_WIN_DUNGEON
- [ ] SFX_LOSE / SFX_RESPAWN
- [ ] SFX_TRANSITION (Modewechsel)

### 1.4 Musik (minimal für v1.0)
- [ ] BGM_HUB_NEON (1 Loop)
- [ ] BGM_DUN_PLATFORM (optional, kann auch shared sein)
- [ ] BGM_DUN_SHOOTER (optional)
- [ ] BGM_DUN_ASTEROIDS (optional)
- [ ] BGM_DUN_RHYTHM (optional)
- [ ] BGM_DUN_PUZZLE (optional)
- [ ] BGM_FINAL (optional)

---

## 2) Hub / Overworld (Top-down Neon City)

### 2.1 Hub-Spieler & NPCs (Top-down Sprites)
- [ ] SPR_PLAYER_TOPDOWN
- [ ] ANIM_PLAYER_TOPDOWN_WALK (2–4 Frames)
- [ ] SPR_NPC_GENERIC_01..03
- [ ] SPR_NPC_SAVEHOUSE
- [ ] ANIM_NPC_IDLE (optional)

### 2.2 Türen/Interaktionen
- [ ] SPR_DOOR_DUNGEON (Basis)
- [ ] SPR_DOOR_FINAL (visuell unterscheidbar)
- [ ] SPR_INTERACT_PROMPT (z. B. kleines “A” Icon)

### 2.3 Hub Tileset (16x16 Tiles)
Boden/Wände:
- [ ] T_HUB_FLOOR_01..03
- [ ] T_HUB_WALL_01..03
- [ ] T_HUB_EDGE / T_HUB_BORDER (für saubere Kanten)
Neon Props:
- [ ] T_HUB_SIGN_01..06 (Neon-Schilder/Leuchten)
- [ ] T_HUB_PROP_01..10 (Mülltonne, Automaten, Laternen, etc.)
Spezial:
- [ ] T_HUB_DECAL_01..06 (Markierungen, Pfeile)

### 2.4 Marker-Tiles (rein technisch, aber als Assets nötig!)
Diese Tiles sind wichtig, weil sie Code/Level verbinden:
- [ ] T_MARK_SPAWN_<TAG> (z. B. TAG_DOOR_D01, TAG_SAVEHOUSE, etc.)
- [ ] T_MARK_DOOR_<DUN_ID> (optional, wenn Türen als Tiles statt Sprites)
- [ ] T_MARK_EXIT
- [ ] T_MARK_NPC_<ID>

### 2.5 Hub Tilemaps (3x3 Grid)
- [ ] TM_HUB_00
- [ ] TM_HUB_01
- [ ] TM_HUB_02
- [ ] TM_HUB_10
- [ ] TM_HUB_11 (Start)
- [ ] TM_HUB_12
- [ ] TM_HUB_20
- [ ] TM_HUB_21
- [ ] TM_HUB_22

Optional (wenn „Oberwelt außerhalb Stadt“ geplant):
- [ ] TM_OVERWORLD_01..02 (Outskirts/Allee/Industrie-Kante)

---

## 3) Dungeons (9) — Modus wechselt direkt beim Eintritt
Hinweis: Jeder Dungeon braucht mindestens:
- Stage Tilemaps (oder Arena/Background) + klare Ziele
- Mode-spezifische Player-Sprites
- 1–3 Gegner/Hindernisse/Objekte
- 1–2 klare VFX + SFX

### Dungeon 1 — D01 Laundromat Labyrinth (Puzzle / Top-down)
Sprites:
- [ ] SPR_PLAYER_PUZZLE (kann SPR_PLAYER_TOPDOWN reuse sein)
- [ ] SPR_TOKEN_LAUNDRY (Collectible)
- [ ] SPR_SWITCH_01
- [ ] SPR_GATE_01 (open/closed oder 2 Frames)
- [ ] SPR_PROP_WASHER / DRYER (optional, auch als Tiles möglich)
Tiles:
- [ ] T_PUZ_FLOOR_01..02
- [ ] T_PUZ_WALL_01..02
- [ ] T_PUZ_SWITCH_TILE (optional)
- [ ] T_PUZ_GATE_TILE (optional)
Tilemaps:
- [ ] TM_D01_STAGE_00..03
SFX:
- [ ] SFX_PUZ_SWITCH
- [ ] SFX_PUZ_GATE

### Dungeon 2 — D02 Rooftop Invaders (Top-down Shooter)
Sprites:
- [ ] SPR_SHOOTER_PLAYER_SHIP
- [ ] SPR_SHOOTER_BULLET
- [ ] SPR_SHOOTER_ENEMY_01..03
- [ ] SPR_SHOOTER_CORE (Boss-Ziel, kinderfreundlich)
- [ ] SPR_FX_HIT_SPARK (reuse global)
Tiles/Background:
- [ ] T_SHOOTER_ARENA_FLOOR / BORDER (oder nur BackgroundColor)
Tilemaps:
- [ ] TM_D02_STAGE_00..03 (wenn tilemap-basiert)
SFX:
- [ ] SFX_SHOOTER_SHOT
- [ ] SFX_SHOOTER_HIT
- [ ] SFX_SHOOTER_CORE_DOWN (Win cue)

### Dungeon 3 — D03 Warehouse Blockworks (Puzzle: Push Blocks)
Sprites:
- [ ] SPR_PLAYER_BLOCK (reuse)
- [ ] SPR_BLOCK_CRATE
- [ ] SPR_TARGET_PAD (Goal)
- [ ] SPR_SWITCH_02 (optional)
Tiles:
- [ ] T_WAREHOUSE_FLOOR_01..02
- [ ] T_WAREHOUSE_WALL_01..02
- [ ] T_WAREHOUSE_CONVEYOR (optional)
Tilemaps:
- [ ] TM_D03_STAGE_00..03
SFX:
- [ ] SFX_BLOCK_PUSH
- [ ] SFX_BLOCK_PLACE

### Dungeon 4 — D04 Subway Timing (Rhythm)
UI-Sprites (extrem wichtig):
- [ ] SPR_RHYTHM_BEAT_INDICATOR (pulsierend)
- [ ] SPR_RHYTHM_WINDOW_GOOD / OK / MISS (oder 3 Icons)
- [ ] SPR_RHYTHM_TRACK_MARKERS (optional)
- [ ] SPR_RHYTHM_TRAIN_DOOR (Goal-Feedback)
Tilemaps/Background:
- [ ] TM_D04_STAGE_00..03 (oder UI-only Szene + minimal Background)
SFX:
- [ ] SFX_RHYTHM_TICK (metronomartig)
- [ ] SFX_RHYTHM_HIT_GOOD / MISS

### Dungeon 5 — D05 School Pong Court (Puzzle/Arcade)
Sprites:
- [ ] SPR_PONG_PADDLE_PLAYER
- [ ] SPR_PONG_PADDLE_AI (optional)
- [ ] SPR_PONG_BALL
- [ ] SPR_PONG_TARGETS_01..03 (Targets/Bricks)
Tiles/Background:
- [ ] T_COURT_FLOOR / LINES (oder tilemap)
Tilemaps:
- [ ] TM_D05_STAGE_00..03 (wenn unterschiedliche Arenen)
SFX:
- [ ] SFX_PONG_BOUNCE
- [ ] SFX_PONG_SCORE / TARGET_BREAK (comic)

### Dungeon 6 — D06 Arcade Museum Asteroids (Asteroids)
Sprites:
- [ ] SPR_AST_PLAYER_SHIP
- [ ] ANIM_AST_THRUST (2 Frames, optional)
- [ ] SPR_AST_BULLET
- [ ] SPR_AST_ROCK_L (large)
- [ ] SPR_AST_ROCK_M (medium)
- [ ] SPR_AST_ROCK_S (small)
- [ ] SPR_FX_POOF (reuse global)
Background:
- [ ] SPR_BG_STARFIELD_TILE (optional, für Parallax/scroll)
SFX:
- [ ] SFX_AST_THRUST
- [ ] SFX_AST_SHOT
- [ ] SFX_AST_BREAK (comic crackle)

### Dungeon 7 — D07 Video Store Platform Trial (Platformer)
Tiles (Platform):
- [ ] T_PLAT_GROUND_01..02
- [ ] T_PLAT_PLATFORM_01..02
- [ ] T_PLAT_LADDER (optional)
- [ ] T_PLAT_HAZARD_01 (z. B. “electric puddle” ohne Gewalt)
- [ ] T_PLAT_GOAL (Exit)
Sprites:
- [ ] SPR_PLAT_PLAYER
- [ ] ANIM_PLAT_WALK (2–4 Frames)
- [ ] SPR_PLAT_ENEMY_01..02
- [ ] SPR_PLAT_COLLECTIBLE (optional)
Tilemaps:
- [ ] TM_D07_STAGE_00..03
SFX:
- [ ] SFX_PLAT_JUMP
- [ ] SFX_PLAT_LAND
- [ ] SFX_PLAT_HURT (sanft)

### Dungeon 8 — D08 Construction Donkey Tower (Platformer + Ladders + “Barrels”)
Tiles:
- [ ] T_DONKEY_GIRDER_01..02
- [ ] T_DONKEY_LADDER
- [ ] T_DONKEY_HAZARD (barrel lane markers optional)
Sprites:
- [ ] SPR_DONKEY_PLAYER (reuse plat player ok)
- [ ] SPR_DONKEY_BARREL (comic)
- [ ] SPR_DONKEY_BOSS (kinderfreundlich, eher “Foreman Bot”)
Tilemaps:
- [ ] TM_D08_STAGE_00..03
SFX:
- [ ] SFX_BARREL_ROLL
- [ ] SFX_CLIMB (optional)

### Dungeon 9 — D09 Final Glitch Panopticon (Meta / Micro-Stages)
Sprites (Meta/Glitch, aber kinderfreundlich):
- [ ] SPR_META_PORTAL
- [ ] SPR_META_GLITCH_FX_01..03 (bunte, harmlose FX)
- [ ] SPR_META_MODE_ICON_PLATFORM / SHOOTER / RHYTHM / AST (Icons)
Tilemaps/Background:
- [ ] TM_D09_STAGE_00..?? (je nachdem ob Meta Räume hat)
SFX:
- [ ] SFX_META_WARP
- [ ] SFX_META_PHASE_CLEAR
Music:
- [ ] BGM_FINAL (optional, aber nice)

---

## 4) „Minimum per Stage“-Check (für den Agenten)
Jede Stage braucht mindestens:
- [ ] Sichtbarer Player
- [ ] Klarer Background (Tilemap oder Color)
- [ ] 1 Ziel-Signal (Goal tile / Token / Core / UI Prompt)
- [ ] 1 Feedback-SFX (collect/win/hit)
- [ ] 0 Softlocks (Exit/Return erreichbar)

## 5) Asset-IDs, die NICHT fehlen dürfen (weil sonst „schwarzer Bildschirm“)
- [ ] SPR_PLAYER_TOPDOWN (oder sichtbarer Placeholder)
- [ ] TM_HUB_11 (Start-Raum)
- [ ] SPR_DOOR_DUNGEON
- [ ] SFX_DOOR_ENTER
- [ ] SFX_COLLECT (oder wenigstens 1 globales Feedback)
