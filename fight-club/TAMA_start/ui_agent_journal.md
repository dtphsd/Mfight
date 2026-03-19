# UI Agent Journal

> Last updated: 2026-03-20 01:00 MSK

**Agent:** Interface Systems Specialist  
**Project:** Fight Club  
**Scope:** UI-only evolution log

---

## Purpose

This journal is the UI-only companion to the general evolution journal.

Use it to record:

- meaningful UI milestones
- interaction-system lessons
- UX clarity lessons
- design consistency lessons
- accessibility and readability fixes
- UI architecture safety lessons

Do not use it for unrelated project work.

---

## Entry Rules

Log an entry when work produced a meaningful UI lesson, for example:

- a serious UI bug was found or fixed
- a confusing interaction was clarified
- a reusable visual or interaction pattern was established
- a UI architecture or state-flow issue was resolved
- UI docs or agent surfaces were re-synced after a truth-model shift

Avoid logging:

- tiny cosmetic edits with no broader lesson
- every spacing tweak
- repetitive micro-iterations with no new insight

---

## Entry Template

```md
### UI-001 - Title
**Date**: YYYY-MM-DD
**Impact**: X/10
**XP**: +N
**Track**: Visual Systems | Interaction Design | UX Clarity | Design Consistency | UI Safety
**Type**: Bug Fix | UX Improvement | UI Systems | Docs Sync | Design Pattern | Accessibility
**Achievement**: optional

#### What happened
Short factual summary.

#### Why it mattered
Why this changed understanding or safety.

#### UI lesson
What the UI agent should remember next time.

#### Pattern
Reusable UI pattern or anti-pattern.
```

Impact scale:

- `1/10` to `3/10` - small or local UI lesson
- `4/10` to `6/10` - meaningful systems step or reusable insight
- `7/10` to `8/10` - high-impact fix or major UX improvement
- `9/10` to `10/10` - critical UI save, major interaction repair, or high-risk workflow fix

XP rule:

- every `UI` event must explicitly say how much XP it gives
- XP should scale with proven impact, not with effort alone
- verified UI fixes and reusable design knowledge should award more XP than raw exploration

---

## Starter Status

## Status

- Name: Interface Systems Specialist
- Rank: Initiate
- Level: 16
- Total XP: 86
- Next Level XP: 93

## Mastery Tracks

- Visual Systems: 10
- Interaction Design: 22
- UX Clarity: 23
- Interaction Design: 15
- Design Consistency: 14
- UI Safety: 9

## Achievements

- Safe Online Dock
- Ready Room

<!-- COMBAT_AGENT_JSON
{
  "name": "Interface Systems Specialist",
  "role": "UI Systems Agent",
  "domain": "Fight Club UI, UX, interaction flow and presentation systems",
  "summary": "Tracks UI bugs, interaction drift, design-system lessons, UI-safe fixes, and readable interface evolution over time.",
  "level": 16,
  "rank": "Initiate",
  "xpCurrent": 86,
  "xpNext": 93,
  "entries": 18,
  "bugsLogged": 2,
  "bugsKilled": 2,
  "safeFixes": 18,
  "battleWins": 0,
  "achievements": ["Safe Online Dock", "Ready Room"],
  "tags": ["Visual Systems", "Interaction Design", "UX Clarity", "Design Consistency", "UI Safety"],
  "tracks": [
    { "label": "Visual Systems", "value": 20 },
    { "label": "Interaction Design", "value": 42 },
    { "label": "UX Clarity", "value": 42 },
    { "label": "Design Consistency", "value": 31 },
    { "label": "UI Safety", "value": 24 }
  ],
  "lastUpdated": "2026-03-20T01:00:00+03:00"
}
-->

---

## UI Entries

### UI-018 - Online Duel Screen Stopped Acting Like A Two-Operator Lab
**Date**: 2026-03-19
**Impact**: 6/10
**XP**: +6
**Track**: Interaction Design | UX Clarity | UI Safety
**Type**: UX Improvement
**Achievement**: none

