
> **Wichtig:** Alles in dieser Datei ist **verbindlich**.  
> Der Agent darf **Rückfragen** stellen. Wenn etwas unklar ist, fragt er nach oder trifft sinnvolle Defaults und dokumentiert sie als `// DECISION: ...`.

---

## 0) Zielbild (die eine Wahrheit)

Du implementierst ein story-getriebenes Retro-Spiel in **MakeCode Arcade (TypeScript)**:

- **Hubwelt = Top-Down wie alte Zeldas** (Room-to-Room scrollende Übergänge).
- **Dungeons = sofortiger Moduswechsel**:
  - Ablauf beim Betreten einer Dungeon-Tür im Hub:
    1) **kurzer Storybeat (2–5 Sekunden)**
    2) **SOFORT PlayMode wechseln**
    3) **Der ganze Dungeon läuft in diesem Mode** (nicht erst beim Boss)
- Zielgruppe: **10 Jahre** → **kein Gore, keine „Kills“**, nur Comic-Feedback (stun/freeze/decoy/confetti/out-of-order).

### Begriffe (niemals vermischen)
- **HubMode**: Top-Down-Zelda-Gameplay (Exploration, NPCs, Quests, Savehouse, Türen).
- **DungeonMode**: eigener PlayMode pro Dungeon (z. B. Platformer / Shooter / Asteroids / Rhythm / Puzzle / Meta).
- **Encounter**: optionales Mini-Event innerhalb eines Modes (untergeordnet). **Nicht** Hauptmechanismus.

---

## 1) Nicht verhandelbare Constraints (Guardrails)

1) **Rückfragen.** Frag nach oder triff Defaults, dokumentiere sie.
2) **Texte ausschließlich als Platzhalter-IDs** (keine echten Dialoge), z. B.:
   - `[CUT_DUN_02_ENTRY_BEAT_DIE_LUFT_KNISTERT]`
   - `[DIALOG_NPC_03_HINT_WO_IST_DIE_TUER]`
3) **Assets sind Platzhalter** (Sprites/Tilemaps/Sounds). Menschen ersetzen sie später manuell.
4) **Kinderfreundlich**: kein Blut, kein Gore, keine Hinrichtungen, keine „Dead bodies“. Gegner „gehen aus“, „tanzen“, „frieren ein“, „fliehen“.
5) Stabilität/Performance:
   - keine unkontrollierten Spawns
   - AutoDestroy/Lifespan + Caps
   - konsequentes Cleanup beim Modewechsel
6) Event-Handler:
   - **einmal** registrieren
   - im Handler sofort `if (state.playMode !== EXPECTED) return;`
7) Overlap/Interact:
   - immer Debounce / Cooldown
   - Hits mit I-Frames
8) Keine Monolith-Datei: Wenn > ~250 Zeilen → splitten.

---

## 2) Extensions / Abhängigkeiten

Füge diese Extensions hinzu:
- `microsoft/arcade-background-scroll` (Parallax)
- `riknoll/arcade-overworld` (Hub Room-Grid + scrollende Transitions)
- `microsoft/arcade-storytelling` (Cutscenes/Dialogs)
- `riknoll/arcade-mini-menu` (Menus)

**Wichtig:** Wenn API-Namen unklar sind, lies sie lokal in `pxt_modules/<extension>/` aus. Keine externe Recherche.

---

## 3) Repo-Struktur (Dateien anlegen)

Jede Datei bekommt oben einen 1-Zeiler Kommentar „Zweck“.

- `main.ts` — minimaler Bootstrap, startet `GameController.start()`
- `constants.ts` — IDs, Enums, Tuning-Parameter, SpriteKinds, TileTags, Caps
- `state.ts` — GameState (flags, inventory, unlocked tools, current hub room, playMode)
- `save.ts` — serialize/deserialize, persist, continue/new game
- `assets_stub.ts` — Platzhalter-Assets + Factories
- `game_controller.ts` — GameMode/PlayMode StateMachine, transitions, cleanup
- `player_topdown.ts` — Top-Down Player für Hub (movement + interact)
- `player_modes.ts` — Mode-spezifische Player/Inputs (platformer/shooter/asteroids/rhythm/puzzle)
- `tools.ts` — FreezeCam/Confetti/Soap/Decoy/Tagger (global), pro Mode „enabled/disabled“
- `ui_hud.ts` — HUD: hearts, energy, tool, hint
- `ui_menu.ts` — Pause/Inventar/Questlog/Debug-Warp (mini-menu)
- `dialogue.ts` — Story wrapper (playCutscene/say/choice) mit Platzhaltertexten
- `quests.ts` — QuestSpec + Fortschritt + Rewards
- `world_hub.ts` — Hub-Grid (3×3), NPCs, Doors, Savehouse
- `world_dungeons.ts` — DungeonRegistry (9 Specs), Dungeon entry/return wiring
- `modes/` Ordner (wenn möglich) oder `modes.ts`:
  - `mode_platform.ts`, `mode_shooter.ts`, `mode_asteroids.ts`, `mode_rhythm.ts`, `mode_puzzle.ts`, `mode_meta.ts`
