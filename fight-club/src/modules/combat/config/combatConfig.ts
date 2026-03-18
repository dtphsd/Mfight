import type { CombatZone } from "@/modules/combat/model/CombatZone";
import type { CombatIntent } from "@/modules/combat/model/CombatIntent";
import type { EquipmentSlot } from "@/modules/equipment";
import type { ArmorProfile, DamageProfile, DamageType, WeaponClass } from "@/modules/inventory";

export const combatDamageTypes: DamageType[] = ["slash", "pierce", "blunt", "chop"];

export const combatZoneDamageModifiers: Record<CombatZone, number> = {
  head: 1.15,
  chest: 1.05,
  belly: 1,
  waist: 0.95,
  legs: 0.92,
};

export const combatChanceCaps = {
  chance: 95,
  percent: 90,
  baseDodgeChance: 45,
  dodgeChance: 60,
  baseBlockPenetration: 75,
  blockPenetration: 80,
  baseCritChance: 40,
} as const;

export const combatBlockConfig = {
  penetrationArmorDivisor: 5.4,
  baseBlockedPercent: 46,
  maxBlockedPercent: 70,
  strongBlockThresholdPercent: 63,
  baseStrongBlockChance: 18,
  enduranceToStrongBlockChanceFactor: 4,
  blockPowerToStrongBlockChanceFactor: 1,
  focusStrengthDivisor: 160,
  basePenetrationFloor: 10,
  basePenetrationStart: 20,
  strengthToBasePenetrationFactor: 3,
  defenderStrengthPenaltyFactor: 2,
} as const;

export const combatResourceRewards = {
  dodgeDefenderFocus: 8,
  blockDefenderGuard: 7,
  penetrationAttackerMomentum: 7,
  critAttackerRage: 11,
  cleanHitAttackerMomentum: 10,
} as const;

export const combatProgressionConfig = {
  baseHp: 100,
  enduranceHpFactor: 8,
  minStatValue: 1,
  minPercentValue: -100,
  maxPercentValue: 1000,
} as const;

export const combatFormulaConfig = {
  dodgeBase: 5,
  agilityToBaseDodgeFactor: 2,
  attackerAgilityDodgePenaltyFactor: 2,
  critBase: 3,
  rageToBaseCritFactor: 3,
  defenderRageCritPenaltyFactor: 2,
  critMultiplierBase: 1.35,
  rageToCritMultiplierFactor: 0.03,
  enduranceToCritMultiplierFactor: 0.01,
  baseDamage: 7,
  strengthToBaseDamageFactor: 1.1,
  damageRollMinFactor: 0.85,
  damageRollMaxFactor: 1.15,
} as const;

export const combatProfileMixConfig = {
  baseDamageWeight: 0.6,
  styleProfileWeight: 0.4,
} as const;

export const combatBotPlannerConfig = {
  recruitAttackPoolSize: 3,
  closeDamageGapThreshold: 2,
  championVarianceRate: 18,
  veteranVarianceRate: 35,
  defenseVariancePoolSize: 4,
  defenseCloseScoreThreshold: 1.5,
  lowLineDefenseFloorChance: 14,
  veteranSkillDamageThreshold: 1.24,
  championSkillScoreThreshold: 120,
  skillDamageMultiplierWeight: 100,
  skillCritChanceWeight: 2,
  skillArmorPenetrationWeightDivisor: 3,
  skillCostPenaltyFactor: 0.35,
  payoffResourceHoldThreshold: 10,
} as const;

export const combatIntentConfig: Record<
  CombatIntent,
  {
    outgoingDamageMultiplier: number;
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    dodgeSuppression: number;
    stateBonusMultiplier: number;
  }
> = {
  neutral: {
    outgoingDamageMultiplier: 1,
    critChanceBonus: 0,
    dodgeChanceBonus: 0,
    blockChanceBonus: 0,
    blockPowerBonus: 0,
    dodgeSuppression: 0,
    stateBonusMultiplier: 1,
  },
  aggressive: {
    outgoingDamageMultiplier: 1.08,
    critChanceBonus: 4,
    dodgeChanceBonus: -6,
    blockChanceBonus: -8,
    blockPowerBonus: -6,
    dodgeSuppression: 0,
    stateBonusMultiplier: 1,
  },
  guarded: {
    outgoingDamageMultiplier: 0.94,
    critChanceBonus: 0,
    dodgeChanceBonus: 8,
    blockChanceBonus: 10,
    blockPowerBonus: 8,
    dodgeSuppression: 0,
    stateBonusMultiplier: 1,
  },
  precise: {
    outgoingDamageMultiplier: 0.96,
    critChanceBonus: 2,
    dodgeChanceBonus: -2,
    blockChanceBonus: -2,
    blockPowerBonus: -2,
    dodgeSuppression: 8,
    stateBonusMultiplier: 1.3,
  },
} as const;

