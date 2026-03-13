import { SeededRandom } from "../src/core/rng/SeededRandom";
import { pathToFileURL } from "node:url";
import { startCombat, resolveRound } from "../src/modules/combat";
import { getEquipmentBonuses } from "../src/modules/equipment";
import { createStarterInventory } from "../src/modules/inventory";
import { buildCombatSnapshot } from "../src/orchestration/combat/buildCombatSnapshot";
import { buildBotRoundAction, planBotRound } from "../src/orchestration/combat/botRoundPlanner";
import { combatBuildPresets } from "../src/orchestration/combat/combatSandboxConfigs";
import {
  applySandboxAllocations,
  buildSandboxPresetState,
  fitSandboxAllocationsToBudget,
  getSandboxAllocationBudget,
  requireSandboxCharacter,
} from "../src/orchestration/combat/combatSandboxSupport";

type MatrixOptions = {
  runs: number;
  maxRounds: number;
  difficulty: "recruit" | "veteran" | "champion";
};

export type MatchResult = {
  leftWins: number;
  rightWins: number;
  draws: number;
  averageRounds: number;
};

const defaultOptions: MatrixOptions = {
  runs: 10,
  maxRounds: 40,
  difficulty: "champion",
};

export function runBuildMatrix(options: Partial<MatrixOptions> = {}) {
  const resolvedOptions: MatrixOptions = {
    ...defaultOptions,
    ...options,
  };
  const presets = combatBuildPresets;
  const matrix = new Map<string, MatchResult>();
  const totals = new Map(
    presets.map((preset) => [
      preset.id,
      {
        label: preset.label,
        wins: 0,
        losses: 0,
        draws: 0,
        rounds: 0,
        matches: 0,
      },
    ])
  );

  for (const left of presets) {
    for (const right of presets) {
      const result = runMatchup(left.id, right.id, resolvedOptions);
      matrix.set(`${left.id}__${right.id}`, result);

      const leftTotal = totals.get(left.id)!;
      leftTotal.wins += result.leftWins;
      leftTotal.losses += result.rightWins;
      leftTotal.draws += result.draws;
      leftTotal.rounds += result.averageRounds;
      leftTotal.matches += 1;
    }
  }

  return {
    options: resolvedOptions,
    presets,
    matrix,
    totals: Array.from(totals.values()),
  };
}

function main() {
  const result = runBuildMatrix(parseArgs(process.argv.slice(2)));

  console.log(`# Build Matrix`);
  console.log(
    `Runs per ordered matchup: ${result.options.runs}, max rounds: ${result.options.maxRounds}, planner: ${result.options.difficulty}`
  );
  console.log("Sandbox parity mode: right preset is clipped to the left preset stat budget.");
  console.log(
    `Current curated presets in code: ${result.presets.length} (${result.presets.map((preset) => preset.label).join(", ")})`
  );
  console.log("");
  console.log(
    renderMatrix(
      result.presets.map((preset) => preset.label),
      result.presets.map((preset) => preset.id),
      result.matrix
    )
  );
  console.log("");
  console.log("## Summary");
  console.log(renderSummaryTable(result.totals));
}

function runMatchup(leftPresetId: string, rightPresetId: string, options: MatrixOptions): MatchResult {
  let leftWins = 0;
  let rightWins = 0;
  let draws = 0;
  let totalRounds = 0;

  for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
    const result = simulateFight(leftPresetId, rightPresetId, options, runIndex);

    totalRounds += result.rounds;

    if (result.winner === "left") {
      leftWins += 1;
    } else if (result.winner === "right") {
      rightWins += 1;
    } else {
      draws += 1;
    }
  }

  return {
    leftWins,
    rightWins,
    draws,
    averageRounds: Number((totalRounds / options.runs).toFixed(1)),
  };
}

function simulateFight(
  leftPresetId: string,
  rightPresetId: string,
  options: MatrixOptions,
  runIndex: number
): { winner: "left" | "right" | "draw"; rounds: number } {
  const left = createFighter(leftPresetId, "Matrix Left");
  const right = createFighter(rightPresetId, "Matrix Right", getSandboxAllocationBudget(left.preset.allocations));
  const random = new SeededRandom(seedFor(leftPresetId, rightPresetId, runIndex));
  let combatState = startCombat(left.snapshot, right.snapshot);

  while (combatState.status === "active" && combatState.round <= options.maxRounds) {
    const leftCombatant = combatState.combatants.find((combatant) => combatant.id === left.snapshot.characterId);
    const rightCombatant = combatState.combatants.find((combatant) => combatant.id === right.snapshot.characterId);

    if (!leftCombatant || !rightCombatant) {
      throw new Error("combatant_not_found");
    }

    const leftPlan = planBotRound({
      random,
      attacker: left.snapshot,
      defender: right.snapshot,
      attackerCombatant: leftCombatant,
      defenderCombatant: rightCombatant,
      availableSkills: left.availableSkills,
      difficulty: options.difficulty,
      archetype: left.preset.archetype,
    });

    const rightPlan = planBotRound({
      random,
      attacker: right.snapshot,
      defender: left.snapshot,
      attackerCombatant: rightCombatant,
      defenderCombatant: leftCombatant,
      availableSkills: right.availableSkills,
      difficulty: options.difficulty,
      archetype: right.preset.archetype,
    });

    const resolution = resolveRound(
      combatState,
      [
        buildBotRoundAction(leftPlan, leftCombatant.id, left.availableSkills),
        buildBotRoundAction(rightPlan, rightCombatant.id, right.availableSkills),
      ],
      random
    );

    if (!resolution.success) {
      throw new Error(`resolve_round_failed:${resolution.reason}`);
    }

    combatState = resolution.data;
  }

  if (combatState.winnerId === left.snapshot.characterId) {
    return { winner: "left", rounds: combatState.round };
  }

  if (combatState.winnerId === right.snapshot.characterId) {
    return { winner: "right", rounds: combatState.round };
  }

  return { winner: "draw", rounds: combatState.round };
}

