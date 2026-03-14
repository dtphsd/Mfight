import type { HuntReward } from "@/modules/hunting/model/HuntReward";
import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";

export function recordHuntingToolMastery(profile: HunterProfile, reward: HuntReward): HunterProfile {
  const equippedTool = profile.tool.item;
  if (!equippedTool) {
    return profile;
  }

  const matchingYield = reward.items
    .filter((entry) => equippedTool.targetResourceTags.includes(entry.itemCode))
    .reduce((total, entry) => total + entry.quantity, 0);

  const earnedPoints = Math.max(1, Math.floor(matchingYield / 3));

  return {
    ...profile,
    toolMastery: {
      ...profile.toolMastery,
      [equippedTool.itemCode]: (profile.toolMastery[equippedTool.itemCode] ?? 0) + earnedPoints,
    },
  };
}
