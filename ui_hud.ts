// UI HUD: hearts, energy, tool, hint
// DECISION: Using standard Sprites with text images instead of story.TextSprite
// because story.TextSprite lacks setFlag(), positioning props (right/bottom), and font control

let hudHearts: Sprite = null;
let hudEnergy: Sprite = null;
let hudTool: Sprite = null;
let hudHint: Sprite = null;

function createTextImage(text: string, color: number): Image {
  const font = image.getFontForText(text);
  const w = Math.max(1, font.charWidth * text.length);
  const h = font.charHeight;
  const img = image.create(w, h);
  if (text) img.print(text, 0, 0, color);
  return img;
}

function initHUD() {
  // Hearts (top-left)
  hudHearts = sprites.create(createTextImage("♥♥♥", 2), KIND_HUD);
  hudHearts.setFlag(SpriteFlag.RelativeToCamera, true);
  hudHearts.left = 2;
  hudHearts.top = 2;

  // Energy (below hearts)
  hudEnergy = sprites.create(createTextImage("", 7), KIND_HUD);
  hudEnergy.setFlag(SpriteFlag.RelativeToCamera, true);
  hudEnergy.left = 2;
  hudEnergy.top = 12;

  // Tool (top-right)
  hudTool = sprites.create(createTextImage("", 1), KIND_HUD);
  hudTool.setFlag(SpriteFlag.RelativeToCamera, true);
  hudTool.right = scene.screenWidth() - 2;
  hudTool.top = 2;

  // Hint (bottom-left)
  hudHint = sprites.create(createTextImage("", 5), KIND_HUD);
  hudHint.setFlag(SpriteFlag.RelativeToCamera, true);
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
  hudHearts.setImage(createTextImage(heartStr, 2));

  // Energy (if needed)
  // hudEnergy.setImage(createTextImage("E:" + state.energy, 7));

  // Tool
  if (state.currentTool) {
    hudTool.setImage(createTextImage("[" + state.currentTool + "]", 1));
    hudTool.right = scene.screenWidth() - 2; // Maintain right alignment
  } else {
    hudTool.setImage(createTextImage("", 1));
  }
}

function showHint(text: string, durationMs: number = 2000) {
  if (!hudHint) return;
  hudHint.setImage(createTextImage(text, 5));
  hudHint.bottom = scene.screenHeight() - 2; // Maintain bottom alignment

  control.runInParallel(() => {
    pause(durationMs);
    if (hudHint) {
      hudHint.setImage(createTextImage("", 5));
    }
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
