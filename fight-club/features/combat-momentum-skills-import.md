# Combat Momentum Skills Import

> Last updated: 2026-03-15 23:38 MSK

**Feature:** Combat Momentum Skills Import  
**Status:** IN PROGRESS

---

## Why

We want to reuse a recognizable set of classic momentum-based skills from an external combat reference and translate them into the current `fight-club` combat model.

---

## Problem

The source screenshot contains useful skill ideas, but the data format does not match the current runtime model.

The imported skills mention:

- level requirements
- cooldown / delay
- an external unlock source (`book store`)
- direct flat damage phrasing tied to character level

The current `fight-club` runtime does not yet support those fields as first-class combat-skill properties.

---

## Root Cause

Current `CombatSkill` only supports:

- `id`
- `name`
- `description`
- `sourceItemCode`
- `resourceType`
- `cost`
- `damageMultiplier`
- `critChanceBonus`
- `armorPenetrationPercentBonus`
- `effects`
- `stateBonuses`

It does not yet support:

- explicit level requirements
- cooldowns
- non-item unlock channels
- pure flat `+X level-scaled damage` as a dedicated skill field

---

## Solution

Normalize the screenshot skills into a project-ready draft:

- preserve the original fantasy and resource costs
- convert direct damage phrasing into `damageMultiplier`, `effects`, or setup/payoff windows
- keep unsupported source fields as design notes instead of fake runtime fields

---

## Affects

- `src/modules/combat/model/CombatSkill.ts`
- `src/content/items/starterItems.ts`
- `src/ui/components/combat/BuilderPopover.tsx`
- future combat unlock / cooldown systems

---

## Source Extraction

The following skills were read from the screenshot as momentum skills:

1. `Сильный удар`
   - cost: `3`
   - min level: `2`
   - effect: next hit deals `3 x level` more damage

2. `Воля к победе`
   - cost: `3`
   - cooldown: `5`
   - min level: `3`
   - effect: healing efficiency `+24%` for `3` turns

3. `Удачный удар`
   - cost: `5`
   - min level: `4`
   - effect: next hit deals `6 x level` more damage

4. `Подлый удар`
   - cost: `7`
   - extra requirement: `Сила духа 1`
   - min level: `4`
   - effect: instantly deals `6 x level` damage

5. `Разведка боем`
   - cost: `2`
   - min level: `5`
   - effect: successful hit reveals enemy tactics, buffs, and moves for `5` turns

6. `Усиленные удары`
   - cost: `3`
   - min level: `7`
   - effect: all hits in the next exchange deal `6 x level` more damage
   - source note: requires a book purchase in the original game

---

## Project-Ready Draft

These are the recommended normalized objects for `fight-club`.

They are not yet live runtime content; this is the adaptation layer we can safely implement from.

