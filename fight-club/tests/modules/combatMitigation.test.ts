import { resolveTypedArmorMitigation } from "@/modules/combat/services/combatMitigation";
import type { CombatantState } from "@/modules/combat/model/CombatantState";
import type { Random } from "@/core/rng/Random";

describe("combatMitigation", () => {
  it("mitigates each damage type against its own share of zone armor", () => {
    const mitigated = resolveTypedArmorMitigation({
      attackProfile: {
        slash: 10,
        pierce: 10,
        blunt: 0,
        chop: 0,
      },
      attacker: createCombatant({
        armorPenetrationFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
        armorPenetrationPercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      }),
      defender: createCombatant({
        armor: { slash: 16, pierce: 4, blunt: 0, chop: 0 },
        zoneArmor: { head: 20, chest: 0, belly: 0, waist: 0, legs: 0 },
      }),
      zone: "head",
      isDefended: false,
      random: createFixedRandom(0),
      skillArmorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    });

    expect(mitigated.slash).toBeLessThan(mitigated.pierce);
    expect(mitigated.slash).toBe(0);
    expect(mitigated.pierce).toBeGreaterThan(0);
  });

  it("strengthens mitigation on defended zones through zone focus", () => {
    const baseInput = {
      attackProfile: {
        slash: 0,
        pierce: 18,
        blunt: 0,
        chop: 0,
      },
      attacker: createCombatant({
        armorPenetrationFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
        armorPenetrationPercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      }),
      defender: createCombatant({
        armor: { slash: 2, pierce: 14, blunt: 2, chop: 2 },
        zoneArmor: { head: 8, chest: 0, belly: 0, waist: 0, legs: 0 },
        zoneArmorBySlot: {
          helmet: { head: 6, chest: 0, belly: 0, waist: 0, legs: 0 },
          offHand: { head: 8, chest: 0, belly: 0, waist: 0, legs: 0 },
        },
      }),
      zone: "head" as const,
      random: createFixedRandom(0),
      skillArmorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    };

    const undefended = resolveTypedArmorMitigation({
      ...baseInput,
      isDefended: false,
    });
    const defended = resolveTypedArmorMitigation({
      ...baseInput,
      isDefended: true,
    });

    expect(defended.pierce).toBeLessThan(undefended.pierce);
  });
});

function createFixedRandom(value: number): Random {
  return {
    next: () => value,
    int: (min, max) => (min <= max ? min : max),
  };
}

function createCombatant(overrides: Partial<CombatantState> = {}): CombatantState {
  return {
    id: "test",
    name: "Test",
    stats: { strength: 1, agility: 1, rage: 1, endurance: 1 },
    maxHp: 100,
    currentHp: 100,
    resources: { rage: 0, guard: 0, momentum: 0, focus: 0 },
    damage: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    armor: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    zoneArmor: { head: 0, chest: 0, belly: 0, waist: 0, legs: 0 },
    armorBySlot: {},
    zoneArmorBySlot: {},
    critChanceBonus: 0,
    critMultiplierBonus: 0,
    dodgeChanceBonus: 0,
    blockChanceBonus: 0,
    blockPowerBonus: 0,
    armorPenetrationFlat: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    armorPenetrationPercent: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    preferredDamageType: null,
    weaponClass: null,
    attackZone: null,
    defenseZones: [],
    activeEffects: [],
    ...overrides,
  };
}
