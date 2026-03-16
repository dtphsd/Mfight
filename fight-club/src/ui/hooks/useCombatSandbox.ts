import { useEffect, useRef, useState } from "react";
import { SeededRandom } from "@/core/rng/SeededRandom";
import {
  createEquipment,
  equipItem,
  getEquipmentBonuses,
  type EquipmentSlot,
  unequipItem,
} from "@/modules/equipment";
import { type CharacterStatName } from "@/modules/character";
import { combatZones, type CombatState, type CombatZone, type RoundAction, type RoundResult } from "@/modules/combat";
import type { CombatPhase } from "@/modules/combat/model/CombatPhase";
import { createStarterInventory } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  prepareSandboxNextRound,
  resolveSandboxRound,
  startSandboxFight,
} from "@/orchestration/combat/combatSandboxController";
import { buildCombatSandboxDerivedState } from "@/orchestration/combat/combatSandboxMetrics";
import { type BotRoundPlan } from "@/orchestration/combat/botRoundPlanner";
import {
  botDifficultyConfigs,
  combatBuildPresets,
  zeroAllocations,
  type BotDifficultyId,
} from "@/orchestration/combat/combatSandboxConfigs";
import {
  applySandboxAllocations,
  buildSandboxPresetState,
  fitSandboxAllocationsToBudget,
  getSandboxEquippedItems,
  getSandboxAllocationBudget,
  getSandboxInventoryOptionsForSlot,
  maxSandboxEquippedSkills,
  reconcileSandboxRoundDraftSelections,
  reconcileSandboxEquippedSkillIds,
  requireSandboxCharacter,
  toggleSandboxEquippedSkillId,
  type AllocationMap,
} from "@/orchestration/combat/combatSandboxSupport";
import {
  canPrepareNextRound,
  canResolveCombatRound,
  canStartCombat,
  createInitialCombatPhase,
  formatCombatPhaseLabel,
  resetCombatPhase,
} from "@/orchestration/combat/combatStateMachine";
import {
  createRoundDraft,
  setRoundDraftAttackZone,
  setRoundDraftConsumable,
  setRoundDraftSkill,
  toggleRoundDraftDefenseZone,
} from "@/orchestration/combat/roundDraft";

