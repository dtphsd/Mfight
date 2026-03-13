# Combat Design Reference

> Last updated: 2026-03-14 00:34 MSK

**Feature:** Combat Design Reference  
**Status:** IN PROGRESS

---

## Why

The combat system is one of the most important parts of Fight Club. Much of the project depends on its rules, formulas, runtime order, and user-facing behavior, so the combat design reference must be treated as critical project infrastructure.

---

## Problem

Combat knowledge is currently spread across runtime code, tests, UI behavior, and partial notes. That makes safe changes harder because the full working model is not captured in one convenient document.

---

## Root Cause

- combat rules evolved through implementation-first work across `resolveRound.ts`, orchestration, content, and UI
- the runtime already contains many coupled decisions about effects, resources, turn flow, and skill or consumable behavior
- there is no single complete reference that explains the live combat system from start to finish

---

## Solution

- create one complete combat design and rules reference based on real code
- document the full resolution pipeline and turn-order behavior
- add regression tests for high-risk rule combinations
- reduce `resolveRound.ts` risk only after the documentation and safety net are in place
- formalize a combat verification checklist for future changes

---

## Affects

- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/config/combatConfig.ts`
- `src/modules/combat/model/*`
- `src/orchestration/combat/*`
- `src/content/items/starterItems.ts`
- `src/ui/hooks/useCombatSandbox.ts`
- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- combat rules screen content
- balance checks and playtest verification

---

## Status

`IN PROGRESS`

Current state:

The requirement is now formalized in `RULES.md` and tracked in `MASTER-PLAN.md` as a dedicated combat workstream. The live runtime draft now covers combat model, resources, zones, resolution flow, exact formula coefficients, weapon passives, current test coverage, concrete turn-order examples, a combat verification checklist, bot-planner assumptions, Combat Rules screen alignment, exact sequencing notes for `resolveRound(...)`, a traceability map from runtime to tests to player-facing rules, and a regression-test target matrix for the next QA phase.

---

## Next Step

Use the regression-test target matrix to start `COMBAT-003` with the highest-risk sequencing and short-circuit cases.

---

## Task Breakdown

- `COMBAT-001` - create the complete combat design and rules reference
- `COMBAT-002` - document the exact combat resolution pipeline and turn order
- `COMBAT-003` - add composition regression tests for rule combinations
- `COMBAT-004` - safely reduce `resolveRound.ts` risk without changing behavior
- `COMBAT-005` - formalize the combat change checklist and verification flow

---

> Last updated: 2026-03-14 00:34 MSK
