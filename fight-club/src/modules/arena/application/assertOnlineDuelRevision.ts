import type { OnlineDuelResult } from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export function assertOnlineDuelRevision(
  duel: OnlineDuel,
  expectedRevision?: number
): OnlineDuelResult<OnlineDuel> {
  if (expectedRevision === undefined || expectedRevision === duel.revision) {
    return {
      success: true,
      data: duel,
    };
  }

  return {
    success: false,
    reason: "stale_sync",
  };
}