#### What happened
The online prototype was cleaned from `Online Duel Lab` into a more product-like `Online Duel` screen with `Create Room`, `Join Match`, `Match Status`, separate `Host Side` / `Guest Side` views, and a small round planner for attack and defense zones.

#### Why it mattered
The original lab screen proved the seam, but it still looked like two developers driving both clients from one debugging console. Moving lifecycle controls under `Debug Tools` and promoting the room flow made the screen feel like a match surface instead of a transport demo.

#### UI lesson
Once a prototype proves the system boundary, the next UI job is to remove debug-first framing from the default path and let the real player journey become the primary layout.

#### Pattern
Keep risky lifecycle controls available behind an explicit debug toggle, while the default multiplayer screen focuses on room entry, ready check, and turn planning.

<!-- CMB_JSON
{"id":"UI-018","date":"2026-03-19","impact":6,"xp":6,"track":"Interaction Design","achievement":"none","type":"UX Improvement","title":"Online Duel Screen Stopped Acting Like A Two-Operator Lab"}
-->

### UI-017 - Online Duel Lab Learned To Surface Timeout Failure Safely
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +5
**Track**: Interaction Design | UI Safety
**Type**: UI Systems
**Achievement**: none

#### What happened
The `Online Duel Lab` gained a dedicated `Force Timeout` control so stale-room handling can be surfaced and verified in the prototype without waiting on real elapsed time.

#### Why it mattered
Timeout behavior is part of multiplayer UX, not only backend hygiene. The lab can now demonstrate abandoned-room state directly instead of hiding that safety rule in tests and patch notes.

#### UI lesson
If a backend safety rule affects room lifecycle, give the prototype a visible way to exercise it.

#### Pattern
Expose debug-safe lifecycle triggers in prototype multiplayer UI so authority rules stay reviewable.

<!-- CMB_JSON
{"id":"UI-017","date":"2026-03-19","impact":5,"xp":5,"track":"Interaction Design","achievement":"none","type":"UI Systems","title":"Online Duel Lab Learned To Surface Timeout Failure Safely"}
-->

### UI-016 - Online Duel Lab Learned To Show Room Identity And Offline State
**Date**: 2026-03-19
**Impact**: 6/10
**XP**: +6
**Track**: Interaction Design | Design Consistency | UI Safety
**Type**: UI Systems
**Achievement**: none

#### What happened
The `Online Duel Lab` now surfaces a dedicated room code, explicit disconnect and reconnect controls for both seats, and participant cards that distinguish `Ready`, `Waiting`, and `Offline` instead of flattening everything into one status word.

#### Why it mattered
The backend had already learned connection truth, so the UI needed to stop hiding that state in raw message JSON. The lab now reads more like a real room surface and less like a transport debugger.

#### UI lesson
If a multiplayer prototype gains a new authority state, surface it directly in the room UI instead of expecting users to infer it from logs.

#### Pattern
Promote room identity and connection state into first-class lobby UI before adding more match controls.

<!-- CMB_JSON
{"id":"UI-016","date":"2026-03-19","impact":6,"xp":6,"track":"Interaction Design","achievement":"none","type":"UI Systems","title":"Online Duel Lab Learned To Show Room Identity And Offline State"}
-->

### UI-014 - Online Duel Lab Opened A Safe UI Dock For Multiplayer
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +8
**Track**: Interaction Design | UX Clarity
**Type**: Prototype Surface
**Achievement**: Safe Online Dock

#### What happened
The first online-duel UI surface was added as a separate `Online Duel Lab` screen with host, join, sync, submit, and server-message feedback over the local backend seam.

#### Why it mattered
The project can now validate online interaction flow without injecting fragile multiplayer controls into the main combat sandbox before the backend stack is stable enough.

#### UI lesson
When a new system is still experimental, give it its own explicit lab surface instead of overloading a stable gameplay screen.

#### Pattern
Prototype risky cross-domain UX in a separate lab before merging it into the main game loop.

