/* global __dirname, process, require */
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("../node_modules/typescript");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const docsRoot = path.join(projectRoot, "docs", "balance");
const originalResolveFilename = Module._resolveFilename;

const defaultOptions = {
  runs: 10,
  maxRounds: 40,
  difficulty: "champion",
  write: true,
};

function resolveLocalTs(specifier) {
  const candidates = [
    specifier,
    `${specifier}.ts`,
    `${specifier}.tsx`,
    `${specifier}.js`,
    path.join(specifier, "index.ts"),
    path.join(specifier, "index.tsx"),
    path.join(specifier, "index.js"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return specifier;
}

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const mapped = resolveLocalTs(path.join(srcRoot, request.slice(2)));
    return originalResolveFilename.call(this, mapped, parent, isMain, options);
  }

  if (request.startsWith("./") || request.startsWith("../")) {
    const baseDir = parent && parent.filename ? path.dirname(parent.filename) : projectRoot;
    const mapped = resolveLocalTs(path.resolve(baseDir, request));
    return originalResolveFilename.call(this, mapped, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._extensions[".ts"] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  });

  module._compile(transpiled.outputText, filename);
};

const { SeededRandom } = require("../src/core/rng/SeededRandom.ts");
const { startCombat, resolveRound } = require("../src/modules/combat/index.ts");
const { getEquipmentBonuses } = require("../src/modules/equipment/index.ts");
const { createStarterInventory } = require("../src/modules/inventory/index.ts");
const { buildCombatSnapshot } = require("../src/orchestration/combat/buildCombatSnapshot.ts");
const { buildBotRoundAction, planBotRound } = require("../src/orchestration/combat/botRoundPlanner.ts");
const { combatBuildPresets } = require("../src/orchestration/combat/combatSandboxConfigs.ts");
const {
  applySandboxAllocations,
  buildSandboxPresetState,
  fitSandboxAllocationsToBudget,
  getSandboxAllocationBudget,
  requireSandboxCharacter,
} = require("../src/orchestration/combat/combatSandboxSupport.ts");

function parseArgs(args) {
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

    if (token === "--difficulty" && value && ["recruit", "veteran", "champion"].includes(value)) {
      options.difficulty = value;
      index += 1;
      continue;
    }

    if (token === "--no-write") {
      options.write = false;
    }
  }

  return options;
}

function seedFor(leftPresetId, rightPresetId, runIndex) {
  const text = `${leftPresetId}:${rightPresetId}:${runIndex}`;
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash || 1337;
}

function createFighter(presetId, name, budgetOverride) {
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

  return {
    preset,
    snapshot,
    availableSkills: equipmentBonuses.skills.filter((skill) => preset.skillLoadout.includes(skill.id)),
  };
}

function simulateFight(leftPresetId, rightPresetId, options, runIndex) {
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

function runBuildMatrix(options) {
  const matrix = [];
  const totals = new Map(
    combatBuildPresets.map((preset) => [
      preset.id,
      {
        id: preset.id,
        label: preset.label,
        wins: 0,
        losses: 0,
        draws: 0,
        totalAverageRounds: 0,
        matchups: 0,
      },
    ])
  );

  for (const left of combatBuildPresets) {
    for (const right of combatBuildPresets) {
      let leftWins = 0;
      let rightWins = 0;
      let draws = 0;
      let totalRounds = 0;

      for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
        const result = simulateFight(left.id, right.id, options, runIndex);
        totalRounds += result.rounds;

        if (result.winner === "left") {
          leftWins += 1;
        } else if (result.winner === "right") {
          rightWins += 1;
        } else {
          draws += 1;
        }
      }

      const averageRounds = Number((totalRounds / options.runs).toFixed(1));

      matrix.push({
        leftId: left.id,
        leftLabel: left.label,
        rightId: right.id,
        rightLabel: right.label,
        leftWins,
        rightWins,
        draws,
        averageRounds,
      });

      const summary = totals.get(left.id);
      summary.wins += leftWins;
      summary.losses += rightWins;
      summary.draws += draws;
      summary.totalAverageRounds += averageRounds;
      summary.matchups += 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    options,
    presets: combatBuildPresets.map((preset) => ({
      id: preset.id,
      label: preset.label,
      archetype: preset.archetype,
      targetFightLength: preset.targetFightLength,
    })),
    matrix,
    summary: [...totals.values()]
      .map((entry) => ({
        ...entry,
        net: entry.wins - entry.losses,
        averageRounds: Number((entry.totalAverageRounds / Math.max(1, entry.matchups)).toFixed(1)),
      }))
      .sort((left, right) => {
        if (right.net !== left.net) {
          return right.net - left.net;
        }
        return right.wins - left.wins;
      }),
  };
}

function renderMarkdown(report) {
  const labels = report.presets.map((preset) => preset.label);
  const rows = report.presets.map((left) => {
    const cells = report.presets.map((right) => {
      const entry = report.matrix.find(
        (candidate) => candidate.leftId === left.id && candidate.rightId === right.id
      );
      return entry ? `${entry.leftWins}-${entry.rightWins}-${entry.draws} / ${entry.averageRounds}r` : "-";
    });

    return [left.label, ...cells].join(" | ");
  });

  const summaryRows = report.summary.map((entry) =>
    [
      entry.label,
      String(entry.wins),
      String(entry.losses),
      String(entry.draws),
      String(entry.net),
      `${entry.averageRounds}r`,
    ].join(" | ")
  );

  return [
    "# Build Matrix",
    "",
    `Generated: ${report.generatedAt}`,
    `Runs per ordered matchup: ${report.options.runs}`,
    `Max rounds: ${report.options.maxRounds}`,
    `Planner difficulty: ${report.options.difficulty}`,
    "Sandbox parity mode: right preset is clipped to the left preset stat budget.",
    `Preset count: ${report.presets.length}`,
    "",
    "| Build | " + labels.join(" | ") + " |",
    "| " + ["---", ...labels.map(() => "---")].join(" | ") + " |",
    ...rows.map((row) => `| ${row} |`),
    "",
    "## Summary",
    "",
    "| Build | Wins | Losses | Draws | Net | Avg Match Rounds |",
    "| --- | --- | --- | --- | --- | --- |",
    ...summaryRows.map((row) => `| ${row} |`),
    "",
  ].join("\n");
}

function writeReport(report) {
  fs.mkdirSync(docsRoot, { recursive: true });
  const markdown = renderMarkdown(report);
  fs.writeFileSync(path.join(docsRoot, "latest-build-matrix.md"), markdown, "utf8");
  fs.writeFileSync(path.join(docsRoot, "latest-build-matrix.json"), JSON.stringify(report, null, 2), "utf8");
}

function printReport(report) {
  process.stdout.write(renderMarkdown(report));
}

const options = parseArgs(process.argv.slice(2));
const report = runBuildMatrix(options);

if (options.write) {
  writeReport(report);
}

printReport(report);
