import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  applySandboxAllocations,
  buildSandboxPresetState,
  fitSandboxAllocationsToBudget,
  getSandboxAllocationBudget,
  type AllocationMap,
} from "@/orchestration/combat/combatSandboxSupport";
import {
  botDifficultyConfigs,
  combatBuildPresets,
  type BotDifficultyId,
} from "@/orchestration/combat/combatSandboxConfigs";
import { getEquipmentBonuses, type Equipment } from "@/modules/equipment";
import type { CombatState } from "@/modules/combat";
import type { Inventory } from "@/modules/inventory";
import type { Character } from "@/modules/character";

type SandboxDataInput = {
  inventory: Inventory;
  equipment: Equipment;
  equippedSkillIds: string[];
  playerAllocations: AllocationMap;
  botDifficulty: BotDifficultyId;
  botBuildPresetId: string;
  playerBaseCharacter: Character;
  botBaseCharacter: Character;
  combatState: CombatState | null;
};

export function buildCombatSandboxData(input: SandboxDataInput) {
  const equipmentBonuses = getEquipmentBonuses(input.equipment, input.inventory);
  const unlockedSkills = equipmentBonuses.skills;
  const availableSkills = unlockedSkills.filter((skill) => input.equippedSkillIds.includes(skill.id));
  const availableConsumables = input.inventory.entries.filter(
    (entry) => entry.item.consumableEffect && entry.quantity > 0
  );

  const playerCharacter = applySandboxAllocations(input.playerBaseCharacter, input.playerAllocations);
  const playerAllocationBudget = getSandboxAllocationBudget(input.playerAllocations);

  const selectedBotDifficulty =
    botDifficultyConfigs.find((entry) => entry.id === input.botDifficulty) ?? botDifficultyConfigs[1];
  const selectedBotPreset =
    combatBuildPresets.find((entry) => entry.id === input.botBuildPresetId) ?? combatBuildPresets[1];
  const botAllocations = fitSandboxAllocationsToBudget(selectedBotPreset.allocations, playerAllocationBudget);
  const botCharacter = applySandboxAllocations(input.botBaseCharacter, botAllocations);
  const botEquipment = buildSandboxPresetState({
    inventory: input.inventory,
    preset: {
      loadout: selectedBotPreset.loadout,
      allocations: selectedBotPreset.allocations,
      skillLoadout: selectedBotPreset.skillLoadout,
    },
  }).equipment;
  const botEquipmentBonuses = getEquipmentBonuses(botEquipment, input.inventory);

  const playerSnapshot = buildCombatSnapshot({
    character: playerCharacter,
    flatBonuses: equipmentBonuses.flatBonuses,
    percentBonuses: equipmentBonuses.percentBonuses,
    baseDamage: equipmentBonuses.baseDamage,
    baseArmor: equipmentBonuses.baseArmor,
    baseZoneArmor: equipmentBonuses.baseZoneArmor,
    armorBySlot: equipmentBonuses.armorBySlot,
    zoneArmorBySlot: equipmentBonuses.zoneArmorBySlot,
    combatBonuses: equipmentBonuses.combatBonuses,
    preferredDamageType: equipmentBonuses.preferredDamageType,
    weaponClass: equipmentBonuses.mainHandWeaponClass,
  });
  const botSnapshot = buildCombatSnapshot({
    character: botCharacter,
    flatBonuses: botEquipmentBonuses.flatBonuses,
    percentBonuses: botEquipmentBonuses.percentBonuses,
    baseDamage: botEquipmentBonuses.baseDamage,
    baseArmor: botEquipmentBonuses.baseArmor,
    baseZoneArmor: botEquipmentBonuses.baseZoneArmor,
    armorBySlot: botEquipmentBonuses.armorBySlot,
    zoneArmorBySlot: botEquipmentBonuses.zoneArmorBySlot,
    combatBonuses: botEquipmentBonuses.combatBonuses,
    preferredDamageType: botEquipmentBonuses.preferredDamageType,
    weaponClass: botEquipmentBonuses.mainHandWeaponClass,
  });
  const botAvailableSkills = botEquipmentBonuses.skills.filter((skill) =>
    selectedBotPreset.skillLoadout.includes(skill.id)
  );
  const currentPlayerCombatant =
    input.combatState?.combatants.find((combatant) => combatant.id === playerSnapshot.characterId) ?? null;

  return {
    equipmentBonuses,
    unlockedSkills,
    availableSkills,
    availableConsumables,
    playerCharacter,
    playerAllocationBudget,
    selectedBotDifficulty,
    selectedBotPreset,
    botAllocations,
    botCharacter,
    botEquipment,
    botEquipmentBonuses,
    playerSnapshot,
    botSnapshot,
    botAvailableSkills,
    currentPlayerCombatant,
  };
}
