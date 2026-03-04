// Transition Safety Regression Tests
// Tests for transitionLock, cleanup invariants, and mode-switch idempotency

const fs = require('fs');
const path = require('path');

// Test framework (minimal assertion library)
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n=== Transition Safety Tests ===\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
      }
    }

    console.log(`\n${this.passed} passed, ${this.failed} failed\n`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// Helper to extract a function body by counting braces
function extractFunctionBody(code, functionSignature) {
  const startMatch = code.match(new RegExp(functionSignature + '\\s*\\{'));
  if (!startMatch) return null;

  const startIndex = code.indexOf('{', startMatch.index);
  let braceCount = 1;
  let i = startIndex + 1;

  while (i < code.length && braceCount > 0) {
    if (code[i] === '{') braceCount++;
    else if (code[i] === '}') braceCount--;
    i++;
  }

  return code.substring(startIndex + 1, i - 1);
}

// Read and parse the game_controller.ts file to verify transition safety contracts
function readGameController() {
  const filePath = path.join(__dirname, '..', 'game_controller.ts');
  return fs.readFileSync(filePath, 'utf8');
}

const runner = new TestRunner();

// Test 1: Verify transitionLock guard exists in switchPlayMode
runner.test('switchPlayMode has transitionLock guard at entry', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  // Verify early return guard exists
  const hasGuard = /if\s*\(\s*state\.transitionLock\s*\)\s*return\s*;/.test(functionBody);
  assert(hasGuard, 'switchPlayMode missing transitionLock guard (if (state.transitionLock) return;)');

  // Verify guard is at the start (before lock is set)
  const guardIndex = functionBody.search(/if\s*\(\s*state\.transitionLock\s*\)\s*return\s*;/);
  const lockSetIndex = functionBody.search(/state\.transitionLock\s*=\s*true/);

  assert(lockSetIndex > -1, 'switchPlayMode must set transitionLock = true');
  assert(guardIndex < lockSetIndex, 'transitionLock guard must come before setting lock');
});

// Test 2: Verify transitionLock is set and cleared properly
runner.test('switchPlayMode sets and clears transitionLock', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  // Verify lock is set to true
  const setsLock = /state\.transitionLock\s*=\s*true/.test(functionBody);
  assert(setsLock, 'switchPlayMode must set transitionLock = true');

  // Verify lock is cleared to false
  const clearsLock = /state\.transitionLock\s*=\s*false/.test(functionBody);
  assert(clearsLock, 'switchPlayMode must set transitionLock = false after transition');
});

// Test 3: Verify cleanup is called before setup
runner.test('switchPlayMode calls cleanup before setup', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  // Verify cleanup is called
  const cleanupIndex = functionBody.search(/cleanupCurrentPlayMode\s*\(/);
  assert(cleanupIndex > -1, 'switchPlayMode must call cleanupCurrentPlayMode()');

  // Verify setup is called
  const setupIndex = functionBody.search(/setupNextPlayMode\s*\(/);
  assert(setupIndex > -1, 'switchPlayMode must call setupNextPlayMode()');

  // Verify cleanup comes before setup
  assert(cleanupIndex < setupIndex, 'cleanupCurrentPlayMode() must be called before setupNextPlayMode()');
});

// Test 4: Verify cleanup function performs critical operations
runner.test('cleanupCurrentPlayMode performs all critical cleanup', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'function cleanupCurrentPlayMode\\s*\\(\\s*\\)');
  assert(functionBody, 'cleanupCurrentPlayMode function not found');

  // Verify sprite destruction
  const destroysSprites = /sprite\.destroy\s*\(\s*\)/.test(functionBody);
  assert(destroysSprites, 'cleanupCurrentPlayMode must destroy sprites');

  // Verify camera reset
  const resetsCamera = /centerCameraAt\s*\(/.test(functionBody);
  assert(resetsCamera, 'cleanupCurrentPlayMode must reset camera position');

  // Verify tilemap clearing
  const clearsTilemap = /tiles\.setCurrentTilemap\s*\(\s*null\s*\)/.test(functionBody);
  assert(clearsTilemap, 'cleanupCurrentPlayMode must clear tilemap');

  // Verify player reference clearing
  const clearsPlayer = /playerSprite\s*=\s*null/.test(functionBody);
  assert(clearsPlayer, 'cleanupCurrentPlayMode must clear playerSprite reference');

  // Verify stage data clearing
  const clearsStageData = /state\.dungeonStageData\s*=\s*null/.test(functionBody);
  assert(clearsStageData, 'cleanupCurrentPlayMode must clear dungeonStageData');
});

// Test 5: Verify cleanup preserves HUD sprites
runner.test('cleanupCurrentPlayMode preserves HUD sprites (RelativeToCamera)', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'function cleanupCurrentPlayMode\\s*\\(\\s*\\)');
  assert(functionBody, 'cleanupCurrentPlayMode function not found');

  // Verify there's a check to skip HUD sprites
  const skipsHUD = /if\s*\([^)]*RelativeToCamera[^)]*\)\s*continue/.test(functionBody);
  assert(skipsHUD, 'cleanupCurrentPlayMode must skip sprites with RelativeToCamera flag');
});

