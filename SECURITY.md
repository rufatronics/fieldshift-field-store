# Security and privacy

The current application is a local simulator and offline dashboard. It has no account system, no remote ingestion endpoint, and no required secrets. The browser stores recent readings in localStorage on the device. Sync is not implemented and must be explicitly enabled in a future design.

Never commit `.env` files, API keys, GitHub tokens, private URLs, model checkpoints, or device credentials. Keep AI, forecast, and SMS provider credentials server-side. The `.env.example` file contains names only.

Exact coordinates are not part of the device message contract. A future location feature should use only a coarse, device-local zone unless a user explicitly opts into another behavior. Do not upload a location by default.

A future device-ingestion adapter must authenticate registered devices, validate timestamps and ranges, reject replayed messages, rate-limit requests, log a device ID without unnecessary personal data, and rotate credentials. BLE pairing and local Wi-Fi trust are not security guarantees by themselves.

SMS is an optional future adapter. The current fake alert provider only returns a local test receipt and sends nothing. Before enabling GSM or an external provider, require explicit configuration, a destination consent record, rate limiting, duplicate suppression, and a clear message such as: “FieldShift alert: store humidity is high at 73%. Dry or ventilate grain and check the store today. Rule: R-STORE-05.”

A sensor disconnect must never clear a safety warning. The last known reading stays visible with its timestamp and stale/disconnected quality. Rules remain the authority; AI and forecasts may explain supplied context but cannot override `R-WATER-01`, `R-SEASON-02`, `R-HEAT-03`, `R-FLOOD-04`, `R-STORE-05`, `R-SEQ-01`, `R-SEQ-02`, `R-SEQ-03`, or `R-GATE`.
