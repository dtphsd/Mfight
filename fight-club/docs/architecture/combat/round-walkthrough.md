# Combat Round Walkthrough

> Last updated: 2026-03-18 17:35 MSK

This page is the shortest complete walkthrough of one combat round in the live `Fight Club` runtime.

Use it when you need to answer one question quickly:

"What actually happens between choosing an action and seeing damage, effects, and battle-log output?"

---

## Round At A Glance

One round flows through these stages:

1. snapshot build
2. planner or player action choice
3. round-action assembly
4. `resolveRound(...)`
5. mitigation, crit, resources, and effects
6. battle-log and UI projection

---

## 1. Snapshot Build

Combat does not run directly on raw character or inventory data.

Before the round begins, combatants are represented as combat snapshots built from:

- base stats
- equipped weapon and armor
- zone armor
- item combat bonuses
- skill carriers and equipped skill loadout

Main files:

- `src/orchestration/combat/buildCombatSnapshot.ts`
- `src/modules/equipment/application/getEquipmentBonuses.ts`

Why this matters:

- combat math reads from a normalized combat shape
- itemization and stats are already merged before runtime resolution starts
- debugging combat should usually begin from the snapshot, not from inventory records

---

## 2. Planner Or Player Choice

The player chooses a combat action through the combat UI.

The bot chooses a plan through the combat planner.

Main file:

- `src/orchestration/combat/botRoundPlanner.ts`

The planner decides:

- attack zone
- two defense zones
- whether to use a skill

Planner inputs include:

- attacker and defender snapshots
- live combatant state
- available skills
- difficulty profile
- archetype strategy
- pressure estimates from `combatPressure.ts`

Important live rule:

- the bot planner no longer sees the player's announced attack zone in advance

---

## 3. Round Action Assembly

After planning, both sides are expressed through one shared action contract.

Main file:

- `src/modules/combat/model/RoundAction.ts`

Live action kinds:

- `basic_attack`
- `skill_attack`
- `consumable`
- `consumable_attack`

All of them still carry the same core combat intent:

- `attackerId`
- `attackZone`
- `defenseZones`

That means the runtime does not branch into a totally separate engine for skills or consumables.

---

## 4. Resolve Round

The real round is resolved in:

- `src/modules/combat/application/resolveRound.ts`

This is still the single riskiest file in the combat system because it contains the final sequencing of:

- turn order
- spend and cooldown handling
- dodge
- defense and penetration
- typed mitigation
- crit resolution
- damage application
- active-effect application
- battle-log output

At a high level, one combatant turn looks like this:

1. validate round and actions
2. determine acting order
3. attach chosen round intent to each combatant
4. spend resources and prepare chosen skill or consumable data
5. apply turn-start state processing
6. resolve dodge
7. resolve defended or undefended hit path
8. apply typed mitigation
9. resolve crit if applicable
10. apply hp, resources, effects, and cooldowns
11. emit commentary and structured round result

---

## 5. Mitigation And Defense

The live truth model is:

- mitigation is `per-damage-type`
- zone defense truth is `zoneArmor + zoneArmorBySlot`

Main files:

- `src/modules/combat/services/combatMitigation.ts`
- `src/modules/combat/config/combatConfig.ts`

Zone choice matters because it affects:

- zone damage modifier
- whether a defense zone catches the hit
- which slot weights protect that zone

Live zones:

- `head`
- `chest`
- `belly`
- `waist`
- `legs`

If the selected attack zone is defended:

- the defended path can result in block or penetration
- resource rewards differ from a clean hit

If the zone is not defended:

- combat goes straight to typed mitigation and crit logic

---

## 6. Crit And Resources

Crit, block, dodge, and resource rewards are configured through:

- `src/modules/combat/services/combatFormulas.ts`
- `src/modules/combat/config/combatConfig.ts`

Live combat resources:

- `rage`
- `guard`
- `momentum`
- `focus`

Resources are used for:

- skill costs
- reactive reward loops
- archetype rhythm

Examples:

- clean hits can grant `momentum`
- crits can grant `rage`
- blocks can grant `guard`

This is why skill cadence often depends more on actual round outcomes than on static skill cost alone.

---

## 7. Effects And State Windows

Active effects and named states are modeled in:

- `src/modules/combat/model/CombatEffect.ts`

They can:

- modify crit, dodge, block, outgoing or incoming damage
- add flat armor or damage bonuses
- add periodic damage or healing
- change resource totals over time

Current named setup/payoff states include:

- `Exposed`
- `Staggered`

Those states matter twice:

- in runtime damage or defense behavior
- in planner scoring and skill payoff logic

---

## 8. Result Object

At the end of the round, runtime produces a structured result.

Main file:

- `src/modules/combat/model/RoundResult.ts`

That result includes data such as:

- damage dealt
- crit, block, penetration, or dodge outcome
- hp changes
- resource gain and spend
- newly applied effects
- commentary and log-facing text fields

This result is what the UI and analytics read afterward.

---

## 9. UI Projection

The result is then projected into player-facing surfaces.

Main files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/components/combat/BattleLogPanel.tsx`
- `src/ui/components/combat/CombatSilhouette.tsx`

This is where the player sees:

- damage numbers
- hit, crit, block, dodge, and penetration feedback
- active effects
- updated resources
- battle-log entries

Important consequence:

- if runtime and battle-log formatting drift apart, combat can feel wrong even when formulas are technically correct

---

## 10. Risk Zones

When debugging one round, the highest-risk zones are:

### Snapshot Integrity

- broken item import paths
- zero-value item data
- incorrect equipment-to-combat bridges

### Planner Logic

- overspending setup skills
- failing to recognize active payoff windows
- choosing a good-looking skill that the resource loop cannot sustain

### `resolveRound(...)`

- sequencing drift
- hidden coupling between dodge, block, penetration, and crit
- effects modifying one branch of combat but not another

### UI Interpretation

- battle log wording can suggest a different cause than the runtime truth
- player-facing rules can lag behind the real pipeline

---

## 11. Verification Checklist

When a round-level combat change is made:

1. inspect direct consumers through imports and usages
2. run the relevant regression tests
3. run `combat:audit-skills` if skills or planner behavior changed
4. run `balance:matrix` if live roster outcomes may shift
5. sync combat docs if runtime truth changed

---

## Related Pages

- [Combat Model And Flow](./model-and-flow.md)
- [Combat Formulas And Effects](./formulas-and-effects.md)
- [Combat Integrations And Verification](./integrations-and-verification.md)
- [Combat Verification And Tests](./tests-and-traceability.md)

---

> Last updated: 2026-03-18 17:35 MSK
