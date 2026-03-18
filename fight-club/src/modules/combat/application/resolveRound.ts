import { createId } from "@/core/ids/createId";
import type { Random } from "@/core/rng/Random";
import {
  baseDamage,
  blockPenetration,
  critChance,
  critMultiplier,
  damageRange,
  dodgeChance,
} from "@/modules/combat/services/combatFormulas";
import { resolveTypedArmorMitigation } from "@/modules/combat/services/combatMitigation";
import type { CombatantState } from "@/modules/combat/model/CombatantState";
import {
  normalizeCombatEffectDefinition,
  type ActiveCombatEffect,
  type CombatEffectDefinition,
  type CombatEffectModifiers,
} from "@/modules/combat/model/CombatEffect";
import type { CombatSkill } from "@/modules/combat/model/CombatSkill";
import { addCombatResources, type CombatResources } from "@/modules/combat/model/CombatResources";
import type { CombatState } from "@/modules/combat/model/CombatState";
import type { CombatZone } from "@/modules/combat/model/CombatZone";
import {
  getRoundActionConsumable,
  getRoundActionIntent,
  getRoundActionSkill,
  isConsumableAttackAction,
  isConsumableOnlyAction,
  type RoundAction,
} from "@/modules/combat/model/RoundAction";
import type { RoundResult } from "@/modules/combat/model/RoundResult";
import {
  combatBlockConfig,
  combatChanceCaps,
  combatDamageTypes,
  combatIntentConfig,
  combatProfileMixConfig,
  combatResourceRewards,
  combatWeaponClassProfiles,
  combatZoneDamageModifiers,
  combatZoneFallbackProfiles,
} from "@/modules/combat/config/combatConfig";
import { getWeaponClassPassiveEffect } from "@/modules/combat/config/combatWeaponPassives";
import {
  type ArmorProfile,
  type DamageProfile,
  type DamageType,
  type WeaponClass,
  zeroDamageProfile,
} from "@/modules/inventory";

type CombatResult<TData> =
  | { success: true; data: TData }
  | { success: false; reason: CombatFailureReason };

type CombatFailureReason =
  | "combat_not_active"
  | "invalid_action"
  | "combatant_not_found"
  | "duplicate_defense_zones"
  | "dead_combatant_action"
  | "insufficient_resources"
  | "skill_on_cooldown";

export function resolveRound(
  state: CombatState,
  actions: [RoundAction, RoundAction],
  random: Random
): CombatResult<CombatState> {
  try {
    if (state.status !== "active") {
      return {
        success: false,
        reason: "combat_not_active",
      };
    }

    const actionMap = new Map(actions.map((action) => [action.attackerId, action]));

    if (actionMap.size !== state.combatants.length) {
      return {
        success: false,
        reason: "invalid_action",
      };
    }

    const withActions = state.combatants.map((combatant) => {
      const action = actionMap.get(combatant.id);

      if (!action) {
        throw new Error("combatant_not_found");
      }

      if (combatant.currentHp <= 0) {
        throw new Error("dead_combatant_action");
      }

      if (action.defenseZones[0] === action.defenseZones[1]) {
        throw new Error("duplicate_defense_zones");
      }

      return {
        ...combatant,
        attackZone: action.attackZone,
        defenseZones: [...action.defenseZones],
      };
    }) as [CombatantState, CombatantState];

    const orderedIds = [...withActions]
      .sort((left, right) => {
        if (left.stats.agility === right.stats.agility) {
          return random.int(0, 1) === 0 ? -1 : 1;
        }

        return right.stats.agility - left.stats.agility;
      })
      .map((combatant) => combatant.id);

    const nextCombatants = new Map(withActions.map((combatant) => [combatant.id, combatant]));
    const roundResults: RoundResult[] = [];

    for (const attackerId of orderedIds) {
      const attacker = nextCombatants.get(attackerId);
      const defender = [...nextCombatants.values()].find((candidate) => candidate.id !== attackerId);

      if (!attacker || !defender) {
        return {
          success: false,
          reason: "combatant_not_found",
        };
      }

      if (attacker.currentHp <= 0 || defender.currentHp <= 0) {
        continue;
      }

      const attackerTurnStart = processTurnStartEffects(attacker);
      nextCombatants.set(attacker.id, attackerTurnStart.combatant);

      if (attackerTurnStart.combatant.currentHp <= 0 || defender.currentHp <= 0) {
        if (attackerTurnStart.result) {
          attackerTurnStart.result.round = state.round;
          roundResults.push(attackerTurnStart.result);
        }
        continue;
      }

      const action = actionMap.get(attacker.id);

      if (!action) {
        return {
          success: false,
          reason: "combatant_not_found",
        };
      }

      const defenderAction = actionMap.get(defender.id);

      if (!defenderAction) {
        return {
          success: false,
          reason: "combatant_not_found",
        };
      }

      const { updatedAttacker, updatedDefender, result } =
        isConsumableOnlyAction(action)
          ? resolveConsumableUse(attackerTurnStart.combatant, defender, action)
          : resolveAttack(attackerTurnStart.combatant, defender, action, defenderAction, random);
      nextCombatants.set(attacker.id, updatedAttacker);
      nextCombatants.set(defender.id, updatedDefender);
      result.round = state.round;
      if (attackerTurnStart.result) {
        attackerTurnStart.result.round = state.round;
        roundResults.push(attackerTurnStart.result);
      }
      roundResults.push(result);
    }

    const combatants = state.combatants.map((combatant) => nextCombatants.get(combatant.id)!) as [
      CombatantState,
      CombatantState,
    ];
    const aliveCombatants = combatants.filter((combatant) => combatant.currentHp > 0);
    const winnerId = aliveCombatants.length === 1 ? aliveCombatants[0].id : null;

    return {
      success: true,
      data: {
        ...state,
        round: winnerId ? state.round : state.round + 1,
        status: winnerId ? "finished" : "active",
        combatants,
        winnerId,
        log: [...state.log, ...roundResults],
      },
    };
  } catch (error) {
    return {
      success: false,
      reason: normalizeError(error),
    };
  }
}

