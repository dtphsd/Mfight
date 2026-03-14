# Combat Integrations And Verification

> Last updated: 2026-03-14 15:19 MSK

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
- `combatRulesFacts.ts` generates item rows, skill callouts, and the named-state primer from `starterItems`

What this means:

- showcased item and skill facts on the rules screen are partially driven by current content
- player-facing setup/payoff guidance for `Exposed` and `Staggered` now also comes from the generated facts layer
- if starter item skills, costs, damage multipliers, penetration, or effect metadata change, rules-screen facts can change too
- not all explanatory copy is generated, so manual rules text can still drift from runtime truth

Safe rule:

- whenever combat behavior changes, check both:
  - generated combat facts
  - manual explanatory sections in `combatRulesContent.ts`

Current named-state sync points:

- `Opening Sense` and `Open Flank` should remain readable as `Exposed` setup tools
- `Armor Crush` and `Shield Bash` should remain readable as `Staggered` setup tools
- `Execution Arc`, `Hook Chop`, and `Crushing Blow` should remain readable as payoff skills
- the rules screen must explain the setup -> payoff loop, not only isolated skill cards

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
6. update the combat docs if the runtime model changed

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
- verify named state windows like `Exposed` and `Staggered` still last long enough to create the intended follow-up turn

### 6. Sandbox and UI contracts

- verify `combatSandboxController.ts` still resolves and advances rounds correctly
- verify battle log entries still describe the real runtime outcome
- verify skill ready state and action availability still match resource truth
- verify silhouette hit feedback still only reacts to real incoming damage
- verify each new combat impact fully resets the previous linger overlay instead of blending stale visuals into the next event
- verify `block break` only appears when a block happened and damage still penetrated through
- verify post-fight silhouette states keep winner and loser readable until the next fight starts
- verify bot behavior still looks coherent against the updated formulas and skills
- verify `Combat Rules` still matches live content and runtime behavior
- verify generated skill facts still describe state-based payoff correctly

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

## Related Docs

- [Combat System](./)
- [Combat Verification And Tests](./tests-and-traceability.md)
- [Combat Design Reference](../combat-design-reference.md)

---

> Last updated: 2026-03-15 02:18 MSK
