import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import type { ActiveCombatEffect } from "@/modules/combat/model/CombatEffect";
import type { CombatPresentationStageModel } from "./combatPresentationModel";

export function createSandboxCombatPresentationModel({
  player,
  rival,
  controls,
}: {
  player: {
    name: string;
    figure: string;
    currentHp: number;
    maxHp: number;
    equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
    activeEffects: ActiveCombatEffect[];
    derivedStats: Array<{ label: string; value: string; helper: string }>;
    badges: string[];
    winner: boolean;
    loser: boolean;
  };
  rival: {
    name: string;
    figure: string;
    currentHp: number;
    maxHp: number;
    equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
    activeEffects: ActiveCombatEffect[];
    derivedStats: Array<{ label: string; value: string; helper: string }>;
    badges: string[];
    resources: { rage: number; guard: number; momentum: number; focus: number } | null;
    winner: boolean;
    loser: boolean;
  };
  controls: {
    currentActionLabel: string;
    currentActionTags: string[];
    currentActionSummary: string[];
    phaseLabel: string;
    round: number | null;
    latestRoundSummary: string;
    primaryActionLabel: string;
    primaryActionAriaLabel?: string;
    primaryActionTone?: "warm" | "ready";
    canPrimaryAction: boolean;
  };
}): CombatPresentationStageModel {
  return {
    source: "sandbox",
    player: {
      ...player,
      resources: null,
    },
    rival,
    controls: {
      currentActionLabel: controls.currentActionLabel,
      currentActionTags: controls.currentActionTags,
      currentActionSummary: controls.currentActionSummary,
      phaseLabel: controls.phaseLabel,
      round: controls.round,
      roomCode: null,
      roundProgressLabel: null,
      waitStatus: null,
      latestRoundSummary: controls.latestRoundSummary,
      primaryActionLabel: controls.primaryActionLabel,
      primaryActionAriaLabel: controls.primaryActionAriaLabel ?? controls.primaryActionLabel,
      primaryActionTone: controls.primaryActionTone ?? "warm",
      canPrimaryAction: controls.canPrimaryAction,
    },
  };
}

export function createOnlineDuelCombatPresentationModel({
  player,
  rival,
  controls,
}: {
  player: {
    name: string;
    figure: string;
    currentHp: number;
    maxHp: number;
    equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
    activeEffects: ActiveCombatEffect[];
    derivedStats: Array<{ label: string; value: string; helper: string }>;
    badges: string[];
    resources: { rage: number; guard: number; momentum: number; focus: number } | null;
    winner: boolean;
    loser: boolean;
  };
  rival: {
    name: string;
    figure: string;
    currentHp: number;
    maxHp: number;
    equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
    activeEffects: ActiveCombatEffect[];
    derivedStats: Array<{ label: string; value: string; helper: string }>;
    badges: string[];
    resources: { rage: number; guard: number; momentum: number; focus: number } | null;
    winner: boolean;
    loser: boolean;
  };
  controls: {
    currentActionLabel: string;
    currentActionTags: string[];
    currentActionSummary: string[];
    phaseLabel: string;
    round: number | null;
    roomCode: string | null;
    roundProgressLabel: string | null;
    waitStatus: string | null;
    latestRoundSummary: string;
    primaryActionLabel: string;
    primaryActionAriaLabel: string;
    primaryActionTone: "warm" | "ready";
    canPrimaryAction: boolean;
  };
}): CombatPresentationStageModel {
  return {
    source: "online-duel",
    player,
    rival,
    controls,
  };
}
