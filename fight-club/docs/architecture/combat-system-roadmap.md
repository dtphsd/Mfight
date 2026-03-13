# Combat System Roadmap

> Last updated: 2026-03-14 12:18 MSK

This page tracks the combat architecture evolution path.

It is a planning document, not the source of truth for the current runtime. For live behavior, use the combat reference.

---

## Read Next

- [Combat Design Reference](./combat-design-reference.md)
- [Architecture Overview](./overview.md)

---

## Purpose

This file is the working roadmap for combat-system development.

It focuses on:

- safe refactoring of the current combat stack
- gameplay expansion without collapsing the architecture
- keeping UI, orchestration, and combat math separated

## Current State

The sandbox already has:

- explicit combat phases
- a round draft model
- a bot planner layer
- pressure-preview helpers
- item-based skills across multiple equipment slots
- bot difficulty presets
- consumables with two usage modes:
  - `replace_attack`
  - `with_attack`

The main remaining constraints are now narrower:

- `useCombatSandbox.ts` is thinner, but it still remains the adapter boundary for a broad screen contract
- the live screen now consumes `selectedAction` directly
- future combo-action expansion still needs a richer draft contract than the current single selected action

## Guiding Rules

1. Keep combat math in `src/modules/combat`.
2. Keep battle lifecycle and decision flow in `src/orchestration/combat`.
3. Keep React hooks/screens as thin adapters.
4. Prefer data-driven balance in content/config files over hardcoded branching in UI.
5. Add or update tests whenever the combat contract changes.

---

## Runtime Source Of Truth

Use these pages together:

- current runtime behavior:
  - [Combat Design Reference](./combat-design-reference.md)
- higher-level system map:
  - [Architecture Overview](./overview.md)
- architectural rationale:
  - [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)

## Phase 1: Simplify The Current Stack

Goal:
Make the current combat sandbox easier to extend safely.

### 1.1 Extract sandbox controller

Target:

- `src/ui/hooks/useCombatSandbox.ts`

Create:

- `src/orchestration/combat/combatSandboxController.ts`

Move out:

- start / resolve / next-round orchestration
- player action assembly
- bot action assembly
- consumable-selection compatibility rules
- fight reset logic

Expected result:

- `useCombatSandbox.ts` becomes a thin React state adapter
- combat flow rules stop being buried in the hook

Current status:

- done in `src/orchestration/combat/combatSandboxController.ts`

### 1.2 Extract derived metrics

Target:

- `src/ui/hooks/useCombatSandbox.ts`

Create:

- `src/orchestration/combat/combatSandboxMetrics.ts`

Move out:

- matchup lens building
- UI metrics
- selected-action summary formatting inputs
- snapshot comparison helpers

Expected result:

- no giant metrics object assembled inline in the hook
- one place to evolve preview logic

Current status:

- done in `src/orchestration/combat/combatSandboxMetrics.ts`

### 1.3 Harden tests around orchestration

Add tests for:

- `combatStateMachine.ts`
- `roundDraft.ts`
- controller transitions
- consumable mode compatibility

Expected result:

- future combat changes can move faster with less regression risk

Current status:

- done
- direct tests now exist for:
  - `combatSandboxController.ts`
  - `combatSandboxMetrics.ts`
  - `combatSandboxSupport.ts`
  - `combatStateMachine.ts`
  - `roundDraft.ts`

## Phase 2: Normalize Action Modeling

Goal:
Replace nullable action fields with a cleaner battle-action contract.

### 2.1 Introduce explicit action types

Current issue:

- `RoundAction` mixes attack, skill, and consumable concerns in one shape

Recommended direction:

- basic attack action
- skill attack action
- full-action consumable
- attack-with-consumable

Implementation idea:

- discriminated union in `src/modules/combat/model/RoundAction.ts`

Expected result:

- easier validation
- easier UI rules
- better support for cooldowns, combo actions, and status effects

Current status:

