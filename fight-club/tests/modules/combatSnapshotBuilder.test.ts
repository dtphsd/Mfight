import { createCharacter } from "@/modules/character";
import { zeroArmorProfile, zeroCombatBonuses, zeroDamageProfile } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";

describe("combat snapshot builder", () => {
  it("returns base stats when bonuses are empty", () => {
    const created = createCharacter("Builder");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const snapshot = buildCombatSnapshot({
      character: created.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    expect(snapshot.stats).toEqual({
      strength: 3,
      agility: 3,
      rage: 3,
      endurance: 3,
    });
    expect(snapshot.maxHp).toBe(130);
    expect(snapshot.damage).toEqual(zeroDamageProfile);
    expect(snapshot.armor).toEqual(zeroArmorProfile);
    expect(snapshot.critChanceBonus).toBe(0);
  });

  it("applies flat and percent bonuses in the configured order", () => {
    const created = createCharacter("Builder");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const snapshot = buildCombatSnapshot({
      character: created.data,
      flatBonuses: [
        { strength: 5, agility: 0, rage: 0, endurance: 2 },
        { strength: 2, agility: 1, rage: 0, endurance: 0 },
      ],
      percentBonuses: [
        { strength: 50, agility: 0, rage: 0, endurance: 20 },
      ],
    });

    expect(snapshot.stats.strength).toBe(15);
    expect(snapshot.stats.agility).toBe(4);
    expect(snapshot.stats.endurance).toBe(6);
    expect(snapshot.maxHp).toBe(160);
  });

  it("clamps percent bonuses and keeps the stat above one", () => {
    const created = createCharacter("Builder");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const snapshot = buildCombatSnapshot({
      character: created.data,
      flatBonuses: [{ strength: -10, agility: 0, rage: 0, endurance: 0 }],
      percentBonuses: [{ strength: -999, agility: 0, rage: 0, endurance: 5000 }],
    });

    expect(snapshot.stats.strength).toBe(1);
    expect(snapshot.stats.endurance).toBe(33);
    expect(snapshot.maxHp).toBe(430);
  });

  it("aggregates damage, armor and combat bonuses into the snapshot", () => {
    const created = createCharacter("Builder");
    if (!created.success) {
      throw new Error("character creation failed");
    }

    const snapshot = buildCombatSnapshot({
      character: created.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 10,
        pierce: 2,
        blunt: 0,
        chop: 0,
      },
      baseArmor: {
        slash: 5,
        pierce: 4,
        blunt: 2,
        chop: 1,
      },
      combatBonuses: {
        ...zeroCombatBonuses,
        critChance: 5,
        critMultiplier: 0.2,
        dodgeChance: 3,
        blockPower: 8,
        outgoingDamageFlat: {
          slash: 3,
          pierce: 1,
          blunt: 0,
          chop: 0,
        },
        outgoingDamagePercent: {
          slash: 10,
          pierce: 0,
          blunt: 0,
          chop: 0,
        },
        armorFlat: {
          slash: 2,
          pierce: 0,
          blunt: 1,
          chop: 0,
        },
        armorPercent: {
          slash: 20,
          pierce: 0,
          blunt: 50,
          chop: 0,
        },
        armorPenetrationFlat: {
          slash: 1,
          pierce: 2,
          blunt: 0,
          chop: 0,
        },
        armorPenetrationPercent: {
          slash: 15,
          pierce: 25,
          blunt: 0,
          chop: 0,
        },
      },
    });

    expect(snapshot.damage).toEqual({
      slash: 14,
      pierce: 3,
      blunt: 0,
      chop: 0,
    });
    expect(snapshot.armor).toEqual({
      slash: 8,
      pierce: 4,
      blunt: 4,
      chop: 1,
    });
    expect(snapshot.critChanceBonus).toBe(5);
    expect(snapshot.critMultiplierBonus).toBe(0.2);
    expect(snapshot.dodgeChanceBonus).toBe(3);
    expect(snapshot.blockPowerBonus).toBe(8);
    expect(snapshot.armorPenetrationFlat).toEqual({
      slash: 1,
      pierce: 2,
      blunt: 0,
      chop: 0,
    });
  });
});
