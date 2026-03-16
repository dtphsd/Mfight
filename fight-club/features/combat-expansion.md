# Combat Expansion

> Last updated: 2026-03-16 02:35 MSK

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

Current live baseline has moved beyond the old handcrafted training sandbox:

- the legacy `training-*` item pool is no longer active in combat flow
- the sandbox now runs on generated `BazaBK` starter items
- the combat runtime now uses zone-based armor, random damage and armor ranges, and roll-based block reduction
- cooldown metadata is now supported by the live skill model and combatant runtime state
- `Combat Rules` content has been rebuilt in UTF-8 and re-synced with the current formulas

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
- the next live extension now spreads those same states across adjacent kits:
  - `Open Flank` -> applies `Exposed` through axe pressure
  - `Hook Chop` -> gains payoff against `Exposed`
  - `Shield Bash` -> now also applies the shared `Staggered` state while preserving resource drain pressure
- `COMBAT-007` is now active through a second-wave payoff slice:
  - `Body Check` now cashes in on `Staggered`
  - `Killer Focus` now cashes in on `Exposed`
- `COMBAT-008` is now active through a Warden counter slice:
  - `Parry Riposte` now punishes `Staggered` targets much harder
  - `Iron Brace` now also cashes in on `Staggered`, turning guard gear into a cleaner counter-pressure kit
- `COMBAT-008` now also deepens Duelist / Executioner identity:
  - `Execution Mark` now creates `Exposed` as a rage-based finisher setup
  - `Heartseeker` now cashes in on `Exposed` as a precision payoff strike
- `COMBAT-009` has now started: the generated `Combat Rules` layer explains named states and the live setup -> payoff loops directly in the player-facing rules screen
- architecture-side verification docs now also call out the named-state sync points and the actor-turn expiry nuance for short rider effects
- the main English `Combat Rules` copy now also explains setup -> payoff windows directly in the section text instead of relying only on generated fact cards
- `COMBAT-009` is now complete for the first-wave state layer: runtime, rules screen, and verification docs are back in sync
- the curated build browser has now gone through a compact one-page UI pass with avatar previews, archetype color zoning, and denser preset inspection
- combat impact feedback has also been hardened so text and block / crit / block-break overlays are emitted as one-shot pulses and do not reappear after fading out
- penetration now has its own dedicated `PIERCE` impact treatment instead of borrowing another feedback lane

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
4. widen the same states across more weapon families before inventing new named states
5. update `Combat Rules` and combat docs
6. add targeted tests and balance checks

---

## Next Step

Move into `COMBAT-010` and use the fresh matrix snapshot to steer the next combat pass:

- `Shield / Guard` is currently the clear top performer
- `Sustain / Regen` is also strong
- `Dagger / Crit` and `Heavy / Two-Hand` are the clearest underperformers
- `Mace / Control` looks durable but slow and draw-heavy

That means the next gameplay adjustments should be balance-informed rather than purely additive.

The current expansion track now has a second requirement:

1. keep the base formulas, `BazaBK` item imports, and rules docs aligned
2. only then continue archetype-by-archetype tuning on top of that stable base

---

## Current Balance Snapshot

Latest matrix source:

- `docs/balance/latest-build-matrix.md`

Observed read from the current snapshot:

- `Shield / Guard`
  - strongest net performer in the current field
  - long average fights, strong survivability, and broad matchup dominance
- `Sustain / Regen`
  - still overperforming in many slower matchups
- `Mace / Control`
  - healthy control identity, but many draws suggest high stall potential
- `Dagger / Crit`
  - underperforming despite the new precision payoffs
  - likely too fragile or too burst-dependent in current bot-driven loops
- `Heavy / Two-Hand`
  - still too weak for a supposed high-commitment power archetype
  - likely needs either stronger payoff windows or more reliable baseline pressure

Recommended next balance direction:

1. avoid buffing `Shield / Guard` or `Sustain / Regen` further for now
2. look first at `Dagger / Crit` and `Heavy / Two-Hand`
3. keep `Exposed` / `Staggered` rules stable while tuning content around them
4. prefer small numeric and skill-identity nudges over new mechanics

Latest follow-up pass:

- a preset-focused balance pass reduced offensive spillover from `Shield / Guard` and improved `Heavy / Two-Hand`
- `Heavy / Two-Hand` moved from clear bottom-tier to a still-weak but much healthier position
- `Dagger / Crit` got worse after moving away from the accessory burst package, which means its issue is not simply "needs exposed setup"
- `Shield / Guard` remains the strongest build in the field even after the preset adjustment

Latest dagger rescue pass:

- `Dagger / Crit` was moved back toward a more direct burst conversion with `Arena Earring` and a stronger `Killer Focus`
- the matrix read improved dagger materially:
  - from `Net -54` to `Net -18`
- `Shield / Guard` softened slightly:
  - from `Net 48` to `Net 43`
- the top cluster is now shared by `Shield / Guard` and `Sustain / Regen`

Latest heavy rescue pass:

- trying to solve heavy through a more aggressive rage loop made the preset worse, which confirmed that the issue was not simply "skills are too expensive"
- the better result came from restoring the stable preset shell and raising baseline greatsword pressure instead:
  - `great-training-sword` base slash and pierce damage were raised slightly
  - its native slash / pierce penetration was also raised
  - `Execution Arc` got a modest base damage increase
- the matrix read improved heavy modestly:
  - from `Net -27` to `Net -24`
- tradeoff:
  - `Mace / Control` slipped from `Net 2` to `Net -3`
  - `Shield / Guard` and `Sustain / Regen` stayed on top

Current working read:

- rescuing dagger through direct burst identity worked better than forcing it deeper into setup-only play
- a narrow heavy buff can help, but the current meta ceiling is still dictated by the sustain/guard cluster
- `Heavy / Two-Hand` is still below the healthy middle, even after the better rescue pass
- the next balance target should either be the top sustain/guard cluster or an even more isolated heavy-only buff that does not splash onto `Mace / Control`

Current working conclusion:

- keep the improved greatsword baseline pressure direction for now
- do not buff `Shield / Guard`
- keep the recovered dagger direction for now
- treat `Sustain / Regen` and the broader sustain/guard package as the next likely nerf target
- be careful with shared blunt / guard levers, because `Mace / Control` is now more fragile than before
- prefer nerfing survivability loops before adding more damage elsewhere

---

## Task Breakdown

- `COMBAT-006` - define first-wave combat expansion states and interaction rules
- `COMBAT-007` - design and implement more varied skills around setup/payoff patterns
- `COMBAT-008` - deepen archetype identity through state synergy and role-specific combat loops
- `COMBAT-009` - expand combat docs and Combat Rules for the new state/skill layer
- `COMBAT-010` - add regression and balance coverage for combat expansion content

---

> Last updated: 2026-03-16 02:35 MSK