- done
- `RoundAction` is now a discriminated union with:
  - `basic_attack`
  - `skill_attack`
  - `consumable`
  - `consumable_attack`

### 2.2 Make round draft action-aware

Target:

- `src/orchestration/combat/roundDraft.ts`

Refactor toward:

- selected primary action
- selected bonus action
- compatibility checks in one place

Expected result:

- simpler future support for:
  - attack + consumable
  - skill + bonus consumable
  - no-action fallback

Current status:

- done
- `roundDraft.ts` now stores a single action-aware `selectedAction`
- `CombatSandboxScreen.tsx` now reads `selectedAction` directly instead of stitching together skill/consumable compatibility fields
- backup UI artifacts are excluded from app typecheck, so the live hook contract no longer needs legacy skill/consumable aliases

## Phase 3: Centralize Combat Configuration

Goal:
Make balancing faster and safer.

Create:

- `src/modules/combat/config/combatConfig.ts`

Move or centralize:

- zone modifiers
- resource gains
- chance caps
- block coefficients
- baseline combat constants

Expected result:

- balance can be changed without hunting through multiple files
- rules page and combat docs can reference one stable source

Current status:

- done
- baseline combat constants now live in `src/modules/combat/config/combatConfig.ts`
- `resolveRound.ts` now reads zone modifiers, reward values, chance caps, defense focus tables, and weapon-class profiles from that config module
- `combatFormulas.ts` now reads formula caps and coefficients from that config module
- snapshot HP scaling and percent clamps now read shared progression values from that config module
- `combatPressure.ts` now reads the same zone/profile tables and profile-mix weights as runtime combat
- `botRoundPlanner.ts` now reads heuristic thresholds and scoring weights from that config module
- canonical `combatZones` now live in `src/modules/combat/model/CombatZone.ts`
- direct tests now also cover `combatPressure.ts`

## Phase 4: Improve Bot AI By Difficulty

Goal:
Turn difficulty into real behavior, not only stat/loadout scaling.

### 4.1 Recruit

Behavior:

- simple target selection
- low skill usage
- weak defensive prediction

### 4.2 Veteran

Behavior:

- pressure-aware targeting
- better defense-zone guesses
- moderate skill usage

---

### 4.3 Champion

Behavior:

- uses skill economy actively
- adapts to current HP/resources
- knows when to heal
- better high-value zone selection

Recommended file:

- `src/orchestration/combat/botRoundPlanner.ts`

Possible extraction later:

- `src/orchestration/combat/botBehaviorProfiles.ts`

## Phase 5: Build Identity And Balance Pass

Goal:
Make archetypes feel distinct in play, not only in UI.

### Current archetype direction

- `Warden`
  - guard chain
  - shield and defensive counterplay
- `Duelist`
  - focus and crit timing
  - dodge / pierce pressure
- `Breaker`
  - blunt pressure
  - guard break and stable armor
- `Executioner`
  - rage spending
  - heavy finishing windows

### Recommended work

- tune resource gain vs spend
- tune skill costs
- tune skill multipliers
- tune penetration by damage type
- make each archetype have 1-2 signature loops

Files to review together:

- `src/content/items/starterItems.ts`
- `src/orchestration/combat/combatSandboxConfigs.ts`
- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/config/combatConfig.ts`

## Phase 6: Status Effects And Cooldowns

Goal:
Add depth without rewriting the whole system later.

Recommended statuses:

- `exposed`
- `guarded`
- `marked`
- `bleeding`
- `staggered`

Recommended constraints:

- skill cooldowns
- once-per-round effects
- temporary buffs with fixed duration

Important note:

Do this only after action-model cleanup.

## Phase 7: Content Expansion

Goal:
Grow buildcrafting without turning `starterItems.ts` into an unmaintainable file.

Recommended refactor before large expansion:

- `src/content/items/weapons.ts`
- `src/content/items/armor.ts`
- `src/content/items/accessories.ts`
- `src/content/items/consumables.ts`
- `src/content/items/starterItems.ts` as composition layer

Then expand:

- more item alternatives per slot
- more skill-bearing accessories
- more consumables with tactical roles
- more build presets

## Phase 8: Player Clarity Layer

Goal:
Make combat readable without opening source code or a long rules page.

Recommended additions:

- inline reason tags in battle log
- clearer selected-action summary
- bot last action summary
- explicit `Solo` / `Combo` consumable markers
- short explanations for:
  - why a block happened
  - why penetration happened
  - why crit happened

Relevant files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/components/combat/BattleLogPanel.tsx`
- `src/ui/components/combat/battleLogFormatting.ts`

