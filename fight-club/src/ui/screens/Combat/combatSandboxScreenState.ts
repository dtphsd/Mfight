import { combatZoneDamageModifiers } from "@/modules/combat";
import type { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { formatConsumableDetailLines, formatMaybeTitle, formatSkillDetailLines } from "./combatSandboxScreenHelpers";

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function resolveSelectedActionLabel(sandbox: CombatSandboxModel) {
  const selectedAction = sandbox.selectedAction;

  switch (selectedAction.kind) {
    case "skill_attack":
      return sandbox.equippedSkills.find((skill) => skill.id === selectedAction.skillId)?.name ?? "Skill";
    case "consumable":
      return sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item.name ?? "Consumable";
    case "basic_attack":
    default:
      return "Basic Attack";
  }
}

export function resolveSelectedActionSummary(sandbox: CombatSandboxModel) {
  const selectedAction = sandbox.selectedAction;
  const zone = sandbox.selectedAttackZone;
  const zoneMultiplier = combatZoneDamageModifiers[zone];

  switch (selectedAction.kind) {
    case "skill_attack":
      return formatSkillDetailLines(sandbox.equippedSkills.find((skill) => skill.id === selectedAction.skillId) ?? null);
    case "consumable":
      return formatConsumableDetailLines(sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null);
    case "basic_attack":
    default:
      return [
        `Zone: ${formatMaybeTitle(zone)} x${zoneMultiplier.toFixed(2)}.`,
        `Damage x${zoneMultiplier.toFixed(2)}`,
        `Hit: Deals x${zoneMultiplier.toFixed(2)} basic damage.`,
        "Cost: 0.",
      ];
  }
}

export function resolveSelectedActionTags(sandbox: CombatSandboxModel) {
  const tags: string[] = [];
  const selectedAction = sandbox.selectedAction;

  switch (selectedAction.kind) {
    case "skill_attack": {
      const skill = sandbox.equippedSkills.find((entry) => entry.id === selectedAction.skillId) ?? null;
      tags.push("Skill");
      if (skill) {
        tags.push(`Damage x${skill.damageMultiplier.toFixed(2)}`);
        if (skill.critChanceBonus > 0) {
          tags.push(`Crit +${skill.critChanceBonus}%`);
        }
        if (skill.effects?.length) {
          tags.push(...skill.effects.slice(0, 2).map((effect) => `${effect.name} ${effect.durationTurns}T`));
        }
      }
      break;
    }
    case "consumable": {
      const consumable =
        sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null;
      tags.push(selectedAction.usageMode === "with_attack" ? "With Attack" : "Separate Action");
      if (consumable?.consumableEffect?.heal) {
        tags.push(`Heal ${consumable.consumableEffect.heal} HP`);
      }
      if (consumable?.consumableEffect?.effects?.length) {
        tags.push(...consumable.consumableEffect.effects.slice(0, 2).map((effect) => `Apply ${effect.name}`));
      }
      break;
    }
    case "basic_attack":
    default:
      tags.push("Basic");
      tags.push(`Target ${formatMaybeTitle(sandbox.selectedAttackZone)}`);
      tags.push(`Zone x${combatZoneDamageModifiers[sandbox.selectedAttackZone].toFixed(2)}`);
      tags.push(`x${combatZoneDamageModifiers[sandbox.selectedAttackZone].toFixed(2)} Final`);
      tags.push("Cost 0");
      break;
  }

  return tags;
}