export function useCombatSandbox() {
  const randomRef = useRef(new SeededRandom(1337));
  const playerBaseRef = useRef(requireSandboxCharacter("Player"));
  const botBaseRef = useRef(requireSandboxCharacter("Arena Bot"));

  const [inventory, setInventory] = useState(() => createStarterInventory());
  const [playerAllocations, setPlayerAllocations] = useState<AllocationMap>(zeroAllocations);
  const [equipment, setEquipment] = useState(createEquipment());
  const [botDifficulty, setBotDifficulty] = useState<BotDifficultyId>("champion");
  const [botBuildPresetId, setBotBuildPresetId] = useState("shield-guard");
  const [roundDraft, setRoundDraft] = useState(createRoundDraft);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [combatPhase, setCombatPhase] = useState<CombatPhase>(createInitialCombatPhase);
  const [botLastAction, setBotLastAction] = useState<RoundAction | null>(null);
  const [botLastPlan, setBotLastPlan] = useState<BotRoundPlan | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [equippedSkillIds, setEquippedSkillIds] = useState<string[]>([]);

  const equipmentBonuses = getEquipmentBonuses(equipment, inventory);
  const unlockedSkills = equipmentBonuses.skills;
  const availableSkills = unlockedSkills.filter((skill) => equippedSkillIds.includes(skill.id));
  const availableConsumables = inventory.entries.filter((entry) => entry.item.consumableEffect && entry.quantity > 0);
  const selectedAction = roundDraft.selectedAction;
  const playerCharacter = applySandboxAllocations(playerBaseRef.current, playerAllocations);
  const playerAllocationBudget = getSandboxAllocationBudget(playerAllocations);
  const selectedBotDifficulty = botDifficultyConfigs.find((entry) => entry.id === botDifficulty) ?? botDifficultyConfigs[1];
  const selectedBotPreset = combatBuildPresets.find((entry) => entry.id === botBuildPresetId) ?? combatBuildPresets[1];
  const botAllocations = fitSandboxAllocationsToBudget(selectedBotPreset.allocations, playerAllocationBudget);
  const botCharacter = applySandboxAllocations(botBaseRef.current, botAllocations);
  const botEquipment = buildSandboxPresetState({
    inventory,
    preset: {
      loadout: selectedBotPreset.loadout,
      allocations: selectedBotPreset.allocations,
      skillLoadout: selectedBotPreset.skillLoadout,
    },
  }).equipment;
  const botEquipmentBonuses = getEquipmentBonuses(botEquipment, inventory);

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
    combatState?.combatants.find((combatant) => combatant.id === playerSnapshot.characterId) ?? null;

  useEffect(() => {
    setCombatState(null);
    setCombatPhase(resetCombatPhase());
    setRoundDraft(createRoundDraft());
    setBotLastAction(null);
    setBotLastPlan(null);
    setRoundError(null);
  }, [equipment, playerAllocations, botDifficulty, botBuildPresetId]);

  useEffect(() => {
    setEquippedSkillIds((current) => {
      const next = reconcileSandboxEquippedSkillIds(current, unlockedSkills);
      return areSkillIdListsEqual(current, next) ? current : next;
    });
  }, [equipment, inventory]);

  useEffect(() => {
    setRoundDraft((current) =>
      reconcileSandboxRoundDraftSelections(
        current,
        availableSkills,
        availableConsumables,
        currentPlayerCombatant?.resources,
        currentPlayerCombatant?.skillCooldowns
      )
    );
  }, [equipment, inventory, equippedSkillIds, currentPlayerCombatant]);

  function increaseStat(statName: CharacterStatName) {
    if (playerCharacter.unspentStatPoints <= 0) {
      return;
    }

    setPlayerAllocations((current) => ({
      ...current,
      [statName]: current[statName] + 1,
    }));
  }

  function decreaseStat(statName: CharacterStatName) {
    if (playerAllocations[statName] <= 0) {
      return;
    }

    setPlayerAllocations((current) => ({
      ...current,
      [statName]: current[statName] - 1,
    }));
  }

  function resetBuild() {
    setPlayerAllocations(zeroAllocations);
    setEquipment(createEquipment());
  }

  function toggleDefenseZone(zone: CombatZone) {
    setRoundDraft((current) => toggleRoundDraftDefenseZone(current, zone));
  }

  function equipItemByCode(itemCode: string) {
    const result = equipItem(equipment, inventory, itemCode);
    if (!result.success) {
      setRoundError(result.reason);
      return;
    }

    setRoundError(null);
    setEquipment(result.data);
  }

  function unequipSlot(slot: EquipmentSlot) {
    setEquipment((current) => unequipItem(current, slot));
    setRoundError(null);
  }

  function startFight() {
    const result = startSandboxFight({
      playerSnapshot,
      botSnapshot,
    });

    setCombatState(result.combatState);
    setCombatPhase(result.combatPhase);
    setBotLastAction(result.botLastAction);
    setBotLastPlan(result.botLastPlan);
    setRoundError(result.roundError);
  }

  function prepareNextRound() {
    const result = prepareSandboxNextRound({ combatPhase });

    if (!result) {
      return;
    }

    setCombatPhase(result.combatPhase);
    setRoundDraft((current) =>
      reconcileSandboxRoundDraftSelections(
        current,
        availableSkills,
        availableConsumables,
        playerCombatant?.resources,
        playerCombatant?.skillCooldowns
      )
    );
    setRoundError(result.roundError);
  }

  function resolveNextRound() {
    const result = resolveSandboxRound({
      combatPhase,
      combatState,
      roundDraft,
      inventory,
      playerSnapshot,
      botSnapshot,
      availableSkills,
      availableConsumables,
      botAvailableSkills,
      selectedBotDifficulty,
      selectedBotBuild: selectedBotPreset,
      random: randomRef.current,
    });

    setBotLastPlan(result.botLastPlan);
    setBotLastAction(result.botLastAction);
    setCombatPhase(result.combatPhase);
    setRoundError(result.roundError);

    if (!result.success) {
      return;
    }

    setInventory(result.inventory);
    setRoundDraft(result.roundDraft);
    setCombatState(result.combatState);
  }

  const equippedItems = getSandboxEquippedItems(equipment, inventory);
  const botEquippedItems = getSandboxEquippedItems(botEquipment, inventory);
  const {
    playerCombatant,
    botCombatant,
    latestPlayerLogEntry,
    latestBotLogEntry,
    latestRoundEntries,
    battleLogEntries,
    playerActsFirst,
    playerResources,
    botResources,
    metrics,
  } = buildCombatSandboxDerivedState({
    combatState,
    playerSnapshot,
    botSnapshot,
    equippedItems,
  });

  return {
    zones: combatZones,
    buildPresets: combatBuildPresets,
    playerAllocations,
    playerCharacter,
    playerSnapshot,
    playerCombatant,
    playerResources,
    botSnapshot,
    botCombatant,
    botResources,
    botDifficulty,
    botBuildPresetId,
    botBuildPreset: selectedBotPreset,
    botDifficultyOptions: botDifficultyConfigs,
    botBuildPresets: combatBuildPresets,
    combatState,
    combatPhase,
    combatPhaseLabel: formatCombatPhaseLabel(combatPhase),
    canStartFight: canStartCombat(combatPhase),
    canResolveRound: canResolveCombatRound(combatPhase),
    canPrepareNextRound: canPrepareNextRound(combatPhase),
    botLastPlan,
    botLastAction,
    roundError,
    latestPlayerLogEntry,
    latestBotLogEntry,
    latestRoundEntries,
    battleLogEntries,
    playerActsFirst,
    playerIncomingResult: latestBotLogEntry,
    playerOutgoingResult: latestPlayerLogEntry,
    botIncomingResult: latestPlayerLogEntry,
    botOutgoingResult: latestBotLogEntry,
    selectedAttackZone: roundDraft.attackZone,
    selectedDefenseZones: roundDraft.defenseZones,
    metrics,
    inventory,
    equipment,
    unlockedSkills,
    equippedSkills: availableSkills,
    equippedSkillIds,
    maxEquippedSkills: maxSandboxEquippedSkills,
    availableSkills,
    availableConsumables,
    selectedAction,
    equippedItems,
    botEquippedItems,
    inventorySlots: {
      used: inventory.entries.length,
      max: inventory.maxSlots,
    },
    setSelectedAttackZone: (zone: CombatZone) => setRoundDraft((current) => setRoundDraftAttackZone(current, zone)),
    selectBasicAction: () => {
      setRoundDraft((current) => setRoundDraftSkill(current, null));
    },
    setSelectedSkillAction: (skillId: string | null) => {
      setRoundDraft((current) => setRoundDraftSkill(current, skillId));
    },
    toggleEquippedSkill: (skillId: string) => {
      setEquippedSkillIds((current) => toggleSandboxEquippedSkillId(current, skillId, unlockedSkills));
    },
    setSelectedConsumableAction: (itemCode: string | null) => {
      const usageMode =
        availableConsumables.find((entry) => entry.item.code === itemCode)?.item.consumableEffect?.usageMode ?? null;
      setRoundDraft((current) => setRoundDraftConsumable(current, itemCode, usageMode));
    },
    toggleDefenseZone,
    increaseStat,
    decreaseStat,
    resetBuild,
    equipItemByCode,
    unequipSlot,
    getInventoryOptionsForSlot: (slot: EquipmentSlot) => getSandboxInventoryOptionsForSlot(inventory, slot),
    applyPreset: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const nextState = buildSandboxPresetState({
        inventory,
        preset,
      });

      setEquipment(nextState.equipment);
      setPlayerAllocations(nextState.playerAllocations);
      setEquippedSkillIds(nextState.equippedSkillIds);
    },
    applyPresetItemsOnly: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const nextState = buildSandboxPresetState({
        inventory,
        preset,
      });

      setEquipment(nextState.equipment);
    },
    applyPresetSkillsOnly: (presetId: string) => {
      const preset = combatBuildPresets.find((entry) => entry.id === presetId);

      if (!preset) {
        return;
      }

      const availableSkillIds = new Set(unlockedSkills.map((skill) => skill.id));
      setEquippedSkillIds(
        preset.skillLoadout.filter((skillId) => availableSkillIds.has(skillId)).slice(0, maxSandboxEquippedSkills)
      );
    },
    setBotDifficulty,
    setBotBuildPreset: (presetId: string) => {
      if (!combatBuildPresets.some((entry) => entry.id === presetId)) {
        return;
      }

      setBotBuildPresetId(presetId);
    },
    startFight,
    prepareNextRound,
    resolveNextRound,
  };
}

export type CombatUiResult = RoundResult | null;

function areSkillIdListsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((skillId, index) => skillId === right[index]);
}
