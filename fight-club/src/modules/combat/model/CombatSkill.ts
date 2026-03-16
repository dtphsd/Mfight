import type { CombatEffectDefinition } from "@/modules/combat/model/CombatEffect";
import type { CombatResourceType } from "@/modules/combat/model/CombatResources";
import type { DamageProfile } from "@/modules/inventory";

export interface CombatSkillStateBonus {
  requiredEffectId: string;
  damageMultiplierBonus?: number;
  critChanceBonus?: number;
  armorPenetrationPercentBonus?: DamageProfile;
}

export interface CombatSkillRequirementMetadata {
  minLevel?: number;
  notes?: string[];
}

export interface CombatSkillUnlockMetadata {
  kind: "item" | "book" | "trainer" | "quest" | "default";
  sourceName?: string;
  note?: string;
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
  cooldownTurns?: number;
  requirements?: CombatSkillRequirementMetadata;
  unlock?: CombatSkillUnlockMetadata;
  effects?: CombatEffectDefinition[];
  stateBonuses?: CombatSkillStateBonus[];
}