<!-- CMB_JSON
{"id":"UI-014","date":"2026-03-19","impact":5,"xp":8,"track":"Interaction Design","achievement":"Safe Online Dock","type":"Prototype Surface","title":"Online Duel Lab Opened A Safe UI Dock For Multiplayer"}
-->

### UI-015 - Online Duel Lab Stopped Skipping Pre-Fight Consent
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +8
**Track**: UX Clarity | UI Safety
**Type**: UX Improvement
**Achievement**: Ready Room

#### What happened
The `Online Duel Lab` gained a real pre-fight lobby with ready and unready controls, and both client panels now show each participant's readiness state before attacks can be submitted.

#### Why it mattered
The earlier prototype proved the transport and authority flow, but it skipped the social and timing contract players expect before a match begins. The lab now communicates start intent instead of looking like two clients can instantly force combat.

#### UI lesson
For multiplayer flows, a visible pre-fight confirmation step is part of the interface truth, not optional garnish.

#### Pattern
Show explicit ready state and gate the first combat action behind it whenever the room represents more than one human-controlled participant.

<!-- CMB_JSON
{"id":"UI-015","date":"2026-03-19","impact":5,"xp":8,"track":"UI Safety","achievement":"Ready Room","type":"UX Improvement","title":"Online Duel Lab Stopped Skipping Pre-Fight Consent"}
-->

### UI-013 - Specialist Console Scaled To A Third Master Without Forking The Shell
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +4
**Track**: Design Consistency
**Type**: UI Systems
**Achievement**: none

#### What happened
The shared `Ecosystem Agents` console was extended to include `Backend Master` while preserving the same shell, metrics, timeline, and patch-note interaction model already used by the existing specialists.

#### Why it mattered
Adding a third specialist by cloning the same shell keeps the hub scalable and predictable. It avoids fragmenting the specialist experience into multiple unrelated screens as the project grows.

#### UI lesson
When a specialist system expands, scale the existing shell before inventing a second UI language.

#### Pattern
Grow specialist consoles through mirrored data channels and tab expansion, not separate one-off screens.

<!-- CMB_JSON
{"id":"UI-013","date":"2026-03-19","impact":4,"xp":4,"track":"Design Consistency","achievement":"none","type":"UI Systems","title":"Specialist Console Scaled To A Third Master Without Forking The Shell"}
-->

### UI-012 - Snapshot Stopped Presenting Base Crit As If It Were Matchup Truth
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +2
**Track**: UX Clarity
**Type**: UX Improvement
**Achievement**: none

#### What happened
The sandbox snapshot replaced the ambiguous `Crit` read with `Base Crit` and a new `Crit vs Target` metric. The bot snapshot now mirrors this with `Crit vs You`.

#### Why it mattered
The previous number looked like live crit truth even though the runtime subtracts defender anti-crit before the roll. That made the combat UI over-promise crit frequency and pushed players toward false bug reports.

#### UI lesson
If a combat stat changes materially against a live target, the diagnostic surface should show the matchup value directly instead of only the baseline build number.

#### Pattern
Split baseline and matchup truth when a stat has a target-facing formula layer.

<!-- CMB_JSON
{"id":"UI-012","date":"2026-03-19","impact":4,"xp":2,"track":"UX Clarity","achievement":"none","type":"UX Improvement","title":"Snapshot Stopped Presenting Base Crit As If It Were Matchup Truth"}
-->

### UI-011 - Snapshot Switched From A Rail To A Collapsible Diagnostic Surface
**Date**: 2026-03-19
**Impact**: 3/10
**XP**: +3
**Track**: Design Consistency
**Type**: UX Improvement
**Achievement**: none

#### What happened
The horizontal `Snapshot` rail was replaced with a collapsible panel that keeps the old vertical rhythm when closed and restores the full metric grid only when opened.

#### Why it mattered
The rail preserved data but still hurt readability when the player wanted a calmer panel stack. A collapsible block solved the space problem without hiding the new stance-aware numbers permanently.

