# FieldShift Field + Store — delivery outcomes

## Shared decision authority

- [ ] Preserve the old repository separately and document the source commit.
- [ ] Provide one shared deterministic module for crop scoring, rotations, gates, and replay.
- [ ] Keep `R-WATER-01`, `R-SEASON-02`, `R-HEAT-03`, `R-FLOOD-04`, `R-STORE-05`, `R-SEQ-01`, `R-SEQ-02`, `R-SEQ-03`, and `R-GATE` visible and non-overridable.

## Field + Store dashboard

- [ ] Provide separate Plan, Live field, Store watch, Devices, Demo mode, and Technical evidence views.
- [ ] Show plain-language status first and expandable raw readings, timestamps, transformations, and rule IDs.
- [ ] Demonstrate Malam Sani as a clearly fictional illustrative scenario with the 65/89 replay labels.
- [ ] Keep Lite mode available as a short, low-resource result surface.

## Sensor and simulator layer

- [ ] Validate device identity, type, timestamps, reading ranges, connection, battery, calibration, and stale thresholds.
- [ ] Support simulator scenarios for normal field, drying soil, heavy rain/flood, hot field, safe store, humid store, and stale/disconnected device.
- [ ] Translate readings transparently to coarse planner context without rewriting crop parameters.
- [ ] Store latest readings locally, retain last-known values when disconnected, and show age/quality.
- [ ] Evaluate store humidity/temperature as a local `R-STORE-05` alert with practical drying/ventilation action.

## Offline, privacy, and safety

- [ ] Cache the app shell and keep the demo usable without network access or an account.
- [ ] Make sync opt-in and never upload exact coordinates by default.
- [ ] Keep forecast and AI visibly advisory and separate from scoring.
- [ ] Never claim fictional farmer impact, yield, savings, or validated agronomic parameters.

## Documentation and hardware concept

- [ ] Provide README, ARCHITECTURE, HARDWARE, DEMO, API, VALIDATION, SECURITY, CHANGELOG, and AGENT handoff docs.
- [ ] Document field/store BOM, wiring/enclosure notes, simulator JSON, message schema, alert adapter, and implementation status.

## Verification and repository delivery

- [ ] `npm run build` passes from a clean checkout.
- [ ] `npm test` covers engine behavior, schema validation, stale data, translation, store alerts, flood gates, forecast separation, simulator scenarios, and lite smoke behavior.
- [ ] Node syntax checks, replay, and `git diff --check` pass.
- [ ] GitHub Actions runs reproducible checks without secrets.
- [ ] Push the new project to a separate `fieldshift-field-store` repository without changing `rufatronics/fieldshift-ng`.
