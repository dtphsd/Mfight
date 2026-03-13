# Combat Verification And Tests

> Last updated: 2026-03-14 12:52 MSK

## Current Test Coverage

The current combat suite already validates these live behaviors:

- combat startup state
- round resolution and log appending
- duplicate defense-zone rejection
- fight completion on lethal damage
- item-derived damage, armor, and combat bonuses
- preferred damage type override
- weapon-class style bias
- zone-relevant defense armor emphasis
- resource gain from crit, block, hit, and dodge
- resource spend for item skills
- timed skill effects on the next turn
- weapon passive application and stacking
- follow-up damage after armor shred
- sustain skills with healing and guard recovery
- `consumable_attack` combo flow
- multi-turn regeneration consumables

What is still not explicit enough and is a good target for `COMBAT-003`:

- composition cases where skill, consumable, passive, and turn-start effects interact in the same round
- boundary cases around simultaneous lethal states
- deeper initiative-sensitive effect timing cases
- regression cases around resource thresholds after chained events

---

## Traceability Map

This section links the main combat rules to runtime code, tests, and the player-facing rules screen.

### Core runtime

- combat startup state
  - runtime:
    - `src/modules/combat/application/startCombat.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "starts combat with two active combatants"
- round resolution loop and action order
  - runtime:
    - `src/modules/combat/application/resolveRound.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "resolves a round and appends results to the combat log"
- snapshot stat and profile assembly
  - runtime:
    - `src/orchestration/combat/buildCombatSnapshot.ts`
  - tests:
    - `tests/modules/combat.test.ts` - item-derived combat bonus cases

### Main combat rules

- duplicate defense-zone rejection
  - runtime:
    - `resolveRound.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "rejects duplicate defense zones"
- zone weighting and defended-zone armor focus
  - runtime:
    - `resolveRound.ts`
    - `combatConfig.ts`
    - `combatPressure.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "boosts zone-relevant armor when the defended zone matches the attack"
  - rules screen:
    - `src/ui/screens/CombatRules/combatRulesContent.ts` sections `round`, `armor`, `zones`
- dodge, block, penetration, crit, and resource rewards
  - runtime:
    - `resolveRound.ts`
    - `combatFormulas.ts`
    - `combatConfig.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "grants combat resources from crits, blocks, hits and dodges"
  - rules screen:
    - `combatRulesContent.ts` sections `round`, `stats`, `resources`
- preferred damage type and weapon-style bias
  - runtime:
    - `resolveRound.ts`
    - `combatConfig.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "prefers damage type from weapon metadata over raw profile dominance"
    - `tests/modules/combat.test.ts` - "uses weapon class style bias when distributing attack types"
  - rules screen:
    - `combatRulesContent.ts` sections `damage`, `items`

### Skills, effects, and passives

- skill cost, skill damage, and log tagging
  - runtime:
    - `resolveRound.ts`
    - `RoundAction.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "uses an item skill to spend resources and tag the combat log"
  - rules screen:
    - `combatRulesFacts.ts`
    - `combatRulesContent.ts` section `skills`
- timed effects and next-turn resolution
  - runtime:
    - `resolveRound.ts`
    - `CombatEffect.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "applies combat effects from skills and resolves them on the target's next turn"
  - rules screen:
    - `combatRulesContent.ts` sections `round`, `skills`, `resources`
- weapon passives and stacking
  - runtime:
    - `combatWeaponPassives.ts`
    - `resolveRound.ts`
  - tests:
    - `tests/modules/combat.test.ts` - passive application table case
    - `tests/modules/combat.test.ts` - "stacks sword weapon passive bleed across repeated hits"
  - rules screen:
    - generated facts do not fully explain passive runtime rules, so manual copy can still drift

### Consumables and sandbox contracts

- consumable-only and consumable-attack flows
  - runtime:
    - `resolveRound.ts`
    - `combatSandboxController.ts`
  - tests:
    - `tests/modules/combat.test.ts` - "allows combo consumables to resolve together with an attack"
    - `tests/modules/combat.test.ts` - "applies a regeneration consumable effect for multiple turns"
  - rules screen:
    - `combatRulesContent.ts` sections `round`, `items`
- bot planning assumptions
  - runtime:
    - `src/orchestration/combat/botRoundPlanner.ts`
    - `src/orchestration/combat/combatPressure.ts`
  - tests:
    - `tests/modules/botRoundPlanner.test.ts`
