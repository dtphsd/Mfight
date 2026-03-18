import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type { CombatIntent } from "@/modules/combat/model/CombatIntent";
import type { ConsumableEffect } from "@/modules/inventory/model/Item";

export interface CombatConsumableAction {
  itemCode: string;
  itemName: string;
  effect: ConsumableEffect;
}

interface BaseRoundAction {
  attackerId: string;
  attackZone: CombatZone;
  defenseZones: [CombatZone, CombatZone];
  intent: CombatIntent;
}

export interface BasicAttackRoundAction extends BaseRoundAction {
  kind: "basic_attack";
}

export interface SkillAttackRoundAction extends BaseRoundAction {
  kind: "skill_attack";
  skill: CombatSkill;
}

export interface ConsumableRoundAction extends BaseRoundAction {
  kind: "consumable";
  consumable: CombatConsumableAction;
}

export interface ConsumableAttackRoundAction extends BaseRoundAction {
  kind: "consumable_attack";
  consumable: CombatConsumableAction;
}

export type RoundAction =
  | BasicAttackRoundAction
  | SkillAttackRoundAction
  | ConsumableRoundAction
  | ConsumableAttackRoundAction;

export function createBasicAttackAction(
  input: Omit<BasicAttackRoundAction, "kind" | "intent"> & { intent?: CombatIntent }
): BasicAttackRoundAction {
  return {
    kind: "basic_attack",
    intent: input.intent ?? "neutral",
    ...input,
  };
}

export function createSkillAttackAction(
  input: Omit<SkillAttackRoundAction, "kind" | "intent"> & { intent?: CombatIntent }
): SkillAttackRoundAction {
  return {
    kind: "skill_attack",
    intent: input.intent ?? "neutral",
    ...input,
  };
}

export function createConsumableAction(
  input: Omit<ConsumableRoundAction, "kind" | "intent"> & { intent?: CombatIntent }
): ConsumableRoundAction {
  return {
    kind: "consumable",
    intent: input.intent ?? "neutral",
    ...input,
  };
}

export function createConsumableAttackAction(
  input: Omit<ConsumableAttackRoundAction, "kind" | "intent"> & { intent?: CombatIntent }
): ConsumableAttackRoundAction {
  return {
    kind: "consumable_attack",
    intent: input.intent ?? "neutral",
    ...input,
  };
}

export function getRoundActionSkill(action: RoundAction): CombatSkill | null {
  return action.kind === "skill_attack" ? action.skill : null;
}

export function getRoundActionConsumable(action: RoundAction): CombatConsumableAction | null {
  return action.kind === "consumable" || action.kind === "consumable_attack" ? action.consumable : null;
}

export function isConsumableOnlyAction(action: RoundAction) {
  return action.kind === "consumable";
}

export function isConsumableAttackAction(action: RoundAction) {
  return action.kind === "consumable_attack";
}

export function getRoundActionIntent(action: RoundAction): CombatIntent {
  return action.intent;
}
