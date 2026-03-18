import { SeededRandom } from "@/core/rng/SeededRandom";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { planBotRound } from "@/orchestration/combat/botRoundPlanner";
import {
  createZeroCombatEffectModifiers,
  createZeroCombatEffectPeriodic,
  normalizeCombatEffectDefinition,
  startCombat,
  type ActiveCombatEffect,
} from "@/modules/combat";
import { allocateStatPoint, createCharacter, type Character, type CharacterStatName } from "@/modules/character";

describe("botRoundPlanner", () => {
  it("keeps defense zones unique without relying on the player's announced attack zone", () => {
    const botSnapshot = createSnapshot("Arena Bot");
    const playerSnapshot = createSnapshot("Player");

    const planWithoutHint = planBotRound({
      random: new SeededRandom(1337),
      attacker: botSnapshot,
      defender: playerSnapshot,
      attackerCombatant: createCombatant(botSnapshot),
      difficulty: "veteran",
    });
    const planWithHint = planBotRound({
      random: new SeededRandom(1337),
      attacker: botSnapshot,
      defender: playerSnapshot,
      attackerCombatant: createCombatant(botSnapshot),
      difficulty: "veteran",
      opponentAttackZone: "head",
    });

    expect(planWithoutHint.defenseZones[0]).not.toBe(planWithoutHint.defenseZones[1]);
    expect(planWithHint.defenseZones[0]).toBe("head");
    expect(planWithHint.defenseZones[1]).not.toBe(planWithHint.defenseZones[0]);
    expect(planWithHint.reason).toBe("counter_guard");
  });

  it("prefers the zone with the highest open pressure when planning an attack", () => {
    const attacker = createSnapshot("Arena Bot", { strength: 3 });
    const defender = createSnapshot("Player");

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant: createCombatant(attacker),
      difficulty: "veteran",
    });

    expect(plan.attackZone).toBe("head");
    expect(plan.reason).toBe("pressure");
  });

  it("uses an affordable skill for champion difficulty when one is available", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { momentum: 30 });

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      difficulty: "champion",
      availableSkills: [
        {
          id: "test-cleave",
          name: "Test Cleave",
          description: "Test skill",
          sourceItemCode: "test-weapon",
          resourceType: "momentum",
          cost: 20,
          damageMultiplier: 1.3,
          critChanceBonus: 6,
          armorPenetrationPercentBonus: {
            slash: 20,
            pierce: 0,
            blunt: 0,
            chop: 0,
          },
        },
      ],
    });

    expect(plan.skillId).toBe("test-cleave");
    expect(plan.reason).toBe("skill_pressure");
  });

  it("can hold a setup skill to preserve resources for a nearby payoff skill", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { momentum: 14 });

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      difficulty: "champion",
      archetype: "Pressure",
      availableSkills: [
        {
          id: "setup-cut",
          name: "Setup Cut",
          description: "Cheap setup strike.",
          sourceItemCode: "test-sword",
          resourceType: "momentum",
          cost: 14,
          damageMultiplier: 1.05,
          critChanceBonus: 4,
          armorPenetrationPercentBonus: {
            slash: 12,
            pierce: 0,
            blunt: 0,
            chop: 0,
          },
          roles: ["setup", "tempo"],
        },
        {
          id: "payoff-cut",
          name: "Payoff Cut",
          description: "Heavier follow-through.",
          sourceItemCode: "test-sword",
          resourceType: "momentum",
          cost: 24,
          damageMultiplier: 1.42,
          critChanceBonus: 12,
          armorPenetrationPercentBonus: {
            slash: 18,
            pierce: 0,
            blunt: 0,
            chop: 0,
          },
          roles: ["payoff"],
        },
      ],
    });

    expect(plan.skillId).toBeNull();
    expect(plan.reason).toBe("pressure");
  });

  it("prefers an affordable payoff skill when the tagged window is already open", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { momentum: 24 });
    const defenderCombatant = {
      ...createCombatant(defender),
      activeEffects: [
        {
          id: "active-state-exposed",
          sourceName: "Setup Cut",
          sourceSkillName: "Setup Cut",
          turnsRemaining: 1,
          ...normalizeCombatEffectDefinition(
            {
              id: "state-exposed",
              name: "Exposed",
              description: "Target is opened up for a stronger follow-up.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
            },
            1
          ),
        },
      ],
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Pressure",
      availableSkills: [
        {
          id: "setup-cut",
          name: "Setup Cut",
          description: "Cheap setup strike.",
          sourceItemCode: "test-sword",
          resourceType: "momentum",
          cost: 14,
          damageMultiplier: 1.05,
          critChanceBonus: 4,
          armorPenetrationPercentBonus: {
            slash: 12,
            pierce: 0,
            blunt: 0,
            chop: 0,
          },
          roles: ["setup", "tempo"],
        },
        {
          id: "payoff-cut",
          name: "Payoff Cut",
          description: "Heavier follow-through.",
          sourceItemCode: "test-sword",
          resourceType: "momentum",
          cost: 18,
          damageMultiplier: 1.42,
          critChanceBonus: 12,
          armorPenetrationPercentBonus: {
            slash: 18,
            pierce: 0,
            blunt: 0,
            chop: 0,
          },
          roles: ["payoff"],
          stateBonuses: [
            {
              requiredEffectId: "state-exposed",
              damageMultiplierBonus: 0.24,
              critChanceBonus: 12,
            },
          ],
        },
      ],
    });

    expect(plan.skillId).toBe("payoff-cut");
    expect(plan.reason).toBe("skill_pressure");
  });

  it("leans into low-line pressure for tempo archetypes", () => {
    const attacker = {
      ...createSnapshot("Arena Bot", { strength: 2, rage: 1 }),
      weaponClass: "axe" as const,
      preferredDamageType: "chop" as const,
      damage: {
        slash: 1,
        pierce: 0,
        blunt: 0,
        chop: 16,
      },
    };
    const defender = createSnapshot("Player");

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant: createCombatant(attacker),
      difficulty: "champion",
      archetype: "Tempo",
    });

    expect(["waist", "legs"]).toContain(plan.attackZone);
  });

  it("prefers control skills with debuffs for control archetypes", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { guard: 40, momentum: 40 });
    const defenderCombatant = createCombatant(defender);

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Control",
      availableSkills: [
        {
          id: "raw-smash",
          name: "Raw Smash",
          description: "Heavy hit",
          sourceItemCode: "test-mace",
          resourceType: "momentum",
          cost: 20,
          damageMultiplier: 1.34,
          critChanceBonus: 0,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 0,
            blunt: 8,
            chop: 0,
          },
        },
        {
          id: "control-bash",
          name: "Control Bash",
          description: "Applies stagger",
          sourceItemCode: "test-shield",
          resourceType: "guard",
          cost: 18,
          damageMultiplier: 1.12,
          critChanceBonus: 0,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 0,
            blunt: 12,
            chop: 0,
          },
          effects: [
            {
              id: "staggered",
              name: "Staggered",
              description: "Reduced stability.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
              modifiers: {
                incomingDamagePercent: 12,
                blockPowerBonus: -10,
              },
            },
          ],
        },
      ],
    });

    expect(plan.skillId).toBe("control-bash");
  });

  it("prefers a finisher skill for burst archetypes against low-hp targets", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { focus: 40 });
    const defenderCombatant = {
      ...createCombatant(defender),
      currentHp: 28,
      armor: {
        slash: 12,
        pierce: 16,
        blunt: 8,
        chop: 8,
      },
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Burst",
      availableSkills: [
        {
          id: "burst-setup",
          name: "Burst Setup",
          description: "Buffs next attack.",
          sourceItemCode: "test-dagger",
          resourceType: "focus",
          cost: 16,
          damageMultiplier: 1,
          critChanceBonus: 8,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 12,
            blunt: 0,
            chop: 0,
          },
          effects: [
            {
              id: "flicker-stance",
              name: "Flicker Stance",
              description: "Dodge buff.",
              kind: "buff",
              target: "self",
              trigger: "on_use",
              durationTurns: 3,
              modifiers: {
                dodgeChanceBonus: 18,
                outgoingDamagePercent: 8,
              },
            },
          ],
        },
        {
          id: "finisher-strike",
          name: "Finisher Strike",
          description: "Finisher thrust.",
          sourceItemCode: "test-dagger",
          resourceType: "focus",
          cost: 26,
          damageMultiplier: 1.72,
          critChanceBonus: 36,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 58,
            blunt: 0,
            chop: 0,
          },
          effects: [
            {
              id: "open-vein",
              name: "Open Vein",
              description: "Target takes more damage.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
              modifiers: {
                incomingDamagePercent: 10,
              },
            },
          ],
        },
      ],
    });

    expect(plan.skillId).toBe("finisher-strike");
  });

  it("uses skill roles and ai hints as soft planner guidance", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { momentum: 30 });
    const taggedEffects: ActiveCombatEffect[] = [
      {
        id: "active-exposed",
        effectId: "exposed",
        name: "Exposed",
        description: "Target is easier to punish.",
        kind: "debuff",
        sourceName: "Test Setup",
        sourceSkillName: "Test Setup",
        turnsRemaining: 2,
        stackCount: 1,
        maxStacks: 2,
        modifiers: {
          ...createZeroCombatEffectModifiers(),
          incomingDamagePercent: 8,
        },
        periodic: createZeroCombatEffectPeriodic(),
      },
    ];

    const defenderCombatant = {
      ...createCombatant(defender),
      armor: {
        slash: 14,
        pierce: 18,
        blunt: 12,
        chop: 10,
      },
      activeEffects: taggedEffects,
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Control",
      availableSkills: [
        {
          id: "plain-hit",
          name: "Plain Hit",
          description: "Simple hit",
          sourceItemCode: "test-weapon",
          resourceType: "momentum",
          cost: 16,
          damageMultiplier: 1.18,
          critChanceBonus: 0,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 10,
            blunt: 0,
            chop: 0,
          },
        },
        {
          id: "guided-control",
          name: "Guided Control",
          description: "Control strike with explicit planner hints.",
          sourceItemCode: "test-weapon",
          resourceType: "momentum",
          cost: 16,
          damageMultiplier: 1.1,
          critChanceBonus: 0,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 12,
            blunt: 0,
            chop: 0,
          },
          roles: ["setup", "control"],
          preferredZones: ["head"],
          aiHints: {
            prefersTaggedTargets: true,
            prefersArmoredTargets: true,
          },
        },
      ],
    });

    expect(plan.attackZone).toBe("head");
    expect(plan.skillId).toBe("guided-control");
  });

  it("prefers precise intent for tagged setup-control windows", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { guard: 28 });
    const defenderCombatant = {
      ...createCombatant(defender),
      activeEffects: [
        {
          id: "active-staggered",
          sourceName: "Test Setup",
          sourceSkillName: "Test Setup",
          turnsRemaining: 2,
          ...normalizeCombatEffectDefinition(
            {
              id: "staggered",
              name: "Staggered",
              description: "Target is unstable.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
            },
            1
          ),
        },
      ],
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Control",
      availableSkills: [
        {
          id: "guided-control",
          name: "Guided Control",
          description: "Control strike with state follow-through.",
          sourceItemCode: "test-weapon",
          resourceType: "guard",
          cost: 16,
          damageMultiplier: 1.08,
          critChanceBonus: 0,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 0,
            blunt: 10,
            chop: 0,
          },
          roles: ["setup", "control"],
          effects: [
            {
              id: "off-balance",
              name: "Off-Balance",
              description: "Target is easier to punish.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
            },
          ],
          stateBonuses: [
            {
              requiredEffectId: "staggered",
              damageMultiplierBonus: 0.14,
              critChanceBonus: 8,
            },
          ],
          aiHints: {
            prefersTaggedTargets: true,
          },
        },
      ],
    });

    expect(plan.intent).toBe("precise");
  });

  it("keeps guarded intent as the low-hp fallback", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = {
      ...createCombatant(attacker, { guard: 18 }),
      currentHp: 24,
      maxHp: 100,
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant: createCombatant(defender),
      difficulty: "champion",
      archetype: "Burst",
      availableSkills: [
        {
          id: "finisher-strike",
          name: "Finisher Strike",
          description: "Finisher thrust.",
          sourceItemCode: "test-dagger",
          resourceType: "focus",
          cost: 0,
          damageMultiplier: 1.72,
          critChanceBonus: 36,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 58,
            blunt: 0,
            chop: 0,
          },
          roles: ["payoff"],
        },
      ],
    });

    expect(plan.intent).toBe("guarded");
  });

  it("leans aggressive when a burst finisher can capitalize", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { focus: 40 });
    const defenderCombatant = {
      ...createCombatant(defender),
      currentHp: 22,
      maxHp: 100,
    };

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Burst",
      availableSkills: [
        {
          id: "finisher-strike",
          name: "Finisher Strike",
          description: "Finisher thrust.",
          sourceItemCode: "test-dagger",
          resourceType: "focus",
          cost: 26,
          damageMultiplier: 1.72,
          critChanceBonus: 36,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 58,
            blunt: 0,
            chop: 0,
          },
          roles: ["payoff"],
        },
      ],
    });

    expect(plan.intent).toBe("aggressive");
  });

  it("uses precise intent for burst setup turns before the payoff window is open", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker, { focus: 22 });
    const defenderCombatant = createCombatant(defender);

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker,
      defender,
      attackerCombatant,
      defenderCombatant,
      difficulty: "champion",
      archetype: "Burst",
      availableSkills: [
        {
          id: "mark-opening",
          name: "Mark Opening",
          description: "Sets up the execution line.",
          sourceItemCode: "test-dagger",
          resourceType: "focus",
          cost: 14,
          damageMultiplier: 1.04,
          critChanceBonus: 10,
          armorPenetrationPercentBonus: {
            slash: 0,
            pierce: 16,
            blunt: 0,
            chop: 0,
          },
          roles: ["setup"],
          effects: [
            {
              id: "marked-opening",
              name: "Marked Opening",
              description: "Target is primed.",
              kind: "debuff",
              target: "target",
              trigger: "on_hit",
              durationTurns: 2,
            },
          ],
          stateBonuses: [
            {
              requiredEffectId: "marked-opening",
              damageMultiplierBonus: 0.12,
              critChanceBonus: 6,
            },
          ],
          aiHints: {
            prefersTaggedTargets: true,
          },
        },
      ],
    });

    expect(plan.intent).toBe("precise");
  });

  it("sometimes includes legs in defense planning for non-recruit bots", () => {
    const attacker = createSnapshot("Arena Bot");
    const defender = createSnapshot("Player");
    const attackerCombatant = createCombatant(attacker);

    const sawLegs = Array.from({ length: 40 }, (_, index) =>
      planBotRound({
        random: new SeededRandom(1300 + index),
        attacker,
        defender,
        attackerCombatant,
        difficulty: "champion",
        archetype: "Pressure",
      }).defenseZones.includes("legs")
    ).some(Boolean);

    expect(sawLegs).toBe(true);
  });
});

