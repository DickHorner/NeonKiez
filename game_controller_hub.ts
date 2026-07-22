// GameController Hub: Hub mode setup and interactions
// NOTE: Focused module for Hub-specific logic, part of GameController namespace

namespace GameController {
  export namespace HubMode {
    export function setup(payload: HubModePayload) {
      const spawnPoint = payload && payload.spawnTag
        ? getSpawnPoint(payload.spawnTag)
        : null;

      // Update hub room if specified - validate bounds and shape
      if (payload && payload.hubRoom) {
        state.hubRoom = getSafeHubRoom(payload.hubRoom, "payload.hubRoom");
      }

      // Handle spawn tag - validate spawn point room bounds
      if (spawnPoint) {
        state.hubRoom = spawnPoint.room;
      }

      // Guard room lookup with a safe fallback.
      state.hubRoom = getSafeHubRoom(state.hubRoom, "pre-load");
      const roomId = HUB_ROOM_IDS[state.hubRoom.row][state.hubRoom.col];
      scene.setBackgroundColor(15);
      const tm = roomId === "TM_HUB_11"
        ? tmHub11Playable()
        : getTilemapByID(roomId);
      if (tm) {
        tiles.setCurrentTilemap(tm);
      }

      // Spawn player
      const playerSprite = sprites.create(imgPlayerTopdown(), KIND_PLAYER);

      // Find spawn point
      if (spawnPoint) {
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
      if (state.playMode !== PlayMode.HUB_TOPDOWN) {
        signalFailure(FailureReason.WRONG_PLAY_MODE, "HubMode.handleInteract");
        return;
      }
      if (!canInteract()) {
        signalFailure(FailureReason.INTERACT_COOLDOWN, "HubMode.handleInteract");
        return;
      }

      const playerSprite = getPlayerSprite();
      if (!playerSprite) {
        signalFailure(FailureReason.NO_PLAYER_SPRITE, "HubMode.handleInteract");
        return;
      }

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
      if (readHubSpriteData(s, HUB_SPRITE_DATA_IS_DOOR)) {
        const dungeonId = readHubSpriteData(s, HUB_SPRITE_DATA_DUNGEON_ID) as string;
        if (dungeonId) GameController.enterDungeon(dungeonId);
      } else if (readHubSpriteData(s, HUB_SPRITE_DATA_IS_NPC)) {
        const dialogId = readHubSpriteData(s, HUB_SPRITE_DATA_DIALOG_ID) as string;
        if (dialogId) showDialog(dialogId);
      }
    }
  }
}
