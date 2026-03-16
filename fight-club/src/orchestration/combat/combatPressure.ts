import {
  baseDamage,
  combatBlockConfig,
  combatZones,
  combatProfileMixConfig,
  combatWeaponClassProfiles,
  combatZoneDamageModifiers,
  combatZoneDefenseSlots,
  combatZoneFallbackProfiles,
  type CombatSnapshot,
  type CombatZone,
} from "@/modules/combat";
import type { ArmorProfile, DamageProfile, DamageType, ZoneArmorProfile } from "@/modules/inventory";

export function totalProfileValue(profile: DamageProfile | ArmorProfile) {
  return profile.slash + profile.pierce + profile.blunt + profile.chop;
}

export function resolveDisplayDamageType(
  preferredDamageType: DamageType | null,
  profile: DamageProfile
) {
  if (preferredDamageType) {
    return preferredDamageType;
  }

  const ordered = (Object.entries(profile) as Array<[DamageType, number]>).sort((left, right) => right[1] - left[1]);
  return ordered[0]?.[1] > 0 ? ordered[0][0] : null;
}

export function buildZonePressureLens(attacker: CombatSnapshot, defender: CombatSnapshot) {
  const zoneScores = combatZones.map((zone) => ({
    zone,
    openDamage: Math.floor(estimateZoneDamage(attacker, defender, zone, false)),
    guardedDamage: Math.floor(estimateZoneDamage(attacker, defender, zone, true)),
  }));

  const sortedByOpen = [...zoneScores].sort((left, right) => right.openDamage - left.openDamage);
  const sortedByGuarded = [...zoneScores].sort((left, right) => right.guardedDamage - left.guardedDamage);

  return {
    zones: zoneScores,
    bestOpen: sortedByOpen[0],
    worstOpen: sortedByOpen[sortedByOpen.length - 1],
    bestGuarded: sortedByGuarded[0],
    worstGuarded: sortedByGuarded[sortedByGuarded.length - 1],
  };
}

function estimateZoneDamage(
  attacker: CombatSnapshot,
  defender: CombatSnapshot,
  zone: CombatZone,
  isDefended: boolean
) {
  const attackProfile = calculatePreviewAttackProfile(attacker, zone);
  const totalAttack = totalProfileValue(attackProfile);
  const effectiveArmor = getPreviewZoneArmorValue(zone, defender, isDefended);
  const damageType = resolveDisplayDamageType(attacker.preferredDamageType, attackProfile);
  const penetrationFlat = damageType ? attacker.armorPenetrationFlat[damageType] : 0;
  const penetrationPercent = damageType ? attacker.armorPenetrationPercent[damageType] : 0;

  return mitigatePreviewDamage(totalAttack, effectiveArmor, penetrationFlat, penetrationPercent);
}

function calculatePreviewAttackProfile(attacker: CombatSnapshot, zone: CombatZone): DamageProfile {
  const zoneModifier = combatZoneDamageModifiers[zone];
  const baseAttackDamage = baseDamage(attacker.stats.strength) * zoneModifier;
  const distribution = normalizePreviewProfile(attacker.damage);
  const styleDistribution = getPreviewStyleDistribution(attacker.weaponClass, zone, attacker.preferredDamageType);
  const finalDistribution = normalizePreviewProfile({
    slash:
      distribution.slash * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.slash * combatProfileMixConfig.styleProfileWeight,
    pierce:
      distribution.pierce * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.pierce * combatProfileMixConfig.styleProfileWeight,
    blunt:
      distribution.blunt * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.blunt * combatProfileMixConfig.styleProfileWeight,
    chop:
      distribution.chop * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.chop * combatProfileMixConfig.styleProfileWeight,
  });

  return {
    slash: attacker.damage.slash * zoneModifier + baseAttackDamage * finalDistribution.slash,
    pierce: attacker.damage.pierce * zoneModifier + baseAttackDamage * finalDistribution.pierce,
    blunt: attacker.damage.blunt * zoneModifier + baseAttackDamage * finalDistribution.blunt,
    chop: attacker.damage.chop * zoneModifier + baseAttackDamage * finalDistribution.chop,
  };
}

