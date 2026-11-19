import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculatePlan, demoProfile, makeClimate, scoreRotation } from "../shared/decision-engine.mjs";
import { evaluateStoreReading, readingQuality, translateFieldReading, validateDeviceMessage } from "../shared/device-contract.mjs";
import { SCENARIOS, scenarioMessage } from "../shared/simulator.mjs";

test("the shared deterministic engine preserves the illustrative Kano replay", () => {
  const plan = calculatePlan(demoProfile());
  assert.equal(Math.round(plan.current.score), 65);
  assert.equal(Math.round(plan.alternatives[0].score), 89);
  assert.deepEqual(plan.alternatives[0].sequence, ["millet", "cowpea", "sesame"]);
});

test("flood context remains a safety gate", () => {
  const profile = { ...demoProfile(), low: true };
  const climate = makeClimate("kano");
  climate.rain = climate.rain.map((value, index) => index >= 6 && index <= 8 ? value * 1.25 : value);
  const result = scoreRotation(["millet", "cowpea", "sesame"], profile, climate);
  assert.equal(result.gated, true);
  assert.ok(result.notes.some(note => note.id === "R-GATE"));
});

test("device schema accepts the normal field scenario", () => {
  const result = validateDeviceMessage(scenarioMessage("normalField"));
  assert.equal(result.ok, true);
});

test("device schema rejects impossible sensor values", () => {
  const message = scenarioMessage("normalField");
  message.readings.soilMoisturePct = 140;
  const result = validateDeviceMessage(message);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes("soilMoisturePct")));
});

test("stale and disconnected readings are never labeled live", () => {
  const message = scenarioMessage("staleField");
  const quality = readingQuality(message, Date.parse("2026-11-19T12:00:00.000Z"));
  assert.equal(quality.stale, true);
  assert.equal(quality.disconnected, true);
  assert.equal(quality.label, "Disconnected");
});

test("drying soil translates to visible water and heat evidence", () => {
  const translation = translateFieldReading(scenarioMessage("dryingSoil"));
  assert.ok(translation.affectedRules.includes("R-WATER-01"));
  assert.ok(translation.affectedRules.includes("R-HEAT-03"));
  assert.ok(translation.transformations.length >= 2);
});

test("store humidity alert stays attached to R-STORE-05", () => {
  const evaluation = evaluateStoreReading(scenarioMessage("humidStore"));
  assert.equal(evaluation.risk, "high");
  assert.equal(evaluation.alert.ruleId, "R-STORE-05");
  assert.match(evaluation.alert.message, /ventilate grain/i);
});

test("every documented simulator scenario validates", () => {
  for (const id of Object.keys(SCENARIOS)) assert.equal(validateDeviceMessage(scenarioMessage(id)).ok, true, id);
});

test("forecast separation is explicit in the plan summary", () => {
  const plan = calculatePlan(demoProfile());
  assert.equal(plan.advisoryOnly, undefined);
  assert.equal(plan.current.score, calculatePlan(demoProfile()).current.score);
});

test("Lite mode contains a short result and a link back to the dashboard", async () => {
  const html = await readFile("public/lite.html", "utf8");
  assert.match(html, /89\/100/);
  assert.match(html, /Field \+ Store dashboard/);
});
