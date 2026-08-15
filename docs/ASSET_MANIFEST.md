# Asset Manifest

Tracks curated assets selected from the Kenney bundle and imported into MakeCode Arcade. Source-pack routing remains in [KENNEY_ASSET_MAP.md](KENNEY_ASSET_MAP.md); canonical gameplay IDs remain in [.github/ASSET_REQUIREMENTS.md](../.github/ASSET_REQUIREMENTS.md).

## Imported hub-tile baseline

The six source groups below remain the 88-tile Kenney hub baseline. `hub_tiles_ready.jres` adds 26 generated, placement-ready composites for MakeCode's single-layer tilemap editor. Each JRES entry is a registered 16×16 `myTiles` MakeCode Arcade tile; `tests/hub-tile-assets.test.js` validates all 114 project tiles and their registration in `pxt.json`.

| Group | JRES file | Approved representative | Intended baseline use |
|---|---|---|---|
| Pavement | `hub_tiles_pavement.jres` | `rpgUrbanPavement0036` | Walkable hub floor |
| Road | `hub_tiles_road.jres` | `rpgUrbanRoad0441` | Street/outer boundary surface |
| Savehouse facade | `hub_tiles_savehouse_facade.jres` | `rpgUrbanSavehouseFacade0365` | Raw savehouse exterior modules |
| Street props | `hub_tiles_street_props.jres` | `rpgUrbanStreetProps0250` | Raw transparent prop overlays |
| Vegetation | `hub_tiles_vegetation.jres` | `rpgUrbanVegetation0259` | Raw transparent vegetation overlays |
| Door candidates | `hub_tiles_door_candidates.jres` | `rpgUrbanDoorCandidates0283` | Door-tile candidate; gameplay doors remain sprite placeholders |
| READY composites | `hub_tiles_ready.jres` | `rpgUrbanReadyStreetProps0250Pavement` | Opaque, one-cell tiles for direct placement in the MakeCode tilemap editor |

## Placement-ready composites

MakeCode Arcade tilemaps store one visible tile per cell. Transparent Kenney prop and awning tiles therefore cannot reveal another tile beneath them when placed directly in the tilemap editor. The READY group flattens the selected overlay against an existing imported base tile so the result is visually complete in one cell.

The generated READY set contains:

- 13 street props on `rpgUrbanPavement0036`;
- 3 road props on `rpgUrbanRoad0441`;
- 5 vegetation tiles on `rpgUrbanPavement0036`;
- 5 storefront/awning composites built from the existing savehouse facade modules.

All 26 READY tiles are intentionally opaque. The raw source overlays remain imported because they preserve the original Kenney artwork and may still be useful outside a single-layer tilemap.

## Palette baseline

The project palette in `pxt.json`, the importer palette, and the Hub runtime palette are the same 16-entry palette. READY composites are quantized only after their source layers are flattened, so transparent source pixels inherit the intended pavement, road, or storefront pixels instead of becoming empty map background.

## Scope boundary

This manifest verifies the import baseline only. Center-room implementation is tracked by #12; additional hub-room work is tracked by #122 and later room-specific issues. Do not add assets or duplicate room implementation work as part of this baseline.

## Placeholder sprites

`imgPlayerTopdown`, `imgNpc`, and `imgDoor` remain code-generated placeholders, not imported Kenney sprite assets. They are intentionally retained until their dedicated sprite-selection work is scheduled.
