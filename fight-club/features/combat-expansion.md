# Combat Expansion

> Last updated: 2026-03-14 13:21 MSK

**Feature:** Combat Expansion  
**Status:** IN PROGRESS

---

## Why

The combat system is stable enough to support deeper gameplay variety. The next growth step is not only safety and documentation, but also richer player decisions, stronger archetype identity, and more varied fights.

---

## Problem

The current combat loop is readable and functional, but it can become repetitive because many turns still collapse into straightforward damage trading plus a small set of effects and resource thresholds.

---

## Root Cause

- the runtime already has a good core pipeline, but the state space is still relatively narrow
- skills are useful, but many of them do not yet create strong setup/payoff patterns
- archetypes have direction, but they need more distinct combat states and synergies to feel truly different in play

---

## Solution

- introduce a small set of readable new combat states
- design more interesting skills around setup, payoff, control, defense, and tempo
- deepen archetype identity through state synergy rather than raw stat inflation
- expand tests and docs together with runtime changes so new combat depth stays understandable and safe

---

## Affects

- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/model/CombatEffect.ts`
- `src/modules/combat/config/combatWeaponPassives.ts`
- `src/content/items/starterItems.ts`
- `src/orchestration/combat/combatSandboxConfigs.ts`
- `src/ui/screens/CombatRules/`
- `fight-club/docs/architecture/combat/`
- combat regression tests and balance verification

---

## Status

`IN PROGRESS`

Planned focus:

- add a first wave of new readable combat states such as `Exposed` and `Staggered`
- build more varied skills around setup/payoff and archetype identity
- keep combat clarity high by updating docs, rules text, and tests alongside runtime changes

Current slice:

- `COMBAT-006` is now defining the first production-safe expansion layer around a small number of readable combat states
- the first wave is intentionally narrow so we deepen combat decisions without turning the rules into noise
- runtime now supports state-aware skill bonuses keyed off target active effects
- the first live state-aware skill set is anchored by:
  - `Opening Sense` -> applies `Exposed`
  - `Armor Crush` -> applies `Staggered`
  - `Execution Arc` -> gains payoff against `Exposed`
  - `Crushing Blow` -> gains payoff against `Staggered`

---

## First Expansion Slice

The first slice should introduce only two new named combat states into live gameplay:

- `Exposed`
- `Staggered`

Reason:

- both are easy to understand from player perspective
- both fit the current combat math and effect system without needing a new engine
- together they create setup/payoff, pressure, anti-guard, and finisher windows across multiple archetypes

---

## State Design Draft

### `Exposed`

Purpose:

- creates a clean payoff window for precision and finisher skills
- rewards setup instead of only raw burst

Planned gameplay meaning:

- target becomes more vulnerable to follow-up damage
- best used by Duelist and Executioner style builds

Recommended runtime shape:

- `kind`: debuff
- `target`: target
- `trigger`: mostly `on_hit`
- `duration`: 2 turns
- `max stacks`: 2

Recommended first implementation behavior:

- `+8% incomingDamagePercent` per stack
- no direct periodic damage
- keep it readable and generic in the first version instead of making it zone-specific immediately

Design notes:

- this should be a setup state, not just hidden bonus damage
- it should be visible in battle log and `Combat Rules`
- it should synergize with finisher skills, crit windows, and aggressive combo turns

### `Staggered`

Purpose:

- creates disruption and anti-guard play
- gives blunt / breaker-style tools a clearer combat identity

Planned gameplay meaning:

- target is temporarily worse at defending or stabilizing
- best used by Breaker and some Warden counter-tools

Recommended runtime shape:

- `kind`: debuff
- `target`: target
- `trigger`: mostly `on_hit`
- `duration`: 2 turns
- `max stacks`: 2

Recommended first implementation behavior:

- `-6 blockPower` per stack
- `-4 dodgeChanceBonus` per stack
- no periodic damage

Design notes:

- this should create "guard break" feeling without hard stun
- avoid skipping turns or hard crowd control in the first wave
- it should make the next enemy turn meaningfully less safe, but still readable

---

## Archetype Intent

### Duelist

- uses `Exposed` to create precision-finisher windows
- wants clean follow-up hits, crit timing, and targeted pressure

### Executioner

- uses `Exposed` as an execution setup state
- wants stronger payoff against low-HP or already softened targets

### Breaker

- uses `Staggered` to disrupt block and defense structure
- wants to open targets for heavier blunt or chop follow-ups

### Warden

- should not own the same setup patterns as Duelist or Breaker
- can optionally gain one counter-oriented interaction later, but is not the priority in slice one

---

## First Skill Direction Draft

The first skill wave should follow these patterns:

- one `Exposed` setup skill
- one `Staggered` setup skill
- one payoff skill that explicitly benefits from `Exposed`
- one pressure skill that becomes safer or stronger against `Staggered`

Recommended shape:

1. Duelist precision opener
   - moderate damage
   - applies `Exposed`
2. Breaker shock strike
   - lower raw damage
   - applies `Staggered`
3. Executioner finisher
   - higher multiplier or crit payoff if target is `Exposed`
4. Breaker follow-through
   - better penetration or block bypass if target is `Staggered`

---

## Guardrails For Implementation

- no hard stun or action denial in the first wave
- no more than two new named states in the first slice
- do not add hidden conditional rules that the player cannot read
- every new state must be visible in log, UI, and docs
- every new skill should belong clearly to an archetype fantasy

---

## Suggested Build Order

1. finalize `Exposed` and `Staggered` numeric rules
2. implement the two new states through current `CombatEffect` infrastructure
3. add the first 4 state-aware skills
4. update `Combat Rules` and combat docs
5. add targeted tests and balance checks

---

## Next Step

Decide whether to expand the first state wave with one more `Exposed` applier and one more `Staggered` payoff tool, or pause `COMBAT-006` and move the next work to docs/rules/test expansion under `COMBAT-009` and `COMBAT-010`.

---

## Task Breakdown

- `COMBAT-006` - define first-wave combat expansion states and interaction rules
- `COMBAT-007` - design and implement more varied skills around setup/payoff patterns
- `COMBAT-008` - deepen archetype identity through state synergy and role-specific combat loops
- `COMBAT-009` - expand combat docs and Combat Rules for the new state/skill layer
- `COMBAT-010` - add regression and balance coverage for combat expansion content

---

> Last updated: 2026-03-14 13:21 MSK
