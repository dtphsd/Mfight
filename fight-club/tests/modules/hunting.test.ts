import {
  addHunterExperience,
  addHuntingPetExperience,
  allocateHunterStatPoint,
  assignPetToHunter,
  claimHuntRewards,
  createIdleHuntState,
  createHunterProfile,
  equipHuntingGear,
  setHuntingRouteStance,
  equipHuntingTool,
  recordHuntingToolMastery,
  resolveHunt,
  startHunt,
} from "@/modules/hunting";
import { huntingGearCatalog } from "@/content/hunting/gear";
import { huntingPetCatalog } from "@/content/hunting/pets";
import { huntingToolCatalog } from "@/content/hunting/tools";
import { createInventory } from "@/modules/inventory";
import { getItemQuantity } from "@/modules/inventory/application/getItemQuantity";
import { huntingZones } from "@/content/hunting/zones";

describe("hunting module", () => {
  it("starts a hunt for an unlocked zone", () => {
    const profile = createHunterProfile("Scout");
    const state = createIdleHuntState();
    const result = startHunt({
      profile,
      currentState: state,
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.status).toBe("hunting");
    expect(result.data.zoneId).toBe("forest-edge");
    expect(result.data.startedAt).toBe(1_000);
    expect(result.data.durationMs).toBe(15 * 60 * 1000);
  });

  it("rejects a hunt for a locked zone", () => {
    const profile = createHunterProfile("Scout");
    const state = createIdleHuntState();
    const result = startHunt({
      profile,
      currentState: state,
      zone: huntingZones[1],
      startedAt: 1_000,
    });

    expect(result).toEqual({
      success: false,
      reason: "zone_locked",
    });
  });

  it("resolves a finished hunt into claimable rewards", () => {
    const profile = createHunterProfile("Scout");
    const started = startHunt({
      profile,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(started.success).toBe(true);
    if (!started.success) {
      return;
    }

    const resolved = resolveHunt({
      profile,
      huntState: started.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    expect(resolved.data.status).toBe("claimable");
    expect(resolved.data.encountersResolved).toBeGreaterThan(0);
    expect(resolved.data.successCount).toBeGreaterThan(0);
    expect(resolved.data.pendingReward.currency).toBeGreaterThan(0);
    expect(resolved.data.pendingReward.experience).toBeGreaterThan(0);
    expect(resolved.data.pendingReward.log.length).toBeGreaterThan(0);
    expect(resolved.data.pendingReward.summary.elapsedSeconds).toBe(15 * 60);
  });

  it("claims hunting rewards into the shared inventory and resets the hunt state", () => {
    const profile = createHunterProfile("Scout");
    const started = startHunt({
      profile,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(started.success).toBe(true);
    if (!started.success) {
      return;
    }

    const resolved = resolveHunt({
      profile,
      huntState: started.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const claimed = claimHuntRewards(createInventory(), resolved.data);

    expect(claimed.success).toBe(true);
    if (!claimed.success) {
      return;
    }

    expect(claimed.data.huntState.status).toBe("idle");
    expect(claimed.data.claimedCurrency).toBeGreaterThan(0);
    expect(claimed.data.claimedExperience).toBeGreaterThan(0);
    expect(getItemQuantity(claimed.data.inventory, "wood")).toBeGreaterThan(0);
  });

  it("levels a hunter up and unlocks the next zone through hunting experience", () => {
    const profile = createHunterProfile("Scout");
    const leveled = addHunterExperience(profile, 320);

    expect(leveled.success).toBe(true);
    if (!leveled.success) {
      return;
    }

    expect(leveled.data.level).toBeGreaterThanOrEqual(3);
    expect(leveled.data.unspentStatPoints).toBeGreaterThan(profile.unspentStatPoints);
    expect(leveled.data.unlockedZoneIds).toContain("rocky-hills");
  });

  it("spends hunter stat points on hunting-specific stats", () => {
    const profile = createHunterProfile("Scout");
    const allocated = allocateHunterStatPoint(profile, "fortune", 2);

    expect(allocated.success).toBe(true);
    if (!allocated.success) {
      return;
    }

    expect(allocated.data.stats.fortune).toBe(profile.stats.fortune + 2);
    expect(allocated.data.unspentStatPoints).toBe(profile.unspentStatPoints - 2);
  });

  it("uses equipped hunting gear and active pet traits to improve hunt outcomes", () => {
    const baseProfile = createHunterProfile("Scout");
    const baseStarted = startHunt({
      profile: baseProfile,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(baseStarted.success).toBe(true);
    if (!baseStarted.success) {
      return;
    }

    const baseResolved = resolveHunt({
      profile: baseProfile,
      huntState: baseStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
      pets: huntingPetCatalog,
    });

    expect(baseResolved.success).toBe(true);
    if (!baseResolved.success) {
      return;
    }

    const withWeapon = equipHuntingGear(baseProfile, huntingGearCatalog[0]);
    expect(withWeapon.success).toBe(true);
    if (!withWeapon.success) {
      return;
    }

    const withGloves = equipHuntingGear(withWeapon.data, huntingGearCatalog[3]);
    expect(withGloves.success).toBe(true);
    if (!withGloves.success) {
      return;
    }

    const withCharm = equipHuntingGear(withGloves.data, huntingGearCatalog[4]);
    expect(withCharm.success).toBe(true);
    if (!withCharm.success) {
      return;
    }

    const withPet = assignPetToHunter(withCharm.data, huntingPetCatalog, "pet-lynx-shadow");
    expect(withPet.success).toBe(true);
    if (!withPet.success) {
      return;
    }

    const boostedStarted = startHunt({
      profile: withPet.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(boostedStarted.success).toBe(true);
    if (!boostedStarted.success) {
      return;
    }

    const boostedResolved = resolveHunt({
      profile: withPet.data,
      huntState: boostedStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
      pets: huntingPetCatalog,
    });

    expect(boostedResolved.success).toBe(true);
    if (!boostedResolved.success) {
      return;
    }

    const baseClaimed = claimHuntRewards(createInventory(), baseResolved.data);
    expect(baseClaimed.success).toBe(true);
    if (!baseClaimed.success) {
      return;
    }

    const boostedClaimed = claimHuntRewards(createInventory(), boostedResolved.data);
    expect(boostedClaimed.success).toBe(true);
    if (!boostedClaimed.success) {
      return;
    }

    expect(boostedResolved.data.encountersResolved).toBeGreaterThan(baseResolved.data.encountersResolved);
    expect(boostedResolved.data.pendingReward.currency).toBeGreaterThan(baseResolved.data.pendingReward.currency);
    expect(getItemQuantity(boostedClaimed.data.inventory, "hide")).toBeGreaterThanOrEqual(
      getItemQuantity(baseClaimed.data.inventory, "hide")
    );
  });

  it("equips a hunting tool and boosts targeted route resources", () => {
    const baseProfile = createHunterProfile("Scout");
    const baseStarted = startHunt({
      profile: baseProfile,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(baseStarted.success).toBe(true);
    if (!baseStarted.success) {
      return;
    }

    const baseResolved = resolveHunt({
      profile: baseProfile,
      huntState: baseStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });

    expect(baseResolved.success).toBe(true);
    if (!baseResolved.success) {
      return;
    }

    const withTool = equipHuntingTool(baseProfile, huntingToolCatalog[0]);
    expect(withTool.success).toBe(true);
    if (!withTool.success) {
      return;
    }

    const boostedStarted = startHunt({
      profile: withTool.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });

    expect(boostedStarted.success).toBe(true);
    if (!boostedStarted.success) {
      return;
    }

    const boostedResolved = resolveHunt({
      profile: withTool.data,
      huntState: boostedStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });

    expect(boostedResolved.success).toBe(true);
    if (!boostedResolved.success) {
      return;
    }

    const baseClaimed = claimHuntRewards(createInventory(), baseResolved.data);
    expect(baseClaimed.success).toBe(true);
    if (!baseClaimed.success) {
      return;
    }

    const boostedClaimed = claimHuntRewards(createInventory(), boostedResolved.data);
    expect(boostedClaimed.success).toBe(true);
    if (!boostedClaimed.success) {
      return;
    }

    expect(getItemQuantity(boostedClaimed.data.inventory, "wood")).toBeGreaterThanOrEqual(
      getItemQuantity(baseClaimed.data.inventory, "wood")
    );
    expect(getItemQuantity(boostedClaimed.data.inventory, "herbs")).toBeGreaterThanOrEqual(
      getItemQuantity(baseClaimed.data.inventory, "herbs")
    );
  });

  it("lets route stance trade safety for heavier payouts", () => {
    const baseProfile = createHunterProfile("Scout");
    const greedyProfileResult = setHuntingRouteStance(baseProfile, "greedy");
    expect(greedyProfileResult.success).toBe(true);
    if (!greedyProfileResult.success) {
      return;
    }

    const cautiousProfileResult = setHuntingRouteStance(baseProfile, "cautious");
    expect(cautiousProfileResult.success).toBe(true);
    if (!cautiousProfileResult.success) {
      return;
    }

    const greedyStarted = startHunt({
      profile: greedyProfileResult.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });
    expect(greedyStarted.success).toBe(true);
    if (!greedyStarted.success) {
      return;
    }

    const cautiousStarted = startHunt({
      profile: cautiousProfileResult.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });
    expect(cautiousStarted.success).toBe(true);
    if (!cautiousStarted.success) {
      return;
    }

    const greedyResolved = resolveHunt({
      profile: greedyProfileResult.data,
      huntState: greedyStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });
    expect(greedyResolved.success).toBe(true);
    if (!greedyResolved.success) {
      return;
    }

    const cautiousResolved = resolveHunt({
      profile: cautiousProfileResult.data,
      huntState: cautiousStarted.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });
    expect(cautiousResolved.success).toBe(true);
    if (!cautiousResolved.success) {
      return;
    }

    expect(greedyResolved.data.successCount).toBeLessThanOrEqual(cautiousResolved.data.successCount);
    expect(greedyResolved.data.pendingReward.currency).toBeGreaterThanOrEqual(cautiousResolved.data.pendingReward.currency);
  });

  it("records mastery progress for the equipped tool after a successful haul", () => {
    const equipped = equipHuntingTool(createHunterProfile("Scout"), huntingToolCatalog[0]);
    expect(equipped.success).toBe(true);
    if (!equipped.success) {
      return;
    }

    const started = startHunt({
      profile: equipped.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });
    expect(started.success).toBe(true);
    if (!started.success) {
      return;
    }

    const resolved = resolveHunt({
      profile: equipped.data,
      huntState: started.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
    });
    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const progressed = recordHuntingToolMastery(equipped.data, resolved.data.pendingReward);

    expect(progressed.toolMastery["forager-satchel"]).toBeGreaterThan(0);
  });

  it("awards pet experience to the active companion after a claim", () => {
    const withPet = assignPetToHunter(createHunterProfile("Scout"), huntingPetCatalog, "pet-wolf-scout");
    expect(withPet.success).toBe(true);
    if (!withPet.success) {
      return;
    }

    const started = startHunt({
      profile: withPet.data,
      currentState: createIdleHuntState(),
      zone: huntingZones[0],
      startedAt: 1_000,
    });
    expect(started.success).toBe(true);
    if (!started.success) {
      return;
    }

    const resolved = resolveHunt({
      profile: withPet.data,
      huntState: started.data,
      zone: huntingZones[0],
      resolvedAt: 1_000 + 15 * 60 * 1000,
      pets: huntingPetCatalog,
    });
    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const petProgressed = addHuntingPetExperience(huntingPetCatalog, withPet.data.activePetId, resolved.data.pendingReward.petExperience);
    expect(petProgressed.success).toBe(true);
    if (!petProgressed.success) {
      return;
    }

    const progressedPet = petProgressed.data.find((pet) => pet.id === "pet-wolf-scout");
    expect(progressedPet?.totalExperience).toBeGreaterThan(0);
  });
});
