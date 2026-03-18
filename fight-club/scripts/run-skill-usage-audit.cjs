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

function createPresetAuditEntry(preset) {
  return {
    id: preset.id,
    label: preset.label,
    archetype: preset.archetype,
    fights: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalRounds: 0,
    turns: 0,
    affordableTurns: 0,
    skillTurns: 0,
    basicTurns: 0,
    skillDamage: 0,
    basicDamage: 0,
    skillKills: 0,
    stateBonusTriggers: 0,
    effectApplications: 0,
    totalAvailableOptions: 0,
    skills: Object.fromEntries(
      preset.skillLoadout.map((skillId) => [
        skillId,
        {
          uses: 0,
          totalDamage: 0,
          kills: 0,
          stateBonusTriggers: 0,
          effectApplications: 0,
          roundsUsed: [],
        },
      ])
    ),
  };
}

function resolveAffordableSkills(combatant, availableSkills) {
  return availableSkills.filter(
    (skill) =>
      combatant.resources[skill.resourceType] >= skill.cost &&
      ((combatant.skillCooldowns ?? {})[skill.id] ?? 0) <= 0
  );
}

function createTurnContext(combatant, plan, availableSkills) {
  const affordableSkills = resolveAffordableSkills(combatant, availableSkills);

  return {
    combatantId: combatant.id,
    selectedSkillId: plan.skillId,
    selectedSkillName: availableSkills.find((skill) => skill.id === plan.skillId)?.name ?? null,
    selectedSkillTurn: Boolean(plan.skillId),
    attackZone: plan.attackZone,
    affordableSkillCount: affordableSkills.length,
  };
}

function findResolvedAction(logEntries, turnContext) {
  return logEntries.find(
    (entry) =>
      entry.attackerId === turnContext.combatantId &&
      entry.attackZone === turnContext.attackZone &&
      entry.skillName === turnContext.selectedSkillName &&
      ["dodge", "hit", "block", "crit", "penetration"].includes(entry.type)
  ) ?? null;
}

function applyTurnAudit(auditEntry, turnContext, resolvedAction, combatStateRound) {
  auditEntry.turns += 1;
  auditEntry.totalAvailableOptions += turnContext.affordableSkillCount;

  if (turnContext.affordableSkillCount > 0) {
    auditEntry.affordableTurns += 1;
  }

  if (!resolvedAction) {
    if (turnContext.selectedSkillTurn) {
      auditEntry.skillTurns += 1;
    } else {
      auditEntry.basicTurns += 1;
    }
    return;
  }

  if (turnContext.selectedSkillTurn) {
    auditEntry.skillTurns += 1;
    auditEntry.skillDamage += resolvedAction.finalDamage;
    auditEntry.effectApplications += resolvedAction.appliedEffects?.length ?? 0;
    auditEntry.stateBonusTriggers += resolvedAction.messages.includes("state_bonus") ? 1 : 0;

    const matchingSkillEntry = auditEntry.skills[turnContext.selectedSkillId];
    if (matchingSkillEntry) {
      matchingSkillEntry.uses += 1;
      matchingSkillEntry.totalDamage += resolvedAction.finalDamage;
      matchingSkillEntry.effectApplications += resolvedAction.appliedEffects?.length ?? 0;
      matchingSkillEntry.stateBonusTriggers += resolvedAction.messages.includes("state_bonus") ? 1 : 0;
      matchingSkillEntry.roundsUsed.push(combatStateRound);

      if (resolvedAction.knockoutCommentary) {
        matchingSkillEntry.kills += 1;
      }
    }

    if (resolvedAction.knockoutCommentary) {
      auditEntry.skillKills += 1;
    }
    return;
  }

  auditEntry.basicTurns += 1;
  auditEntry.basicDamage += resolvedAction.finalDamage;
}

function simulateFight(leftPresetId, rightPresetId, options, runIndex, auditEntries) {
  const left = createFighter(leftPresetId, "Audit Left");
  const right = createFighter(rightPresetId, "Audit Right", getSandboxAllocationBudget(left.preset.allocations));
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

    const leftTurnContext = createTurnContext(leftCombatant, leftPlan, left.availableSkills);
    const rightTurnContext = createTurnContext(rightCombatant, rightPlan, right.availableSkills);
    const previousLogLength = combatState.log.length;
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

    const nextCombatState = resolution.data;
    const newEntries = nextCombatState.log.slice(previousLogLength);
    applyTurnAudit(
      auditEntries.get(left.preset.id),
      leftTurnContext,
      findResolvedAction(newEntries, leftTurnContext),
      combatState.round
    );
    applyTurnAudit(
      auditEntries.get(right.preset.id),
      rightTurnContext,
      findResolvedAction(newEntries, rightTurnContext),
      combatState.round
    );

    combatState = nextCombatState;
  }

  const leftAudit = auditEntries.get(left.preset.id);
  const rightAudit = auditEntries.get(right.preset.id);
  leftAudit.fights += 1;
  rightAudit.fights += 1;
  leftAudit.totalRounds += combatState.round;
  rightAudit.totalRounds += combatState.round;

  if (combatState.winnerId === left.snapshot.characterId) {
    leftAudit.wins += 1;
    rightAudit.losses += 1;
    return;
  }

  if (combatState.winnerId === right.snapshot.characterId) {
    rightAudit.wins += 1;
    leftAudit.losses += 1;
    return;
  }

  leftAudit.draws += 1;
  rightAudit.draws += 1;
}

