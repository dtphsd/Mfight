# Combat Design Reference

> Last updated: 2026-03-14 00:41 MSK

**Project:** Fight Club  
**Status:** draft from live runtime

---

## Purpose

This document is the working source of truth for the live combat runtime in `fight-club/`.

It exists to make combat changes safer. If the code and this document diverge, the code is the source of truth and this document must be updated.

---

## Read This With

- [Architecture Overview](./overview.md)
- [Combat System Roadmap](./combat-system-roadmap.md)
- [ADR-001: Modular Headless Core](../decisions/ADR-001-architecture.md)

---

## What This Page Covers

- live combat model
- sequencing inside `resolveRound(...)`
- formulas and coefficients
- effects, passives, resources, zones, and consumables
- verification rules
- traceability from runtime to tests and player-facing docs

## What This Page Does Not Replace

- detailed implementation tests
- planning tasks in `MASTER-PLAN.md`
- the player-facing `Combat Rules` screen

---

## Core Runtime Files

- `src/modules/combat/application/startCombat.ts`
- `src/modules/combat/application/resolveRound.ts`
- `src/modules/combat/model/CombatantState.ts`
- `src/modules/combat/model/CombatEffect.ts`
- `src/modules/combat/model/RoundAction.ts`
- `src/modules/combat/model/RoundResult.ts`
- `src/modules/combat/config/combatConfig.ts`
- `src/modules/combat/config/combatWeaponPassives.ts`
- `src/orchestration/combat/buildCombatSnapshot.ts`
- `src/orchestration/combat/combatSandboxController.ts`

---

## Combat Model

### Combat State

Live combat starts in `startCombat(...)` and produces:

- `round: 1`
- `status: "active"`
- two combatants
- empty combat log
- `winnerId: null`

### Combatant State

Each combatant starts a fight with:

- snapshot-derived stats and damage or armor profiles
- full HP
- zero resources:
  - `rage`
  - `guard`
  - `momentum`
  - `focus`
- no selected attack zone
- no selected defense zones
- no active effects

### Round Actions

The live runtime supports four explicit action kinds:

- `basic_attack`
- `skill_attack`
- `consumable`
- `consumable_attack`

Every action still carries:

- `attackerId`
- `attackZone`
- `defenseZones` as exactly two zones

This is important: even non-basic actions still resolve through the same round contract.

---

## Zones And Targeting

The canonical combat zones are:

- `head`
- `chest`
- `belly`
- `waist`
- `legs`

Zone choice matters in three ways:

- attack damage scaling through `combatZoneDamageModifiers`
- defense matching through selected defense zones
- armor weighting by slot through `combatZoneDefenseSlots`

Live zone damage modifiers:

- `head`: `1.2`
- `chest`: `1.1`
- `belly`: `1.0`
- `waist`: `0.9`
- `legs`: `0.8`

---

## Initiative And Turn Order

Round order is resolved every round in `resolveRound(...)`.

Live rule:

- combatants are sorted by `stats.agility`
- if agility is equal, tie-break is random

Important design consequence:

- many effect and survival outcomes are initiative-sensitive because turn-start processing happens on the acting combatant's turn, not on a shared round boundary

---

## Turn Validation Rules

The round is rejected if any of these conditions fail:

- combat status is not `active`
- action map does not match both combatants
- a combatant is missing
- a dead combatant tries to act
- both defense zones are the same
- a selected skill costs more resources than the attacker currently has

At orchestration level, the sandbox also rejects:

- missing combat state
- missing player or bot combatant
- fewer than two selected defense zones
- unavailable skill or missing required resources

---

## Resolution Pipeline

This is the live order inside `resolveRound(...)`.

### 1. Attach round intent

Each combatant receives:

- `attackZone`
- `defenseZones`

### 2. Determine acting order

Order is based on agility, then random tie-break.

### 3. Process the acting combatant turn start

Before the action resolves, the acting combatant runs turn-start effects.

Current behavior:

- periodic heal applies
- periodic damage applies
- periodic resource changes apply
- effect durations tick down
- expired effects are removed

If turn-start damage kills the acting combatant:

- a turn-start result is added to the log
- the combatant does not continue their action

### 4. Resolve action type

- `consumable` goes through consumable-only resolution
- all other action kinds go through attack resolution

### 5. For attacks, prepare attacker and defender

Current live order:

- defender active effects modify the effective defender
- a `consumable_attack` may alter the attacker before the hit
- attacker active effects modify the prepared attacker
- selected skill cost is checked

### 6. Build outgoing attack profile

