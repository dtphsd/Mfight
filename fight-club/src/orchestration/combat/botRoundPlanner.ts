import type { Random } from "@/core/rng/Random";
import {
  combatBotPlannerConfig,
  combatZones,
  type CombatIntent,
  type CombatSkill,
  type CombatSnapshot,
  type CombatZone,
  type RoundAction,
} from "@/modules/combat";
import { createBasicAttackAction, createSkillAttackAction } from "@/modules/combat/model/RoundAction";
import type { CombatantState } from "@/modules/combat/model/CombatantState";
import { buildZonePressureLens } from "@/orchestration/combat/combatPressure";
import type { BotDifficultyConfig } from "@/orchestration/combat/combatSandboxConfigs";

export interface BotRoundPlan {
  attackZone: CombatZone;
  defenseZones: [CombatZone, CombatZone];
  intent: CombatIntent;
  skillId: string | null;
  consumableCode: string | null;
  reason: "pressure" | "counter_guard" | "skill_pressure" | "recruit_scramble";
}

export function planBotRound(input: {
  random: Random;
  attacker: CombatSnapshot;
  defender: CombatSnapshot;
  attackerCombatant: CombatantState;
  defenderCombatant?: CombatantState | null;
  availableSkills?: CombatSkill[];
  difficulty: BotDifficultyConfig["plannerProfile"];
  opponentAttackZone?: CombatZone | null;
  archetype?: string | null;
}): BotRoundPlan {
  const {
    random,
    attacker,
    defender,
    attackerCombatant,
    defenderCombatant = null,
    availableSkills = [],
    difficulty,
    opponentAttackZone = null,
    archetype = null,
  } = input;
  const strategy = resolveBotStrategy(archetype);
  const attackPressure = buildZonePressureLens(attacker, defender);
  const defensePressure = buildZonePressureLens(defender, attacker);
  const rankedAttackZones = [...attackPressure.zones].sort(compareZonePriority("openDamage", "guardedDamage"));
  const rankedDefenseZones = [...defensePressure.zones].sort(compareZonePriority("openDamage", "guardedDamage"));
  const attackZone = selectAttackZone(random, rankedAttackZones, difficulty, strategy, attackerCombatant);
  const defenseZones = selectDefenseZones(random, rankedDefenseZones, opponentAttackZone, difficulty, strategy, attackerCombatant);
  const selectedSkill = selectSkill(availableSkills, attackerCombatant, defenderCombatant, difficulty, strategy, attackZone);
  const intent = resolveBotIntent({
    attackerCombatant,
    defenderCombatant,
    selectedSkill,
    difficulty,
    strategy,
  });
  const reason = selectedSkill
    ? "skill_pressure"
    : difficulty === "recruit"
      ? "recruit_scramble"
      : opponentAttackZone
        ? "counter_guard"
        : "pressure";

  return {
    attackZone,
    defenseZones,
    intent,
    skillId: selectedSkill?.id ?? null,
    consumableCode: null,
    reason,
  };
}

export function buildBotRoundAction(
  plan: BotRoundPlan,
  attackerId: string,
  availableSkills: CombatSkill[] = []
): RoundAction {
  const selectedSkill = availableSkills.find((skill) => skill.id === plan.skillId) ?? null;

  if (selectedSkill) {
    return createSkillAttackAction({
      attackerId,
      attackZone: plan.attackZone,
      defenseZones: plan.defenseZones,
      intent: plan.intent,
      skill: selectedSkill,
    });
  }

  return createBasicAttackAction({
    attackerId,
    attackZone: plan.attackZone,
    defenseZones: plan.defenseZones,
    intent: plan.intent,
  });
}

