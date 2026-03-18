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
        effect: "Deals 3 bleed damage per stack at turn start.",
      };
    case "dagger":
      return {
        name: "Vital Mark",
        trigger: "On crit",
        duration: "2 rounds",
        stacks: "Up to 3",
        effect: "Target takes +10% incoming damage and -8% dodge per stack.",
      };
    case "mace":
    case "greatmace":
      return {
        name: "Concussed Guard",
        trigger: "On hit",
        duration: "2 rounds",
        stacks: "Up to 2",
        effect: "Target loses guard quality and takes extra blunt pressure per stack.",
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
          damage: 3,
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
              incomingDamagePercent: 10,
              dodgeChanceBonus: -8,
            },
          }
        : null;
    case "mace":
    case "greatmace":
      return {
        id: "weapon-passive-mace-concussed-guard",
        name: "Concussed Guard",
        description: "Hits soften guard and make follow-up blunt pressure stick.",
        kind: "debuff",
        target: "target",
        trigger: "on_hit",
        durationTurns: 2,
        maxStacks: 2,
        modifiers: {
          blockPowerBonus: -8,
          incomingDamagePercent: 4,
          armorFlatBonus: {
            slash: 0,
            pierce: 0,
            blunt: -4,
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
