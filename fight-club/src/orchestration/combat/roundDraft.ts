import type { CombatIntent, CombatSkill, CombatZone, RoundAction } from "@/modules/combat";
import {
  createBasicAttackAction,
  createConsumableAction,
  createConsumableAttackAction,
  createSkillAttackAction,
  type CombatConsumableAction,
} from "@/modules/combat/model/RoundAction";

export type RoundDraftSelectedAction =
  | { kind: "basic_attack" }
  | { kind: "skill_attack"; skillId: string }
  | { kind: "consumable"; consumableCode: string; usageMode: "replace_attack" | "with_attack" };

export interface RoundDraft {
  attackZone: CombatZone;
  defenseZones: [CombatZone, CombatZone];
  intent: CombatIntent;
  selectedAction: RoundDraftSelectedAction;
}

export function createRoundDraft(): RoundDraft {
  return {
    attackZone: "head",
    defenseZones: ["chest", "belly"],
    intent: "neutral",
    selectedAction: { kind: "basic_attack" },
  };
}

export function setRoundDraftAttackZone(draft: RoundDraft, zone: CombatZone): RoundDraft {
  return {
    ...draft,
    attackZone: zone,
  };
}

export function toggleRoundDraftDefenseZone(draft: RoundDraft, zone: CombatZone): RoundDraft {
  return {
    ...draft,
    defenseZones: draft.defenseZones.includes(zone)
      ? ([draft.defenseZones[0], draft.defenseZones[1]] as [CombatZone, CombatZone])
      : ([draft.defenseZones[1], zone] as [CombatZone, CombatZone]),
  };
}

export function setRoundDraftSkill(draft: RoundDraft, skillId: string | null): RoundDraft {
  return {
    ...draft,
    selectedAction: skillId ? { kind: "skill_attack", skillId } : { kind: "basic_attack" },
  };
}

export function setRoundDraftIntent(draft: RoundDraft, intent: CombatIntent): RoundDraft {
  return {
    ...draft,
    intent,
  };
}

export function setRoundDraftConsumable(
  draft: RoundDraft,
  itemCode: string | null,
  usageMode: "replace_attack" | "with_attack" | null = null
): RoundDraft {
  return {
    ...draft,
    selectedAction:
      itemCode && usageMode
        ? {
            kind: "consumable",
            consumableCode: itemCode,
            usageMode,
          }
        : { kind: "basic_attack" },
  };
}

export function clearRoundDraftSelections(draft: RoundDraft): RoundDraft {
  return {
    ...draft,
    selectedAction: { kind: "basic_attack" },
  };
}

export function clearRoundDraftConsumable(draft: RoundDraft): RoundDraft {
  if (draft.selectedAction.kind !== "consumable") {
    return draft;
  }

  return {
    ...draft,
    selectedAction: { kind: "basic_attack" },
  };
}

export function buildPlayerRoundAction(input: {
  attackerId: string;
  draft: RoundDraft;
  skill: CombatSkill | null;
  consumable: CombatConsumableAction | null;
}): RoundAction {
  if (input.draft.selectedAction.kind === "consumable" && input.consumable?.effect.usageMode === "replace_attack") {
    return createConsumableAction({
      attackerId: input.attackerId,
      attackZone: input.draft.attackZone,
      defenseZones: input.draft.defenseZones,
      intent: input.draft.intent,
      consumable: input.consumable,
    });
  }

  if (input.draft.selectedAction.kind === "skill_attack" && input.skill) {
    return createSkillAttackAction({
      attackerId: input.attackerId,
      attackZone: input.draft.attackZone,
      defenseZones: input.draft.defenseZones,
      intent: input.draft.intent,
      skill: input.skill,
    });
  }

  if (input.draft.selectedAction.kind === "consumable" && input.consumable?.effect.usageMode === "with_attack") {
    return createConsumableAttackAction({
      attackerId: input.attackerId,
      attackZone: input.draft.attackZone,
      defenseZones: input.draft.defenseZones,
      intent: input.draft.intent,
      consumable: input.consumable,
    });
  }

  return createBasicAttackAction({
    attackerId: input.attackerId,
    attackZone: input.draft.attackZone,
    defenseZones: input.draft.defenseZones,
    intent: input.draft.intent,
  });
}

export function getRoundDraftSelectedSkillId(draft: RoundDraft) {
  return draft.selectedAction.kind === "skill_attack" ? draft.selectedAction.skillId : null;
}

export function getRoundDraftSelectedConsumableCode(draft: RoundDraft) {
  return draft.selectedAction.kind === "consumable" ? draft.selectedAction.consumableCode : null;
}