function resolveAttack(
  attacker: CombatantState,
  defender: CombatantState,
  action: RoundAction,
  defenderAction: RoundAction,
  random: Random
): { updatedAttacker: CombatantState; updatedDefender: CombatantState; result: RoundResult } {
  const attackerIntent = combatIntentConfig[getRoundActionIntent(action)];
  const defenderIntent = combatIntentConfig[getRoundActionIntent(defenderAction)];
  const defenderEffectModifiers = getCombatEffectModifiers(defender.activeEffects);
  const effectiveDefender = applyCombatEffectModifiers(defender, defenderEffectModifiers);
  const selectedConsumable = getRoundActionConsumable(action);
  const preparedAttacker = isConsumableAttackAction(action) && selectedConsumable
    ? applyConsumableForAttack(attacker, selectedConsumable).updatedAttacker
    : attacker;
  const healedHpFromConsumable =
    isConsumableAttackAction(action) && selectedConsumable
      ? applyConsumableForAttack(attacker, selectedConsumable).healedHp
      : 0;
  const preparedAttackerModifiers = getCombatEffectModifiers(preparedAttacker.activeEffects);
  const effectivePreparedAttacker = applyCombatEffectModifiers(preparedAttacker, preparedAttackerModifiers);
  const selectedSkill = getRoundActionSkill(action);
  const selectedSkillStateBonus = getCombatSkillStateBonus(
    selectedSkill,
    defender.activeEffects,
    attackerIntent.stateBonusMultiplier
  );
  const resourceCost = selectedSkill ? selectedSkill.cost : 0;

  if (selectedSkill && getCombatantSkillCooldown(preparedAttacker, selectedSkill.id) > 0) {
    throw new Error("skill_on_cooldown");
  }

  if (selectedSkill && preparedAttacker.resources[selectedSkill.resourceType] < resourceCost) {
    throw new Error("insufficient_resources");
  }

  const attackProfile = applySkillDamageModifier(
    calculateAttackProfile(effectivePreparedAttacker, effectivePreparedAttacker.attackZone!),
    selectedSkill,
    selectedSkillStateBonus.damageMultiplierBonus
  );
  const outgoingScaledAttackProfile = scaleProfile(
    attackProfile,
    (1 + preparedAttackerModifiers.outgoingDamagePercent / 100) * attackerIntent.outgoingDamageMultiplier
  );
  const primaryDamageType = effectivePreparedAttacker.weaponClass
    ? getPrimaryDamageType(attackProfile)
    : effectivePreparedAttacker.preferredDamageType ?? getPrimaryDamageType(attackProfile);
  const result: RoundResult = {
    round: 0,
    timestamp: Date.now(),
    type: "hit",
    attackerId: preparedAttacker.id,
    attackerName: preparedAttacker.name,
    defenderId: defender.id,
    defenderName: defender.name,
    attackZone: preparedAttacker.attackZone!,
    damageType: primaryDamageType,
    skillName: selectedSkill?.name ?? null,
    consumableName: isConsumableAttackAction(action) && selectedConsumable ? selectedConsumable.itemName : null,
    dodged: false,
    blocked: false,
    penetrated: false,
    crit: false,
    damage: 0,
    finalDamage: 0,
    healedHp: healedHpFromConsumable,
    blockedPercent: null,
    defenderHpAfter: defender.currentHp,
    attackerHpAfter: preparedAttacker.currentHp,
    attackerResourceGain: {},
    defenderResourceGain: {},
    appliedEffects: [],
    expiredEffects: [],
    messages: [],
    commentary: "",
    knockoutCommentary: null,
  };

  const dodgeRoll = random.int(0, 99);
  const dodgeRate = clampChance(
    dodgeChance(effectivePreparedAttacker.stats.agility, effectiveDefender.stats.agility) +
      effectiveDefender.dodgeChanceBonus +
      defenderIntent.dodgeChanceBonus -
      attackerIntent.dodgeSuppression
  );

  if (dodgeRoll < dodgeRate) {
    result.type = "dodge";
    result.dodged = true;
    result.defenderResourceGain = { focus: combatResourceRewards.dodgeDefenderFocus };
    result.messages.push("dodge");
    result.commentary = "Defender slipped the strike";
    return {
      updatedAttacker: preparedAttacker,
      updatedDefender: {
        ...defender,
        resources: addCombatResources(defender.resources, result.defenderResourceGain),
      },
      result: {
        ...result,
        attackerHpAfter: preparedAttacker.currentHp,
      },
    };
  }

  const isBlocked = defender.defenseZones.includes(preparedAttacker.attackZone!);
  let resolvedProfile = resolveTypedArmorMitigation({
    attackProfile: outgoingScaledAttackProfile,
    attacker: effectivePreparedAttacker,
    defender: effectiveDefender,
    zone: effectivePreparedAttacker.attackZone!,
    isDefended: isBlocked,
    random,
    skillArmorPenetrationPercentBonus: sumDamageProfiles(
      sumDamageProfiles(
        selectedSkill?.armorPenetrationPercentBonus ?? zeroDamageProfile,
        selectedSkillStateBonus.armorPenetrationPercentBonus
      ),
      preparedAttackerModifiers.armorPenetrationPercentBonus
    ),
  });

  resolvedProfile = scaleProfile(resolvedProfile, 1 + defenderEffectModifiers.incomingDamagePercent / 100);

  if (isBlocked) {
    const penetrationRate = clampChance(
      blockPenetration(effectivePreparedAttacker.stats.strength, effectiveDefender.stats.strength) +
        totalProfileValue(effectivePreparedAttacker.armorPenetrationPercent) / combatBlockConfig.penetrationArmorDivisor -
        (effectiveDefender.blockChanceBonus + defenderIntent.blockChanceBonus)
    );
    const penetrationRoll = random.int(0, 99);

    if (penetrationRoll >= penetrationRate) {
      const blockedPercent = rollBlockedPercent(defender, random, defenderIntent.blockPowerBonus);

      result.type = "block";
      result.blocked = true;
      result.defenderResourceGain = { guard: combatResourceRewards.blockDefenderGuard };
      resolvedProfile = scaleProfile(resolvedProfile, 1 - blockedPercent / 100);
      result.blockedPercent = blockedPercent;
      result.messages.push("block");
      result.commentary = "Defender caught the blow on guard";
    } else {
      result.type = "penetration";
      result.penetrated = true;
      result.attackerResourceGain = { momentum: combatResourceRewards.penetrationAttackerMomentum };
      result.messages.push("penetration");
      result.commentary = "Attacker broke through the guard";
    }
  }

  const critRoll = random.int(0, 99);
  const critRate = clampChance(
    critChance(effectivePreparedAttacker.stats.rage, effectiveDefender.stats.rage) +
      effectivePreparedAttacker.critChanceBonus +
      attackerIntent.critChanceBonus +
      (selectedSkill?.critChanceBonus ?? 0) +
      selectedSkillStateBonus.critChanceBonus
  );

  if (critRoll < critRate) {
      result.type = "crit";
      result.crit = true;
    result.attackerResourceGain = { rage: combatResourceRewards.critAttackerRage };
      resolvedProfile = scaleProfile(
        resolvedProfile,
      critMultiplier(effectivePreparedAttacker.stats.rage, effectivePreparedAttacker.stats.endurance) +
        effectivePreparedAttacker.critMultiplierBonus
    );
    result.messages.push("crit");
    result.commentary = "Attacker fully committed to the hit";
  }

  const rolledDamage = rollDamageValue(totalProfileValue(resolvedProfile), random);
  result.damage = rolledDamage;
  result.finalDamage = Math.floor(rolledDamage);

  if (selectedSkillStateBonus.triggeredBonusCount > 0) {
    result.messages.push("state_bonus");
  }

  if (!result.commentary) {
    result.commentary = "Attacker lands a clean strike";
  }

  if (action.intent !== "neutral") {
    result.messages.push(`intent_${action.intent}`);
  }

  if (isConsumableAttackAction(action) && selectedConsumable) {
    result.messages.unshift("consumable");
    result.commentary = `Used ${selectedConsumable.itemName}, then ${result.commentary.charAt(0).toLowerCase()}${result.commentary.slice(1)}`;
  }

  if (!result.crit && !result.penetrated && !result.blocked && result.finalDamage > 0) {
    result.attackerResourceGain = { momentum: combatResourceRewards.cleanHitAttackerMomentum };
  }

  const updatedDefender: CombatantState = {
    ...defender,
    currentHp: Math.max(0, defender.currentHp - result.finalDamage),
    resources: addCombatResources(defender.resources, result.defenderResourceGain),
  };
  const updatedAttacker: CombatantState = {
    ...preparedAttacker,
    resources: spendAndAddCombatResources(
      preparedAttacker.resources,
      selectedSkill ? { [selectedSkill.resourceType]: selectedSkill.cost } : {},
      result.attackerResourceGain
    ),
    skillCooldowns: setCombatantSkillCooldown(preparedAttacker.skillCooldowns, selectedSkill),
  };

  const effectApplication = applySkillEffects({
    attacker: updatedAttacker,
    defender: updatedDefender,
    skill: selectedSkill,
    hitLanded: !result.dodged,
  });
  const passiveEffectApplication = applyWeaponPassiveEffects({
    attacker: effectApplication.updatedAttacker,
    defender: effectApplication.updatedDefender,
    weaponClass: effectivePreparedAttacker.weaponClass,
    result,
  });

  result.defenderHpAfter = passiveEffectApplication.updatedDefender.currentHp;
  result.attackerHpAfter = passiveEffectApplication.updatedAttacker.currentHp;
  result.appliedEffects = [...effectApplication.appliedEffects, ...passiveEffectApplication.appliedEffects];

  if (passiveEffectApplication.updatedDefender.currentHp <= 0) {
    result.knockoutCommentary = "Knockout!";
  }

  return {
    updatedAttacker: passiveEffectApplication.updatedAttacker,
    updatedDefender: passiveEffectApplication.updatedDefender,
    result,
  };
}

