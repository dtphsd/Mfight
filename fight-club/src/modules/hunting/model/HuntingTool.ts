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

