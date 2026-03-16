import { importedMomentumSkills } from "@/content/combat/importedMomentumSkills";

describe("combat skill metadata", () => {
  it("supports cooldown and unlock metadata for imported momentum drafts", () => {
    const willToWin = importedMomentumSkills.find((skill) => skill.id === "momentum-will-to-win");
    const battleScout = importedMomentumSkills.find((skill) => skill.id === "momentum-battle-scout");

    expect(willToWin?.cooldownTurns).toBe(5);
    expect(willToWin?.unlock?.kind).toBe("book");
    expect(willToWin?.requirements?.minLevel).toBe(3);

    expect(battleScout?.unlock?.sourceName).toContain("Battle Scout");
    expect(battleScout?.requirements?.minLevel).toBe(5);
  });
});
