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

describe("online duel live scenario matrix", () => {
  const harness = createOnlineDuelLiveHarness();

  afterEach(async () => {
    await harness.closeAll();
  });

  it("advances a basic round and keeps both live clients on the same next planning step", async () => {
    const context = await harness.createLiveDuel(
      createPresetFighter("sword-bleed", "Basic Host"),
      createPresetFighter("dagger-crit", "Basic Guest")
    );

    await harness.readyBoth(context);

    const result = await harness.playRound(context, {
      host: createBasicSelection("head", ["chest", "belly"]),
      guest: createBasicSelection("legs", ["head", "waist"]),
    });

    expect(result.host?.status).toBe("planning");
    expect(result.guest?.status).toBe("planning");
    expect(result.host?.round).toBe(2);
    expect(result.guest?.round).toBe(2);
    expect(result.host?.revision).toBe(result.guest?.revision);

    context.hostStream.close();
    context.guestStream.close();
  }, 20_000);

  it("handles real preset consumables and a later skill attack across two live clients", async () => {
    const context = await harness.createLiveDuel(
      createPresetFighter("shield-guard", "Skill Host"),
      createPresetFighter("heavy-two-hand", "Skill Guest")
    );

    await harness.readyBoth(context);

    const hostBandageBefore = quantityForItem(context.hostClient.getLastSync(), "bandage");
    expect(hostBandageBefore).toBeGreaterThan(0);

    for (let index = 0; index < 3; index += 1) {
      await harness.playRound(context, {
        host: createConsumableSelection("bandage", "with_attack", "head", ["chest", "belly"]),
        guest: createBasicSelection("waist", ["head", "legs"]),
      });
    }

    const hostBandageAfter = quantityForItem(context.hostClient.getLastSync(), "bandage");
    expect(hostBandageAfter).toBe(hostBandageBefore - 3);

    const hostGuardBeforeSkill = combatantResource(context.hostClient.getLastSync(), "guard") ?? 0;
    expect(hostGuardBeforeSkill).toBeGreaterThanOrEqual(16);

    await harness.playRound(context, {
      host: createSkillSelection("shield-bash", "head", ["chest", "belly"]),
      guest: createBasicSelection("waist", ["head", "legs"]),
    });

    const hostAfterSkill = context.hostClient.getLastSync();
    const guestAfterSkill = context.guestClient.getLastSync();
    const latestSkillLog = latestRoundLogEntries(hostAfterSkill);
    expect(latestSkillLog.some((entry) => entry.attackerName === "Skill Host" && entry.skillName === "Shield Bash")).toBe(
      true
    );
    expect(combatantResource(hostAfterSkill, "guard") ?? 0).toBeLessThanOrEqual(hostGuardBeforeSkill);
    expect(hostAfterSkill?.lastResolvedRound?.round).toBe(guestAfterSkill?.lastResolvedRound?.round);
    expect(hostAfterSkill?.lastResolvedRound?.entries.length).toBeGreaterThan(0);

    context.hostStream.close();
    context.guestStream.close();
  }, 20_000);

  it("keeps winner and rematch reset in sync across both live clients", async () => {
    const context = await harness.createLiveDuel(
      createPresetFighter("heavy-two-hand", "Rematch Host", { maxHp: 5 }),
      createPresetFighter("dagger-crit", "Rematch Guest", { maxHp: 5 })
    );

    await harness.readyBoth(context);

    const finished = await harness.playRound(context, {
      host: createBasicSelection("head", ["chest", "belly"]),
      guest: createBasicSelection("head", ["chest", "belly"]),
    });

    expect(finished.host?.status).toBe("finished");
    expect(finished.guest?.status).toBe("finished");
    expect(finished.host?.winnerSeat).toBe(finished.guest?.winnerSeat);
    expect(finished.host?.lastResolvedRound?.winnerSeat).toBe(finished.guest?.lastResolvedRound?.winnerSeat);
    expect(finished.host?.lastResolvedRound?.combatants).toEqual(finished.guest?.lastResolvedRound?.combatants);

    await context.hostClient.requestRematch(context.duelId);

    const [hostReset, guestReset] = await Promise.all([
      (async () => {
        while (context.hostClient.getLastSync()?.status !== "lobby" || context.hostClient.getLastSync()?.round !== 1) {
          context.hostClient.acceptServerMessage((await context.hostStream.readMessage()).message);
        }
        return context.hostClient.getLastSync();
      })(),
      (async () => {
        while (context.guestClient.getLastSync()?.status !== "lobby" || context.guestClient.getLastSync()?.round !== 1) {
          context.guestClient.acceptServerMessage((await context.guestStream.readMessage()).message);
        }
        return context.guestClient.getLastSync();
      })(),
    ]);

    expect(hostReset?.status).toBe("lobby");
    expect(guestReset?.status).toBe("lobby");
    expect(hostReset?.winnerSeat).toBeNull();
    expect(guestReset?.winnerSeat).toBeNull();

    context.hostStream.close();
    context.guestStream.close();
  }, 20_000);
});
