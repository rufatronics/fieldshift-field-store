# FieldShift Field + Store

**Plan before planting, watch during the season, protect after harvest — even where the network does not.**

FieldShift Field + Store is an offline-first demonstration system for northern Nigerian smallholders, cooperatives, and extension workers. It combines a three-season crop-rotation planner with a simulated field node and grain-store node. The dashboard shows measured values, timestamps, stale status, the transformations applied, and the rule IDs affected. **Rules and the deterministic engine decide; sensors provide inputs; AI and forecasts only explain or advise.**

> Project owner: Ahmad Garba Adamu. Malam Sani, the 65/89 replay, and every simulator reading in this repository are fictional or synthetic examples.

## What is implemented

The Plan view carries the inherited deterministic rotation logic into a shared module. Live field shows soil moisture, air/soil temperature, rainfall, water level, trend bars, and affected rules. Store watch evaluates temperature and relative humidity against a visible `R-STORE-05` threshold and suggests drying or ventilation. Devices shows battery, connection, calibration, and last-seen state. Demo mode runs normal, dry, flood, hot, safe-store, humid-store, and stale/disconnected scenarios. Technical evidence expands the raw message and translation trace. Lite mode remains available at `/lite.html`.

The software simulator and local persistence are implemented. BLE/Wi-Fi transport, ESP32 firmware, GSM/SMS, physical calibration, agronomist-reviewed crop values, verified annual weather, and forecast-worker benchmarking are planned, not claimed as complete.

## Quick start

```bash
npm install
npm run build
npm test
npm run replay
npm start
```

Open `http://localhost:3000`. The app works without an account or external service. To use the preview server on another port, set `PORT=3000` or another available port.

## Architecture

```text
simulator / future ESP32 JSON
        -> schema + range validation
        -> timestamp, battery, connection, stale quality
        -> visible calibration / translation layer
        -> shared deterministic FieldShift rules
        -> Plan + Live field + Store watch + technical trace
```

The same module in `shared/decision-engine.mjs` is used by the browser, replay script, and tests so the simulator cannot silently develop a second decision system. See [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md), and [HARDWARE.md](HARDWARE.md).

## Exact demo scenario

The fictional Malam Sani profile is Kano, low plot, no irrigation, poor storage, previous rotation maize → maize → groundnut, and market preferences cowpea, pearl millet, and sesame. The illustrative drought-stress replay is labeled 65/100 for the current plan and 89/100 for pearl millet → cowpea → sesame. The heavy-flood replay gates the alternative. The dashboard then switches to drying soil, humid store, and stale/disconnected device scenarios. Follow [DEMO.md](DEMO.md) for the live script and honest wording.

## Data privacy and safety

No exact coordinates are part of the message contract. Readings are kept local in the demo. Sync is not automatic. If a device disconnects, the last-known reading stays visible with its timestamp and stale/disconnected state. Sensor measurements never silently remove a safety gate. Crop values are placeholders and need agronomic review. See [SECURITY.md](SECURITY.md) and [VALIDATION.md](VALIDATION.md).

## Hardware concept

The first deployment unit is one shared field node per cooperative plot or extension worker and one store node inside a grain store. The proposed field node uses an ESP32, capacitive soil-moisture sensor, BME280-class temperature/humidity sensor, optional soil temperature, rain gauge, and water-level sensor. The store node uses a low-power board and a temperature/humidity sensor. No physical hardware is represented as tested. See [HARDWARE.md](HARDWARE.md) and `hardware/simulator/scenarios.json`.

## Forecast and AI boundary

A future forecast adapter may display uncertainty bands next to observed readings, but it must remain advisory and separate from scoring. A future AI adapter may explain the supplied decision trace or answer a question about it, but it cannot modify scores, crop parameters, or `R-WATER-01`, `R-SEASON-02`, `R-HEAT-03`, `R-FLOOD-04`, `R-STORE-05`, `R-SEQ-01`, `R-SEQ-02`, `R-SEQ-03`, or `R-GATE`. The environment variable names reserved for future integrations are listed in `.env.example`; no values are committed.

## Verification

The reproducible baseline is:

```bash
npm run build
npm test
npm run replay
node --check public/app.js
node --check tools/replay-case.mjs
git diff --check
```

GitHub Actions runs the same checks on pushes and pull requests. The project is static and dependency-light; no database, login, or paid service is required for the current demo.

## Deployment

For Vercel or another static host, serve `public/` as the output directory. `vercel.json` preserves the static output and security headers. A future server-side ingestion or AI adapter must be deployed separately and must keep credentials off the client. Keep the original `fieldshift-ng` deployment untouched.

## Documents

- [ARCHITECTURE.md](ARCHITECTURE.md) — system layers and data flow.
- [HARDWARE.md](HARDWARE.md) — field/store build plan and limitations.
- [DEMO.md](DEMO.md) — exact live demo sequence.
- [API.md](API.md) — device message schema and contracts.
- [VALIDATION.md](VALIDATION.md) — test, calibration, and agronomic evaluation plan.
- [SECURITY.md](SECURITY.md) — secret handling, privacy, authentication, and SMS safety.
- [AGENT.md](AGENT.md) — continuation handoff.
- [CHANGELOG.md](CHANGELOG.md) — inherited versus new behavior.
