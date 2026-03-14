import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HuntingPet } from "@/modules/hunting/model/HuntingPet";

export type AssignPetFailureReason = "pet_not_found";

export type AssignPetResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: AssignPetFailureReason };

export function assignPetToHunter(
  profile: HunterProfile,
  pets: HuntingPet[],
  petId: string | null
): AssignPetResult {
  if (petId !== null && !pets.some((pet) => pet.id === petId)) {
    return {
      success: false,
      reason: "pet_not_found",
    };
  }

  return {
    success: true,
    data: {
      ...profile,
      activePetId: petId,
    },
  };
}
