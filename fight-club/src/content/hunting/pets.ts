import type { HuntingPet } from "@/modules/hunting/model/HuntingPet";

export const huntingPetCatalog: HuntingPet[] = [
  {
    id: "pet-wolf-scout",
    species: "wolf",
    name: "Scout Wolf",
    rarity: "common",
    level: 1,
    totalExperience: 0,
    levelProgress: 0,
    traits: {
      huntSpeedPercent: 8,
      survivalPercent: 6,
      rareDropPercent: 0,
      rewardQuantityPercent: 4,
    },
  },
  {
    id: "pet-bear-warden",
    species: "bear",
    name: "Warden Bear",
    rarity: "rare",
    level: 1,
    totalExperience: 0,
    levelProgress: 0,
    traits: {
      huntSpeedPercent: 0,
      survivalPercent: 18,
      rareDropPercent: 0,
      rewardQuantityPercent: 2,
    },
  },
  {
    id: "pet-lynx-shadow",
    species: "lynx",
    name: "Shadow Lynx",
    rarity: "rare",
    level: 1,
    totalExperience: 0,
    levelProgress: 0,
    traits: {
      huntSpeedPercent: 12,
      survivalPercent: 0,
      rareDropPercent: 8,
      rewardQuantityPercent: 3,
    },
  },
];

export function getHuntingPet(petId: string) {
  return huntingPetCatalog.find((pet) => pet.id === petId) ?? null;
}
