import { zeroCharacterStats, type CharacterStats } from "@/modules/character";
import type { CombatSkill } from "@/modules/combat";
import type { Equipment } from "@/modules/equipment/model/Equipment";
import type { EquipmentSlot } from "@/modules/equipment/model/EquipmentSlot";
import type { Inventory } from "@/modules/inventory";
import {
  zeroArmorProfile,
  zeroCombatBonuses,
  zeroDamageProfile,
  type ArmorProfile,
  type CombatBonuses,
  type DamageProfile,
  type DamageType,
  type WeaponClass,
} from "@/modules/inventory";

export interface EquipmentBonuses {
  flatBonuses: CharacterStats[];
  percentBonuses: CharacterStats[];
  statBonuses: CharacterStats;
  baseDamage: DamageProfile;
  baseArmor: ArmorProfile;
  armorBySlot: Partial<Record<EquipmentSlot, ArmorProfile>>;
  combatBonuses: CombatBonuses;
  preferredDamageType: DamageType | null;
  mainHandWeaponClass: WeaponClass | null;
  skills: CombatSkill[];
}

export function getEquipmentBonuses(
  equipment: Equipment,
  inventory: Inventory
): EquipmentBonuses {
  const flatBonuses: CharacterStats[] = [];
  const percentBonuses: CharacterStats[] = [];
  let statBonuses: CharacterStats = { ...zeroCharacterStats };
  let baseDamage: DamageProfile = { ...zeroDamageProfile };
  let baseArmor: ArmorProfile = { ...zeroArmorProfile };
  const armorBySlot: Partial<Record<EquipmentSlot, ArmorProfile>> = {};
  let combatBonuses: CombatBonuses = cloneCombatBonuses();
  let preferredDamageType: DamageType | null = null;
  let mainHandWeaponClass: WeaponClass | null = null;
  const skills: CombatSkill[] = [];

  for (const [slot, itemCode] of Object.entries(equipment.slots)) {
    if (!itemCode) {
      continue;
    }

    const entry = inventory.entries.find((inventoryEntry) => inventoryEntry.item.code === itemCode);
    if (!entry) {
      continue;
    }

    flatBonuses.push(entry.item.flatBonuses ?? zeroCharacterStats);
    percentBonuses.push(entry.item.percentBonuses ?? zeroCharacterStats);
    statBonuses = addCharacterStats(statBonuses, entry.item.statBonuses ?? zeroCharacterStats);
    baseDamage = addDamageProfiles(baseDamage, entry.item.baseDamage ?? zeroDamageProfile);
    baseArmor = addArmorProfiles(baseArmor, entry.item.baseArmor ?? zeroArmorProfile);
    if (hasArmorProfile(entry.item.baseArmor)) {
      armorBySlot[slot as EquipmentSlot] = addArmorProfiles(
        armorBySlot[slot as EquipmentSlot] ?? zeroArmorProfile,
        entry.item.baseArmor ?? zeroArmorProfile
      );
    }
    combatBonuses = addCombatBonuses(combatBonuses, normalizeCombatBonuses(entry.item.combatBonuses));
    if (entry.item.skills?.length) {
      skills.push(...entry.item.skills.map((skill) => ({ ...skill })));
    }

    if (slot === "mainHand") {
      mainHandWeaponClass = entry.item.equip?.weaponClass ?? null;
      preferredDamageType = resolvePreferredDamageType(entry.item.equip?.weaponClass, entry.item.baseDamage);
    }
  }

  return {
    flatBonuses,
    percentBonuses,
    statBonuses,
    baseDamage,
    baseArmor,
    armorBySlot,
    combatBonuses,
    preferredDamageType,
    mainHandWeaponClass,
    skills,
  };
}

function addCharacterStats(left: CharacterStats, right: CharacterStats): CharacterStats {
  return {
    strength: left.strength + right.strength,
    agility: left.agility + right.agility,
    rage: left.rage + right.rage,
    endurance: left.endurance + right.endurance,
  };
}

function addDamageProfiles(left: DamageProfile, right: DamageProfile): DamageProfile {
  return {
    slash: left.slash + right.slash,
    pierce: left.pierce + right.pierce,
    blunt: left.blunt + right.blunt,
    chop: left.chop + right.chop,
  };
}

