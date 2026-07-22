# Asset Manifest

Tracks curated assets selected from the Kenney bundle and imported into MakeCode Arcade. Source-pack routing remains in [KENNEY_ASSET_MAP.md](KENNEY_ASSET_MAP.md); canonical gameplay IDs remain in [.github/ASSET_REQUIREMENTS.md](../.github/ASSET_REQUIREMENTS.md).

## Imported hub-tile baseline

The six groups below are the approved baseline for hub-room work. Each JRES entry is a registered 16×16 `myTiles` MakeCode Arcade tile; `tests/hub-tile-assets.test.js` validates all 88 imported tiles and their registration in `pxt.json`.

| Group | JRES file | Approved representative | Intended baseline use |
|---|---|---|---|
| Pavement | `hub_tiles_pavement.jres` | `rpgUrbanPavement0036` | Walkable hub floor |
| Road | `hub_tiles_road.jres` | `rpgUrbanRoad0441` | Street/outer boundary surface |
| Savehouse facade | `hub_tiles_savehouse_facade.jres` | `rpgUrbanSavehouseFacade0365` | Savehouse exterior |
| Street props | `hub_tiles_street_props.jres` | `rpgUrbanStreetProps0250` | Non-blocking scene dressing until a room marks it otherwise |
| Vegetation | `hub_tiles_vegetation.jres` | `rpgUrbanVegetation0259` | Decorative green-space edge |
| Door candidates | `hub_tiles_door_candidates.jres` | `rpgUrbanDoorCandidates0283` | Door-tile candidate; gameplay doors remain sprite placeholders |

## Palette baseline

The approved pavement and road representatives are solid palette indices 11 and 12 respectively. The current placeholder player, NPC, and door sprites use indices 7, 8, and 5, so each remains distinguishable on either approved floor. Facade, prop, vegetation, and door-candidate representatives also contain multiple contrasting palette indices and are suitable for the MakeCode tile picker.

No misleading IDs are excluded at this time. The representatives above are approved for use; other IDs in the same six groups remain imported but have not been individually designated as baseline choices.

## Scope boundary

This manifest verifies the import baseline only. Center-room implementation is tracked by #12; additional hub-room work is tracked by #122 and later room-specific issues. Do not add assets or duplicate room implementation work as part of this baseline.

## Placeholder sprites

`imgPlayerTopdown`, `imgNpc`, and `imgDoor` remain code-generated placeholders, not imported Kenney sprite assets. They are intentionally retained until their dedicated sprite-selection work is scheduled.