function resolveBotIntent(input: {
  attackerCombatant: CombatantState;
  defenderCombatant: CombatantState | null;
  selectedSkill: CombatSkill | null;
  difficulty: BotDifficultyConfig["plannerProfile"];
  strategy?: BotStrategyProfile;
}): CombatIntent {
  const { attackerCombatant, defenderCombatant, selectedSkill, difficulty, strategy } = input;
  const selfHpRatio = attackerCombatant.currentHp / Math.max(1, attackerCombatant.maxHp);
  const targetHpRatio = defenderCombatant
    ? defenderCombatant.currentHp / Math.max(1, defenderCombatant.maxHp)
    : 1;
  const style = strategy?.style ?? "pressure";
  const taggedTarget = defenderCombatant?.activeEffects.length ? 1 : 0;
  const setupLike = selectedSkill?.roles?.some((role) => role === "setup" || role === "control" || role === "tempo") ?? false;
  const payoffLike = selectedSkill?.roles?.includes("payoff") ?? false;
  const sustainLike = selectedSkill?.roles?.includes("sustain") ?? false;
  const stateAware = (selectedSkill?.stateBonuses?.length ?? 0) > 0;
  const effectHeavy = (selectedSkill?.effects?.length ?? 0) > 0;
  const rawDamageWeight =
    (selectedSkill?.damageMultiplier ?? 1) * 100 +
    (selectedSkill?.critChanceBonus ?? 0) * 1.4 +
    (selectedSkill?.armorPenetrationPercentBonus.slash ?? 0) * 0.08 +
    (selectedSkill?.armorPenetrationPercentBonus.pierce ?? 0) * 0.08 +
    (selectedSkill?.armorPenetrationPercentBonus.blunt ?? 0) * 0.08 +
    (selectedSkill?.armorPenetrationPercentBonus.chop ?? 0) * 0.08;
  const retaliationRisk =
    (1 - selfHpRatio) * 30 +
    ((defenderCombatant?.resources.rage ?? 0) * 0.18 +
      (defenderCombatant?.resources.momentum ?? 0) * 0.14 +
      (defenderCombatant?.resources.focus ?? 0) * 0.12);
  const capitalizeWindow = (1 - targetHpRatio) * 28 + (payoffLike ? 16 : 0) + (rawDamageWeight >= 150 ? 8 : 0);
  const precisionWindow =
    (setupLike ? 12 : 0) +
    (stateAware ? 16 : 0) +
    (effectHeavy ? 8 : 0) +
    (taggedTarget ? 12 : 0) +
    ((selectedSkill?.aiHints?.prefersTaggedTargets ?? false) ? 8 : 0);
  const burstPayoffPressure =
    (style === "burst" && payoffLike ? 14 : 0) +
    (style === "burst" && (selectedSkill?.critChanceBonus ?? 0) >= 20 ? 8 : 0) +
    (style === "burst" && taggedTarget && payoffLike ? 8 : 0);
  const setupPrecisionPressure =
    (style === "control" && (setupLike || effectHeavy) ? 10 : 0) +
    (style === "control" && taggedTarget ? 6 : 0) +
    (style === "burst" && setupLike ? 8 : 0) +
    (style === "burst" && stateAware ? 6 : 0);
  const retaliationWeight =
    style === "burst" ? 0.28 : style === "control" ? 0.34 : style === "tempo" || style === "pressure" ? 0.38 : 0.42;

  let aggressiveScore =
    capitalizeWindow +
    burstPayoffPressure +
    (style === "burst" ? 12 : 0) +
    (style === "pressure" || style === "tempo" ? 6 : 0) +
    (selfHpRatio >= 0.58 ? 4 : 0) -
    retaliationRisk * retaliationWeight;

  let guardedScore =
    retaliationRisk +
    (selfHpRatio <= 0.55 ? 8 : 0) +
    (style === "defense" || style === "sustain" ? 10 : 0) +
    (style === "control" ? 5 : 0) +
    (sustainLike ? 8 : 0) -
    capitalizeWindow * (style === "burst" || style === "tempo" ? 0.34 : 0.24) -
    (payoffLike ? 6 : 0);

  let preciseScore =
    precisionWindow +
    setupPrecisionPressure +
    (style === "control" ? 10 : 0) +
    (style === "burst" ? 5 : 0) +
    (style === "tempo" ? 4 : 0) +
    (targetHpRatio <= 0.45 && payoffLike ? 6 : 0) -
    (difficulty === "recruit" ? 10 : 0);

  if (selfHpRatio <= 0.38) {
    return "guarded";
  }

  if (!selectedSkill) {
    aggressiveScore += style === "pressure" ? 4 : 0;
    guardedScore += selfHpRatio <= 0.5 ? 4 : 0;
    preciseScore -= 8;
  }

  if (aggressiveScore >= preciseScore && aggressiveScore >= guardedScore && aggressiveScore >= 28) {
    return "aggressive";
  }

  if (preciseScore >= aggressiveScore && preciseScore >= guardedScore && preciseScore >= 24) {
    return "precise";
  }

  if (guardedScore >= 30) {
    return "guarded";
  }

  return "neutral";
}

