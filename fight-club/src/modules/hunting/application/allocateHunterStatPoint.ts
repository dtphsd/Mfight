import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HunterStatName } from "@/modules/hunting/model/HunterStats";

export type AllocateHunterStatFailureReason = "invalid_stat" | "invalid_allocation_amount" | "not_enough_stat_points";

export type AllocateHunterStatResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: AllocateHunterStatFailureReason };

export function allocateHunterStatPoint(
  profile: HunterProfile,
  stat: HunterStatName,
  amount = 1
): AllocateHunterStatResult {
  if (!Object.hasOwn(profile.stats, stat)) {
    return {
      success: false,
      reason: "invalid_stat",
    };
  }

  if (amount < 1) {
    return {
      success: false,
      reason: "invalid_allocation_amount",
    };
  }

  if (profile.unspentStatPoints < amount) {
    return {
      success: false,
      reason: "not_enough_stat_points",
    };
  }

  return {
    success: true,
    data: {
      ...profile,
      unspentStatPoints: profile.unspentStatPoints - amount,
      stats: {
        ...profile.stats,
        [stat]: profile.stats[stat] + amount,
      },
    },
  };
}
