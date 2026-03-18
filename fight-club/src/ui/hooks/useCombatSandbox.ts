import { useEffect, useRef, useState } from "react";
import { SeededRandom } from "@/core/rng/SeededRandom";
import {
  createEquipment,
  equipItem,
  type EquipmentSlot,
  unequipItem,
} from "@/modules/equipment";
import { type CharacterStatName } from "@/modules/character";
import { combatZones, type CombatState, type CombatZone, type RoundAction, type RoundResult } from "@/modules/combat";
import type { CombatPhase } from "@/modules/combat/model/CombatPhase";
import { createStarterInventory } from "@/modules/inventory";
import { buildCombatSandboxDerivedState } from "@/orchestration/combat/combatSandboxMetrics";
import { type BotRoundPlan } from "@/orchestration/combat/botRoundPlanner";
import {
  botDifficultyConfigs,
  combatBuildPresets,
  zeroAllocations,
  type BotDifficultyId,
} from "@/orchestration/combat/combatSandboxConfigs";
import {
  getSandboxEquippedItems,
  getSandboxInventoryOptionsForSlot,
  maxSandboxEquippedSkills,
  reconcileSandboxRoundDraftSelections,
  reconcileSandboxEquippedSkillIds,
  requireSandboxCharacter,
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
  toggleRoundDraftDefenseZone,
} from "@/orchestration/combat/roundDraft";
import { createCombatSandboxActions } from "@/ui/hooks/useCombatSandboxActions";
import { buildCombatSandboxData } from "@/ui/hooks/useCombatSandboxData";
import { createCombatSandboxFlow } from "@/ui/hooks/useCombatSandboxFlow";

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

  const {
    unlockedSkills,
    availableSkills,
    availableConsumables,
    playerCharacter,
    selectedBotDifficulty,
    selectedBotPreset,
    botEquipment,
    playerSnapshot,
    botSnapshot,
    botAvailableSkills,
    currentPlayerCombatant,
  } = buildCombatSandboxData({
    inventory,
    equipment,
    equippedSkillIds,
    playerAllocations,
    botDifficulty,
    botBuildPresetId,
    playerBaseCharacter: playerBaseRef.current,
    botBaseCharacter: botBaseRef.current,
    combatState,
  });
  const selectedAction = roundDraft.selectedAction;

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
  const actions = createCombatSandboxActions({
    inventory,
    unlockedSkills,
    availableConsumables,
    getInventoryOptionsForSlot: (slot: EquipmentSlot) => getSandboxInventoryOptionsForSlot(inventory, slot),
    setRoundDraft,
    setEquippedSkillIds,
    setEquipment,
    setPlayerAllocations,
    setBotBuildPresetId,
  });
  const flow = createCombatSandboxFlow({
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
    selectedBotPreset,
    playerCombatant,
    random: randomRef.current,
    setCombatState,
    setCombatPhase,
    setRoundDraft,
    setInventory,
    setBotLastAction,
    setBotLastPlan,
    setRoundError,
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
    selectedIntent: roundDraft.intent,
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
    toggleDefenseZone,
    increaseStat,
    decreaseStat,
    resetBuild,
    equipItemByCode,
    unequipSlot,
    setBotDifficulty,
    ...actions,
    ...flow,
  };
}

export type CombatUiResult = RoundResult | null;

function areSkillIdListsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((skillId, index) => skillId === right[index]);
}
