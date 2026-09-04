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

Final warning update:
- The HIGH BAC RISK banner is now live rather than latched.
- It appears at 8.0+ current-day drink-equivalents and disappears immediately if current-day entries are removed below 8.0.
- It reappears if the current-day total reaches 8.0 again.


Update v5
- Added Rumple split quick add with full and half-shot buttons.
- Added Long Drink, Key Lime Pie Shot, and TWEA quick add cards.

- Moved the 4 extra drinks to a swipeable second quick-add page.
- Added favorite-page support so either quick-add page can open first on launch.
- Updated Long Drink with a better icon/logo treatment.


Update v6
- Fixed Quick Add swipe so swiping the cards changes the active tab.
- Renamed More to Staples.
- Tightened spacing between the swipe hint and cards.
- Keeps the existing localStorage key so calendar and staged data survive normal GitHub Pages updates.
