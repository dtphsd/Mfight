export interface HuntRewardItem {
  itemCode: string;
  quantity: number;
}

export interface HuntLogEntry {
  id: string;
  enemy: string;
  outcome: "win" | "loss";
  note: string;
  loot: string | null;
}

export interface HuntRewardSummary {
  elapsedSeconds: number;
  encountersResolved: number;
  successes: number;
  failures: number;
}

export interface HuntReward {
  currency: number;
  experience: number;
  petExperience: number;
  items: HuntRewardItem[];
  log: HuntLogEntry[];
  summary: HuntRewardSummary;
}

export const emptyHuntReward: HuntReward = {
  currency: 0,
  experience: 0,
  petExperience: 0,
  items: [],
  log: [],
  summary: {
    elapsedSeconds: 0,
    encountersResolved: 0,
    successes: 0,
    failures: 0,
  },
};