The outgoing profile is based on:

- base damage
- style profile / weapon profile
- attack zone
- skill damage modifier, if present
- outgoing damage percent modifiers from effects

### 7. Dodge check

If dodge succeeds:

- result type becomes `dodge`
- no damage is dealt
- defender gains `focus`
- combat continues to the next actor

### 8. Armor and block path

If the defender covered the attack zone:

- the hit enters block logic
- a penetration roll decides between `block` and `penetration`

If fully blocked:

- damage is reduced by blocked percent
- defender gains `guard`

If penetrated:

- attacker gains `momentum`

### 9. Crit check

If crit succeeds:

- the resolved damage profile is multiplied
- attacker gains `rage`

### 10. Final damage and HP application

The final mitigated profile is summed into `finalDamage`.

Then:

- defender HP is reduced
- any consumable healing already applied to the attacker is reflected in the result

### 11. On-hit effects and passives

After a real hit path, the runtime may apply:

- skill effects
- consumable combat effects
- weapon passive effects

Effects can target:

- `self`
- `target`

Effects can trigger through:

- `on_use`
- `on_hit`

### 12. Log result and update next state

Each resolved step writes a `RoundResult`.

When both acting turns finish:

- if one combatant remains alive, combat ends and `winnerId` is set
- otherwise the combat stays `active` and the round increments

---

## Exact Resolution Sequencing Notes

This section captures the order that matters most for safe refactors.

### Per-actor sequence inside the round loop

For each acting combatant, the live sequence is:

1. read current attacker and defender from `nextCombatants`
2. skip immediately if either side is already dead
3. run `processTurnStartEffects(attacker)`
4. write the updated attacker back into `nextCombatants`
5. if turn-start processing produced a log result and the actor can no longer continue, push that result and stop this actor's turn
6. otherwise resolve either:
   - `resolveConsumableUse(...)`
   - `resolveAttack(...)`
7. write updated attacker and defender back into `nextCombatants`
8. set the action result `round`
9. if a turn-start result exists, push it first
10. push the main action result second

Important consequence:

- when both a turn-start effect tick and a normal action happen on the same turn, the log order is always:
  - turn-start result
  - main action result

### Attack-path sequence

Inside `resolveAttack(...)`, the live order is:

1. compute defender effect modifiers
2. build effective defender
3. if this is `consumable_attack`, apply consumable pre-hit preparation to the attacker
4. compute attacker effect modifiers
5. build effective prepared attacker
6. validate skill resource cost
7. build attack profile
8. roll dodge
9. if not dodged, resolve armor mitigation and optional block or penetration
10. roll crit
11. compute `damage` and floored `finalDamage`
12. assign clean-hit momentum if no crit, no penetration, and no block occurred
13. apply HP loss to defender
14. spend skill resource cost and add attacker resource gains
15. apply skill effects
16. apply weapon passive effects
17. set final HP fields and optional knockout commentary

Important consequence:

- skill effects are applied before weapon passive effects
- knockout commentary can come from passive-effect lethality, not only from direct hit damage

### Consumable-only sequence

Inside `resolveConsumableUse(...)`, the live order is:

1. apply heal and direct resource restore to the attacker
2. apply any consumable effects
3. build a `consumable` result with the attacker as both attacker and defender identity

Important consequence:

- consumable-only actions do not damage the opponent
- the combat log entry still uses the shared `RoundResult` shape

### Turn-start sequence

Inside `processTurnStartEffects(...)`, the live order is:

1. sum periodic resource gains from all active effects
2. sum periodic damage from all active effects
3. sum periodic healing from all active effects
4. compute next HP from damage and healing together
5. mark effects with `turnsRemaining <= 1` as expiring
6. decrement all effect timers
7. remove expired effects
8. write next HP, next resources, and remaining effects
9. if nothing meaningful happened, return `result: null`
10. otherwise emit an `effects` log result

Important consequence:

- periodic damage and periodic healing are both applied before expiry cleanup is finalized
- an effect with `turnsRemaining = 1` still contributes its final tick before being removed

---

## Edge-Case Rules

These are especially important because they are easy to break accidentally.

### Turn-start tick plus normal action

If an actor has periodic effects and survives turn start:

- the turn-start log entry is emitted
- then the actor still performs their selected action

### Turn-start lethal damage

If turn-start damage kills the actor:

- the turn-start result is emitted
- no normal action result is emitted for that actor

### Defender dies before their turn

If the first actor kills the second actor before the second actor's turn:

- the second actor's turn is skipped entirely
- there is no late exchange or death-trigger action

### Dodge path

