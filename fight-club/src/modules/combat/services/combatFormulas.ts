import { combatBlockConfig, combatChanceCaps, combatFormulaConfig } from "@/modules/combat/config/combatConfig";

export function baseDodgeChance(defenderAgility: number) {
  return Math.min(
    combatChanceCaps.baseDodgeChance,
    Math.max(0, combatFormulaConfig.dodgeBase + defenderAgility * combatFormulaConfig.agilityToBaseDodgeFactor)
  );
}

export function baseBlockPenetration(attackerStrength: number) {
  return Math.min(
    combatChanceCaps.baseBlockPenetration,
    Math.max(
      combatBlockConfig.basePenetrationFloor,
      combatBlockConfig.basePenetrationStart +
        attackerStrength * combatBlockConfig.strengthToBasePenetrationFactor
    )
  );
}

export function baseCritChance(attackerRage: number) {
  return Math.min(
    combatChanceCaps.baseCritChance,
    Math.max(0, combatFormulaConfig.critBase + attackerRage * combatFormulaConfig.rageToBaseCritFactor)
  );
}

export function dodgeChance(attackerAgility: number, defenderAgility: number) {
  return Math.min(
    combatChanceCaps.dodgeChance,
    Math.max(0, baseDodgeChance(defenderAgility) - attackerAgility * combatFormulaConfig.attackerAgilityDodgePenaltyFactor)
  );
}

export function blockPenetration(attackerStrength: number, defenderStrength: number) {
  return Math.min(
    combatChanceCaps.blockPenetration,
    Math.max(
      combatBlockConfig.basePenetrationFloor,
      baseBlockPenetration(attackerStrength) - defenderStrength * combatBlockConfig.defenderStrengthPenaltyFactor
    )
  );
}

export function critChance(attackerRage: number, defenderRage: number) {
  return Math.min(
    combatChanceCaps.baseCritChance,
    Math.max(0, baseCritChance(attackerRage) - defenderRage * combatFormulaConfig.defenderRageCritPenaltyFactor)
  );
}

export function critMultiplier(attackerEndurance: number) {
  return (
    combatFormulaConfig.critMultiplierBase +
    attackerEndurance * combatFormulaConfig.enduranceToCritMultiplierFactor
  );
}

export function baseDamage(attackerStrength: number) {
  return combatFormulaConfig.baseDamage + attackerStrength * combatFormulaConfig.strengthToBaseDamageFactor;
}