function selectAttackZone(
  random: Random,
  rankedZones: Array<{ zone: CombatZone; openDamage: number; guardedDamage: number }>,
  difficulty: BotDifficultyConfig["plannerProfile"],
  strategy: BotStrategyProfile,
  attackerCombatant: CombatantState
) {
  const fallback = rankedZones[0]?.zone ?? combatZones[0];
  const hpRatio = attackerCombatant.currentHp / Math.max(1, attackerCombatant.maxHp);
  const scoredZones = rankedZones
    .map((entry) => {
      const preference = strategy.attackZoneWeights[entry.zone] ?? 1;
      const riskMix = hpRatio <= 0.4 ? entry.guardedDamage * 0.6 + entry.openDamage * 0.4 : entry.openDamage;

      return {
        ...entry,
        score: riskMix * preference,
      };
    })
    .sort((left, right) => right.score - left.score);
  const challenger = scoredZones[1];

  if (difficulty === "recruit") {
    const recruitPool = scoredZones.slice(0, Math.min(combatBotPlannerConfig.recruitAttackPoolSize, scoredZones.length));
    return recruitPool[random.int(0, recruitPool.length - 1)]?.zone ?? fallback;
  }

  if (!challenger) {
    return scoredZones[0]?.zone ?? fallback;
  }

  const gap = scoredZones[0].score - challenger.score;
  const varianceRate =
    difficulty === "champion"
      ? combatBotPlannerConfig.championVarianceRate
      : combatBotPlannerConfig.veteranVarianceRate;
  return gap <= combatBotPlannerConfig.closeDamageGapThreshold && random.int(0, 99) < varianceRate
    ? challenger.zone
    : (scoredZones[0]?.zone ?? fallback);
}

function selectDefenseZones(
  random: Random,
  rankedZones: Array<{ zone: CombatZone; openDamage: number; guardedDamage: number }>,
  opponentAttackZone: CombatZone | null,
  difficulty: BotDifficultyConfig["plannerProfile"],
  strategy: BotStrategyProfile,
  attackerCombatant: CombatantState
): [CombatZone, CombatZone] {
  if (difficulty === "recruit") {
    const first = combatZones[random.int(0, combatZones.length - 1)];
    const secondPool = combatZones.filter((zone) => zone !== first);
    const second = secondPool[random.int(0, secondPool.length - 1)] ?? "chest";
    return [first, second];
  }

  const hpRatio = attackerCombatant.currentHp / Math.max(1, attackerCombatant.maxHp);
  const scoredZones = rankedZones
    .map((entry) => ({
      ...entry,
      score:
        entry.openDamage * (strategy.defenseZoneWeights[entry.zone] ?? 1) +
        (hpRatio <= 0.45 ? entry.guardedDamage * 0.2 : 0),
    }))
    .sort((left, right) => right.score - left.score);

  if (opponentAttackZone) {
    const backup =
      scoredZones.find((entry) => entry.zone !== opponentAttackZone)?.zone ??
      combatZones.find((zone) => zone !== opponentAttackZone) ??
      "chest";

    return [opponentAttackZone, backup];
  }

  const first = pickDefenseZone(random, scoredZones, []);
  const second = pickDefenseZone(random, scoredZones, [first]);

  return [first, second];
}

