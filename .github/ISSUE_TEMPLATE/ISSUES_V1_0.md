# ISSUES_V1_0.md — Copy/Paste Issue Bodies (v1.0)

Hinweis: Jede Issue hat:
- Title
- Labels
- Priority
- Area
- Dependencies
- Body

──────────────────────────────────────────────────────────────────────────────

## 1) [BLOCKER] Remove all merge conflict markers from repo
Labels: type:tech-debt, prio:P0-blocker, area:release
Dependencies: none

### Body
## Goal
Repo enthält 0 Merge-Konfliktmarker (`<<<<<<<`, `=======`, `>>>>>>>`) und ist deterministisch buildbar.

## Tasks
- [ ] Repo-weite Suche nach Konfliktmarkern
- [ ] Betroffene Dateien bereinigen (mind. pxt.json, README.md, game_controller.ts, assets_stub.ts)
- [ ] MakeCode Import + Simulator Start testen

## Acceptance Criteria
- [ ] 0 Treffer bei Konfliktmarker-Suche
- [ ] MakeCode importiert ohne Fehler
- [ ] Simulator startet reproduzierbar

## Test Evidence
- [ ] Screenshot / kurzer Log: Konfliktsuche 0 Treffer
- [ ] Golden Path Smoke (Start → Hub sichtbar)

──────────────────────────────────────────────────────────────────────────────

## 2) [BLOCKER] Consolidate pxt.json (single valid config)
Labels: type:tech-debt, prio:P0-blocker, area:release
Dependencies: #1

### Body
## Goal
pxt.json enthält genau eine gültige Struktur (Dependencies + Files), keine Duplikate.

## Tasks
- [ ] pxt.json bereinigen (eine Wahrheit)
- [ ] Extensions finalisieren: overworld, background scroll, mini-menu, storytelling
- [ ] Import/Build testen

## Acceptance Criteria
- [ ] MakeCode Import klappt
- [ ] Keine zufälligen Abweichungen beim Build/Simulator

## Test Evidence
- [ ] MakeCode Import erfolgreich
- [ ] Simulator startet 3× hintereinander gleich

──────────────────────────────────────────────────────────────────────────────

## 3) Ensure hub visibility (background fallback + player spawn)
Labels: type:bug, prio:P0-blocker, area:hub
Dependencies: #1, #2

### Body
## Goal
Der Hub zeigt IMMER etwas (auch ohne finale Assets): Hintergrund + sichtbarer Player.

## Tasks
- [ ] Hub-Setup setzt BackgroundColor als Fallback
- [ ] Player wird zuverlässig gespawnt
- [ ] Kamera/Follow korrekt

## Acceptance Criteria
- [ ] Start → Hub ist nicht leer/schwarz
- [ ] Player ist sichtbar und bewegbar

## Test Evidence
- [ ] Video/GIF 10s: Start → Hub → Bewegung

──────────────────────────────────────────────────────────────────────────────

## 4) Make placeholder sprites visible (no transparent stubs)
Labels: type:tech-debt, prio:P0-blocker, area:assets
Dependencies: #1

### Body
## Goal
Alle `img*()` Factories liefern sichtbar gerenderte Platzhalter (nicht transparent).

## Tasks
- [ ] assets_stub.ts: alle sprite factories mit simplem sichtbarem Pattern/Fill
- [ ] Player/NPC/Door/Mode-Avatare prüfen

## Acceptance Criteria
- [ ] Player, NPCs, Doors sichtbar
- [ ] Kein Sprite ist „unsichtbar“ wegen Transparent-only Images

## Test Evidence
- [ ] Hub Screenshot mit Player + mindestens 1 Door + 1 NPC

──────────────────────────────────────────────────────────────────────────────

## 5) Build real hub start tilemap (TM_HUB_11) with collisions
Labels: type:content, prio:P1-high, area:hub
Dependencies: #3, #4

### Body
## Goal
Start-Raum hat echte Tilemap mit Wänden/Begehbarkeit (Zelda-Feeling).

## Tasks
- [ ] TM_HUB_11 im Tilemap Editor bauen
- [ ] Wall tiles korrekt setzen
- [ ] Door/NPC Marker-Tiles einplanen