If dodge succeeds:

- no damage, crit, block, penetration, skill effects, or passives are applied
- only defender `focus` gain is applied

### Passive trigger floor

Weapon passives do not trigger when:

- the attack was dodged
- `finalDamage <= 0`

### Consumable attack wording

`consumable_attack` is still treated as an attack result:

- it can deal damage
- it can carry a consumable name
- it can still go through dodge, block, penetration, crit, skill-effect, and passive logic

---

## Resources

The live resource system is:

- `rage`
- `guard`
- `momentum`
- `focus`

Current visible reward hooks in config:

- dodge gives defender `focus: 10`
- block gives defender `guard: 8`
- penetration gives attacker `momentum: 8`
- crit gives attacker `rage: 14`
- clean hit gives attacker `momentum: 12`

Resources are also affected by:

- skill costs
- periodic combat effects
- consumables with combat effects

---

## Formula Reference

Current live coefficients from `combatConfig.ts` and `combatFormulas.ts`:

### Progression

- base HP: `100`
- HP per endurance: `10`
- minimum stat value after resolution: `1`
- percent clamp for stat or profile scaling: `-100` to `1000`

### Base formulas

- base damage: `10 + strength * 1.5`
- base dodge seed: `5 + defenderAgility * 2`
- dodge penalty from attacker agility: `2` per point
- base crit seed: `3 + attackerRage * 3`
- crit penalty from defender rage: `2` per point
- crit multiplier: `1.5 + endurance * 0.03`

### Chance caps

- generic chance clamp: `95`
- generic percent clamp: `90`
- base dodge cap: `45`
- final dodge cap: `60`
- base block penetration cap: `75`
- final block penetration cap: `80`
- base crit cap: `40`

### Block and penetration

- base penetration start: `20`
- base penetration floor: `10`
- attacker strength factor: `3`
- defender strength penalty factor: `2`
- armor penetration profile divisor contribution: `3.2`
- base blocked percent: `34`
- block focus-strength divisor for zone armor emphasis: `160`

### Attack profile mixing

- base damage profile weight: `0.6`
- style or weapon profile weight: `0.4`

### Snapshot resolution

`buildCombatSnapshot.ts` currently resolves combat stats as:

- `(baseStat + flatBonus) * (1 + clampedPercent / 100)`
- result is floored
- stats are clamped to at least `1`
- damage and armor profile values are floored and clamped to at least `0`

---

## Exact Formula Behavior

### Dodge

Live formula:

- `baseDodgeChance = min(45, max(0, 5 + defenderAgility * 2))`
- `dodgeChance = min(60, max(0, baseDodgeChance - attackerAgility * 2))`
- final runtime dodge rate then adds defender dodge bonuses from combat bonuses and active effects

### Block penetration

Live formula:

- `baseBlockPenetration = min(75, max(10, 20 + attackerStrength * 3))`
- `blockPenetration = min(80, max(10, baseBlockPenetration - defenderStrength * 2))`
- runtime then adds total percent armor penetration pressure divided by `3.2`
- runtime then subtracts defender block chance bonus

### Crit

Live formula:

- `baseCritChance = min(40, max(0, 3 + attackerRage * 3))`
- `critChance = min(40, max(0, baseCritChance - defenderRage * 2))`
- runtime then adds attacker crit bonuses and skill crit bonus

### Final crit multiplier

Live formula:

- `critMultiplier = 1.5 + endurance * 0.03 + critMultiplierBonus`

### Armor mitigation

Per damage type:

- `effectiveArmor = max(0, armor - penetrationFlat - armor * (penetrationPercent / 100))`
- `mitigatedDamage = max(0, attackValue - effectiveArmor)`

This happens separately for:

- `slash`
- `pierce`
- `blunt`
- `chop`

Then the result profile is summed and floored into `finalDamage`.

---

## Effects

Live combat effects are stack-aware timed runtime objects.

Each active effect carries:

- source metadata
- remaining turns
- stack count
- max stacks
- flat and percent modifiers
- periodic heal, damage, and resource deltas

Effect system facts from the runtime:

- modifiers scale by stack count
- periodic values scale by stack count
- stacks are capped per effect definition
- effects can buff offense, defense, crit, dodge, block, armor, penetration, and incoming or outgoing damage

Important design rule:

- effect timing is currently actor-turn based, not neutral round-boundary based

---

## Weapon-Class Passive Rules

Current passive catalog from `combatWeaponPassives.ts`:

- `sword` -> `Open Wound`
  - trigger: on hit
  - target: defender
  - duration: 2 turns
  - stacks: up to 3
  - effect: `4` periodic damage per stack