function pickDefenseZone(
  random: Random,
  scoredZones: Array<{ zone: CombatZone; openDamage: number; guardedDamage: number; score: number }>,
  excludedZones: CombatZone[]
): CombatZone {
  const availableZones = scoredZones.filter((entry) => !excludedZones.includes(entry.zone));
  const fallback = availableZones[0]?.zone ?? combatZones.find((zone) => !excludedZones.includes(zone)) ?? "chest";

  if (availableZones.length === 0) {
    return fallback;
  }

  const bestScore = availableZones[0]?.score ?? 0;
  const closePool = availableZones
    .filter((entry) => bestScore - entry.score <= combatBotPlannerConfig.defenseCloseScoreThreshold)
    .slice(0, combatBotPlannerConfig.defenseVariancePoolSize);
  const weightedPool = closePool.length > 0 ? closePool : availableZones.slice(0, combatBotPlannerConfig.defenseVariancePoolSize);
  const legsCandidate = availableZones.find((entry) => entry.zone === "legs");

  if (legsCandidate && random.int(0, 99) < combatBotPlannerConfig.lowLineDefenseFloorChance) {
    return "legs";
  }

  const totalWeight = weightedPool.reduce((sum, entry) => sum + Math.max(1, Math.round(entry.score * 10)), 0);

  if (totalWeight <= 0) {
    return weightedPool[0]?.zone ?? fallback;
  }

  let roll = random.int(1, totalWeight);

  for (const entry of weightedPool) {
    roll -= Math.max(1, Math.round(entry.score * 10));
    if (roll <= 0) {
      return entry.zone;
    }
  }

  return weightedPool[weightedPool.length - 1]?.zone ?? fallback;
}

function selectSkill(
  availableSkills: CombatSkill[],
  attackerCombatant: CombatantState,
  defenderCombatant: CombatantState | null,
  difficulty: BotDifficultyConfig["plannerProfile"],
  strategy: BotStrategyProfile,
  attackZone: CombatZone
) {
  if (difficulty === "recruit") {
    return null;
  }

  const affordableSkills = availableSkills.filter(
    (skill) =>
      attackerCombatant.resources[skill.resourceType] >= skill.cost &&
      ((attackerCombatant.skillCooldowns ?? {})[skill.id] ?? 0) <= 0
  );

  if (affordableSkills.length === 0) {
    return null;
  }

  const payoffWindowSkills = affordableSkills.filter(
    (skill) => (skill.roles?.includes("payoff") ?? false) && isPayoffWindowOpen(skill, defenderCombatant)
  );
  const candidateSkills = payoffWindowSkills.length > 0 ? payoffWindowSkills : affordableSkills;
  const rankedSkills = [...candidateSkills].sort(
    (left, right) =>
      scoreSkill(right, attackerCombatant, defenderCombatant, strategy, attackZone) -
      scoreSkill(left, attackerCombatant, defenderCombatant, strategy, attackZone)
  );
  const bestSkill = rankedSkills[0];

  if (!bestSkill) {
    return null;
  }

  if (shouldHoldResourcesForPayoff(bestSkill, availableSkills, attackerCombatant, defenderCombatant)) {
    return null;
  }

  if (difficulty === "veteran") {
    return scoreSkill(bestSkill, attackerCombatant, defenderCombatant, strategy, attackZone) >=
        combatBotPlannerConfig.veteranSkillDamageThreshold * combatBotPlannerConfig.skillDamageMultiplierWeight
      ? bestSkill
      : null;
  }

  return scoreSkill(bestSkill, attackerCombatant, defenderCombatant, strategy, attackZone) >=
      combatBotPlannerConfig.championSkillScoreThreshold
    ? bestSkill
    : null;
}

