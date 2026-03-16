import type { CharacterStats } from "@/modules/character";
import { armorRange, baseCritChance, baseDodgeChance, combatChanceCaps, combatFormulaConfig, damageRange } from "@/modules/combat";
import type { DamageProfile } from "@/modules/inventory";
import { totalProfileValue } from "@/orchestration/combat/combatPressure";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";

const presetFigureById: Record<string, CombatFigureId> = {
  "sword-bleed": "rush-chip",
  "shield-guard": "quack-core",
  "dagger-crit": "kitsune-bit",
  "mace-control": "neo-scope",
  "axe-pressure": "razor-boar",
  "heavy-two-hand": "hound-drive",
  "sustain-regen": "trash-flux",
};

export function resolvePresetFigure(presetId: string, fallback: CombatFigureId): CombatFigureId {
  return presetFigureById[presetId] ?? fallback;
}

export function buildProfileDerivedStats(input: {
  totalDamage: number;
  stats: CharacterStats;
  totalArmor: number;
  dodgeBonus: number;
  critBonus: number;
  totalCritMultiplier: number;
  baseBlockPenetrationValue: number;
  armorPenetrationPercent: DamageProfile;
}) {
  const totalDodge = baseDodgeChance(input.stats.agility) + input.dodgeBonus;
  const totalCrit = baseCritChance(input.stats.rage) + input.critBonus;
  const antiDodge = Math.min(
    combatChanceCaps.dodgeChance,
    Math.max(0, input.stats.agility * combatFormulaConfig.attackerAgilityDodgePenaltyFactor)
  );
  const antiCrit = Math.min(
    combatChanceCaps.baseCritChance,
    Math.max(0, input.stats.rage * combatFormulaConfig.defenderRageCritPenaltyFactor)
  );
  const totalArmorPenetration = totalProfileValue(input.armorPenetrationPercent);

  return [
    { label: "Damage", value: formatRangeLabel(damageRange(input.totalDamage)), helper: "Current rolled damage range after weapon, stat and gear bonuses." },
    { label: "Armor", value: formatRangeLabel(armorRange(input.totalArmor)), helper: "Current rolled armor range across all damage types." },
    { label: "Dodge", value: `${totalDodge}%`, helper: `Base ${baseDodgeChance(input.stats.agility)}% + bonuses ${input.dodgeBonus}%.` },
    { label: "Crit Chance", value: `${totalCrit}%`, helper: `Base ${baseCritChance(input.stats.rage)}% + bonuses ${input.critBonus}%.` },
    { label: "Anti-Dodge", value: `${antiDodge}%`, helper: "How much enemy dodge is suppressed by your agility." },
    { label: "Anti-Crit", value: `${antiCrit}%`, helper: "How much enemy crit chance is suppressed by your rage." },
    { label: "Crit Damage", value: `x${input.totalCritMultiplier.toFixed(2)}`, helper: "Base multiplier plus endurance and gear bonuses." },
    { label: "Block Penetration", value: `${input.baseBlockPenetrationValue}%`, helper: "Base pressure through guarded hits from strength." },
    { label: "Armor Pen", value: `${totalArmorPenetration}%`, helper: "Combined item-based armor penetration profile." },
  ];
}

export function formatIdLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRangeLabel(range: { min: number; max: number }) {
  return `${range.min}-${range.max}`;
}
