import type { ActiveCombatEffect } from "@/modules/combat/model/CombatEffect";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";

export interface CombatPresentationResourceModel {
  rage: number;
  guard: number;
  momentum: number;
  focus: number;
}

export interface CombatPresentationFighterModel {
  name: string;
  figure: string;
  currentHp: number;
  maxHp: number;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  activeEffects: ActiveCombatEffect[];
  derivedStats: Array<{ label: string; value: string; helper: string }>;
  badges: string[];
  resources: CombatPresentationResourceModel | null;
  winner: boolean;
  loser: boolean;
}

export interface CombatPresentationControlsModel {
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
}

export interface CombatPresentationStageModel {
  source: "sandbox" | "online-duel";
  player: CombatPresentationFighterModel;
  rival: CombatPresentationFighterModel;
  controls: CombatPresentationControlsModel;
}