function applyConsumableForAttack(
  attacker: CombatantState,
  consumable: NonNullable<ReturnType<typeof getRoundActionConsumable>>
) {
  const nextHp = Math.min(attacker.maxHp, attacker.currentHp + consumable.effect.heal);

  return {
    updatedAttacker: {
      ...attacker,
      currentHp: nextHp,
      resources: addCombatResources(attacker.resources, consumable.effect.resourceRestore),
    },
    healedHp: Math.max(0, nextHp - attacker.currentHp),
  };
}

function resolveConsumableUse(
  attacker: CombatantState,
  defender: CombatantState,
  action: RoundAction
): { updatedAttacker: CombatantState; updatedDefender: CombatantState; result: RoundResult } {
  const consumable = getRoundActionConsumable(action)!;
  const resourceGain = consumable.effect.resourceRestore;
  const nextHp = Math.min(attacker.maxHp, attacker.currentHp + consumable.effect.heal);
  const updatedAttacker: CombatantState = {
    ...attacker,
    currentHp: nextHp,
    resources: addCombatResources(attacker.resources, resourceGain),
  };
  const healedHp = Math.max(0, nextHp - attacker.currentHp);
  const effectApplication = applyConsumableEffects(updatedAttacker, consumable);

  return {
    updatedAttacker: effectApplication.updatedAttacker,
    updatedDefender: defender,
    result: {
      round: 0,
      timestamp: Date.now(),
      type: "consumable",
      attackerId: attacker.id,
      attackerName: attacker.name,
      defenderId: attacker.id,
      defenderName: attacker.name,
      attackZone: action.attackZone,
      damageType: attacker.preferredDamageType ?? "blunt",
      skillName: null,
      consumableName: consumable.itemName,
      dodged: false,
      blocked: false,
      penetrated: false,
      crit: false,
      damage: 0,
      finalDamage: 0,
      healedHp,
      blockedPercent: null,
      defenderHpAfter: effectApplication.updatedAttacker.currentHp,
      attackerHpAfter: effectApplication.updatedAttacker.currentHp,
      attackerResourceGain: resourceGain,
      defenderResourceGain: {},
      appliedEffects: effectApplication.appliedEffects,
      expiredEffects: [],
      messages: ["consumable"],
      commentary: `Used ${consumable.itemName}`,
      knockoutCommentary: null,
    },
  };
}

