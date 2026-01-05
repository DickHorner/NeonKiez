scene.setBackgroundColor(9);
game.splash("BOOT_OK");

// Bootstrap: minimal startup, delegates to GameController

// Import references
/// <reference path="constants.ts" />
/// <reference path="state.ts" />
/// <reference path="save.ts" />
/// <reference path="assets_stub.ts" />
/// <reference path="dialogue.ts" />
/// <reference path="ui_hud.ts" />
/// <reference path="ui_menu.ts" />
/// <reference path="tools.ts" />
/// <reference path="quests.ts" />
/// <reference path="world_hub.ts" />
/// <reference path="world_dungeons.ts" />
/// <reference path="debug.ts" />
/// <reference path="player_topdown.ts" />
/// <reference path="player_modes.ts" />
/// <reference path="game_controller.ts" />

// Start game
GameController.start();