## Acceptance Criteria
- [ ] Player kollidiert korrekt mit Wänden
- [ ] Raum ist lesbar (Walkable vs Wall klar)

## Test Evidence
- [ ] 15s Clip: Player läuft, prallt an Wänden

──────────────────────────────────────────────────────────────────────────────

## 6) Build all 3×3 hub room tilemaps (TM_HUB_00..22) MVP
Labels: type:content, prio:P1-high, area:hub
Dependencies: #5

### Body
## Goal
Alle 9 Hub-Räume existieren als echte Tilemaps (minimal, konsistent, testbar).

## Tasks
- [ ] 9 Tilemaps anlegen: TM_HUB_00..22
- [ ] Einheitliche Marker-Tiles (Door/Spawn/NPC) verwenden
- [ ] Raum-Layout so, dass Übergänge logisch sind

## Acceptance Criteria
- [ ] Kein Raum ist „leer“ oder kaputt
- [ ] Alle Räume haben klare Begehbarkeit + Grenzen

## Test Evidence
- [ ] Warp-Menü: jeder Raum wird kurz besucht (Screenshots ok)

──────────────────────────────────────────────────────────────────────────────

## 7) Hub scrolling room transitions (Zelda-style)
Labels: type:feature, prio:P0-blocker, area:hub
Dependencies: #6

### Body
## Goal
Beim Erreichen der Raumkante scrollt der Bildschirm in den Nachbarraum (kein Teleport).

## Tasks
- [ ] arcade-overworld Transition einbinden
- [ ] Input lock während Scroll
- [ ] Player Spawn an korrekter Kante im Zielraum

## Acceptance Criteria
- [ ] 3×3 Grid begehbar mit smooth Scroll
- [ ] Keine Glitches/Softlocks beim Übergang

## Test Evidence
- [ ] 30s Clip: 3 Raumwechsel hintereinander

──────────────────────────────────────────────────────────────────────────────

## 8) Implement hub spawn tags (remove TODO; return points correct)
Labels: type:feature, prio:P0-blocker, area:hub
Dependencies: #6, #7

### Body
## Goal
`hubReturnSpawnTag` aus DungeonSpecs bestimmt echte Rückkehr-Spawnpunkte.

## Tasks
- [ ] Marker-Tiles für SpawnTags definieren
- [ ] Funktion: find spawn tile by tag + set player position
- [ ] Rückkehr aus mind. 2 Dungeons verifizieren

## Acceptance Criteria
- [ ] Jede Dungeon-Rückkehr spawnt an sinnvoller Stelle (bei passender Tür/Zone)
- [ ] Kein Rückkehr-Spawn in der Mitte als Default

## Test Evidence
- [ ] 2 Dungeons: rein → clear/exit → return korrekt

──────────────────────────────────────────────────────────────────────────────

## 9) Harden door interaction (debounce + transition lock + no double entry)
Labels: type:bug, prio:P0-blocker, area:hub
Dependencies: #7

### Body
## Goal
Door-Entry kann nicht doppelt auslösen und respektiert Transition-Lock.

## Tasks
- [ ] Debounce prüfen/verschärfen
- [ ] transitionLock überall erzwingen
- [ ] Door trigger während Scroll/Cutscene verhindern

## Acceptance Criteria
- [ ] 20× A-Spam an Door: genau 1 Cutscene, genau 1 Modewechsel
- [ ] Keine Softlocks

## Test Evidence
- [ ] Clip: A-Spam Test

──────────────────────────────────────────────────────────────────────────────

## 10) Final door gating (unlock only after 8 dungeon clears)
Labels: type:feature, prio:P1-high, area:hub
Dependencies: #16, #23-30

### Body
## Goal
Final door ist erst betretbar, wenn alle 8 Dungeons cleared sind.

## Tasks
- [ ] Flag-Check zentralisieren
- [ ] Feedback bei gesperrter Final Door (Hint)

## Acceptance Criteria
- [ ] Final door blockt vorher zuverlässig
- [ ] Nach 8 Clears wird Final door verfügbar

## Test Evidence
- [ ] Vorher/Nachher Test mit Debug-Flags

──────────────────────────────────────────────────────────────────────────────