function applySkillDamageModifier(
  profile: DamageProfile,
  skill: ReturnType<typeof getRoundActionSkill>,
  additionalDamageMultiplier = 0
): DamageProfile {
  if (!skill) {
    return profile;
  }

  const totalDamageMultiplier = skill.damageMultiplier + additionalDamageMultiplier;

  return {
    slash: profile.slash * totalDamageMultiplier,
    pierce: profile.pierce * totalDamageMultiplier,
    blunt: profile.blunt * totalDamageMultiplier,
    chop: profile.chop * totalDamageMultiplier,
  };
}

function spendAndAddCombatResources(
  current: CombatResources,
  spend: Partial<Record<keyof CombatResources, number>>,
  gains: Partial<CombatResources>
) {
  const afterSpend: CombatResources = {
    rage: Math.max(0, current.rage - (spend.rage ?? 0)),
    guard: Math.max(0, current.guard - (spend.guard ?? 0)),
    momentum: Math.max(0, current.momentum - (spend.momentum ?? 0)),
    focus: Math.max(0, current.focus - (spend.focus ?? 0)),
  };

  return addCombatResources(afterSpend, gains);
}

function calculateAttackProfile(attacker: CombatantState, zone: CombatZone): DamageProfile {
  const zoneModifier = combatZoneDamageModifiers[zone];
  const baseAttackDamage = baseDamage(attacker.stats.strength) * zoneModifier;
  const distribution = normalizeAttackProfile(attacker.damage);
  const styleDistribution = getStyleDistribution(
    attacker.weaponClass,
    zone,
    attacker.preferredDamageType
  );
  const finalDistribution = normalizeAttackProfile({
    slash:
      distribution.slash * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.slash * combatProfileMixConfig.styleProfileWeight,
    pierce:
      distribution.pierce * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.pierce * combatProfileMixConfig.styleProfileWeight,
    blunt:
      distribution.blunt * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.blunt * combatProfileMixConfig.styleProfileWeight,
    chop:
      distribution.chop * combatProfileMixConfig.baseDamageWeight +
      styleDistribution.chop * combatProfileMixConfig.styleProfileWeight,
  });

  return {
    slash: attacker.damage.slash * zoneModifier + baseAttackDamage * finalDistribution.slash,
    pierce: attacker.damage.pierce * zoneModifier + baseAttackDamage * finalDistribution.pierce,
    blunt: attacker.damage.blunt * zoneModifier + baseAttackDamage * finalDistribution.blunt,
    chop: attacker.damage.chop * zoneModifier + baseAttackDamage * finalDistribution.chop,
  };
}

