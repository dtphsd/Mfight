// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import {
  combatantResource,
  createBasicSelection,
  createConsumableSelection,
  createOnlineDuelLiveHarness,
  createPresetFighter,
  createSkillSelection,
  latestRoundLogEntries,
  quantityForItem,
} from "./support/onlineDuelLiveHarness";

describe("online duel live soak", () => {
  const harness = createOnlineDuelLiveHarness();

  afterEach(async () => {
    await harness.closeAll();
  });

  it("stays synchronized across a long mixed-action live duel sequence", async () => {
    const context = await harness.createLiveDuel(
      createPresetFighter("shield-guard", "Soak Host"),
      createPresetFighter("sustain-regen", "Soak Guest")
    );

    await harness.readyBoth(context);

    const hostBandagesBefore = quantityForItem(context.hostClient.getLastSync(), "bandage");
    const guestBandagesBefore = quantityForItem(context.guestClient.getLastSync(), "bandage");

    for (let roundIndex = 0; roundIndex < 8; roundIndex += 1) {
      const hostSync = context.hostClient.getLastSync();
      const guestSync = context.guestClient.getLastSync();

      const hostGuard = combatantResource(hostSync, "guard") ?? 0;
      const guestMomentum = combatantResource(guestSync, "momentum") ?? 0;
      const hostBandagesLeft = quantityForItem(hostSync, "bandage");
      const guestBandagesLeft = quantityForItem(guestSync, "bandage");

      const hostSelection =
        roundIndex === 2 && hostBandagesLeft > 0
          ? createConsumableSelection("bandage", "with_attack", "head", ["chest", "belly"])
          : roundIndex >= 4 && hostGuard >= 16
            ? createSkillSelection("shield-bash", "chest", ["head", "waist"])
            : createBasicSelection(roundIndex % 2 === 0 ? "head" : "waist", ["chest", "belly"]);

      const guestSelection =
        roundIndex === 1 && guestBandagesLeft > 0
          ? createConsumableSelection("bandage", "with_attack", "waist", ["head", "legs"])
          : roundIndex >= 5 && guestMomentum >= 10
            ? createSkillSelection("momentum-battle-scout", "head", ["chest", "belly"])
            : createBasicSelection(roundIndex % 2 === 0 ? "legs" : "head", ["head", "waist"]);

      const roundResult = await harness.playRound(context, {
        host: hostSelection,
        guest: guestSelection,
      });

      expect(roundResult.host?.revision).toBe(roundResult.guest?.revision);
      expect(roundResult.host?.round).toBe(roundResult.guest?.round);
      expect(roundResult.host?.winnerSeat).toBe(roundResult.guest?.winnerSeat);
      expect(roundResult.host?.lastResolvedRound?.round).toBe(roundResult.guest?.lastResolvedRound?.round);
      expect(roundResult.host?.lastResolvedRound?.combatants).toEqual(roundResult.guest?.lastResolvedRound?.combatants);

      const hostLatestLog = latestRoundLogEntries(roundResult.host);
      const guestLatestLog = latestRoundLogEntries(roundResult.guest);
      expect(hostLatestLog.length).toBeGreaterThan(0);
      expect(guestLatestLog.length).toBeGreaterThan(0);

      if (roundResult.host?.status === "finished" || roundResult.guest?.status === "finished") {
        break;
      }
    }

    const hostFinal = context.hostClient.getLastSync();
    const guestFinal = context.guestClient.getLastSync();

    expect(hostFinal?.revision).toBe(guestFinal?.revision);
    expect(hostFinal?.winnerSeat).toBe(guestFinal?.winnerSeat);
    expect(hostFinal?.lastResolvedRound?.round).toBe(guestFinal?.lastResolvedRound?.round);
    expect(quantityForItem(hostFinal, "bandage")).toBeLessThanOrEqual(hostBandagesBefore);
    expect(quantityForItem(guestFinal, "bandage")).toBeLessThanOrEqual(guestBandagesBefore);

    context.hostStream.close();
    context.guestStream.close();
  }, 30_000);
});