function scoreSkill(
  skill: CombatSkill,
  attackerCombatant: CombatantState,
  defenderCombatant: CombatantState | null,
  strategy: BotStrategyProfile,
  attackZone: CombatZone
) {
  const totalPen =
    skill.armorPenetrationPercentBonus.slash +
    skill.armorPenetrationPercentBonus.pierce +
    skill.armorPenetrationPercentBonus.blunt +
    skill.armorPenetrationPercentBonus.chop;

  const hpRatio = attackerCombatant.currentHp / Math.max(1, attackerCombatant.maxHp);
  const defenderHpRatio = defenderCombatant
    ? defenderCombatant.currentHp / Math.max(1, defenderCombatant.maxHp)
    : 1;
  const defenderArmorValue = defenderCombatant
    ? defenderCombatant.armor.slash +
      defenderCombatant.armor.pierce +
      defenderCombatant.armor.blunt +
      defenderCombatant.armor.chop
    : 0;
  const zoneBias = strategy.attackZoneWeights[attackZone] ?? 1;
  const effectScore = (skill.effects ?? []).reduce((total, effect) => {
    const targetAlreadyTagged = effect.target === "target"
      ? (defenderCombatant?.activeEffects.some((active) => active.effectId === effect.id) ?? false)
      : attackerCombatant.activeEffects.some((active) => active.effectId === effect.id);
    const duplicatePenalty = targetAlreadyTagged ? 12 : 0;
    const periodicPressure = (effect.periodic?.damage ?? 0) * 6;
    const periodicHealing = (effect.periodic?.heal ?? 0) * 7;
    const durationValue = effect.durationTurns * 2;
    const modifierValue =
      (effect.modifiers?.outgoingDamagePercent ?? 0) * 0.9 +
      (effect.modifiers?.incomingDamagePercent ?? 0) * 0.8 +
      (effect.modifiers?.critChanceBonus ?? 0) * 0.7 +
      (effect.modifiers?.blockChanceBonus ?? 0) * 0.6 +
      (effect.modifiers?.blockPowerBonus ?? 0) * 0.6 +
      (effect.modifiers?.dodgeChanceBonus ?? 0) * 0.5;

    let archetypeBonus = 0;
    if (strategy.style === "control" && effect.kind === "debuff" && effect.target === "target") archetypeBonus += 22;
    if (strategy.style === "burst" && (effect.modifiers?.critChanceBonus ?? 0) > 0) archetypeBonus += 18;
    if (strategy.style === "tempo" && effect.target === "target") archetypeBonus += 10;
    if ((strategy.style === "defense" || strategy.style === "sustain") && effect.target === "self") archetypeBonus += 18;
    if (hpRatio <= 0.5 && effect.target === "self") archetypeBonus += periodicHealing > 0 ? 28 : 10;
    if (strategy.style === "burst" && defenderHpRatio <= 0.45 && effect.target === "target") archetypeBonus += 16;

    return total + periodicPressure + periodicHealing + durationValue + modifierValue + archetypeBonus - duplicatePenalty;
  }, 0);
  const finisherBonus =
    strategy.style === "burst"
      ? (1 - defenderHpRatio) * 44 + (skill.critChanceBonus > 0 ? 10 : 0)
      : 0;
  const antiArmorBonus =
    totalPen * (1 + Math.min(defenderArmorValue, 120) / 120) / combatBotPlannerConfig.skillArmorPenetrationWeightDivisor;
  const burstDamageBonus =
    strategy.style === "burst"
      ? skill.damageMultiplier * 22 + skill.critChanceBonus * 1.2
      : 0;
  const roleBonus = (skill.roles ?? []).reduce((total, role) => {
    switch (role) {
      case "setup":
        return total + (strategy.style === "control" || strategy.style === "tempo" ? 10 : 4);
      case "payoff":
        return total + (strategy.style === "burst" ? 12 : 5);
      case "counter":
        return total + (strategy.style === "defense" ? 12 : 4);
      case "tempo":
        return total + (strategy.style === "tempo" || strategy.style === "pressure" ? 9 : 3);
      case "sustain":
        return total + (strategy.style === "sustain" || hpRatio <= 0.5 ? 12 : 4);
      case "control":
        return total + (strategy.style === "control" ? 12 : 5);
    }
  }, 0);
  const preferredZoneBonus = skill.preferredZones?.includes(attackZone) ? 8 : 0;
  const aiHintBonus =
    (skill.aiHints?.useWhenLowHp && hpRatio <= 0.5 ? 14 : 0) +
    (skill.aiHints?.prefersTaggedTargets && (defenderCombatant?.activeEffects.length ?? 0) > 0 ? 10 : 0) +
    (skill.aiHints?.prefersArmoredTargets && defenderArmorValue >= 40 ? 10 : 0);
  const activeStateBonus = (skill.stateBonuses ?? []).reduce((total, bonus) => {
    const stateIsActive =
      defenderCombatant?.activeEffects.some((effect) => effect.effectId === bonus.requiredEffectId) ?? false;

    if (!stateIsActive) {
      return total;
    }

    const penetrationValue = bonus.armorPenetrationPercentBonus
      ? bonus.armorPenetrationPercentBonus.slash +
        bonus.armorPenetrationPercentBonus.pierce +
        bonus.armorPenetrationPercentBonus.blunt +
        bonus.armorPenetrationPercentBonus.chop
      : 0;

    return (
      total +
      (bonus.damageMultiplierBonus ?? 0) * 100 +
      (bonus.critChanceBonus ?? 0) * 2 +
      penetrationValue / combatBotPlannerConfig.skillArmorPenetrationWeightDivisor +
      24
    );
  }, 0);

  return (
    skill.damageMultiplier * combatBotPlannerConfig.skillDamageMultiplierWeight * zoneBias +
    skill.critChanceBonus * combatBotPlannerConfig.skillCritChanceWeight * strategy.critBias +
    antiArmorBonus +
    burstDamageBonus +
    roleBonus +
    preferredZoneBonus +
    aiHintBonus +
    activeStateBonus +
    finisherBonus -
    skill.cost * combatBotPlannerConfig.skillCostPenaltyFactor * strategy.costSensitivity +
    effectScore
  );
}

