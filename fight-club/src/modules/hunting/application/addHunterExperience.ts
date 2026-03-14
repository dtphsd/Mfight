import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";

export type HunterProgressionFailureReason = "invalid_experience_amount" | "missing_level_curve";

export type HunterProgressionResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: HunterProgressionFailureReason };

const hunterLevelCurves = [
  { level: 1, steps: [25, 40, 65] as const },
  { level: 2, steps: [40, 60, 90] as const },
  { level: 3, steps: [55, 80, 120] as const },
  { level: 4, steps: [75, 105, 150] as const },
  { level: 5, steps: [95, 130, 180] as const },
  { level: 6, steps: [120, 160, 220] as const },
];

const hunterStepPointReward = 1;
const hunterLevelPointReward = 2;

export function addHunterExperience(profile: HunterProfile, amount: number): HunterProgressionResult {
  if (amount <= 0) {
    return {
      success: false,
      reason: "invalid_experience_amount",
    };
  }

  let nextProfile: HunterProfile = {
    ...profile,
    totalExperience: profile.totalExperience + amount,
    levelProgress: profile.levelProgress + amount,
  };

  while (true) {
    const curve = hunterLevelCurves.find((entry) => entry.level === nextProfile.level);
    if (!curve) {
      return {
        success: false,
        reason: "missing_level_curve",
      };
    }

    const currentStepCost = curve.steps[nextProfile.levelStep];
    if (currentStepCost === undefined || nextProfile.levelProgress < currentStepCost) {
      break;
    }

    nextProfile = {
      ...nextProfile,
      levelProgress: nextProfile.levelProgress - currentStepCost,
      levelStep: nextProfile.levelStep + 1,
      unspentStatPoints: nextProfile.unspentStatPoints + hunterStepPointReward,
    };

    if (nextProfile.levelStep === curve.steps.length) {
      const nextLevel = nextProfile.level + 1;

      nextProfile = {
        ...nextProfile,
        level: nextLevel,
        levelStep: 0,
        unspentStatPoints: nextProfile.unspentStatPoints + hunterLevelPointReward,
        unlockedZoneIds: unlockHunterZones(nextLevel, nextProfile.unlockedZoneIds),
      };
    }
  }

  return {
    success: true,
    data: nextProfile,
  };
}

function unlockHunterZones(level: number, unlockedZoneIds: string[]) {
  const nextUnlocked = new Set(unlockedZoneIds);

  if (level >= 3) {
    nextUnlocked.add("rocky-hills");
  }

  if (level >= 6) {
    nextUnlocked.add("ruined-trail");
  }

  return [...nextUnlocked];
}