function normalizeAttackProfile(profile: DamageProfile): DamageProfile {
  const total = totalProfileValue(profile);

  if (total <= 0) {
    return {
      slash: 0,
      pierce: 0,
      blunt: 1,
      chop: 0,
    };
  }

  return {
    slash: getFiniteProfileValue(profile.slash) / total,
    pierce: getFiniteProfileValue(profile.pierce) / total,
    blunt: getFiniteProfileValue(profile.blunt) / total,
    chop: getFiniteProfileValue(profile.chop) / total,
  };
}

function scaleProfile(profile: DamageProfile, factor: number): DamageProfile {
  const safeFactor = Number.isFinite(factor) ? factor : 0;

  return {
    slash: getFiniteProfileValue(profile.slash) * safeFactor,
    pierce: getFiniteProfileValue(profile.pierce) * safeFactor,
    blunt: getFiniteProfileValue(profile.blunt) * safeFactor,
    chop: getFiniteProfileValue(profile.chop) * safeFactor,
  };
}

function sumDamageProfiles(left: DamageProfile, right: DamageProfile): DamageProfile {
  return {
    slash: getFiniteProfileValue(left.slash) + getFiniteProfileValue(right.slash),
    pierce: getFiniteProfileValue(left.pierce) + getFiniteProfileValue(right.pierce),
    blunt: getFiniteProfileValue(left.blunt) + getFiniteProfileValue(right.blunt),
    chop: getFiniteProfileValue(left.chop) + getFiniteProfileValue(right.chop),
  };
}

function sumArmorProfiles(left: ArmorProfile, right: ArmorProfile): ArmorProfile {
  return {
    slash: getFiniteProfileValue(left.slash) + getFiniteProfileValue(right.slash),
    pierce: getFiniteProfileValue(left.pierce) + getFiniteProfileValue(right.pierce),
    blunt: getFiniteProfileValue(left.blunt) + getFiniteProfileValue(right.blunt),
    chop: getFiniteProfileValue(left.chop) + getFiniteProfileValue(right.chop),
  };
}

function totalProfileValue(profile: DamageProfile | ArmorProfile) {
  return combatDamageTypes.reduce((total, type) => total + getFiniteProfileValue(profile[type]), 0);
}