## 11) Savehouse interaction (save + heal + feedback)
Labels: type:feature, prio:P1-high, area:save
Dependencies: #6

### Body
## Goal
Savehouse speichert und heilt, mit klarer Rückmeldung.

## Tasks
- [ ] NPC Interact → save + heal
- [ ] Hint/SFX Feedback
- [ ] Continue lädt konsistent

## Acceptance Criteria
- [ ] Save setzt persistente Daten
- [ ] Continue lädt diese Daten korrekt
- [ ] Spieler bekommt klares Feedback

## Test Evidence
- [ ] Save → Restart → Continue → State stimmt

──────────────────────────────────────────────────────────────────────────────

## 12) Audit: global handlers registered once + gated by playMode
Labels: type:tech-debt, prio:P0-blocker, area:cleanup
Dependencies: #1

### Body
## Goal
Keine Handler-Dopplung, keine Mode-Überschneidung.

## Tasks
- [ ] Audit aller controller/button/overlap/update handler
- [ ] Mode-Gates ergänzen
- [ ] Sicherstellen: Registrierung passiert genau einmal

## Acceptance Criteria
- [ ] Stage/Mode-Wechsel vervielfacht keine Effekte
- [ ] Keine „Geisterinputs“ in falschem Mode

## Test Evidence
- [ ] 10× Modewechsel, Verhalten bleibt identisch

──────────────────────────────────────────────────────────────────────────────

## 13) Harden mode cleanup (sprites + timers + intervals)
Labels: type:bug, prio:P0-blocker, area:cleanup
Dependencies: #12

### Body
## Goal
Jeder PlayMode räumt deterministisch alles auf.

## Tasks
- [ ] Owned sprite kinds pro Mode definieren
- [ ] Owned interval/timer handles tracken
- [ ] Cleanup stoppt alles (inkl. camera, parallax layers)

## Acceptance Criteria
- [ ] 20× Hub↔Dungeon ohne Sprite/Timer Leak
- [ ] Performance degradiert nicht

## Test Evidence
- [ ] Soak test 10 min: stable sprite count

──────────────────────────────────────────────────────────────────────────────

## 14) Tools system: per-mode enable/disable + safe no-op
Labels: type:feature, prio:P1-high, area:ui
Dependencies: #13

### Body
## Goal
Tools crashen nie, auch wenn sie in einem Mode deaktiviert sind.

## Tasks
- [ ] canUse(tool, playMode) implementieren
- [ ] HUD zeigt disabled state
- [ ] Tool input in jedem Mode getestet

## Acceptance Criteria
- [ ] Tool press kann nie crashen
- [ ] UX zeigt verständlich enabled/disabled

## Test Evidence
- [ ] Test: Tool in jedem Mode drücken (kurzer Clip ok)

──────────────────────────────────────────────────────────────────────────────

## 15) HUD consistency across all modes (no duplicates)
Labels: type:feature, prio:P1-high, area:ui
Dependencies: #13

### Body
## Goal
HUD bleibt stabil: hearts/energy/tool/hints korrekt in Hub & Dungeons.

## Tasks
- [ ] HUD-State pro Mode sauber setzen
- [ ] Kein doppeltes HUD nach Modewechsel
- [ ] Hint system konsistent

## Acceptance Criteria
- [ ] Kein HUD-Flackern/Doppeln
- [ ] HUD zeigt richtige Werte pro Mode

## Test Evidence
- [ ] Golden path: HUD bleibt korrekt

──────────────────────────────────────────────────────────────────────────────

## 16) Dungeon registry validation (9 specs consistent)
Labels: type:tech-debt, prio:P1-high, area:dungeons
Dependencies: #1

### Body
## Goal
Alle 9 DungeonSpecs sind vollständig, konsistent, ohne missing IDs.

## Tasks
- [ ] Check: 9 dungeons vorhanden
- [ ] Check: introCutsceneId gesetzt
- [ ] Check: stages[] pro dungeon vollständig (v1.0: 4 stages; final ggf. 5)
- [ ] Check: rewards/flags eindeutig

## Acceptance Criteria
- [ ] Kein missing stage ID
- [ ] Kein Null-Ref bei Entry/Exit

## Test Evidence
- [ ] Script/Manual audit checklist ausgefüllt

