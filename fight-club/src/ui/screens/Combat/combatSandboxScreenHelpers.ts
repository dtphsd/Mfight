import type { ArmorProfile } from "@/modules/inventory";
import type { DamageProfile } from "@/modules/inventory";

export type ActionVisual = {
  ring: string;
  buttonBackground: string;
  innerBackground: string;
  cardBackground: string;
  halo: string;
};

export type CombatRuleEffectSummary = {
  name: string;
  kind: "buff" | "debuff";
  target: "self" | "target";
  durationTurns: number;
  trigger?: "on_use" | "on_hit";
  modifiers?: Partial<{
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    outgoingDamagePercent: number;
    incomingDamagePercent: number;
    armorFlatBonus: ArmorProfile;
    damageFlatBonus: DamageProfile;
    armorPenetrationPercentBonus: DamageProfile;
  }>;
  periodic?: Partial<{
    heal: number;
    damage: number;
    resourceDelta: Partial<{ rage: number; guard: number; momentum: number; focus: number }>;
  }>;
};

export function getSkillIcon(skillName: string, iconHint?: string) {
  const normalizedName = skillName.toLowerCase();
  const normalizedHint = (iconHint ?? "").toLowerCase();

  if (normalizedHint.includes("shield") || normalizedName.includes("shield")) return "\uD83D\uDEE1";
  if (normalizedHint.includes("helmet") || normalizedHint.includes("cap") || normalizedName.includes("head")) return "\uD83E\uDE96";
  if (normalizedHint.includes("armor") || normalizedHint.includes("vest") || normalizedHint.includes("jacket")) return "\uD83E\uDDBA";
  if (normalizedHint.includes("glove") || normalizedHint.includes("gauntlet") || normalizedName.includes("grip")) return "\uD83E\uDDE4";
  if (normalizedHint.includes("boot") || normalizedName.includes("step") || normalizedName.includes("kick")) return "\uD83E\uDD7E";

  if (
    normalizedHint.includes("ring") ||
    normalizedHint.includes("charm") ||
    normalizedHint.includes("earring") ||
    normalizedHint.includes("medallion") ||
    normalizedHint.includes("accessory")
  ) {
    return "\uD83D\uDC8D";
  }

  if (normalizedHint.includes("dagger") || normalizedName.includes("pierc") || normalizedName.includes("lunge")) return "\uD83D\uDDE1";
  if (normalizedHint.includes("axe") || normalizedName.includes("cleave")) return "\uD83E\uDE93";
  if (normalizedHint.includes("mace") || normalizedHint.includes("hammer") || normalizedName.includes("bash")) return "\uD83D\uDD28";
  if (normalizedHint.includes("sword") || normalizedName.includes("slash")) return "\u2694";
  if (normalizedName.includes("shield")) return "\uD83D\uDEE1";
  if (normalizedName.includes("pierc") || normalizedName.includes("lunge") || normalizedName.includes("dagger")) return "\uD83D\uDDE1";
  if (normalizedName.includes("cleave") || normalizedName.includes("slash") || normalizedName.includes("sword")) return "\u2694";

  return "\u2726";
}

export function getConsumableIcon(itemName: string) {
  const normalizedName = itemName.toLowerCase();

  if (normalizedName.includes("potion")) return "\uD83E\uDDEA";
  if (normalizedName.includes("bandage")) return "\uD83E\uDE79";

  return "\u25C9";
}

