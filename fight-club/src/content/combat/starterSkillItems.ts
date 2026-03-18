import { zeroCharacterStats } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat";
import { importedMomentumSkills } from "@/content/combat/importedMomentumSkills";
import {
  type Item,
  zeroArmorProfile,
  zeroCombatBonuses,
  zeroDamageProfile,
  zeroZoneArmorProfile,
} from "@/modules/inventory/model/Item";

function cloneSkill(skill: CombatSkill): CombatSkill {
  return {
    ...skill,
    roles: skill.roles ? [...skill.roles] : undefined,
    preferredZones: skill.preferredZones ? [...skill.preferredZones] : undefined,
    aiHints: skill.aiHints ? { ...skill.aiHints } : undefined,
    armorPenetrationPercentBonus: { ...skill.armorPenetrationPercentBonus },
    effects: skill.effects?.map((effect) => ({
      ...effect,
      modifiers: effect.modifiers ? { ...effect.modifiers } : undefined,
      periodic: effect.periodic ? { ...effect.periodic } : undefined,
    })),
    stateBonuses: skill.stateBonuses?.map((bonus) => ({
      ...bonus,
      armorPenetrationPercentBonus: bonus.armorPenetrationPercentBonus
        ? { ...bonus.armorPenetrationPercentBonus }
        : undefined,
    })),
  };
}

function createSkillCarrierItem(input: {
  id: string;
  code: string;
  name: string;
  description: string;
  skills: CombatSkill[];
}): { item: Item; quantity: number } {
  return {
    quantity: 1,
    item: {
      id: input.id,
      code: input.code,
      name: input.name,
      category: "accessory",
      type: "earring",
      rarity: "rare",
      description: input.description,
      value: 65,
      stackable: false,
      maxStack: 1,
      equip: {
        slot: "earring",
        armorClass: "earring",
      },
      consumableEffect: null,
      baseDamage: { ...zeroDamageProfile },
      baseArmor: { ...zeroArmorProfile },
      baseZoneArmor: { ...zeroZoneArmorProfile },
      combatBonuses: { ...zeroCombatBonuses },
      skills: input.skills.map(cloneSkill),
      statBonuses: { ...zeroCharacterStats },
      flatBonuses: { ...zeroCharacterStats },
      percentBonuses: { ...zeroCharacterStats },
      sourceMeta: {
        properties: ["Starter skill carrier"],
      },
    },
  };
}

function createExposedEffect() {
  return {
    id: "state-exposed",
    name: "Exposed",
    description: "Target is opened up for a stronger follow-up.",
    kind: "debuff" as const,
    target: "target" as const,
    trigger: "on_hit" as const,
    durationTurns: 3,
    maxStacks: 2,
    modifiers: {
      incomingDamagePercent: 8,
    },
  };
}

function createStaggeredEffect() {
  return {
    id: "state-staggered",
    name: "Staggered",
    description: "Target is worse at stabilizing and defending.",
    kind: "debuff" as const,
    target: "target" as const,
    trigger: "on_hit" as const,
    durationTurns: 2,
    maxStacks: 2,
    modifiers: {
      blockPowerBonus: -6,
      dodgeChanceBonus: -4,
    },
  };
}

const pressureSkills: CombatSkill[] = [
  {
    id: "opening-sense",
    name: "Opening Sense",
    description: "Reads the guard line and opens the target for a slash follow-up.",
    sourceItemCode: "starter-sigil-pressure",
    resourceType: "momentum",
    cost: 14,
    damageMultiplier: 1.04,
    critChanceBonus: 4,
    armorPenetrationPercentBonus: { slash: 10, pierce: 6, blunt: 0, chop: 0 },
    cooldownTurns: 2,
    roles: ["setup", "tempo"],
    preferredZones: ["head", "chest"],
    aiHints: {
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Pressure Sigil",
    },
    effects: [createExposedEffect()],
  },
  {
    id: "execution-arc",
    name: "Execution Arc",
    description: "A heavier sword follow-through that cashes in on Exposed targets.",
    sourceItemCode: "starter-sigil-pressure",
    resourceType: "momentum",
    cost: 16,
    damageMultiplier: 1.42,
    critChanceBonus: 10,
    armorPenetrationPercentBonus: { slash: 16, pierce: 8, blunt: 0, chop: 0 },
    cooldownTurns: 3,
    roles: ["payoff", "tempo"],
    preferredZones: ["head", "chest"],
    aiHints: {
      prefersTaggedTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Pressure Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-exposed",
        damageMultiplierBonus: 0.24,
        critChanceBonus: 12,
      },
    ],
  },
];

