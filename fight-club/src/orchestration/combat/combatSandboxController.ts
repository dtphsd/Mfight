import { removeItem, type Inventory, type Item } from "@/modules/inventory";
import { resolveRound, startCombat, type CombatSnapshot, type CombatState, type RoundAction } from "@/modules/combat";
import type { CombatPhase } from "@/modules/combat/model/CombatPhase";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type { Random } from "@/core/rng/Random";
import type { CombatConsumableAction } from "@/modules/combat/model/RoundAction";
import { buildBotRoundAction, planBotRound, type BotRoundPlan } from "@/orchestration/combat/botRoundPlanner";
import type { BotDifficultyConfig, CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";
import {
  canPrepareNextRound,
  canResolveCombatRound,
  phaseAfterCombatStart,
  phaseAfterResolutionFailure,
  phaseAfterRoundResolution,
  phaseForNextRound,
  phaseWhileResolving,
} from "@/orchestration/combat/combatStateMachine";
import {
  buildPlayerRoundAction,
  clearRoundDraftConsumable,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";

export interface SandboxRoundFlowInput {
  combatPhase: CombatPhase;
  combatState: CombatState | null;
  roundDraft: RoundDraft;
  inventory: Inventory;
  playerSnapshot: CombatSnapshot;
  botSnapshot: CombatSnapshot;
  availableSkills: CombatSkill[];
  availableConsumables: Array<{ item: Item; quantity: number }>;
  botAvailableSkills: CombatSkill[];
  selectedBotDifficulty: Pick<BotDifficultyConfig, "plannerProfile">;
  selectedBotBuild?: Pick<CombatBuildPreset, "id" | "archetype">;
  random: Random;
}

export type StartFightResult = {
  combatState: CombatState;
  combatPhase: CombatPhase;
  botLastAction: null;
  botLastPlan: null;
  roundError: null;
};

export type PrepareNextRoundResult = {
  combatPhase: CombatPhase;
  roundError: null;
} | null;

export type ResolveRoundResult =
  | {
      success: true;
      combatState: CombatState;
      combatPhase: CombatPhase;
      botLastPlan: BotRoundPlan;
      botLastAction: RoundAction;
      roundError: null;
      inventory: SandboxRoundFlowInput["inventory"];
      roundDraft: RoundDraft;
    }
  | {
      success: false;
      combatPhase: CombatPhase;
      botLastPlan: BotRoundPlan | null;
      botLastAction: RoundAction | null;
      roundError: string;
    };

export function startSandboxFight(input: {
  playerSnapshot: CombatSnapshot;
  botSnapshot: CombatSnapshot;
}): StartFightResult {
  const combatState = startCombat(input.playerSnapshot, input.botSnapshot);

  return {
    combatState,
    combatPhase: phaseAfterCombatStart(combatState),
    botLastAction: null,
    botLastPlan: null,
    roundError: null,
  };
}

export function prepareSandboxNextRound(input: { combatPhase: CombatPhase }): PrepareNextRoundResult {
  if (!canPrepareNextRound(input.combatPhase)) {
    return null;
  }

  return {
    combatPhase: phaseForNextRound(),
    roundError: null,
  };
}

export function resolveSandboxRound(input: SandboxRoundFlowInput): ResolveRoundResult {
  if (!canResolveCombatRound(input.combatPhase)) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError:
        input.combatPhase === "round_resolved"
          ? "Advance to the next round first."
          : "Combat is not ready for round resolution.",
    };
  }

  const activeCombat = input.combatState;

  if (!activeCombat) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError: "Start the fight first.",
    };
  }

  const playerCombatant = activeCombat.combatants.find(
    (combatant) => combatant.id === input.playerSnapshot.characterId
  );
  const botCombatant = activeCombat.combatants.find(
    (combatant) => combatant.id === input.botSnapshot.characterId
  );

  if (!playerCombatant || !botCombatant) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError: "combatant_not_found",
    };
  }

  if (input.roundDraft.defenseZones.length !== 2) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError: "Select two defense zones.",
    };
  }

  const selectedSkillId = getRoundDraftSelectedSkillId(input.roundDraft);
  const selectedConsumableCode = getRoundDraftSelectedConsumableCode(input.roundDraft);
  const selectedSkill = input.availableSkills.find((skill) => skill.id === selectedSkillId) ?? null;
  const selectedConsumable =
    input.availableConsumables.find((entry) => entry.item.code === selectedConsumableCode)?.item ?? null;
  const playerResources = playerCombatant.resources;

  if (selectedSkill && playerResources[selectedSkill.resourceType] < selectedSkill.cost) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError: `Not enough ${selectedSkill.resourceType} for ${selectedSkill.name}.`,
    };
  }

  const selectedSkillCooldown = selectedSkill ? ((playerCombatant.skillCooldowns ?? {})[selectedSkill.id] ?? 0) : 0;

  if (selectedSkill && selectedSkillCooldown > 0) {
    return {
      success: false,
      combatPhase: input.combatPhase,
      botLastPlan: null,
      botLastAction: null,
      roundError: `${selectedSkill.name} is on cooldown for ${selectedSkillCooldown} more turn${selectedSkillCooldown === 1 ? "" : "s"}.`,
    };
  }

  const resolvingPhase = phaseWhileResolving();
  const playerAction = buildPlayerRoundAction({
    attackerId: playerCombatant.id,
    draft: input.roundDraft,
    skill: selectedSkill,
    consumable: selectedConsumable ? toCombatConsumable(selectedConsumable) : null,
  });
  const botPlan = planBotRound({
    random: input.random,
    attacker: input.botSnapshot,
    defender: input.playerSnapshot,
    attackerCombatant: botCombatant,
    defenderCombatant: playerCombatant,
    availableSkills: input.botAvailableSkills,
    difficulty: input.selectedBotDifficulty.plannerProfile,
    opponentAttackZone: input.roundDraft.attackZone,
    archetype: input.selectedBotBuild?.archetype ?? null,
  });
  const botAction = buildBotRoundAction(botPlan, botCombatant.id, input.botAvailableSkills);
  const result = resolveRound(activeCombat, [playerAction, botAction], input.random);

  if (!result.success) {
    return {
      success: false,
      combatPhase: phaseAfterResolutionFailure(resolvingPhase),
      botLastPlan: botPlan,
      botLastAction: botAction,
      roundError: result.reason,
    };
  }

  let nextInventory = input.inventory;
  let nextRoundDraft = input.roundDraft;

  if (selectedConsumable) {
    const consumedInventory = removeItem(input.inventory, selectedConsumable.code, 1);

    if (consumedInventory.success) {
      nextInventory = consumedInventory.data;
    }

    nextRoundDraft = clearRoundDraftConsumable(input.roundDraft);
  }

  return {
    success: true,
    combatState: result.data,
    combatPhase: phaseAfterRoundResolution(result.data),
    botLastPlan: botPlan,
    botLastAction: botAction,
    roundError: null,
    inventory: nextInventory,
    roundDraft: nextRoundDraft,
  };
}

function toCombatConsumable(item: Item): CombatConsumableAction {
  return {
    itemCode: item.code,
    itemName: item.name,
    effect: item.consumableEffect!,
  };
}
