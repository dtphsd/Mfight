import { starterItems } from "@/content/items/starterItems";

import type { Locale, RuleSection, RuleTone } from "./types";

const resourceToneByType: Record<string, RuleTone> = {
  momentum: "strength",
  focus: "agility",
  guard: "armor",
  rage: "rage",
};

function getShowcasedItems() {
  return starterItems
    .map((entry) => entry.item)
    .filter((item) => item.type === "weapon")
    .slice(0, 6);
}

function getShowcasedSkillItems() {
  return starterItems
    .map((entry) => entry.item)
    .filter((item) => (item.skills?.length ?? 0) > 0);
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

function getItemTone(item: { type: string; equip?: { weaponClass?: string } | null }): RuleTone {
  if (item.type === "helmet" || item.type === "bracers" || item.type === "belt" || item.type === "pants" || item.type === "boots" || item.type === "gloves") {
    return "armor";
  }

  if (item.equip?.weaponClass === "dagger") {
    return "agility";
  }

  return "strength";
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

export function createStarterSkillCallouts(locale: Locale) {
  return getShowcasedSkillItems()
    .flatMap((item) =>
      (item.skills ?? []).map((skill) => ({
        label: skill.name,
        value: `${skill.cost} ${skill.resourceType[0].toUpperCase()}${skill.resourceType.slice(1)}, x${skill.damageMultiplier} dmg, +${skill.critChanceBonus}% crit${formatSkillCooldownSuffix(skill.cooldownTurns)}${formatSkillRequirementSuffix(skill.requirements, locale)}${formatSkillUnlockSuffix(skill.unlock, locale)}${formatSkillPenSuffix(skill.armorPenetrationPercentBonus)}${formatSkillEffectSuffix(skill.effects)}${formatSkillStateBonusSuffix(skill.stateBonuses, locale)}`,
        tone: resourceToneByType[skill.resourceType] ?? getItemTone(item),
      }))
    );
}

function formatSkillCooldownSuffix(cooldownTurns: number | undefined) {
  if (typeof cooldownTurns !== "number") {
    return "";
  }

  return `, cd ${cooldownTurns}t`;
}

function formatSkillRequirementSuffix(
  requirements:
    | {
        minLevel?: number;
        notes?: string[];
      }
    | undefined,
  locale: Locale
) {
  if (!requirements) {
    return "";
  }

  const parts: string[] = [];

  if (typeof requirements.minLevel === "number") {
    parts.push(locale === "ru" ? `lvl ${requirements.minLevel}+` : `lvl ${requirements.minLevel}+`);
  }

  if (requirements.notes?.length) {
    parts.push(...requirements.notes);
  }

  return parts.length > 0 ? `, req ${parts.join(" / ")}` : "";
}

function formatSkillUnlockSuffix(
  unlock:
    | {
        kind: "item" | "book" | "trainer" | "quest" | "default";
        sourceName?: string;
        note?: string;
      }
    | undefined,
  locale: Locale
) {
  if (!unlock || unlock.kind === "default") {
    return "";
  }

  const base = locale === "ru" ? "unlock" : "unlock";
  const source = unlock.sourceName ? ` ${unlock.sourceName}` : "";
  const note = unlock.note ? ` ${unlock.note}` : "";

  return `, ${base} ${unlock.kind}${source}${note}`;
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

function formatSkillStateBonusSuffix(
  stateBonuses:
    | Array<{
        requiredEffectId: string;
        damageMultiplierBonus?: number;
        critChanceBonus?: number;
      }>
    | undefined,
  locale: Locale
) {
  if (!stateBonuses || stateBonuses.length === 0) {
    return "";
  }

  return stateBonuses
    .map((bonus) => {
      const stateName =
        bonus.requiredEffectId === "state-exposed"
          ? "Exposed"
          : bonus.requiredEffectId === "state-staggered"
            ? "Staggered"
            : bonus.requiredEffectId;
      const payload = [
        bonus.damageMultiplierBonus ? `+${Math.round(bonus.damageMultiplierBonus * 100)}% dmg` : null,
        bonus.critChanceBonus ? `+${bonus.critChanceBonus}% crit` : null,
      ]
        .filter((value) => value !== null)
        .join(", ");

      return locale === "ru"
        ? `, bonus vs ${stateName}${payload ? `: ${payload}` : ""}`
        : `, bonus vs ${stateName}${payload ? `: ${payload}` : ""}`;
    })
    .join("");
}

function createStatePrimerCallouts(locale: Locale) {
  return [
    {
      label: "Exposed",
      value:
        locale === "ru"
          ? "2 хода, до 2 stacks: +8% incoming damage за stack. Это setup-окно под finishers."
          : "2 turns, up to 2 stacks: +8% incoming damage per stack. This is a setup window for finishers.",
      tone: "pierce" as const,
    },
    {
      label: "Staggered",
      value:
        locale === "ru"
          ? "2 хода, до 2 stacks: -6 block power и -4 dodge bonus за stack. Это anti-guard pressure."
          : "2 turns, up to 2 stacks: -6 block power and -4 dodge bonus per stack. This creates anti-guard pressure.",
      tone: "blunt" as const,
    },
    {
      label: locale === "ru" ? "Setup -> Payoff" : "Setup -> Payoff",
      value:
        locale === "ru"
          ? "Некоторые навыки готовят окно через Exposed или Staggered, а следующие удары и добивающие кнопки усиливаются по этим состояниям."
          : "Some skills create Exposed or Staggered windows, and follow-up attacks or finishers hit harder during those states.",
      tone: "strength" as const,
    },
  ];
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
        callouts: [...createStatePrimerCallouts(locale), ...createStarterSkillCallouts(locale)],
      };
    }

    return section;
  });
}
