import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HuntingGearItem } from "@/modules/hunting/model/HuntingGear";

export type EquipHuntingGearFailureReason = "slot_mismatch";

export type EquipHuntingGearResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: EquipHuntingGearFailureReason };

export function equipHuntingGear(profile: HunterProfile, item: HuntingGearItem): EquipHuntingGearResult {
  const slotEntry = profile.gear.find((entry) => entry.slot === item.slot);
  if (!slotEntry) {
    return {
      success: false,
      reason: "slot_mismatch",
    };
  }

  return {
    success: true,
    data: {
      ...profile,
      gear: profile.gear.map((entry) =>
        entry.slot === item.slot
          ? {
              ...entry,
              item,
            }
          : entry
      ),
    },
  };
}
