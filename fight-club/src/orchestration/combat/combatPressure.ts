import {
  baseDamage,
  combatBlockConfig,
  combatZones,
  combatGenericZoneDefenseProfiles,
  combatProfileMixConfig,
  combatWeaponClassProfiles,
  combatZoneDamageModifiers,
  combatZoneDefenseSlots,
  combatZoneFallbackProfiles,
  type CombatSnapshot,
  type CombatZone,
} from "@/modules/combat";
import type { ArmorProfile, DamageProfile, DamageType } from "@/modules/inventory";

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
  const effectiveArmor = getPreviewZoneArmorProfile(zone, defender, isDefended);

  return totalProfileValue({
    slash: mitigatePreviewDamageType(
      attackProfile.slash,
      effectiveArmor.slash,
      attacker.armorPenetrationFlat.slash,
      attacker.armorPenetrationPercent.slash
    ),
    pierce: mitigatePreviewDamageType(
      attackProfile.pierce,
      effectiveArmor.pierce,
      attacker.armorPenetrationFlat.pierce,
      attacker.armorPenetrationPercent.pierce
    ),
    blunt: mitigatePreviewDamageType(
      attackProfile.blunt,
      effectiveArmor.blunt,
      attacker.armorPenetrationFlat.blunt,
      attacker.armorPenetrationPercent.blunt
    ),
    chop: mitigatePreviewDamageType(
      attackProfile.chop,
      effectiveArmor.chop,
      attacker.armorPenetrationFlat.chop,
      attacker.armorPenetrationPercent.chop
    ),
  });
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

function getPreviewZoneArmorProfile(zone: CombatZone, defender: CombatSnapshot, isDefended: boolean): ArmorProfile {
  if (!isDefended) {
    return defender.armor;
  }

  const focusProfile = getPreviewDefenseZoneFocusProfile(zone, defender.armorBySlot);
  const focusStrength = 1 + Math.max(0, defender.blockPowerBonus) / combatBlockConfig.focusStrengthDivisor;

  return {
    slash: defender.armor.slash + focusProfile.slash * focusStrength,
    pierce: defender.armor.pierce + focusProfile.pierce * focusStrength,
    blunt: defender.armor.blunt + focusProfile.blunt * focusStrength,
    chop: defender.armor.chop + focusProfile.chop * focusStrength,
  };
}

function getPreviewDefenseZoneFocusProfile(
  zone: CombatZone,
  armorBySlot: CombatSnapshot["armorBySlot"]
): ArmorProfile {
  const zoneSlots = getPreviewDefenseSlots(zone);

  return zoneSlots.reduce<ArmorProfile>(
    (profile, { slot, weight }) => {
      const slotArmor = armorBySlot[slot];

      if (!slotArmor) {
        return profile;
      }

      return {
        slash: profile.slash + slotArmor.slash * weight,
        pierce: profile.pierce + slotArmor.pierce * weight,
        blunt: profile.blunt + slotArmor.blunt * weight,
        chop: profile.chop + slotArmor.chop * weight,
      };
    },
    getPreviewGenericZoneArmor(zone)
  );
}

function getPreviewDefenseSlots(zone: CombatZone) {
  return combatZoneDefenseSlots[zone];
}

function getPreviewGenericZoneArmor(zone: CombatZone): ArmorProfile {
  return combatGenericZoneDefenseProfiles[zone];
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

function mitigatePreviewDamageType(
  attackValue: number,
  armorValue: number,
  penetrationFlat: number,
  penetrationPercent: number
) {
  const effectiveArmor = Math.max(0, armorValue - penetrationFlat - armorValue * (penetrationPercent / 100));
  return Math.max(0, attackValue - effectiveArmor);
}
