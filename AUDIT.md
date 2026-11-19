# FieldShift NG source audit

## Source state

- Source repository: `https://github.com/rufatronics/fieldshift-ng`
- Local reference: `/home/ubuntu/fieldshift-ng-reference`
- Branch: `main`
- Commit used: `703d69c15e16e63950e9e0758011a7486978fbfc`
- Working tree: clean and synchronized with `origin/main`
- Original project remains unchanged.

## Findings

The old project is a static vanilla HTML/CSS/JavaScript app with Vercel functions. Its decision engine is embedded in `public/index.html` and uses the checked-in placeholder crop catalog in `public/data.js`. It has a clean offline-capable farmer flow, Lite mode, advisory forecast fallback, and a reproducible Kano replay script. `AGENT.md`, `HANDOFF.md`, and `README.md` confirm the rules-first safety boundary and the illustrative nature of the Kano numbers.

## Reuse

- Crop catalog and zone climatology are carried forward as explicitly marked demo/placeholder data.
- Deterministic formulas and rule IDs are extracted into `shared/decision-engine.mjs` and reused by browser, replay, simulator translation, and tests.
- The original forecast/AI boundary and Lite-mode intent are preserved as documentation and demo behavior, but no provider is required for this new offline MVP.
- The existing Kano/Malam Sani scenario remains clearly labeled fictional and illustrative.

## Isolation

- The old `public/index.html` is not replaced and the old repository is not made a dependency.
- Hardware ingestion, store monitoring, device contracts, and simulator code are new modules in the separate project.
- No new hardware is represented as physically tested; BLE, Wi-Fi, GSM/SMS, and calibration remain adapters/planned work.
- No secrets, tokens, private worker URLs, exact coordinates, or `.env` files are copied into the new repository.
