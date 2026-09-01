Booze Control PWA v2

Changes
- Bacardi quick-add card is split into 1 shot and half-shot actions.
- Half shot adds 0.5 drink-equivalent.
- Totals, staging, calendar day totals, and detail totals support decimal amounts.
- At 8.0 total drink-equivalents for the current tracking day, a red HIGH BAC RISK banner latches on until the 4:00 AM day reset.
- The banner is a risk warning, not an actual BAC calculation.
- Existing v1 local data is migrated automatically; old entries default to 1.0.
- Service worker cache bumped to v2 so GitHub Pages updates propagate more reliably.

GitHub Pages update
Upload/replace index.html, styles.css, app.js, sw.js, manifest.json, and the icons folder in the existing repository root, then commit the changes.
