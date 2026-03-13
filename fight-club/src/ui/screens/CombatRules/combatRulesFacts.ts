import { starterItems } from "@/content/items/starterItems";

import type { Locale, RuleSection, RuleTone } from "./types";

const showcasedItemCodes = [
  "training-sword",
  "training-dagger",
  "training-mace",
  "sparring-axe",
  "oak-shield",
  "great-training-sword",
] as const;

type ShowcasedItemCode = (typeof showcasedItemCodes)[number];

const showcasedSkillItemCodes = [
  ...showcasedItemCodes,
  "leather-cap",
  "leather-vest",
  "chain-jacket",
  "braced-gloves",
  "trail-boots",
  "duelist-charm",
  "arena-earring",
  "war-medallion",
] as const;

const resourceToneByType: Record<string, RuleTone> = {
  momentum: "strength",
  focus: "agility",
  guard: "armor",
  rage: "rage",
};

function getShowcasedItems() {
  return showcasedItemCodes
    .map((code) => starterItems.find((entry) => entry.item.code === code)?.item)
    .filter((item) => item !== undefined);
}

function getShowcasedSkillItems() {
  return showcasedSkillItemCodes
    .map((code) => starterItems.find((entry) => entry.item.code === code)?.item)
    .filter((item) => item !== undefined);
}

function formatDamageProfilePercent(
  profile: Record<"slash" | "pierce" | "blunt" | "chop", number>,
  locale: Locale
) {
  const total = Object.values(profile).reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return locale === "ru" ? "Нет weapon-profile; защита и block utility" : "No weapon profile; defense and block utility";
  }

  return (Object.entries(profile) as Array<[keyof typeof profile, number]>)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${Math.round((value / total) * 100)}% ${type}`)
    .join(" / ");
}

function formatPenetrationPercent(
  profile: Record<"slash" | "pierce" | "blunt" | "chop", number>,
  locale: Locale
) {
  const parts = (Object.entries(profile) as Array<[keyof typeof profile, number]>)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${value}% ${type}`);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return locale === "ru" ? "Нет базового penetration" : "No base penetration";
}

function formatSkillCost(resourceType: string, cost: number) {
  return `${cost} ${resourceType[0].toUpperCase()}${resourceType.slice(1)}`;
}

function getItemTone(code: ShowcasedItemCode): RuleTone {
  switch (code) {
    case "training-sword":
    case "great-training-sword":
    case "training-mace":
    case "sparring-axe":
      return "strength";
    case "training-dagger":
      return "agility";
    case "oak-shield":
      return "armor";
  }
}

export function createStarterItemRows(locale: Locale) {
  return getShowcasedItems().map((item) => {
    const skill = item.skills?.[0];
    const skillValue = skill
      ? `${skill.name}, ${formatSkillCost(skill.resourceType, skill.cost)}`
      : locale === "ru"
        ? "Нет item skill"
        : "No item skill";

    const penetration = formatPenetrationPercent(item.combatBonuses.armorPenetrationPercent, locale);
    const shieldSkillPen = skill
      ? formatPenetrationPercent(skill.armorPenetrationPercentBonus, locale)
      : "";

    return [
      item.name,
      formatDamageProfilePercent(item.baseDamage, locale),
      penetration === (locale === "ru" ? "Нет базового penetration" : "No base penetration") && shieldSkillPen
        ? `${shieldSkillPen} ${locale === "ru" ? "через" : "via"} ${skill?.name}`
        : penetration,
      skillValue,
    ];
  });
}

export function createStarterSkillCallouts() {
  return getShowcasedSkillItems()
    .flatMap((item) =>
      (item.skills ?? []).map((skill) => ({
        label: skill.name,
        value: `${skill.cost} ${skill.resourceType[0].toUpperCase()}${skill.resourceType.slice(1)}, x${skill.damageMultiplier} dmg, +${skill.critChanceBonus}% crit${formatSkillPenSuffix(skill.armorPenetrationPercentBonus)}${formatSkillEffectSuffix(skill.effects)}`,
        tone: resourceToneByType[skill.resourceType] ?? getItemTone(item.code as ShowcasedItemCode),
      }))
    );
}

function formatSkillPenSuffix(
  profile: Record<"slash" | "pierce" | "blunt" | "chop", number>
) {
  const parts = (Object.entries(profile) as Array<[keyof typeof profile, number]>)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `+${value}% ${type} pen`);

  return parts.length > 0 ? `, ${parts.join(", ")}` : "";
}

function formatSkillEffectSuffix(
  effects:
    | Array<{
        name: string;
        kind: "buff" | "debuff";
        durationTurns: number;
      }>
    | undefined
) {
  if (!effects || effects.length === 0) {
    return "";
  }

  return effects
    .map((effect) => `, ${effect.name} (${effect.kind}, ${effect.durationTurns}t)`)
    .join("");
}

export function withGeneratedCombatRulesFacts(content: RuleSection[], locale: Locale): RuleSection[] {
  return content.map((section) => {
    if (section.id === "items" && section.table) {
      return {
        ...section,
        table: {
          ...section.table,
          rows: createStarterItemRows(locale),
        },
      };
    }

    if (section.id === "skills") {
      return {
        ...section,
        callouts: createStarterSkillCallouts(),
      };
    }

    return section;
  });
}
