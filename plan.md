# FieldShift Field + Store — implementation plan

## Source and preservation

The reference repository is `/home/ubuntu/fieldshift-ng-reference`, cloned from `rufatronics/fieldshift-ng` at commit `703d69c15e16e63950e9e0758011a7486978fbfc`. The original remains untouched. The new project is a separate repository and uses the old deterministic formulas as the starting point for a shared, testable module.

## Product approach

Build a polished offline-first single-page dashboard for cooperatives and extension workers. It connects three moments without pretending hardware is smarter than the rules: plan before planting, watch measured field conditions during the season, and protect stored grain after harvest. A simulator supplies realistic demo readings using the same JSON message shape planned for ESP32 nodes.

The deterministic decision engine is the only recommendation authority. Sensor readings pass through a visible calibration/quality translation layer before they affect the planner context. AI and forecasts are represented as advisory boundaries in the technical evidence; no provider is required for the demo.

## Architecture

- `shared/decision-engine.mjs`: canonical crop, rotation, gate, score, and replay functions shared by browser-facing code, simulator tests, and the replay script.
- `shared/device-contract.mjs`: device message schema, range validation, stale detection, field-to-rule translation, store risk evaluation, and a fake local alert adapter.
- `shared/simulator.mjs`: deterministic scenario messages for normal field, drying soil, heavy rain/flood, hot field, safe store, humid store, and disconnected/stale device.
- `public/index.html`, `public/app.css`, `public/app.js`: responsive dashboard with Plan, Live field, Store watch, Devices, Demo mode, and Technical evidence views.
- `public/sw.js`, `public/manifest.webmanifest`: offline application shell and installable metadata.
- `hardware/`: realistic field-node/store-node proposal, message contract, simulator scenarios, bill of materials, and wiring notes.
- `test/`: Node built-in tests for rules, schema validation, stale data, sensor translation, store alerts, flood gates, forecast separation, simulator coverage, and lite smoke behavior.
- `tools/replay-case.mjs`: reproducible Malam Sani illustrative replay using the shared engine.

## Data flow

`device JSON -> schema/range validation -> timestamp and connection quality -> calibrated local unit -> coarse planner input -> deterministic engine -> decision trace + plain-language dashboard`. Store messages take the same validation path, then evaluate local humidity/temperature thresholds for `R-STORE-05` without claiming complete spoilage protection.

The browser stores the latest accepted messages and a small offline queue in localStorage. Sync is not automatic and no exact coordinates are uploaded. The first implementation is simulator/file-contract ready; BLE, Wi-Fi ingestion, GSM/SMS, and real device authentication remain adapters to add after field validation.

## Design direction

Three style directions considered:

1. **Field instrument / editorial utility** (probability 0.07): dark ink, warm paper, signal orange, hard edges, technical labels, and strong traceability.
2. **Pastoral soft dashboard** (probability 0.05): rounded cards, plant greens, soft illustrations, and calmer consumer-app pacing.
3. **High-contrast industrial telemetry** (probability 0.06): black panels, neon status colors, dense tables, and command-center styling.

### Chosen: Field instrument / editorial utility

- **Design movement:** contemporary agricultural field notebook crossed with a dependable control-room instrument.
- **Core principles:** readable at a glance; evidence before decoration; warm local context; honest uncertainty.
- **Color philosophy:** clay and parchment acknowledge soil and grain, deep ink creates trust and contrast, and a single signal orange marks attention without turning every state into an alarm.
- **Layout paradigm:** a persistent left rail anchors the system while the main area uses asymmetric editorial bands, a live status strip, and wide evidence drawers rather than generic centered cards.
- **Signature elements:** a cropped-corner brand mark, thin surveyor lines, and numbered rule/evidence tags.
- **Interaction philosophy:** every action exposes what changed, why it changed, and whether the reading is current; simulator controls are explicit and reversible.
- **Animation:** restrained 160–220ms slide/fade for view changes and live updates; no looping decoration; honor reduced motion.
- **Typography system:** `Space Grotesk` for display and `IBM Plex Mono` for labels/technical evidence, with system fallbacks for offline reliability.
- **Brand essence:** measured farm intelligence for places where the network cannot be assumed. Personality: grounded, transparent, resilient.
- **Brand voice:** plain and direct. Example lines: “The sensor supplies the reading. The rule still decides.” and “Humid store: dry or ventilate grain today.”
- **Wordmark & logo:** `FIELD / SHIFT` stacked with a split-square mark that reads as a field plot and a storage bin.
- **Signature brand color:** signal orange `#E06B3C`.

## Build and delivery

Use dependency-light vanilla HTML/CSS/ES modules so the simulator and planner remain usable from a clean checkout. `npm run build` validates the public shell, route manifest, module syntax, docs, and generated replay. `npm test` uses Node's built-in test runner. A small local Node server serves the project at port 3000 for preview. GitHub Actions runs the same checks on pushes and pull requests. No secret is required for the app or CI.

## Implemented versus planned

Implemented now: dashboard views, shared deterministic engine adapter, simulator scenarios, field/store readings, stale/offline state, local buffering, technical trace, demo script, hardware docs, API contract, tests, and offline shell.

Simulated now: BLE/Wi-Fi device transport, ESP32 readings, calibration values, local alert delivery, and the Malam Sani scenario.

Planned: physical ESP32 firmware, real BLE/Wi-Fi ingestion, device authentication, GSM/SMS adapter, agronomist-reviewed crop parameters, verified climate observations, and validated forecast worker benchmarking.
