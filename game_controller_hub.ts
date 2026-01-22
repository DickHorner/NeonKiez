// GameController Hub: Hub mode setup and interactions
// NOTE: Focused module for Hub-specific logic, part of GameController namespace

namespace GameController {
  export namespace HubMode {
    export function setup(payload: any) {
      // Update hub room if specified
      if (payload && payload.hubRoom) {
        state.hubRoom = payload.hubRoom;
      }

      // Handle spawn tag
      if (payload && payload.spawnTag && HUB_SPAWN_POINTS[payload.spawnTag]) {
        const spawnPoint = HUB_SPAWN_POINTS[payload.spawnTag];
        state.hubRoom = spawnPoint.room;
      }

      // Load hub room
      const roomId = HUB_ROOM_IDS[state.hubRoom.row][state.hubRoom.col];
      const tm = getTilemapByID(roomId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      // Spawn player
      const playerSprite = sprites.create(imgPlayerTopdown(), KIND_PLAYER);

      // Find spawn point
      if (payload && payload.spawnTag && HUB_SPAWN_POINTS[payload.spawnTag]) {
        const spawnPoint = HUB_SPAWN_POINTS[payload.spawnTag];
        playerSprite.setPosition(spawnPoint.x, spawnPoint.y);
      } else {
        playerSprite.setPosition(80, 60);
      }

      // Set up hub player controller
      controller.moveSprite(
        playerSprite,
        PLAYER_TOPDOWN_SPEED,
        PLAYER_TOPDOWN_SPEED,
      );
      scene.cameraFollowSprite(playerSprite);

      // Parallax (placeholder layers)
      scroller.scrollBackgroundWithSpeed(-10, 0, scroller.BackgroundLayer.Layer0);

      // Spawn NPCs, doors
      spawnHubContent(state.hubRoom.row, state.hubRoom.col);

      setPlayerSprite(playerSprite);
    }

    export function handleInteract() {
      if (state.playMode !== PlayMode.HUB_TOPDOWN) return;
      if (!canInteract()) return;

      const playerSprite = getPlayerSprite();
      if (!playerSprite) return;

      // Check for nearby interactables (doors, NPCs)
      const nearby = sprites.allOfKind(KIND_DOOR)
        .concat(sprites.allOfKind(KIND_NPC));
      for (const s of nearby) {
        if (
          Math.abs(playerSprite.x - s.x) < INTERACT_DISTANCE &&
          Math.abs(playerSprite.y - s.y) < INTERACT_DISTANCE
        ) {
          markInteract();
          handleInteractable(s);
          return;
        }
      }
    }

    function handleInteractable(s: Sprite) {
      if ((s as any).isDoor) {
        // Enter dungeon
        const dungeonId = (s as any).dungeonId as string;
        if (dungeonId) GameController.enterDungeon(dungeonId);
      } else if ((s as any).isNPC) {
        // Talk to NPC
        const dialogId = (s as any).dialogId as string;
        if (dialogId) showDialog(dialogId);
      }
    }
  }
}



