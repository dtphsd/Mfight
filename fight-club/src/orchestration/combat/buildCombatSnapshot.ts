import type { CharacterStats } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import { combatProgressionConfig } from "@/modules/combat/config/combatConfig";
import { zeroCharacterStats } from "@/modules/character";
import {
  zeroArmorProfile,
  zeroCombatBonuses,
  zeroDamageProfile,
  zeroZoneArmorProfile,
  type ArmorProfile,
  type DamageProfile,
  type ZoneArmorProfile,
} from "@/modules/inventory";
import {
  cloneCombatBonuses,
  cloneDamageProfile,
  cloneZoneArmorProfile,
  type CombatSnapshot,
  type CombatSnapshotBuilderInput,
} from "@/orchestration/combat/combatSnapshot";

export function buildCombatSnapshot(input: CombatSnapshotBuilderInput): CombatSnapshot {
  const {
    character,
    flatBonuses,
    percentBonuses,
    baseDamage = zeroDamageProfile,
    baseArmor = zeroArmorProfile,
    baseZoneArmor = zeroZoneArmorProfile,
    armorBySlot = {},
    zoneArmorBySlot = {},
    combatBonuses = zeroCombatBonuses,
    preferredDamageType = null,
    weaponClass = null,
  } = input;

  if (!character) {
    throw new Error("missing_character");
  }

  const totalFlat = sumStatBonuses(flatBonuses);
  const totalPercent = sumStatBonuses(percentBonuses);
  const stats = resolveStats(character.baseStats, totalFlat, totalPercent);
  const normalizedCombatBonuses = cloneCombatBonuses(combatBonuses);
  const damage = resolveProfile(
    baseDamage,
    normalizedCombatBonuses.outgoingDamageFlat,
    normalizedCombatBonuses.outgoingDamagePercent
  );
  const armor = resolveArmorProfile(
    baseArmor,
    normalizedCombatBonuses.armorFlat,
    normalizedCombatBonuses.armorPercent
  );
  const zoneArmor = resolveZoneArmorProfile(
    baseZoneArmor,
    normalizedCombatBonuses.armorFlat,
    normalizedCombatBonuses.armorPercent
  );

  return {
    characterId: character.id,
    name: character.name,
    stats,
    maxHp: calculateMaxHp(stats.endurance),
    damage,
    armor,
    zoneArmor,
    armorBySlot: cloneArmorProfilesBySlot(armorBySlot),
    zoneArmorBySlot: cloneZoneArmorProfilesBySlot(zoneArmorBySlot),
    critChanceBonus: normalizedCombatBonuses.critChance,
    critMultiplierBonus: normalizedCombatBonuses.critMultiplier,
    dodgeChanceBonus: normalizedCombatBonuses.dodgeChance,
    blockChanceBonus: normalizedCombatBonuses.blockChance,
    blockPowerBonus: normalizedCombatBonuses.blockPower,
    armorPenetrationFlat: cloneDamageProfile(normalizedCombatBonuses.armorPenetrationFlat),
    armorPenetrationPercent: cloneDamageProfile(normalizedCombatBonuses.armorPenetrationPercent),
    preferredDamageType,
    weaponClass,
  };
}

function resolveZoneArmorProfile(
  baseProfile: ZoneArmorProfile,
  flatBonuses: ArmorProfile,
  percentBonuses: ArmorProfile
): ZoneArmorProfile {
  const averageFlatBonus = Math.floor((flatBonuses.slash + flatBonuses.pierce + flatBonuses.blunt + flatBonuses.chop) / 4);
  const averagePercentBonus = Math.floor(
    (percentBonuses.slash + percentBonuses.pierce + percentBonuses.blunt + percentBonuses.chop) / 4
  );

  return {
    head: resolveArmorValue(baseProfile.head, averageFlatBonus, averagePercentBonus),
    chest: resolveArmorValue(baseProfile.chest, averageFlatBonus, averagePercentBonus),
    belly: resolveArmorValue(baseProfile.belly, averageFlatBonus, averagePercentBonus),
    waist: resolveArmorValue(baseProfile.waist, averageFlatBonus, averagePercentBonus),
    legs: resolveArmorValue(baseProfile.legs, averageFlatBonus, averagePercentBonus),
  };
}

function sumStatBonuses(bonuses: CharacterStats[]): CharacterStats {
  return bonuses.reduce<CharacterStats>(
    (accumulator, bonus) => ({
      strength: accumulator.strength + bonus.strength,
      agility: accumulator.agility + bonus.agility,
      rage: accumulator.rage + bonus.rage,
      endurance: accumulator.endurance + bonus.endurance,
    }),
    zeroCharacterStats
  );
}