const guardSkills: CombatSkill[] = [
  {
    id: "shield-bash",
    name: "Shield Bash",
    description: "A safe guard-line strike that destabilizes the target.",
    sourceItemCode: "starter-sigil-guard",
    resourceType: "guard",
    cost: 16,
    damageMultiplier: 1.02,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 12, chop: 0 },
    cooldownTurns: 2,
    roles: ["setup", "counter", "control"],
    preferredZones: ["chest", "waist"],
    aiHints: {
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Guard Sigil",
    },
    effects: [
      createStaggeredEffect(),
      {
        id: "shield-bash-bruised-guard",
        name: "Bruised Guard",
        description: "The target loses a little guard on the next turn.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 1,
        periodic: {
          resourceDelta: {
            guard: -5,
          },
        },
      },
    ],
  },
  {
    id: "iron-brace",
    name: "Iron Brace",
    description: "A defensive brace that also punishes already staggered targets.",
    sourceItemCode: "starter-sigil-guard",
    resourceType: "guard",
    cost: 20,
    damageMultiplier: 0.94,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 8, chop: 0 },
    cooldownTurns: 3,
    roles: ["counter", "sustain"],
    preferredZones: ["chest", "belly"],
    aiHints: {
      useWhenLowHp: true,
      prefersTaggedTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Guard Sigil",
    },
    effects: [
      {
        id: "iron-brace-guard-line",
        name: "Guard Line",
        description: "Stabilizes the defender for the next exchange.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 2,
        modifiers: {
          blockChanceBonus: 10,
          blockPowerBonus: 8,
          incomingDamagePercent: -6,
        },
      },
    ],
    stateBonuses: [
      {
        requiredEffectId: "state-staggered",
        damageMultiplierBonus: 0.18,
      },
    ],
  },
];

const burstSkills: CombatSkill[] = [
  {
    id: "execution-mark",
    name: "Execution Mark",
    description: "Rage-fueled setup cut that paints the target for a finisher and primes the next burst turn.",
    sourceItemCode: "starter-sigil-burst",
    resourceType: "rage",
    cost: 14,
    damageMultiplier: 1.01,
    critChanceBonus: 10,
    armorPenetrationPercentBonus: { slash: 0, pierce: 12, blunt: 0, chop: 0 },
    cooldownTurns: 2,
    roles: ["setup", "tempo"],
    preferredZones: ["head", "chest"],
    aiHints: {
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Burst Sigil",
    },
    effects: [
      createExposedEffect(),
      {
        id: "execution-mark-killing-window",
        name: "Killing Window",
        description: "The finisher line is primed for the next exchange.",
        kind: "buff",
        target: "self",
        trigger: "on_use",
        durationTurns: 1,
        periodic: {
          resourceDelta: {
            rage: 16,
          },
        },
      },
    ],
  },
  {
    id: "heartseeker",
    name: "Heartseeker",
    description: "Precision finisher that hits much harder into Exposed targets.",
    sourceItemCode: "starter-sigil-burst",
    resourceType: "rage",
    cost: 16,
    damageMultiplier: 1.48,
    critChanceBonus: 18,
    armorPenetrationPercentBonus: { slash: 0, pierce: 24, blunt: 0, chop: 0 },
    cooldownTurns: 3,
    roles: ["payoff"],
    preferredZones: ["head", "chest"],
    aiHints: {
      prefersTaggedTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Burst Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-exposed",
        damageMultiplierBonus: 0.3,
        critChanceBonus: 14,
      },
    ],
  },
];

const controlSkills: CombatSkill[] = [
  {
    id: "armor-crush",
    name: "Armor Crush",
    description: "Blunt setup strike that weakens defense structure.",
    sourceItemCode: "starter-sigil-control",
    resourceType: "guard",
    cost: 15,
    damageMultiplier: 1.02,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 18, chop: 0 },
    cooldownTurns: 2,
    roles: ["setup", "control"],
    preferredZones: ["chest", "waist"],
    aiHints: {
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Control Sigil",
    },
    effects: [createStaggeredEffect()],
  },
  {
    id: "crushing-blow",
    name: "Crushing Blow",
    description: "Follow-up hammer line that cashes in on Staggered targets.",
    sourceItemCode: "starter-sigil-control",
    resourceType: "guard",
    cost: 19,
    damageMultiplier: 1.4,
    critChanceBonus: 4,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 22, chop: 0 },
    cooldownTurns: 3,
    roles: ["payoff", "control"],
    preferredZones: ["chest", "waist"],
    aiHints: {
      prefersTaggedTargets: true,
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Control Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-staggered",
        damageMultiplierBonus: 0.22,
        armorPenetrationPercentBonus: {
          slash: 0,
          pierce: 0,
          blunt: 18,
          chop: 0,
        },
      },
    ],
  },
];

