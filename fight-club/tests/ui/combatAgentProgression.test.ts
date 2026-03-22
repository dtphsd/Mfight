import { describe, expect, it } from "vitest";
import {
  backendAgentProfile,
  combatAgentProfile,
  uiAgentProfile,
} from "@/ui/screens/CombatAgent/combatAgentData";
import { deriveAgentProgression } from "@/ui/screens/CombatAgent/combatAgentProgression";

describe("deriveAgentProgression", () => {
  it("promotes combat master out of level 1 when total xp approaches the first tier cap", () => {
    const snapshot = deriveAgentProgression(48, "Initiate", combatAgentProfile);

    expect(snapshot.level).toBe(10);
    expect(snapshot.rank).toBe("Initiate");
    expect(snapshot.nextLevelXp).toBe(51);
    expect(snapshot.xpIntoLevel).toBe(3);
    expect(snapshot.xpForNextLevel).toBe(6);
    expect(snapshot.xpToNextLevel).toBe(3);
    expect(snapshot.progressPercent).toBeGreaterThan(0);
  });

  it("promotes UI master beyond level 1 and restores its specialist rank from total xp", () => {
    const snapshot = deriveAgentProgression(80, "Initiate", uiAgentProfile);

    expect(snapshot.level).toBe(15);
    expect(snapshot.rank).toBe("Curator");
    expect(snapshot.nextLevelXp).toBe(86);
    expect(snapshot.xpIntoLevel).toBe(1);
    expect(snapshot.xpForNextLevel).toBe(7);
    expect(snapshot.xpToNextLevel).toBe(6);
  });

  it("promotes backend master using the same 100-level progression", () => {
    const snapshot = deriveAgentProgression(99, "Initiate", backendAgentProfile);

    expect(snapshot.level).toBe(17);
    expect(snapshot.rank).toBe("Planner");
    expect(snapshot.nextLevelXp).toBe(100);
    expect(snapshot.xpIntoLevel).toBe(6);
    expect(snapshot.xpForNextLevel).toBe(7);
    expect(snapshot.xpToNextLevel).toBe(1);
  });

  it("caps progression at level 100", () => {
    const snapshot = deriveAgentProgression(5000, "Legend", combatAgentProfile);

    expect(snapshot.level).toBe(100);
    expect(snapshot.progressPercent).toBe(100);
    expect(snapshot.rank).toBe("Legend");
    expect(snapshot.xpToNextLevel).toBe(0);
  });
});