- `debug.ts` — Warp, Godmode, counters, overlay

---

## 4) Datenmodelle (Specs) — Single Source of Truth

> **Regel:** Neue Inhalte hinzufügen heißt: **Spec ergänzen**, nicht Logik kopieren.

~~~ts
// constants.ts
export enum GameMode { Boot, Title, Hub, Dungeon, Cutscene, Menu, Transition }
export enum PlayMode {
  HUB_TOPDOWN,
  DUN_PLATFORM,
  DUN_SHOOTER,
  DUN_ASTEROIDS,
  DUN_RHYTHM,
  DUN_PUZZLE,
  DUN_META
}

export interface DungeonReward {
  flagsSet: string[];
  toolUnlocks?: string[];
  items?: { id: string; qty: number }[];
}

export interface DungeonSpec {
  id: string;

  // Sofortiger Mode-Switch nach Intro-Beat
  playMode: PlayMode;
  introCutsceneId: string;  // kurzer Storybeat beim Eintritt (Platzhalter-ID)

  // Stage-IDs (Tilemaps/Scenes) — pro Dungeon Mode-spezifisch
  stages: string[];

  // Return
  hubReturnSpawnTag: string;

  // Rewards
  rewards: DungeonReward;

  // Optional: Mode-Parameter (Caps, Difficulty, BPM usw.)
  params?: any; // typed soweit sinnvoll pro Mode
}
~~~

---

## 5) Kernarchitektur: GameController + PlayMode-Switch (das Herz)

### 5.1 Einzige Wahrheit
- `state.gameMode` (Flow)
- `state.playMode` (Gameplay-System)

### 5.2 Heiliger Modewechsel: `switchPlayMode(next, payload)`
Ablauf **immer**:
1) `transitionLock = true`
2) `cleanupCurrentPlayMode()`:
   - destroy all sprites of Kinds owned by current playMode
   - stop interval handles/timers owned by mode
   - reset camera/background scroll layers
   - reset temporary input mappings
3) `setupNextPlayMode(next, payload)`:
   - load stage tilemap/scene
   - spawn player/avatar for mode
   - set input mapping
   - set HUD state
4) `transitionLock = false`

**Regel:** Event-Handler werden nur einmal registriert. Jeder Handler beginnt mit:
- `if (state.playMode !== EXPECTED_MODE) return;`
- plus Debounce falls nötig

### 5.3 Dungeon Entry Ablauf (SOFORT nach Storybeat)
Wenn der Hub-Spieler eine Dungeon-Tür nutzt:
1) `setGameMode(Transition)`
2) `setGameMode(Cutscene)`
3) `playCutscene(dungeon.introCutsceneId)` (2–5s, Platzhaltertext)
4) `setGameMode(Dungeon)`
5) `switchPlayMode(dungeon.playMode, { dungeonId, stageIndex: 0 })`

Wenn Dungeon abgeschlossen oder abgebrochen:
- `switchPlayMode(HUB_TOPDOWN, { hubSpawnTag: dungeon.hubReturnSpawnTag })`
- `setGameMode(Hub)`

---

## 6) Platzhalter-Assets & Naming (damit Austausch später schmerzfrei ist)

### 6.1 Factories in `assets_stub.ts`
- `imgPlayerTopdown()`, `imgNpc(id)`, `imgDoor(id)`
- pro Mode: `imgPlatformPlayer()`, `imgShooterShip()`, `imgAstShip()`, `imgPuzzleCursor()`, …
- Tilemaps: `tmHub00()` … `tmHub22()`
- Dungeons: `tmDun01Stage00()` … etc. (Platzhalter, Menschen ersetzen)

### 6.2 Naming Standard (streng)
- Sprites: `SPR_*`
- Tilemaps: `TM_*`
- Tiles/Marker: `TILE_*`
- Sounds: `SFX_*`, Musik: `BGM_*`
- Texte: `TXT_*`, `DIALOG_*`, `CUT_*`, `QUEST_*`, `HINT_*`

