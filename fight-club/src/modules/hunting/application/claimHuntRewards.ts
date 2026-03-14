import { getHuntingRewardItem } from "@/content/hunting/rewardItems";
import { addItem, type Inventory } from "@/modules/inventory";
import { createIdleHuntState, type HuntState } from "@/modules/hunting/model/HuntState";

export type ClaimHuntRewardsFailureReason = "hunt_not_claimable" | "unknown_reward_item" | "inventory_full";

export type ClaimHuntRewardsResult =
  | {
      success: true;
      data: {
        inventory: Inventory;
        huntState: HuntState;
        claimedCurrency: number;
        claimedExperience: number;
        claimedPetExperience: number;
      };
    }
  | { success: false; reason: ClaimHuntRewardsFailureReason };

export function claimHuntRewards(inventory: Inventory, huntState: HuntState): ClaimHuntRewardsResult {
  if (huntState.status !== "claimable") {
    return {
      success: false,
      reason: "hunt_not_claimable",
    };
  }

  let nextInventory = inventory;

  for (const rewardItem of huntState.pendingReward.items) {
    const item = getHuntingRewardItem(rewardItem.itemCode);
    if (!item) {
      return {
        success: false,
        reason: "unknown_reward_item",
      };
    }

    const added = addItem(nextInventory, item, rewardItem.quantity);
    if (!added.success) {
      return {
        success: false,
        reason: added.reason === "inventory_full" ? "inventory_full" : "unknown_reward_item",
      };
    }

    nextInventory = added.data;
  }

  return {
    success: true,
    data: {
      inventory: nextInventory,
      huntState: createIdleHuntState(),
      claimedCurrency: huntState.pendingReward.currency,
      claimedExperience: huntState.pendingReward.experience,
      claimedPetExperience: huntState.pendingReward.petExperience,
    },
  };
}
