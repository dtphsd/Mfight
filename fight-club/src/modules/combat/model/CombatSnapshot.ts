import type { CombatStats } from "@/modules/combat/model/CombatStats";
import type { EquipmentSlot } from "@/modules/equipment";
import type { ArmorProfile, DamageProfile, DamageType, WeaponClass } from "@/modules/inventory";

export interface CombatSnapshot {
  characterId: string;
  name: string;
  stats: CombatStats;
  maxHp: number;
  damage: DamageProfile;
  armor: ArmorProfile;
  armorBySlot: Partial<Record<EquipmentSlot, ArmorProfile>>;
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
