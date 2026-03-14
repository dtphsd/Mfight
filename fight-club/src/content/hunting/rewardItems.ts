import { zeroCharacterStats } from "@/modules/character/model/CharacterStats";
import { zeroArmorProfile, zeroCombatBonuses, zeroDamageProfile, type Item } from "@/modules/inventory/model/Item";

export const huntingRewardItems: Item[] = [
  createHuntingMaterial({
    id: "hunting-wood-bundle",
    code: "wood",
    name: "Wood Bundle",
    rarity: "common",
    description: "Basic hunting wood used for future crafting and trade routes.",
    value: 2,
    maxStack: 25,
  }),
  createHuntingMaterial({
    id: "hunting-herb-pouch",
    code: "herbs",
    name: "Herb Pouch",
    rarity: "common",
    description: "Gathered herbs from light hunting routes.",
    value: 3,
    maxStack: 25,
  }),
  createHuntingMaterial({
    id: "hunting-hide-scrap",
    code: "hide",
    name: "Hide Scrap",
    rarity: "common",
    description: "Rough hide taken from hunted creatures.",
    value: 4,
    maxStack: 20,
  }),
  createHuntingMaterial({
    id: "hunting-ore-chunk",
    code: "ore",
    name: "Ore Chunk",
    rarity: "rare",
    description: "Heavy ore recovered from rocky hunting grounds.",
    value: 6,
    maxStack: 20,
  }),
  createHuntingMaterial({
    id: "hunting-bone-shard",
    code: "bone",
    name: "Bone Shard",
    rarity: "rare",
    description: "A hardened bone fragment useful for crafting and trade.",
    value: 5,
    maxStack: 20,
  }),
  createHuntingMaterial({
    id: "hunting-relic-fragment",
    code: "relic",
    name: "Relic Fragment",
    rarity: "epic",
    description: "A relic fragment salvaged from dangerous hunting paths.",
    value: 12,
    maxStack: 10,
  }),
  createHuntingMaterial({
    id: "hunting-beast-egg",
    code: "egg",
    name: "Beast Egg",
    rarity: "epic",
    description: "A strange egg that may hatch into a future hunting pet.",
    value: 14,
    maxStack: 10,
  }),
];

export function getHuntingRewardItem(itemCode: string) {
  return huntingRewardItems.find((item) => item.code === itemCode) ?? null;
}

function createHuntingMaterial(input: {
  id: string;
  code: string;
  name: string;
  rarity: Item["rarity"];
  description: string;
  value: number;
  maxStack: number;
}): Item {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    category: "material",
    type: "material",
    rarity: input.rarity,
    description: input.description,
    value: input.value,
    stackable: true,
    maxStack: input.maxStack,
    equip: null,
    consumableEffect: null,
    baseDamage: zeroDamageProfile,
    baseArmor: zeroArmorProfile,
    combatBonuses: zeroCombatBonuses,
    statBonuses: zeroCharacterStats,
    flatBonuses: zeroCharacterStats,
    percentBonuses: zeroCharacterStats,
  };
}
