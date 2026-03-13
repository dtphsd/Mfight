# Combat Formulas And Effects

> Last updated: 2026-03-14 13:16 MSK

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

## Named State Layer

The first named state layer now includes:

- `Exposed`
  - target debuff
  - 2 turns
  - up to 2 stacks
  - `+8% incoming damage` per stack
  - intended for Duelist and Executioner setup/payoff windows
- `Staggered`
  - target debuff
  - 2 turns
  - up to 2 stacks
  - `-6 block power` per stack
  - `-4 dodge chance bonus` per stack
  - intended for Breaker disruption and anti-guard pressure

Design rule:

- these states are intentionally readable and low-noise
- they should create tactical windows, not hard crowd control
- first-wave state-aware skills use the existing combat effect system instead of a separate state engine

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

## Related Docs

- [Combat System](./)
- [Combat Model And Flow](./model-and-flow.md)
- [Combat Integrations And Verification](./integrations-and-verification.md)

---

> Last updated: 2026-03-14 13:16 MSK
