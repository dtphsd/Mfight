import { createCharacter } from "@/modules/character";
import { combatZones } from "@/modules/combat";
import { zeroDamageProfile } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  buildZonePressureLens,
  resolveDisplayDamageType,
  totalProfileValue,
} from "@/orchestration/combat/combatPressure";

describe("combatPressure", () => {
  function createSnapshots() {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    return {
      attacker: buildCombatSnapshot({
        character: first.data,
        flatBonuses: [],
        percentBonuses: [],
        baseDamage: {
          slash: 0,
          pierce: 14,
          blunt: 0,
          chop: 0,
        },
        preferredDamageType: "pierce",
        weaponClass: "dagger",
      }),
      defender: buildCombatSnapshot({
        character: second.data,
        flatBonuses: [],
        percentBonuses: [],
        baseArmor: {
          slash: 1,
          pierce: 1,
          blunt: 1,
          chop: 1,
        },
        armorBySlot: {
          offHand: {
            slash: 0,
            pierce: 12,
            blunt: 8,
            chop: 0,
          },
        },
      }),
    };
  }

  it("exports the canonical combat zones in stable order", () => {
    expect(combatZones).toEqual(["head", "chest", "belly", "waist", "legs"]);
  });

  it("builds a pressure lens with stronger open than guarded values for shielded head lines", () => {
    const { attacker, defender } = createSnapshots();

    const lens = buildZonePressureLens(attacker, {
      ...defender,
      blockPowerBonus: 20,
    });
    const head = lens.zones.find((entry) => entry.zone === "head");

    expect(head).toBeDefined();
    expect(head?.openDamage).toBeGreaterThan(head?.guardedDamage ?? Infinity);
    expect(lens.bestOpen.zone).toBeDefined();
    expect(lens.worstGuarded.zone).toBeDefined();
  });

  it("resolves display damage type from preferred type first, then from profile dominance", () => {
    expect(
      resolveDisplayDamageType("slash", {
        slash: 1,
        pierce: 10,
        blunt: 0,
        chop: 0,
      })
    ).toBe("slash");

    expect(
      resolveDisplayDamageType(null, {
        slash: 2,
        pierce: 6,
        blunt: 0,
        chop: 0,
      })
    ).toBe("pierce");

    expect(resolveDisplayDamageType(null, zeroDamageProfile)).toBeNull();
  });

  it("sums mixed profiles consistently", () => {
    expect(
      totalProfileValue({
        slash: 3,
        pierce: 2,
        blunt: 1,
        chop: 4,
      })
    ).toBe(10);
  });
});