---

## 7) Tools (kinderfreundlich, global)

Tools existieren in `state`, aber können pro Mode disabled sein:
- `TOOL_FREEZECAM` — freeze cone
- `TOOL_CONFETTI_BOMB` — AoE stun (“tanzen”)
- `TOOL_SOAP_SLIDE` — slippery area
- `TOOL_DECOY_TOY` — lure
- `TOOL_TAGGER` — mark/hint

Wenn Tool in Mode nicht passt: HUD zeigt „disabled“, Tool macht nichts (kein Crash).

---

## 8) Hubwelt (Top-Down Zelda-Style)

- Hub = 3×3 Room-Grid `TM_HUB_00..22`
- scrollende Transitions via `arcade-overworld`
- Parallax: mind. 2 Layer im Hub
- Inhalte:
  - NPCs (Platzhalterdialoge)
  - Savehouse (heal + save)
  - 9 Dungeon-Türen (Door-Tiles / Interact)

---

## 9) Dungeon-Katalog (9 Stück) — *mit vollständigen Beschreibungen*

> **Wichtig:** Jeder Dungeon startet **sofort** nach Intro-Beat in seinem Mode.  
> Jeder Dungeon hat mehrere **Stages** (empfohlen 3–5) und ein klares Win/Lose.

Für jede Beschreibung gilt:
- **Setup**: Stage laden, Avatar spawnen, Musik, Caps
- **Input**: Mode-spezifisch
- **Core Loop**: die eine Mechanik pro Dungeon
- **Win**: Stage clear → nächste Stage; letzte Stage → rewards + return
- **Lose**: respawn in aktueller Stage (kurz, freundlich), nie „Game Over“ Spam
- **Cleanup**: alles Mode-eigene killen (Sprites, intervals)

---

### DUNGEON 1 — `DUN_LAUNDROMAT_LABYRINTH` (Mode: Puzzle/Maze)

- **Theme/Ort:** `[THEME_LAUNDROMAT_BASEMENT_MAZE]`
- **Intro-Beat:** `[CUT_DUN_01_ENTRY_BEAT_WASCHMASCHINEN_SINGEN]`
- **PlayMode:** `DUN_PUZZLE`
- **Stages (Beispiele/IDs):**
  1) `TM_DUN_01_STAGE_00_WARMUP` — kurzer Tutorial-Korridor (Schalter + Tür)
  2) `TM_DUN_01_STAGE_01_DARK_MAZE` — Lichtschalter toggeln Sicht/Wege
  3) `TM_DUN_01_STAGE_02_TOKEN_RUN` — Tokens sammeln, „Ghost-Bot“ patrouilliert
  4) `TM_DUN_01_STAGE_03_EXIT_ROOM` — Finale: 1 großes Gate, 1 letzter Schalter
- **Setup (pro Stage):**
  - Puzzle-Player-Avatar: `SPR_PUZZLE_PLAYER`
  - Spawn via `TILE_SPAWN_STAGE`
  - `tokensToCollect` pro Stage (Cap)
  - Musik: `BGM_DUN_01`
- **Input-Mapping:**
  - D-Pad bewegen, A = Interact (Schalter), B = Tool (falls enabled)
- **Core Loop:**
  - Schalter toggeln Türen/Wege; Licht-State beeinflusst Ghost-Bot-Speed
  - Ghost-Bot ist „harmlos“: Treffer = stun + knockback + i-frames, kein Gore
- **Win Condition:**
  - Stage 0/1: alle Gates geöffnet
  - Stage 2: `tokensCollected >= target`
  - letzte Stage: Exit-Flag erreicht → Dungeon clear
- **Lose Condition:**
  - hearts 0 → respawn in aktueller Stage, Stage-State teilweise reset (fair)
- **Rewards:**
  - `toolUnlocks: [ "TOOL_TAGGER" ]`
  - `items: [ { id: "ITEM_CASSETTE_01", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_01_CLEARED" ]`
- **Return:** `hubReturnSpawnTag: "SPAWN_HUB_FROM_DUN_01"`

---

### DUNGEON 2 — `DUN_ROOFTOP_INVADERS` (Mode: Top-Down Shooter)

