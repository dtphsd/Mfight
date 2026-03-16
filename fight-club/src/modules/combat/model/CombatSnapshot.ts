import type { CombatStats } from "@/modules/combat/model/CombatStats";
import type { EquipmentSlot } from "@/modules/equipment";
import type { ArmorProfile, DamageProfile, DamageType, WeaponClass, ZoneArmorProfile } from "@/modules/inventory";

export interface CombatSnapshot {
  characterId: string;
  name: string;
  stats: CombatStats;
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
