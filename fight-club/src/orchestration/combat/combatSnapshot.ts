import type { Character } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import type {
  ArmorProfile,
  CombatBonuses,
  DamageProfile,
  DamageType,
  ZoneArmorProfile,
  WeaponClass,
} from "@/modules/inventory";
import { zeroArmorProfile, zeroCombatBonuses, zeroDamageProfile, zeroZoneArmorProfile } from "@/modules/inventory";

export interface CombatSnapshot {
  characterId: string;
  name: string;
  stats: Character["baseStats"];
  maxHp: number;
  damage: DamageProfile;
  armor: ArmorProfile;
  zoneArmor?: ZoneArmorProfile;
  armorBySlot: Partial<Record<EquipmentSlot, ArmorProfile>>;
  zoneArmorBySlot?: Partial<Record<EquipmentSlot, ZoneArmorProfile>>;
  critChanceBonus: number;
  critMultiplierBonus: number;
  dodgeChanceBonus: number;
  blockChanceBonus: number;
  blockPowerBonus: number;
  armorPenetrationFlat: DamageProfile;
  armorPenetrationPercent: DamageProfile;
  preferredDamageType: DamageType | null;
  weaponClass: WeaponClass | null;
}

export interface CombatSnapshotBuilderInput {
  character: Character;
  flatBonuses: Character["baseStats"][];
  percentBonuses: Character["baseStats"][];
  baseDamage?: DamageProfile;
  baseArmor?: ArmorProfile;
  baseZoneArmor?: ZoneArmorProfile;
  armorBySlot?: Partial<Record<EquipmentSlot, ArmorProfile>>;
  zoneArmorBySlot?: Partial<Record<EquipmentSlot, ZoneArmorProfile>>;
  combatBonuses?: CombatBonuses;
  preferredDamageType?: DamageType | null;
  weaponClass?: WeaponClass | null;
}

export function cloneDamageProfile(profile: DamageProfile = zeroDamageProfile): DamageProfile {
  return {
    slash: profile.slash,
    pierce: profile.pierce,
    blunt: profile.blunt,
    chop: profile.chop,
  };
}

export function cloneArmorProfile(profile: ArmorProfile = zeroArmorProfile): ArmorProfile {
  return {
    slash: profile.slash,
    pierce: profile.pierce,
    blunt: profile.blunt,
    chop: profile.chop,
  };
}

export function cloneZoneArmorProfile(profile: ZoneArmorProfile = zeroZoneArmorProfile): ZoneArmorProfile {
  return {
    head: profile.head,
    chest: profile.chest,
    belly: profile.belly,
    waist: profile.waist,
    legs: profile.legs,
  };
}

export function cloneCombatBonuses(bonuses: CombatBonuses = zeroCombatBonuses): CombatBonuses {
  return {
    critChance: bonuses.critChance,
    critMultiplier: bonuses.critMultiplier,
    dodgeChance: bonuses.dodgeChance,
    blockChance: bonuses.blockChance,
    blockPower: bonuses.blockPower,
    outgoingDamageFlat: cloneDamageProfile(bonuses.outgoingDamageFlat),
    outgoingDamagePercent: cloneDamageProfile(bonuses.outgoingDamagePercent),
    armorFlat: cloneArmorProfile(bonuses.armorFlat),
    armorPercent: cloneArmorProfile(bonuses.armorPercent),
    armorPenetrationFlat: cloneDamageProfile(bonuses.armorPenetrationFlat),
    armorPenetrationPercent: cloneDamageProfile(bonuses.armorPenetrationPercent),
  };
}
