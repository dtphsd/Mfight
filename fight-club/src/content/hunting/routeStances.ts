import type { HuntingRouteStance } from "@/modules/hunting";

export const huntingRouteStances: HuntingRouteStance[] = [
  {
    id: "steady",
    name: "Steady",
    description: "Balanced pacing with no extra risk and no extra greed.",
    bonuses: {
      encounterIntervalPercent: 0,
      successRateBonus: 0,
      rewardQuantityPercent: 0,
      rareDropPercent: 0,
    },
  },
  {
    id: "greedy",
    name: "Greedy",
    description: "Push deeper for heavier hauls, but accept a lower success rate.",
    bonuses: {
      encounterIntervalPercent: -8,
      successRateBonus: -0.04,
      rewardQuantityPercent: 24,
      rareDropPercent: 16,
    },
  },
  {
    id: "cautious",
    name: "Cautious",
    description: "Trade pace and loot volume for safer, steadier route clears.",
    bonuses: {
      encounterIntervalPercent: 10,
      successRateBonus: 0.08,
      rewardQuantityPercent: -8,
      rareDropPercent: 0,
    },
  },
];

export function getHuntingRouteStance(stanceId: string | null | undefined) {
  return huntingRouteStances.find((stance) => stance.id === stanceId) ?? huntingRouteStances[0];
}
