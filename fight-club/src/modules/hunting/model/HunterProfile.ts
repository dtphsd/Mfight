import { createId } from "@/core/ids/createId";
import { createEmptyHuntingGearLoadout, type EquippedHuntingGear } from "@/modules/hunting/model/HuntingGear";
import { defaultHunterStats, type HunterStats } from "@/modules/hunting/model/HunterStats";
import { createEmptyHuntingToolLoadout, type EquippedHuntingTool } from "@/modules/hunting/model/HuntingTool";

export interface HunterProfile {
  id: string;
  name: string;
  level: number;
  totalExperience: number;
  levelProgress: number;
  levelStep: number;
  unspentStatPoints: number;
  stats: HunterStats;
  gear: EquippedHuntingGear[];
  tool: EquippedHuntingTool;
  activePetId: string | null;
  unlockedZoneIds: string[];
}

export function createHunterProfile(name: string): HunterProfile {
  return {
    id: createId("hunter"),
    name,
    level: 1,
    totalExperience: 0,
    levelProgress: 0,
    levelStep: 0,
    unspentStatPoints: 4,
    stats: defaultHunterStats,
    gear: createEmptyHuntingGearLoadout(),
    tool: createEmptyHuntingToolLoadout(),
    activePetId: null,
    unlockedZoneIds: ["forest-edge"],
  };
}