──────────────────────────────────────────────────────────────────────────────

## 17) Mode: Platform v1.0 complete (for DUN 7 & 8)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #13, #16

### Body
## Goal
Platform mode ist „Goldstandard“: 4 Stages, Win/Lose, caps, i-frames.

## Tasks
- [ ] Stage loop 0→1→2→3
- [ ] Win: goal tile, Lose: respawn
- [ ] hazards + enemy cap + i-frames
- [ ] ladders (für Donkey Tower) falls benötigt

## Acceptance Criteria
- [ ] Dungeon 7 & 8 vollständig spielbar
- [ ] Kein Softlock beim Respawn/Stage change

## Test Evidence
- [ ] 2 komplette Runs (D7, D8)

──────────────────────────────────────────────────────────────────────────────

## 18) Mode: Asteroids v1.0 complete (DUN 6)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #13, #16

### Body
## Goal
Asteroids: wrap, split depth limit, debris cap, stable performance, 4 stages.

## Tasks
- [ ] Wrap stabil
- [ ] Split depth limit (max 2 oder 3)
- [ ] Debris cap + projectile lifespan
- [ ] Stage objectives (survive/parts)

## Acceptance Criteria
- [ ] 4 stages clearbar
- [ ] Kein unendlicher split
- [ ] Performance stabil 10 min

## Test Evidence
- [ ] 1 kompletter Run Dungeon 6

──────────────────────────────────────────────────────────────────────────────

## 19) Mode: Shooter v1.0 complete (DUN 2)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #13, #16

### Body
## Goal
Shooter: waves, core HP stage, bullet/enemy caps, kinderfreundliches feedback.

## Tasks
- [ ] waves per stage
- [ ] core stage: HP + visual feedback
- [ ] bullet cap + auto-destroy
- [ ] enemy cap

## Acceptance Criteria
- [ ] 4 stages clearbar
- [ ] Kein bullet leak
- [ ] Schwierigkeit fair

## Test Evidence
- [ ] 1 kompletter Run Dungeon 2

──────────────────────────────────────────────────────────────────────────────

## 20) Mode: Rhythm v1.0 complete (DUN 4)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #13, #15, #16

### Body
## Goal
Rhythm: BPM robust, timing window UI, streak/miss rules, 4 stages.

## Tasks
- [ ] BPM + window logic
- [ ] UI indicator (placeholder ok)
- [ ] stage goals: streak targets
- [ ] fail/respawn fast

## Acceptance Criteria
- [ ] Verständlich ohne Textwüste
- [ ] Keine Softlocks
- [ ] 4 stages clearbar

## Test Evidence
- [ ] Playtest 5 min: rhythm loop verständlich

──────────────────────────────────────────────────────────────────────────────

## 21) Mode: Puzzle v1.0 complete (DUN 1/3/5)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #13, #16

### Body
## Goal
Puzzle: switches/gates/tokens/blocks event-basiert, deterministisch, 3 Dungeons möglich.

## Tasks
- [ ] Switch/Gate system stabil
- [ ] Token targets
- [ ] Block push (für Warehouse)
- [ ] Pong-like reflect puzzle (für School court)

## Acceptance Criteria
- [ ] Dungeons 1/3/5 spielbar (je 4 stages)
- [ ] Keine frame-glitches / random behavior

## Test Evidence
- [ ] 1 run pro Puzzle-Dungeon (kurz ok)

──────────────────────────────────────────────────────────────────────────────

## 22) Mode: Meta v1.0 complete (DUN 9)
Labels: type:feature, prio:P0-blocker, area:modes
Dependencies: #17-21, #13, #16

### Body
## Goal
Final meta dungeon: micro-stages (15–20s) orchestrieren + hard cleanup between.

## Tasks
- [ ] micro-stage sequencer
- [ ] hard cleanup after each micro
- [ ] final stabilize stage
- [ ] sets completion flags

## Acceptance Criteria
- [ ] Kein mode bleed
- [ ] Kein leak
- [ ] Finale beendet Spiel sauber

## Test Evidence
- [ ] 1 kompletter Run Dungeon 9

──────────────────────────────────────────────────────────────────────────────

