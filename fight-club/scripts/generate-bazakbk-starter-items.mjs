import fs from "node:fs";
import path from "node:path";

const CATALOG_PATH = path.resolve("BazaBK/parsed/catalog.json");
const OUTPUT_PATH = path.resolve("src/content/items/generatedBattleKingsStarterItems.ts");

const CATEGORY_SELECTIONS = [
  ["weapons", "swords", 5],
  ["weapons", "knives", 5],
  ["weapons", "blunts", 5],
  ["weapons", "axes", 5],
  ["armor", "helms", 5],
  ["armor", "gloves", 5],
  ["armor", "bracers", 5],
  ["armor", "belts", 5],
  ["armor", "boots", 5],
  ["armor", "legs", 5],
];

const weaponClassByCategory = {
  swords: "sword",
  knives: "dagger",
  blunts: "mace",
  axes: "axe",
};

const armorSlotByCategory = {
  helms: "helmet",
  gloves: "gloves",
  bracers: "bracers",
  belts: "belt",
  boots: "boots",
  legs: "pants",
};

const LEVEL_LABEL = "\u0423\u0440\u043e\u0432\u0435\u043d\u044c";
const STRENGTH_LABEL = "\u0421\u0438\u043b\u0430";
const AGILITY_LABEL = "\u041b\u043e\u0432\u043a\u043e\u0441\u0442\u044c";
const ENDURANCE_LABEL = "\u0412\u044b\u043d\u043e\u0441\u043b\u0438\u0432\u043e\u0441\u0442\u044c";
const INTUITION_LABEL = "\u0418\u043d\u0442\u0443\u0438\u0446\u0438\u044f";
const RAGE_LABEL = "\u042f\u0440\u043e\u0441\u0442\u044c";
const DAMAGE_LABEL = "\u0423\u0440\u043e\u043d";
const HEAD_ARMOR_LABEL = "\u0411\u0440\u043e\u043d\u044f \u0433\u043e\u043b\u043e\u0432\u044b";
const BODY_ARMOR_LABEL = "\u0411\u0440\u043e\u043d\u044f \u043a\u043e\u0440\u043f\u0443\u0441\u0430";
const WAIST_ARMOR_LABEL = "\u0411\u0440\u043e\u043d\u044f \u043f\u043e\u044f\u0441\u0430";
const LEGS_ARMOR_LABEL = "\u0411\u0440\u043e\u043d\u044f \u043d\u043e\u0433";
const CRIT_CHANCE_LABEL = "\u041c\u0444. \u043a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u0443\u0434\u0430\u0440\u0430";
const CRIT_POWER_LABEL = "\u041c\u0444. \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u0438 \u043a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u0443\u0434\u0430\u0440\u0430";
const DODGE_LABEL = "\u0423\u0432\u0435\u0440\u0442\u044b\u0432\u0430\u043d\u0438\u0435";
const ANTI_DODGE_LABEL = "\u041c\u0444. \u043f\u0440\u043e\u0442\u0438\u0432 \u0443\u0432\u0435\u0440\u0442\u044b\u0432\u0430\u043d\u0438\u044f";
const DAMAGE_DEFENSE_LABEL = "\u0417\u0430\u0449\u0438\u0442\u0430 \u043e\u0442 \u0443\u0440\u043e\u043d\u0430";

const statKeyByLabel = {
  [STRENGTH_LABEL]: "strength",
  [AGILITY_LABEL]: "agility",
  [ENDURANCE_LABEL]: "endurance",
  [INTUITION_LABEL]: "rage",
  [RAGE_LABEL]: "rage",
};

function readCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function cleanText(value) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function decodeLines(lines) {
  return lines.map((line) => cleanText(line)).filter(Boolean);
}