function getFiniteProfileValue(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function getPrimaryDamageType(profile: DamageProfile): DamageType {
  return combatDamageTypes.reduce((bestType, currentType) =>
    profile[currentType] > profile[bestType] ? currentType : bestType
  , combatDamageTypes[0]);
}

function getStyleDistribution(
  weaponClass: WeaponClass | null,
  zone: CombatZone,
  preferredDamageType: DamageType | null
): DamageProfile {
  if (weaponClass) {
    return normalizeAttackProfile(getWeaponClassProfile(weaponClass, zone));
  }

  if (preferredDamageType) {
    return normalizeAttackProfile({
      slash: preferredDamageType === "slash" ? 1 : 0,
      pierce: preferredDamageType === "pierce" ? 1 : 0,
      blunt: preferredDamageType === "blunt" ? 1 : 0,
      chop: preferredDamageType === "chop" ? 1 : 0,
    });
  }

  return normalizeAttackProfile(getZoneFallbackProfile(zone));
}

function getWeaponClassProfile(weaponClass: WeaponClass, zone: CombatZone): DamageProfile {
  return combatWeaponClassProfiles[weaponClass][zone];
}

function getZoneFallbackProfile(zone: CombatZone): DamageProfile {
  return combatZoneFallbackProfiles[zone];
}

function clampChance(value: number) {
  return Math.min(combatChanceCaps.chance, Math.max(0, Math.round(value)));
}

function clampBlockPercent(value: number) {
  return Math.min(combatBlockConfig.maxBlockedPercent, Math.max(40, Math.round(value)));
}

function rollBlockedPercent(defender: CombatantState, random: Random, intentBlockPowerBonus = 0) {
  const strongBlockChance = clampChance(
    combatBlockConfig.baseStrongBlockChance +
      defender.stats.endurance * combatBlockConfig.enduranceToStrongBlockChanceFactor +
      (defender.blockPowerBonus + intentBlockPowerBonus) * combatBlockConfig.blockPowerToStrongBlockChanceFactor
  );
  const strongBlockRoll = random.int(0, 99);
  const strongBlock = strongBlockRoll < strongBlockChance;

  const minBlockedPercent = strongBlock
    ? combatBlockConfig.strongBlockThresholdPercent
    : combatBlockConfig.baseBlockedPercent;
  const maxBlockedPercent = strongBlock
    ? combatBlockConfig.maxBlockedPercent
    : combatBlockConfig.strongBlockThresholdPercent - 1;

  return clampBlockPercent(random.int(minBlockedPercent, maxBlockedPercent));
}

function rollDamageValue(value: number, random: Random) {
  const range = damageRange(value);
  if (range.max <= range.min) {
    return range.min;
  }

  return random.int(range.min, range.max);
}

function getCombatSkillStateBonus(
  skill: CombatSkill | null | undefined,
  activeEffects: ActiveCombatEffect[],
  multiplier = 1
) {
  if (!skill?.stateBonuses?.length) {
    return {
      damageMultiplierBonus: 0,
      critChanceBonus: 0,
      armorPenetrationPercentBonus: zeroDamageProfile,
      triggeredBonusCount: 0,
    };
  }

  return skill.stateBonuses.reduce(
    (accumulator, bonus) => {
      if (!activeEffects.some((effect) => effect.effectId === bonus.requiredEffectId)) {
        return accumulator;
      }

      return {
        damageMultiplierBonus:
          accumulator.damageMultiplierBonus + (bonus.damageMultiplierBonus ?? 0) * multiplier,
        critChanceBonus: accumulator.critChanceBonus + (bonus.critChanceBonus ?? 0) * multiplier,
        armorPenetrationPercentBonus: sumDamageProfiles(
          accumulator.armorPenetrationPercentBonus,
          scaleProfile(bonus.armorPenetrationPercentBonus ?? zeroDamageProfile, multiplier)
        ),
        triggeredBonusCount: accumulator.triggeredBonusCount + 1,
      };
    },
    {
      damageMultiplierBonus: 0,
      critChanceBonus: 0,
      armorPenetrationPercentBonus: zeroDamageProfile,
      triggeredBonusCount: 0,
    }
  );
}

function getCombatEffectModifiers(effects: ActiveCombatEffect[]): CombatEffectModifiers {
  return effects.reduce<CombatEffectModifiers>(
    (accumulator, effect) => ({
      critChanceBonus: accumulator.critChanceBonus + effect.modifiers.critChanceBonus,
      dodgeChanceBonus: accumulator.dodgeChanceBonus + effect.modifiers.dodgeChanceBonus,
      blockChanceBonus: accumulator.blockChanceBonus + effect.modifiers.blockChanceBonus,
      blockPowerBonus: accumulator.blockPowerBonus + effect.modifiers.blockPowerBonus,
      outgoingDamagePercent: accumulator.outgoingDamagePercent + effect.modifiers.outgoingDamagePercent,
      incomingDamagePercent: accumulator.incomingDamagePercent + effect.modifiers.incomingDamagePercent,
      armorFlatBonus: sumArmorProfiles(accumulator.armorFlatBonus, effect.modifiers.armorFlatBonus),
      damageFlatBonus: sumDamageProfiles(accumulator.damageFlatBonus, effect.modifiers.damageFlatBonus),
      armorPenetrationPercentBonus: sumDamageProfiles(
        accumulator.armorPenetrationPercentBonus,
        effect.modifiers.armorPenetrationPercentBonus
      ),
    }),
    {
      critChanceBonus: 0,
      dodgeChanceBonus: 0,
      blockChanceBonus: 0,
      blockPowerBonus: 0,
      outgoingDamagePercent: 0,
      incomingDamagePercent: 0,
      armorFlatBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      damageFlatBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
      armorPenetrationPercentBonus: { slash: 0, pierce: 0, blunt: 0, chop: 0 },
    }
  );
}

function applyCombatEffectModifiers(combatant: CombatantState, modifiers: CombatEffectModifiers): CombatantState {
  const averageArmorBonus = Math.floor(totalProfileValue(modifiers.armorFlatBonus) / combatDamageTypes.length);

  return {
    ...combatant,
    damage: sumDamageProfiles(combatant.damage, modifiers.damageFlatBonus),
    armor: sumArmorProfiles(combatant.armor, modifiers.armorFlatBonus),
    zoneArmor: {
      head: (combatant.zoneArmor?.head ?? 0) + averageArmorBonus,
      chest: (combatant.zoneArmor?.chest ?? 0) + averageArmorBonus,
      belly: (combatant.zoneArmor?.belly ?? 0) + averageArmorBonus,
      waist: (combatant.zoneArmor?.waist ?? 0) + averageArmorBonus,
      legs: (combatant.zoneArmor?.legs ?? 0) + averageArmorBonus,
    },
    critChanceBonus: combatant.critChanceBonus + modifiers.critChanceBonus,
    dodgeChanceBonus: combatant.dodgeChanceBonus + modifiers.dodgeChanceBonus,
    blockChanceBonus: combatant.blockChanceBonus + modifiers.blockChanceBonus,
    blockPowerBonus: combatant.blockPowerBonus + modifiers.blockPowerBonus,
    armorPenetrationPercent: sumDamageProfiles(combatant.armorPenetrationPercent, modifiers.armorPenetrationPercentBonus),
  };
}

function processTurnStartEffects(combatant: CombatantState): {
  combatant: CombatantState;
  result: RoundResult | null;
} {
  if (combatant.activeEffects.length === 0) {
    return { combatant, result: null as RoundResult | null };
  }

  const resourceGain = combatant.activeEffects.reduce(
    (accumulator, effect) => addCombatResources(accumulator, effect.periodic.resourceDelta),
    { rage: 0, guard: 0, momentum: 0, focus: 0 }
  );
  const totalDamage = combatant.activeEffects.reduce((sum, effect) => sum + effect.periodic.damage, 0);
  const totalHeal = combatant.activeEffects.reduce((sum, effect) => sum + effect.periodic.heal, 0);
  const healedHp = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp - totalDamage + totalHeal) - Math.max(0, combatant.currentHp - totalDamage));
  const nextHp = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp - totalDamage + totalHeal));
  const expiredEffects = combatant.activeEffects
    .filter((effect) => effect.turnsRemaining <= 1)
    .map((effect) => ({
      targetId: combatant.id,
      targetName: combatant.name,
      effectName: effect.name,
      kind: effect.kind,
      turnsRemaining: 0,
      stackCount: effect.stackCount,
    }));
  const remainingEffects = combatant.activeEffects
    .map((effect) => ({ ...effect, turnsRemaining: effect.turnsRemaining - 1 }))
    .filter((effect) => effect.turnsRemaining > 0);

  const nextCombatant: CombatantState = {
    ...combatant,
    currentHp: nextHp,
    resources: addCombatResources(combatant.resources, resourceGain),
    activeEffects: remainingEffects,
    skillCooldowns: tickCombatantSkillCooldowns(combatant.skillCooldowns),
  };

  if (totalDamage === 0 && totalHeal === 0 && expiredEffects.length === 0 && isZeroResourceState(resourceGain)) {
    return { combatant: nextCombatant, result: null as RoundResult | null };
  }

  return {
    combatant: nextCombatant,
    result: {
      round: 0,
      timestamp: Date.now(),
      type: "consumable",
      attackerId: combatant.id,
      attackerName: combatant.name,
      defenderId: combatant.id,
      defenderName: combatant.name,
      attackZone: combatant.attackZone ?? "head",
      damageType: combatant.preferredDamageType ?? "blunt",
      skillName: null,
      consumableName: null,
      dodged: false,
      blocked: false,
      penetrated: false,
      crit: false,
      damage: totalDamage,
      finalDamage: totalDamage,
      healedHp,
      blockedPercent: null,
      defenderHpAfter: nextHp,
      attackerHpAfter: nextHp,
      attackerResourceGain: resourceGain,
      defenderResourceGain: {},
      appliedEffects: [],
      expiredEffects,
      messages: ["effects"],
      commentary: buildTurnStartEffectCommentary(combatant.activeEffects, totalDamage, healedHp),
      knockoutCommentary: nextHp <= 0 ? "Knockout!" : null,
    },
  };
}

