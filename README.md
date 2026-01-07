# Neon-Kiez

Story-driven retro game for **MakeCode Arcade (TypeScript)**

## Overview

- **Hub World**: Top-down Zelda-style exploration with room-to-room scrolling
- **9 Dungeons**: Each with unique PlayMode (Platform, Shooter, Asteroids, Rhythm, Puzzle, Meta)
- **Target Audience**: 10 years old (kid-friendly, no gore)

## Architecture

### Core Files
- `main.ts` - Bootstrap
- `constants.ts` - All IDs, enums, tuning, dungeon specs
- `state.ts` - Global game state
- `save.ts` - Persistence
- `game_controller.ts` - Mode switching, cleanup, transitions

### Player & Modes
- `player_topdown.ts` - Hub top-down player
- `player_modes.ts` - Dungeon mode-specific inputs

### World & Content
- `world_hub.ts` - Hub room grid, NPCs, doors, savehouse
- `world_dungeons.ts` - Dungeon registry helpers
- `quests.ts` - Quest system

### UI & Tools
- `ui_hud.ts` - Hearts, energy, tool display
- `ui_menu.ts` - Pause, inventory, quest log
- `tools.ts` - FreezeCam, Confetti, Soap, Decoy, Tagger
- `dialogue.ts` - Cutscenes and dialog (placeholder texts)

### Assets
- `assets_stub.ts` - Placeholder factories (humans will replace)

### Debug
- `debug.ts` - Warp, godmode, overlay

## Extensions Used

- `microsoft/arcade-background-scroll` - Parallax backgrounds
- `riknoll/arcade-overworld` - Hub room-grid with scrolling transitions
- `microsoft/arcade-storytelling` - Cutscenes and dialogs
- `riknoll/arcade-mini-menu` - Menus

## Dungeon Catalog

1. **Laundromat Labyrinth** (Puzzle/Maze) - Unlock: Tagger
2. **Rooftop Invaders** (Shooter) - Unlock: Confetti Bomb
3. **Warehouse Blockworks** (Puzzle/Blocks) - Unlock: Soap Slide
4. **Subway Timing** (Rhythm) - Unlock: FreezeCam
5. **School Pong Court** (Puzzle/Pong) - Unlock: Dash upgrade
6. **Arcade Museum Asteroids** (Asteroids) - Unlock: Magnet Glove
7. **Video Store Platform** (Platformer) - Unlock: Double Jump
8. **Construction Donkey Tower** (Platform/Ladders) - Unlock: Decoy Toy
9. **Final Glitch Panopticon** (Meta) - Unlock: Free Roam+

## Placeholder Content

All texts, sprites, tilemaps, and sounds are **placeholders** with ID-based naming:
- Texts: `[CUT_DUN_01_ENTRY_BEAT_...]`, `[DIALOG_NPC_...]`
- Assets: `SPR_*`, `TM_*`, `SFX_*`, `BGM_*`

## Implementation Status

### Completed (Scaffold)
- ✅ File structure
- ✅ Constants and dungeon specs
- ✅ GameController with mode switching
- ✅ State management
- ✅ Save/Load system
- ✅ HUD system
- ✅ Player mode inputs (scaffold)
- ✅ Hub world structure
- ✅ Dungeon entry/exit flow
- ✅ Tools system
- ✅ Debug helpers

### Next Steps
1. Implement Platform Mode (Dungeon 7) fully playable
2. Implement Asteroids Mode (Dungeon 6) fully playable
3. Add hub room scrolling transitions
4. Populate hub with real tilemaps
5. Complete remaining dungeon modes
6. Polish and testing

## Development Notes

- **Stability**: Caps on spawns, auto-destroy, cleanup on mode switch
- **Event Handlers**: Registered once, check `state.playMode` at start
- **Debouncing**: Interact/overlap cooldowns enforced
- **Kinderfreundlich**: No blood, no gore - enemies "go out", "dance", "freeze"

## Testing

Run in MakeCode Arcade simulator:
1. Title screen → New Game
2. Hub center room with doors
3. Interact with door → cutscene → immediate mode switch
4. Play dungeon stages
5. Complete dungeon → return to hub with rewards

## License

MIT License. 