- **Theme/Ort:** `[THEME_ROOFTOP_NEON_ANTENNAS]`
- **Intro-Beat:** `[CUT_DUN_02_ENTRY_BEAT_WIND_UEBER_NEON]`
- **PlayMode:** `DUN_SHOOTER`
- **Stages:**
  1) `TM_DUN_02_STAGE_00_RANGE` — Schießen üben + 1 Welle
  2) `TM_DUN_02_STAGE_01_FORMATIONS` — Formations-Gegner (classic invaders vibe)
  3) `TM_DUN_02_STAGE_02_ALARM` — Alarm erhöht Spawn, aber senkt Enemy-Speed (fair)
  4) `TM_DUN_02_STAGE_03_CORE` — „Antenna Core“ mit HP (kein Blut, nur sparks)
- **Setup:**
  - Shooter-Ship: `SPR_SHOOTER_SHIP`
  - Bullets: cap + AutoDestroy
  - Musik: `BGM_DUN_02`
- **Input:**
  - D-Pad bewegen, A = shoot, B = Tool (optional), Menu = pause
- **Core Loop:**
  - Wellen-System mit Cap (max enemies on screen)
  - Trefferfeedback: confetti/sparks
- **Win:**
  - Stage clear, wenn waves done / core HP 0
- **Lose:**
  - hearts 0 → respawn Stage, waves reset (kurz)
- **Rewards:**
  - `toolUnlocks: [ "TOOL_CONFETTI_BOMB" ]`
  - `items: [ { id: "ITEM_TOKEN_BAG_SMALL", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_02_CLEARED" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_02`

---

### DUNGEON 3 — `DUN_WAREHOUSE_BLOCKWORKS` (Mode: Puzzle/Blocks/Conveyor)

- **Theme/Ort:** `[THEME_WAREHOUSE_CONVEYOR_BLOCKS]`
- **Intro-Beat:** `[CUT_DUN_03_ENTRY_BEAT_GABELSTAPLER_GRUESST]`
- **PlayMode:** `DUN_PUZZLE`
- **Stages:**
  1) `TM_DUN_03_STAGE_00_CONVEYOR_INTRO` — Förderband + 1 Gate
  2) `TM_DUN_03_STAGE_01_BLOCK_ROWS` — Blockreihen füllen → Gate toggelt
  3) `TM_DUN_03_STAGE_02_MOVING_CRATES` — periodische Kisten bewegen
  4) `TM_DUN_03_STAGE_03_FINAL_PATTERN` — Zielmuster herstellen
- **Input:**
  - bewegen, A = grab/push (oder Interact), B = Tool optional
- **Core Loop:**
  - einfache Grid-Checks, keine teuren Scans pro Frame (nur bei Block-Change)
- **Win:**
  - Zielmuster / Liniencount erreicht
- **Lose:**
  - time limit optional (freundlich), hearts 0 → respawn stage
- **Rewards:**
  - `toolUnlocks: [ "TOOL_SOAP_SLIDE" ]`
  - `items: [ { id: "ITEM_KEYCARD_A", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_03_CLEARED" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_03`

---

### DUNGEON 4 — `DUN_SUBWAY_TIMING` (Mode: Rhythm/Timing)

- **Theme/Ort:** `[THEME_SUBWAY_BACKROOMS_METRONOME]`
- **Intro-Beat:** `[CUT_DUN_04_ENTRY_BEAT_TAKT_IM_TUNNEL]`
- **PlayMode:** `DUN_RHYTHM`
- **Stages:**
  1) `TM_DUN_04_STAGE_00_BEAT_TUTORIAL` — good window lernen
  2) `TM_DUN_04_STAGE_01_DOORS` — Türen öffnen nur im Beat-Fenster
  3) `TM_DUN_04_STAGE_02_SWITCH_CHAIN` — mehrere Fenster hintereinander (streak)
  4) `TM_DUN_04_STAGE_03_FINAL_STREAK` — finale streak challenge
- **Input:**
  - D-Pad bewegen (optional), A = „Tap“ / Interact im Window
- **Core Loop:**
  - BPM Timer, UI zeigt Window; Miss-Limit klein, Restart schnell
- **Win:**
  - streak target erreicht
- **Lose:**
  - miss limit erreicht → restart stage
- **Rewards:**
  - `toolUnlocks: [ "TOOL_FREEZECAM" ]`
  - `items: [ { id: "ITEM_CASSETTE_02", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_04_CLEARED" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_04`

---

### DUNGEON 5 — `DUN_SCHOOL_PONG_COURT` (Mode: Puzzle/Pong-Breakout)

