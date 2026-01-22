// UI HUD: hearts, energy, tool, hint
// NOTE: Relies on Arcade globals and story.TextSprite from arcade-storytelling

let hudHearts: story.TextSprite = null;
let hudEnergy: story.TextSprite = null;
let hudTool: story.TextSprite = null;
let hudHint: story.TextSprite = null;

function initHUD() {
  hudHearts = new story.TextSprite(0);
  hudHearts.setFlag(SpriteFlag.RelativeToCamera, true);
  hudHearts.left = 2;
  hudHearts.top = 2;

  hudEnergy = new story.TextSprite(0);
  hudEnergy.setFlag(SpriteFlag.RelativeToCamera, true);
  hudEnergy.left = 2;
  hudEnergy.top = 12;

  hudTool = new story.TextSprite(0);
  hudTool.setFlag(SpriteFlag.RelativeToCamera, true);
  hudTool.right = scene.screenWidth() - 2;
  hudTool.top = 2;

  hudHint = new story.TextSprite(0);
  hudHint.setFlag(SpriteFlag.RelativeToCamera, true);
  hudHint.setMaxFontHeight(7);
  hudHint.left = 2;
  hudHint.bottom = scene.screenHeight() - 2;
}

function updateHUD() {
  if (!hudHearts) return;

  // Hearts
  let heartStr = "";
  for (let i = 0; i < state.hearts; i++) {
    heartStr += "♥";
  }
  hudHearts.setText(heartStr);

  // Energy (if needed)
  // hudEnergy.setText("E:" + state.energy)

  // Tool
  if (state.currentTool) {
    hudTool.setText("[" + state.currentTool + "]");
  } else {
    hudTool.setText("");
  }
}

function showHint(text: string, durationMs: number = 2000) {
  if (!hudHint) return;
  hudHint.setText(text);

  control.runInParallel(() => {
    pause(durationMs);
    if (hudHint) hudHint.setText("");
  });
}

function hideHUD() {
  if (hudHearts) hudHearts.setFlag(SpriteFlag.Invisible, true);
  if (hudEnergy) hudEnergy.setFlag(SpriteFlag.Invisible, true);
  if (hudTool) hudTool.setFlag(SpriteFlag.Invisible, true);
  if (hudHint) hudHint.setFlag(SpriteFlag.Invisible, true);
}

function showHUD() {
  if (hudHearts) hudHearts.setFlag(SpriteFlag.Invisible, false);
  if (hudEnergy) hudEnergy.setFlag(SpriteFlag.Invisible, false);
  if (hudTool) hudTool.setFlag(SpriteFlag.Invisible, false);
  if (hudHint) hudHint.setFlag(SpriteFlag.Invisible, false);
}
