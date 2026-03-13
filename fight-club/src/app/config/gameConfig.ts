export const gameConfig = {
  appName: "Fight Club",
  saveVersion: "1.0.0",
  inventoryMaxSize: 20,
  character: {
    initialUnspentStatPoints: 5,
    stepPointReward: 1,
    levelPointReward: 2,
    levelCurves: [
      { level: 1, steps: [30, 45, 75] as const },
      { level: 2, steps: [45, 70, 110] as const },
      { level: 3, steps: [65, 95, 145] as const },
      { level: 4, steps: [90, 130, 190] as const },
      { level: 5, steps: [120, 170, 240] as const },
      { level: 6, steps: [155, 215, 295] as const },
      { level: 7, steps: [195, 265, 360] as const },
      { level: 8, steps: [240, 325, 435] as const },
      { level: 9, steps: [290, 390, 520] as const },
      { level: 10, steps: [345, 460, 615] as const },
    ],
  },
};

export type LevelCurve = (typeof gameConfig.character.levelCurves)[number];