- **Theme/Ort:** `[THEME_SCHOOL_HALL_PONG_TRIAL]`
- **Intro-Beat:** `[CUT_DUN_05_ENTRY_BEAT_PAUSENKLINGEL_PING]`
- **PlayMode:** `DUN_PUZZLE`
- **Stages:**
  1) `TM_DUN_05_STAGE_00_PADDLE_LEARN` — paddle bewegen, ball bleibt langsam
  2) `TM_DUN_05_STAGE_01_TARGETS` — targets aktivieren (breakout)
  3) `TM_DUN_05_STAGE_02_REFLECTORS` — Winkelrätsel
  4) `TM_DUN_05_STAGE_03_FINAL_CLEAR` — kombiniertes target layout
- **Input:**
  - D-Pad steuert Paddle (oder Cursor), A = Start/Serve, B = Tool optional
- **Core Loop:**
  - Ball physics mit Caps (nur 1–2 Bälle), Targets als tiles oder sprites
- **Win:**
  - alle Targets getroffen
- **Lose:**
  - lives 0 → restart stage (kurz)
- **Rewards:**
  - `items: [ { id: "ITEM_KEYCARD_B", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_05_CLEARED", "FLAG_UPG_DASH_COOLDOWN_REDUCED" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_05`

---

### DUNGEON 6 — `DUN_ARCADE_MUSEUM_ASTEROIDS` (Mode: Asteroids)

- **Theme/Ort:** `[THEME_MUSEUM_STORAGE_ZERO_G]`
- **Intro-Beat:** `[CUT_DUN_06_ENTRY_BEAT_SCHWERELLOS_IM_MUSEUM]`
- **PlayMode:** `DUN_ASTEROIDS`
- **Stages:**
  1) `TM_DUN_06_STAGE_00_THRUST` — thrust/wrap lernen, wenige debris
  2) `TM_DUN_06_STAGE_01_SPLIT` — split depth max 2, cap debris
  3) `TM_DUN_06_STAGE_02_PARTS_RUSH` — Teile einsammeln statt „zerstören“
  4) `TM_DUN_06_STAGE_03_SURVIVE` — survive timer
- **Input:**
  - Left/Right = rotate, Up = thrust, A = ping/shot (optional), B = tool optional
- **Core Loop:**
  - Screen wrap stabil; debris cap; projectiles lifespan
- **Win:**
  - parts target / survive time
- **Lose:**
  - hearts 0 → restart stage
- **Rewards:**
  - `items: [ { id: "ITEM_CASSETTE_03", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_06_CLEARED", "FLAG_TRAV_MAGNET_GLOVE" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_06`

---

### DUNGEON 7 — `DUN_VIDEO_STORE_PLATFORM_TRIAL` (Mode: Sidescroller Platform)

- **Theme/Ort:** `[THEME_VIDEO_STORE_ARCHIVE_SHELVES]`
- **Intro-Beat:** `[CUT_DUN_07_ENTRY_BEAT_VHS_REGAL_RUETTELT]`
- **PlayMode:** `DUN_PLATFORM`
- **Stages:**
  1) `TM_DUN_07_STAGE_00_JUMP` — basic jumps, safe platforms
  2) `TM_DUN_07_STAGE_01_MOVING_SHELVES` — moving platforms
  3) `TM_DUN_07_STAGE_02_SWITCH_GATES` — switches open gates
  4) `TM_DUN_07_STAGE_03_FINAL_RUN` — kurzer final run
- **Input:**
  - Left/Right move, A = jump, Down = drop-through optional, B = tool optional
- **Core Loop:**
  - respawn quick; hazards comic (fall into foam pit etc.)
- **Win:**
  - reach goal flag tile
- **Lose:**
  - fall/hit limit → respawn stage start
- **Rewards:**
  - `items: [ { id: "ITEM_STICKER_SET_01", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_07_CLEARED", "FLAG_UPG_LIGHT_DOUBLE_JUMP" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_07`

---

### DUNGEON 8 — `DUN_CONSTRUCTION_DONKEY_TOWER` (Mode: Platform/Ladders)

- **Theme/Ort:** `[THEME_CONSTRUCTION_SCAFFOLD_TOWER]`
- **Intro-Beat:** `[CUT_DUN_08_ENTRY_BEAT_BAUSTELLE_RUMMST]`
- **PlayMode:** `DUN_PLATFORM`
- **Stages:**
  1) `TM_DUN_08_STAGE_00_LADDERS` — ladders tutorial
  2) `TM_DUN_08_STAGE_01_BARRELS` — rolling barrels (comic paint cans)
  3) `TM_DUN_08_STAGE_02_TRICK_LADDERS` — ladder gaps + timing
  4) `TM_DUN_08_STAGE_03_TOP_PLATFORM` — final climb