// Test 6: Verify playMode is updated in switchPlayMode
runner.test('switchPlayMode updates state.playMode', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  // Verify playMode is set
  const setsPlayMode = /state\.playMode\s*=\s*nextMode/.test(functionBody);
  assert(setsPlayMode, 'switchPlayMode must set state.playMode = nextMode');
});

// Test 7: Verify tool usage checks transitionLock
runner.test('Tool usage handler checks transitionLock', () => {
  const code = readGameController();

  // Find the controller.B.onEvent handler (tool usage)
  const toolHandlerMatch = code.match(/controller\.B\.onEvent\([^)]+\)\s*=>\s*\{([^}]+)\}/s);
  assert(toolHandlerMatch, 'Tool usage handler (controller.B) not found');

  const handlerBody = toolHandlerMatch[1];

  // Verify transitionLock is checked
  const checksLock = /!state\.transitionLock/.test(handlerBody) || /state\.transitionLock/.test(handlerBody);
  assert(checksLock, 'Tool usage handler must check state.transitionLock');
});

// Test 8: Verify global handlers check playMode
runner.test('Global sprite overlap handlers check playMode', () => {
  const code = readGameController();

  // Find overlap handlers
  const overlapHandlers = code.match(/sprites\.onOverlap\([^)]+,[^)]+,\s*\([^)]+\)\s*=>\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g);
  assert(overlapHandlers && overlapHandlers.length > 0, 'No overlap handlers found');

  // Check that at least some handlers validate playMode
  let hasPlayModeCheck = false;
  for (const handler of overlapHandlers) {
    if (/if\s*\(\s*state\.playMode\s*!==/.test(handler)) {
      hasPlayModeCheck = true;
      break;
    }
  }

  assert(hasPlayModeCheck, 'At least one overlap handler must check state.playMode to prevent cross-mode interference');
});

// Test 9: Verify idempotency - cleanup can be called multiple times safely
runner.test('cleanupCurrentPlayMode is idempotent (safe to call multiple times)', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'function cleanupCurrentPlayMode\\s*\\(\\s*\\)');
  assert(functionBody, 'cleanupCurrentPlayMode function not found');

  // Check that cleanup sets things to null/safe defaults
  // This ensures calling it twice won't cause errors
  // Note: playerSprite is a local variable, not on state
  const clearsPlayerRef = /playerSprite\s*=\s*null/.test(functionBody);
  const clearsStageData = /dungeonStageData\s*=\s*null/.test(functionBody);
  const clearsTilemap = /setCurrentTilemap\s*\(\s*null\s*\)/.test(functionBody);

  assert(clearsPlayerRef && clearsStageData && clearsTilemap,
    'cleanupCurrentPlayMode must set references to null for idempotency');
});

// Test 10: Verify background layers are reset in cleanup
runner.test('cleanupCurrentPlayMode resets background scroll layers', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'function cleanupCurrentPlayMode\\s*\\(\\s*\\)');
  assert(functionBody, 'cleanupCurrentPlayMode function not found');

  // Verify background layers are cleared
  const resetsLayer0 = /setLayerImage\s*\(\s*[^,)]*Layer0/.test(functionBody);
  const resetsLayer1 = /setLayerImage\s*\(\s*[^,)]*Layer1/.test(functionBody);

  assert(resetsLayer0 && resetsLayer1, 'cleanupCurrentPlayMode must reset background scroll layers');
});

// Test 11: Verify transition sequence (lock → cleanup → setup → unlock)
runner.test('switchPlayMode follows sacred sequence: lock → cleanup → setup → unlock', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  // Find positions of each operation
  const guardIndex = functionBody.search(/if\s*\(\s*state\.transitionLock\s*\)\s*return/);
  const lockIndex = functionBody.search(/state\.transitionLock\s*=\s*true/);
  const cleanupIndex = functionBody.search(/cleanupCurrentPlayMode\s*\(/);
  const setupIndex = functionBody.search(/setupNextPlayMode\s*\(/);
  const unlockIndex = functionBody.search(/state\.transitionLock\s*=\s*false/);

  // Verify order: guard < lock < cleanup < setup < unlock
  assert(guardIndex < lockIndex, 'Guard must come before lock');
  assert(lockIndex < cleanupIndex, 'Lock must come before cleanup');
  assert(cleanupIndex < setupIndex, 'Cleanup must come before setup');
  assert(setupIndex < unlockIndex, 'Setup must come before unlock');
});

// Test 12: Verify state.playMode is set between cleanup and setup
runner.test('state.playMode updated between cleanup and setup', () => {
  const code = readGameController();
  const functionBody = extractFunctionBody(code, 'export function switchPlayMode\\([^)]+\\)');
  assert(functionBody, 'switchPlayMode function not found');

  const cleanupIndex = functionBody.search(/cleanupCurrentPlayMode\s*\(/);
  const playModeSetIndex = functionBody.search(/state\.playMode\s*=\s*nextMode/);
  const setupIndex = functionBody.search(/setupNextPlayMode\s*\(/);

  // state.playMode should be set after cleanup but before or during setup
  assert(playModeSetIndex > cleanupIndex, 'state.playMode must be set after cleanup');
  assert(playModeSetIndex <= setupIndex, 'state.playMode must be set before or as part of setup call');
});

// Run all tests
runner.run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
