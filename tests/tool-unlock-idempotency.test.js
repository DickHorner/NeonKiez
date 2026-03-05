// tests/tool-unlock-idempotency.test.js
// Verifies that unlocking the same tool multiple times yields a single entry.
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { unlockToolIdempotent } = require("./helpers.js");

test("unlocking a new tool adds it to the array", () => {
  const result = unlockToolIdempotent([], "TOOL_TAGGER");
  assert.deepEqual(result, ["TOOL_TAGGER"]);
});

test("unlocking the same tool twice yields a single entry (idempotent)", () => {
  let tools = unlockToolIdempotent([], "TOOL_FREEZECAM");
  tools = unlockToolIdempotent(tools, "TOOL_FREEZECAM");
  assert.equal(tools.length, 1);
  assert.equal(tools[0], "TOOL_FREEZECAM");
});

test("unlocking multiple different tools adds all", () => {
  let tools = [];
  tools = unlockToolIdempotent(tools, "TOOL_TAGGER");
  tools = unlockToolIdempotent(tools, "TOOL_CONFETTI_BOMB");
  tools = unlockToolIdempotent(tools, "TOOL_SOAP_SLIDE");
  assert.equal(tools.length, 3);
});
