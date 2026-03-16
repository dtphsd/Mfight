import type { CombatSkill } from "@/modules/combat";
import type { Item } from "@/modules/inventory";
import type { CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";

const presetToneByArchetype: Record<string, { accent: string; border: string; soft: string }> = {
  Pressure: { accent: "#f0a286", border: "rgba(229,115,79,0.34)", soft: "rgba(229,115,79,0.14)" },
  Defense: { accent: "#b7d5ff", border: "rgba(92,149,227,0.34)", soft: "rgba(92,149,227,0.14)" },
  Burst: { accent: "#ee9abb", border: "rgba(216,93,145,0.34)", soft: "rgba(216,93,145,0.14)" },
  Control: { accent: "#ccc0ff", border: "rgba(130,111,213,0.34)", soft: "rgba(130,111,213,0.14)" },
  Tempo: { accent: "#ffcf8a", border: "rgba(214,177,95,0.34)", soft: "rgba(214,177,95,0.14)" },
  Heavy: { accent: "#f2c3a7", border: "rgba(176,126,96,0.34)", soft: "rgba(176,126,96,0.14)" },
  Sustain: { accent: "#87e2cf", border: "rgba(92,199,178,0.34)", soft: "rgba(92,199,178,0.14)" },
};

export function getPresetTone(archetype?: string | null) {
  return presetToneByArchetype[archetype ?? ""] ?? {
    accent: "#ffe2c2",
    border: "rgba(255,171,97,0.24)",
    soft: "rgba(255,171,97,0.10)",
  };
}

export function clampText(text: string, maxLength: number) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

export function resolveDamagePlan(preset: CombatBuildPreset) {
  if (preset.tags.includes("Crit")) {
    return "Crit spike";
  }
  if (preset.tags.includes("Bleed")) {
    return "Bleed ramp";
  }
  if (preset.tags.includes("Heavy")) {
    return "Heavy punish";
  }
  if (preset.tags.includes("Control")) {
    return "Control drain";
  }

  return "Stable tempo";
}

export function resolveDefensePlan(preset: CombatBuildPreset) {
  if (preset.archetype === "Defense" || preset.archetype === "Sustain") {
    return "High stability";
  }
  if (preset.archetype === "Burst") {
    return "Light defense";
  }

  return "Balanced cover";
}

export function shortFightLength(value: string) {
  return value.replace(" rounds", "r");
}

export function getItemIcon(item: Item) {
  if (item.type === "weapon") {
    return "ATK";
  }
  if (item.type === "shield") {
    return "DEF";
  }
  if (item.type === "consumable") {
    return "USE";
  }
  if (item.type === "ring" || item.type === "ring2" || item.type === "earring") {
    return "MOD";
  }

  return "GEAR";
}

export function getConsumableIcon(item: Item | null) {
  if (!item) {
    return "+";
  }
  if ((item.consumableEffect?.heal ?? 0) > 0) {
    return "HP";
  }

  return "FX";
}

export function formatSlot(slot: string) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "gloves":
      return "Gloves";
    case "boots":
      return "Boots";
    case "ring":
      return "Ring";
    case "ring2":
      return "Ring II";
    case "earring":
      return "Earring";
    default:
      return formatIdLabel(slot);
  }
}

export function formatIdLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatResource(resource: CombatSkill["resourceType"]) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "rage":
      return "Rage";
    default:
      return formatIdLabel(resource);
  }
}

export function formatResourceRestore(item: Item) {
  const restore = item.consumableEffect?.resourceRestore;

  if (!restore) {
    return "None";
  }

  const first = Object.entries(restore).find(([, value]) => typeof value === "number" && value > 0);

  if (!first) {
    return "None";
  }

  return `${formatResource(first[0] as CombatSkill["resourceType"])} +${String(first[1])}`;
}

export function formatUsageMode(item: Item) {
  const usageMode = item.consumableEffect?.usageMode;

  if (usageMode === "with_attack") {
    return "Used with attack";
  }
  if (usageMode === "replace_attack") {
    return "Replaces attack";
  }

  return "Preset consumable";
}

export function formatUsageModeShort(item: Item) {
  const usageMode = item.consumableEffect?.usageMode;

  if (usageMode === "with_attack") {
    return "Linked";
  }
  if (usageMode === "replace_attack") {
    return "Stand-alone";
  }

  return "Basic";
}
