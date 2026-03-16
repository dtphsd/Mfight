import { prepareSandboxNextRound, resolveSandboxRound, startSandboxFight } from "@/orchestration/combat/combatSandboxController";
import { reconcileSandboxRoundDraftSelections } from "@/orchestration/combat/combatSandboxSupport";
import type { CombatPhase } from "@/modules/combat/model/CombatPhase";
import type { CombatState, RoundAction } from "@/modules/combat";
import type { BotRoundPlan } from "@/orchestration/combat/botRoundPlanner";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import type { CombatSnapshot } from "@/modules/combat";
import type { Inventory } from "@/modules/inventory";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type { BotDifficultyConfig, CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";
import type { Random } from "@/core/rng/Random";

type Setter<TValue> = (value: TValue | ((current: TValue) => TValue)) => void;

type CreateCombatSandboxFlowInput = {
  combatPhase: CombatPhase;
  combatState: CombatState | null;
  roundDraft: RoundDraft;
  inventory: Inventory;
  playerSnapshot: CombatSnapshot;
  botSnapshot: CombatSnapshot;
  availableSkills: CombatSkill[];
  availableConsumables: Array<{ item: Inventory["entries"][number]["item"]; quantity: number }>;
  botAvailableSkills: CombatSkill[];
  selectedBotDifficulty: Pick<BotDifficultyConfig, "plannerProfile">;
  selectedBotPreset: Pick<CombatBuildPreset, "id" | "archetype">;
  playerCombatant: CombatState["combatants"][number] | null;
  random: Random;
  setCombatState: Setter<CombatState | null>;
  setCombatPhase: Setter<CombatPhase>;
  setRoundDraft: Setter<RoundDraft>;
  setInventory: Setter<Inventory>;
  setBotLastAction: Setter<RoundAction | null>;
  setBotLastPlan: Setter<BotRoundPlan | null>;
  setRoundError: Setter<string | null>;
};

export function createCombatSandboxFlow(input: CreateCombatSandboxFlowInput) {
  return {
    startFight: () => {
      const result = startSandboxFight({
        playerSnapshot: input.playerSnapshot,
        botSnapshot: input.botSnapshot,
      });

      input.setCombatState(result.combatState);
      input.setCombatPhase(result.combatPhase);
      input.setBotLastAction(result.botLastAction);
      input.setBotLastPlan(result.botLastPlan);
      input.setRoundError(result.roundError);
    },
    prepareNextRound: () => {
      const result = prepareSandboxNextRound({ combatPhase: input.combatPhase });

      if (!result) {
        return;
      }

      input.setCombatPhase(result.combatPhase);
      input.setRoundDraft((current) =>
        reconcileSandboxRoundDraftSelections(
          current,
          input.availableSkills,
          input.availableConsumables,
          input.playerCombatant?.resources,
          input.playerCombatant?.skillCooldowns
        )
      );
      input.setRoundError(result.roundError);
    },
    resolveNextRound: () => {
      const result = resolveSandboxRound({
        combatPhase: input.combatPhase,
        combatState: input.combatState,
        roundDraft: input.roundDraft,
        inventory: input.inventory,
        playerSnapshot: input.playerSnapshot,
        botSnapshot: input.botSnapshot,
        availableSkills: input.availableSkills,
        availableConsumables: input.availableConsumables,
        botAvailableSkills: input.botAvailableSkills,
        selectedBotDifficulty: input.selectedBotDifficulty,
        selectedBotBuild: input.selectedBotPreset,
        random: input.random,
      });

      input.setBotLastPlan(result.botLastPlan);
      input.setBotLastAction(result.botLastAction);
      input.setCombatPhase(result.combatPhase);
      input.setRoundError(result.roundError);

      if (!result.success) {
        return;
      }

      input.setInventory(result.inventory);
      input.setRoundDraft(result.roundDraft);
      input.setCombatState(result.combatState);
    },
  };
}