function applySkillEffects(input: {
  attacker: CombatantState;
  defender: CombatantState;
  skill: ReturnType<typeof getRoundActionSkill>;
  hitLanded: boolean;
}) {
  const { attacker, defender, skill, hitLanded } = input;

  if (!skill?.effects?.length) {
    return {
      updatedAttacker: attacker,
      updatedDefender: defender,
      appliedEffects: [] as NonNullable<RoundResult["appliedEffects"]>,
    };
  }

  let updatedAttacker = attacker;
  let updatedDefender = defender;
  const appliedEffects: NonNullable<RoundResult["appliedEffects"]> = [];

  skill.effects.forEach((definition) => {
    if (definition.trigger === "on_hit" && !hitLanded) {
      return;
    }

    const target = definition.target === "self" ? updatedAttacker : updatedDefender;
    const { nextTarget, activeEffect } = applyEffectDefinitionToCombatant(target, definition, skill.name, attacker.name);

    if (definition.target === "self") {
      updatedAttacker = nextTarget;
    } else {
      updatedDefender = nextTarget;
    }

    appliedEffects.push({
      targetId: nextTarget.id,
      targetName: nextTarget.name,
      effectName: activeEffect.name,
      kind: activeEffect.kind,
      turnsRemaining: activeEffect.turnsRemaining,
      stackCount: activeEffect.stackCount,
    });
  });

  return {
    updatedAttacker,
    updatedDefender,
    appliedEffects,
  };
}

