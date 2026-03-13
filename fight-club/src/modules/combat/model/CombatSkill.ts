import type { CombatEffectDefinition } from "@/modules/combat/model/CombatEffect";
import type { CombatResourceType } from "@/modules/combat/model/CombatResources";
import type { DamageProfile } from "@/modules/inventory";

export interface CombatSkillStateBonus {
  requiredEffectId: string;
  damageMultiplierBonus?: number;
  critChanceBonus?: number;
  armorPenetrationPercentBonus?: DamageProfile;
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  sourceItemCode: string;
  resourceType: CombatResourceType;
  cost: number;
  damageMultiplier: number;
  critChanceBonus: number;
  armorPenetrationPercentBonus: DamageProfile;
  effects?: CombatEffectDefinition[];
  stateBonuses?: CombatSkillStateBonus[];
}