- `dagger` -> `Vital Mark`
  - trigger: on crit
  - target: defender
  - duration: 2 turns
  - stacks: up to 3
  - effect: `+8%` incoming damage and `-6` dodge chance bonus per stack
- `mace` / `greatmace` -> `Concussed Guard`
  - trigger: on hit
  - target: defender
  - duration: 1 turn
  - stacks: up to 2
  - effect: `-6` block power and `-2` blunt armor per stack
- `axe` / `greataxe` -> `Rending Hook`
  - trigger: on hit
  - target: defender
  - duration: 2 turns
  - stacks: up to 3
  - effect: `+6%` incoming damage per stack
- `greatsword` -> `Execution Pressure`
  - trigger: on hit
  - target: self
  - duration: 1 turn
  - stacks: up to 2
  - effect: `+10%` outgoing damage per stack

Passive effect application is skipped if:

- there is no weapon class
- the attack was dodged
- `finalDamage <= 0`

---

## Damage And Defense Model

The runtime uses typed damage profiles:

- `slash`
- `pierce`
- `blunt`
- `chop`

Defense and offense are both profile-based.

The effective hit result depends on:

- attack profile construction
- zone multiplier
- armor by slot and generic zone defense
- flat armor penetration
- percent armor penetration
- block outcome
- crit outcome
- incoming and outgoing effect modifiers

Weapon class also matters through zone-biased style profiles.

---

## Consumables

Consumables can currently behave in two combat ways:

- as a pure `consumable` action
- as part of a `consumable_attack`

Combat consumables may:

- heal HP
- apply combat effects
- alter the attack before hit resolution

Sandbox rule:

- after a successful round resolution, a selected consumable is removed from inventory
- the draft consumable selection is then cleared

---

## Runtime Outputs

Every resolved event writes a `RoundResult` with:

- attacker and defender identity
- attack zone
- primary damage type
- optional skill or consumable name
- flags for dodge, block, penetration, and crit
- raw and final damage
- HP after resolution
- resource gains
- applied and expired effects
- commentary
- optional knockout commentary

This result contract drives:

- battle log rendering
- combat analytics
- silhouette reactions
- post-round UI summaries

---

## Turn-Order Examples

### Example 1: Faster attacker applies a debuff

If Alpha acts before Beta and Alpha applies a timed debuff to Beta:

1. Alpha runs turn-start effects
2. Alpha resolves the action
3. Beta receives the new active effect
4. Beta later reaches their own turn
5. Beta runs turn-start effects with that effect already active

Practical result:

- a newly applied periodic debuff can tick on the defender later in the same round if the defender has not acted yet

### Example 2: Slower attacker applies a debuff

If Beta acts first and Alpha applies the debuff second:

1. Beta runs turn-start effects and resolves their action
2. Alpha runs turn-start effects and resolves the debuffing action
3. The round ends
4. Beta only processes that new effect at the start of their next turn in the next round

Practical result:

- effect timing is strongly initiative-sensitive

### Example 3: Turn-start death before action

If a combatant begins their turn with enough periodic damage to die:

1. turn-start effects resolve
2. HP falls to `0`
3. a turn-start log result is created
4. that combatant does not continue to their selected action

Practical result:

- action selection does not guarantee action execution if turn-start damage is lethal

### Example 4: Faster actor kills slower defender

If the faster combatant reduces the slower combatant to `0` HP before the slower combatant acts:

1. faster combatant finishes their action
2. slower defender is now dead
3. when the loop reaches the slower defender, their action is skipped

Practical result:

- there is no simultaneous exchange once one side is dead before their turn

---

## Sandbox And UI Dependencies

Combat behavior is not isolated to the engine. It directly affects:

- `combatSandboxController.ts`
- `useCombatSandbox.ts`
- battle log formatting
- skill readiness UI
- action availability
- silhouette hit feedback
- combat rules reference screen

This means a combat change is never just a formula change. It can also affect:

- player guidance
- round drafting
- bot planning
- balance matrix output
- visible combat explanations

---

## Bot Planner Assumptions

The sandbox bot is not a full combat AI. It is a heuristic planner built around preview pressure and affordable skills.

Current live assumptions from `botRoundPlanner.ts`:

- the bot always chooses one attack zone and two defense zones
- the bot never uses consumables
- the bot only considers skills that are currently affordable
- the bot relies on preview pressure from `combatPressure.ts`, not full future simulation
- the bot uses archetype-specific weights and difficulty-specific variance rules

