export interface HuntingRouteStanceBonuses {
  encounterIntervalPercent: number;
  successRateBonus: number;
  rewardQuantityPercent: number;
  rareDropPercent: number;
}

export interface HuntingRouteStance {
  id: string;
  name: string;
  description: string;
  bonuses: HuntingRouteStanceBonuses;
}