function createSnapshot(
  name: string,
  allocations: Partial<Record<"strength" | "agility" | "rage" | "endurance", number>> = {}
) {
  const characterResult = createCharacter(name);

  if (!characterResult.success) {
    throw new Error(characterResult.reason);
  }

  const allocatedCharacter = applyAllocations(characterResult.data, allocations);

  return buildCombatSnapshot({
    character: allocatedCharacter,
    flatBonuses: [],
    percentBonuses: [],
  });
}

function applyAllocations(
  character: Character,
  allocations: Partial<Record<CharacterStatName, number>>
) {
  let nextCharacter = character;

  for (const statName of Object.keys(allocations) as CharacterStatName[]) {
    const amount = allocations[statName] ?? 0;

    if (amount <= 0) {
      continue;
    }

    const allocationResult = allocateStatPoint(nextCharacter, statName, amount);

    if (!allocationResult.success) {
      throw new Error(allocationResult.reason);
    }

    nextCharacter = allocationResult.data;
  }

  return nextCharacter;
}

function createCombatant(
  snapshot: ReturnType<typeof createSnapshot>,
  resourceOverrides: Partial<{ rage: number; guard: number; momentum: number; focus: number }> = {}
) {
  const combatState = startCombat(snapshot, createSnapshot("Training Dummy"));
  const combatant = combatState.combatants[0];

  return {
    ...combatant,
    resources: {
      ...combatant.resources,
      ...resourceOverrides,
    },
  };
}

