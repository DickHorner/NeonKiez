// Failure Signals: lightweight observability for critical guard exits.

enum FailureReason {
  TRANSITION_LOCKED = "TRANSITION_LOCKED",
  SPEC_NOT_FOUND = "SPEC_NOT_FOUND",
  NO_CURRENT_DUNGEON = "NO_CURRENT_DUNGEON",
  NO_DUNGEON_STAGE_DATA = "NO_DUNGEON_STAGE_DATA",
  NO_PLAYER_SPRITE = "NO_PLAYER_SPRITE",
  WRONG_PLAY_MODE = "WRONG_PLAY_MODE",
  INTERACT_COOLDOWN = "INTERACT_COOLDOWN",
}

let failureSignalsDebugMode = false;
let lastFailureReason: FailureReason | null = null;
let lastFailureContext: string | null = null;

function logFailure(reason: FailureReason, context?: string) {
  if (!failureSignalsDebugMode) return;

  let message = "[FAIL] " + reason;
  if (context) {
    message += ": " + context;
  }
  console.log(message);
}

function enableFailureSignalsDebug() {
  failureSignalsDebugMode = true;
}

function disableFailureSignalsDebug() {
  failureSignalsDebugMode = false;
}

function isFailureSignalsDebugEnabled(): boolean {
  return failureSignalsDebugMode;
}

function signalFailure(reason: FailureReason, context?: string): void {
  lastFailureReason = reason;
  lastFailureContext = context || null;
  logFailure(reason, context);
}

function getLastFailure(): { reason: FailureReason | null; context: string | null } {
  return {
    reason: lastFailureReason,
    context: lastFailureContext,
  };
}

function clearLastFailure(): void {
  lastFailureReason = null;
  lastFailureContext = null;
}
