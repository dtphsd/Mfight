export interface HuntingZone {
  id: string;
  name: string;
  minHunterLevel: number;
  durationMinutes: number;
  dangerRating: number;
  resourceTags: readonly string[];
  baseCurrencyReward: number;
  encounterProfileId: string;
}

export const defaultHuntingZoneDurationMinutes = 15;
