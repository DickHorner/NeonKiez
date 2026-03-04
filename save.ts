// Save/Load: serialize/deserialize, persist, continue/new game
// NOTE: MakeCode Arcade provides settings/JSON globals; imports are intentionally omitted.

// DECISION: Using settings block for persistence (simple key-value)

// Save payload type definition
interface SavePayload {
  hearts?: any;
  maxHearts?: any;
  energy?: any;
  hubRoom?: any;
  flags?: any;
  unlockedTools?: any;
  inventory?: any;
}

// Validation and clamping helpers
function clampNumber(value: any, min: number, max: number, defaultValue: number): number {
  if (typeof value !== "number" || isNaN(value)) {
    return defaultValue;
  }
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value); // Ensure integer
}

function validateHubRoom(room: any): { row: number; col: number } {
  const defaultRoom = { row: 1, col: 1 };

  if (!room || typeof room !== "object") {
    logNormalization("hubRoom", "invalid object", defaultRoom);
    return defaultRoom;
  }

  const row = clampNumber(room.row, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, 1);
  const col = clampNumber(room.col, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, 1);

  if (row !== room.row || col !== room.col) {
    logNormalization("hubRoom", `{row:${room.row},col:${room.col}}`, `{row:${row},col:${col}}`);
  }

  return { row: row, col: col };
}

function validateFlags(flags: any): { [key: string]: boolean } {
  if (!flags || typeof flags !== "object" || Array.isArray(flags)) {
    logNormalization("flags", "invalid object", {});
    return {};
  }

  const validated: { [key: string]: boolean } = {};
  for (const key in flags) {
    if (typeof flags[key] === "boolean") {
      validated[key] = flags[key];
    }
  }

  return validated;
}

function validateStringArray(arr: any, fieldName: string): string[] {
  if (!Array.isArray(arr)) {
    logNormalization(fieldName, "not array", []);
    return [];
  }

  const validated: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === "string") {
      validated.push(arr[i]);
    }
  }

  return validated;
}

function validateInventory(inventory: any): { [itemId: string]: number } {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) {
    logNormalization("inventory", "invalid object", {});
    return {};
  }

  const validated: { [itemId: string]: number } = {};
  for (const key in inventory) {
    if (typeof inventory[key] === "number" && !isNaN(inventory[key]) && inventory[key] >= 0) {
      validated[key] = Math.floor(inventory[key]);
    }
  }

  return validated;
}

function logNormalization(field: string, rejected: string, normalized: any) {
  // Deterministic debug log for rejected/normalized fields
  console.log(`[SAVE] normalized ${field}: rejected=${rejected}, used=${JSON.stringify(normalized)}`);
}

function saveGame() {
  // Serialize state to JSON
  const data = {
    hearts: state.hearts,
    maxHearts: state.maxHearts,
    energy: state.energy,
    hubRoom: state.hubRoom,
    flags: state.flags,
    unlockedTools: state.unlockedTools,
    inventory: state.inventory,
  };

  settings.writeString("NEON_KIEZ_SAVE", JSON.stringify(data));
}

function loadGame(): boolean {
  const json = settings.readString("NEON_KIEZ_SAVE");
  if (!json || json.length === 0) {
    return false;
  }

  try {
    const data: SavePayload = JSON.parse(json);

    // Validate and clamp numeric fields with runtime guards
    const maxHearts = clampNumber(data.maxHearts, 1, STATE_MAX_HEARTS, 5);
    const hearts = clampNumber(data.hearts, STATE_MIN_HEARTS, maxHearts, 5);
    const energy = clampNumber(data.energy, STATE_MIN_ENERGY, STATE_MAX_ENERGY, 100);

    if (data.hearts !== hearts) {
      logNormalization("hearts", String(data.hearts), hearts);
    }
    if (data.maxHearts !== maxHearts) {
      logNormalization("maxHearts", String(data.maxHearts), maxHearts);
    }
    if (data.energy !== energy) {
      logNormalization("energy", String(data.energy), energy);
    }

    state.hearts = hearts;
    state.maxHearts = maxHearts;
    state.energy = energy;
    state.hubRoom = validateHubRoom(data.hubRoom);
    state.flags = validateFlags(data.flags);
    state.unlockedTools = validateStringArray(data.unlockedTools, "unlockedTools");
    state.inventory = validateInventory(data.inventory);

    return true;
  } catch (e) {
    console.log("[SAVE] loadGame failed: corrupt JSON or parse error");
    return false;
  }
}

function hasSaveData(): boolean {
  const json = settings.readString("NEON_KIEZ_SAVE");
  return json && json.length > 0;
}

function deleteSave() {
  settings.writeString("NEON_KIEZ_SAVE", "");
}
