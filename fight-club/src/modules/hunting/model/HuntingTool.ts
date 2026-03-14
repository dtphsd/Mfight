import type { ItemRarity } from "@/modules/inventory/model/Item";

export interface HuntingToolBonuses {
  huntSpeedPercent: number;
  rewardQuantityPercent: number;
  rareDropPercent: number;
  targetedYieldPercent: number;
}

export const zeroHuntingToolBonuses: HuntingToolBonuses = {
  huntSpeedPercent: 0,
  rewardQuantityPercent: 0,
  rareDropPercent: 0,
  targetedYieldPercent: 0,
};

export interface HuntingToolItem {
  id: string;
  itemCode: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  targetResourceTags: readonly string[];
  bonuses: HuntingToolBonuses;
}

export interface EquippedHuntingTool {
  slot: "kit";
  item: HuntingToolItem | null;
}

export function createEmptyHuntingToolLoadout(): EquippedHuntingTool {
  return {
    slot: "kit",
    item: null,
  };
}

export function getEquippedHuntingToolBonuses(loadout: EquippedHuntingTool) {
  return loadout.item?.bonuses ?? zeroHuntingToolBonuses;
}

export function getHuntingToolMasteryLevel(points: number | null | undefined) {
  if (!points || points <= 0) {
    return 0;
  }

  return Math.min(3, Math.floor(points / 3));
}

export function getHuntingToolMasteryProgress(points: number | null | undefined) {
  const safePoints = Math.max(0, points ?? 0);
  const level = getHuntingToolMasteryLevel(safePoints);
  const capped = level >= 3;

  if (capped) {
    return {
      level,
      percent: 100,
      current: safePoints,
      needed: safePoints,
      capped: true,
    };
  }

  const currentTierFloor = level * 3;
  const nextTierCeil = (level + 1) * 3;
  const current = safePoints - currentTierFloor;
  const needed = nextTierCeil - currentTierFloor;

  return {
    level,
    percent: Math.min(100, Math.max(0, (current / needed) * 100)),
    current,
    needed,
    capped: false,
  };
}

export function getMasteredHuntingToolBonuses(loadout: EquippedHuntingTool, masteryPoints: number | null | undefined) {
  const base = getEquippedHuntingToolBonuses(loadout);
  const masteryLevel = getHuntingToolMasteryLevel(masteryPoints);

  if (masteryLevel === 0) {
    return base;
  }

  return {
    huntSpeedPercent: base.huntSpeedPercent + masteryLevel * 1,
    rewardQuantityPercent: base.rewardQuantityPercent + masteryLevel * 2,
    rareDropPercent: base.rareDropPercent + masteryLevel * 2,
    targetedYieldPercent: base.targetedYieldPercent + masteryLevel * 8,
  };
}
