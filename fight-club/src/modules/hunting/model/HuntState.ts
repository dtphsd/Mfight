import type { HuntReward } from "@/modules/hunting/model/HuntReward";

export type HuntStatus = "idle" | "hunting" | "completed" | "claimable";

export interface HuntState {
  status: HuntStatus;
  zoneId: string | null;
  startedAt: number | null;
  lastResolvedAt: number | null;
  durationMs: number;
  encountersResolved: number;
  successCount: number;
  failureCount: number;
  pendingReward: HuntReward;
}

export const createIdleHuntState = (): HuntState => ({
  status: "idle",
  zoneId: null,
  startedAt: null,
  lastResolvedAt: null,
  durationMs: 0,
  encountersResolved: 0,
  successCount: 0,
  failureCount: 0,
  pendingReward: {
    currency: 0,
    experience: 0,
    petExperience: 0,
    items: [],
    summary: {
      elapsedSeconds: 0,
      encountersResolved: 0,
      successes: 0,
      failures: 0,
    },
  },
});