```ts
const importedMomentumSkillsDraft = [
  {
    id: "momentum-strong-hit",
    name: "Strong Hit",
    description: "Momentum opener: primes the next strike for heavier impact.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 12,
    damageMultiplier: 1.18,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 6, pierce: 6, blunt: 6, chop: 6 },
    effects: [
      {
        id: "strong-hit-primed-impact",
        name: "Primed Impact",
        description: "The next exchange hits harder.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 1,
        modifiers: {
          outgoingDamagePercent: 10,
        },
      },
    ],
    designNotes: {
      originalName: "Сильный удар",
      originalCost: 3,
      originalMinLevel: 2,
      originalText: "Next hit deals 3 x level more damage.",
    },
  },
  {
    id: "momentum-will-to-win",
    name: "Will to Win",
    description: "Momentum recovery: improves short healing windows and stabilizes the fighter.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 14,
    damageMultiplier: 0.92,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    effects: [
      {
        id: "will-to-win-second-breath",
        name: "Second Breath",
        description: "Improves sustain for a short time.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 3,
        modifiers: {
          incomingDamagePercent: -8,
        },
        periodic: {
          heal: 3,
        },
      },
    ],
    designNotes: {
      originalName: "Воля к победе",
      originalCost: 3,
      originalCooldown: 5,
      originalMinLevel: 3,
      originalText: "Healing efficiency +24% for 3 turns.",
      unsupportedNow: ["cooldown", "healing efficiency as a dedicated scalar"],
    },
  },
  {
    id: "momentum-lucky-hit",
    name: "Lucky Hit",
    description: "Momentum spike: commits to a stronger next strike.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 18,
    damageMultiplier: 1.34,
    critChanceBonus: 6,
    armorPenetrationPercentBonus: { slash: 8, pierce: 10, blunt: 6, chop: 8 },
    effects: [
      {
        id: "lucky-hit-open-window",
        name: "Open Window",
        description: "Improves outgoing pressure for the next exchange.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 1,
        modifiers: {
          outgoingDamagePercent: 16,
          critChanceBonus: 4,
        },
      },
    ],
    designNotes: {
      originalName: "Удачный удар",
      originalCost: 5,
      originalMinLevel: 4,
      originalText: "Next hit deals 6 x level more damage.",
    },
  },
  {
    id: "momentum-dirty-hit",
    name: "Dirty Hit",
    description: "Momentum strike: immediate burst with a dirty opening blow.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 22,
    damageMultiplier: 1.48,
    critChanceBonus: 10,
    armorPenetrationPercentBonus: { slash: 10, pierce: 18, blunt: 6, chop: 10 },
    designNotes: {
      originalName: "Подлый удар",
      originalCost: 7,
      originalMinLevel: 4,
      originalExtraRequirement: "Сила духа 1",
      originalText: "Instantly deals 6 x level damage.",
      unsupportedNow: ["spirit requirement as a dedicated gate"],
    },
  },
  {
    id: "momentum-battle-scout",
    name: "Battle Scout",
    description: "Momentum read: on hit, opens a short tactical reveal window.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 10,
    damageMultiplier: 1.02,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 4, pierce: 8, blunt: 0, chop: 4 },
    effects: [
      {
        id: "battle-scout-revealed-plan",
        name: "Revealed Plan",
        description: "The target's plan is partially exposed for follow-up turns.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 5,
        modifiers: {
          dodgeChanceBonus: -4,
          blockChanceBonus: -4,
        },
      },
    ],
    designNotes: {
      originalName: "Разведка боем",
      originalCost: 2,
      originalMinLevel: 5,
      originalText: "Successful hit reveals enemy tactics, buffs, and moves for 5 turns.",
      unsupportedNow: ["true enemy move reveal / scouting UI"],
    },
  },
  {
    id: "momentum-empowered-strikes",
    name: "Empowered Strikes",
    description: "Momentum tempo buff: the next exchange hits harder across all attacks.",
    sourceItemCode: "imported-momentum-book",
    resourceType: "momentum",
    cost: 16,
    damageMultiplier: 1.06,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 6, pierce: 6, blunt: 6, chop: 6 },
    effects: [
      {
        id: "empowered-strikes-burst-chain",
        name: "Burst Chain",
        description: "Raises outgoing damage for the next exchange.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 1,
        modifiers: {
          outgoingDamagePercent: 18,
        },
      },
    ],
    designNotes: {
      originalName: "Усиленные удары",
      originalCost: 3,
      originalMinLevel: 7,
      originalText: "All hits in the next exchange deal 6 x level more damage.",
      originalUnlockSource: "Book Store",
      unsupportedNow: ["book-store unlock source"],
    },
  },
] as const;
```

---

## Adaptation Notes

Recommended mapping from original wording to current runtime:

- `next hit deals more damage`
  - use `durationTurns: 1` self-buff with `outgoingDamagePercent`
  - optionally combine with a modest `damageMultiplier`

- `instant damage`
  - use a stronger direct attack skill with no extra rider needed

- `healing efficiency`
  - current engine has no generic heal-scaling stat
  - approximate with:
    - short periodic heal
    - reduced incoming damage
    - resource recovery

- `reveal enemy tactics`
  - current engine has no true scouting/reveal layer
  - first safe approximation is a readable debuff
  - real implementation would need a UI + state contract for enemy intent visibility

- `cooldown`
  - currently unsupported
  - should be deferred until a proper cooldown system exists in `CombatSkill`

---

## Recommended Implementation Order

1. `Strong Hit`
2. `Lucky Hit`
3. `Dirty Hit`
4. `Empowered Strikes`
5. `Will to Win`
6. `Battle Scout`

Reason:

- the first four map cleanly onto the current combat engine
- the last two need extra system decisions to feel correct

---

## Next Step

Pick one of two routes:

- `Route A`: implement the 4 cleanest momentum skills now as item/book skills in current runtime
- `Route B`: first extend `CombatSkill` to support cooldowns, unlock source metadata, and scouting/reveal

---

> Last updated: 2026-03-15 23:38 MSK
