// Failure Signals: lightweight observability for critical guard exits.

enum FailureReason {
  TRANSITION_LOCKED,
  SPEC_NOT_FOUND,
  NO_CURRENT_DUNGEON,
  NO_DUNGEON_STAGE_DATA,
  NO_PLAYER_SPRITE,
  WRONG_PLAY_MODE,
  INTERACT_COOLDOWN,
}

let failureSignalsDebugMode = false;
let lastFailureReason: FailureReason | null = null;
let lastFailureContext: string | null = null;

function failureReasonLabel(reason: FailureReason): string {
  if (reason === FailureReason.TRANSITION_LOCKED) return "TRANSITION_LOCKED";
  if (reason === FailureReason.SPEC_NOT_FOUND) return "SPEC_NOT_FOUND";
  if (reason === FailureReason.NO_CURRENT_DUNGEON) return "NO_CURRENT_DUNGEON";
  if (reason === FailureReason.NO_DUNGEON_STAGE_DATA) return "NO_DUNGEON_STAGE_DATA";
  if (reason === FailureReason.NO_PLAYER_SPRITE) return "NO_PLAYER_SPRITE";
  if (reason === FailureReason.WRONG_PLAY_MODE) return "WRONG_PLAY_MODE";
  if (reason === FailureReason.INTERACT_COOLDOWN) return "INTERACT_COOLDOWN";
  return "UNKNOWN_FAILURE_REASON";
}

function logFailure(reason: FailureReason, context?: string) {
  if (!failureSignalsDebugMode) return;

  let message = "[FAIL] " + failureReasonLabel(reason);
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
