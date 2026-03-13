import { SeededRandom } from "@/core/rng/SeededRandom";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { planBotRound } from "@/orchestration/combat/botRoundPlanner";
import { startCombat } from "@/modules/combat";
import { allocateStatPoint, createCharacter, type Character, type CharacterStatName } from "@/modules/character";

describe("botRoundPlanner", () => {
  it("guards the player's announced attack zone and keeps defense zones unique", () => {
    const botSnapshot = createSnapshot("Arena Bot");
    const playerSnapshot = createSnapshot("Player");

    const plan = planBotRound({
      random: new SeededRandom(1337),
      attacker: botSnapshot,
      defender: playerSnapshot,
      attackerCombatant: createCombatant(botSnapshot),
      difficulty: "veteran",
      opponentAttackZone: "head",
    });

    expect(plan.defenseZones[0]).toBe("head");
    expect(plan.defenseZones[0]).not.toBe(plan.defenseZones[1]);
    expect(plan.reason).toBe("counter_guard");
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
          id: "heartseeker",
          name: "Heartseeker",
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

    expect(plan.skillId).toBe("heartseeker");
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
