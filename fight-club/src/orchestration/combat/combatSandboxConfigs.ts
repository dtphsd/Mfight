import type { CharacterStatName } from "@/modules/character";

type AllocationMap = Record<CharacterStatName, number>;

export interface CombatBuildPreset {
  id: string;
  label: string;
  archetype: string;
  description: string;
  allocations: AllocationMap;
  loadout: string[];
  skillLoadout: string[];
  consumables: string[];
  tags: string[];
  strengths: string[];
  weaknesses: string[];
  targetFightLength: string;
}

export type BotDifficultyId = "recruit" | "veteran" | "champion";

export interface BotDifficultyConfig {
  id: BotDifficultyId;
  label: string;
  description: string;
  allocations: AllocationMap;
  loadout: string[];
  plannerProfile: "recruit" | "veteran" | "champion";
}

export const zeroAllocations: AllocationMap = {
  strength: 0,
  agility: 0,
  rage: 0,
  endurance: 0,
};

export const combatBuildPresets: CombatBuildPreset[] = [
  {
    id: "sword-bleed",
    label: "Sword / Bleed",
    archetype: "Pressure",
    description: "Stable slash pressure with a bleed window and enough sustain to keep fights around the mid-tempo mark.",
    allocations: { strength: 3, agility: 1, rage: 0, endurance: 1 },
    loadout: ["training-sword", "leather-cap", "leather-vest", "braced-gloves", "trail-boots", "duelist-charm"],
    skillLoadout: [
      "training-sword-feint",
      "training-sword-expose-guard",
      "leather-cap-head-slip",
      "leather-vest-iron-brace",
      "braced-gloves-parry-riposte",
    ],
    consumables: ["bandage", "small-potion"],
    tags: ["Bleed", "Pressure", "Tempo"],
    strengths: ["Reliable damage profile", "Strong anti-armor follow-up", "Good mid-fight stability"],
    weaknesses: ["Limited shield answers", "Needs good zone reads", "Lower burst than crit builds"],
    targetFightLength: "13-16 rounds",
  },
  {
    id: "shield-guard",
    label: "Shield / Guard",
    archetype: "Defense",
    description: "A measured guard build that wins by surviving cleanly, denying tempo, and turning defense into blunt control.",
    allocations: { strength: 2, agility: 0, rage: 1, endurance: 2 },
    loadout: ["training-sword", "oak-shield", "leather-cap", "leather-vest", "braced-gloves", "trail-boots", "war-medallion"],
    skillLoadout: [
      "oak-shield-bash",
      "war-medallion-finisher",
      "braced-gloves-parry-riposte",
      "leather-cap-head-slip",
      "leather-vest-iron-brace",
    ],
    consumables: ["bandage", "regen-potion"],
    tags: ["Guard", "Tank", "Control"],
    strengths: ["High survivability", "Great into random pressure", "Punishes bad guarded attacks"],
    weaknesses: ["Can be outranged by penetration", "Slower kill speed", "More predictable damage plan"],
    targetFightLength: "14-17 rounds",
  },
  {
    id: "dagger-crit",
    label: "Dagger / Crit",
    archetype: "Burst",
    description: "A fast precision setup that leverages Focus and crit windows without becoming a one-turn delete build.",
    allocations: { strength: 1, agility: 3, rage: 1, endurance: 0 },
    loadout: ["training-dagger", "leather-cap", "braced-gloves", "trail-boots", "arena-earring"],
    skillLoadout: [
      "training-dagger-lunge",
      "training-dagger-ghoststep",
      "training-dagger-heartseeker",
      "trail-boots-low-feint",
      "arena-earring-killer-focus",
    ],
    consumables: ["bandage", "small-potion"],
    tags: ["Crit", "Focus", "High Line"],
    strengths: ["Best crit conversion", "Good into low armor", "Strong head punish"],
    weaknesses: ["Less forgiving defense", "Lower sustain", "Can stall into shield-heavy enemies"],
    targetFightLength: "12-15 rounds",
  },
  {
    id: "mace-control",
    label: "Mace / Control",
    archetype: "Control",
    description: "Blunt control build that drains momentum out of guarded fights and makes defensive opponents uncomfortable.",
    allocations: { strength: 1, agility: 0, rage: 1, endurance: 0 },
    loadout: ["training-mace", "oak-shield", "leather-cap", "leather-vest", "braced-gloves", "trail-boots"],
    skillLoadout: [
      "training-mace-crush",
      "training-mace-armor-crush",
      "oak-shield-bash",
      "leather-vest-iron-brace",
      "leather-cap-head-slip",
    ],
    consumables: ["bandage", "regen-potion"],
    tags: ["Blunt", "Control", "Resource Drain"],
    strengths: ["Excellent against shield lines", "High control uptime", "Very safe round-to-round"],
    weaknesses: ["Lower crit threat", "Can struggle to finish fast", "Needs resource discipline"],
    targetFightLength: "14-17 rounds",
  },
  {
    id: "axe-pressure",
    label: "Axe / Pressure",
    archetype: "Tempo",
    description: "Low-line pressure build that keeps chopping at weak guards and forces awkward defensive coverage.",
    allocations: { strength: 2, agility: 0, rage: 2, endurance: 1 },
    loadout: ["sparring-axe", "chain-jacket", "leather-cap", "braced-gloves", "trail-boots", "war-medallion"],
    skillLoadout: [
      "sparring-axe-hook",
      "chain-jacket-body-check",
      "trail-boots-low-feint",
      "braced-gloves-parry-riposte",
      "war-medallion-finisher",
    ],
    consumables: ["bandage", "small-potion"],
    tags: ["Chop", "Pressure", "Waist / Legs"],
    strengths: ["Strong low-zone pressure", "Good rage spending", "Punishes static defense"],
    weaknesses: ["Less stable on long fights", "Wants initiative swings", "Not ideal into hard sustain"],
    targetFightLength: "12-15 rounds",
  },
  {
    id: "heavy-two-hand",
    label: "Heavy / Two-Hand",
    archetype: "Heavy",
    description: "A moderated heavy weapon build that hits hardest, but pays for it with fewer defensive layers and slower recovery.",
    allocations: { strength: 3, agility: 0, rage: 2, endurance: 0 },
    loadout: ["great-training-sword", "leather-vest", "leather-cap", "braced-gloves", "trail-boots", "war-medallion"],
    skillLoadout: [
      "great-training-sword-cleave",
      "great-training-sword-execution-arc",
      "leather-vest-iron-brace",
      "trail-boots-low-feint",
      "braced-gloves-parry-riposte",
      "war-medallion-finisher",
    ],
    consumables: ["small-potion", "bandage"],
    tags: ["Heavy", "Slash", "Finisher"],
    strengths: ["Highest raw threat", "Excellent zone punish", "Simple game plan"],
    weaknesses: ["No shield fallback", "Lower tactical flexibility", "Can be kited by dodge-heavy setups"],
    targetFightLength: "11-14 rounds",
  },
  {
    id: "sustain-regen",
    label: "Sustain / Regen",
    archetype: "Sustain",
    description: "Balanced sustain line that leans on regeneration and safe trades instead of explosive damage spikes.",
    allocations: { strength: 2, agility: 1, rage: 0, endurance: 1 },
    loadout: ["training-sword", "oak-shield", "leather-cap", "leather-vest", "trail-boots", "duelist-charm"],
    skillLoadout: [
      "training-sword-feint",
      "training-sword-expose-guard",
      "oak-shield-bash",
      "leather-cap-head-slip",
      "duelist-charm-opening-sense",
    ],
    consumables: ["regen-potion", "bandage"],
    tags: ["Sustain", "Stability", "Midrange"],
    strengths: ["Best recovery line", "Forgiving to pilot", "Good into bleed attrition"],
    weaknesses: ["Lowest burst ceiling", "Can lose tempo to control", "Needs careful consumable timing"],
    targetFightLength: "15-18 rounds",
  },
];

export const botDifficultyConfigs: BotDifficultyConfig[] = [
  {
    id: "recruit",
    label: "Recruit",
    description: "Simpler gear and looser choices. Good for learning the loop.",
    allocations: { strength: 1, agility: 1, rage: 1, endurance: 2 },
    loadout: ["training-sword", "leather-vest", "trail-boots"],
    plannerProfile: "recruit",
  },
  {
    id: "veteran",
    label: "Veteran",
    description: "Balanced pressure, better armor, and more disciplined guarding.",
    allocations: { strength: 2, agility: 1, rage: 1, endurance: 1 },
    loadout: ["training-sword", "oak-shield", "leather-cap", "leather-vest", "braced-gloves"],
    plannerProfile: "veteran",
  },
  {
    id: "champion",
    label: "Champion",
    description: "Best gear in the sandbox, sharper decisions, and active skill usage.",
    allocations: { strength: 2, agility: 1, rage: 2, endurance: 0 },
    loadout: ["great-training-sword", "leather-cap", "chain-jacket", "braced-gloves", "trail-boots", "war-medallion"],
    plannerProfile: "champion",
  },
];