function getPreviewZoneArmorValue(zone: CombatZone, defender: CombatSnapshot, isDefended: boolean): number {
  const zoneArmor = defender.zoneArmor ?? { head: 0, chest: 0, belly: 0, waist: 0, legs: 0 };
  if (!isDefended) {
    return zoneArmor[zone];
  }

  const focusArmor = getPreviewDefenseZoneFocusValue(zone, defender.zoneArmorBySlot ?? {});
  const focusStrength = 1 + Math.max(0, defender.blockPowerBonus) / combatBlockConfig.focusStrengthDivisor;

  return zoneArmor[zone] + focusArmor * focusStrength;
}

function getPreviewDefenseZoneFocusValue(
  zone: CombatZone,
  zoneArmorBySlot: CombatSnapshot["zoneArmorBySlot"]
): number {
  const zoneSlots = getPreviewDefenseSlots(zone);
  const slotProfiles = zoneArmorBySlot ?? {};

  return zoneSlots.reduce(
    (total, { slot, weight }) => {
      const slotArmor = slotProfiles[slot];

      if (!slotArmor) {
        return total;
      }

      return total + getZoneArmorValue(slotArmor, zone) * weight;
    },
    getPreviewGenericZoneArmor(zone)
  );
}

function getPreviewDefenseSlots(zone: CombatZone) {
  return combatZoneDefenseSlots[zone];
}

function getPreviewGenericZoneArmor(zone: CombatZone): number {
  switch (zone) {
    case "head":
      return 1;
    case "chest":
      return 1;
    case "belly":
      return 1;
    case "waist":
      return 0;
    case "legs":
      return 0;
  }
}

function getPreviewStyleDistribution(
  weaponClass: CombatSnapshot["weaponClass"],
  zone: CombatZone,
  preferredDamageType: DamageType | null
): DamageProfile {
  if (weaponClass) {
    return normalizePreviewProfile(getPreviewWeaponClassProfile(weaponClass, zone));
  }

  if (preferredDamageType) {
    return normalizePreviewProfile({
      slash: preferredDamageType === "slash" ? 1 : 0,
      pierce: preferredDamageType === "pierce" ? 1 : 0,
      blunt: preferredDamageType === "blunt" ? 1 : 0,
      chop: preferredDamageType === "chop" ? 1 : 0,
    });
  }

  return normalizePreviewProfile(getPreviewZoneFallbackProfile(zone));
}

function getPreviewWeaponClassProfile(
  weaponClass: Exclude<CombatSnapshot["weaponClass"], null>,
  zone: CombatZone
): DamageProfile {
  return combatWeaponClassProfiles[weaponClass][zone];
}

function getPreviewZoneFallbackProfile(zone: CombatZone): DamageProfile {
  return combatZoneFallbackProfiles[zone];
}

function normalizePreviewProfile(profile: DamageProfile): DamageProfile {
  const total = totalProfileValue(profile);

  if (total <= 0) {
    return {
      slash: 0,
      pierce: 0,
      blunt: 1,
      chop: 0,
    };
  }

  return {
    slash: profile.slash / total,
    pierce: profile.pierce / total,
    blunt: profile.blunt / total,
    chop: profile.chop / total,
  };
}

function mitigatePreviewDamage(
  attackValue: number,
  armorValue: number,
  penetrationFlat: number,
  penetrationPercent: number
) {
  const effectiveArmor = Math.max(0, armorValue - penetrationFlat - armorValue * (penetrationPercent / 100));
  return Math.max(0, attackValue - effectiveArmor);
}

function getZoneArmorValue(profile: ZoneArmorProfile, zone: CombatZone) {
  return profile[zone];
}
