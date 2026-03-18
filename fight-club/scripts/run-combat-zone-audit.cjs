/* global __dirname, process, require, console */
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("../node_modules/typescript");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const originalResolveFilename = Module._resolveFilename;

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
const { createBasicAttackAction } = require("../src/modules/combat/model/RoundAction.ts");
const { getEquipmentBonuses } = require("../src/modules/equipment/index.ts");
const { createStarterInventory } = require("../src/modules/inventory/index.ts");
const { buildCombatSnapshot } = require("../src/orchestration/combat/buildCombatSnapshot.ts");
const { combatBuildPresets, botDifficultyConfigs } = require("../src/orchestration/combat/combatSandboxConfigs.ts");
const {
  applySandboxAllocations,
  buildSandboxPresetState,
  requireSandboxCharacter,
} = require("../src/orchestration/combat/combatSandboxSupport.ts");

const combatZones = ["head", "chest", "belly", "waist", "legs"];

function parseArgs(args) {
  return args.reduce(
    (options, token, index) => {
      const next = args[index + 1];

      if (token === "--attacker" && next) {
        options.attacker = next;
      }
      if (token === "--defender" && next) {
        options.defender = next;
      }
      if (token === "--runs" && next) {
        options.runs = Math.max(1, Number.parseInt(next, 10) || options.runs);
      }
      if (token === "--difficulty" && next && botDifficultyConfigs.some((entry) => entry.plannerProfile === next)) {
        options.difficulty = next;
      }

      return options;
    },
    {
      attacker: "sword-bleed",
      defender: "shield-guard",
      runs: 20,
      difficulty: "champion",
    }
  );
}

function createFighter(presetId, name) {
  const preset = combatBuildPresets.find((entry) => entry.id === presetId);

  if (!preset) {
    throw new Error(`unknown_preset:${presetId}`);
  }

  const inventory = createStarterInventory();
  const equipmentState = buildSandboxPresetState({
    inventory,
    preset: {
      loadout: preset.loadout,
      allocations: preset.allocations,
      skillLoadout: preset.skillLoadout,
    },
  });
  const character = applySandboxAllocations(requireSandboxCharacter(name), preset.allocations);
  const equipmentBonuses = getEquipmentBonuses(equipmentState.equipment, inventory);
  const snapshot = buildCombatSnapshot({
    character,
    flatBonuses: equipmentBonuses.flatBonuses,
    percentBonuses: equipmentBonuses.percentBonuses,
    baseDamage: equipmentBonuses.baseDamage,
    baseArmor: equipmentBonuses.baseArmor,
    baseZoneArmor: equipmentBonuses.baseZoneArmor,
    armorBySlot: equipmentBonuses.armorBySlot,
    zoneArmorBySlot: equipmentBonuses.zoneArmorBySlot,
    combatBonuses: equipmentBonuses.combatBonuses,
    preferredDamageType: equipmentBonuses.preferredDamageType,
    weaponClass: equipmentBonuses.mainHandWeaponClass,
  });

  return { preset, snapshot };
}

function pickDefenseZones(zone, defended) {
  if (defended) {
    const backup = combatZones.find((entry) => entry !== zone && entry !== "waist") ?? "chest";
    return [zone, backup];
  }

  return combatZones.filter((entry) => entry !== zone).slice(0, 2);
}

function resolveZoneSample(attackerId, defenderId, zone, defended, runIndex) {
  const attacker = createFighter(attackerId, "Zone Audit Attacker");
  const defender = createFighter(defenderId, "Zone Audit Defender");
  const random = new SeededRandom(seedFor(attackerId, defenderId, zone, defended, runIndex));
  const combatState = startCombat(attacker.snapshot, defender.snapshot);

  const resolution = resolveRound(
    combatState,
    [
      createBasicAttackAction({
        attackerId: attacker.snapshot.characterId,
        attackZone: zone,
        defenseZones: ["waist", "legs"],
      }),
      createBasicAttackAction({
        attackerId: defender.snapshot.characterId,
        attackZone: "chest",
        defenseZones: pickDefenseZones(zone, defended),
      }),
    ],
    random
  );

  if (!resolution.success) {
    throw new Error(`resolve_round_failed:${resolution.reason}`);
  }

  const entry = resolution.data.log.find(
    (log) =>
      log.attackerId === attacker.snapshot.characterId &&
      log.attackZone === zone &&
      ["dodge", "hit", "block", "crit", "penetration"].includes(log.type)
  );
  if (!entry) {
    throw new Error("attacker_log_missing");
  }

  return entry;
}

function seedFor(attackerId, defenderId, zone, defended, runIndex) {
  const text = `${attackerId}:${defenderId}:${zone}:${defended ? "guarded" : "open"}:${runIndex}`;
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash || 1337;
}

function summarizeZone(attackerId, defenderId, zone, defended, runs) {
  const samples = Array.from({ length: runs }, (_, runIndex) =>
    resolveZoneSample(attackerId, defenderId, zone, defended, runIndex)
  );

  const totals = samples.reduce(
    (summary, sample) => {
      summary.finalDamage += sample.finalDamage;
      summary.blocks += sample.blocked ? 1 : 0;
      summary.penetrations += sample.penetrated ? 1 : 0;
      summary.crits += sample.crit ? 1 : 0;
      return summary;
    },
    {
      finalDamage: 0,
      blocks: 0,
      penetrations: 0,
      crits: 0,
    }
  );

  return {
    averageFinalDamage: totals.finalDamage / runs,
    blockRate: (totals.blocks / runs) * 100,
    penetrationRate: (totals.penetrations / runs) * 100,
    critRate: (totals.crits / runs) * 100,
    dominantDamageType: mostFrequent(samples.map((sample) => sample.damageType)),
  };
}

function mostFrequent(values) {
  const counts = new Map();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "unknown";
}

function printAudit(options) {
  const attacker = combatBuildPresets.find((entry) => entry.id === options.attacker);
  const defender = combatBuildPresets.find((entry) => entry.id === options.defender);

  if (!attacker || !defender) {
    throw new Error("unknown_attacker_or_defender");
  }

  console.log(`# Combat Zone Audit`);
  console.log(`Attacker: ${attacker.label} (${attacker.id})`);
  console.log(`Defender: ${defender.label} (${defender.id})`);
  console.log(`Runs per zone state: ${options.runs}`);
  console.log("");
  console.log("| Zone | State | Avg Final Damage | Block % | Penetration % | Crit % | Damage Type |");
  console.log("| --- | --- | ---: | ---: | ---: | ---: | --- |");

  for (const zone of combatZones) {
    for (const defended of [false, true]) {
      const result = summarizeZone(options.attacker, options.defender, zone, defended, options.runs);
      console.log(
        `| ${zone} | ${defended ? "defended" : "open"} | ${result.averageFinalDamage.toFixed(2)} | ${result.blockRate.toFixed(0)} | ${result.penetrationRate.toFixed(0)} | ${result.critRate.toFixed(0)} | ${result.dominantDamageType} |`
      );
    }
  }
}

printAudit(parseArgs(process.argv.slice(2)));
