# FieldShift Field + Store — continuation handoff

**Project owner:** Ahmad Garba Adamu
**Source:** `rufatronics/fieldshift-ng` at `703d69c15e16e63950e9e0758011a7486978fbfc`
**New repository:** intended GitHub repository `fieldshift-field-store`

## Current state

This separate project is an offline-first vanilla web dashboard for three moments: plan before planting, watch measured field conditions, and protect stored grain. It is safe to run without an account, internet access, physical sensors, or API keys. The user-facing dashboard is in `public/index.html`, with styles in `public/app.css` and behavior in `public/app.js`.

## Decision authority

`shared/decision-engine.mjs` is the canonical deterministic engine. Keep its formulas and rule IDs aligned with the reference app unless an agronomist-reviewed change is explicitly requested. AI and forecasts remain advisory and must not change scores, remove gates, or rewrite crop parameters. Crop values are still placeholders.

## Device layer

`shared/device-contract.mjs` validates field/store JSON, labels stale/disconnected data, translates measurements to transparent coarse planner context, and evaluates store risk. `shared/simulator.mjs` supplies the seven documented scenarios. LocalStorage is used for last-known messages and a small queue. The app does not send readings anywhere by default.

## Required checks

```bash
npm run build
npm test
npm run replay
node --check public/app.js
node --check tools/replay-case.mjs
git diff --check
```

## Safe demo wording

Malam Sani is fictional. The 65/100 and 89/100 values are an illustrative replay, not observed yield, savings, or impact evidence. Hardware is simulated and not physically tested. Use the wording in `DEMO.md` and keep `PLACEHOLDER = true` until crop values are sourced and reviewed.

## Next work

Implement a physical ESP32 message adapter only after device authentication, calibration, enclosure, battery, and local connectivity are validated. Add real forecast benchmarking against persistence and seasonal-naive baselines. If enabling AI, keep provider credentials server-side and pass only the decision trace. Review local-language copy with native speakers and test on low-end Android/KaiOS-style browsers.