- **Input:**
  - Left/Right, A jump, Up/Down ladder climb (only on ladder tiles)
- **Core Loop:**
  - barrel spawn cap, no endless spam; soap tool can deflect
- **Win:**
  - reach top goal tile
- **Lose:**
  - hit limit → restart stage
- **Rewards:**
  - `toolUnlocks: [ "TOOL_DECOY_TOY" ]`
  - `items: [ { id: "ITEM_CASSETTE_04", qty: 1 } ]`
  - `flagsSet: [ "FLAG_DUN_08_CLEARED" ]`
- **Return:** `SPAWN_HUB_FROM_DUN_08`

---

### DUNGEON 9 — `DUN_FINAL_GLITCH_PANOPTICON` (Mode: Meta)

- **Theme/Ort:** `[THEME_SERVERROOM_GLITCH_CORE]`
- **Intro-Beat:** `[CUT_DUN_09_ENTRY_BEAT_DIE_WELT_HAKT]`
- **PlayMode:** `DUN_META`
- **Stages:**
  1) `TM_DUN_09_STAGE_00_META_INTRO` — kurze, sichere Einführung
  2) `TM_DUN_09_STAGE_01_MICRO_PLATFORM` — 15–20s platform remix
  3) `TM_DUN_09_STAGE_02_MICRO_SHOOTER` — 15–20s shooter remix
  4) `TM_DUN_09_STAGE_03_MICRO_RHYTHM` — streak mini
  5) `TM_DUN_09_STAGE_04_STABILIZE` — finale nodes aktivieren
- **Input:**
  - wechselt pro micro-stage, muss immer eingeblendet werden (HUD hint placeholder)
- **Core Loop:**
  - Meta-Modus orchestriert Sub-Controller, aber **Cleanup nach jeder Micro-Stage**
- **Win:**
  - stabilize nodes complete → game completed
- **Lose:**
  - fail → restart current micro-stage (nicht alles von vorn)
- **Rewards:**
  - `flagsSet: [ "FLAG_DUN_09_CLEARED", "FLAG_GAME_COMPLETED", "FLAG_UNLOCK_FREE_ROAM_PLUS", "FLAG_UNLOCK_COSMETIC_MASKS" ]`
- **Return:**
  - `SPAWN_HUB_FROM_DUN_09` (oder credits flow)

---

## 10) Implementierungs-Reihenfolge (ohne Umwege)

1) Scaffold: Dateien + enums + state/save stubs
2) `GameController` + `switchPlayMode()` + `cleanupCurrentPlayMode()` (noch ohne Content)
3) Hub Top-Down Player + 1 Hub room (movement, collision, hud)
4) Hub Room-Grid + scroll transitions + parallax
5) Dungeon Door system: Door → intro beat → immediate mode switch
6) Implementiere 2 Modes vollständig als Proof:
   - `DUN_PLATFORM` (Dungeon 7 Stage 0–1 spielbar)
   - `DUN_ASTEROIDS` (Dungeon 6 Stage 0 spielbar)
7) Implementiere Save/Continue
8) Implementiere restliche Modes minimal (scaffold), so dass jeder Dungeon startbar ist
9) Fülle mindestens 5 Dungeons spielbar (mehrstufig, rewards)
10) Debug tools + Warp menu
11) Polish: cleanup, caps, i-frames, transitions, comments

Nach jedem Schritt: Kommentar `// MANUAL TEST PASSED: <was>`.

---

## 11) Definition of Done (DoD)

Fertig implementiert, wenn:
- Title → Hub → beliebige Dungeon-Door → Storybeat → sofortiger Modewechsel funktioniert
- Rückkehr in Hub funktioniert zuverlässig
- Parallax sichtbar im Hub
- Mindestens 5 Dungeons spielbar (mehrere stages), Rest scaffolded (startbar/return)
- Save/Continue funktioniert
- 10-Minuten-Run ohne progressive Verlangsamung
- Erweiterung ist datengetrieben (DungeonSpec + stage lists + placeholder texts)

---

## 12) Asset-Lieferformat (für Menschen)

Menschen liefern:
- Grafik: PNG (transparent), optional Aseprite/ASE
- Audio: WAV (Master), optional MIDI + WAV-Referenz
- Text: CSV/MD (id,text,note) → wird als Platzhalter-IDs geführt

Einfügen:
- nur über `assets_stub.ts` Factories + Naming Standard.

**ENDE.**
