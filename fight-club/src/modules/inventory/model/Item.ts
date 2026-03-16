import type { CharacterStats } from "@/modules/character/model/CharacterStats";
import type { CombatEffectDefinition } from "@/modules/combat/model/CombatEffect";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import type { CombatResources } from "@/modules/combat/model/CombatResources";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type ItemType =
  | "weapon"
  | "shield"
  | "helmet"
  | "shirt"
  | "armor"
  | "bracers"
  | "belt"
  | "pants"
  | "boots"
  | "gloves"
  | "ring"
  | "ring2"
  | "earring"
  | "consumable"
  | "material";

export type ItemCategory =
  | "weapon"
  | "shield"
  | "armor"
  | "accessory"
  | "consumable"
  | "material";

export type EquipmentItemSlot =
  | "mainHand"
  | "offHand"
  | "helmet"
  | "shirt"
  | "armor"
  | "bracers"
  | "belt"
  | "pants"
  | "boots"
  | "gloves"
  | "ring"
  | "ring2"
  | "earring"
;

export type Handedness = "one_hand" | "two_hand" | "off_hand_only";

export type WeaponClass =
  | "sword"
  | "dagger"
  | "mace"
  | "axe"
  | "greatsword"
  | "greatmace"
  | "greataxe";

export type ArmorClass =
  | "helmet"
  | "shirt"
  | "armor"
  | "bracers"
  | "belt"
  | "pants"
  | "boots"
  | "gloves"
  | "shield"
  | "ring"
  | "ring2"
  | "earring"
;

export type DamageType = "slash" | "pierce" | "blunt" | "chop";

export interface DamageProfile {
  slash: number;
  pierce: number;
  blunt: number;
  chop: number;
}

export interface ArmorProfile {
  slash: number;
  pierce: number;
  blunt: number;
  chop: number;
}

export interface ZoneArmorProfile {
  head: number;
  chest: number;
  belly: number;
  waist: number;
  legs: number;
}

export interface CombatBonuses {
  critChance: number;
  critMultiplier: number;
  dodgeChance: number;
  blockChance: number;
  blockPower: number;
  outgoingDamageFlat: DamageProfile;
  outgoingDamagePercent: DamageProfile;
  armorFlat: ArmorProfile;
  armorPercent: ArmorProfile;
  armorPenetrationFlat: DamageProfile;
  armorPenetrationPercent: DamageProfile;
}

export interface EquipRules {
  slot: EquipmentItemSlot;
  handedness?: Handedness;
  weaponClass?: WeaponClass;
  armorClass?: ArmorClass;
}

export interface ItemSourceMeta {
  mass?: number | null;
  durability?: { current: number; max: number } | null;
  requirements?: string[];
  effects?: string[];
  properties?: string[];
  features?: string[];
  imageFileName?: string | null;
  imageSrc?: string | null;
}

export interface ConsumableEffect {
  usageMode: "replace_attack" | "with_attack";
  heal: number;
  resourceRestore: Partial<CombatResources>;
  effects?: CombatEffectDefinition[];
}

export const zeroDamageProfile: DamageProfile = {
  slash: 0,
  pierce: 0,
  blunt: 0,
  chop: 0,
};

export const zeroArmorProfile: ArmorProfile = {
  slash: 0,
  pierce: 0,
  blunt: 0,
  chop: 0,
};

export const zeroZoneArmorProfile: ZoneArmorProfile = {
  head: 0,
  chest: 0,
  belly: 0,
  waist: 0,
  legs: 0,
};

export const zeroCombatBonuses: CombatBonuses = {
  critChance: 0,
  critMultiplier: 0,
  dodgeChance: 0,
  blockChance: 0,
  blockPower: 0,
  outgoingDamageFlat: zeroDamageProfile,
  outgoingDamagePercent: zeroDamageProfile,
  armorFlat: zeroArmorProfile,
  armorPercent: zeroArmorProfile,
  armorPenetrationFlat: zeroDamageProfile,
  armorPenetrationPercent: zeroDamageProfile,
};

export interface Item {
  id: string;
  code: string;
  name: string;
  category: ItemCategory;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  value: number;
  stackable: boolean;
  maxStack: number;
  equip: EquipRules | null;
  consumableEffect?: ConsumableEffect | null;
  baseDamage: DamageProfile;
  baseArmor: ArmorProfile;
  baseZoneArmor?: ZoneArmorProfile;
  combatBonuses: CombatBonuses;
  skills?: CombatSkill[];
  statBonuses: CharacterStats;
  flatBonuses: CharacterStats;
  percentBonuses: CharacterStats;
  sourceMeta?: ItemSourceMeta;
}