function applyWeaponPassiveEffects(input: {
  attacker: CombatantState;
  defender: CombatantState;
  weaponClass: WeaponClass | null;
  result: Pick<RoundResult, "crit" | "dodged" | "finalDamage">;
}) {
  const passiveEffect = getWeaponClassPassiveEffect(input.weaponClass, input.result);

  if (!passiveEffect) {
    return {
      updatedAttacker: input.attacker,
      updatedDefender: input.defender,
      appliedEffects: [] as NonNullable<RoundResult["appliedEffects"]>,
    };
  }

  const target = passiveEffect.target === "self" ? input.attacker : input.defender;
  const { nextTarget, activeEffect } = applyEffectDefinitionToCombatant(target, passiveEffect, null, input.attacker.name);

  return {
    updatedAttacker: passiveEffect.target === "self" ? nextTarget : input.attacker,
    updatedDefender: passiveEffect.target === "target" ? nextTarget : input.defender,
    appliedEffects: [
      {
        targetId: nextTarget.id,
        targetName: nextTarget.name,
        effectName: activeEffect.name,
        kind: activeEffect.kind,
        turnsRemaining: activeEffect.turnsRemaining,
        stackCount: activeEffect.stackCount,
      },
    ] as NonNullable<RoundResult["appliedEffects"]>,
  };
}

function applyConsumableEffects(
  attacker: CombatantState,
  consumable: NonNullable<ReturnType<typeof getRoundActionConsumable>>
) {
  if (!consumable.effect.effects?.length) {
    return {
      updatedAttacker: attacker,
      appliedEffects: [] as NonNullable<RoundResult["appliedEffects"]>,
    };
  }

  let updatedAttacker = attacker;
  const appliedEffects: NonNullable<RoundResult["appliedEffects"]> = [];

  consumable.effect.effects.forEach((definition) => {
    const applied = applyEffectDefinitionToCombatant(updatedAttacker, definition, consumable.itemName, attacker.name);
    const activeEffect = applied.activeEffect;
    updatedAttacker = applied.nextTarget;
    appliedEffects.push({
      targetId: updatedAttacker.id,
      targetName: updatedAttacker.name,
      effectName: activeEffect.name,
      kind: activeEffect.kind,
      turnsRemaining: activeEffect.turnsRemaining,
      stackCount: activeEffect.stackCount,
    });
  });

  return {
    updatedAttacker,
    appliedEffects,
  };
}

function createActiveCombatEffect(
  definition: CombatEffectDefinition,
  sourceSkillName: string | null,
  sourceName: string,
  stackCount = 1
): ActiveCombatEffect {
  const normalized = normalizeCombatEffectDefinition(definition, stackCount);

  return {
    id: createId("effect"),
    sourceName,
    sourceSkillName,
    turnsRemaining: definition.durationTurns,
    ...normalized,
  };
}

function applyEffectDefinitionToCombatant(
  target: CombatantState,
  definition: CombatEffectDefinition,
  sourceSkillName: string | null,
  sourceName: string
) {
  const existingEffect = target.activeEffects.find((effect) => effect.effectId === definition.id);
  const nextStackCount = Math.min(definition.maxStacks ?? 1, (existingEffect?.stackCount ?? 0) + 1);
  const activeEffect = createActiveCombatEffect(definition, sourceSkillName, sourceName, nextStackCount);

  return {
    nextTarget: {
      ...target,
      activeEffects: [...target.activeEffects.filter((effect) => effect.effectId !== definition.id), activeEffect],
    },
    activeEffect,
  };
}

function isZeroResourceState(resources: CombatResources) {
  return resources.rage === 0 && resources.guard === 0 && resources.momentum === 0 && resources.focus === 0;
}

function buildTurnStartEffectCommentary(effects: ActiveCombatEffect[], totalDamage: number, healedHp: number) {
  const parts: string[] = [];

  if (totalDamage > 0) {
    parts.push(`Suffers ${totalDamage} effect damage`);
  }

  if (healedHp > 0) {
    parts.push(`recovers ${healedHp} HP`);
  }

  if (parts.length === 0 && effects.length > 0) {
    parts.push(`Effects tick: ${effects.map((effect) => effect.name).join(", ")}`);
  }

  return parts.join(" and ");
}

function getCombatantSkillCooldown(combatant: CombatantState, skillId: string) {
  return combatant.skillCooldowns?.[skillId] ?? 0;
}

function setCombatantSkillCooldown(
  currentCooldowns: CombatantState["skillCooldowns"],
  skill: CombatSkill | null | undefined
) {
  if (!skill || typeof skill.cooldownTurns !== "number" || skill.cooldownTurns <= 0) {
    return currentCooldowns ?? {};
  }

  return {
    ...(currentCooldowns ?? {}),
    [skill.id]: skill.cooldownTurns,
  };
}

function tickCombatantSkillCooldowns(currentCooldowns: CombatantState["skillCooldowns"]) {
  return Object.fromEntries(
    Object.entries(currentCooldowns ?? {})
      .map(([skillId, turns]) => [skillId, Math.max(0, Number(turns) - 1)] as const)
      .filter(([, turns]) => turns > 0)
  );
}

function normalizeError(error: unknown): CombatFailureReason {
  if (error instanceof Error) {
    return error.message as CombatFailureReason;
  }

  return "invalid_action";
}