function createFighter(presetId: string, name: string, budgetOverride?: number) {
  const preset = combatBuildPresets.find((entry) => entry.id === presetId);

  if (!preset) {
    throw new Error(`unknown_preset:${presetId}`);
  }

  const allocations =
    budgetOverride === undefined
      ? preset.allocations
      : fitSandboxAllocationsToBudget(preset.allocations, budgetOverride);
  const inventory = createStarterInventory();
  const equipmentState = buildSandboxPresetState({
    inventory,
    preset: {
      loadout: preset.loadout,
      allocations,
      skillLoadout: preset.skillLoadout,
    },
  });
  const character = applySandboxAllocations(requireSandboxCharacter(name), allocations);
  const equipmentBonuses = getEquipmentBonuses(equipmentState.equipment, inventory);
  const snapshot = buildCombatSnapshot({
    character,
    flatBonuses: equipmentBonuses.flatBonuses,
    percentBonuses: equipmentBonuses.percentBonuses,
    baseDamage: equipmentBonuses.baseDamage,
    baseArmor: equipmentBonuses.baseArmor,
    armorBySlot: equipmentBonuses.armorBySlot,
    combatBonuses: equipmentBonuses.combatBonuses,
    preferredDamageType: equipmentBonuses.preferredDamageType,
    weaponClass: equipmentBonuses.mainHandWeaponClass,
  });
  const availableSkills = equipmentBonuses.skills.filter((skill) => preset.skillLoadout.includes(skill.id));

  return {
    preset,
    snapshot,
    availableSkills,
  };
}

function renderMatrix(labels: string[], ids: string[], matrix: Map<string, MatchResult>) {
  const header = ["Build", ...labels].join(" | ");
  const separator = ["---", ...labels.map(() => "---")].join(" | ");
  const rows = ids.map((leftId, index) => {
    const row = [labels[index]];
    for (const rightId of ids) {
      const cell = matrix.get(`${leftId}__${rightId}`);
      row.push(cell ? `${cell.leftWins}-${cell.rightWins}-${cell.draws} / ${cell.averageRounds}r` : "-");
    }
    return row.join(" | ");
  });

  return [header, separator, ...rows].join("\n");
}

function renderSummaryTable(
  summary: Array<{ label: string; wins: number; losses: number; draws: number; rounds: number; matches: number }>
) {
  const ordered = [...summary].sort((left, right) => {
    const leftScore = left.wins - left.losses;
    const rightScore = right.wins - right.losses;
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }
    return right.wins - left.wins;
  });

  const header = ["Build", "Wins", "Losses", "Draws", "Net", "Avg Match Rounds"].join(" | ");
  const separator = ["---", "---", "---", "---", "---", "---"].join(" | ");
  const rows = ordered.map((entry) =>
    [
      entry.label,
      String(entry.wins),
      String(entry.losses),
      String(entry.draws),
      String(entry.wins - entry.losses),
      (entry.rounds / Math.max(1, entry.matches)).toFixed(1),
    ].join(" | ")
  );

  return [header, separator, ...rows].join("\n");
}

function seedFor(leftPresetId: string, rightPresetId: string, runIndex: number) {
  const text = `${leftPresetId}:${rightPresetId}:${runIndex}`;
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash || 1337;
}

function parseArgs(args: string[]): MatrixOptions {
  const options = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    const value = args[index + 1];

    if (token === "--runs" && value) {
      options.runs = Math.max(1, Number.parseInt(value, 10) || options.runs);
      index += 1;
      continue;
    }

    if (token === "--max-rounds" && value) {
      options.maxRounds = Math.max(1, Number.parseInt(value, 10) || options.maxRounds);
      index += 1;
      continue;
    }

    if (token === "--difficulty" && value && (value === "recruit" || value === "veteran" || value === "champion")) {
      options.difficulty = value;
      index += 1;
    }
  }

  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
