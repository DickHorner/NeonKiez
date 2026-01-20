# Dungeon 6: Arcade Museum Asteroids

**Theme:** Museum Storage Zero-G  
**Mode:** DUN_ASTEROIDS  
**Stages:** 4  
**Status:** ✅ Implementation Complete

## Quick Start

### How to Play
1. Navigate to hub room (2,0) - bottom-left room
2. Interact with the Dungeon 6 door
3. Watch intro cutscene
4. Play through 4 stages

### Controls (Asteroids Mode)
- **Left/Right:** Rotate ship
- **Up:** Thrust forward
- **A:** Shoot projectile
- **Menu:** Pause

### Stages Overview

| Stage | Name | Objective | Content |
|-------|------|-----------|---------|
| 0 | THRUST | Learn controls | 3 debris, no splitting |
| 1 | SPLIT | Master splitting | 5 debris, split depth 2 |
| 2 | PARTS_RUSH | Collect parts | 8 debris, collect 10 parts |
| 3 | SURVIVE | Stay alive | 60 seconds, continuous spawn |

## Stage Details

### Stage 0: THRUST Tutorial
- **Goal:** Clear all 3 debris
- **Teaches:** Basic movement and shooting
- **Difficulty:** Easy

### Stage 1: SPLIT Mechanic
- **Goal:** Clear all debris including splits
- **Teaches:** Debris splitting system
- **Mechanic:** Debris split into 2 smaller pieces (max depth 2)
- **Difficulty:** Medium

### Stage 2: PARTS_RUSH
- **Goal:** Collect 10 parts
- **Teaches:** Risk/reward of collection vs survival
- **Mechanic:** Destroyed debris drop collectible parts (8s lifespan)
- **Difficulty:** Medium-Hard

### Stage 3: SURVIVE
- **Goal:** Survive for 60 seconds
- **Teaches:** Evasion and crowd control
- **Mechanic:** Continuous debris spawning every 3 seconds
- **Difficulty:** Hard

## Rewards

Upon completion:
- `FLAG_DUN_06_CLEARED` - Dungeon completion flag
- `FLAG_TRAV_MAGNET_GLOVE` - Traversal tool unlock
- `ITEM_CASSETTE_03` - Collectible item

## Technical Specs

### Gameplay Parameters
- **Max Debris:** 15 (CAP_MAX_DEBRIS)
- **Max Projectiles:** 20 (CAP_MAX_PROJECTILES)
- **Split Depth:** 2
- **Survive Time:** 60 seconds
- **Parts Required:** 10
- **Part Lifespan:** 8 seconds
- **I-Frame Duration:** 1000ms

### Debris Sizes
- Large: 16px
- Medium: 8px
- Small: 4px

### Spawn Mechanics
- Debris spawn at screen edges
- Random velocities (-30 to 30 px/s)
- Screen wrap for all objects
- Continuous spawning in Stage 3 (every 3s)

## Files

### Implementation
- `assets_stub.ts` - Tilemaps and visual assets
- `game_controller.ts` - Core game logic
- `player_modes.ts` - Input and controls
- `constants.ts` - Configuration (dungeon spec)
- `world_hub.ts` - Hub integration

### Documentation
- `DUNGEON_06_IMPLEMENTATION.md` - Technical details
- `DUNGEON_06_TEST_PLAN.md` - Testing guide
- `README_DUNGEON_06.md` - This file

## Testing Status

- ✅ Code complete
- ⏳ Manual testing pending
- ⏳ Performance validation pending

## Known Issues

None currently identified.

## Future Enhancements

Potential improvements:
1. Visual ship rotation
2. Particle effects
3. Sound effects and music
4. Power-ups
5. Boss variant
6. Difficulty scaling

## Dependencies

Issue Dependencies:
- DickHorner/NeonKiez#18 - Prerequisites
- DickHorner/NeonKiez#6 - Game controller
- DickHorner/NeonKiez#8 - Player modes

## Support

For issues or questions:
1. Check DUNGEON_06_TEST_PLAN.md
2. Review DUNGEON_06_IMPLEMENTATION.md
3. Create issue on GitHub

---

**Last Updated:** 2026-01-20  
**Version:** 1.0  
**Status:** Ready for Testing
