# Combat Agent Journal

> Last updated: 2026-03-19 01:05 MSK

**Agent:** Arena Systems Specialist  
**Project:** Fight Club  
**Scope:** combat-only evolution log

---

## Purpose

This journal is the combat-only companion to the general evolution journal.

Use it to record:

- meaningful combat milestones
- combat-specific patterns
- balance lessons
- planner lessons
- formula safety lessons
- skill-loop lessons

Do not use it for unrelated project work.

---

## Entry Rules

Log an entry when work produced a meaningful combat lesson, for example:

- a serious combat bug was found or fixed
- a false meta conclusion was disproven
- a new combat audit tool was added
- a planner or skill loop changed measurably
- combat docs were re-synced after a truth-model shift
- a new combat design pattern became reusable

Avoid logging:

- small cosmetic edits
- every small coefficient tweak
- repetitive micro-iterations with no new lesson

---

## Entry Template

```md
### CMB-001 - Title
**Date**: YYYY-MM-DD
**Impact**: X/10
**XP**: +N
**Track**: Formula Mastery | AI Tactics | Balance Analysis | Systems Design | Combat Safety
**Type**: Bug Fix | Combat Economy | Planner Behavior | Runtime Truth | Systems Design | Docs Sync
**Achievement**: optional

#### What happened
Short factual summary.

#### Why it mattered
Why this changed understanding or safety.

#### Combat lesson
What the combat agent should remember next time.

#### Pattern
Reusable combat pattern or anti-pattern.
```

Impact scale:

- `1/10` to `3/10` - small or local combat lesson
- `4/10` to `6/10` - meaningful systems step or reusable insight
- `7/10` to `8/10` - high-impact fix or major combat improvement
- `9/10` to `10/10` - critical combat save, truth-model correction, or major subsystem repair

XP rule:

- every `CMB` event must explicitly say how much XP it gives
- XP should scale with proven impact, not with effort alone
- verified fixes and reusable combat knowledge should award more XP than raw exploration

---

## Starter Status

## Status

- Name: Arena Systems Specialist
- Rank: Initiate
- Level: 1
- Total XP: 46
- Next Rank XP: 50

## Mastery Tracks

- Formula Mastery: 0
- AI Tactics: 11
- Balance Analysis: 12
- Systems Design: 19
- Combat Safety: 8

## Achievements

- Skill Smith
- Arena Surgeon

<!-- COMBAT_AGENT_JSON
{
  "name": "Arena Systems Specialist",
  "role": "Combat Master",
  "domain": "Fight Club combat systems",
  "summary": "Tracks combat bugs, planner drift, balance lessons, safe fixes, and combat truth so the battle system gets smarter over time.",
  "level": 1,
  "rank": "Initiate",
  "xpCurrent": 46,
  "xpNext": 50,
  "entries": 7,
  "bugsLogged": 1,
  "bugsKilled": 1,
  "safeFixes": 5,
  "battleWins": 0,
  "achievements": ["Skill Smith", "Arena Surgeon"],
  "tags": ["Formula Mastery", "AI Tactics", "Balance Analysis", "Systems Design", "Combat Safety"],
  "tracks": [
    { "label": "Formula Mastery", "value": 0 },
    { "label": "AI Tactics", "value": 22 },
    { "label": "Balance Analysis", "value": 24 },
    { "label": "Systems Design", "value": 38 },
    { "label": "Combat Safety", "value": 16 }
  ],
  "lastUpdated": "2026-03-19T01:05:00+03:00"
}
-->

---

## Combat Entries

### CMB-007 - Burst And Control Intent Weighting Exposed The Next Planner Bottleneck
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +5
**Track**: AI Tactics
**Type**: Planner Behavior
**Achievement**: none

#### What happened
A second planner-only pass pushed harder on `Burst` payoff aggression and `Control`/setup precision without changing the underlying combat formulas.

#### Why it mattered
`Dagger / Crit` improved measurably, but `Mace / Control` stayed almost flat. That split matters because it shows the next problem is no longer "intents are globally undervalued" but "some archetypes still lack a strong enough planner conversion path from state to payoff."

#### Combat lesson
When one archetype responds to planner weighting and another does not, stop treating the issue as a shared posture problem and start tracing the specific payoff-conversion path that still fails.

