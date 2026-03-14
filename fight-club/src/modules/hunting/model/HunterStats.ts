export interface HunterStats {
  power: number;
  speed: number;
  survival: number;
  fortune: number;
}

export type HunterStatName = keyof HunterStats;

export const defaultHunterStats: HunterStats = {
  power: 2,
  speed: 2,
  survival: 2,
  fortune: 2,
};

export const zeroHunterStats: HunterStats = {
  power: 0,
  speed: 0,
  survival: 0,
  fortune: 0,
};