#### UI lesson
When diagnostic UI grows beyond its original footprint, collapse it behind a clear toggle before forcing a permanent new reading direction.

#### Pattern
Use collapsible diagnostics for high-density optional combat data, and keep the expanded state faithful to the familiar layout.

<!-- CMB_JSON
{"id":"UI-011","date":"2026-03-19","impact":3,"xp":3,"track":"Design Consistency","achievement":"none","type":"UX Improvement","title":"Snapshot Switched From A Rail To A Collapsible Diagnostic Surface"}
-->

### UI-010 - Snapshot Recovered Its Lighter Vertical Rhythm Through A Horizontal Rail
**Date**: 2026-03-19
**Impact**: 2/10
**XP**: +2
**Track**: Design Consistency
**Type**: UX Improvement
**Achievement**: none

#### What happened
The player `Snapshot` metrics were moved from a denser grid into a horizontal strip after the new intent-aware values made the vertical version feel too heavy.

#### Why it mattered
The extra numbers were useful, but the presentation started to fight the original panel rhythm. The horizontal rail kept the new information while restoring the lighter sidebar feel.

#### UI lesson
When a diagnostic panel gains more live data, change the reading direction before letting it take over the whole column.

#### Pattern
Use horizontal metric rails to preserve vertical rhythm when a small tactical panel becomes denser over time.

<!-- CMB_JSON
{"id":"UI-010","date":"2026-03-19","impact":2,"xp":2,"track":"Design Consistency","achievement":"none","type":"UX Improvement","title":"Snapshot Recovered Its Lighter Vertical Rhythm Through A Horizontal Rail"}
-->

### UI-009 - Snapshot Stopped Hiding The Active Stance Behind Base Stats
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +4
**Track**: UX Clarity
**Type**: UX Improvement
**Achievement**: none

#### What happened
The player `Snapshot` panel was upgraded so it now reflects the selected `Combat Intent` instead of showing only baseline build values. It now updates live damage, crit, dodge, block, and block power readouts and adds the active intent as its own metric.

#### Why it mattered
Stat allocation already showed up there, but stance selection did not, which made the panel tell only half the truth about the current turn state.

#### UI lesson
If a turn-state modifier materially changes combat numbers, the snapshot panel should surface it immediately instead of forcing the player to infer it from another block.

#### Pattern
Snapshot surfaces should show the current tactical state, not only the permanent build baseline.

<!-- CMB_JSON
{"id":"UI-009","date":"2026-03-19","impact":4,"xp":4,"track":"UX Clarity","achievement":"none","type":"UX Improvement","title":"Snapshot Stopped Hiding The Active Stance Behind Base Stats"}
-->

### UI-008 - Intent Copy Stopped Hiding Block Power Behind A Generic Label
**Date**: 2026-03-19
**Impact**: 1/10
**XP**: +1
**Track**: UX Clarity
**Type**: UX Improvement
**Achievement**: none

#### What happened
The compressed `Combat Intent` readouts replaced the shorthand `Power` with the explicit label `Block Power`.

#### Why it mattered
The shorter format was good, but `Power` was ambiguous and could be read as general damage force instead of mitigation strength.

#### UI lesson
Compact combat copy can stay short, but the nouns still need to point at the exact mechanic they modify.

#### Pattern
When compressing numeric UI copy, shorten the sentence before shortening the mechanic name.

<!-- CMB_JSON
{"id":"UI-008","date":"2026-03-19","impact":1,"xp":1,"track":"UX Clarity","achievement":"none","type":"UX Improvement","title":"Intent Copy Stopped Hiding Block Power Behind A Generic Label"}
-->

### UI-007 - Numeric Intent Copy Was Compressed Into A Scan-First Combat Format
**Date**: 2026-03-19
**Impact**: 2/10
**XP**: +2
**Track**: UX Clarity
**Type**: UX Improvement
**Achievement**: none

#### What happened
The numeric `Combat Intent` helper lines were shortened from sentence-style modifiers into a tighter tactical read format with `|` separators.

