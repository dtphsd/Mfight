import type { ActiveCombatEffect } from "@/modules/combat/model/CombatEffect";
import type { CombatStats } from "@/modules/combat/model/CombatStats";
import type { CombatResources } from "@/modules/combat/model/CombatResources";
import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { EquipmentSlot } from "@/modules/equipment";
import type { ArmorProfile, DamageProfile, DamageType, WeaponClass } from "@/modules/inventory";

export interface CombatantState {
  id: string;
  name: string;
  stats: CombatStats;
  maxHp: number;
  currentHp: number;
  resources: CombatResources;
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
  attackZone: CombatZone | null;
  defenseZones: CombatZone[];
  activeEffects: ActiveCombatEffect[];
}
