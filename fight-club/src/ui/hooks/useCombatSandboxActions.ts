import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";
import {
  buildSandboxPresetState,
  toggleSandboxEquippedSkillId,
  maxSandboxEquippedSkills,
  type AllocationMap,
} from "@/orchestration/combat/combatSandboxSupport";
import {
  setRoundDraftAttackZone,
  setRoundDraftConsumable,
  setRoundDraftIntent,
  setRoundDraftSkill,
} from "@/orchestration/combat/roundDraft";
import type { CombatIntent, CombatZone } from "@/modules/combat";
import type { EquipmentSlot, Equipment } from "@/modules/equipment";
import type { Inventory } from "@/modules/inventory";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";

type Setter<TValue> = (value: TValue | ((current: TValue) => TValue)) => void;

type CreateCombatSandboxActionsInput = {
  inventory: Inventory;
  unlockedSkills: Array<{ id: string }>;
  availableConsumables: Inventory["entries"];
  getInventoryOptionsForSlot: (slot: EquipmentSlot) => Inventory["entries"];
  setRoundDraft: Setter<RoundDraft>;
  setEquippedSkillIds: Setter<string[]>;
  setEquipment: Setter<Equipment>;
  setPlayerAllocations: Setter<AllocationMap>;
  setBotBuildPresetId: Setter<string>;
};

export function createCombatSandboxActions(input: CreateCombatSandboxActionsInput) {
  return {
    setSelectedAttackZone: (zone: CombatZone) => {
      input.setRoundDraft((current) => setRoundDraftAttackZone(current, zone));
    },
    setSelectedIntent: (intent: CombatIntent) => {
      input.setRoundDraft((current) => setRoundDraftIntent(current, intent));
    },
    selectBasicAction: () => {
      input.setRoundDraft((current) => setRoundDraftSkill(current, null));
    },
    setSelectedSkillAction: (skillId: string | null) => {
      input.setRoundDraft((current) => setRoundDraftSkill(current, skillId));
    },
    toggleEquippedSkill: (skillId: string) => {
      input.setEquippedSkillIds((current) =>
        toggleSandboxEquippedSkillId(current, skillId, input.unlockedSkills)
      );
    },
    setSelectedConsumableAction: (itemCode: string | null) => {
      const usageMode =
        input.availableConsumables.find((entry) => entry.item.code === itemCode)?.item.consumableEffect?.usageMode ??
        null;
      input.setRoundDraft((current) => setRoundDraftConsumable(current, itemCode, usageMode));
    },
    getInventoryOptionsForSlot: input.getInventoryOptionsForSlot,
    applyPreset: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const nextState = buildSandboxPresetState({
        inventory: input.inventory,
        preset,
      });

      input.setEquipment(nextState.equipment);
      input.setPlayerAllocations(nextState.playerAllocations);
      input.setEquippedSkillIds(nextState.equippedSkillIds);
    },
    applyPresetItemsOnly: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const nextState = buildSandboxPresetState({
        inventory: input.inventory,
        preset,
      });

      input.setEquipment(nextState.equipment);
    },
    applyPresetSkillsOnly: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const availableSkillIds = new Set(input.unlockedSkills.map((skill) => skill.id));
      input.setEquippedSkillIds(
        preset.skillLoadout.filter((skillId) => availableSkillIds.has(skillId)).slice(0, maxSandboxEquippedSkills)
      );
    },
    setBotBuildPreset: (presetId: string) => {
      if (!combatBuildPresets.some((entry) => entry.id === presetId)) {
        return;
      }

      input.setBotBuildPresetId(presetId);
    },
  };
}