#### Why it mattered
The content was already truthful, but still slower to parse than necessary for a live turn-planning control.

#### UI lesson
For combat-facing controls, truthful numbers are good; truthful numbers in a scan-first format are better.

#### Pattern
Compress short tactical stat reads into pipe-separated chunks when the player needs to parse them mid-fight.

<!-- CMB_JSON
{"id":"UI-007","date":"2026-03-19","impact":2,"xp":2,"track":"UX Clarity","achievement":"none","type":"UX Improvement","title":"Numeric Intent Copy Was Compressed Into A Scan-First Combat Format"}
-->

### UI-006 - Combat Intent Help Became Numeric Instead Of Decorative
**Date**: 2026-03-19
**Impact**: 3/10
**XP**: +3
**Track**: UX Clarity
**Type**: UX Improvement
**Achievement**: none

#### What happened
The `Combat Intent` selector stopped using flavor-style helper copy and now shows the real numeric effects of each stance.

#### Why it mattered
This mechanic affects live formulas. For a tactical combat control, vague prose is less useful than a short exact read of what changes this turn.

#### UI lesson
When a control changes combat math directly, prefer compact numeric truth over atmospheric wording.

#### Pattern
Treat stance and formula selectors like tactical instruments: show the numbers first and let flavor stay secondary.

<!-- CMB_JSON
{"id":"UI-006","date":"2026-03-19","impact":3,"xp":3,"track":"UX Clarity","achievement":"none","type":"UX Improvement","title":"Combat Intent Help Became Numeric Instead Of Decorative"}
-->

### UI-005 - Intent Read Better As A Fighter State Than As A Summary Card Decoration
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +4
**Track**: Interaction Design
**Type**: UX Improvement
**Achievement**: none

#### What happened
The intent-color state signal was moved off the `Current Action` summary card and onto the player silhouette shell, where it now behaves like an active stance aura around the fighter.

#### Why it mattered
The earlier pass colored the wrong block. The summary card is informational, but the silhouette is the part of the screen that actually represents the fighter's current posture.

#### UI lesson
When a state belongs to the character, attach the visual emphasis to the character surface first, not to a nearby text panel.

#### Pattern
Put live stance, mood, and posture signals on the avatar or silhouette shell, and let summary cards stay readable and secondary.

<!-- CMB_JSON
{"id":"UI-005","date":"2026-03-19","impact":4,"xp":4,"track":"Interaction Design","achievement":"none","type":"UX Improvement","title":"Intent Read Better As A Fighter State Than As A Summary Card Decoration"}
-->

### UI-004 - Combat Intent Surface Learned To Signal State Through Resource Color
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +5
**Track**: Visual Systems
**Type**: UX Improvement
**Achievement**: none

#### What happened
The `Combat Intent` UI was tightened vertically and given a clearer live-state language: the selected intent now lights its edges, uses a translucent resource-colored fill, and mirrors that same posture color in the `Current Action` summary card.

#### Why it mattered
The mechanic already existed, but the old selector still looked like a generic button strip. This pass made the chosen posture feel like a live combat state instead of a small text toggle, and it reduced visual noise by turning intent into one clear signal.

#### UI lesson
If a combat choice is important enough to affect turn identity, it should have one consistent color language across both the selector and the active summary card.

#### Pattern
Bind tactical posture UI to the same visual family as the system resource it emotionally matches, and use soft glow plus translucent fill instead of heavy opaque active states.

<!-- CMB_JSON
{"id":"UI-004","date":"2026-03-19","impact":5,"xp":5,"track":"Visual Systems","achievement":"none","type":"UX Improvement","title":"Combat Intent Surface Learned To Signal State Through Resource Color"}
-->

### UI-003 - Specialist Log Cards Stopped Collapsing Under Heavy Combat History
**Date**: 2026-03-19
**Impact**: 6/10
**XP**: +6
**Track**: UI Safety
**Type**: UI Bug Fix
**Achievement**: none

