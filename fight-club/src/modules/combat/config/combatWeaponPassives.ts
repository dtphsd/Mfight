import type { CombatEffectDefinition } from "@/modules/combat/model/CombatEffect";
import type { RoundResult } from "@/modules/combat/model/RoundResult";
import type { WeaponClass } from "@/modules/inventory";

export interface WeaponClassPassivePreview {
  name: string;
  trigger: string;
  duration: string;
  stacks: string;
  effect: string;
}

export function getWeaponClassPassivePreview(weaponClass: WeaponClass | null): WeaponClassPassivePreview | null {
  switch (weaponClass) {
    case "sword":
      return {
        name: "Open Wound",
        trigger: "On hit",
        duration: "2 rounds",
        stacks: "Up to 3",
        effect: "Deals 4 bleed damage per stack at turn start.",
      };
    case "dagger":
      return {
        name: "Vital Mark",
        trigger: "On crit",
        duration: "2 rounds",
        stacks: "Up to 3",
        effect: "Target takes +8% incoming damage and -6% dodge per stack.",
      };
    case "mace":
    case "greatmace":
      return {
        name: "Concussed Guard",
        trigger: "On hit",
        duration: "1 round",
        stacks: "Up to 2",
        effect: "Target loses -6% block power and -2 blunt armor per stack.",
      };
    case "axe":
    case "greataxe":
      return {
        name: "Rending Hook",
        trigger: "On hit",
        duration: "2 rounds",
        stacks: "Up to 3",
        effect: "Target takes +6% incoming damage per stack.",
      };
    case "greatsword":
      return {
        name: "Execution Pressure",
        trigger: "On hit",
        duration: "1 round",
        stacks: "Up to 2",
        effect: "Gain +10% outgoing damage per stack.",
      };
    default:
      return null;
  }
}

export function getWeaponClassPassiveEffect(
  weaponClass: WeaponClass | null,
  result: Pick<RoundResult, "crit" | "dodged" | "finalDamage">
): CombatEffectDefinition | null {
  if (!weaponClass || result.dodged || result.finalDamage <= 0) {
    return null;
  }

  switch (weaponClass) {
    case "sword":
      return {
        id: "weapon-passive-sword-open-wound",
        name: "Open Wound",
        description: "Applies stacking bleed on hit.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 2,
        maxStacks: 3,
        periodic: {
          damage: 4,
        },
      };
    case "dagger":
      return result.crit
        ? {
            id: "weapon-passive-dagger-vital-mark",
            name: "Vital Mark",
            description: "Critical hits apply a stacking finisher debuff.",
            kind: "debuff",
            target: "target",
            trigger: "on_hit",
            durationTurns: 2,
            maxStacks: 3,
            modifiers: {
              incomingDamagePercent: 8,
              dodgeChanceBonus: -6,
            },
          }
        : null;
    case "mace":
    case "greatmace":
      return {
        id: "weapon-passive-mace-concussed-guard",
        name: "Concussed Guard",
        description: "Hits reduce block power and blunt armor.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 1,
        maxStacks: 2,
        modifiers: {
          blockPowerBonus: -6,
          armorFlatBonus: {
            slash: 0,
            pierce: 0,
            blunt: -2,
            chop: 0,
          },
        },
      };
    case "axe":
    case "greataxe":
      return {
        id: "weapon-passive-axe-rending-hook",
        name: "Rending Hook",
        description: "Hits apply a stacking damage-taken debuff.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 2,
        maxStacks: 3,
        modifiers: {
          incomingDamagePercent: 6,
        },
      };
    case "greatsword":
      return {
        id: "weapon-passive-greatsword-execution-pressure",
        name: "Execution Pressure",
        description: "Hits grant a stacking outgoing-damage buff.",
        kind: "buff",
        target: "self",
        trigger: "on_hit",
        durationTurns: 1,
        maxStacks: 2,
        modifiers: {
          outgoingDamagePercent: 10,
        },
      };
    default:
      return null;
  }
}
