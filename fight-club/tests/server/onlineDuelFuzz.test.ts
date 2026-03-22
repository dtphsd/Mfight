// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import { getEquipmentBonuses } from "@/modules/equipment";
import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";
import type {
  OnlineDuelActionSelection,
  OnlineDuelParticipantLoadout,
  OnlineDuelStateSync,
} from "@/modules/arena";
import type { CombatIntent, CombatState, CombatZone } from "@/modules/combat";
import { createOnlineDuelLiveHarness, createPresetFighter, latestRoundLogEntries } from "./support/onlineDuelLiveHarness";

const intents: CombatIntent[] = ["neutral", "aggressive", "guarded", "precise"];
const zones: CombatZone[] = ["head", "chest", "belly", "waist", "legs"];
const seeds = [11, 23, 37, 51, 73, 101];

describe("online duel live fuzz", () => {
  const harness = createOnlineDuelLiveHarness();

  afterEach(async () => {
    await harness.closeAll();
  });

  it.each(seeds)("stays synchronized across randomized live duel flow (seed %s)", async (seed) => {
    const hostPreset = combatBuildPresets[seed % combatBuildPresets.length];
    const guestPreset = combatBuildPresets[(seed * 3 + 1) % combatBuildPresets.length];
    const context = await harness.createLiveDuel(
      createPresetFighter(hostPreset.id, `Fuzz Host ${hostPreset.id}`),
      createPresetFighter(guestPreset.id, `Fuzz Guest ${guestPreset.id}`),
      { seed }
    );
    const random = createDeterministicRandom(seed);

    await harness.readyBoth(context);

    for (let roundIndex = 0; roundIndex < 12; roundIndex += 1) {
      const hostBefore = context.hostClient.getLastSync();
      const guestBefore = context.guestClient.getLastSync();

      const result = await harness.playRound(context, {
        host: createRandomValidSelection(hostBefore, random),
        guest: createRandomValidSelection(guestBefore, random),
      });

      expect(result.host?.revision).toBe(result.guest?.revision);
      expect(result.host?.round).toBe(result.guest?.round);
      expect(result.host?.winnerSeat).toBe(result.guest?.winnerSeat);
      expect(result.host?.status).toBe(result.guest?.status);
      expect(result.host?.lastResolvedRound?.round).toBe(result.guest?.lastResolvedRound?.round);
      expect(result.host?.lastResolvedRound?.combatants).toEqual(result.guest?.lastResolvedRound?.combatants);
      expect(result.hostEvents.some((event) => event.message.type === "duel_error")).toBe(false);
      expect(result.guestEvents.some((event) => event.message.type === "duel_error")).toBe(false);

      const hostLog = latestRoundLogEntries(result.host);
      const guestLog = latestRoundLogEntries(result.guest);
      expect(hostLog.length).toBeGreaterThan(0);
      expect(guestLog.length).toBeGreaterThan(0);

      if (result.host?.status === "planning") {
        expect(result.host.currentRoundState?.submittedSeats ?? []).toEqual([]);
      }
      if (result.guest?.status === "planning") {
        expect(result.guest.currentRoundState?.submittedSeats ?? []).toEqual([]);
      }

      if (result.host?.status === "finished" || result.guest?.status === "finished") {
        break;
      }
    }

    const hostFinal = context.hostClient.getLastSync();
    const guestFinal = context.guestClient.getLastSync();

    expect(hostFinal?.revision).toBe(guestFinal?.revision);
    expect(hostFinal?.winnerSeat).toBe(guestFinal?.winnerSeat);
    expect(hostFinal?.status).toBe(guestFinal?.status);
    expect(hostFinal?.lastResolvedRound?.round).toBe(guestFinal?.lastResolvedRound?.round);

    context.hostStream.close();
    context.guestStream.close();
  }, 40_000);
});

function createRandomValidSelection(
  sync: OnlineDuelStateSync | null,
  random: () => number
): OnlineDuelActionSelection {
  const attackZone = pickOne(zones, random);
  const defenseZones = pickDistinctZones(random);
  const intent = pickOne(intents, random);
  const selectedAction = pickRandomAction(sync, random);

  return {
    attackZone,
    defenseZones,
    intent,
    selectedAction,
  };
}

function pickRandomAction(sync: OnlineDuelStateSync | null, random: () => number): OnlineDuelActionSelection["selectedAction"] {
  const loadout = sync?.yourLoadout;
  const combatantId = sync?.yourSnapshot?.characterId;
  const combatant = sync?.combatState?.combatants.find((entry) => entry.id === combatantId);

  const validSkillIds = resolveValidSkillIds(loadout, combatant);
  const validConsumables =
    loadout?.inventory.entries
      .filter((entry) => entry.item.consumableEffect && entry.quantity > 0)
      .map((entry) => ({
        consumableCode: entry.item.code,
        usageMode: entry.item.consumableEffect!.usageMode,
      })) ?? [];

  const actionPool: OnlineDuelActionSelection["selectedAction"][] = [{ kind: "basic_attack" }];

  for (const skillId of validSkillIds) {
    actionPool.push({ kind: "skill_attack", skillId });
  }

  for (const consumable of validConsumables) {
    actionPool.push({
      kind: "consumable",
      consumableCode: consumable.consumableCode,
      usageMode: consumable.usageMode,
    });
  }

  return pickOne(actionPool, random);
}

function resolveValidSkillIds(
  loadout: OnlineDuelParticipantLoadout | undefined,
  combatant: CombatState["combatants"][number] | undefined
) {
  if (!loadout || !combatant) {
    return [];
  }

  const bonuses = getEquipmentBonuses(loadout.equipmentState, loadout.inventory);
  return bonuses.skills
    .filter((skill) => loadout.equippedSkillIds.includes(skill.id))
    .filter((skill) => combatant.resources[skill.resourceType] >= skill.cost)
    .filter((skill) => (combatant.skillCooldowns?.[skill.id] ?? 0) <= 0)
    .map((skill) => skill.id);
}

function pickDistinctZones(random: () => number): [CombatZone, CombatZone] {
  const first = pickOne(zones, random);
  let second = pickOne(zones, random);
  while (second === first) {
    second = pickOne(zones, random);
  }

  return [first, second];
}

function pickOne<TValue>(values: TValue[], random: () => number): TValue {
  return values[Math.floor(random() * values.length)] ?? values[0];
}

function createDeterministicRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