#### What happened
The `Combat Master` activity log exposed a layout bug where longer real content caused log cards to compress vertically and let text slip behind the card bounds. The scroll behavior was repaired so the list scrolls internally while cards keep their natural height.

#### Why it mattered
This was not cosmetic drift. The specialist console was hiding readable history exactly where dense combat logs are supposed to be trusted most, and the problem only appeared under the heavier live dataset.

#### UI lesson
If one domain produces much denser real content than another, treat it as a UI safety case and validate the component under the heavier dataset instead of trusting the lighter variant.

#### Pattern
For scrollable card feeds, keep the outer panel shape stable, make the scroll live in the inner list, and prevent cards from auto-compressing under overflow pressure.

<!-- CMB_JSON
{"id":"UI-003","date":"2026-03-19","impact":6,"xp":6,"track":"UI Safety","achievement":"none","type":"UI Bug Fix","title":"Specialist Log Cards Stopped Collapsing Under Heavy Combat History"}
-->

### UI-002 - Combat Intent Selector Surfaced Turn Posture In Sandbox
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +8
**Track**: Interaction Design
**Type**: UI Systems
**Achievement**: none

#### What happened
The new `Combat Intent` mechanic was surfaced through a dedicated selector in the `Combat Sandbox`, along with visible intent tags and readable summary text in the current-action panel.

#### Why it mattered
Without a readable selector, the mechanic would exist mostly as hidden runtime state. The UI now makes turn posture an explicit player decision instead of an invisible modifier.

#### UI lesson
If a combat mechanic changes turn expression, the player must see and understand that choice before round resolution, not only infer it from the result log later.

#### Pattern
When a new system adds a one-turn decision layer, expose it as a compact pre-resolution control plus a mirrored summary in the selected-action card.

<!-- CMB_JSON
{"id":"UI-002","date":"2026-03-19","impact":5,"xp":8,"track":"Interaction Design","achievement":"none","type":"UI Systems","title":"Combat Intent Selector Surfaced Turn Posture In Sandbox"}
-->

### UI-001 - Specialist Console Mirrored From Combat Master
**Date**: 2026-03-18
**Impact**: 5/10
**XP**: +9
**Track**: UX Clarity
**Type**: UI Systems
**Achievement**: none

#### What happened
The Combat Master interface pattern was adopted as the base for a second specialist console so UI work can now be tracked with the same journal, patch-note, and progression model.

#### Why it mattered
This creates a shared specialist-agent UX instead of fragmenting combat and UI work into different interface styles and different logging habits.

#### UI lesson
When a specialist surface already works, clone the shell and separate only the data sources, not the entire interface pattern.

#### Pattern
Preserve one specialist-console language across multiple domain agents and swap only data, imagery, labels, and logs.

<!-- CMB_JSON
{"id":"UI-001","date":"2026-03-18","impact":5,"xp":9,"track":"UX Clarity","achievement":"none","type":"UI Systems","title":"Specialist Console Mirrored From Combat Master"}
-->

---

## UI Bug Intake Rules

Every confirmed UI-system issue belongs here if it touches any of these:

- interaction flow
- modal behavior
- navigation clarity
- visual consistency
- UI architecture drift
- accessibility or readability
- UI docs drift

When a UI bug is confirmed, update all of the following:

1. add a `UI-NNN` entry
2. increase UI XP
3. update at least one mastery track
4. increment `bugsLogged` if it was a real bug, not only a design note
5. increment `bugsKilled` when the bug is confirmed fixed, not only discovered
6. increment `safeFixes` when the fix is verified by build, tests, or direct UI review
7. add an achievement if the unlock condition was met

---

## Suggested Future Categories

- `Visual Systems`
- `Interaction Flow`
- `UI Safety`
- `Navigation Clarity`
- `Design System`
- `Accessibility`

---

## Next Step

As the UI agent becomes real, keep this journal focused on meaningful UI lessons and avoid turning it into a raw changelog.

---

> Last updated: 2026-03-19 22:55 MSK