Difficulty behavior:

- `recruit`
  - randomizes more heavily
  - does not use skills
  - chooses defense zones more loosely
- `veteran`
  - uses preview pressure
  - uses a skill only if its score clears a threshold
- `champion`
  - uses the highest-ranked affordable skill directly
  - uses tighter zone selection with lower randomness

Strategy model facts:

- archetype changes attack-zone and defense-zone weights
- low HP pushes the bot toward more guarded calculations
- burst strategies care more about finisher windows and crit synergy
- sustain and defense strategies value self-targeted effects more highly

Important limitation:

- bot planning uses preview damage and heuristic scoring, so it is intentionally approximate
- if combat formulas change, the bot can become misleading even when the engine is still correct

---

## Combat Rules Screen Alignment

The `Combat Rules` screen is not a pure hand-written page. It is partly generated from live content.

Current live alignment facts:

- `CombatRulesScreen.tsx` renders `combatRulesContent`
- `combatRulesContent.ts` passes sections through `withGeneratedCombatRulesFacts(...)`
- `combatRulesFacts.ts` generates item rows and skill callouts from `starterItems`

What this means:

- showcased item and skill facts on the rules screen are partially driven by current content
- if starter item skills, costs, damage multipliers, penetration, or effect metadata change, rules-screen facts can change too
- not all explanatory copy is generated, so manual rules text can still drift from runtime truth

Safe rule:

- whenever combat behavior changes, check both:
  - generated combat facts
  - manual explanatory sections in `combatRulesContent.ts`

If runtime and rules screen diverge:

- runtime stays the source of truth
- rules content must be updated before calling the task complete

---

## Safe Change Rules For Combat

Before changing combat runtime:

1. read `resolveRound.ts`
2. read `combatSandboxController.ts`
3. read `buildCombatSnapshot.ts`
4. check relevant item content in `starterItems.ts`
5. verify battle-log impact through `RoundResult`
6. update this document if the runtime model changed

Minimum verification for combat changes:

- `npm run test -- tests/modules/combat.test.ts`
- `npm run build`
- sandbox manual pass

Recommended for balance-sensitive changes:

- `npm run test`
- `npm run balance:matrix`

---

## Combat Verification Checklist

Use this checklist whenever combat formulas, effects, resources, action rules, consumables, passives, or snapshot logic change.

### 1. Runtime correctness

- verify both combatants still start with full HP, zero resources, and no effects
- verify duplicate defense zones are still rejected
- verify insufficient skill resources are still rejected
- verify winner resolution and round increment behavior still match runtime expectations

### 2. Resolution order

- verify turn-start effects still happen before the actor's action
- verify lethal turn-start damage still cancels the actor's turn
- verify initiative still controls whether fresh effects tick this round or next round

### 3. Damage pipeline

- verify dodge, block, penetration, crit, and clean-hit paths still work
- verify zone targeting still changes damage outcome
- verify armor penetration still changes mitigated damage
- verify skill damage modifiers and crit multipliers still apply in the expected order

### 4. Resources

- verify skill costs are spent correctly
- verify dodge, block, penetration, crit, and clean-hit rewards still apply
- verify periodic resource effects still tick correctly
- verify resource thresholds in UI still match combat reality

### 5. Effects and passives

- verify skill effects still apply to the correct target
- verify consumable effects still apply in the correct mode
- verify weapon passives still trigger only on their intended conditions
- verify stacks, durations, expiry, and periodic values still behave correctly

### 6. Sandbox and UI contracts

- verify `combatSandboxController.ts` still resolves and advances rounds correctly
- verify battle log entries still describe the real runtime outcome
- verify skill ready state and action availability still match resource truth
- verify silhouette hit feedback still only reacts to real incoming damage
- verify bot behavior still looks coherent against the updated formulas and skills
- verify `Combat Rules` still matches live content and runtime behavior

### 7. Required checks

- `npm run test -- tests/modules/combat.test.ts`
- `npm run build`
- manual sandbox pass:
  - start a fight
  - use a basic attack
  - use a skill attack
  - use a consumable
  - use a consumable attack
  - verify at least one timed effect tick
  - verify battle-log output

### 8. Recommended extra checks for balance-sensitive work

- `npm run test`
- `npm run balance:matrix`
- compare `docs/balance/latest-build-matrix.md` before and after if combat numbers changed materially

---

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

- [Docs Home](../README.md)
- [Architecture Index](./README.md)
- [Combat System Roadmap](./combat-system-roadmap.md)

---

> Last updated: 2026-03-14 00:41 MSK
