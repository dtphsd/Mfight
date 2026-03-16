import type { CombatResources, CombatZone, RoundResult } from "@/modules/combat";
import type { BattleLogTagGroups } from "@/ui/components/combat/battleLogFormatting";

export function formatBattleLogTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getBattleLogZoneLabel(zone: CombatZone) {
  switch (zone) {
    case "head":
      return "Head";
    case "chest":
      return "Chest";
    case "belly":
      return "Belly";
    case "waist":
      return "Waist";
    case "legs":
      return "Legs";
    default:
      return "Hit";
  }
}

export function buildBattleLogExplanation(tagGroups: BattleLogTagGroups) {
  const parts = [...tagGroups.context, ...tagGroups.reasons, ...tagGroups.effects];
  return parts.length > 0 ? parts.join(" | ") : null;
}

export function buildBattleLogTagGroups(result: RoundResult): BattleLogTagGroups {
  const groups: BattleLogTagGroups = {
    outcome: [],
    context: [],
    reasons: [],
    effects: [],
  };

  if (isFullyBlockedResult(result)) {
    groups.outcome.push("Full Block");
    groups.reasons.push("Attack Fully Blocked");

    if (result.skillName) {
      groups.context.push(`Skill: ${result.skillName}`);
    }

    if (result.consumableName) {
      groups.context.push(result.type === "consumable" ? `Item: ${result.consumableName}` : `Combo: ${result.consumableName}`);
    }

    groups.effects.push(...buildResourceGainTags(result.attackerResourceGain, "Gain"));
    groups.effects.push(...buildResourceGainTags(result.defenderResourceGain, "Def"));
    groups.effects.push(...buildHealingTags(result.healedHp));
    groups.effects.push(...buildAppliedEffectTags(result.appliedEffects ?? []));
    groups.effects.push(...buildExpiredEffectTags(result.expiredEffects ?? []));

    return groups;
  }

  switch (result.type) {
    case "crit":
      groups.outcome.push("Critical");
      break;
    case "penetration":
      groups.outcome.push("Penetration");
      groups.reasons.push("Guard Broken");
      break;
    case "block":
      groups.outcome.push(`Block ${result.blockedPercent ?? 0}%`);
      groups.reasons.push("Defense Held");
      break;
    case "dodge":
      groups.outcome.push("Dodge");
      groups.reasons.push("Attack Avoided");
      break;
    case "consumable":
      groups.outcome.push("Item Use");
      break;
    default:
      groups.outcome.push("Hit");
      break;
  }

  if (result.skillName) {
    groups.context.push(`Skill: ${result.skillName}`);
  }

  if (result.consumableName) {
    groups.context.push(result.type === "consumable" ? `Item: ${result.consumableName}` : `Combo: ${result.consumableName}`);
  }

  if (result.attackZone && !isEffectTickResult(result)) {
    groups.context.push(`Zone: ${getBattleLogZoneLabel(result.attackZone)}`);
  }

  if (result.damageType && !isEffectTickResult(result)) {
    groups.context.push(`Type: ${formatBattleLogTitle(result.damageType)}`);
  }

  groups.effects.push(...buildResourceGainTags(result.attackerResourceGain, "Gain"));
  groups.effects.push(...buildResourceGainTags(result.defenderResourceGain, "Def"));
  groups.effects.push(...buildHealingTags(result.healedHp));
  groups.effects.push(...buildAppliedEffectTags(result.appliedEffects ?? []));
  groups.effects.push(...buildExpiredEffectTags(result.expiredEffects ?? []));

  return groups;
}

export function isEffectTickResult(result: RoundResult) {
  return (
    result.type === "consumable" &&
    !result.consumableName &&
    (result.healedHp > 0 ||
      result.finalDamage > 0 ||
      (result.appliedEffects?.length ?? 0) > 0 ||
      (result.expiredEffects?.length ?? 0) > 0 ||
      result.messages.includes("effects"))
  );
}

export function isFullyBlockedResult(result: RoundResult) {
  return result.finalDamage === 0 && result.blocked;
}

function buildResourceGainTags(resources: Partial<CombatResources>, prefix: string) {
  return Object.entries(resources)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([resource, value]) => `${prefix}: ${formatBattleLogTitle(resource)} +${value}`);
}

function buildAppliedEffectTags(effects: NonNullable<RoundResult["appliedEffects"]>) {
  return effects.map(
    (effect) =>
      `${effect.kind === "buff" ? "Buff" : "Debuff"}: ${effect.effectName}${effect.stackCount && effect.stackCount > 1 ? ` x${effect.stackCount}` : ""} on ${effect.targetName}`
  );
}

function buildExpiredEffectTags(effects: NonNullable<RoundResult["expiredEffects"]>) {
  return effects.map((effect) => `Expired: ${effect.effectName}${effect.stackCount && effect.stackCount > 1 ? ` x${effect.stackCount}` : ""}`);
}

function buildHealingTags(healedHp: number) {
  return healedHp > 0 ? [`Heal: +${healedHp} HP`] : [];
}