function runSkillAudit(options) {
  const auditEntries = new Map(
    combatBuildPresets.map((preset) => [preset.id, createPresetAuditEntry(preset)])
  );

  for (const left of combatBuildPresets) {
    for (const right of combatBuildPresets) {
      for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
        simulateFight(left.id, right.id, options, runIndex, auditEntries);
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    options,
    presets: [...auditEntries.values()].map((entry) => {
      const skillSelectionRate = entry.affordableTurns > 0 ? (entry.skillTurns / entry.affordableTurns) * 100 : 0;
      const averageFightRounds = entry.fights > 0 ? entry.totalRounds / entry.fights : 0;
      const averageSkillDamage = entry.skillTurns > 0 ? entry.skillDamage / entry.skillTurns : 0;
      const averageBasicDamage = entry.basicTurns > 0 ? entry.basicDamage / entry.basicTurns : 0;

      return {
        ...entry,
        averageFightRounds: Number(averageFightRounds.toFixed(1)),
        skillSelectionRate: Number(skillSelectionRate.toFixed(1)),
        averageSkillDamage: Number(averageSkillDamage.toFixed(1)),
        averageBasicDamage: Number(averageBasicDamage.toFixed(1)),
        skills: Object.fromEntries(
          Object.entries(entry.skills).map(([skillId, skillEntry]) => [
            skillId,
            {
              ...skillEntry,
              averageDamage: skillEntry.uses > 0 ? Number((skillEntry.totalDamage / skillEntry.uses).toFixed(1)) : 0,
              averageRoundUsed:
                skillEntry.roundsUsed.length > 0
                  ? Number(
                      (
                        skillEntry.roundsUsed.reduce((total, round) => total + round, 0) / skillEntry.roundsUsed.length
                      ).toFixed(1)
                    )
                  : null,
            },
          ])
        ),
      };
    }),
  };
}

function renderMarkdown(report) {
  const rows = report.presets
    .sort((left, right) => right.skillSelectionRate - left.skillSelectionRate)
    .map((entry) =>
      [
        entry.label,
        entry.archetype,
        String(entry.wins),
        String(entry.losses),
        String(entry.draws),
        `${entry.averageFightRounds}r`,
        String(entry.affordableTurns),
        String(entry.skillTurns),
        `${entry.skillSelectionRate}%`,
        String(entry.stateBonusTriggers),
        `${entry.averageSkillDamage}`,
        `${entry.averageBasicDamage}`,
      ].join(" | ")
    );

  const skillRows = report.presets.flatMap((entry) =>
    Object.entries(entry.skills).map(([skillId, skillEntry]) =>
      [
        entry.label,
        skillId,
        String(skillEntry.uses),
        String(skillEntry.kills),
        String(skillEntry.stateBonusTriggers),
        String(skillEntry.effectApplications),
        String(skillEntry.averageDamage),
        skillEntry.averageRoundUsed === null ? "-" : String(skillEntry.averageRoundUsed),
      ].join(" | ")
    )
  );

  return [
    "# Skill Usage Audit",
    "",
    `Generated: ${report.generatedAt}`,
    `Runs per ordered matchup: ${report.options.runs}`,
    `Max rounds: ${report.options.maxRounds}`,
    `Planner difficulty: ${report.options.difficulty}`,
    "",
    "## Preset Summary",
    "",
    "| Preset | Archetype | Wins | Losses | Draws | Avg Fight Rounds | Affordable Turns | Skill Turns | Skill Pick Rate | State Bonuses | Avg Skill Damage | Avg Basic Damage |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rows.map((row) => `| ${row} |`),
    "",
    "## Skill Breakdown",
    "",
    "| Preset | Skill | Uses | Kills | State Bonuses | Effects Applied | Avg Damage | Avg Round Used |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...skillRows.map((row) => `| ${row} |`),
    "",
  ].join("\n");
}

function writeReport(report) {
  fs.mkdirSync(docsRoot, { recursive: true });
  const markdown = renderMarkdown(report);
  fs.writeFileSync(path.join(docsRoot, "latest-skill-audit.md"), markdown, "utf8");
  fs.writeFileSync(path.join(docsRoot, "latest-skill-audit.json"), JSON.stringify(report, null, 2), "utf8");
}

function printReport(report) {
  process.stdout.write(renderMarkdown(report));
}

const options = parseArgs(process.argv.slice(2));
const report = runSkillAudit(options);

if (options.write) {
  writeReport(report);
}

printReport(report);