function getRequirementNumber(lines, label) {
  const decodedLines = decodeLines(lines);
  const line = decodedLines.find((entry) => entry.startsWith(`${label}:`));
  if (!line) {
    return null;
  }

  const match = line.match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function parseRange(line) {
  if (!line) {
    return null;
  }

  const match = line.match(/(-?\d+)\s*-\s*(-?\d+)/);
  if (!match) {
    return null;
  }

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
}

function toAverage(range) {
  if (!range) {
    return 0;
  }

  return Math.max(0, Math.round((range.min + range.max) / 2));
}

function zeroStats() {
  return {
    strength: 0,
    agility: 0,
    rage: 0,
    endurance: 0,
  };
}

function zeroDamage() {
  return {
    slash: 0,
    pierce: 0,
    blunt: 0,
    chop: 0,
  };
}

function zeroZoneArmor() {
  return {
    head: 0,
    chest: 0,
    belly: 0,
    waist: 0,
    legs: 0,
  };
}

function zeroBonuses() {
  return {
    critChance: 0,
    critMultiplier: 0,
    dodgeChance: 0,
    blockChance: 0,
    blockPower: 0,
    outgoingDamageFlat: zeroDamage(),
    outgoingDamagePercent: zeroDamage(),
    armorFlat: zeroDamage(),
    armorPercent: zeroDamage(),
    armorPenetrationFlat: zeroDamage(),
    armorPenetrationPercent: zeroDamage(),
  };
}

function extractValue(item) {
  const values = Object.values(item.prices ?? {}).filter((value) => typeof value === "number");
  return values.length > 0 ? Math.max(...values) : 0;
}

function getSignedNumber(line) {
  const match = line.match(/[+-]?\d+/);
  return match ? Number(match[0]) : 0;
}

function resolvePrimaryDamageType(categoryKey) {
  switch (categoryKey) {
    case "swords":
      return "slash";
    case "knives":
      return "pierce";
    case "blunts":
      return "blunt";
    case "axes":
      return "chop";
    default:
      return null;
  }
}

function extractStatBonuses(item) {
  const bonuses = zeroStats();

  for (const line of decodeLines(item.effects)) {
    for (const [label, statKey] of Object.entries(statKeyByLabel)) {
      if (!line.startsWith(`${label}:`)) {
        continue;
      }

      bonuses[statKey] += getSignedNumber(line);
    }
  }

  return bonuses;
}

function extractCombatBonuses(item) {
  const bonuses = zeroBonuses();
  const primaryDamageType = resolvePrimaryDamageType(item.categoryKey);

  for (const line of decodeLines(item.effects)) {
    if (line.startsWith(CRIT_CHANCE_LABEL)) {
      bonuses.critChance += Math.max(0, getSignedNumber(line));
      continue;
    }

    if (line.startsWith(CRIT_POWER_LABEL)) {
      bonuses.critMultiplier += Number((getSignedNumber(line) / 100).toFixed(2));
      continue;
    }

    if (line.startsWith(DODGE_LABEL)) {
      bonuses.dodgeChance += getSignedNumber(line);
      continue;
    }

    if (line.startsWith(ANTI_DODGE_LABEL)) {
      const value = Math.max(0, getSignedNumber(line));
      if (primaryDamageType) {
        bonuses.armorPenetrationPercent[primaryDamageType] += value;
      }
      continue;
    }

    if (line.startsWith(DAMAGE_DEFENSE_LABEL)) {
      const scaled = Math.max(0, Math.round(getSignedNumber(line) / 12));
      bonuses.armorFlat.slash += scaled;
      bonuses.armorFlat.pierce += scaled;
      bonuses.armorFlat.blunt += scaled;
      bonuses.armorFlat.chop += scaled;
    }
  }

  return bonuses;
}

function extractZoneArmor(item) {
  const zoneArmor = zeroZoneArmor();

  for (const line of decodeLines([...item.effects, ...item.properties])) {
    const range = parseRange(line);
    if (!range) {
      continue;
    }

    const averageArmor = toAverage(range);

    if (line.startsWith(`${HEAD_ARMOR_LABEL}:`)) {
      zoneArmor.head += averageArmor;
      continue;
    }

    if (line.startsWith(`${BODY_ARMOR_LABEL}:`)) {
      zoneArmor.chest += averageArmor;
      zoneArmor.belly += averageArmor;
      continue;
    }

    if (line.startsWith(`${WAIST_ARMOR_LABEL}:`)) {
      zoneArmor.waist += averageArmor;
      zoneArmor.belly += Math.floor(averageArmor * 0.5);
      continue;
    }

    if (line.startsWith(`${LEGS_ARMOR_LABEL}:`)) {
      zoneArmor.legs += averageArmor;
    }
  }

  return zoneArmor;
}

function createSourceMeta(item) {
  return {
    mass: item.mass ?? null,
    durability: item.durability ?? null,
    requirements: decodeLines(item.requirements),
    effects: decodeLines(item.effects),
    properties: decodeLines(item.properties),
    features: decodeLines(item.features),
    imageFileName: item.imageFileName ?? null,
    imageSrc: item.imageSrc ?? null,
  };
}

function createWeaponItem(item) {
  const sourceMeta = createSourceMeta(item);
  const damageLine = sourceMeta.properties.find((line) => line.startsWith(`${DAMAGE_LABEL}:`)) ?? "";
  const averageDamage = toAverage(parseRange(damageLine));
  const primaryDamageType = resolvePrimaryDamageType(item.categoryKey);
  const baseDamage = zeroDamage();

  if (primaryDamageType) {
    baseDamage[primaryDamageType] = averageDamage;
  }

  const statBonuses = extractStatBonuses(item);
  const combatBonuses = extractCombatBonuses(item);
  const level = getRequirementNumber(item.requirements, LEVEL_LABEL) ?? 1;

  return {
    id: `bk-item-${item.itemId}`,
    code: `bk-item-${item.itemId}`,
    name: cleanText(item.name),
    category: "weapon",
    type: "weapon",
    rarity: level >= 4 ? "rare" : "common",
    description: damageLine,
    value: extractValue(item),
    stackable: false,
    maxStack: 1,
    equip: {
      slot: "mainHand",
      handedness: "one_hand",
      weaponClass: weaponClassByCategory[item.categoryKey],
    },
    baseDamage,
    baseArmor: zeroDamage(),
    baseZoneArmor: zeroZoneArmor(),
    combatBonuses,
    statBonuses,
    flatBonuses: { ...statBonuses },
    percentBonuses: zeroStats(),
    sourceMeta,
  };
}

function createArmorItem(item) {
  const sourceMeta = createSourceMeta(item);
  const slot = armorSlotByCategory[item.categoryKey];
  const armorLines = [...sourceMeta.effects, ...sourceMeta.properties].filter((line) => line.startsWith("\u0411\u0440\u043e\u043d\u044f "));
  const averageArmor = armorLines.length > 0
    ? Math.round(armorLines.map((line) => toAverage(parseRange(line))).reduce((sum, value) => sum + value, 0) / armorLines.length)
    : 0;
  const baseArmor = {
    slash: averageArmor,
    pierce: averageArmor,
    blunt: averageArmor,
    chop: averageArmor,
  };
  const baseZoneArmor = extractZoneArmor(item);
  const statBonuses = extractStatBonuses(item);
  const combatBonuses = extractCombatBonuses(item);
  const level = getRequirementNumber(item.requirements, LEVEL_LABEL) ?? 1;

  return {
    id: `bk-item-${item.itemId}`,
    code: `bk-item-${item.itemId}`,
    name: cleanText(item.name),
    category: "armor",
    type: slot,
    rarity: level >= 4 ? "rare" : "common",
    description: armorLines[0] ?? "",
    value: extractValue(item),
    stackable: false,
    maxStack: 1,
    equip: {
      slot,
      armorClass: slot,
    },
    baseDamage: zeroDamage(),
    baseArmor,
    baseZoneArmor,
    combatBonuses,
    statBonuses,
    flatBonuses: { ...statBonuses },
    percentBonuses: zeroStats(),
    sourceMeta,
  };
}

function selectStarterItems(catalog) {
  return CATEGORY_SELECTIONS.flatMap(([group, key, limit]) =>
    catalog
      .filter((item) => item.categoryGroup === group && item.categoryKey === key)
      .map((item) => ({
        ...item,
        level: getRequirementNumber(item.requirements, LEVEL_LABEL) ?? 999,
      }))
      .filter((item) => item.level <= 4)
      .sort((left, right) => left.level - right.level || left.itemId - right.itemId)
      .slice(0, limit)
  );
}

function createStaticConsumables() {
  return [
    {
      item: {
        id: "small-potion",
        code: "small-potion",
        name: "Small Potion",
        category: "consumable",
        type: "consumable",
        rarity: "common",
        description: "Restores health and a little focus.",
        value: 8,
        stackable: true,
        maxStack: 5,
        equip: null,
        consumableEffect: {
          usageMode: "replace_attack",
          heal: 24,
          resourceRestore: { focus: 8 },
        },
        baseDamage: zeroDamage(),
        baseArmor: zeroDamage(),
        baseZoneArmor: zeroZoneArmor(),
        combatBonuses: zeroBonuses(),
        statBonuses: zeroStats(),
        flatBonuses: zeroStats(),
        percentBonuses: zeroStats(),
      },
      quantity: 2,
    },
    {
      item: {
        id: "bandage",
        code: "bandage",
        name: "Bandage",
        category: "consumable",
        type: "consumable",
        rarity: "common",
        description: "Short sustain consumable with guard restore.",
        value: 3,
        stackable: true,
        maxStack: 10,
        equip: null,
        consumableEffect: {
          usageMode: "with_attack",
          heal: 12,
          resourceRestore: { guard: 6 },
        },
        baseDamage: zeroDamage(),
        baseArmor: zeroDamage(),
        baseZoneArmor: zeroZoneArmor(),
        combatBonuses: zeroBonuses(),
        statBonuses: zeroStats(),
        flatBonuses: zeroStats(),
        percentBonuses: zeroStats(),
      },
      quantity: 3,
    },
    {
      item: {
        id: "regen-potion",
        code: "regen-potion",
        name: "Regen Potion",
        category: "consumable",
        type: "consumable",
        rarity: "rare",
        description: "Regeneration over the next turns.",
        value: 14,
        stackable: true,
        maxStack: 3,
        equip: null,
        consumableEffect: {
          usageMode: "replace_attack",
          heal: 0,
          resourceRestore: {},
          effects: [
            {
              id: "regen-potion-regeneration",
              name: "Regeneration",
              description: "Restores health at the start of each turn.",
              kind: "buff",
              target: "self",
              trigger: "on_use",
              durationTurns: 3,
              periodic: {
                heal: 4,
              },
            },
          ],
        },
        baseDamage: zeroDamage(),
        baseArmor: zeroDamage(),
        baseZoneArmor: zeroZoneArmor(),
        combatBonuses: zeroBonuses(),
        statBonuses: zeroStats(),
        flatBonuses: zeroStats(),
        percentBonuses: zeroStats(),
      },
      quantity: 1,
    },
    {
      item: {
        id: "arena-token",
        code: "arena-token",
        name: "Arena Token",
        category: "material",
        type: "material",
        rarity: "rare",
        description: "Arena material for future reward systems.",
        value: 5,
        stackable: true,
        maxStack: 20,
        equip: null,
        consumableEffect: null,
        baseDamage: zeroDamage(),
        baseArmor: zeroDamage(),
        baseZoneArmor: zeroZoneArmor(),
        combatBonuses: zeroBonuses(),
        statBonuses: zeroStats(),
        flatBonuses: zeroStats(),
        percentBonuses: zeroStats(),
      },
      quantity: 5,
    },
  ];
}

function toTs(value, indent = 0) {
  const spacing = "  ".repeat(indent);
  const nextSpacing = "  ".repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    return `[\n${value.map((entry) => `${nextSpacing}${toTs(entry, indent + 1)}`).join(",\n")}\n${spacing}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "{}";
    }

    return `{\n${entries
      .map(([key, entry]) => `${nextSpacing}${/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key)}: ${toTs(entry, indent + 1)}`)
      .join(",\n")}\n${spacing}}`;
  }

  return JSON.stringify(value);
}

function buildOutput(starterItems) {
  return `import type { Item } from "@/modules/inventory/model/Item";\n\nexport const starterItems: Array<{ item: Item; quantity: number }> = ${toTs(starterItems)};\n`;
}

function main() {
  const catalog = readCatalog();
  const selectedItems = selectStarterItems(catalog);
  const starterGear = selectedItems.map((item) => ({
    item: item.categoryGroup === "weapons" ? createWeaponItem(item) : createArmorItem(item),
    quantity: 1,
  }));
  const starterItems = [...starterGear, ...createStaticConsumables()];

  fs.writeFileSync(OUTPUT_PATH, buildOutput(starterItems));

  console.log(`Generated ${starterItems.length} starter entries.`);
  console.log(`Output: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