## 23–31) Content: Each dungeon stage set (design + tilemaps + objectives)
Diese Issues sind pro Dungeon identisch aufgebaut, nur Dungeon-ID/Theme anders.

### 23) Dungeon 1 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #21, #6, #8

Body:
- [ ] Stage 0–3 tilemaps
- [ ] objectives per stage
- [ ] tokens/switches/gates
- [ ] return spawn tag works
Acceptance: full clear + return

### 24) Dungeon 2 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #19

### 25) Dungeon 3 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #21

### 26) Dungeon 4 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #20

### 27) Dungeon 5 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #21

### 28) Dungeon 6 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #18

### 29) Dungeon 7 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #17

### 30) Dungeon 8 content (4 stages)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #17

### 31) Dungeon 9 content (micro stages + finale)
Labels: type:content, prio:P1-high, area:dungeons
Dependencies: #22

──────────────────────────────────────────────────────────────────────────────

## 32) Asset pipeline freeze (naming + factories only)
Labels: type:tech-debt, prio:P1-high, area:assets
Dependencies: #4

### Body
## Goal
Assets werden nur über Factories referenziert; Namen bleiben stabil.

## Tasks
- [ ] Naming-Konvention in docs
- [ ] Audit: keine raw asset refs in modes
- [ ] factory layer vollständig

## Acceptance Criteria
- [ ] Asset Austausch ohne Mode-Code Änderungen möglich

## Test Evidence
- [ ] 1 Asset ersetzt, ohne Mode-Datei zu ändern

──────────────────────────────────────────────────────────────────────────────

## 33) Import Overworld tileset subset (Top-down 16x16)
Labels: type:assets, prio:P1-high, area:assets
Dependencies: #32, #6

### Body
## Goal
Overworld Look ist in MakeCode drin (Subset), Tilemaps funktionieren, collisions korrekt.

## Tasks
- [ ] Subset importieren
- [ ] Palette check (2–3 tiles first)
- [ ] tilemap update + walls

## Acceptance Criteria
- [ ] Overworld/Hubs lesbar und stabil

## Test Evidence
- [ ] Screens/clip: Overworld tiles in use

──────────────────────────────────────────────────────────────────────────────

## 34) Import Neon City base + neon props overlays
Labels: type:assets, prio:P1-high, area:assets
Dependencies: #33, #6

### Body
## Goal
Hub fühlt sich wie Neon City an, ohne Marker/Doors zu zerstören.

## Tasks
- [ ] City base subset import
- [ ] neon signs/props subset import
- [ ] hub tilemaps refresh

## Acceptance Criteria
- [ ] Hub erkennt man sofort als Neon City
- [ ] Türen/Spawns bleiben eindeutig

## Test Evidence
- [ ] Hub walkthrough clip

──────────────────────────────────────────────────────────────────────────────

## 35) Import interiors + dungeon base tiles subset
Labels: type:assets, prio:P1-high, area:assets
Dependencies: #32, #21

### Body
## Goal
Interiors und Dungeon-Basis sind drin, Puzzle-/Interior-Räume wirken stimmig.

## Tasks
- [ ] interior subset import
- [ ] dungeon base subset import
- [ ] update puzzle tilemaps

## Acceptance Criteria
- [ ] Interiors und Dungeons unterscheiden sich klar
- [ ] Palette ok

## Test Evidence
- [ ] 2–3 interior rooms + 1 dungeon room screenshot

──────────────────────────────────────────────────────────────────────────────

## 36) Animation pass (critical animations only)
Labels: type:assets, prio:P2-medium, area:assets
Dependencies: #17-21, #32

### Body
## Goal
Wichtigste Animationen erhöhen Lesbarkeit, ohne Bugs.

## Tasks
- [ ] player idle/walk topdown
- [ ] 1–2 enemy anims
- [ ] hit/collect FX

## Acceptance Criteria
- [ ] Animationen laufen nur im passenden Mode
- [ ] keine handler duplication

## Test Evidence
- [ ] 20s clip: walk + hit FX

──────────────────────────────────────────────────────────────────────────────

## 37) Sound pass (SFX first, then minimal BGM)
Labels: type:assets, prio:P2-medium, area:assets
Dependencies: #9, #17-21