function shouldHoldResourcesForPayoff(
  selectedSkill: CombatSkill,
  availableSkills: CombatSkill[],
  attackerCombatant: CombatantState,
  defenderCombatant: CombatantState | null
) {
  if (selectedSkill.roles?.includes("payoff")) {
    return false;
  }

  const currentResource = attackerCombatant.resources[selectedSkill.resourceType];
  const futurePayoffSkill = availableSkills.find(
    (skill) =>
      skill.id !== selectedSkill.id &&
      skill.resourceType === selectedSkill.resourceType &&
      skill.roles?.includes("payoff") &&
      skill.cost > currentResource &&
      skill.cost - currentResource <= combatBotPlannerConfig.payoffResourceHoldThreshold &&
      isPayoffWindowOpen(skill, defenderCombatant)
  );

  if (!futurePayoffSkill) {
    return false;
  }

  const selectedSkillIsSetupLike =
    selectedSkill.roles?.some((role) => role === "setup" || role === "tempo" || role === "control") ?? false;

  return selectedSkillIsSetupLike;
}

function isPayoffWindowOpen(skill: CombatSkill, defenderCombatant: CombatantState | null) {
  if (!skill.stateBonuses?.length) {
    return true;
  }

  if (!defenderCombatant) {
    return false;
  }

  return skill.stateBonuses.some((bonus) =>
    defenderCombatant.activeEffects.some((effect) => effect.effectId === bonus.requiredEffectId)
  );
}