#### Pattern
Use planner-only passes to separate generic valuation problems from archetype-specific conversion bottlenecks before reopening runtime formulas.

<!-- CMB_JSON
{"id":"CMB-007","date":"2026-03-19","impact":4,"xp":5,"track":"AI Tactics","achievement":"none","type":"Planner Behavior","title":"Burst And Control Intent Weighting Exposed The Next Planner Bottleneck"}
-->

### CMB-006 - Intent Planner Learned Situational Posture And Low-Line Defense
**Date**: 2026-03-19
**Impact**: 5/10
**XP**: +6
**Track**: AI Tactics
**Type**: Planner Behavior
**Achievement**: none

#### What happened
The bot planner moved from a flat `Combat Intent` ruleset into score-based posture selection, and defense planning gained a small low-line variance rule so non-recruit bots can sometimes cover `legs`.

#### Why it mattered
The first intent audit proved that the mechanic existed but was being underused. This pass taught the planner to read setup windows, payoff pressure, retaliation risk, and target state more contextually while also removing the dead-pattern where bots almost never defended low.

#### Combat lesson
When a combat decision layer is live but underexpressed, improve planner valuation before touching the mechanic's base formulas.

#### Pattern
Use small score models plus bounded variance to make bot combat feel less scripted without sacrificing auditability.

<!-- CMB_JSON
{"id":"CMB-006","date":"2026-03-19","impact":5,"xp":6,"track":"AI Tactics","achievement":"none","type":"Planner Behavior","title":"Intent Planner Learned Situational Posture And Low-Line Defense"}
-->

### CMB-005 - Intent Audit Exposed First Live Usage Pattern
**Date**: 2026-03-19
**Impact**: 4/10
**XP**: +5
**Track**: Balance Analysis
**Type**: Runtime Truth
**Achievement**: none

#### What happened
A dedicated `combat:audit-intents` report was added and used to measure how often each preset chooses `Neutral`, `Aggressive`, `Guarded`, and `Precise`.

#### Why it mattered
The first baseline showed that the mechanic is live but still underexpressed: most presets default to `Neutral` or `Guarded`, `Aggressive` is selective, and `Precise` is nearly absent outside narrow cases.

#### Combat lesson
When a new combat choice exists but barely gets selected, the next problem is often planner valuation or payoff visibility, not the existence of the mechanic itself.

#### Pattern
Ship a dedicated audit for every new combat decision layer early, so adoption problems are caught before balance work starts masking them.

<!-- CMB_JSON
{"id":"CMB-005","date":"2026-03-19","impact":4,"xp":5,"track":"Balance Analysis","achievement":"none","type":"Runtime Truth","title":"Intent Audit Exposed First Live Usage Pattern"}
-->

### CMB-004 - Combat Intent V1 Brought Turn Expression Into Sandbox
**Date**: 2026-03-19
**Impact**: 6/10
**XP**: +8
**Track**: Systems Design
**Type**: Systems Design
**Achievement**: none

#### What happened
A first live `Combat Intent` layer was added to round drafting, round actions, combat resolution, sandbox UI, and bot action building.

#### Why it mattered
The sandbox no longer treats every turn as the same posture. One-turn intent now creates a real tradeoff between pressure, safety, and cleaner payoff timing without forcing a class rebalance loop.

#### Combat lesson
If combat feels flat, add expressive one-turn decision layers before adding more isolated archetype tuning.

#### Pattern
Build combat depth first through reusable turn-shaping mechanics, then rebalance archetypes around that shared layer.

<!-- CMB_JSON
{"id":"CMB-004","date":"2026-03-19","impact":6,"xp":8,"track":"Systems Design","achievement":"none","type":"Systems Design","title":"Combat Intent V1 Brought Turn Expression Into Sandbox"}
-->

### CMB-001 - Profile Initialized
**Date**: 2026-03-17
**Impact**: 3/10
**XP**: +3
**Track**: Combat Safety
**Type**: Initialization
**Achievement**: none

#### What happened
The future combat agent received a dedicated progression profile, operating spec, and combat-only journal template before implementation.

#### Why it mattered
This creates a stable place for combat-specific learning so future balance and systems work can accumulate domain memory instead of starting from scratch.

#### Combat lesson
Specialized systems work benefits from specialized memory, especially when runtime, analytics, and docs all need to move together.

