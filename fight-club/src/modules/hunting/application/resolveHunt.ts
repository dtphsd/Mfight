import { emptyHuntReward, type HuntReward } from "@/modules/hunting/model/HuntReward";
import type { HuntState } from "@/modules/hunting/model/HuntState";
import { getEquippedHuntingGearBonuses } from "@/modules/hunting/model/HuntingGear";
import type { HunterProfile } from "@/modules/hunting/model/HunterProfile";
import { zeroHuntingPetTraits, type HuntingPet } from "@/modules/hunting/model/HuntingPet";
import { getEquippedHuntingToolBonuses } from "@/modules/hunting/model/HuntingTool";
import type { HuntingZone } from "@/modules/hunting/model/HuntingZone";

export type ResolveHuntFailureReason = "hunt_not_active" | "zone_mismatch";

export type ResolveHuntResult =
  | { success: true; data: HuntState }
  | { success: false; reason: ResolveHuntFailureReason };

export interface ResolveHuntInput {
  profile: HunterProfile;
  huntState: HuntState;
  zone: HuntingZone;
  pets?: HuntingPet[];
  resolvedAt?: number;
}

export function resolveHunt(input: ResolveHuntInput): ResolveHuntResult {
  if (input.huntState.status !== "hunting" || input.huntState.startedAt === null) {
    return {
      success: false,
      reason: "hunt_not_active",
    };
  }

  if (input.huntState.zoneId !== input.zone.id) {
    return {
      success: false,
      reason: "zone_mismatch",
    };
  }

  const startedAt = input.huntState.startedAt;
  const resolvedAt = input.resolvedAt ?? Date.now();
  const elapsedMs = Math.max(0, Math.min(resolvedAt - startedAt, input.huntState.durationMs));
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const gearBonuses = getEquippedHuntingGearBonuses(input.profile.gear);
  const toolBonuses = getEquippedHuntingToolBonuses(input.profile.tool);
  const activePet = input.pets?.find((pet) => pet.id === input.profile.activePetId) ?? null;
  const petTraits = activePet?.traits ?? zeroHuntingPetTraits;
  const encounterIntervalSeconds = Math.max(
    20,
    Math.floor(
      (45 - input.profile.stats.speed * 2 - input.zone.dangerRating * 3) /
        (1 + (gearBonuses.huntSpeedPercent + petTraits.huntSpeedPercent + toolBonuses.huntSpeedPercent) / 100)
    )
  );
  const encountersResolved = Math.floor(elapsedSeconds / encounterIntervalSeconds);
  const survivalScore =
    (input.profile.stats.survival + gearBonuses.survivalFlat) *
    (1 + (gearBonuses.survivalPercent + petTraits.survivalPercent) / 100);
  const successRate = clampSuccessRate(
    0.58 +
      input.profile.stats.power * 0.035 +
      input.profile.stats.speed * 0.02 +
      survivalScore * 0.025 -
      input.zone.dangerRating * 0.09
  );
  const successCount = Math.min(encountersResolved, Math.round(encountersResolved * successRate));
  const failureCount = Math.max(0, encountersResolved - successCount);
  const pendingReward = buildHuntReward({
    profile: input.profile,
    gearBonuses,
    toolBonuses,
    petTraits,
    zone: input.zone,
    elapsedSeconds,
    encountersResolved,
    successCount,
    failureCount,
  });

  return {
    success: true,
    data: {
      ...input.huntState,
      status: "claimable",
      lastResolvedAt: resolvedAt,
      encountersResolved,
      successCount,
      failureCount,
      pendingReward,
    },
  };
}

function buildHuntReward(input: {
  profile: HunterProfile;
  gearBonuses: ReturnType<typeof getEquippedHuntingGearBonuses>;
  toolBonuses: ReturnType<typeof getEquippedHuntingToolBonuses>;
  petTraits: typeof zeroHuntingPetTraits;
  zone: HuntingZone;
  elapsedSeconds: number;
  encountersResolved: number;
  successCount: number;
  failureCount: number;
}): HuntReward {
  if (input.encountersResolved === 0) {
    return {
      ...emptyHuntReward,
      summary: {
        elapsedSeconds: input.elapsedSeconds,
        encountersResolved: 0,
        successes: 0,
        failures: 0,
      },
    };
  }

  const currency =
    Math.floor(
      input.successCount * input.zone.baseCurrencyReward * (1 + input.gearBonuses.lootQuantityPercent / 100)
    ) +
    input.profile.stats.fortune * Math.max(1, input.successCount);
  const experience = input.successCount * (6 + input.zone.dangerRating * 4);
  const petExperience = Math.floor(experience / 2);
  const rewardQuantityMultiplier =
    1 + (input.gearBonuses.lootQuantityPercent + input.petTraits.rewardQuantityPercent + input.toolBonuses.rewardQuantityPercent) / 100;
  const bonusRareDrops = Math.floor(
    (input.successCount * (input.gearBonuses.rareDropPercent + input.petTraits.rareDropPercent + input.toolBonuses.rareDropPercent)) / 100
  );
  const items = input.zone.resourceTags
    .map((tag, index) => ({
      itemCode: tag,
      quantity: Math.max(
        0,
        Math.floor(
          ((Math.floor(input.successCount / (index + 1)) + Math.floor(input.profile.stats.fortune / 3) - index) *
            rewardQuantityMultiplier) *
            getTargetedYieldMultiplier(tag, input.profile)
        ) +
          (index === input.zone.resourceTags.length - 1 ? bonusRareDrops : 0)
      ),
    }))
    .filter((entry) => entry.quantity > 0);

  return {
    currency,
    experience,
    petExperience,
    items,
    summary: {
      elapsedSeconds: input.elapsedSeconds,
      encountersResolved: input.encountersResolved,
      successes: input.successCount,
      failures: input.failureCount,
    },
  };
}

function clampSuccessRate(value: number) {
  return Math.max(0.2, Math.min(0.95, value));
}

function getTargetedYieldMultiplier(tag: string, profile: HunterProfile) {
  if (!profile.tool.item?.targetResourceTags.includes(tag)) {
    return 1;
  }

  return 1 + profile.tool.item.bonuses.targetedYieldPercent / 100;
}