function compareZonePriority(
  primaryMetric: "openDamage" | "guardedDamage",
  secondaryMetric: "openDamage" | "guardedDamage"
) {
  return (
    left: { zone: CombatZone; openDamage: number; guardedDamage: number },
    right: { zone: CombatZone; openDamage: number; guardedDamage: number }
  ) => {
    const primaryDelta = right[primaryMetric] - left[primaryMetric];

    if (primaryDelta !== 0) {
      return primaryDelta;
    }

    return right[secondaryMetric] - left[secondaryMetric];
  };
}

interface BotStrategyProfile {
  style: "pressure" | "defense" | "burst" | "control" | "tempo" | "heavy" | "sustain";
  attackZoneWeights: Record<CombatZone, number>;
  defenseZoneWeights: Record<CombatZone, number>;
  critBias: number;
  costSensitivity: number;
}

function resolveBotStrategy(archetype: string | null): BotStrategyProfile {
  const normalized = archetype?.toLowerCase() ?? "";

  if (normalized.includes("defense")) {
    return {
      style: "defense",
      attackZoneWeights: { head: 1.02, chest: 1.1, belly: 1.05, waist: 0.96, legs: 0.92 },
      defenseZoneWeights: { head: 1.12, chest: 1.18, belly: 1.05, waist: 0.98, legs: 0.9 },
      critBias: 0.8,
      costSensitivity: 1.08,
    };
  }
  if (normalized.includes("burst")) {
    return {
      style: "burst",
      attackZoneWeights: { head: 1.16, chest: 1.06, belly: 1, waist: 0.95, legs: 0.88 },
      defenseZoneWeights: { head: 1.08, chest: 1.08, belly: 1, waist: 0.95, legs: 0.92 },
      critBias: 1.35,
      costSensitivity: 0.92,
    };
  }
  if (normalized.includes("control")) {
    return {
      style: "control",
      attackZoneWeights: { head: 1.04, chest: 1.12, belly: 1.04, waist: 0.98, legs: 0.94 },
      defenseZoneWeights: { head: 1.1, chest: 1.14, belly: 1.04, waist: 0.98, legs: 0.92 },
      critBias: 0.9,
      costSensitivity: 1,
    };
  }
  if (normalized.includes("tempo")) {
    return {
      style: "tempo",
      attackZoneWeights: { head: 0.9, chest: 0.94, belly: 0.98, waist: 1.28, legs: 1.34 },
      defenseZoneWeights: { head: 1.04, chest: 1.02, belly: 1, waist: 1.06, legs: 1.08 },
      critBias: 0.96,
      costSensitivity: 0.95,
    };
  }
  if (normalized.includes("heavy")) {
    return {
      style: "heavy",
      attackZoneWeights: { head: 1.08, chest: 1.12, belly: 1.04, waist: 1, legs: 0.94 },
      defenseZoneWeights: { head: 1.08, chest: 1.1, belly: 1.02, waist: 0.98, legs: 0.92 },
      critBias: 0.9,
      costSensitivity: 0.94,
    };
  }
  if (normalized.includes("sustain")) {
    return {
      style: "sustain",
      attackZoneWeights: { head: 0.98, chest: 1.08, belly: 1.1, waist: 1.02, legs: 0.94 },
      defenseZoneWeights: { head: 1.12, chest: 1.16, belly: 1.08, waist: 0.98, legs: 0.9 },
      critBias: 0.82,
      costSensitivity: 1.06,
    };
  }

  return {
    style: "pressure",
    attackZoneWeights: { head: 1.08, chest: 1.05, belly: 1, waist: 1.02, legs: 0.95 },
    defenseZoneWeights: { head: 1.08, chest: 1.1, belly: 1.02, waist: 0.98, legs: 0.92 },
    critBias: 1,
    costSensitivity: 1,
  };
}
