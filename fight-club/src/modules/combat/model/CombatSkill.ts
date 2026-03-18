import type { CombatEffectDefinition } from "@/modules/combat/model/CombatEffect";
import type { CombatResourceType } from "@/modules/combat/model/CombatResources";
import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { DamageProfile } from "@/modules/inventory";

export type CombatSkillRole = "setup" | "payoff" | "counter" | "tempo" | "sustain" | "control";

export interface CombatSkillAiHints {
  useWhenLowHp?: boolean;
  prefersTaggedTargets?: boolean;
  prefersArmoredTargets?: boolean;
}

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
  roles?: CombatSkillRole[];
  preferredZones?: CombatZone[];
  aiHints?: CombatSkillAiHints;
  requirements?: CombatSkillRequirementMetadata;
  unlock?: CombatSkillUnlockMetadata;
  effects?: CombatEffectDefinition[];
  stateBonuses?: CombatSkillStateBonus[];
}
