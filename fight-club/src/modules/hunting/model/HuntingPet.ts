import type { ItemRarity } from "@/modules/inventory/model/Item";

export type HuntingPetSpecies = "wolf" | "bear" | "lynx";

export interface HuntingPetTraits {
  huntSpeedPercent: number;
  survivalPercent: number;
  rareDropPercent: number;
  rewardQuantityPercent: number;
}

export const zeroHuntingPetTraits: HuntingPetTraits = {
  huntSpeedPercent: 0,
  survivalPercent: 0,
  rareDropPercent: 0,
  rewardQuantityPercent: 0,
};

export function sumHuntingPetTraits(traits: HuntingPetTraits[]): HuntingPetTraits {
  return traits.reduce<HuntingPetTraits>(
    (total, current) => ({
      huntSpeedPercent: total.huntSpeedPercent + current.huntSpeedPercent,
      survivalPercent: total.survivalPercent + current.survivalPercent,
      rareDropPercent: total.rareDropPercent + current.rareDropPercent,
      rewardQuantityPercent: total.rewardQuantityPercent + current.rewardQuantityPercent,
    }),
    zeroHuntingPetTraits
  );
}

export interface HuntingPet {
  id: string;
  species: HuntingPetSpecies;
  name: string;
  rarity: ItemRarity;
  level: number;
  totalExperience: number;
  traits: HuntingPetTraits;
}
