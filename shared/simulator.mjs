const baseTime = "2026-11-19T12:00:00.000Z";

export const SCENARIOS = {
  normalField: { label: "Normal field", type: "field", message: { deviceId: "field-kano-coop-01", deviceType: "field", observedAt: baseTime, batteryPct: 82, connection: "local", readings: { soilMoisturePct: 42, soilTemperatureC: 30.2, airTemperatureC: 32.5, relativeHumidityPct: 58, rainfallMm24h: 3.2, waterLevelCm: 0 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  dryingSoil: { label: "Drying soil", type: "field", message: { deviceId: "field-kano-coop-01", deviceType: "field", observedAt: baseTime, batteryPct: 78, connection: "local", readings: { soilMoisturePct: 18, soilTemperatureC: 35.1, airTemperatureC: 36.8, relativeHumidityPct: 34, rainfallMm24h: 0.2, waterLevelCm: 0 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  heavyFlood: { label: "Heavy rain / flood", type: "field", message: { deviceId: "field-kano-coop-01", deviceType: "field", observedAt: baseTime, batteryPct: 75, connection: "wifi", readings: { soilMoisturePct: 88, soilTemperatureC: 29.4, airTemperatureC: 31.2, relativeHumidityPct: 82, rainfallMm24h: 96, waterLevelCm: 12 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  hotField: { label: "Hot field", type: "field", message: { deviceId: "field-kano-coop-01", deviceType: "field", observedAt: baseTime, batteryPct: 66, connection: "local", readings: { soilMoisturePct: 35, soilTemperatureC: 38, airTemperatureC: 40.2, relativeHumidityPct: 28, rainfallMm24h: 0, waterLevelCm: 0 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  safeStore: { label: "Safe store", type: "store", message: { deviceId: "store-kano-coop-01", deviceType: "store", observedAt: baseTime, batteryPct: 91, connection: "local", readings: { temperatureC: 28.2, relativeHumidityPct: 58 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  humidStore: { label: "Humid store", type: "store", message: { deviceId: "store-kano-coop-01", deviceType: "store", observedAt: baseTime, batteryPct: 87, connection: "local", readings: { temperatureC: 33.4, relativeHumidityPct: 76 }, quality: { calibrated: false, staleAfterMinutes: 120 } } },
  staleField: { label: "Stale / disconnected", type: "field", message: { deviceId: "field-kano-coop-01", deviceType: "field", observedAt: "2026-11-19T06:00:00.000Z", batteryPct: 14, connection: "disconnected", readings: { soilMoisturePct: 18, soilTemperatureC: 35.1, airTemperatureC: 36.8, relativeHumidityPct: 34, rainfallMm24h: 0.2, waterLevelCm: 0 }, quality: { calibrated: false, staleAfterMinutes: 120 } } }
};

export function scenarioMessage(id, now = baseTime) {
  const scenario = SCENARIOS[id];
  if (!scenario) throw new Error(`Unknown simulator scenario: ${id}`);
  const message = structuredClone(scenario.message);
  if (id !== "staleField") message.observedAt = new Date(now).toISOString();
  return message;
}
