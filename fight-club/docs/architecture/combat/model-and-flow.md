# Combat Model And Flow

> Last updated: 2026-03-14 12:52 MSK

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

### Consumable-only sequence

Inside `resolveConsumableUse(...)`, the live order is:

1. apply heal and direct resource restore to the attacker
2. apply any consumable effects
3. build a `consumable` result with the attacker as both attacker and defender identity

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

---

## Edge-Case Rules

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

## Turn-Order Examples

### Example 1: Faster attacker applies a debuff

If Alpha acts before Beta and Alpha applies a timed debuff to Beta:

1. Alpha runs turn-start effects
2. Alpha resolves the action
3. Beta receives the new active effect
4. Beta later reaches their own turn
5. Beta runs turn-start effects with that effect already active

### Example 2: Slower attacker applies a debuff

If Beta acts first and Alpha applies the debuff second:

1. Beta runs turn-start effects and resolves their action
2. Alpha runs turn-start effects and resolves the debuffing action
3. The round ends
4. Beta only processes that new effect at the start of their next turn in the next round

### Example 3: Turn-start death before action

If a combatant begins their turn with enough periodic damage to die:

1. turn-start effects resolve
2. HP falls to `0`
3. a turn-start log result is created
4. that combatant does not continue to their selected action

### Example 4: Faster actor kills slower defender

If the faster combatant reduces the slower combatant to `0` HP before the slower combatant acts:

1. faster combatant finishes their action
2. slower defender is now dead
3. when the loop reaches the slower defender, their action is skipped

---

## Related Docs

- [Combat System](./)
- [Combat Formulas And Effects](./formulas-and-effects.md)
- [Combat Integrations And Verification](./integrations-and-verification.md)

---

> Last updated: 2026-03-14 12:52 MSK
