# Validation plan

## Automated checks

The Node test suite checks that deterministic scores and safety gates remain stable, invalid device values are rejected, stale/disconnected readings are labeled correctly, field readings produce explicit rule mappings, store humidity produces `R-STORE-05`, flood context remains gated, simulator scenarios validate, and Lite mode contains a short result. `npm run build`, `npm test`, `npm run replay`, syntax checks, and `git diff --check` are the reproducible baseline.

## Calibration plan

For each field installation, record soil texture, probe depth, placement, date, weather, and paired hand/reference readings. Fit a local moisture translation only after enough paired observations exist. Track BME280 placement, temperature/humidity drift, water-level zero, battery voltage, and missing readings. Label readings uncalibrated until a named reviewer accepts the calibration record.

## Agronomic review

All crop parameters remain `PLACEHOLDER = true`. An agronomist or appropriate agricultural institution must review water ranges, cycle length, heat/flood tolerance, storage sensitivity, sequence bonuses, and local zone assumptions. Review Hausa, Yoruba, and Igbo translations with native speakers before formal release.

## Pilot evaluation

A real evaluation should pre-register outcomes and compare baseline practice with the tool without claiming causality from a simulator. Measure sensor calibration error, reading completeness, alert delivery, alert action rate, chosen rotations, grain loss to rot, and farmer-reported usability. Exact coordinates and personally identifying information should not be collected by default.

## Forecast and AI

Forecasts must be benchmarked against persistence and seasonal-naive baselines with rolling-origin tests, interval coverage, missing-data tests, and useful-horizon analysis. AI explanations must be judged for faithfulness to the supplied trace and must never modify scores, gates, or crop parameters. Neither is a substitute for agronomic review.
