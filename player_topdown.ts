// Top-Down Player for Hub: movement + interact

// Hub player is controlled via controller.moveSprite in game_controller.ts
// This file handles additional hub-specific logic

export function initHubPlayer(player: Sprite) {
    // Set collision detection
    player.setFlag(SpriteFlag.Ghost, false)
    
    // Camera follow
    scene.cameraFollowSprite(player)
}

// Collision with walls
scene.onHitWall(SpriteKind.Player, (sprite, location) => {
    if (state.playMode !== PlayMode.HUB_TOPDOWN) return
    // Blocked by wall, no action needed (controller.moveSprite handles it)
})

// MANUAL TEST PASSED: Hub player movement basic
