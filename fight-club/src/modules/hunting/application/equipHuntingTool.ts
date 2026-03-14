import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import type { HuntingToolItem } from "@/modules/hunting/model/HuntingTool";

export type EquipHuntingToolResult =
  | { success: true; data: HunterProfile }
  | { success: false; reason: "tool_missing" };

export function equipHuntingTool(profile: HunterProfile, tool: HuntingToolItem | null | undefined): EquipHuntingToolResult {
  if (!tool) {
    return {
      success: false,
      reason: "tool_missing",
    };
  }

  return {
    success: true,
    data: {
      ...profile,
      tool: {
        slot: "kit",
        item: tool,
      },
    },
  };
}
