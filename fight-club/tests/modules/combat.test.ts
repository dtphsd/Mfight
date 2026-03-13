import { SeededRandom } from "@/core/rng/SeededRandom";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { createCharacter } from "@/modules/character";
import { resolveRound, startCombat } from "@/modules/combat";
import type { RoundAction } from "@/modules/combat";
import {
  createBasicAttackAction,
  createConsumableAction,
  createConsumableAttackAction,
  createSkillAttackAction,
} from "@/modules/combat/model/RoundAction";
import { createEquipment, equipItem, getEquipmentBonuses } from "@/modules/equipment";
import { createStarterInventory, zeroCombatBonuses } from "@/modules/inventory";

describe("combat module", () => {
  function createSnapshots() {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    return {
      alpha: buildCombatSnapshot({
        character: first.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
      beta: buildCombatSnapshot({
        character: second.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
    };
  }

  it("starts combat with two active combatants", () => {
    const { alpha, beta } = createSnapshots();
    const state = startCombat(alpha, beta);

    expect(state.status).toBe("active");
    expect(state.round).toBe(1);
    expect(state.combatants).toHaveLength(2);
    expect(state.combatants[0].currentHp).toBe(alpha.maxHp);
    expect(state.combatants[1].currentHp).toBe(beta.maxHp);
    expect(state.combatants[0].damage).toEqual(alpha.damage);
    expect(state.combatants[1].armor).toEqual(beta.armor);
    expect(state.combatants[0].resources).toEqual({
      rage: 0,
      guard: 0,
      momentum: 0,
      focus: 0,
    });
    expect(state.combatants[0].armorBySlot).toEqual(alpha.armorBySlot);
    expect(state.combatants[0].preferredDamageType).toBe(alpha.preferredDamageType);
    expect(state.combatants[0].weaponClass).toBe(alpha.weaponClass);
    expect(state.combatants[0].activeEffects).toEqual([]);
  });

  it("resolves a round and appends results to the combat log", () => {
    const { alpha, beta } = createSnapshots();
    const state = startCombat(alpha, beta);
    const actions: [RoundAction, RoundAction] = [
      createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
    ];

    const resolved = resolveRound(state, actions, new SeededRandom(9));

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    expect(resolved.data.round).toBe(2);
    expect(resolved.data.log).toHaveLength(2);
    expect(resolved.data.combatants.some((combatant) => combatant.currentHp < combatant.maxHp)).toBe(
      true
    );
    expect(resolved.data.log[0].round).toBe(1);
    expect(resolved.data.log[0].timestamp).toBeTypeOf("number");
    expect(["Alpha", "Beta"]).toContain(resolved.data.log[0].attackerName);
    expect(["Alpha", "Beta"]).toContain(resolved.data.log[0].defenderName);
    expect(resolved.data.log[0].attackerName).not.toBe(resolved.data.log[0].defenderName);
    expect(resolved.data.log[0].commentary.length).toBeGreaterThan(0);
  });

  it("rejects duplicate defense zones", () => {
    const { alpha, beta } = createSnapshots();
    const state = startCombat(alpha, beta);
    const actions: [RoundAction, RoundAction] = [
      createBasicAttackAction({
        attackerId: alpha.characterId,
        attackZone: "head",
        defenseZones: ["head", "head"],
      }),
      createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
    ];

    const resolved = resolveRound(state, actions, new SeededRandom(9));

    expect(resolved).toEqual({
      success: false,
      reason: "duplicate_defense_zones",
    });
  });

  it("finishes combat when a defender reaches zero hp", () => {
    const { alpha, beta } = createSnapshots();
    const boostedAlpha = {
      ...alpha,
      stats: {
        ...alpha.stats,
        strength: 200,
      },
    };
    const state = startCombat(boostedAlpha, beta);
    const actions: [RoundAction, RoundAction] = [
      createBasicAttackAction({
        attackerId: boostedAlpha.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      createBasicAttackAction({
        attackerId: beta.characterId,
        attackZone: "legs",
        defenseZones: ["waist", "belly"],
      }),
    ];

    const resolved = resolveRound(state, actions, new SeededRandom(2));

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    expect(resolved.data.status).toBe("finished");
    expect(resolved.data.winnerId).toBe(boostedAlpha.characterId);
    expect(resolved.data.log[0].knockoutCommentary).toBeTypeOf("string");
  });

  it("applies item-derived damage, armor, and combat bonuses during a round", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 20,
        pierce: 0,
        blunt: 0,
        chop: 0,
      },
      combatBonuses: {
        ...zeroCombatBonuses,
        critChance: 90,
        critMultiplier: 1,
        armorPenetrationFlat: {
          slash: 10,
          pierce: 0,
          blunt: 0,
          chop: 0,
        },
      },
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
      baseArmor: {
        slash: 15,
        pierce: 0,
        blunt: 0,
        chop: 0,
      },
      combatBonuses: {
        ...zeroCombatBonuses,
        dodgeChance: -5,
        blockPower: 20,
      },
    });

    const resolved = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(0)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(attackerLog).toBeDefined();
    expect(attackerLog?.crit).toBe(true);
    expect(attackerLog?.damageType).toBe("slash");
    expect(attackerLog?.finalDamage).toBeGreaterThan(30);
    expect(
      resolved.data.combatants.find((combatant) => combatant.id === defender.characterId)?.currentHp
    ).toBeLessThan(defender.maxHp);
  });

  it("prefers damage type from weapon metadata over raw profile dominance", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 3,
        pierce: 14,
        blunt: 0,
        chop: 0,
      },
      preferredDamageType: "slash",
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
      combatBonuses: {
        ...zeroCombatBonuses,
        dodgeChance: -10,
      },
    });

    const resolved = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(0)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(attackerLog?.damageType).toBe("slash");
  });

  it("uses weapon class style bias when distributing attack types", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 2,
        pierce: 2,
        blunt: 2,
        chop: 2,
      },
      preferredDamageType: "slash",
      weaponClass: "dagger",
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const resolved = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(0)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(attackerLog?.damageType).toBe("pierce");
  });

  it("boosts zone-relevant armor when the defended zone matches the attack", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 0,
        pierce: 18,
        blunt: 0,
        chop: 0,
      },
      preferredDamageType: "pierce",
      weaponClass: "dagger",
    });
    const defender = buildCombatSnapshot({
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
      combatBonuses: {
        ...zeroCombatBonuses,
        blockPower: 20,
      },
    });

    const defended = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "belly"],
        }),
      ],
      new SeededRandom(0)
    );
    const undefended = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["chest", "belly"],
        }),
      ],
      new SeededRandom(0)
    );

    expect(defended.success).toBe(true);
    expect(undefended.success).toBe(true);
    if (!defended.success || !undefended.success) {
      return;
    }

    const defendedHit = defended.data.log.find((entry) => entry.attackerId === attacker.characterId);
    const undefendedHit = undefended.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(defendedHit?.finalDamage).toBeLessThan(undefendedHit?.finalDamage ?? Infinity);
  });

  it("grants combat resources from crits, blocks, hits and dodges", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const critAttacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      combatBonuses: {
        ...zeroCombatBonuses,
        critChance: 90,
      },
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const critResolved = resolveRound(
      startCombat(critAttacker, defender),
      [
        createBasicAttackAction({
          attackerId: critAttacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(0)
    );

    expect(critResolved.success).toBe(true);
    if (!critResolved.success) {
      return;
    }

    expect(
      critResolved.data.combatants.find((combatant) => combatant.id === critAttacker.characterId)?.resources.rage
    ).toBeGreaterThan(0);

    const blockResolved = resolveRound(
      startCombat(defender, critAttacker),
      [
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: critAttacker.characterId,
          attackZone: "legs",
          defenseZones: ["head", "belly"],
        }),
      ],
      new SeededRandom(99)
    );

    expect(blockResolved.success).toBe(true);
    if (!blockResolved.success) {
      return;
    }

    const guardHolder = blockResolved.data.combatants.find((combatant) => combatant.id === critAttacker.characterId);
    expect((guardHolder?.resources.guard ?? 0) + (guardHolder?.resources.focus ?? 0)).toBeGreaterThan(0);
  });

  it("uses an item skill to spend resources and tag the combat log", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-sword");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const state = startCombat(attacker, defender);
    const attackerState = {
      ...state.combatants[0],
      resources: {
        ...state.combatants[0].resources,
        momentum: 30,
      },
    };

    const seededState = {
      ...state,
      combatants: [attackerState, state.combatants[1]] as typeof state.combatants,
    };

    const skill = skillBonuses.skills.find((entry) => entry.id === "training-sword-feint");

    expect(skill).toBeDefined();

    const resolved = resolveRound(
      seededState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
          skill: skill!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === attacker.characterId);
    const updatedAttacker = resolved.data.combatants.find((combatant) => combatant.id === attacker.characterId);

    expect(attackerLog?.skillName).toBe("Feint Slash");
    expect(updatedAttacker?.resources.momentum).toBeLessThan(30);
  });

  it("applies combat effects from skills and resolves them on the target's next turn", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-sword");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const fasterDefender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const state = startCombat(
      {
        ...attacker,
        stats: { ...attacker.stats, agility: 2 },
      },
      {
        ...fasterDefender,
        stats: { ...fasterDefender.stats, agility: 8 },
      }
    );

    const attackerState = {
      ...state.combatants[0],
      resources: {
        ...state.combatants[0].resources,
        momentum: 30,
      },
    };
    const seededState = {
      ...state,
      combatants: [attackerState, state.combatants[1]] as typeof state.combatants,
    };
    const skill = skillBonuses.skills.find((entry) => entry.id === "training-sword-feint");

    const firstRound = resolveRound(
      seededState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
          skill: skill!,
        }),
        createBasicAttackAction({
          attackerId: fasterDefender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const defenderAfterRound = firstRound.data.combatants.find((combatant) => combatant.id === fasterDefender.characterId);
    const attackerLog = firstRound.data.log.find((entry) => entry.attackerId === attacker.characterId && entry.skillName === "Feint Slash");

    expect(defenderAfterRound?.activeEffects.map((effect) => effect.name)).toContain("Bleeding Line");
    expect(attackerLog?.appliedEffects?.map((effect) => effect.effectName)).toContain("Bleeding Line");

    const secondRound = resolveRound(
      firstRound.data,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: fasterDefender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(secondRound.success).toBe(true);
    if (!secondRound.success) {
      return;
    }

    const effectTickLog = secondRound.data.log.find(
      (entry) => entry.attackerId === fasterDefender.characterId && entry.messages.includes("effects")
    );
    const defenderAfterSecondRound = secondRound.data.combatants.find(
      (combatant) => combatant.id === fasterDefender.characterId
    );

    expect(effectTickLog?.finalDamage).toBe(11);
    expect(effectTickLog?.expiredEffects).toEqual([]);
    expect(defenderAfterSecondRound?.activeEffects.find((effect) => effect.name === "Bleeding Line")?.turnsRemaining).toBe(1);
  });

  it.each([
    {
      weaponClass: "sword" as const,
      preferredDamageType: "slash" as const,
      expectedEffect: "Open Wound",
      seed: 4,
      critChanceBonus: 0,
    },
    {
      weaponClass: "dagger" as const,
      preferredDamageType: "pierce" as const,
      expectedEffect: "Vital Mark",
      seed: 0,
      critChanceBonus: 90,
    },
    {
      weaponClass: "mace" as const,
      preferredDamageType: "blunt" as const,
      expectedEffect: "Concussed Guard",
      seed: 0,
      critChanceBonus: 0,
    },
    {
      weaponClass: "axe" as const,
      preferredDamageType: "chop" as const,
      expectedEffect: "Rending Hook",
      seed: 4,
      critChanceBonus: 0,
    },
    {
      weaponClass: "greatsword" as const,
      preferredDamageType: "slash" as const,
      expectedEffect: "Execution Pressure",
      seed: 4,
      critChanceBonus: 0,
    },
  ])("applies the $weaponClass weapon passive on hit", ({ weaponClass, preferredDamageType, expectedEffect, seed, critChanceBonus }) => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: preferredDamageType === "slash" ? 14 : 0,
        pierce: preferredDamageType === "pierce" ? 14 : 0,
        blunt: preferredDamageType === "blunt" ? 14 : 0,
        chop: preferredDamageType === "chop" ? 14 : 0,
      },
      combatBonuses: {
        ...zeroCombatBonuses,
        critChance: critChanceBonus,
      },
      preferredDamageType,
      weaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const resolved = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(seed)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const expectedTargetId = weaponClass === "greatsword" ? attacker.characterId : defender.characterId;
    const affectedCombatant = resolved.data.combatants.find((combatant) => combatant.id === expectedTargetId);
    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(affectedCombatant?.activeEffects.map((effect) => effect.name)).toContain(expectedEffect);
    expect(attackerLog?.appliedEffects?.map((effect) => effect.effectName)).toContain(expectedEffect);
  });

  it("stacks sword weapon passive bleed across repeated hits", () => {
    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: [],
      percentBonuses: [],
      baseDamage: {
        slash: 14,
        pierce: 0,
        blunt: 0,
        chop: 0,
      },
      preferredDamageType: "slash",
      weaponClass: "sword",
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const firstRound = resolveRound(
      startCombat(attacker, defender),
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const secondRound = resolveRound(
      firstRound.data,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(secondRound.success).toBe(true);
    if (!secondRound.success) {
      return;
    }

    const defenderAfterSecondRound = secondRound.data.combatants.find((combatant) => combatant.id === defender.characterId);
    const stackedEffect = defenderAfterSecondRound?.activeEffects.find((effect) => effect.name === "Open Wound");
    const secondRoundAttackLog = secondRound.data.log
      .filter(
        (entry) => entry.attackerId === attacker.characterId && entry.appliedEffects?.some((effect) => effect.effectName === "Open Wound")
      )
      .at(-1);

    expect(stackedEffect?.stackCount).toBe(2);
    expect(secondRoundAttackLog?.appliedEffects?.find((effect) => effect.effectName === "Open Wound")?.stackCount).toBe(2);

    const thirdRound = resolveRound(
      secondRound.data,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["waist", "belly"],
        }),
      ],
      new SeededRandom(4)
    );

    expect(thirdRound.success).toBe(true);
    if (!thirdRound.success) {
      return;
    }

    const defenderAfterThirdRound = thirdRound.data.combatants.find((combatant) => combatant.id === defender.characterId);
    expect(defenderAfterThirdRound?.activeEffects.find((effect) => effect.name === "Open Wound")?.stackCount).toBe(3);
  });

  it("applies armor shred from Expose Guard and improves the next follow-up hit", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-sword");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
      baseArmor: {
        slash: 16,
        pierce: 12,
        blunt: 6,
        chop: 10,
      },
    });

    const state = startCombat(attacker, defender);
    const exposeGuard = skillBonuses.skills.find((entry) => entry.id === "training-sword-expose-guard");

    expect(exposeGuard).toBeDefined();

    const preparedState = {
      ...state,
      combatants: [
        {
          ...state.combatants[0],
          resources: {
            ...state.combatants[0].resources,
            momentum: 30,
          },
        },
        state.combatants[1],
      ] as typeof state.combatants,
    };

    const firstRound = resolveRound(
      preparedState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
          skill: exposeGuard!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(7)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const defenderAfterDebuff = firstRound.data.combatants.find((combatant) => combatant.id === defender.characterId);
    expect(defenderAfterDebuff?.activeEffects.map((effect) => effect.name)).toContain("Sundered Plating");

    const secondRound = resolveRound(
      firstRound.data,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(7)
    );

    const controlState = startCombat(attacker, defender);
    const controlRound = resolveRound(
      controlState,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(7)
    );

    expect(secondRound.success).toBe(true);
    expect(controlRound.success).toBe(true);
    if (!secondRound.success || !controlRound.success) {
      return;
    }

    const followUpHit = secondRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.skillName === null
    );
    const controlHit = controlRound.data.log.find((entry) => entry.attackerId === attacker.characterId);

    expect(followUpHit?.finalDamage).toBeGreaterThan(controlHit?.finalDamage ?? 0);
  });

  it("applies Exposed from Opening Sense and lets Execution Arc punish it harder", () => {
    const inventory = createStarterInventory();
    const withGreatsword = equipItem(createEquipment(), inventory, "great-training-sword");

    if (!withGreatsword.success) {
      throw new Error(withGreatsword.reason);
    }

    const equipped = equipItem(withGreatsword.data, inventory, "duelist-charm");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const openingSense = skillBonuses.skills.find((entry) => entry.id === "duelist-charm-opening-sense");
    const executionArc = skillBonuses.skills.find((entry) => entry.id === "great-training-sword-execution-arc");

    expect(openingSense).toBeDefined();
    expect(executionArc).toBeDefined();

    const baseState = startCombat(
      {
        ...attacker,
        stats: { ...attacker.stats, agility: 8 },
      },
      {
        ...defender,
        stats: { ...defender.stats, agility: 3 },
      }
    );
    const seededState = {
      ...baseState,
      combatants: [
        {
          ...baseState.combatants[0],
          resources: {
            ...baseState.combatants[0].resources,
            focus: 20,
            rage: 40,
          },
        },
        baseState.combatants[1],
      ] as typeof baseState.combatants,
    };

    const firstRound = resolveRound(
      seededState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
          skill: openingSense!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(11)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const defenderAfterSetup = firstRound.data.combatants.find((combatant) => combatant.id === defender.characterId);
    expect(defenderAfterSetup?.activeEffects.map((effect) => effect.name)).toContain("Exposed");

    const payoffRound = resolveRound(
      firstRound.data,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
          skill: executionArc!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(11)
    );

    const controlBaseState = startCombat(
      {
        ...attacker,
        stats: { ...attacker.stats, agility: 8 },
      },
      {
        ...defender,
        stats: { ...defender.stats, agility: 3 },
      }
    );
    const controlState = {
      ...controlBaseState,
      combatants: [
        {
          ...controlBaseState.combatants[0],
          resources: {
            ...controlBaseState.combatants[0].resources,
            rage: 40,
          },
        },
        controlBaseState.combatants[1],
      ] as typeof controlBaseState.combatants,
    };

    const controlRound = resolveRound(
      controlState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["waist", "legs"],
          skill: executionArc!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(11)
    );

    expect(payoffRound.success).toBe(true);
    expect(controlRound.success).toBe(true);
    if (!payoffRound.success || !controlRound.success) {
      return;
    }

    const payoffHit = payoffRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.skillName === "Execution Arc"
    );
    const controlHit = controlRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.skillName === "Execution Arc"
    );

    expect(payoffHit?.messages).toContain("state_bonus");
    expect(payoffHit?.finalDamage).toBeGreaterThan(controlHit?.finalDamage ?? 0);
  });

  it("applies Staggered from Armor Crush and lets Crushing Blow hit harder after the setup", () => {
    const inventory = createStarterInventory();
    const equipped = equipItem(createEquipment(), inventory, "training-mace");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const armorCrush = skillBonuses.skills.find((entry) => entry.id === "training-mace-armor-crush");
    const crushingBlow = skillBonuses.skills.find((entry) => entry.id === "training-mace-crush");

    expect(armorCrush).toBeDefined();
    expect(crushingBlow).toBeDefined();

    const baseState = startCombat(
      {
        ...attacker,
        stats: { ...attacker.stats, agility: 8 },
      },
      {
        ...defender,
        stats: { ...defender.stats, agility: 3 },
      }
    );
    const seededState = {
      ...baseState,
      combatants: [
        {
          ...baseState.combatants[0],
          resources: {
            ...baseState.combatants[0].resources,
            guard: 60,
          },
        },
        baseState.combatants[1],
      ] as typeof baseState.combatants,
    };

    const setupRound = resolveRound(
      seededState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
          skill: armorCrush!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(6)
    );

    expect(setupRound.success).toBe(true);
    if (!setupRound.success) {
      return;
    }

    const defenderAfterSetup = setupRound.data.combatants.find((combatant) => combatant.id === defender.characterId);
    expect(defenderAfterSetup?.activeEffects.map((effect) => effect.name)).toContain("Staggered");

    const payoffRound = resolveRound(
      setupRound.data,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
          skill: crushingBlow!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(6)
    );

    const controlBaseState = startCombat(
      {
        ...attacker,
        stats: { ...attacker.stats, agility: 8 },
      },
      {
        ...defender,
        stats: { ...defender.stats, agility: 3 },
      }
    );
    const controlState = {
      ...controlBaseState,
      combatants: [
        {
          ...controlBaseState.combatants[0],
          resources: {
            ...controlBaseState.combatants[0].resources,
            guard: 34,
          },
        },
        controlBaseState.combatants[1],
      ] as typeof controlBaseState.combatants,
    };

    const controlRound = resolveRound(
      controlState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
          skill: crushingBlow!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(6)
    );

    expect(payoffRound.success).toBe(true);
    expect(controlRound.success).toBe(true);
    if (!payoffRound.success || !controlRound.success) {
      return;
    }

    const payoffHit = payoffRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.skillName === "Crushing Blow"
    );
    const controlHit = controlRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.skillName === "Crushing Blow"
    );

    expect(payoffHit?.messages).toContain("state_bonus");
    expect(payoffHit?.finalDamage).toBeGreaterThan(controlHit?.finalDamage ?? 0);
  });

  it("applies Second Wind as a defensive sustain skill with healing and guard recovery", () => {
    const inventory = createStarterInventory();
    const withSword = equipItem(createEquipment(), inventory, "training-sword");

    if (!withSword.success) {
      throw new Error(withSword.reason);
    }

    const equipped = equipItem(withSword.data, inventory, "oak-shield");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const first = createCharacter("Alpha");
    const second = createCharacter("Beta");

    if (!first.success || !second.success) {
      throw new Error("character creation failed");
    }

    const skillBonuses = getEquipmentBonuses(equipped.data, inventory);
    const attacker = buildCombatSnapshot({
      character: first.data,
      flatBonuses: skillBonuses.flatBonuses,
      percentBonuses: skillBonuses.percentBonuses,
      baseDamage: skillBonuses.baseDamage,
      baseArmor: skillBonuses.baseArmor,
      armorBySlot: skillBonuses.armorBySlot,
      combatBonuses: skillBonuses.combatBonuses,
      preferredDamageType: skillBonuses.preferredDamageType,
      weaponClass: skillBonuses.mainHandWeaponClass,
    });
    const defender = buildCombatSnapshot({
      character: second.data,
      flatBonuses: [],
      percentBonuses: [],
    });

    const state = startCombat(attacker, defender);
    const secondWind = skillBonuses.skills.find((entry) => entry.id === "oak-shield-second-wind");

    expect(secondWind).toBeDefined();

    const preparedState = {
      ...state,
      combatants: [
        {
          ...state.combatants[0],
          currentHp: state.combatants[0].currentHp - 16,
          resources: {
            ...state.combatants[0].resources,
            guard: 28,
          },
        },
        state.combatants[1],
      ] as typeof state.combatants,
    };

    const firstRound = resolveRound(
      preparedState,
      [
        createSkillAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["head", "belly"],
          skill: secondWind!,
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
      ],
      new SeededRandom(8)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const attackerAfterUse = firstRound.data.combatants.find((combatant) => combatant.id === attacker.characterId);
    expect(attackerAfterUse?.activeEffects.map((effect) => effect.name)).toContain("Guarded Recovery");

    const secondRound = resolveRound(
      firstRound.data,
      [
        createBasicAttackAction({
          attackerId: attacker.characterId,
          attackZone: "chest",
          defenseZones: ["head", "belly"],
        }),
        createBasicAttackAction({
          attackerId: defender.characterId,
          attackZone: "head",
          defenseZones: ["waist", "legs"],
        }),
      ],
      new SeededRandom(8)
    );

    expect(secondRound.success).toBe(true);
    if (!secondRound.success) {
      return;
    }

    const sustainTickLog = secondRound.data.log.find(
      (entry) => entry.attackerId === attacker.characterId && entry.messages.includes("effects") && entry.healedHp > 0
    );
    const attackerAfterTick = secondRound.data.combatants.find((combatant) => combatant.id === attacker.characterId);

    expect(sustainTickLog?.healedHp).toBe(2);
    expect(attackerAfterTick?.resources.guard).toBeGreaterThan(0);
    expect(attackerAfterTick?.activeEffects.find((effect) => effect.name === "Guarded Recovery")?.turnsRemaining).toBe(1);
  });

  it("allows combo consumables to resolve together with an attack", () => {
    const { alpha, beta } = createSnapshots();
    const state = startCombat(alpha, beta);
    const attackerState = {
      ...state.combatants[0],
      currentHp: Math.max(1, state.combatants[0].currentHp - 10),
    };
    const seededState = {
      ...state,
      combatants: [attackerState, state.combatants[1]] as typeof state.combatants,
    };

    const resolved = resolveRound(
      seededState,
      [
        createConsumableAttackAction({
          attackerId: alpha.characterId,
          attackZone: "head",
          defenseZones: ["chest", "belly"],
          consumable: {
            itemCode: "bandage",
            itemName: "Bandage",
            effect: {
              usageMode: "with_attack",
              heal: 12,
              resourceRestore: {
                guard: 6,
              },
            },
          },
        }),
        createBasicAttackAction({
          attackerId: beta.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(9)
    );

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const attackerLog = resolved.data.log.find((entry) => entry.attackerId === alpha.characterId);
    const updatedAttacker = resolved.data.combatants.find((combatant) => combatant.id === alpha.characterId);

    expect(attackerLog?.consumableName).toBe("Bandage");
    expect(attackerLog?.messages).toContain("consumable");
    expect(attackerLog?.finalDamage).toBeGreaterThan(0);
    expect(updatedAttacker?.currentHp).toBeGreaterThan(attackerState.currentHp);
  });

  it("applies a regeneration consumable effect for multiple turns", () => {
    const { alpha, beta } = createSnapshots();
    const state = startCombat(alpha, beta);
    const woundedAttacker = {
      ...state.combatants[0],
      currentHp: Math.max(1, state.combatants[0].currentHp - 20),
    };
    const seededState = {
      ...state,
      combatants: [woundedAttacker, state.combatants[1]] as typeof state.combatants,
    };

    const firstRound = resolveRound(
      seededState,
      [
        createConsumableAction({
          attackerId: alpha.characterId,
          attackZone: "head",
          defenseZones: ["chest", "belly"],
          consumable: {
            itemCode: "regen-potion",
            itemName: "Regen Potion",
            effect: {
              usageMode: "replace_attack",
              heal: 0,
              resourceRestore: {},
              effects: [
                {
                  id: "regen-potion-regeneration",
                  name: "Regeneration",
                  description: "Recover health at the start of each turn while the tonic remains active.",
                  kind: "buff",
                  target: "self",
                  trigger: "on_use",
                  durationTurns: 5,
                  periodic: {
                    heal: 6,
                  },
                },
              ],
            },
          },
        }),
        createBasicAttackAction({
          attackerId: beta.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(9)
    );

    expect(firstRound.success).toBe(true);
    if (!firstRound.success) {
      return;
    }

    const attackerAfterUse = firstRound.data.combatants.find((combatant) => combatant.id === alpha.characterId);
    expect(attackerAfterUse?.activeEffects.map((effect) => effect.name)).toContain("Regeneration");

    const secondRound = resolveRound(
      firstRound.data,
      [
        createBasicAttackAction({
          attackerId: alpha.characterId,
          attackZone: "head",
          defenseZones: ["chest", "belly"],
        }),
        createBasicAttackAction({
          attackerId: beta.characterId,
          attackZone: "legs",
          defenseZones: ["head", "waist"],
        }),
      ],
      new SeededRandom(9)
    );

    expect(secondRound.success).toBe(true);
    if (!secondRound.success) {
      return;
    }

    const regenTickLog = secondRound.data.log.find(
      (entry) => entry.attackerId === alpha.characterId && entry.messages.includes("effects") && entry.healedHp > 0
    );
    const attackerAfterTick = secondRound.data.combatants.find((combatant) => combatant.id === alpha.characterId);

    expect(regenTickLog?.healedHp).toBe(6);
    expect(attackerAfterTick?.activeEffects.find((effect) => effect.name === "Regeneration")?.turnsRemaining).toBe(4);
  });
});
