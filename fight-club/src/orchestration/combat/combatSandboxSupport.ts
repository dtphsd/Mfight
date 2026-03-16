import { allocateStatPoint, createCharacter, type Character, type CharacterStatName } from "@/modules/character";
import { createEquipment, getEquipmentBonuses, getEquipmentSlotForItem, type EquipmentSlot } from "@/modules/equipment";
import type { CombatResourceType, CombatResources } from "@/modules/combat/model/CombatResources";
import type { Inventory, Item } from "@/modules/inventory";
import { createStarterInventory } from "@/modules/inventory";
import { createEquipmentFromLoadout } from "@/orchestration/combat/combatLoadouts";
import {
  clearRoundDraftSelections,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  setRoundDraftConsumable,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";

export type AllocationMap = Record<CharacterStatName, number>;

const statNames: CharacterStatName[] = ["strength", "agility", "rage", "endurance"];

export interface SandboxEquippedItem {
  slot: EquipmentSlot;
  item: Item | null;
}

export const maxSandboxEquippedSkills = 5;

export function requireSandboxCharacter(name: string): Character {
  const result = createCharacter(name);

  if (!result.success) {
    throw new Error(result.reason);
  }

  return result.data;
}

export function applySandboxAllocations(baseCharacter: Character, allocations: AllocationMap): Character {
  let nextCharacter = baseCharacter;

  for (const statName of statNames) {
    const amount = allocations[statName];

    if (amount === 0) {
      continue;
    }

    const allocationResult = allocateStatPoint(nextCharacter, statName, amount);

    if (!allocationResult.success) {
      throw new Error(allocationResult.reason);
    }

    nextCharacter = allocationResult.data;
  }

  return nextCharacter;
}

export function getSandboxAllocationBudget(allocations: AllocationMap) {
  return statNames.reduce((total, statName) => total + allocations[statName], 0);
}

export function fitSandboxAllocationsToBudget(
  allocations: AllocationMap,
  budget: number
): AllocationMap {
  const remainingBudget = Math.max(0, Math.floor(budget));
  let pointsLeft = remainingBudget;
  const nextAllocations: AllocationMap = {
    strength: 0,
    agility: 0,
    rage: 0,
    endurance: 0,
  };

  for (const statName of statNames) {
    if (pointsLeft <= 0) {
      break;
    }

    const allocatedPoints = Math.min(allocations[statName], pointsLeft);
    nextAllocations[statName] = allocatedPoints;
    pointsLeft -= allocatedPoints;
  }

  return nextAllocations;
}

export function reconcileSandboxRoundDraftSelections(
  draft: RoundDraft,
  availableSkills: Array<{ id: string; resourceType?: CombatResourceType; cost?: number }>,
  availableConsumables: Array<{ item: { code: string; consumableEffect?: { usageMode: "replace_attack" | "with_attack" } | null } }>,
  currentResources?: CombatResources | null,
  currentSkillCooldowns?: Record<string, number> | null
): RoundDraft {
  const selectedSkillId = getRoundDraftSelectedSkillId(draft);
  const selectedConsumableCode = getRoundDraftSelectedConsumableCode(draft);

  if (selectedSkillId) {
    const selectedSkill = availableSkills.find((skill) => skill.id === selectedSkillId) ?? null;

    if (!selectedSkill) {
      return clearRoundDraftSelections(draft);
    }

    if (currentResources && selectedSkill.resourceType && typeof selectedSkill.cost === "number" && currentResources[selectedSkill.resourceType] < selectedSkill.cost) {
      return clearRoundDraftSelections(draft);
    }

    if (currentSkillCooldowns && (currentSkillCooldowns[selectedSkill.id] ?? 0) > 0) {
      return clearRoundDraftSelections(draft);
    }

    return draft;
  }

  if (selectedConsumableCode) {
    const selectedConsumable =
      availableConsumables.find((entry) => entry.item.code === selectedConsumableCode)?.item ?? null;

    return selectedConsumable?.consumableEffect
      ? setRoundDraftConsumable(draft, selectedConsumable.code, selectedConsumable.consumableEffect.usageMode)
      : clearRoundDraftSelections(draft);
  }

  return clearRoundDraftSelections(draft);
}

export function reconcileSandboxEquippedSkillIds(
  equippedSkillIds: string[],
  availableSkills: Array<{ id: string }>
) {
  const availableSkillIds = new Set(availableSkills.map((skill) => skill.id));

  return equippedSkillIds
    .filter((skillId) => availableSkillIds.has(skillId))
    .slice(0, maxSandboxEquippedSkills);
}

export function toggleSandboxEquippedSkillId(
  equippedSkillIds: string[],
  skillId: string,
  availableSkills: Array<{ id: string }>
) {
  const availableSkillIds = new Set(availableSkills.map((skill) => skill.id));

  if (!availableSkillIds.has(skillId)) {
    return equippedSkillIds;
  }

  if (equippedSkillIds.includes(skillId)) {
    return equippedSkillIds.filter((currentId) => currentId !== skillId);
  }

  if (equippedSkillIds.length >= maxSandboxEquippedSkills) {
    return equippedSkillIds;
  }

  return [...equippedSkillIds, skillId];
}

export function getSandboxEquippedItems(
  equipment: ReturnType<typeof createEquipment>,
  inventory: ReturnType<typeof createStarterInventory> | Inventory
): SandboxEquippedItem[] {
  return (Object.entries(equipment.slots) as Array<[EquipmentSlot, string | null]>).map(([slot, itemCode]) => ({
    slot,
    item: inventory.entries.find((entry) => entry.item.code === itemCode)?.item ?? null,
  }));
}

export function getSandboxInventoryOptionsForSlot(
  inventory: ReturnType<typeof createStarterInventory> | Inventory,
  slot: EquipmentSlot
) {
  return inventory.entries.filter((entry) => getEquipmentSlotForItem(entry.item) === slot);
}

export function buildSandboxPresetState(input: {
  inventory: ReturnType<typeof createStarterInventory> | Inventory;
  preset: {
    loadout: string[];
    allocations: AllocationMap;
    skillLoadout?: string[];
  };
}) {
  const equipment = createEquipmentFromLoadout(input.inventory, input.preset.loadout);
  const equipmentBonuses = getEquipmentBonuses(equipment, input.inventory);
  const unlockedSkillIds = new Set(equipmentBonuses.skills.map((skill) => skill.id));
  const equippedSkillIds = (input.preset.skillLoadout ?? [])
    .filter((skillId) => unlockedSkillIds.has(skillId))
    .slice(0, maxSandboxEquippedSkills);

  return {
    equipment,
    playerAllocations: input.preset.allocations,
    equippedSkillIds,
  };
}