export const combatZoneDefenseSlots: Record<CombatZone, Array<{ slot: EquipmentSlot; weight: number }>> = {
  head: [
    { slot: "helmet", weight: 1.2 },
    { slot: "earring", weight: 0.22 },
    { slot: "offHand", weight: 0.7 },
    { slot: "armor", weight: 0.15 },
  ],
  chest: [
    { slot: "armor", weight: 1.2 },
    { slot: "shirt", weight: 0.55 },
    { slot: "offHand", weight: 0.65 },
    { slot: "bracers", weight: 0.12 },
    { slot: "gloves", weight: 0.15 },
  ],
  belly: [
    { slot: "armor", weight: 0.95 },
    { slot: "shirt", weight: 0.35 },
    { slot: "belt", weight: 0.28 },
    { slot: "offHand", weight: 0.3 },
    { slot: "ring", weight: 0.08 },
    { slot: "ring2", weight: 0.1 },
  ],
  waist: [
    { slot: "armor", weight: 0.55 },
    { slot: "belt", weight: 0.6 },
    { slot: "pants", weight: 0.4 },
    { slot: "offHand", weight: 0.2 },
    { slot: "ring", weight: 0.08 },
    { slot: "ring2", weight: 0.15 },
    { slot: "gloves", weight: 0.1 },
  ],
  legs: [
    { slot: "boots", weight: 1.15 },
    { slot: "pants", weight: 0.7 },
    { slot: "armor", weight: 0.2 },
  ],
};

export const combatGenericZoneDefenseProfiles: Record<CombatZone, ArmorProfile> = {
  head: { slash: 1, pierce: 2, blunt: 1.2, chop: 1 },
  chest: { slash: 1, pierce: 1, blunt: 1.25, chop: 1 },
  belly: { slash: 1, pierce: 1, blunt: 0.8, chop: 1 },
  waist: { slash: 0, pierce: 0, blunt: 0.6, chop: 1 },
  legs: { slash: 0, pierce: 0, blunt: 0.6, chop: 1 },
};

export const combatZoneFallbackProfiles: Record<CombatZone, DamageProfile> = {
  head: { slash: 1, pierce: 2, blunt: 1, chop: 0 },
  chest: { slash: 1, pierce: 1, blunt: 2, chop: 1 },
  belly: { slash: 1, pierce: 2, blunt: 1, chop: 1 },
  waist: { slash: 2, pierce: 2, blunt: 0, chop: 1 },
  legs: { slash: 1, pierce: 0, blunt: 1, chop: 2 },
};

export const combatWeaponClassProfiles: Record<WeaponClass, Record<CombatZone, DamageProfile>> = {
  sword: {
    head: { slash: 4, pierce: 2, blunt: 0, chop: 0 },
    chest: { slash: 3, pierce: 1, blunt: 0, chop: 0 },
    belly: { slash: 3, pierce: 1, blunt: 0, chop: 0 },
    waist: { slash: 4, pierce: 2, blunt: 0, chop: 0 },
    legs: { slash: 3, pierce: 1, blunt: 0, chop: 0 },
  },
  greatsword: {
    head: { slash: 4, pierce: 1, blunt: 0, chop: 2 },
    chest: { slash: 3, pierce: 0, blunt: 0, chop: 3 },
    belly: { slash: 4, pierce: 1, blunt: 0, chop: 2 },
    waist: { slash: 4, pierce: 1, blunt: 0, chop: 2 },
    legs: { slash: 3, pierce: 0, blunt: 0, chop: 3 },
  },
  dagger: {
    head: { slash: 1, pierce: 5, blunt: 0, chop: 0 },
    chest: { slash: 1, pierce: 4, blunt: 0, chop: 0 },
    belly: { slash: 1, pierce: 4, blunt: 0, chop: 0 },
    waist: { slash: 1, pierce: 5, blunt: 0, chop: 0 },
    legs: { slash: 1, pierce: 4, blunt: 0, chop: 0 },
  },
  mace: {
    head: { slash: 0, pierce: 0, blunt: 5, chop: 0 },
    chest: { slash: 0, pierce: 0, blunt: 5, chop: 0 },
    belly: { slash: 0, pierce: 0, blunt: 4, chop: 0 },
    waist: { slash: 0, pierce: 0, blunt: 4, chop: 0 },
    legs: { slash: 0, pierce: 0, blunt: 4, chop: 0 },
  },
  greatmace: {
    head: { slash: 0, pierce: 0, blunt: 6, chop: 0 },
    chest: { slash: 0, pierce: 0, blunt: 6, chop: 0 },
    belly: { slash: 0, pierce: 0, blunt: 5, chop: 0 },
    waist: { slash: 0, pierce: 0, blunt: 5, chop: 0 },
    legs: { slash: 0, pierce: 0, blunt: 5, chop: 0 },
  },
  axe: {
    head: { slash: 1, pierce: 0, blunt: 0, chop: 4 },
    chest: { slash: 1, pierce: 0, blunt: 0, chop: 4 },
    belly: { slash: 1, pierce: 0, blunt: 0, chop: 4 },
    waist: { slash: 0, pierce: 0, blunt: 0, chop: 5 },
    legs: { slash: 0, pierce: 0, blunt: 0, chop: 5 },
  },
  greataxe: {
    head: { slash: 1, pierce: 0, blunt: 0, chop: 5 },
    chest: { slash: 0, pierce: 0, blunt: 1, chop: 6 },
    belly: { slash: 1, pierce: 0, blunt: 0, chop: 5 },
    waist: { slash: 1, pierce: 0, blunt: 0, chop: 5 },
    legs: { slash: 0, pierce: 0, blunt: 1, chop: 6 },
  },
};
