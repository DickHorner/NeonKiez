// Save/Load: serialize/deserialize, persist, continue/new game
// NOTE: MakeCode Arcade provides settings/JSON globals; imports are intentionally omitted.

// DECISION: Using settings block for persistence (simple key-value)

interface SavePayload {
  hearts?: any;
  maxHearts?: any;
  energy?: any;
  hubRoom?: any;
  flags?: any;
  unlockedTools?: any;
  inventory?: any;
}

function isDangerousObjectKey(key: string): boolean {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}

function clampNumber(value: any, min: number, max: number, defaultValue: number): number {
  if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value);
}

function logNormalization(field: string, rejected: string, normalized: any) {
  console.log("[SAVE] normalized " + field + ": rejected=" + rejected + ", used=" + JSON.stringify(normalized));
}

function validateHubRoom(room: any): { row: number; col: number } {
  const defaultRoom = { row: HUB_START_ROOM.row, col: HUB_START_ROOM.col };
  if (!room || typeof room !== "object") {
    logNormalization("hubRoom", "invalid object", defaultRoom);
    return defaultRoom;
  }

  const row = clampNumber(room.row, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, defaultRoom.row);
  const col = clampNumber(room.col, STATE_HUB_ROOM_MIN, STATE_HUB_ROOM_MAX, defaultRoom.col);
  if (row !== room.row || col !== room.col) {
    logNormalization("hubRoom", "{row:" + room.row + ",col:" + room.col + "}", { row: row, col: col });
  }
  return { row: row, col: col };
}

function validateFlags(flags: any): { [key: string]: boolean } {
  if (!flags || typeof flags !== "object" || Array.isArray(flags)) {
    logNormalization("flags", "invalid object", {});
    return {};
  }

  const validated = Object.create(null) as { [key: string]: boolean };
  const keys = Object.keys(flags);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (isDangerousObjectKey(key)) {
      continue;
    }
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

  const validated = Object.create(null) as { [itemId: string]: number };
  const keys = Object.keys(inventory);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = inventory[key];
    if (isDangerousObjectKey(key)) {
      continue;
    }
    if (typeof value === "number" && !isNaN(value) && isFinite(value) && value >= 0) {
      validated[key] = Math.floor(value);
    }
  }

  return validated;
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
    const data = JSON.parse(json) as SavePayload;
    const maxHearts = clampNumber(data.maxHearts, 1, STATE_MAX_HEARTS, PLAYER_MAX_HEARTS);
    const hearts = clampNumber(data.hearts, STATE_MIN_HEARTS, maxHearts, PLAYER_MAX_HEARTS);
    const energy = clampNumber(data.energy, STATE_MIN_ENERGY, STATE_MAX_ENERGY, PLAYER_ENERGY_MAX);

    if (data.maxHearts !== maxHearts) {
      logNormalization("maxHearts", String(data.maxHearts), maxHearts);
    }
    if (data.hearts !== hearts) {
      logNormalization("hearts", String(data.hearts), hearts);
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
  return !!json && json.length > 0;
}

function deleteSave() {
  settings.writeString("NEON_KIEZ_SAVE", "");
}
