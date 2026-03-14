import { getHuntingRouteStance } from "@/content/hunting/routeStances";
import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";

export type SetHuntingRouteStanceResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: "stance_missing" };

export function setHuntingRouteStance(
  profile: HunterProfile,
  routeStanceId: string | null | undefined
): SetHuntingRouteStanceResult {
  const stance = getHuntingRouteStance(routeStanceId);
  if (!stance) {
    return {
      success: false,
      reason: "stance_missing",
    };
  }

  return {
    success: true,
    data: {
      ...profile,
      routeStanceId: stance.id,
    },
  };
}
