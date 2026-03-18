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
    description: "Stable slash pressure built from low-level Battle Kings steel and practical starter armor.",
    allocations: { strength: 3, agility: 1, rage: 0, endurance: 1 },
    loadout: ["bk-item-206", "bk-item-367", "bk-item-269", "bk-item-399", "bk-item-414", "bk-item-4052", "starter-sigil-pressure"],
    skillLoadout: ["opening-sense", "execution-arc"],
    consumables: ["bandage", "small-potion"],
    tags: ["Slash", "Pressure", "Starter Steel"],
    strengths: ["Reliable slash profile", "Solid early armor coverage", "Simple pressure plan"],
    weaknesses: ["Needs clean trades", "Limited sustain tools", "Can still overcommit into guard"],
    targetFightLength: "11-14 rounds",
  },
  {
    id: "shield-guard",
    label: "Blunt / Guard",
    archetype: "Defense",
    description: "Defensive blunt line using sturdier low-level armor instead of the old sandbox shield package.",
    allocations: { strength: 2, agility: 0, rage: 1, endurance: 2 },
    loadout: ["bk-item-140", "bk-item-4154", "bk-item-270", "bk-item-401", "bk-item-414", "bk-item-258", "bk-item-428", "starter-sigil-guard"],
    skillLoadout: ["shield-bash", "iron-brace"],
    consumables: ["bandage", "regen-potion"],
    tags: ["Guard", "Tank", "Blunt"],
    strengths: ["Highest early durability", "Good all-zone armor stack", "Forgiving for long rounds"],
    weaknesses: ["Lower finishing speed", "Can get outpaced by chop pressure", "Needs good guard timing"],
    targetFightLength: "13-16 rounds",
  },
  {
    id: "dagger-crit",
    label: "Dagger / Crit",
    archetype: "Burst",
    description: "Fast knife line leaning on agility and crit-friendly Battle Kings starter pieces.",
    allocations: { strength: 1, agility: 2, rage: 1, endurance: 1 },
    loadout: ["bk-item-600", "bk-item-368", "bk-item-269", "bk-item-399", "bk-item-412", "bk-item-257", "starter-sigil-burst"],
    skillLoadout: ["execution-mark", "heartseeker"],
    consumables: ["bandage", "small-potion"],
    tags: ["Crit", "Knife", "Agility"],
    strengths: ["Sharp pierce profile", "Good mobility stats", "Punishes light armor"],
    weaknesses: ["Frailer than other presets", "Less flat armor", "Needs initiative"],
    targetFightLength: "10-13 rounds",
  },
  {
    id: "mace-control",
    label: "Mace / Control",
    archetype: "Control",
    description: "Control-oriented mace build built from early Battle Kings blunt weapons and layered defense.",
    allocations: { strength: 2, agility: 0, rage: 1, endurance: 2 },
    loadout: ["bk-item-139", "bk-item-369", "bk-item-268", "bk-item-401", "bk-item-413", "bk-item-258", "bk-item-428", "starter-sigil-control"],
    skillLoadout: ["armor-crush", "crushing-blow"],
    consumables: ["bandage", "regen-potion"],
    tags: ["Blunt", "Control", "Armor"],
    strengths: ["Thick armor baseline", "Steady blunt damage", "Safe pacing"],
    weaknesses: ["Low spike damage", "Little crit conversion", "Can feel slow into swords"],
    targetFightLength: "13-16 rounds",
  },
  {
    id: "axe-pressure",
    label: "Axe / Pressure",
    archetype: "Tempo",
    description: "Starter axe line that pushes low-zone pressure with efficient chop damage.",
    allocations: { strength: 2, agility: 0, rage: 2, endurance: 1 },
    loadout: ["bk-item-611", "bk-item-366", "bk-item-268", "bk-item-400", "bk-item-412", "bk-item-257", "starter-sigil-tempo"],
    skillLoadout: ["open-flank", "hook-chop"],
    consumables: ["bandage", "small-potion"],
    tags: ["Chop", "Pressure", "Low Line"],
    strengths: ["Strong chop profile", "Good into passive guards", "Fast rounds"],
    weaknesses: ["Armor is lighter", "Can lose long trades", "Less reliable versus blunt tanks"],
    targetFightLength: "10-13 rounds",
  },
  {
    id: "heavy-two-hand",
    label: "Heavy / Steel",
    archetype: "Heavy",
    description: "Heavier steel setup using the best available early sword plus denser armor pieces.",
    allocations: { strength: 3, agility: 0, rage: 1, endurance: 1 },
    loadout: ["bk-item-7", "bk-item-4154", "bk-item-4115", "bk-item-586", "bk-item-414", "bk-item-4955", "bk-item-7525", "starter-sigil-heavy"],
    skillLoadout: ["body-check", "killer-focus"],
    consumables: ["small-potion", "bandage"],
    tags: ["Heavy", "Steel", "Slash"],
    strengths: ["Best sword damage in starter pool", "Strong body armor", "Simple damage plan"],
    weaknesses: ["No two-hand mechanics yet", "Slower than knives", "Needs setup before payoff"],
    targetFightLength: "11-14 rounds",
  },
  {
    id: "sustain-regen",
    label: "Sustain / Armor",
    archetype: "Sustain",
    description: "Balanced sustain line using armor layering and consumables instead of the old accessory sustain stack.",
    allocations: { strength: 2, agility: 1, rage: 0, endurance: 1 },
    loadout: ["bk-item-7", "bk-item-367", "bk-item-270", "bk-item-401", "bk-item-413", "bk-item-739", "bk-item-428", "momentum-field-manual"],
    skillLoadout: ["momentum-will-to-win", "momentum-battle-scout"],
    consumables: ["regen-potion", "bandage"],
    tags: ["Sustain", "Armor", "Stability"],
    strengths: ["Best sustain curve in current pool", "Safe armor spread", "Friendly for attrition fights"],
    weaknesses: ["Lower burst", "No accessory spike", "Can get out-damaged by sharp axe lines"],
    targetFightLength: "14-17 rounds",
  },
];

export const botDifficultyConfigs: BotDifficultyConfig[] = [
  {
    id: "recruit",
    label: "Recruit",
    description: "Simpler gear and looser choices. Good for learning the loop.",
    allocations: { strength: 1, agility: 1, rage: 1, endurance: 2 },
    loadout: ["bk-item-6", "bk-item-367", "bk-item-739"],
    plannerProfile: "recruit",
  },
  {
    id: "veteran",
    label: "Veteran",
    description: "Balanced pressure, better armor, and more disciplined guarding.",
    allocations: { strength: 2, agility: 1, rage: 1, endurance: 1 },
    loadout: ["bk-item-206", "bk-item-369", "bk-item-270", "bk-item-401", "bk-item-414"],
    plannerProfile: "veteran",
  },
  {
    id: "champion",
    label: "Champion",
    description: "Best gear in the sandbox, sharper decisions, and active skill usage.",
    allocations: { strength: 2, agility: 1, rage: 2, endurance: 0 },
    loadout: ["bk-item-7", "bk-item-4154", "bk-item-4115", "bk-item-586", "bk-item-414", "bk-item-4955", "bk-item-7525"],
    plannerProfile: "champion",
  },
];
