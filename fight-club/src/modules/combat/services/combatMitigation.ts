import type { Random } from "@/core/rng/Random";
import {
  combatBlockConfig,
  combatDamageTypes,
  combatGenericZoneDefenseProfiles,
  combatZoneDefenseSlots,
} from "@/modules/combat/config/combatConfig";
import { armorRange } from "@/modules/combat/services/combatFormulas";
import type { CombatantState } from "@/modules/combat/model/CombatantState";
import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { EquipmentSlot } from "@/modules/equipment";
import type { ArmorProfile, DamageProfile, ZoneArmorProfile } from "@/modules/inventory";

export function resolveTypedArmorMitigation(input: {
  attackProfile: DamageProfile;
  attacker: CombatantState;
  defender: CombatantState;
  zone: CombatZone;
  isDefended: boolean;
  random: Random;
  skillArmorPenetrationPercentBonus: DamageProfile;
}): DamageProfile {
  const { attackProfile, attacker, defender, zone, isDefended, random, skillArmorPenetrationPercentBonus } = input;
  const zoneArmorValue = getZoneAdjustedArmorValue(zone, defender, defender.blockPowerBonus, isDefended);
  const zoneArmorProfile = distributeZoneArmorAcrossTypes(zoneArmorValue, defender.armor, zone);

  return combatDamageTypes.reduce<DamageProfile>(
    (profile, damageType) => {
      const attackValue = attackProfile[damageType];
      const armorValue = zoneArmorProfile[damageType];
      const penetrationFlat = attacker.armorPenetrationFlat[damageType];
      const penetrationPercent =
        attacker.armorPenetrationPercent[damageType] + skillArmorPenetrationPercentBonus[damageType];

      profile[damageType] = mitigateTypedDamage(attackValue, armorValue, random, penetrationFlat, penetrationPercent);
      return profile;
    },
    { slash: 0, pierce: 0, blunt: 0, chop: 0 }
  );
}

function mitigateTypedDamage(
  attackValue: number,
  armorValue: number,
  random: Random,
  penetrationFlat: number,
  penetrationPercent: number
) {
  const safeAttackValue = getFiniteProfileValue(attackValue);
  const safeArmorValue = getFiniteProfileValue(armorValue);
  const safePenetrationFlat = getFiniteProfileValue(penetrationFlat);
  const safePenetrationPercent = getFiniteProfileValue(penetrationPercent);

  if (safeAttackValue <= 0) {
    return 0;
  }

  const rolledArmor = rollArmorValue(safeArmorValue, random);
  const effectiveArmor = Math.max(0, rolledArmor - safePenetrationFlat - rolledArmor * (safePenetrationPercent / 100));
  return Math.max(0, safeAttackValue - effectiveArmor);
}

function distributeZoneArmorAcrossTypes(
  zoneArmorValue: number,
  armorProfile: ArmorProfile,
  zone: CombatZone
): ArmorProfile {
  if (zoneArmorValue <= 0) {
    return { slash: 0, pierce: 0, blunt: 0, chop: 0 };
  }

  const weightedArmor = buildWeightedArmorProfile(armorProfile, zone);
  const totalArmorWeight = totalArmorProfileValue(weightedArmor);

  if (totalArmorWeight <= 0) {
    const equalShare = zoneArmorValue / combatDamageTypes.length;
    return {
      slash: equalShare,
      pierce: equalShare,
      blunt: equalShare,
      chop: equalShare,
    };
  }

  return combatDamageTypes.reduce<ArmorProfile>(
    (profile, damageType) => {
      profile[damageType] = zoneArmorValue * (weightedArmor[damageType] / totalArmorWeight);
      return profile;
    },
    { slash: 0, pierce: 0, blunt: 0, chop: 0 }
  );
}

function buildWeightedArmorProfile(armorProfile: ArmorProfile, zone: CombatZone): ArmorProfile {
  const genericProfile = combatGenericZoneDefenseProfiles[zone];
  const averageArmor = totalArmorProfileValue(armorProfile) / combatDamageTypes.length;

  return combatDamageTypes.reduce<ArmorProfile>(
    (profile, damageType) => {
      profile[damageType] =
        getFiniteProfileValue(armorProfile[damageType]) * 0.6 +
        averageArmor * 0.4 +
        getFiniteProfileValue(genericProfile[damageType]);
      return profile;
    },
    { slash: 0, pierce: 0, blunt: 0, chop: 0 }
  );
}

function getZoneAdjustedArmorValue(
  zone: CombatZone,
  defender: CombatantState,
  blockPowerBonus: number,
  isDefended: boolean
): number {
  const zoneArmor = defender.zoneArmor ?? { head: 0, chest: 0, belly: 0, waist: 0, legs: 0 };
  if (!isDefended) {
    return zoneArmor[zone];
  }

  const focusArmor = getDefenseZoneFocusValue(zone, defender.zoneArmorBySlot ?? {});
  const focusStrength = 1 + Math.max(0, blockPowerBonus) / combatBlockConfig.focusStrengthDivisor;
  return zoneArmor[zone] + focusArmor * focusStrength;
}

function getDefenseZoneFocusValue(
  zone: CombatZone,
  zoneArmorBySlot: Partial<Record<EquipmentSlot, ZoneArmorProfile>>
): number {
  const zoneSlots = combatZoneDefenseSlots[zone];

  return zoneSlots.reduce((total, { slot, weight }) => {
    const slotArmor = zoneArmorBySlot[slot];
    if (!slotArmor) {
      return total;
    }

    return total + slotArmor[zone] * weight;
  }, totalArmorProfileValue(combatGenericZoneDefenseProfiles[zone]) / combatDamageTypes.length);
}

function rollArmorValue(value: number, random: Random) {
  const range = armorRange(value);
  if (range.max <= range.min) {
    return range.min;
  }

  return random.int(range.min, range.max);
}

function totalArmorProfileValue(profile: ArmorProfile) {
  return combatDamageTypes.reduce((total, damageType) => total + getFiniteProfileValue(profile[damageType]), 0);
}

function getFiniteProfileValue(value: number) {
  return Number.isFinite(value) ? value : 0;
}
