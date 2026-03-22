// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";
import {
  createBasicSelection,
  createOnlineDuelLiveHarness,
  createPresetFighter,
} from "./support/onlineDuelLiveHarness";

const matchups = combatBuildPresets.flatMap((hostPreset) =>
  combatBuildPresets.map((guestPreset) => ({
    hostPresetId: hostPreset.id,
    guestPresetId: guestPreset.id,
    label: `${hostPreset.id} vs ${guestPreset.id}`,
  }))
);

describe("online duel preset matchup smoke", () => {
  const harness = createOnlineDuelLiveHarness();

  afterEach(async () => {
    await harness.closeAll();
  });

  it.each(matchups)("resolves the first live round for %s", async ({ hostPresetId, guestPresetId }) => {
    const context = await harness.createLiveDuel(
      createPresetFighter(hostPresetId, `Host ${hostPresetId}`),
      createPresetFighter(guestPresetId, `Guest ${guestPresetId}`)
    );

    await harness.readyBoth(context);

    const result = await harness.playRound(context, {
      host: createBasicSelection("head", ["chest", "belly"]),
      guest: createBasicSelection("waist", ["head", "legs"]),
    });

    expect(result.host?.lastResolvedRound?.round).toBe(1);
    expect(result.guest?.lastResolvedRound?.round).toBe(1);
    expect(result.host?.status).toBe("planning");
    expect(result.guest?.status).toBe("planning");
    expect(result.host?.round).toBe(2);
    expect(result.guest?.round).toBe(2);
    expect(result.host?.currentRoundState?.submittedSeats ?? []).toEqual([]);
    expect(result.guest?.currentRoundState?.submittedSeats ?? []).toEqual([]);
    expect(result.hostEvents.some((event) => event.message.type === "duel_error")).toBe(false);
    expect(result.guestEvents.some((event) => event.message.type === "duel_error")).toBe(false);

    context.hostStream.close();
    context.guestStream.close();
  }, 20_000);
});
