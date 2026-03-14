import type { ItemRarity } from "@/modules/inventory/model/Item";

export type HuntingGearSlot = "weapon" | "armor" | "helmet" | "gloves" | "accessory";

export const huntingGearSlots: HuntingGearSlot[] = ["weapon", "armor", "helmet", "gloves", "accessory"];

export interface HuntingGearBonuses {
  huntSpeedPercent: number;
  lootQuantityPercent: number;
  survivalFlat: number;
  survivalPercent: number;
  rareDropPercent: number;
}

export const zeroHuntingGearBonuses: HuntingGearBonuses = {
  huntSpeedPercent: 0,
  lootQuantityPercent: 0,
  survivalFlat: 0,
  survivalPercent: 0,
  rareDropPercent: 0,
};

export function sumHuntingGearBonuses(bonuses: HuntingGearBonuses[]): HuntingGearBonuses {
  return bonuses.reduce<HuntingGearBonuses>(
    (total, current) => ({
      huntSpeedPercent: total.huntSpeedPercent + current.huntSpeedPercent,
      lootQuantityPercent: total.lootQuantityPercent + current.lootQuantityPercent,
      survivalFlat: total.survivalFlat + current.survivalFlat,
      survivalPercent: total.survivalPercent + current.survivalPercent,
      rareDropPercent: total.rareDropPercent + current.rareDropPercent,
    }),
    zeroHuntingGearBonuses
  );
}

export interface HuntingGearItem {
  id: string;
  itemCode: string;
  name: string;
  slot: HuntingGearSlot;
  rarity: ItemRarity;
  description: string;
  bonuses: HuntingGearBonuses;
}

export interface EquippedHuntingGear {
  slot: HuntingGearSlot;
  item: HuntingGearItem | null;
}

export function createEmptyHuntingGearLoadout(): EquippedHuntingGear[] {
  return huntingGearSlots.map((slot) => ({
    slot,
    item: null,
  }));
}

export function getEquippedHuntingGearBonuses(loadout: EquippedHuntingGear[]) {
  return sumHuntingGearBonuses(
    loadout
      .map((entry) => entry.item?.bonuses ?? null)
      .filter((entry): entry is HuntingGearBonuses => entry !== null)
  );
}
