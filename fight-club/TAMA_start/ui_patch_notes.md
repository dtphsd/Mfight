# UI Patch Notes

> Last updated: 2026-03-19 17:22 MSK

Use this file as the canonical running log only for UI-system changes connected to the UI Systems Agent.

Include here:

- UI interaction changes
- UI architecture changes
- visual-system changes
- readability and accessibility fixes
- UI agent-surface improvements

Do not include here:

- combat balance work
- hunting changes
- unrelated app infrastructure changes
- non-UI experiments

Patch note rule for UI work:

- if a change is measurable, include exact numbers
- use `old -> new` format when sizes, counts, timings, or layout values changed
- do not write vague notes like "cleaned up a bit" or "improved slightly"

---

## 2026-03-18 - UI Master Console Introduced

- Added a second specialist agent based on the same visual shell as Combat Master.
- Introduced an in-screen tab switcher so the interface can toggle between `Combat Master` and `UI Master`.
- Gave the UI agent its own dedicated journal and patch-notes sources instead of mixing UI history into combat logs.
- Switched the UI agent portrait to `Kitsune-Bit.jpg`.
- Preserved the same metrics, activity log, patch-notes modal, and progression model so both specialist agents behave consistently.

## 2026-03-18 - UI Agent Data Channels Initialized

- Added `ui_agent_journal.md` as the UI specialist memory file.
- Added `ui_patch_notes.md` as the UI specialist patch-log file.
- Mirrored the same journal schema:
  - `Impact`
  - `XP`
  - `Track`
  - `Type`
  - `Achievement`
- Mirrored the same patch-note behavior so the UI agent can evolve with the same discipline as Combat Master.

## 2026-03-19 - Combat Intent Selector Added To Sandbox UI

- Added a dedicated `Combat Intent` selector to the `Combat Sandbox` action panel.
- Added four visible intent buttons:
  - `Neutral`
  - `Aggressive`
  - `Guarded`
  - `Precise`
- Surfaced the active intent directly in the action summary and tag strip instead of hiding it inside runtime only.
- Surfaced the intent description in the action panel so the player can read the tradeoff before resolving the round.
- This UI patch belongs to `UI Master` even though `Combat Master` owns the underlying mechanic, because the feature changed the live combat interaction surface.

## 2026-03-19 - Specialist Log Overflow And Scroll Layout Repaired

- Fixed a real UI bug in the `Ecosystem Agents` activity logs and patch-note modal.
- Repaired the log layout so the scroll stays inside the log area instead of squeezing the cards themselves.
- Switched the scrolling stacks from grid compression to stable vertical flow:
  - `activity log list layout: grid -> flex column`
  - `patch notes list layout: grid -> flex column`
- Locked card sizing so long combat history no longer crushes text:
  - `card flex behavior: auto-compressing -> 0 0 auto`
- Added overflow safety for heavier `Combat Master` content:
  - `minWidth: unset -> 0`
  - `overflowWrap: normal -> anywhere`
- Added a styled specialist scrollbar while keeping the original panel shape intact.

## 2026-03-19 - Combat Intent Surface Became Resource-Colored And More Compact

- Tightened the `Combat Intent` selector vertically so it spends less height in the action stack.
- Reworked the selected intent button into a softer lit-state instead of a plain orange active fill.
- Mapped intent colors onto existing combat resource tones:
  - `Neutral -> Momentum`
  - `Aggressive -> Rage`
  - `Guarded -> Guard`
  - `Precise -> Focus`
- Added edge-lighting and translucent state fill to the selected intent shell.
- Added the same intent-color signal to the `Current Action` summary card so the selected posture reads in both places, not only in the selector.
- Reduced duplicate tag noise by promoting intent to a dedicated state chip inside the summary card.

## 2026-03-19 - Combat Intent State Signal Moved To The Character Silhouette

- Corrected the previous UI pass so the live intent state is now carried by the player silhouette shell instead of the `Current Action` summary card.
- Restored the `Current Action` block to its simpler neutral role.
- Wrapped the player silhouette with:
  - soft edge-lighting
  - translucent state fill
  - resource-colored glow tied to the selected intent
- This made the intent read like the fighter's active stance instead of a decorated text panel.

## 2026-03-19 - Combat Intent Copy Switched From Flavor Text To Live Numbers

- Replaced vague intent helper copy with direct numeric combat modifiers.
- The selector now tells the player exactly what the stance changes:
  - `Aggressive: +8% damage, +4 crit, -6 dodge, -8 block chance, -6 block power`
  - `Guarded: -6% damage, +8 dodge, +10 block chance, +8 block power`
  - `Precise: -4% damage, +2 crit, -2 dodge, -2 block chance, -2 block power, +8 dodge suppression, +30% state bonus`
- `Neutral` was simplified to `No modifier` instead of filler copy.

## 2026-03-19 - Combat Intent Copy Compressed For Faster Mid-Fight Reading

- Shortened numeric intent descriptions into a denser tactical format.
- New read pattern:
  - `Aggressive: DMG +8% | Crit +4 | Dodge -6 | Block -8 | Block Power -6`
  - `Guarded: DMG -6% | Dodge +8 | Block +10 | Block Power +8`
  - `Precise: DMG -4% | Crit +2 | Dodge -2 | Block -2 | Block Power -2 | Suppress +8 | State +30%`
- This keeps the real numbers but makes the selector faster to scan during live turn planning.

## 2026-03-19 - Intent Copy Clarified Block Power Naming

- Replaced vague `Power` shorthand with explicit `Block Power` in the compressed intent readouts.
- This keeps the compact layout but removes ambiguity between raw damage power and block-specific mitigation strength.

## 2026-03-19 - Snapshot Panel Started Reflecting The Active Intent

- The player `Snapshot` block no longer shows only stat-and-gear baseline.
- It now reflects the selected live stance for:
  - `DMG`
  - `Crit`
  - `Dodge`
  - `Block`
  - `Block Power`
- Added `Intent` as an explicit snapshot metric.
- Expanded the player snapshot grid from `2 -> 3` columns so the extra state data still reads cleanly.

## 2026-03-19 - Snapshot Was Moved Into A Horizontal Strip

- Changed the player `Snapshot` metrics from a vertical grid to a horizontal strip.
- Layout mode:
  - `player snapshot layout: grid -> horizontal rail`
- This keeps the new intent-aware numbers visible without stretching the sidebar vertically as much as the grid version did.

## 2026-03-19 - Snapshot Became A Collapsible Diagnostic Block

- Replaced the horizontal snapshot rail with a collapsible `Snapshot` panel for both player and bot sidebars.
- Restored the regular metric grid inside the expanded state.
- Added a lightweight collapsed summary state so the sidebar keeps its older vertical rhythm until the panel is explicitly opened.
- This keeps the intent-aware data available without forcing it to stay visible all the time.

## 2026-03-19 - Snapshot Learned To Show Real Crit Pressure Against The Current Target

- Replaced the misleading single `Crit` read with a split tactical read:
  - `Crit -> Base Crit`
  - `added -> Crit vs Target`
- The player snapshot now surfaces the target-adjusted crit chance instead of making the player mentally subtract enemy anti-crit.
- The bot snapshot now mirrors the same truth with `Crit vs You`.
- Added display clamping for chance readouts:
  - `uncapped display -> 0..95%`