function addArmorProfiles(left: ArmorProfile, right: ArmorProfile): ArmorProfile {
  return {
    slash: left.slash + right.slash,
    pierce: left.pierce + right.pierce,
    blunt: left.blunt + right.blunt,
    chop: left.chop + right.chop,
  };
}

function addCombatBonuses(left: CombatBonuses, right: CombatBonuses): CombatBonuses {
  return {
    critChance: left.critChance + right.critChance,
    critMultiplier: left.critMultiplier + right.critMultiplier,
    dodgeChance: left.dodgeChance + right.dodgeChance,
    blockChance: left.blockChance + right.blockChance,
    blockPower: left.blockPower + right.blockPower,
    outgoingDamageFlat: addDamageProfiles(left.outgoingDamageFlat, right.outgoingDamageFlat),
    outgoingDamagePercent: addDamageProfiles(left.outgoingDamagePercent, right.outgoingDamagePercent),
    armorFlat: addArmorProfiles(left.armorFlat, right.armorFlat),
    armorPercent: addArmorProfiles(left.armorPercent, right.armorPercent),
    armorPenetrationFlat: addDamageProfiles(left.armorPenetrationFlat, right.armorPenetrationFlat),
    armorPenetrationPercent: addDamageProfiles(left.armorPenetrationPercent, right.armorPenetrationPercent),
  };
}

function cloneCombatBonuses(): CombatBonuses {
  return {
    critChance: zeroCombatBonuses.critChance,
    critMultiplier: zeroCombatBonuses.critMultiplier,
    dodgeChance: zeroCombatBonuses.dodgeChance,
    blockChance: zeroCombatBonuses.blockChance,
    blockPower: zeroCombatBonuses.blockPower,
    outgoingDamageFlat: { ...zeroDamageProfile },
    outgoingDamagePercent: { ...zeroDamageProfile },
    armorFlat: { ...zeroArmorProfile },
    armorPercent: { ...zeroArmorProfile },
    armorPenetrationFlat: { ...zeroDamageProfile },
    armorPenetrationPercent: { ...zeroDamageProfile },
  };
}

function normalizeCombatBonuses(bonuses: CombatBonuses | undefined): CombatBonuses {
  if (!bonuses) {
    return cloneCombatBonuses();
  }

  return {
    critChance: bonuses.critChance ?? 0,
    critMultiplier: bonuses.critMultiplier ?? 0,
    dodgeChance: bonuses.dodgeChance ?? 0,
    blockChance: bonuses.blockChance ?? 0,
    blockPower: bonuses.blockPower ?? 0,
    outgoingDamageFlat: bonuses.outgoingDamageFlat ?? { ...zeroDamageProfile },
    outgoingDamagePercent: bonuses.outgoingDamagePercent ?? { ...zeroDamageProfile },
    armorFlat: bonuses.armorFlat ?? { ...zeroArmorProfile },
    armorPercent: bonuses.armorPercent ?? { ...zeroArmorProfile },
    armorPenetrationFlat: bonuses.armorPenetrationFlat ?? { ...zeroDamageProfile },
    armorPenetrationPercent: bonuses.armorPenetrationPercent ?? { ...zeroDamageProfile },
  };
}

function resolvePreferredDamageType(
  weaponClass: WeaponClass | undefined,
  baseDamage: DamageProfile
): DamageType | null {
  if (weaponClass) {
    switch (weaponClass) {
      case "sword":
      case "greatsword":
        return "slash";
      case "dagger":
        return "pierce";
      case "mace":
      case "greatmace":
        return "blunt";
      case "axe":
      case "greataxe":
        return "chop";
    }
  }

  const sortedDamageTypes = (Object.entries(baseDamage) as Array<[DamageType, number]>).sort(
    (left, right) => right[1] - left[1]
  );

  return sortedDamageTypes[0]?.[1] > 0 ? sortedDamageTypes[0][0] : null;
}

function hasArmorProfile(profile: ArmorProfile | undefined) {
  if (!profile) {
    return false;
  }

  return profile.slash > 0 || profile.pierce > 0 || profile.blunt > 0 || profile.chop > 0;
}
