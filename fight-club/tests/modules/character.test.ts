import { addExperience, allocateStatPoint, createCharacter } from "@/modules/character";

describe("character module", () => {
  it("creates a character with 5 starting stat points", () => {
    const result = createCharacter("Fighter");

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.level).toBe(1);
    expect(result.data.totalExperience).toBe(0);
    expect(result.data.levelStep).toBe(0);
    expect(result.data.unspentStatPoints).toBe(5);
    expect(result.data.baseStats.strength).toBe(3);
  });

  it("advances through three asymmetric steps and grants level rewards", () => {
    const created = createCharacter("Fighter");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const progressed = addExperience(created.data, 150);

    expect(progressed.success).toBe(true);
    if (!progressed.success) {
      return;
    }

    expect(progressed.data.totalExperience).toBe(150);
    expect(progressed.data.level).toBe(2);
    expect(progressed.data.levelStep).toBe(0);
    expect(progressed.data.levelProgress).toBe(0);
    expect(progressed.data.unspentStatPoints).toBe(10);
  });

  it("keeps leftover experience after partial progression", () => {
    const created = createCharacter("Fighter");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const progressed = addExperience(created.data, 80);

    expect(progressed.success).toBe(true);
    if (!progressed.success) {
      return;
    }

    expect(progressed.data.level).toBe(1);
    expect(progressed.data.levelStep).toBe(2);
    expect(progressed.data.levelProgress).toBe(5);
    expect(progressed.data.unspentStatPoints).toBe(7);
  });

  it("spends available stat points", () => {
    const created = createCharacter("Fighter");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const allocated = allocateStatPoint(created.data, "strength", 2);

    expect(allocated.success).toBe(true);
    if (!allocated.success) {
      return;
    }

    expect(allocated.data.baseStats.strength).toBe(5);
    expect(allocated.data.unspentStatPoints).toBe(3);
  });

  it("rejects allocation when there are not enough points", () => {
    const created = createCharacter("Fighter");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const allocated = allocateStatPoint(created.data, "strength", 6);

    expect(allocated).toEqual({
      success: false,
      reason: "not_enough_stat_points",
    });
  });
});

