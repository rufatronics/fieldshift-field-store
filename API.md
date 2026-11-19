# Device API and message contract

FieldShift accepts a stable JSON message from a simulator today and from a future ESP32 adapter later. The browser currently validates messages locally; no network ingestion endpoint is enabled by default.

## Field message

```json
{
  "deviceId": "field-kano-coop-01",
  "deviceType": "field",
  "observedAt": "2026-11-19T12:00:00Z",
  "batteryPct": 82,
  "connection": "local",
  "readings": {
    "soilMoisturePct": 24.5,
    "soilTemperatureC": 31.2,
    "airTemperatureC": 35.8,
    "relativeHumidityPct": 42.0,
    "rainfallMm24h": 3.2,
    "waterLevelCm": 0
  },
  "quality": { "calibrated": false, "staleAfterMinutes": 120 }
}
```

## Store message

```json
{
  "deviceId": "store-kano-coop-01",
  "deviceType": "store",
  "observedAt": "2026-11-19T12:00:00Z",
  "batteryPct": 91,
  "connection": "local",
  "readings": { "temperatureC": 29.4, "relativeHumidityPct": 73.5 },
  "quality": { "calibrated": false, "staleAfterMinutes": 120 }
}
```

## Accepted values and validation

`deviceType` is `field` or `store`. `connection` is `local`, `wifi`, `ble`, `offline`, or `disconnected`. Percentages are 0–100; temperatures are -10–80°C; water level is 0–500 cm; rainfall is 0–1000 mm in 24 hours. Required readings depend on device type. Impossible values are rejected and never passed to the decision engine.

## Translation contract

The path is `raw reading -> range/quality check -> local unit -> coarse planner context -> deterministic rules`. Dry soil below 25% contributes a visible `-18%` rainfall-context stress offset and flags `R-WATER-01`; 24-hour rain of 50 mm or more contributes a visible wet-context offset; heat at or above 35°C contributes a visible `+1°C` context offset and flags `R-HEAT-03`; water level at or above 5 cm activates a visible low-plot flood context and flags `R-FLOOD-04`. These are demonstration thresholds and require local calibration before deployment. They never rewrite crop parameters.

Store humidity at or above 70% or temperature at or above 32°C produces an in-app `R-STORE-05` watch/alert. It suggests drying or ventilating grain and checking the store; it does not guarantee protection from every spoilage pathway.

## Future ingestion

A future local Wi-Fi endpoint may accept `POST /api/devices/readings` with one message, return `{ok, errors?}`, and queue locally when offline. Authentication, replay protection, rate limiting, and device registration are required before enabling it. Exact coordinates are not part of this contract.
