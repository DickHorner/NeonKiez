/**
 * Failure Signals Test Suite
 *
 * Tests that critical guard exits emit diagnosable failure reason codes
 * without altering control flow or adding noise to normal flow.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const ALLOWED_FILES = [
  'game_controller.ts',
  'game_controller_hub.ts',
  'world_dungeons.ts',
  'debug.ts',
  'failure_signals.ts'
];

const REQUIRED_FAILURE_REASONS = [
  'TRANSITION_LOCKED',
  'SPEC_NOT_FOUND',
  'NO_CURRENT_DUNGEON',
  'NO_DUNGEON_STAGE_DATA',
  'NO_PLAYER_SPRITE',
  'WRONG_PLAY_MODE',
  'INTERACT_COOLDOWN'
];

const CRITICAL_FUNCTIONS = [
  'switchPlayMode',
  'enterDungeon',
  'exitDungeon',
  'completeDungeon',
  'onStageComplete',
  'handleInteract'
];

// Test utilities
function readFile(filename) {
  const filePath = path.join(__dirname, '..', filename);
  return fs.readFileSync(filePath, 'utf8');
}

function findSignalFailureCalls(content) {
  const regex = /signalFailure\s*\(\s*FailureReason\.(\w+)(?:\s*,\s*[^)]+)?\s*\)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      reason: match[1],
      fullMatch: match[0],
      index: match.index
    });
  }
  return matches;
}

function findSilentReturns(content) {
  // Find lines with if (...) return; or if (!...) return; without signalFailure
  const lines = content.split('\n');
  const silentReturns = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a guard return
    if (/^if\s*\([^)]+\)\s*return;/.test(trimmed)) {
      // Check if the previous line or next line has signalFailure
      const prevLine = i > 0 ? lines[i - 1] : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

      // If this is inside a block with signalFailure, it's not silent
      const contextLines = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 3)).join('\n');

      if (!contextLines.includes('signalFailure')) {
        // Check if it's in a critical function
        const beforeContext = lines.slice(Math.max(0, i - 20), i).join('\n');
        const isCritical = CRITICAL_FUNCTIONS.some(fn => beforeContext.includes(`function ${fn}`) || beforeContext.includes(`export function ${fn}`));

        if (isCritical) {
          silentReturns.push({
            line: i + 1,
            content: trimmed
          });
        }
      }
    }
  }

  return silentReturns;
}

// Tests
console.log('=== FAILURE SIGNALS TEST SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   ${error.message}`);
    failedTests++;
  }
}

// Test 1: Failure signals module exists
test('failure_signals.ts exists and exports required APIs', () => {
  const content = readFile('failure_signals.ts');

  if (!content.includes('enum FailureReason')) {
    throw new Error('FailureReason enum not found');
  }

  if (!content.includes('function signalFailure')) {
    throw new Error('signalFailure function not found');
  }

  if (!content.includes('function getLastFailure')) {
    throw new Error('getLastFailure function not found');
  }

  if (!content.includes('function enableFailureSignalsDebug')) {
    throw new Error('enableFailureSignalsDebug function not found');
  }
});

// Test 2: All required failure reasons are defined
test('All required failure reasons are defined in FailureReason enum', () => {
  const content = readFile('failure_signals.ts');

  for (const reason of REQUIRED_FAILURE_REASONS) {
    if (!content.includes(`${reason} =`)) {
      throw new Error(`Missing required failure reason: ${reason}`);
    }
  }
});

// Test 3: Debug logging is gated
test('Debug logging is gated by failureSignalsDebugMode flag', () => {
  const content = readFile('failure_signals.ts');

  if (!content.includes('failureSignalsDebugMode')) {
    throw new Error('failureSignalsDebugMode flag not found');
  }

  // Check that logFailure checks the flag
  const logFailureMatch = content.match(/function logFailure[^{]*{[^}]*if\s*\(\s*!failureSignalsDebugMode\s*\)\s*return/s);
  if (!logFailureMatch) {
    throw new Error('logFailure does not properly gate logging with failureSignalsDebugMode');
  }
});

// Test 4: game_controller.ts has failure signals in critical paths
test('game_controller.ts has signalFailure calls in critical functions', () => {
  const content = readFile('game_controller.ts');
  const signals = findSignalFailureCalls(content);

  if (signals.length === 0) {
    throw new Error('No signalFailure calls found in game_controller.ts');
  }

  // Check that critical functions have failure signals
  const criticalFunctions = ['switchPlayMode', 'enterDungeon', 'exitDungeon', 'completeDungeon', 'onStageComplete'];

  for (const fn of criticalFunctions) {
    const fnRegex = new RegExp(`function ${fn}[^{]*{[\\s\\S]*?(?=\\n  (export )?function|\\n}\\n}|$)`, 'm');
    const fnMatch = content.match(fnRegex);

    if (fnMatch && fnMatch[0].includes('if (')) {
      // This function has guards, check if it has signalFailure
      if (!fnMatch[0].includes('signalFailure')) {
        throw new Error(`Critical function ${fn} has guards but no signalFailure calls`);
      }
    }
  }
});

// Test 5: game_controller_hub.ts has failure signals
test('game_controller_hub.ts has signalFailure calls in handleInteract', () => {
  const content = readFile('game_controller_hub.ts');
  const signals = findSignalFailureCalls(content);

  if (signals.length === 0) {
    throw new Error('No signalFailure calls found in game_controller_hub.ts');
  }

  // Check handleInteract specifically
  if (!content.includes('handleInteract') || !content.match(/handleInteract[^{]*{[\s\S]*signalFailure/)) {
    throw new Error('handleInteract does not have signalFailure calls');
  }
});

// Test 6: No silent returns remain in critical paths
test('Critical guard exits in allowed files have failure signals', () => {
  const filesToCheck = ['game_controller.ts', 'game_controller_hub.ts'];

  for (const file of filesToCheck) {
    const content = readFile(file);
    const silentReturns = findSilentReturns(content);

    if (silentReturns.length > 0) {
      const details = silentReturns.map(r => `line ${r.line}: ${r.content}`).join(', ');
      throw new Error(`Found ${silentReturns.length} potential silent returns in ${file}: ${details}`);
    }
  }
});

// Test 7: Debug helper exists for viewing last failure
test('debug.ts has showLastFailure function', () => {
  const content = readFile('debug.ts');

  if (!content.includes('function showLastFailure')) {
    throw new Error('showLastFailure function not found in debug.ts');
  }

  if (!content.includes('getLastFailure')) {
    throw new Error('showLastFailure does not call getLastFailure');
  }
});

// Test 8: Debug mode can toggle failure signals
test('debug.ts can enable/disable failure signals debug mode', () => {
  const content = readFile('debug.ts');

  if (!content.includes('enableFailureSignalsDebug') || !content.includes('disableFailureSignalsDebug')) {
    throw new Error('debug.ts does not have toggle functions for failure signals');
  }
});

// Test 9: Failure signals are properly typed
test('FailureReason enum members are used consistently', () => {
  const failureSignalsContent = readFile('failure_signals.ts');
  const enumMatch = failureSignalsContent.match(/enum FailureReason\s*{([^}]+)}/s);

  if (!enumMatch) {
    throw new Error('Could not parse FailureReason enum');
  }

  const enumMembers = enumMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('//'))
    .map(line => line.split('=')[0].trim())
    .filter(member => member.length > 0 && member !== ',');

  // Check that all uses of signalFailure reference valid enum members
  const files = ['game_controller.ts', 'game_controller_hub.ts', 'debug.ts'];

  for (const file of files) {
    const content = readFile(file);
    const signals = findSignalFailureCalls(content);

    for (const signal of signals) {
      if (!enumMembers.includes(signal.reason)) {
        throw new Error(`Invalid FailureReason used in ${file}: ${signal.reason} (valid: ${enumMembers.join(', ')})`);
      }
    }
  }
});

// Test 10: No control flow alterations
test('Failure signals do not alter control flow (return after signal)', () => {
  const files = ['game_controller.ts', 'game_controller_hub.ts'];

  for (const file of files) {
    const content = readFile(file);
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('signalFailure')) {
        // The next non-empty, non-comment line should be 'return;' or '}'
        let nextIndex = i + 1;
        while (nextIndex < lines.length) {
          const nextLine = lines[nextIndex].trim();
          if (nextLine.length > 0 && !nextLine.startsWith('//')) {
            if (!nextLine.startsWith('return;') && nextLine !== '}') {
              throw new Error(`${file}:${i + 1} - signalFailure not followed by return; (found: ${nextLine})`);
            }
            break;
          }
          nextIndex++;
        }
      }
    }
  }
});

// Summary
console.log('\n=== TEST SUMMARY ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  console.log('\n❌ TEST SUITE FAILED');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED');
  process.exit(0);
}
