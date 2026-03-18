# Evolution Tamagotchi Starter Kit

`TAMA_start` is a local agent-evolution kit for this project.

It gives us:

- a general journal: `evolution_journal.md`
- a workflow contract: `.agents/workflows/auto-evolution.md`
- a local visualizer: `visualizer/index.html`
- an optional specialist system, now used by the in-app `Ecosystem Agents` hub

---

## Quick Start

1. Keep `evolution_journal.md` as the main cross-project learning log.
2. Keep `.agents/workflows/auto-evolution.md` as the operational protocol the AI should follow.
3. Open `visualizer/index.html` in a browser to inspect progress.

---

## Files

```text
TAMA_start/
|-- README.md
|-- AGENTS.md
|-- evolution_journal.md
|-- combat_agent_profile.md
|-- combat_agent_journal.md
|-- combat_patch_notes.md
|-- ui_agent_journal.md
|-- ui_patch_notes.md
|-- .agents/
|   `-- workflows/
|       `-- auto-evolution.md
`-- visualizer/
    `-- index.html
```

---

## Canon Rules

- `evolution_journal.md` remains the main source of truth for broad project evolution.
- `combat_agent_journal.md` is the specialist source of truth for combat-only growth.
- `ui_agent_journal.md` is the specialist source of truth for UI-only growth.
- `visualizer/index.html` is a parser/viewer, not the source of truth.
- If workflow rules change, sync:
  - `.agents/workflows/auto-evolution.md`
  - `evolution_journal.md`
  - `combat_agent_journal.md` when combat-agent behavior is affected
  - `ui_agent_journal.md` when UI-agent behavior is affected
  - `AGENTS.md`

---

## Combat Master

This repository now treats `Combat Master` as a first-class specialist agent.

It is not the same thing as the general `TAMA` agent.
Instead:

- `TAMA` is the base evolution framework
- `Combat Master` is a separate specialist agent built on top of that framework
- it keeps its own profile and journal instead of merging back into the main one

Use these files for it:

- `combat_agent_profile.md` for ranks, XP rules, mastery tracks, and achievements
- `combat_agent_journal.md` for combat bugs, combat lessons, safe fixes, and progression
- `combat_patch_notes.md` for combat-only patch history
- `features/combat-agent.md` for mission, workflow, and operational boundaries

When a combat-system issue is found or fixed, the AI should update:

1. `evolution_journal.md` if the lesson matters project-wide
2. `combat_agent_journal.md` for the combat-specialist record

---

## UI Master

This repository now also treats `UI Master` as a first-class specialist agent built on the same specialist-shell pattern.

It uses the same evolution ideas as `Combat Master`, but for UI and UX work instead of combat systems.

Use these files for it:

- `ui_agent_journal.md` for UI bugs, UI lessons, safe fixes, and progression
- `ui_patch_notes.md` for UI-only patch history

When a meaningful UI issue is found or fixed, the AI should update:

1. `evolution_journal.md` if the lesson matters project-wide
2. `ui_agent_journal.md` for the UI-specialist record
3. `ui_patch_notes.md` for the visible UI-facing patch history

The expected operating rule is:

- meaningful UI changes should be reflected in `ui_patch_notes.md`
- meaningful UI lessons, bugs, reusable patterns, and verified fixes should also be reflected in `ui_agent_journal.md`

---

## Specialist Entry Helper

To reduce manual entry work, the project now includes a small helper script:

- `npm run specialist:entry -- combat`
- `npm run specialist:entry -- ui`

It prints:

- the next journal entry template with the next `CMB-NNN` or `UI-NNN` id
- a matching patch-note template for the same specialist domain

This helper does not write files automatically. It is meant to reduce format drift while keeping the final journal edit intentional.

---

## Ecosystem Agents

The app now exposes the specialist system through a shared `Ecosystem Agents` screen.

Inside that hub:

- `Combat Master` and `UI Master` share one visual shell
- each specialist keeps separate journals and patch notes
- activity logs, XP, achievements, impact, type, and patch-note modals are fed from each specialist's own markdown data

---

## Visualizer Inputs

The visualizer now supports two data channels:

- General agent data:
  - `STATUS_JSON`
  - `EVO_JSON`
- Combat specialist data:
  - `COMBAT_AGENT_JSON`
  - `CMB_JSON`

You can:

- upload one or more markdown files
- or paste combined markdown from both journals

If combat data is present, the `Combat Master` panel should render from real journal data instead of a static placeholder.

---

## Expected AI Behavior

The AI should automatically:

- add general evolution entries after meaningful fixes
- add combat-specialist entries after meaningful combat fixes
- extract patterns and anti-patterns
- increment XP and progression counters
- keep specialist counters honest:
  - bug intake
  - safe fixes
  - achievements
  - mastery-track progress

---

## FAQ

**Do I need a server?**

No. Everything here is local.

**What if the AI forgets to update the journals?**

Ask it to:

`Update evolution_journal.md and combat_agent_journal.md according to auto-evolution.md`

**What should go into the combat journal?**

Only meaningful combat lessons:

- confirmed combat bugs
- combat regressions
- planner fixes
- skill-loop fixes
- analytics corrections
- combat truth-model drift repairs

Not every tiny coefficient tweak belongs there.

---

## Goal

The goal is simple: the agent should not just fix code, but also accumulate usable memory.

For this repository, that now means:

- broad project memory in `evolution_journal.md`
- combat-system memory in `combat_agent_journal.md`
- UI-system memory in `ui_agent_journal.md`

Both should level up over time.
