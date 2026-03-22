import type { CombatAgentProfile } from "./combatAgentData";

interface ProgressionTier {
  startLevel: number;
  startXp: number;
  nextStartXp: number;
}

export interface AgentProgressionSnapshot {
  level: number;
  rank: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
}

const MAX_LEVEL = 100;
const DEFAULT_FINAL_TIER_END_XP = 2001;

const PROGRESSION_TIERS: ProgressionTier[] = [
  { startLevel: 1, startXp: 0, nextStartXp: 51 },
  { startLevel: 11, startXp: 51, nextStartXp: 121 },
  { startLevel: 21, startXp: 121, nextStartXp: 221 },
  { startLevel: 31, startXp: 221, nextStartXp: 351 },
  { startLevel: 41, startXp: 351, nextStartXp: 501 },
  { startLevel: 51, startXp: 501, nextStartXp: 701 },
  { startLevel: 61, startXp: 701, nextStartXp: 951 },
  { startLevel: 71, startXp: 951, nextStartXp: 1251 },
  { startLevel: 81, startXp: 1251, nextStartXp: 1601 },
  { startLevel: 91, startXp: 1601, nextStartXp: DEFAULT_FINAL_TIER_END_XP },
];

function clampTotalXp(totalXp: number) {
  if (!Number.isFinite(totalXp)) {
    return 0;
  }

  return Math.max(0, Math.floor(totalXp));
}

function getTierIndex(totalXp: number) {
  for (let index = PROGRESSION_TIERS.length - 1; index >= 0; index -= 1) {
    if (totalXp >= PROGRESSION_TIERS[index].startXp) {
      return index;
    }
  }

  return 0;
}

function getLevelThreshold(tier: ProgressionTier, step: number) {
  const clampedStep = Math.max(0, Math.min(10, step));
  const tierSpan = tier.nextStartXp - tier.startXp;
  return Math.floor(tier.startXp + (tierSpan * clampedStep) / 10);
}

function resolveRank(level: number, journalRank: string, baseProfile: CombatAgentProfile) {
  const normalizedRank = journalRank.trim();

  if (normalizedRank && normalizedRank.toLowerCase() !== "initiate") {
    return normalizedRank;
  }

  return level >= baseProfile.level ? baseProfile.rank : normalizedRank || baseProfile.rank;
}

export function deriveAgentProgression(
  totalXp: number,
  journalRank: string,
  baseProfile: CombatAgentProfile
): AgentProgressionSnapshot {
  const safeTotalXp = clampTotalXp(totalXp);
  const tier = PROGRESSION_TIERS[getTierIndex(safeTotalXp)];

  let level = tier.startLevel;

  for (let offset = 1; offset <= 10; offset += 1) {
    if (safeTotalXp >= getLevelThreshold(tier, offset)) {
      level = Math.min(MAX_LEVEL, tier.startLevel + offset);
      continue;
    }

    break;
  }

  const tierOffset = Math.max(0, Math.min(9, level - tier.startLevel));
  const currentLevelXp = getLevelThreshold(tier, tierOffset);
  const nextLevelXp =
    level >= MAX_LEVEL ? currentLevelXp : getLevelThreshold(tier, Math.min(10, tierOffset + 1));
  const xpSpan = Math.max(1, nextLevelXp - currentLevelXp);
  const xpIntoLevel = Math.max(0, safeTotalXp - currentLevelXp);
  const xpToNextLevel = level >= MAX_LEVEL ? 0 : Math.max(0, nextLevelXp - safeTotalXp);
  const progressPercent =
    level >= MAX_LEVEL
      ? 100
      : Math.max(0, Math.min(100, Math.round(((safeTotalXp - currentLevelXp) / xpSpan) * 100)));

  return {
    level,
    rank: resolveRank(level, journalRank, baseProfile),
    totalXp: safeTotalXp,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpForNextLevel: xpSpan,
    xpToNextLevel,
    progressPercent,
  };
}
