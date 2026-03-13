# RULES.md - Documentation And Safe Change Rules

> Last updated: 2026-03-13 23:33 MSK

**Project:** Fight Club  
**Path:** `c:/Users/dtphs/.vscode/Project`

---

## Purpose Of Root Docs

| File | Purpose |
|------|---------|
| `PROJECT-INFO.md` | What the project is, what features are actually implemented, and how they work |
| `PROJECT_STRUCTURE.md` | Current structure of `fight-club/`, with roles of folders and key files |
| `SECURITY_ARCHITECTURE.md` | Real security limits and guarantees of the current browser-only app |
| `DATABASE_ARCHITECTURE.md` | Honest description of persistence and the fact that there is no real DB yet |

---

## Source Of Truth

- Source of truth is always the code in `fight-club/`.
- Documentation must describe current reality, not plans.
- If docs diverge from code, update docs first.
- Do not document backend, API, DB, auth, migrations, or services that do not exist in code.

---

## When To Update Docs

### `PROJECT-INFO.md`

Update when any of these change:

- user-visible behavior
- implemented feature set
- combat logic, progression, or sandbox UI behavior
- run/build workflow
- project constraints

### `PROJECT_STRUCTURE.md`

Update when:

- a file or directory is added or removed
- a file changes role
- a new screen, hook, core primitive, module, or orchestration layer appears
- backup or recovery files are intentionally kept in the repo and therefore become part of the real structure

### `SECURITY_ARCHITECTURE.md`

Update when:

- persistence changes
- `fetch`, API calls, auth, secrets, or env vars are introduced
- untrusted user data starts being loaded
- runtime validation or access boundaries change

### `DATABASE_ARCHITECTURE.md`

Update when:

- a real database appears
- persistence format changes
- storage becomes more complex than current `localStorage`
- save versioning or migration rules are introduced

---

## How To Write Docs

- Write from real code in `fight-club/`.
- Prefer short high-signal sections.
- Mark unfinished modules explicitly as `stub`, `skeleton`, or `not implemented`.
- For missing subsystems, write `absent` instead of using generic template text.
- For dangerous areas, explain both the file and the reason it is risky.
- Combat system design and rules documentation is critical project infrastructure, not optional extra notes.
- Combat docs must be easy to navigate, complete enough for safe changes, and kept in sync with the real runtime because much of the project depends on combat behavior.
- If combat formulas, turn flow, effects, resource rules, zones, skills, consumables, or bot assumptions change, update the combat design reference so it still contains the full working model.
- If docs are prepared for GitBook publishing, keep `fight-club/docs/README.md` and `fight-club/docs/SUMMARY.md` in sync with the actual document structure.
- Before publishing docs changes, run `npm run docs:validate` from `fight-club/`.

---

## Completion And GitHub Sync

- A task is not complete until the related documentation is updated.
- After code changes and documentation updates are finished, push the project state to git.
- Do not leave completed work only in the local workspace if it is ready to be shared as the current project state.
- Use `./push-git.ps1 -Message "type: short summary"` from the repo root to stage, commit, and push the current state.

---

## Safe Change Rules

Before any code change:

1. Read the target file fully.
2. Find direct consumers through imports and usages.
3. Check relevant tests.
4. Check whether the change touches the combat chain:
   `ui -> useCombatSandbox -> combat/character/equipment/orchestration -> config`
5. For risky UI recovery or handoff work, create a backup copy next to the original file before editing.

Do not:

- edit `dist/` as source
- invent backend or DB layers
- change save format without compatibility review
- change combat formulas without regression checks
- change item codes, skills, consumable effects, or equip rules without checking dependent tests and sandbox flow
- document a feature as complete if code is still a stub

---

## Required Verification After Significant Changes

Run:

```bash
npm run test
npm run lint
npm run build
```

For build and bot-balance changes, also run:

```bash
npm run balance:matrix
```

This writes current matchup artifacts to:

- `fight-club/docs/balance/latest-build-matrix.md`
- `fight-club/docs/balance/latest-build-matrix.json`

And manually verify sandbox flow:

1. Open `Combat Sandbox`
2. Change build
3. Check inventory and equipment popovers
4. Start combat
5. Resolve several rounds
6. Check combat log, HP, resources, selected skill or consumable action, and reset flow

---

## Current Project Facts

- This is a single frontend project on `React + TypeScript + Vite`.
- Backend is absent.
- Database is absent.
- Auth is absent.
- Persistence is currently `localStorage` only.
- Main implemented scenario is `Combat Sandbox`.
- `Combat Rules` is a real implemented reference screen.
- `Combat Rules` content must stay synced with live combat runtime, including effects, loadout rules, and consumable behavior.
- Inventory and equipment use `mainHand / offHand`.
- Item model already includes:
  - `baseDamage`
  - `baseArmor`
  - `combatBonuses`
  - `skills[]`
  - `consumableEffect`
- Combat already supports:
  - progression-sensitive formulas
  - `rage / guard / momentum / focus`
  - item-based skills
  - consumable actions inside round flow
  - weapon-class passive effects
  - stackable active combat effects with per-effect stack caps
  - explicit `RoundAction` variants instead of a nullable mixed shape
  - action-aware round draft orchestration
  - extracted sandbox controller / metrics / support helpers under `src/orchestration/combat`
  - centralized combat constants, formula coefficients, preview profile weights, and planner heuristic thresholds under `src/modules/combat/config/combatConfig.ts`
  - canonical combat zones under `src/modules/combat/model/CombatZone.ts`
  - sandbox bot stat-budget parity against the current player allocation budget
- Item and preset cards now surface the most important mechanics as primary UI blocks:
  - `Weapon Passive`
  - `Signature Skill`

---

## Timestamp Format

Whenever you edit these root docs:

- update timestamp at the top of the file
- update timestamp at the bottom of the file
- use absolute time in `YYYY-MM-DD HH:mm MSK`

---

> Last updated: 2026-03-13 18:40 MSK
> Last updated: 2026-03-13 23:33 MSK
