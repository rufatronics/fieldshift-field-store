# Architecture

FieldShift Field + Store is deliberately a small, inspectable system. It treats the browser as a local field notebook and the deterministic engine as the only recommendation authority.

## Layers

| Layer | Responsibility | Current state |
| --- | --- | --- |
| Device contract | Validate identity, type, timestamp, ranges, battery, quality | Implemented locally |
| Quality layer | Calculate age, stale/disconnected state, last-known behavior | Implemented locally |
| Calibration/translation | Turn raw sensor values into explicit coarse context and rule evidence | Implemented demo thresholds; local calibration planned |
| Decision engine | Score crops, rotations, gates, alternatives, and trace | Implemented and shared |
| Store evaluator | Evaluate humidity/temperature and `R-STORE-05` alert | Implemented locally |
| UI | Plan, Live field, Store watch, Devices, Demo, Technical evidence, Lite | Implemented |
| Persistence | Last-known readings and opt-in-ready local queue | Implemented locally; sync planned |
| External adapters | AI, forecast worker, BLE/Wi-Fi, GSM/SMS | Interfaces/documentation only |

## Data flow

```text
field/store message
  -> validateDeviceMessage()
  -> readingQuality()
  -> translateFieldReading() or evaluateStoreReading()
  -> calculatePlan() with a visible plannerPatch
  -> user-facing result + expandable evidence
```

The `plannerPatch` is never hidden: the dashboard lists every transformation and affected rule. The engine does not accept a raw sensor payload and does not alter crop parameters.

## Offline behavior

The app shell, shared modules, manifest, route manifest, and service worker are cacheable. The simulator and deterministic plan run without network access. LocalStorage retains last-known messages and a small queued history. When a device is stale or disconnected, the UI shows the last timestamp and quality label; it does not fabricate a fresh reading.

## Server/deployment shape

The current project is a static app with no required server or database. It can be hosted from `public/`. A later version may add a server-side ingestion endpoint, AI explanation endpoint, or private forecast worker. Those services must be separate from the client rule engine, use server-side secrets, and preserve the existing safety gates.

## Trust boundaries

Sensors are untrusted input. The schema rejects impossible values. The translation layer is configuration and evidence, not an invisible recommendation. Forecast and AI responses are untrusted advisory content. The original repository and production deployment are not dependencies of this new repo and must remain recoverable.
