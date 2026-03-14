import type { HuntingPet } from "@/modules/hunting/model/HuntingPet";

export type AddHuntingPetExperienceResult =
  | { success: true; data: HuntingPet[] }
  | { success: false; reason: "invalid_experience_amount" | "pet_not_found" };

const petLevelCurve = [20, 30, 45, 65, 90, 120] as const;

export function addHuntingPetExperience(
  pets: HuntingPet[],
  petId: string | null,
  amount: number
): AddHuntingPetExperienceResult {
  if (amount <= 0) {
    return {
      success: false,
      reason: "invalid_experience_amount",
    };
  }

  if (!petId) {
    return {
      success: false,
      reason: "pet_not_found",
    };
  }

  const petIndex = pets.findIndex((pet) => pet.id === petId);
  if (petIndex === -1) {
    return {
      success: false,
      reason: "pet_not_found",
    };
  }

  const nextPets = pets.map((pet) => ({ ...pet, traits: { ...pet.traits } }));
  let nextPet = {
    ...nextPets[petIndex],
    totalExperience: nextPets[petIndex].totalExperience + amount,
    levelProgress: nextPets[petIndex].levelProgress + amount,
  };

  while (nextPet.level - 1 < petLevelCurve.length) {
    const cost = petLevelCurve[nextPet.level - 1];
    if (cost === undefined || nextPet.levelProgress < cost) {
      break;
    }

    nextPet = {
      ...nextPet,
      level: nextPet.level + 1,
      levelProgress: nextPet.levelProgress - cost,
      traits: levelPetTraits(nextPet),
    };
  }

  nextPets[petIndex] = nextPet;

  return {
    success: true,
    data: nextPets,
  };
}

export function getHuntingPetLevelStepCost(level: number) {
  return petLevelCurve[level - 1] ?? null;
}

function levelPetTraits(pet: HuntingPet) {
  switch (pet.species) {
    case "wolf":
      return {
        ...pet.traits,
        huntSpeedPercent: pet.traits.huntSpeedPercent + 1,
        rewardQuantityPercent: pet.traits.rewardQuantityPercent + 1,
      };
    case "bear":
      return {
        ...pet.traits,
        survivalPercent: pet.traits.survivalPercent + 2,
      };
    case "lynx":
      return {
        ...pet.traits,
        huntSpeedPercent: pet.traits.huntSpeedPercent + 1,
        rareDropPercent: pet.traits.rareDropPercent + 1,
      };
    default:
      return pet.traits;
  }
}
