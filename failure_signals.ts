// Failure Signals: Lightweight fail-reason signaling for critical guard exits
// Purpose: Add observability to silent guard exits without altering control flow

// Failure reason codes for critical guard exits
enum FailureReason {
  // GameController.switchPlayMode
  TRANSITION_LOCKED = "TRANSITION_LOCKED",

  // Dungeon spec lookup failures
  SPEC_NOT_FOUND = "SPEC_NOT_FOUND",

  // Missing state failures
  NO_CURRENT_DUNGEON = "NO_CURRENT_DUNGEON",
  NO_DUNGEON_STAGE_DATA = "NO_DUNGEON_STAGE_DATA",
  NO_PLAYER_SPRITE = "NO_PLAYER_SPRITE",

  // Stage transition failures
  INVALID_STAGE_INDEX = "INVALID_STAGE_INDEX",

  // Hub mode failures
  WRONG_PLAY_MODE = "WRONG_PLAY_MODE",
  INTERACT_COOLDOWN = "INTERACT_COOLDOWN",
}

// Debug mode flag (can be set via debug.ts)
let failureSignalsDebugMode = false;

// Centralized gated debug logging helper
function logFailure(reason: FailureReason, context?: string) {
  if (!failureSignalsDebugMode) return;

  const msg = context
    ? `[FAIL] ${reason}: ${context}`
    : `[FAIL] ${reason}`;
  console.log(msg);
}

// Public API to enable debug logging
function enableFailureSignalsDebug() {
  failureSignalsDebugMode = true;
}

function disableFailureSignalsDebug() {
  failureSignalsDebugMode = false;
}

function isFailureSignalsDebugEnabled(): boolean {
  return failureSignalsDebugMode;
}

// DECISION: Export last failure for testing purposes
let lastFailureReason: FailureReason = null;
let lastFailureContext: string = null;

function signalFailure(reason: FailureReason, context?: string): void {
  lastFailureReason = reason;
  lastFailureContext = context || null;
  logFailure(reason, context);
}

function getLastFailure(): { reason: FailureReason, context: string } {
  return {
    reason: lastFailureReason,
    context: lastFailureContext,
  };
}

function clearLastFailure(): void {
  lastFailureReason = null;
  lastFailureContext = null;
}