export function getActionVisual(label: string, iconHint?: string): ActionVisual {
  const normalized = label.toLowerCase();
  const normalizedHint = (iconHint ?? "").toLowerCase();

  if (normalized.includes("potion") || normalized.includes("elixir")) {
    return {
      ring: "rgba(93, 197, 177, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(67,142,126,0.22), rgba(24,53,49,0.3))",
      innerBackground:
        "radial-gradient(circle at 30% 25%, rgba(180,255,238,0.26), transparent 42%), linear-gradient(180deg, rgba(42,94,84,0.62), rgba(18,36,33,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(107,233,212,0.24), transparent 40%), linear-gradient(180deg, rgba(17,44,40,0.98), rgba(8,18,17,0.98))",
      halo: "radial-gradient(circle, rgba(94,233,209,0.42), rgba(94,233,209,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("bandage")) {
    return {
      ring: "rgba(234, 208, 153, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(166,136,79,0.18), rgba(49,39,21,0.28))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,241,202,0.24), transparent 40%), linear-gradient(180deg, rgba(96,73,35,0.54), rgba(34,26,15,0.92))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(255,224,162,0.18), transparent 40%), linear-gradient(180deg, rgba(48,34,20,0.98), rgba(21,15,10,0.98))",
      halo: "radial-gradient(circle, rgba(255,227,175,0.32), rgba(255,227,175,0.06) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("shield") || normalized.includes("guard")) {
    return {
      ring: "rgba(117, 176, 255, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(73,112,171,0.2), rgba(22,34,55,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(212,235,255,0.24), transparent 40%), linear-gradient(180deg, rgba(42,65,103,0.62), rgba(17,27,46,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(111,173,255,0.22), transparent 40%), linear-gradient(180deg, rgba(17,29,49,0.98), rgba(9,16,28,0.98))",
      halo: "radial-gradient(circle, rgba(120,180,255,0.34), rgba(120,180,255,0.08) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("helmet") || normalizedHint.includes("cap")) {
    return {
      ring: "rgba(218, 187, 118, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(167,132,65,0.2), rgba(56,40,17,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,239,197,0.24), transparent 40%), linear-gradient(180deg, rgba(122,94,42,0.62), rgba(42,28,11,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(232,197,116,0.2), transparent 40%), linear-gradient(180deg, rgba(52,38,18,0.98), rgba(24,16,8,0.98))",
      halo: "radial-gradient(circle, rgba(241,206,123,0.32), rgba(241,206,123,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("armor") || normalizedHint.includes("vest") || normalizedHint.includes("jacket")) {
    return {
      ring: "rgba(176, 126, 96, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(130,86,58,0.22), rgba(49,28,19,0.34))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(248,212,193,0.2), transparent 40%), linear-gradient(180deg, rgba(96,59,40,0.62), rgba(34,19,12,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(223,164,126,0.2), transparent 40%), linear-gradient(180deg, rgba(49,28,21,0.98), rgba(19,11,8,0.98))",
      halo: "radial-gradient(circle, rgba(229,168,128,0.3), rgba(229,168,128,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("glove") || normalizedHint.includes("gauntlet")) {
    return {
      ring: "rgba(134, 181, 144, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(79,125,93,0.2), rgba(25,42,31,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(208,241,215,0.22), transparent 40%), linear-gradient(180deg, rgba(51,86,60,0.62), rgba(18,31,21,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(142,216,157,0.2), transparent 40%), linear-gradient(180deg, rgba(19,39,23,0.98), rgba(10,20,12,0.98))",
      halo: "radial-gradient(circle, rgba(147,227,163,0.3), rgba(147,227,163,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("boot")) {
    return {
      ring: "rgba(126, 171, 222, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(67,108,154,0.2), rgba(20,33,52,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(208,229,255,0.22), transparent 40%), linear-gradient(180deg, rgba(42,71,108,0.62), rgba(14,24,40,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(136,185,255,0.2), transparent 40%), linear-gradient(180deg, rgba(17,29,47,0.98), rgba(8,14,24,0.98))",
      halo: "radial-gradient(circle, rgba(141,193,255,0.3), rgba(141,193,255,0.06) 58%, transparent 78%)",
    };
  }

  if (
    normalizedHint.includes("ring") ||
    normalizedHint.includes("charm") ||
    normalizedHint.includes("earring") ||
    normalizedHint.includes("medallion") ||
    normalizedHint.includes("accessory")
  ) {
    return {
      ring: "rgba(194, 126, 212, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(133,78,161,0.2), rgba(40,21,53,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(245,214,255,0.22), transparent 40%), linear-gradient(180deg, rgba(89,50,108,0.62), rgba(28,14,37,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(218,155,255,0.18), transparent 40%), linear-gradient(180deg, rgba(42,22,54,0.98), rgba(17,9,23,0.98))",
      halo: "radial-gradient(circle, rgba(220,160,255,0.3), rgba(220,160,255,0.06) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("slash") || normalized.includes("sword") || normalized.includes("cleave")) {
    return {
      ring: "rgba(224, 130, 91, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(173,85,52,0.2), rgba(54,25,18,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,217,192,0.22), transparent 40%), linear-gradient(180deg, rgba(112,51,35,0.62), rgba(38,17,11,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(235,143,105,0.22), transparent 40%), linear-gradient(180deg, rgba(50,23,17,0.98), rgba(22,10,8,0.98))",
      halo: "radial-gradient(circle, rgba(236,146,108,0.36), rgba(236,146,108,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("pierc") || normalized.includes("lunge") || normalized.includes("dagger")) {
    return {
      ring: "rgba(180, 140, 233, 0.22)",
      buttonBackground: "linear-gradient(180deg, rgba(112,82,164,0.18), rgba(33,22,53,0.3))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(232,215,255,0.22), transparent 40%), linear-gradient(180deg, rgba(72,49,110,0.62), rgba(25,16,42,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(195,154,255,0.18), transparent 40%), linear-gradient(180deg, rgba(38,24,59,0.98), rgba(19,11,30,0.98))",
      halo: "radial-gradient(circle, rgba(197,158,255,0.3), rgba(197,158,255,0.06) 58%, transparent 78%)",
    };
  }

  return {
    ring: "rgba(255,255,255,0.12)",
    buttonBackground: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    innerBackground:
      "radial-gradient(circle at 32% 25%, rgba(255,255,255,0.14), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    cardBackground:
      "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(180deg, rgba(29,26,24,0.98), rgba(14,12,11,0.98))",
    halo: "radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 58%, transparent 78%)",
  };
}

export function formatMaybeTitle(value: string | null) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "None";
}

export function formatSkillDetailLines(skill: {
  damageMultiplier: number;
  critChanceBonus: number;
  armorPenetrationPercentBonus: DamageProfile;
  cooldownTurns?: number;
  requirements?: {
    minLevel?: number;
    notes?: string[];
  };
  unlock?: {
    kind: "item" | "book" | "trainer" | "quest" | "default";
    sourceName?: string;
    note?: string;
  };
  effects?: CombatRuleEffectSummary[];
} | null) {
  if (!skill) return [];

  const lines = [`Damage: x${skill.damageMultiplier.toFixed(2)} weapon damage.`];

  if (skill.critChanceBonus > 0) lines.push(`Crit: Adds +${skill.critChanceBonus}% crit chance.`);
  if (typeof skill.cooldownTurns === "number") lines.push(`Cooldown: ${skill.cooldownTurns} turn${skill.cooldownTurns === 1 ? "" : "s"}.`);
  if (typeof skill.requirements?.minLevel === "number") lines.push(`Level: Requires level ${skill.requirements.minLevel}.`);
  if (skill.requirements?.notes?.length) lines.push(`Requirements: ${skill.requirements.notes.join(" | ")}.`);
  if (skill.unlock) lines.push(`Unlock: ${formatSkillUnlockSummary(skill.unlock)}.`);

  lines.push(...(skill.effects ?? []).map((effect) => `${effect.trigger === "on_hit" ? "On Hit" : "Apply"}: ${formatEffectSummary(effect)}`));

  return [...lines, ...formatDamageProfileBonuses(skill.armorPenetrationPercentBonus, "Pen").map((entry) => `Pen: ${entry}.`)];
}

export function formatConsumableDetailLines(item: {
  consumableEffect?: {
    usageMode: "replace_attack" | "with_attack";
    heal: number;
    resourceRestore: Partial<{ rage: number; guard: number; momentum: number; focus: number }>;
    effects?: Array<CombatRuleEffectSummary>;
  } | null;
} | null) {
  const effect = item?.consumableEffect;
  if (!effect) return [];

  const lines: string[] = [];
  lines.push(`Usage: ${formatConsumableUsageLabel(effect.usageMode)}.`);

  if (effect.heal > 0) lines.push(`Heal: Restores ${effect.heal} HP.`);

  lines.push(
    ...Object.entries(effect.resourceRestore)
      .filter(([, value]) => (value ?? 0) > 0)
      .map(([resource, value]) => `Restore: +${value} ${formatResourceLabel(resource)}.`)
  );

  lines.push(...(effect.effects ?? []).map((entry) => `Apply: ${formatEffectSummary(entry)}`));

  if (lines.length === 1) lines.push("Effect: No healing, restore, or status effect.");
  return lines;
}

export function splitDetailLine(line: string) {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) return { label: "Info", value: line };

  return {
    label: line.slice(0, separatorIndex).trim(),
    value: line.slice(separatorIndex + 1).trim(),
  };
}

export function formatResourceLabel(resource: string) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "guard":
      return "Guard";
    case "rage":
      return "Rage";
    default:
      return resource;
  }
}

function formatConsumableUsageLabel(usageMode: "replace_attack" | "with_attack") {
  switch (usageMode) {
    case "replace_attack":
      return "Separate Action";
    case "with_attack":
      return "With Attack";
  }
}

function formatSkillUnlockSummary(unlock: {
  kind: "item" | "book" | "trainer" | "quest" | "default";
  sourceName?: string;
  note?: string;
}) {
  const label = formatMaybeTitle(unlock.kind);
  const source = unlock.sourceName ? `via ${unlock.sourceName}` : null;
  const note = unlock.note ?? null;
  return [label, source, note].filter((value) => value !== null).join(" ");
}

function formatEffectSummary(effect: CombatRuleEffectSummary) {
  const parts: string[] = [];
  const who = effect.target === "self" ? "Self" : "Target";
  const role = effect.kind === "buff" ? "buff" : "debuff";

  parts.push(`${effect.name} on ${who.toLowerCase()}, ${role}, ${effect.durationTurns}t.`);
  if (effect.modifiers?.critChanceBonus) parts.push(`Crit ${formatSignedValue(effect.modifiers.critChanceBonus)}%.`);
  if (effect.modifiers?.dodgeChanceBonus) parts.push(`Dodge ${formatSignedValue(effect.modifiers.dodgeChanceBonus)}%.`);
  if (effect.modifiers?.blockChanceBonus) parts.push(`Block ${formatSignedValue(effect.modifiers.blockChanceBonus)}%.`);
  if (effect.modifiers?.blockPowerBonus) parts.push(`Block power ${formatSignedValue(effect.modifiers.blockPowerBonus)}%.`);
  if (effect.modifiers?.outgoingDamagePercent) parts.push(`Outgoing damage ${formatSignedValue(effect.modifiers.outgoingDamagePercent)}%.`);
  if (effect.modifiers?.incomingDamagePercent) parts.push(`Incoming damage ${formatSignedValue(effect.modifiers.incomingDamagePercent)}%.`);

  const damageBonus = formatProfileEntries(effect.modifiers?.damageFlatBonus);
  if (damageBonus) parts.push(`Damage ${damageBonus}.`);
  const armorBonus = formatProfileEntries(effect.modifiers?.armorFlatBonus);
  if (armorBonus) parts.push(`Armor ${armorBonus}.`);
  const penBonus = formatProfileEntries(effect.modifiers?.armorPenetrationPercentBonus, "%");
  if (penBonus) parts.push(`Pen ${penBonus}.`);
  if (effect.periodic?.heal) parts.push(`Heals ${effect.periodic.heal} HP each turn.`);
  if (effect.periodic?.damage) parts.push(`Deals ${effect.periodic.damage} HP each turn.`);

  const resourceDelta = formatResourceDelta(effect.periodic?.resourceDelta);
  if (resourceDelta) parts.push(resourceDelta);

  return parts.join(" ");
}

function formatDamageProfileBonuses(profile: DamageProfile, suffix: string) {
  return (Object.entries(profile) as Array<[keyof DamageProfile, number]>)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${formatMaybeTitle(type)} ${suffix} +${value}%`);
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatProfileEntries(
  profile: Partial<Record<keyof DamageProfile, number>> | Partial<Record<keyof ArmorProfile, number>> | undefined,
  suffix = ""
) {
  if (!profile) return "";

  return Object.entries(profile)
    .filter(([, value]) => value && value !== 0)
    .map(([type, value]) => `${formatMaybeTitle(type)} ${formatSignedValue(Number(value))}${suffix}`)
    .join(" | ");
}

function formatResourceDelta(resourceDelta: Partial<{ rage: number; guard: number; momentum: number; focus: number }> | undefined) {
  if (!resourceDelta) return "";

  return Object.entries(resourceDelta)
    .filter(([, value]) => value && value !== 0)
    .map(([resource, value]) => `${formatResourceLabel(resource)} ${formatSignedValue(Number(value))} each turn.`)
    .join(" ");
}