- sandbox orchestration and UI contract
  - runtime:
    - `src/orchestration/combat/combatSandboxController.ts`
    - `src/ui/hooks/useCombatSandbox.ts`
    - `src/ui/screens/Combat/CombatSandboxScreen.tsx`
  - tests:
    - `tests/orchestration/combatSandboxSupport.test.ts`
    - `tests/ui/combatSandboxScreen.test.tsx`
    - `tests/ui/battleLogFormatting.test.ts`
    - `tests/ui/combatRulesScreen.test.tsx`

Practical rule:

- if you change a combat rule, update the matching row here so future work still has a reliable trail from runtime to tests to user-facing docs

---

## Regression-Test Target Matrix

This matrix turns the documented risk areas into explicit targets for `COMBAT-003`.

### Highest priority targets

- `RT-001` turn-start lethal damage cancels the actor turn
  - runtime focus:
    - `processTurnStartEffects(...)`
    - round loop skip behavior in `resolveRound(...)`
  - regression risk:
    - dead actor still acts
    - wrong log order
  - current gap:
    - no dedicated single-purpose test
- `RT-002` fresh timed effect ticks this round only if the target has not acted yet
  - runtime focus:
    - initiative-sensitive effect timing
  - regression risk:
    - effect timing silently shifts by one round
  - current gap:
    - covered partially, not exhaustively
- `RT-003` dodge short-circuits all downstream hit logic
  - runtime focus:
    - dodge branch in `resolveAttack(...)`
  - regression risk:
    - passives or effects still apply on a dodge
  - current gap:
    - no explicit test that proves skill effects and passives are skipped on dodge
- `RT-004` `consumable_attack` keeps the full attack pipeline
  - runtime focus:
    - pre-hit consumable prep plus normal hit resolution
  - regression risk:
    - combo action stops crit, block, penetration, or passive processing
  - current gap:
    - current coverage proves combo flow exists, but not the full branch behavior

### High-value composition targets

- `RT-005` skill effect plus weapon passive in the same hit
  - risk:
    - one application overwrites the other
- `RT-006` consumable effect plus turn-start tick plus follow-up action in one round pair
  - risk:
    - wrong sequencing between heal, effect tick, and attack
- `RT-007` block vs penetration boundary behavior under high armor penetration
  - risk:
    - threshold drift after formula tuning
- `RT-008` clean-hit momentum must not also grant crit or penetration rewards incorrectly
  - risk:
    - double reward bugs
- `RT-009` passive-trigger floor on `finalDamage <= 0`
  - risk:
    - passive still applies on zero-damage hits
- `RT-010` passive-trigger floor on dodge
  - risk:
    - passive still applies on missed attacks

### System-contract targets

- `RT-011` battle log order when both turn-start result and action result exist
  - risk:
    - UI and analytics read the wrong narrative order
- `RT-012` consumable-only action preserves attacker as both attacker and defender identity in log shape
  - risk:
    - log formatting or downstream UI breaks
- `RT-013` skill resource spend plus reward gain resolves in the intended order
  - risk:
    - threshold bugs on exact-cost skills
- `RT-014` bot-planner affordable-skill filtering remains aligned with resource truth
  - risk:
    - bot chooses impossible actions after rule changes
- `RT-015` Combat Rules generated facts stay aligned with starter item skill facts
  - risk:
    - rules screen silently drifts from live content

### Practical order for `COMBAT-003`

Recommended implementation order:

1. `RT-001`
2. `RT-003`
3. `RT-009`
4. `RT-010`
5. `RT-002`
6. `RT-004`
7. `RT-005`
8. `RT-011`

Reason:

- these cover the most dangerous silent-regression paths in `resolveRound(...)` before moving to broader system contracts

---

## Known Gaps In This Reference

This first draft is intentionally based on the current runtime and still needs expansion in the next tasks:

- concrete implementation of the regression-test target matrix under `COMBAT-003`

Those gaps are tracked by:

- `COMBAT-002`
- `COMBAT-003`
- `COMBAT-004`
- `COMBAT-005`

---

## Related Docs

- [Combat System](./)
- [Combat Integrations And Verification](./integrations-and-verification.md)
- [Combat Model And Flow](./model-and-flow.md)

---

> Last updated: 2026-03-14 12:52 MSK