const tempoSkills: CombatSkill[] = [
  {
    id: "open-flank",
    name: "Open Flank",
    description: "Low-line axe setup that creates an Exposed side lane.",
    sourceItemCode: "starter-sigil-tempo",
    resourceType: "momentum",
    cost: 15,
    damageMultiplier: 1.06,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 14 },
    cooldownTurns: 2,
    roles: ["setup", "tempo"],
    preferredZones: ["waist", "legs"],
    unlock: {
      kind: "item",
      sourceName: "Tempo Sigil",
    },
    effects: [createExposedEffect()],
  },
  {
    id: "hook-chop",
    name: "Hook Chop",
    description: "Tempo payoff chop that bites harder into Exposed targets.",
    sourceItemCode: "starter-sigil-tempo",
    resourceType: "rage",
    cost: 22,
    damageMultiplier: 1.44,
    critChanceBonus: 8,
    armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 18 },
    cooldownTurns: 3,
    roles: ["payoff", "tempo"],
    preferredZones: ["waist", "legs"],
    aiHints: {
      prefersTaggedTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Tempo Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-exposed",
        damageMultiplierBonus: 0.2,
        critChanceBonus: 10,
      },
    ],
  },
];

const heavySkills: CombatSkill[] = [
  {
    id: "body-check",
    name: "Body Check",
    description: "Heavy shove that turns Staggered into a real punish window.",
    sourceItemCode: "starter-sigil-heavy",
    resourceType: "rage",
    cost: 16,
    damageMultiplier: 1.08,
    critChanceBonus: 0,
    armorPenetrationPercentBonus: { slash: 6, pierce: 0, blunt: 10, chop: 0 },
    cooldownTurns: 2,
    roles: ["control", "counter"],
    preferredZones: ["chest", "belly"],
    aiHints: {
      prefersTaggedTargets: true,
      prefersArmoredTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Heavy Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-staggered",
        damageMultiplierBonus: 0.2,
      },
    ],
  },
  {
    id: "killer-focus",
    name: "Killer Focus",
    description: "Heavy commit that spikes once the target is already Exposed.",
    sourceItemCode: "starter-sigil-heavy",
    resourceType: "rage",
    cost: 24,
    damageMultiplier: 1.46,
    critChanceBonus: 12,
    armorPenetrationPercentBonus: { slash: 18, pierce: 0, blunt: 0, chop: 0 },
    cooldownTurns: 3,
    roles: ["payoff"],
    preferredZones: ["head", "chest"],
    aiHints: {
      prefersTaggedTargets: true,
    },
    unlock: {
      kind: "item",
      sourceName: "Heavy Sigil",
    },
    stateBonuses: [
      {
        requiredEffectId: "state-exposed",
        damageMultiplierBonus: 0.24,
        critChanceBonus: 12,
      },
    ],
  },
];

export const starterSkillItems = [
  createSkillCarrierItem({
    id: "starter-sigil-pressure",
    code: "starter-sigil-pressure",
    name: "Pressure Sigil",
    description: "Starter pressure accessory that teaches slash setup and payoff timing.",
    skills: pressureSkills,
  }),
  createSkillCarrierItem({
    id: "starter-sigil-guard",
    code: "starter-sigil-guard",
    name: "Guard Sigil",
    description: "Starter guard accessory that adds shield control and brace timing.",
    skills: guardSkills,
  }),
  createSkillCarrierItem({
    id: "starter-sigil-burst",
    code: "starter-sigil-burst",
    name: "Burst Sigil",
    description: "Starter burst accessory that creates finisher windows.",
    skills: burstSkills,
  }),
  createSkillCarrierItem({
    id: "starter-sigil-control",
    code: "starter-sigil-control",
    name: "Control Sigil",
    description: "Starter control accessory that converts blunt hits into payoff windows.",
    skills: controlSkills,
  }),
  createSkillCarrierItem({
    id: "starter-sigil-tempo",
    code: "starter-sigil-tempo",
    name: "Tempo Sigil",
    description: "Starter tempo accessory for low-line pressure and follow-through.",
    skills: tempoSkills,
  }),
  createSkillCarrierItem({
    id: "starter-sigil-heavy",
    code: "starter-sigil-heavy",
    name: "Heavy Sigil",
    description: "Starter heavy accessory for committed punish windows.",
    skills: heavySkills,
  }),
  createSkillCarrierItem({
    id: "momentum-field-manual",
    code: "momentum-field-manual",
    name: "Field Manual: Momentum",
    description: "Starter momentum manual with sustain and scouting tools.",
    skills: importedMomentumSkills,
  }),
] as const;
