# Demo: Malam Sani — plan, watch, protect

This is a fictional example scenario. It is not a real farmer study and the scores are not yield, income, savings, or impact evidence.

## Run it

From a clean checkout:

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`. The dashboard does not require an account, internet access, physical sensors, or secrets.

## Live sequence

1. Open **Plan**. The preloaded profile shows Kano, a low plot, no irrigation, poor storage, and the illustrative previous rotation maize → maize → groundnut. The drought-stress replay labels the current plan 65/100 and the top alternative pearl millet → cowpea → sesame 89/100.
2. Open **Demo mode** and choose **Drying soil**. The Live field view shows the raw sensor message, reading age, a visible translation step, and `R-WATER-01` / `R-HEAT-03` where applicable.
3. Choose **Humid store**. Store watch shows `R-STORE-05`, a high-risk banner, and the plain action: dry or ventilate grain and check the store today.
4. Choose **Stale / disconnected**. The app retains the last-known field reading, marks it stale/disconnected, and does not silently treat it as a fresh measurement.
5. Open **Technical evidence** to inspect raw readings, transformations, affected rules, and the advisory-only boundary.
6. Open `/lite.html` for the short-result fallback.

## Fallback sequence

If a simulator control is unavailable, use the dashboard's preloaded normal readings and describe the Drying soil, Humid store, and Stale/disconnected messages from `hardware/simulator/scenarios.json`. The same JSON contract is the future device handoff.

## Honest wording

Say: “Under this illustrative stress replay, the rules flagged the maize-heavy plan and ranked a safer candidate.” Do not say that Malam Sani gained yield, income, or savings. Crop values are placeholders until agronomist review. The simulator demonstrates software behavior, not sensor accuracy or hardware readiness.