function resolveStats(
  baseStats: CharacterStats,
  flatBonuses: CharacterStats,
  percentBonuses: CharacterStats
): CharacterStats {
  return {
    strength: resolveStat(baseStats.strength, flatBonuses.strength, percentBonuses.strength),
    agility: resolveStat(baseStats.agility, flatBonuses.agility, percentBonuses.agility),
    rage: resolveStat(baseStats.rage, flatBonuses.rage, percentBonuses.rage),
    endurance: resolveStat(baseStats.endurance, flatBonuses.endurance, percentBonuses.endurance),
  };
}

function resolveStat(baseStat: number, flatBonus: number, percentBonus: number) {
  const clampedPercent = clamp(
    percentBonus,
    combatProgressionConfig.minPercentValue,
    combatProgressionConfig.maxPercentValue
  );
  const multiplier = 1 + clampedPercent / 100;
  return Math.max(combatProgressionConfig.minStatValue, Math.floor((baseStat + flatBonus) * multiplier));
}

function calculateMaxHp(endurance: number) {
  return combatProgressionConfig.baseHp + endurance * combatProgressionConfig.enduranceHpFactor;
}

function resolveProfile(
  baseProfile: DamageProfile,
  flatBonuses: DamageProfile,
  percentBonuses: DamageProfile
): DamageProfile {
  return {
    slash: resolveDamageValue(baseProfile.slash, flatBonuses.slash, percentBonuses.slash),
    pierce: resolveDamageValue(baseProfile.pierce, flatBonuses.pierce, percentBonuses.pierce),
    blunt: resolveDamageValue(baseProfile.blunt, flatBonuses.blunt, percentBonuses.blunt),
    chop: resolveDamageValue(baseProfile.chop, flatBonuses.chop, percentBonuses.chop),
  };
}

function resolveArmorProfile(
  baseProfile: ArmorProfile,
  flatBonuses: ArmorProfile,
  percentBonuses: ArmorProfile
): ArmorProfile {
  return {
    slash: resolveArmorValue(baseProfile.slash, flatBonuses.slash, percentBonuses.slash),
    pierce: resolveArmorValue(baseProfile.pierce, flatBonuses.pierce, percentBonuses.pierce),
    blunt: resolveArmorValue(baseProfile.blunt, flatBonuses.blunt, percentBonuses.blunt),
    chop: resolveArmorValue(baseProfile.chop, flatBonuses.chop, percentBonuses.chop),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveArmorValue(baseValue: number, flatBonus: number, percentBonus: number) {
  const clampedPercent = clamp(
    percentBonus,
    combatProgressionConfig.minPercentValue,
    combatProgressionConfig.maxPercentValue
  );
  const multiplier = 1 + clampedPercent / 100;
  return Math.max(0, Math.floor((baseValue + flatBonus) * multiplier));
}

function resolveDamageValue(baseValue: number, flatBonus: number, percentBonus: number) {
  const clampedPercent = clamp(
    percentBonus,
    combatProgressionConfig.minPercentValue,
    combatProgressionConfig.maxPercentValue
  );
  const multiplier = 1 + clampedPercent / 100;
  return Math.max(0, Math.floor((baseValue + flatBonus) * multiplier));
}

function cloneArmorProfilesBySlot(
  profilesBySlot: Partial<Record<EquipmentSlot, ArmorProfile>>
): Partial<Record<EquipmentSlot, ArmorProfile>> {
  return Object.fromEntries(
    Object.entries(profilesBySlot).map(([slot, profile]) => [
      slot,
      {
        slash: profile?.slash ?? 0,
        pierce: profile?.pierce ?? 0,
        blunt: profile?.blunt ?? 0,
        chop: profile?.chop ?? 0,
      },
    ])
  ) as Partial<Record<EquipmentSlot, ArmorProfile>>;
}

function cloneZoneArmorProfilesBySlot(
  profilesBySlot: Partial<Record<EquipmentSlot, ZoneArmorProfile>>
): Partial<Record<EquipmentSlot, ZoneArmorProfile>> {
  return Object.fromEntries(
    Object.entries(profilesBySlot).map(([slot, profile]) => [slot, cloneZoneArmorProfile(profile)])
  ) as Partial<Record<EquipmentSlot, ZoneArmorProfile>>;
}
