import type {
  OnlineDuelActionSelection,
  OnlineDuelFailureReason,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuelParticipant } from "@/modules/arena/model/OnlineDuel";
import type { CombatState, RoundAction } from "@/modules/combat";
import {
  createBasicAttackAction,
  createConsumableAction,
  createConsumableAttackAction,
  createSkillAttackAction,
} from "@/modules/combat/model/RoundAction";
import { getEquipmentBonuses } from "@/modules/equipment";

export type OnlineDuelRoundActionBuildResult =
  | { success: true; data: RoundAction }
  | { success: false; reason: OnlineDuelFailureReason };

export function buildOnlineDuelRoundAction(
  participant: OnlineDuelParticipant,
  combatState: CombatState,
  selection: OnlineDuelActionSelection
): OnlineDuelRoundActionBuildResult {
  const selectedAction = selection.selectedAction;
  const combatant = combatState.combatants.find((entry) => entry.id === participant.snapshot.characterId) ?? null;
  if (!combatant) {
    return {
      success: false,
      reason: "combatant_not_found",
    };
  }

  if (combatant.currentHp <= 0) {
    return {
      success: false,
      reason: "dead_combatant_action",
    };
  }

  if (selection.defenseZones[0] === selection.defenseZones[1]) {
    return {
      success: false,
      reason: "duplicate_defense_zones",
    };
  }

  if (selectedAction.kind === "basic_attack") {
    return {
      success: true,
      data: createBasicAttackAction({
        attackerId: participant.snapshot.characterId,
        attackZone: selection.attackZone,
        defenseZones: selection.defenseZones,
        intent: selection.intent,
      }),
    };
  }

  const equipmentBonuses = getEquipmentBonuses(
    participant.loadout.equipmentState,
    participant.loadout.inventory
  );
  const availableSkills = equipmentBonuses.skills.filter((skill) =>
    participant.loadout.equippedSkillIds.includes(skill.id)
  );

  if (selectedAction.kind === "skill_attack") {
    const skill = availableSkills.find((entry) => entry.id === selectedAction.skillId) ?? null;
    if (!skill) {
      return {
        success: false,
        reason: "invalid_action",
      };
    }

    const currentResource = combatant.resources[skill.resourceType];
    if (currentResource < skill.cost) {
      return {
        success: false,
        reason: "insufficient_resources",
      };
    }

    const cooldownTurns = combatant.skillCooldowns?.[skill.id] ?? 0;
    if (cooldownTurns > 0) {
      return {
        success: false,
        reason: "skill_on_cooldown",
      };
    }

    return {
      success: true,
      data: createSkillAttackAction({
        attackerId: participant.snapshot.characterId,
        attackZone: selection.attackZone,
        defenseZones: selection.defenseZones,
        intent: selection.intent,
        skill,
      }),
    };
  }

  const consumableEntry =
    participant.loadout.inventory.entries.find(
      (entry) =>
        entry.item.code === selectedAction.consumableCode &&
        entry.item.consumableEffect &&
        entry.quantity > 0
    ) ?? null;
  if (!consumableEntry || !consumableEntry.item.consumableEffect) {
    return {
      success: false,
      reason: "invalid_action",
    };
  }

  if (consumableEntry.item.consumableEffect.usageMode !== selectedAction.usageMode) {
    return {
      success: false,
      reason: "invalid_action",
    };
  }

  const consumable = {
    itemCode: consumableEntry.item.code,
    itemName: consumableEntry.item.name,
    effect: consumableEntry.item.consumableEffect,
  };

  return {
    success: true,
    data:
      selectedAction.usageMode === "replace_attack"
        ? createConsumableAction({
            attackerId: participant.snapshot.characterId,
            attackZone: selection.attackZone,
            defenseZones: selection.defenseZones,
            intent: selection.intent,
            consumable,
          })
        : createConsumableAttackAction({
            attackerId: participant.snapshot.characterId,
            attackZone: selection.attackZone,
            defenseZones: selection.defenseZones,
            intent: selection.intent,
            consumable,
          }),
  };
}
