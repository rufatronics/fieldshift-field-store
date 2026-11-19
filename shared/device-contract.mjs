export const SENSOR_LIMITS = {
  soilMoisturePct: [0, 100], soilTemperatureC: [-10, 80], airTemperatureC: [-10, 70], relativeHumidityPct: [0, 100], rainfallMm24h: [0, 1000], waterLevelCm: [0, 500], temperatureC: [-10, 80]
};
export const DEFAULT_STALE_MINUTES = 120;

const isNumber = value => typeof value === "number" && Number.isFinite(value);
const checkRange = (name, value, errors) => { const range = SENSOR_LIMITS[name]; if (!isNumber(value)) errors.push(`${name} must be a finite number`); else if (range && (value < range[0] || value > range[1])) errors.push(`${name} must be between ${range[0]} and ${range[1]}`); };

export function validateDeviceMessage(message) {
  const errors = [];
  if (!message || typeof message !== "object") return { ok: false, errors: ["message must be an object"] };
  if (typeof message.deviceId !== "string" || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(message.deviceId)) errors.push("deviceId must be lowercase letters, numbers, and hyphens");
  if (!["field", "store"].includes(message.deviceType)) errors.push("deviceType must be field or store");
  const observed = Date.parse(message.observedAt);
  if (!Number.isFinite(observed)) errors.push("observedAt must be an ISO timestamp");
  if (!["local", "wifi", "ble", "offline", "disconnected"].includes(message.connection)) errors.push("connection must be local, wifi, ble, offline, or disconnected");
  if (message.batteryPct !== undefined) checkRange("batteryPct", message.batteryPct, errors);
  if (!message.readings || typeof message.readings !== "object") errors.push("readings are required");
  else {
    const required = message.deviceType === "field" ? ["soilMoisturePct", "airTemperatureC", "relativeHumidityPct", "rainfallMm24h", "waterLevelCm"] : ["temperatureC", "relativeHumidityPct"];
    for (const key of required) if (message.readings[key] === undefined) errors.push(`readings.${key} is required`);
    for (const [key, value] of Object.entries(message.readings)) checkRange(key, value, errors);
  }
  if (!message.quality || typeof message.quality !== "object") errors.push("quality is required");
  else if (message.quality.staleAfterMinutes !== undefined && (!Number.isFinite(message.quality.staleAfterMinutes) || message.quality.staleAfterMinutes <= 0)) errors.push("quality.staleAfterMinutes must be positive");
  return errors.length ? { ok: false, errors } : { ok: true, value: structuredClone(message) };
}

export function ageMinutes(message, now = Date.now()) { return Math.max(0, (now - Date.parse(message.observedAt)) / 60000); }
export function readingQuality(message, now = Date.now()) {
  const age = ageMinutes(message, now);
  const staleAfterMinutes = Number(message.quality?.staleAfterMinutes || DEFAULT_STALE_MINUTES);
  const disconnected = ["offline", "disconnected"].includes(message.connection);
  return { ageMinutes: Math.round(age), staleAfterMinutes, stale: age > staleAfterMinutes || disconnected, disconnected, label: disconnected ? "Disconnected" : age > staleAfterMinutes ? "Stale" : "Live" };
}

export function translateFieldReading(message) {
  const reading = message.readings;
  const transformations = [];
  const affectedRules = [];
  let rainPercent = 0, temperatureC = 0, lowPlot = undefined;
  if (reading.soilMoisturePct < 25) { rainPercent -= 18; affectedRules.push("R-WATER-01"); transformations.push(`soil moisture ${reading.soilMoisturePct}% -> dry-soil stress offset -18% rainfall context`); }
  if (reading.rainfallMm24h >= 50) { rainPercent += 12; affectedRules.push("R-WATER-01"); transformations.push(`24h rainfall ${reading.rainfallMm24h} mm -> wet-season context offset +12%`); }
  if (reading.airTemperatureC >= 35 || (reading.soilTemperatureC !== undefined && reading.soilTemperatureC >= 34)) { temperatureC += 1; affectedRules.push("R-HEAT-03"); transformations.push(`temperature ${reading.airTemperatureC}°C -> +1°C heat-stress context`); }
  if (reading.waterLevelCm >= 5) { lowPlot = true; affectedRules.push("R-FLOOD-04"); transformations.push(`water level ${reading.waterLevelCm} cm -> flood-risk context on low plot`); }
  return { plannerPatch: { dRain: rainPercent, dT: temperatureC, ...(lowPlot === undefined ? {} : { low: lowPlot }) }, affectedRules: [...new Set(affectedRules)], transformations, rawReadings: structuredClone(reading), advisoryOnly: false };
}

export function evaluateStoreReading(message) {
  const { temperatureC, relativeHumidityPct } = message.readings;
  const highHumidity = relativeHumidityPct >= 70;
  const highTemperature = temperatureC >= 32;
  const risk = highHumidity && highTemperature ? "high" : highHumidity || highTemperature ? "watch" : "safe";
  const alert = risk !== "safe" ? { ruleId: "R-STORE-05", severity: risk, message: highHumidity ? `Store humidity is high at ${relativeHumidityPct}%. Dry or ventilate grain and check the store today.` : `Store temperature is high at ${temperatureC}°C. Ventilate and check grain condition today.` } : null;
  return { risk, alert, thresholds: { relativeHumidityPct: 70, temperatureC: 32 }, measured: { temperatureC, relativeHumidityPct }, advisoryOnly: false };
}

export function fakeAlert(event, destination = "in-app", channel = "local") { return { accepted: true, provider: "fake-local-alert", destination, channel, event, sentAt: new Date().toISOString() }; }
