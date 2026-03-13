import {
  baseBlockPenetration,
  baseCritChance,
  baseDamage,
  baseDodgeChance,
  blockPenetration,
  critChance,
  dodgeChance,
} from "@/modules/combat/services/combatFormulas";

describe("combat formulas", () => {
  it("keeps dodge chance within the softened ceiling", () => {
    expect(dodgeChance(1, 100)).toBe(43);
  });

  it("shows visible base dodge from agility before attacker comparison", () => {
    expect(baseDodgeChance(3)).toBe(11);
  });

  it("returns deterministic base damage", () => {
    expect(baseDamage(10)).toBe(25);
  });

  it("increases base damage when strength grows", () => {
    expect(baseDamage(4)).toBeGreaterThan(baseDamage(3));
  });

  it("returns visible base crit from rage even before target comparison", () => {
    expect(baseCritChance(3)).toBe(12);
  });

  it("keeps matchup crit lower than base crit against a high-rage defender", () => {
    expect(baseCritChance(3)).toBeGreaterThan(critChance(3, 4));
    expect(critChance(3, 4)).toBe(4);
  });

  it("still gives a small crit chance when attacker rage is close to defender rage", () => {
    expect(critChance(3, 3)).toBe(6);
  });

  it("keeps matchup dodge lower than base dodge against a fast attacker", () => {
    expect(baseDodgeChance(3)).toBeGreaterThan(dodgeChance(4, 3));
    expect(dodgeChance(4, 3)).toBe(3);
  });

  it("shows visible base block penetration from strength before defender comparison", () => {
    expect(baseBlockPenetration(3)).toBe(29);
  });

  it("keeps matchup block penetration lower than base penetration against a sturdy defender", () => {
    expect(baseBlockPenetration(3)).toBeGreaterThan(blockPenetration(3, 4));
    expect(blockPenetration(3, 4)).toBe(21);
  });

  it("does not allow negative crit chance", () => {
    expect(critChance(1, 100)).toBe(0);
  });
});
