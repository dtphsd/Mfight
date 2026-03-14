import type { HuntingToolItem } from "@/modules/hunting/model/HuntingTool";

export const huntingToolCatalog: HuntingToolItem[] = [
  {
    id: "hunting-tool-forager-satchel",
    itemCode: "forager-satchel",
    name: "Forager Satchel",
    rarity: "common",
    description: "Packed for herbs and wood bundles gathered on safer routes.",
    targetResourceTags: ["wood", "herbs"],
    bonuses: {
      huntSpeedPercent: 0,
      rewardQuantityPercent: 4,
      rareDropPercent: 0,
      targetedYieldPercent: 45,
    },
  },
  {
    id: "hunting-tool-trapper-knife",
    itemCode: "trapper-knife",
    name: "Trapper Knife",
    rarity: "common",
    description: "A light field knife for hide work and bone salvage.",
    targetResourceTags: ["hide", "bone"],
    bonuses: {
      huntSpeedPercent: 4,
      rewardQuantityPercent: 2,
      rareDropPercent: 0,
      targetedYieldPercent: 40,
    },
  },
  {
    id: "hunting-tool-prospector-pick",
    itemCode: "prospector-pick",
    name: "Prospector Pick",
    rarity: "rare",
    description: "A compact pick tuned for ore seams and old relic caches.",
    targetResourceTags: ["ore", "relic", "egg"],
    bonuses: {
      huntSpeedPercent: -2,
      rewardQuantityPercent: 0,
      rareDropPercent: 6,
      targetedYieldPercent: 38,
    },
  },
];

export function getHuntingToolItem(itemCode: string) {
  return huntingToolCatalog.find((item) => item.itemCode === itemCode) ?? null;
}

