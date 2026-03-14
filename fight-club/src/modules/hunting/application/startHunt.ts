import { emptyHuntReward } from "@/modules/hunting/model/HuntReward";
import type { HuntState } from "@/modules/hunting/model/HuntState";
import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HuntingZone } from "@/modules/hunting/model/HuntingZone";

export type StartHuntFailureReason = "zone_locked" | "zone_level_too_low" | "hunt_already_active";

export type StartHuntResult =
  | { success: true; data: HuntState }
  | { success: false; reason: StartHuntFailureReason };

export interface StartHuntInput {
  profile: HunterProfile;
  zone: HuntingZone;
  currentState: HuntState;
  startedAt?: number;
}

export function startHunt(input: StartHuntInput): StartHuntResult {
  if (input.currentState.status === "hunting") {
    return {
      success: false,
      reason: "hunt_already_active",
    };
  }

  if (!input.profile.unlockedZoneIds.includes(input.zone.id)) {
    return {
      success: false,
      reason: "zone_locked",
    };
  }

  if (input.profile.level < input.zone.minHunterLevel) {
    return {
      success: false,
      reason: "zone_level_too_low",
    };
  }

  const startedAt = input.startedAt ?? Date.now();

  return {
    success: true,
    data: {
      status: "hunting",
      zoneId: input.zone.id,
      startedAt,
      lastResolvedAt: startedAt,
      durationMs: input.zone.durationMinutes * 60 * 1000,
      encountersResolved: 0,
      successCount: 0,
      failureCount: 0,
      pendingReward: emptyHuntReward,
    },
  };
}
