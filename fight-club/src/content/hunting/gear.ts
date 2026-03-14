import type { HuntingGearItem } from "@/modules/hunting/model/HuntingGear";

export const huntingGearCatalog: HuntingGearItem[] = [
  {
    id: "hunting-gear-tracker-spear",
    itemCode: "tracker-spear",
    name: "Tracker Spear",
    slot: "weapon",
    rarity: "common",
    description: "A light spear that keeps hunting runs brisk and steady.",
    bonuses: {
      huntSpeedPercent: 10,
      lootQuantityPercent: 0,
      survivalFlat: 0,
      survivalPercent: 0,
      rareDropPercent: 0,
    },
  },
  {
    id: "hunting-gear-trail-leathers",
    itemCode: "trail-leathers",
    name: "Trail Leathers",
    slot: "armor",
    rarity: "common",
    description: "Light leathers that help a hunter survive long routes.",
    bonuses: {
      huntSpeedPercent: 0,
      lootQuantityPercent: 0,
      survivalFlat: 2,
      survivalPercent: 10,
      rareDropPercent: 0,
    },
  },
  {
    id: "hunting-gear-tracker-hood",
    itemCode: "tracker-hood",
    name: "Tracker Hood",
    slot: "helmet",
    rarity: "rare",
    description: "A hood tuned for reading tracks and spotting rarer finds.",
    bonuses: {
      huntSpeedPercent: 0,
      lootQuantityPercent: 0,
      survivalFlat: 0,
      survivalPercent: 0,
      rareDropPercent: 8,
    },
  },
  {
    id: "hunting-gear-gatherer-grips",
    itemCode: "gatherer-grips",
    name: "Gatherer Grips",
    slot: "gloves",
    rarity: "common",
    description: "Well-worn gloves that help secure more usable materials.",
    bonuses: {
      huntSpeedPercent: 0,
      lootQuantityPercent: 12,
      survivalFlat: 0,
      survivalPercent: 0,
      rareDropPercent: 0,
    },
  },
  {
    id: "hunting-gear-lucky-bone-charm",
    itemCode: "lucky-bone-charm",
    name: "Lucky Bone Charm",
    slot: "accessory",
    rarity: "rare",
    description: "A charm prized by hunters for smoother routes and luckier hauls.",
    bonuses: {
      huntSpeedPercent: 4,
      lootQuantityPercent: 6,
      survivalFlat: 0,
      survivalPercent: 0,
      rareDropPercent: 6,
    },
  },
];

export function getHuntingGearItem(itemCode: string) {
  return huntingGearCatalog.find((item) => item.itemCode === itemCode) ?? null;
}