### Body
## Goal
SFX unterstützt Feedback; BGM minimal, nicht nervig.

## Tasks
- [ ] door/collect/hit/win/lose sfx
- [ ] 1 hub bgm
- [ ] 1–2 dungeon bgm

## Acceptance Criteria
- [ ] keine sound spam
- [ ] feedback fühlt sich „knackig“ an

## Test Evidence
- [ ] 30s clip mit SFX/BGM

──────────────────────────────────────────────────────────────────────────────

## 38) Create TESTING.md (Golden Path + Expected Results)
Labels: type:docs, prio:P1-high, area:qa
Dependencies: #7, #9, #11

### Body
## Goal
Jeder kann reproduzierbar testen.

## Tasks
- [ ] Golden Path Schrittfolge
- [ ] Expected Results je Schritt
- [ ] Debug overlay notes

## Acceptance Criteria
- [ ] 1 Person (nicht Autor) kann Tests ausführen

## Test Evidence
- [ ] kurzer Kommentar: “test run ok”

──────────────────────────────────────────────────────────────────────────────

## 39) Soak test 20 minutes + leak check
Labels: type:qa, prio:P1-high, area:qa
Dependencies: #13, #38

### Body
## Goal
Keine progressive Verlangsamung, keine Leaks.

## Tasks
- [ ] 20 min run: alle modes
- [ ] 3× save/load
- [ ] spritecount beobachten
- [ ] Bugs als Sub-Issues erfassen

## Acceptance Criteria
- [ ] spritecount stabil
- [ ] keine perf degradation

## Test Evidence
- [ ] Notiz: run duration, observations

──────────────────────────────────────────────────────────────────────────────

## 40) Softlock matrix test (transitions/cutscenes/menu/respawn)
Labels: type:qa, prio:P1-high, area:qa
Dependencies: #9, #13, #38

### Body
## Goal
Kein bekannter Softlock.

## Tasks
- [ ] Liste 10–15 edge cases
- [ ] testen + fixen
- [ ] re-test

## Acceptance Criteria
- [ ] keine reproduzierbaren softlocks

## Test Evidence
- [ ] edge-case checklist abgehakt

──────────────────────────────────────────────────────────────────────────────

## 41) Credits & licenses final (CREDITS.md + ASSET_SOURCES.md)
Labels: type:docs, prio:P1-high, area:release
Dependencies: #33-35

### Body
## Goal
Lizenzsauberer Release.

## Tasks
- [ ] credits eintragen (CC-BY / credit-required)
- [ ] Quellen-Links prüfen
- [ ] in-game credits (optional v1.0)

## Acceptance Criteria
- [ ] alle verwendeten packs korrekt attribuiert

## Test Evidence
- [ ] PR review: credits ok

──────────────────────────────────────────────────────────────────────────────

## 42) Release: debug features behind flag / hidden
Labels: type:release, prio:P1-high, area:release
Dependencies: #39, #40

### Body
## Goal
Release fühlt sich nicht wie Debug an.

## Tasks
- [ ] DEBUG flag
- [ ] warp/overlay nur bei debug

## Acceptance Criteria
- [ ] release build ohne debug clutter

## Test Evidence
- [ ] release run screenshot

──────────────────────────────────────────────────────────────────────────────

## 43) Release: versioning + changelog + tag v1.0.0
Labels: type:release, prio:P1-high, area:release
Dependencies: #42, #41

### Body
## Goal
Reproduzierbarer Release-Stand.

## Tasks
- [ ] CHANGELOG.md
- [ ] tag v1.0.0
- [ ] release notes

## Acceptance Criteria
- [ ] tag existiert, notes vorhanden

## Test Evidence
- [ ] link / screenshot release page

──────────────────────────────────────────────────────────────────────────────

## 44) MakeCode publish + smoke test on fresh browser
Labels: type:release, prio:P1-high, area:release
Dependencies: #43

### Body
## Goal
Share-Link läuft stabil auf fremdem Browser.

## Tasks
- [ ] publish
- [ ] open on clean browser/device
- [ ] quick smoke: start → hub → 1 dungeon → return → save/load

## Acceptance Criteria
- [ ] link funktioniert, keine regressions

## Test Evidence
- [ ] link + notes
