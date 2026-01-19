# ASSET_SOURCES.md
*(Top-down / orthogonal – strikt MakeCode Arcade-tauglich gedacht)*

## 0) MakeCode Arcade – harte Grenzen (damit Ihr Euch nicht ins Knie schießt)
- **Tilegröße:** Plant **16×16** als Standard (passt perfekt zu Arcade-Tilemaps).
- **Farben:** Arcade hat eine **feste 16-Farben-Palette** (15 Farben + Transparenz). Viele Packs werden beim Import **automatisch “umgefärbt”** → vorher **1–2 Test-Tiles** importieren und checken, ob’s noch gut aussieht.
- **Speicher/Umfang:** Importiert **nicht** “das ganze Pack”, sondern **nur die Tiles/Props, die Ihr wirklich braucht** (sonst wird das Projekt fett und unübersichtlich).
- **Keine externen Runtime-Loader:** Alles muss als Arcade-Assets (Tiles/Sprites/Images) im Projekt landen.

---

## 1) Base-Packs (VERIFIED)
**Ziel:** 1–2 City-Sets + 1–2 Interior/Dungeon-Sets, alles top-down und 16×16, möglichst frei nutzbar.

| Perspective | Tile size | License | Verified quote | Use in dungeon(s) |
|---|---:|---|---|---|
| Top-down (orthogonal) | 16×16 | **CC0** | “Tile size 16 × 16 … License Creative Commons CC0” | `HUB_NEON_CITY_STREETS`, `HUB_CITY_BLOCKS`, `D##_TOPDOWN_CITY_VARIANTS` |
| Top-down (orthogonal) | 16×16 | Custom permissive (free / name-your-price; no resell/redistribute) | “16x16 tileset … FREE: Exterior Tileset … LICENSE: … used in any commercial or non-commercial project … can't be resold or redistributed” | `HUB_NEON_CITY_CORE (FREE subset)`, `D##_NEON_EXTERIOR_ROOMS (FREE subset)` *(Interior nur FULL)* |
| Top-down (orthogonal) | 16×16 | **CC0** | “A complete set of 16x16 Roguelike/RPG tiles … Also includes UI elements” | `D##_TOPDOWN_INTERIOR_ROOMS`, `D##_TOPDOWN_DUNGEON_HALLS`, `HUB_INTERIORS_BASIC` |
| 3/4-top-down (funktioniert als “leicht schräg”) | 16×16 *(laut Titel/Pack-Fokus)* | **CC-BY 3.0** | “Lovely tileset perfectly fitted for 3/4 top down games … Should mention my itch.io page or opengameart page” | `HUB_INTERIORS_SHOPS`, `HUB_INTERIORS_APARTMENTS`, `D##_TOPDOWN_INTERIOR_SETPIECES` |
| Top-down (orthogonal) | 16×16 | **CC0** | “16x16 base Dungeon Tileset … All of the sprites are made in 16x16 canvas.” | `D##_TOPDOWN_DUNGEON_BASE`, `D##_TRAPS_ROOMS`, `D##_KEY_LOCK_ROOMS` |

### Quellen (Base-Packs)
- Kenney **RPG Urban Pack** (CC0): https://www.kenney.nl/assets/rpg-urban-pack  
- **Neo Zero – Cyberpunk City Top-Down Tileset**: https://yaninyunus.itch.io/neo-zero-cyberpunk-city-tileset  
- Kenney **Roguelike/RPG pack** (CC0): https://www.kenney.nl/assets/roguelike-rpg-pack  *(oder OGA-Mirror: https://opengameart.org/content/roguelikerpg-pack-1700-tiles)*  
- **[16x16] Indoor RPG Tileset** (CC-BY 3.0): https://opengameart.org/content/16x16-indoor-rpg-tileset  
- **16x16 Puny Dungeon Tileset** (CC0): https://opengameart.org/content/16x16-puny-dungeon-tileset  

---

## 2) Neon-Overlays/Props (VERIFIED)
**Ziel:** Neon-Schilder, Glow-Props, Tech-Deko, die Ihr über City/Interior legen könnt (Arcade-friendly).

| Perspective | Tile size | License | Verified quote | Use in dungeon(s) |
|---|---:|---|---|---|
| Top-down (Tags: Top-Down) | 16×16 *(Titel)* | Free w/ credit (kommerziell ok; **Credit Pflicht**) | “Art can be used for anything as long as you credit the artist!” | `HUB_NEON_SIGNAGE_LAYER`, `D##_NEON_OVERLAYS`, `D##_ARCADE_SIGNPOSTS` |
| UI / Icons | 16×16 | **CC0** | “Format: PNG … License: CC0 (free for commercial use)” | `HUD_ICONS`, `INVENTORY_ICONS`, `SHOP_UI_PLACEHOLDERS` |

### Quellen (Neon/Props)
- **Clavs – 16×16 NeonTileSet TopDown/Platformer**: https://clavs.itch.io/16x16neon-tileset  
- **Kettoman – Pixel Art Icons (RPG Essentials) 16×16** (CC0): https://kettoman.itch.io/pixel-art-icons-rpg-essentials-16x16  

---

## 3) Tileset für die Oberwelt (VERIFIED)
**Ziel:** klassisches “Zelda-Gefühl” für draußen (Wiesen/Wege/Wasser/Bäume), 16×16, leichtgewichtig.

| Perspective | Tile size | License | Verified quote | Use in dungeon(s) |
|---|---:|---|---|---|
| Top-down (overworld) | 16×16 | **CC0** | “16x16 base Overworld Tileset … All of the sprites are made in 16x16 canvas … LICENSE (CC0)” | `OVERWORLD_OUTSKIRTS`, `OVERWORLD_PATHS`, `OVERWORLD_RIVERS`, `OVERWORLD_POIS` |

### Quelle (Oberwelt)
- **16x16 Puny World Tileset** (CC0): https://opengameart.org/content/16x16-puny-world-tileset  

---

## 4) Mini-Checkliste: “MakeCode-import-sicher” (praktisch, nicht theoretisch)
1. **Pro Pack zuerst 3 Test-Imports**: 1 Boden-Tile, 1 Wand/Edge, 1 Neon-Sign → schauen, ob Palette-Mapping OK ist.
2. **Dann “Subset bauen”**: nur die Tiles, die Ihr für *diesen* Abschnitt braucht (Hub / Dungeon / Overworld).
3. **Tiles benennen** (Arcade-Asset-Namen): `t_overworld_grass_01`, `t_city_road_turn`, `t_neon_sign_kanji_01` …
4. **Attribution sauber halten**:
   - CC0: optional.
   - CC-BY: Credit in `CREDITS.md` + im Spiel-Credits-Screen.
   - “Free w/ credit”: Credit **zwingend**.

> Tipp: Für Euer Projekt ist das sauberste Setup:  
> **Overworld = Puny World (CC0)**, **Hub = Kenney Urban (CC0) + Neon Signs Overlay (Credit)**, **Top-down Dungeon-Basis = Puny Dungeon (CC0)**, Interiors = Kenney Roguelike (CC0) + Indoor RPG (CC-BY) für Setpieces.
