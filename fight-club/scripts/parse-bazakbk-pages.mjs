import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = path.resolve("BazaBK");
const PAGES_DIR = path.join(ROOT_DIR, "pages");
const OUTPUT_DIR = path.join(ROOT_DIR, "parsed");
const CATEGORY_DIR = path.join(OUTPUT_DIR, "categories");

const PAGE_CATEGORY_MAP = {
  "armor_belts.html": { group: "armor", key: "belts", slot: "belt" },
  "armor_boots.html": { group: "armor", key: "boots", slot: "boots" },
  "armor_bracers.html": { group: "armor", key: "bracers", slot: "bracers" },
  "armor_gloves.html": { group: "armor", key: "gloves", slot: "gloves" },
  "armor_helms.html": { group: "armor", key: "helms", slot: "helmet" },
  "armor_legs.html": { group: "armor", key: "legs", slot: "pants" },
  "weapons_axes.html": { group: "weapons", key: "axes", weaponFamily: "axe" },
  "weapons_blunts.html": { group: "weapons", key: "blunts", weaponFamily: "blunt" },
  "weapons_knives.html": { group: "weapons", key: "knives", weaponFamily: "knife" },
  "weapons_swords.html": { group: "weapons", key: "swords", weaponFamily: "sword" },
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function decodeWindows1251(buffer) {
  const chars = [];

  for (const byte of buffer) {
    if (byte < 0x80) {
      chars.push(String.fromCharCode(byte));
      continue;
    }

    if (byte >= 0xc0) {
      chars.push(String.fromCharCode(0x0410 + (byte - 0xc0)));
      continue;
    }

    const specialMap = {
      0xa8: 0x0401,
      0xb8: 0x0451,
      0x82: 0x201a,
      0x83: 0x0453,
      0x84: 0x201e,
      0x85: 0x2026,
      0x86: 0x2020,
      0x87: 0x2021,
      0x88: 0x20ac,
      0x89: 0x2030,
      0x8a: 0x0409,
      0x8b: 0x2039,
      0x8c: 0x040a,
      0x8d: 0x040c,
      0x8e: 0x040b,
      0x8f: 0x040f,
      0x90: 0x0452,
      0x91: 0x2018,
      0x92: 0x2019,
      0x93: 0x201c,
      0x94: 0x201d,
      0x95: 0x2022,
      0x96: 0x2013,
      0x97: 0x2014,
      0x99: 0x2122,
      0x9a: 0x0459,
      0x9b: 0x203a,
      0x9c: 0x045a,
      0x9d: 0x045c,
      0x9e: 0x045b,
      0x9f: 0x045f,
      0xa0: 0x00a0,
      0xa1: 0x040e,
      0xa2: 0x045e,
      0xa3: 0x0408,
      0xa4: 0x00a4,
      0xa5: 0x0490,
      0xa6: 0x00a6,
      0xa7: 0x00a7,
      0xa9: 0x00a9,
      0xaa: 0x0404,
      0xab: 0x00ab,
      0xac: 0x00ac,
      0xad: 0x00ad,
      0xae: 0x00ae,
      0xaf: 0x0407,
      0xb0: 0x00b0,
      0xb1: 0x00b1,
      0xb2: 0x0406,
      0xb3: 0x0456,
      0xb4: 0x0491,
      0xb5: 0x00b5,
      0xb6: 0x00b6,
      0xb7: 0x00b7,
      0xb9: 0x2116,
      0xba: 0x0454,
      0xbb: 0x00bb,
      0xbc: 0x0458,
      0xbd: 0x0405,
      0xbe: 0x0455,
      0xbf: 0x0457,
    };

    const codePoint = specialMap[byte] ?? 0xfffd;
    chars.push(String.fromCharCode(codePoint));
  }

  return chars.join("");
}

function readHtml(filePath) {
  const buffer = fs.readFileSync(filePath);
  const utf8Text = buffer.toString("utf8");
  const utf8ReplacementCount = [...utf8Text.matchAll(/\uFFFD/g)].length;

  if (utf8ReplacementCount === 0) {
    return utf8Text;
  }

  return decodeWindows1251(buffer);
}

function cleanText(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&bull;/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(b|strong|span|font|small|i|u)[^>]*>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeBullet(value) {
  return value.replace(/^[•*-]\s*/, "").trim();
}

function extractNumber(value) {
  if (!value) return null;
  const match = value.match(/-?\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : null;
}

function extractDurability(value) {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  return match
    ? { current: Number(match[1]), max: Number(match[2]) }
    : null;
}

function sectionToEntries(sectionText) {
  return sectionText
    .split("\n")
    .map((line) => normalizeBullet(line.trim()))
    .filter(Boolean);
}

function parseLabeledSections(detailsText) {
  const labels = [
    "Требуется минимальное:",
    "Действует на:",
    "Свойства предмета:",
    "Особенности:",
  ];

  const positions = labels
    .map((label) => ({ label, index: detailsText.indexOf(label) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);

  const sections = {
    requirements: [],
    effects: [],
    properties: [],
    features: [],
  };

  for (let i = 0; i < positions.length; i += 1) {
    const current = positions[i];
    const next = positions[i + 1];
    const start = current.index + current.label.length;
    const end = next ? next.index : detailsText.length;
    const content = detailsText.slice(start, end).trim();

    if (current.label === "Требуется минимальное:") {
      sections.requirements = sectionToEntries(content);
    }
    if (current.label === "Действует на:") {
      sections.effects = sectionToEntries(content);
    }
    if (current.label === "Свойства предмета:") {
      sections.properties = sectionToEntries(content);
    }
    if (current.label === "Особенности:") {
      sections.features = sectionToEntries(content);
    }
  }

  return sections;
}

function extractHeaderMeta(blockText) {
  const priceMatches = [...blockText.matchAll(/Цена:\s*([\d.,]+)\s*(екр\.|кр\.)/gi)];
  const prices = {};

  for (const match of priceMatches) {
    const currency = match[2].toLowerCase().replace(".", "");
    prices[currency] = Number(match[1].replace(",", "."));
  }

  const durabilityMatch = blockText.match(/Долговечность:\s*([^\n]+)/i);

  return {
    mass: extractNumber(blockText.match(/\(Масса:\s*([^)]+)\)/i)?.[1] ?? null),
    prices,
    durability: extractDurability(durabilityMatch?.[1] ?? ""),
  };
}

function parseItemBlock(blockHtml, pageMeta, sourceFile) {
  const idMatch = blockHtml.match(/class="itemName"[^>]*HREF="\/items_info\.php\?(\d+)"/i);
  const nameMatch = blockHtml.match(/class="itemName"[^>]*>(.*?)<\/A>/i);
  const imageMatches = [...blockHtml.matchAll(/<img[^>]+src="([^"]+)"/gi)];

  if (!idMatch || !nameMatch) {
    return null;
  }

  const normalizedHtml = blockHtml.replace(/>\s+</g, ">\n<");
  const blockText = cleanText(normalizedHtml);
  const sections = parseLabeledSections(blockText);
  const meta = extractHeaderMeta(blockText);
  const preferredImage = imageMatches
    .map((match) => match[1])
    .find((src) => src.includes("/i/items/"));
  const imageSrc = preferredImage ? preferredImage.replace(/^\/\//, "https://") : null;

  return {
    itemId: Number(idMatch[1]),
    name: cleanText(nameMatch[1]),
    categoryGroup: pageMeta.group,
    categoryKey: pageMeta.key,
    slot: pageMeta.slot ?? null,
    weaponFamily: pageMeta.weaponFamily ?? null,
    sourceFile,
    mass: meta.mass,
    prices: meta.prices,
    durability: meta.durability,
    requirements: sections.requirements,
    effects: sections.effects,
    properties: sections.properties,
    features: sections.features,
    imageSrc,
    imageFileName: imageSrc ? path.basename(new URL(imageSrc).pathname) : null,
    rawText: blockText,
  };
}

function parsePage(filePath) {
  const fileName = path.basename(filePath);
  const pageMeta = PAGE_CATEGORY_MAP[fileName];

  if (!pageMeta) {
    return [];
  }

  const html = readHtml(filePath);
  const blocks = html
    .split(/<table class="libItem"/i)
    .slice(1)
    .map((chunk) => `<table class="libItem"${chunk}`);

  return blocks
    .map((blockHtml) => parseItemBlock(blockHtml, pageMeta, fileName))
    .filter(Boolean)
    .sort((left, right) => left.itemId - right.itemId);
}

function buildSummary(items) {
  const byCategory = {};

  for (const item of items) {
    const key = `${item.categoryGroup}/${item.categoryKey}`;
    byCategory[key] ??= {
      count: 0,
      firstItemId: item.itemId,
      lastItemId: item.itemId,
    };
    byCategory[key].count += 1;
    byCategory[key].firstItemId = Math.min(byCategory[key].firstItemId, item.itemId);
    byCategory[key].lastItemId = Math.max(byCategory[key].lastItemId, item.itemId);
  }

  return {
    generatedAt: new Date().toISOString(),
    rootDir: "BazaBK/pages",
    totalItems: items.length,
    categories: byCategory,
  };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(CATEGORY_DIR);

  const pageFiles = fs
    .readdirSync(PAGES_DIR, { recursive: true })
    .filter((entry) => entry.endsWith(".html"))
    .map((entry) => path.join(PAGES_DIR, entry))
    .filter((filePath) => PAGE_CATEGORY_MAP[path.basename(filePath)]);

  const items = pageFiles.flatMap((filePath) => parsePage(filePath));
  const summary = buildSummary(items);

  for (const [fileName, pageMeta] of Object.entries(PAGE_CATEGORY_MAP)) {
    const categoryItems = items.filter((item) => item.sourceFile === fileName);
    if (categoryItems.length === 0) continue;
    writeJson(
      path.join(CATEGORY_DIR, `${pageMeta.group}_${pageMeta.key}.json`),
      categoryItems,
    );
  }

  writeJson(path.join(OUTPUT_DIR, "catalog.json"), items);
  writeJson(path.join(OUTPUT_DIR, "summary.json"), summary);

  console.log(`Parsed ${items.length} items from ${pageFiles.length} pages.`);
  console.log(`Catalog written to ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "catalog.json"))}`);
  console.log(`Summary written to ${path.relative(process.cwd(), path.join(OUTPUT_DIR, "summary.json"))}`);
}

main();
