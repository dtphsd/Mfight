import type { CombatSkill } from "@/modules/combat";

const zeroPenetration = {
  slash: 0,
  pierce: 0,
  blunt: 0,
  chop: 0,
} as const;

export const importedMomentumSkills: CombatSkill[] = [
  {
    id: "momentum-will-to-win",
    name: "Will to Win",
    description: "Momentum recovery skill that stabilizes the fighter and reinforces short healing windows.",
    sourceItemCode: "momentum-field-manual",
    resourceType: "momentum",
    cost: 14,
    damageMultiplier: 0.92,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: zeroPenetration,
    cooldownTurns: 5,
    requirements: {
      minLevel: 3,
    },
    unlock: {
      kind: "book",
      sourceName: "Field Manual: Will to Win",
      note: "Imported from classic momentum skill reference.",
    },
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
  },
  {
    id: "momentum-battle-scout",
    name: "Battle Scout",
    description: "Momentum read that opens a long tactical reveal window after a clean hit.",
    sourceItemCode: "momentum-field-manual",
    resourceType: "momentum",
    cost: 10,
    damageMultiplier: 1.02,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: {
      slash: 4,
      pierce: 8,
      blunt: 0,
      chop: 4,
    },
    requirements: {
      minLevel: 5,
    },
    unlock: {
      kind: "book",
      sourceName: "Field Manual: Battle Scout",
      note: "True intent reveal still needs dedicated combat UI support.",
    },
    effects: [
      {
        id: "battle-scout-revealed-plan",
        name: "Revealed Plan",
        description: "The target's defensive plan is partially exposed for follow-up turns.",
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
  },
];