#### Pattern
Define the specialist's canon, workflow, and progression model before turning it loose on a high-risk subsystem.

<!-- CMB_JSON
{"id":"CMB-001","date":"2026-03-17","impact":3,"xp":3,"track":"Combat Safety","achievement":"none","type":"Initialization","title":"Profile Initialized"}
-->

### CMB-002 - Dagger Burst Handoff Restored
**Date**: 2026-03-18
**Impact**: 7/10
**XP**: +13
**Track**: Balance Analysis
**Type**: Bug Fix
**Achievement**: Skill Smith, Arena Surgeon

#### What happened
Skill audit and runtime inspection showed that `Dagger / Crit` was still failing to convert `Exposed` into `Heartseeker` even after the earlier payoff-cost passes.

#### Why it mattered
The issue was no longer broad planner greed. The real bottleneck was that `Execution Mark` spent the same zero-start `rage` economy that `Heartseeker` needed, so the burst kit could create its own payoff window and still be unable to cash it in.

#### Combat lesson
When a setup skill and its payoff live on the same scarce zero-start resource, the archetype may need an explicit handoff turn instead of only cheaper numbers or more planner pressure.

#### Pattern
Repair starving setup -> payoff kits through an archetype-specific handoff buff before reopening global resource rules.

<!-- CMB_JSON
{"id":"CMB-002","date":"2026-03-18","impact":7,"xp":13,"track":"Balance Analysis","achievement":"Skill Smith, Arena Surgeon","type":"Skill Loop Repair","title":"Dagger Burst Handoff Restored"}
-->

### CMB-003 - Combat Economy Truth Mapped
**Date**: 2026-03-18
**Impact**: 4/10
**XP**: +6
**Track**: Systems Design
**Type**: Combat Economy
**Achievement**: none

#### What happened
The combat reference was extended from isolated balance notes into an explicit event-driven economy model for `rage`, `guard`, `momentum`, and `focus`.

#### Why it mattered
This reframed the next combat phase around system construction. Resource assignment is now tied to the runtime events that actually generate each resource, instead of being treated as a convenient content knob per skill.

#### Combat lesson
Combat resources should be designed from event loops first. A healthy archetype is not only "numerically fair" but able to earn its next meaningful turn through the combat events it is built to trigger.

#### Pattern
Map setup, payoff, and defense tools onto their native runtime resource loop before tuning costs, rewards, or planner pressure.

<!-- CMB_JSON
{"id":"CMB-003","date":"2026-03-18","impact":4,"xp":6,"track":"Systems Design","achievement":"none","type":"Combat Economy","title":"Combat Economy Truth Mapped"}
-->

---

## Combat Bug Intake Rules

Every confirmed combat-system issue belongs here if it touches any of these:

- `resolveRound` behavior
- mitigation or formula truth
- skill loops and payoff windows
- planner behavior
- preset integrity
- combat analytics validity
- combat docs drift

When a combat bug is confirmed, update all of the following:

1. add a `CMB-NNN` entry
2. increase combat XP
3. update at least one mastery track
4. increment `bugsLogged` if it was a real bug, not only a design note
5. increment `bugsKilled` when the bug is confirmed fixed, not only discovered
6. increment `safeFixes` when the fix is verified by tests, build, or audit tooling
7. add an achievement if the unlock condition was met

Use this quick intake checklist:

- Was it a real combat bug or a combat-design insight?
- Which canonical combat files were involved?
- Was the root cause proven?
- Was the fix verified by test, build, audit, or docs sync?
- What should Combat Master remember next time?

---

## Achievement Ledger

- `Skill Smith` - restored a working setup -> payoff combat loop for the burst dagger kit
- `Arena Surgeon` - a narrow archetype-specific fix produced a strong measurable combat improvement

---

## Suggested Future Categories

- `Runtime Truth`
- `Planner Behavior`
- `Skill Economy`
- `Typed Mitigation`
- `State Windows`

---

> Last updated: 2026-03-19 01:05 MSK
- `Combat Tooling`
- `Regression Safety`
- `Future Systems`

---

## Next Step

Once the combat agent becomes real, begin logging only meaningful combat milestones and keep this journal much stricter than a raw work log.

---

> Last updated: 2026-03-18 18:40 MSK