Current status:

- started
- battle log entries now expose structured tags for critical context such as `Skill`, `Combo/Solo`, `Zone`, `Type`, `KO`, and resource swing
- battle log now also exposes short defense-outcome reason tags such as `Guard Held`, `Guard Broken`, and `Clean Evade`
- battle-log formatting now groups tags internally by `outcome`, `context`, `reasons`, and `effects`, while the panel still renders the same compact visible tag strip
- visible top tags now have an explicit semantic priority order instead of relying on incidental array assembly
- battle-log text is now split into `headline` and `explanation`, so the panel is less dependent on one commentator-style sentence
- factual events such as `block` and `consumable` now use more stable headlines, and explanation separators were normalized to ASCII-safe text
- `BattleLogPanel.tsx` now renders those tags directly instead of relying only on one long commentator-style sentence
- the live selected-action summary now exposes explicit action tags such as `Basic`, `Skill`, `Solo/Combo`, `Cost`, `Heal`, and `Target`

## Recommended Order

Highest-value implementation order:

1. Extract sandbox controller
2. Extract sandbox metrics
3. Add orchestration tests
4. Normalize action model
5. Centralize combat config
6. Improve bot AI by difficulty
7. Balance archetypes and resource loops
8. Add statuses/cooldowns
9. Expand item/content pool
10. Improve combat clarity UI

Current active next step:

- Phase 4: improve bot AI by difficulty

## Danger Zones

- `src/modules/combat/application/resolveRound.ts`
  - changing formulas here affects the entire system
- `src/orchestration/combat/roundDraft.ts`
  - action compatibility bugs can break player flow
- `src/orchestration/combat/botRoundPlanner.ts`
  - unsafe changes can make higher difficulties non-functional or unfair
- `src/content/items/starterItems.ts`
  - item code, skills, consumables, and archetypes all depend on this dataset
- `src/ui/hooks/useCombatSandbox.ts`
  - thinner than before, but still the UI contract boundary and still sensitive to regressions

## Done So Far

- combat phase model introduced
- combat state machine introduced
- round draft introduced
- bot planner introduced
- pressure preview extracted
- bot difficulty presets introduced
- multiple archetype presets introduced
- non-weapon item skills introduced
- consumable usage modes introduced
- sandbox controller extracted
- sandbox metrics extracted
- sandbox support helpers extracted
- direct orchestration tests added for controller / metrics / support / state machine / round draft
- direct orchestration tests added for combat pressure preview
- `RoundAction` normalized into explicit action variants
- round draft made action-aware internally
- live sandbox screen contract updated to consume `selectedAction` directly
- baseline combat constants centralized into `src/modules/combat/config/combatConfig.ts`
- combat formula coefficients and snapshot HP scaling centralized into `src/modules/combat/config/combatConfig.ts`
- preview profile weights and planner heuristic thresholds centralized into `src/modules/combat/config/combatConfig.ts`
- Phase 3 combat configuration centralization completed

## Maintenance Rule

Whenever combat behavior changes:

1. update the relevant combat code
2. update this roadmap if priorities or architecture direction changed
3. update player-facing combat docs if visible rules changed
4. run targeted combat tests and build

---

## Related Docs

- [Docs Home](../)
- [Architecture Index](./)
- [Combat Design Reference](./combat-design-reference.md)

---

> Last updated: 2026-03-14 12:18 MSK
