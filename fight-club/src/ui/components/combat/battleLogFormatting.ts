import { commentatorPhrases } from "@/content/commentator/phrases";
import type { CombatLogEventType, CombatResources, CombatState, CombatZone, RoundResult } from "@/modules/combat";

export interface BattleLogTagGroups {
  outcome: string[];
  context: string[];
  reasons: string[];
  effects: string[];
}

export interface BattleLogEntry {
  id: string;
  sequence: number;
  timestamp: number;
  round: number;
  type: CombatLogEventType | "system";
  attackerId: string | null;
  attackerName: string | null;
  defenderId: string | null;
  defenderName: string | null;
  attackZone: CombatZone | null;
  damageType: string | null;
  damage: number | null;
  healedHp: number;
  blockedPercent: number | null;
  attackerResourceGain: Partial<CombatResources>;
  defenderResourceGain: Partial<CombatResources>;
  isEffectTick: boolean;
  tagGroups: BattleLogTagGroups;
  headline: string;
  explanation: string | null;
}

const MAX_ENTRIES = 50;
const RECENT_HISTORY_LIMIT = 3;
const BATTLE_LOG_VISIBLE_TAG_ORDER: Array<keyof BattleLogTagGroups> = ["outcome", "context", "reasons", "effects"];

export function createBattleLogEntries(combatState: CombatState | null, playerId: string, botId: string): BattleLogEntry[] {
  if (!combatState) {
    return [];
  }

  const entries: BattleLogEntry[] = [];
  const recentPhrasesByKey = new Map<string, string[]>();

  combatState.log.forEach((result, index) => {
    const sequenceBase = index * 2 + 1;
    const isEffectTick = isEffectTickResult(result);
    const headline = formatBattleLogHeadline(result, recentPhrasesByKey, playerId, botId);
    const tagGroups = buildBattleLogTagGroups(result);

    entries.push({
      id: `battle-log-${result.round}-${sequenceBase}-${result.attackerId}-${result.defenderId}`,
      sequence: sequenceBase,
      timestamp: result.timestamp,
      round: result.round,
      type: result.type,
      attackerId: result.attackerId,
      attackerName: result.attackerName,
      defenderId: result.defenderId,
      defenderName: result.defenderName,
      attackZone: result.attackZone,
      damageType: result.damageType,
      damage: result.finalDamage,
      healedHp: result.healedHp,
      blockedPercent: result.blockedPercent,
      attackerResourceGain: result.attackerResourceGain,
      defenderResourceGain: result.defenderResourceGain,
      isEffectTick,
      tagGroups,
      headline,
      explanation: buildBattleLogExplanation(tagGroups),
    });

    if (result.knockoutCommentary) {
      entries.push({
        id: `battle-log-${result.round}-${sequenceBase + 1}-knockout-${result.attackerId}`,
        sequence: sequenceBase + 1,
        timestamp: result.timestamp,
        round: result.round,
        type: "system",
        attackerId: result.attackerId,
        attackerName: result.attackerName,
        defenderId: result.defenderId,
        defenderName: result.defenderName,
        attackZone: null,
        damageType: null,
        damage: null,
        healedHp: 0,
        blockedPercent: null,
        attackerResourceGain: {},
        defenderResourceGain: {},
        isEffectTick: false,
        tagGroups: {
          outcome: ["KO"],
          context: ["System"],
          reasons: [],
          effects: [],
        },
        headline: `KO! ${result.knockoutCommentary} ${result.attackerName} wins!`,
        explanation: "System follow-up after knockout.",
      });
    }
  });

  return entries.slice(-MAX_ENTRIES).reverse();
}

function formatBattleLogHeadline(
  result: RoundResult,
  recentPhrasesByKey: Map<string, string[]>,
  playerId: string,
  botId: string
) {
  if (isFullyBlockedResult(result)) {
    return `${result.defenderName} blocked all damage from ${result.attackerName}'s attack`;
  }

  const attackerVariant = resolveCommentatorVariant(result.attackerId, playerId, botId);
  const defenderVariant = resolveCommentatorVariant(result.defenderId, playerId, botId);
  const attackerPhrases = commentatorPhrases[attackerVariant];
  const defenderPhrases = commentatorPhrases[defenderVariant];

  switch (result.type) {
    case "dodge": {
      const phrase = getUniquePhrase(
        `${defenderVariant}:dodge`,
        defenderPhrases.dodge,
        recentPhrasesByKey,
        result.commentary
      );
      return `${result.defenderName} ${phrase}`;
    }
    case "consumable":
      if (isEffectTickResult(result)) {
        if (result.finalDamage > 0 && result.healedHp > 0) {
          return `${result.attackerName} resolves active effects (-${result.finalDamage} HP, +${result.healedHp} HP)`;
        }
        if (result.healedHp > 0) {
          return `${result.attackerName} recovers ${result.healedHp} HP from active effects`;
        }
        if (result.finalDamage > 0) {
          return `${result.attackerName} suffers ${result.finalDamage} HP from active effects`;
        }
        return `${result.attackerName} resolves active effects`;
      }
      return `${result.attackerName} uses ${result.consumableName ?? "a consumable"}`;
    case "block":
      return `${result.defenderName} blocks ${result.attackerName}'s attack (${result.blockedPercent ?? 0}%)`;
    case "penetration": {
      const phrase = getUniquePhrase(
        `${attackerVariant}:penetration`,
        attackerPhrases.penetration,
        recentPhrasesByKey,
        result.commentary
      );
      return `${formatSkillPrefix(result)}${result.attackerName} ${phrase} (-${result.finalDamage} HP)`;
    }
    case "crit": {
      const phrase = getUniquePhrase(
        `${attackerVariant}:crit`,
        attackerPhrases.crit,
        recentPhrasesByKey,
        result.commentary
      );
      return `CRIT! ${formatSkillPrefix(result)}${result.attackerName} ${phrase} (-${result.finalDamage} HP)`;
    }
    case "hit":
    default: {
      const phrase = getUniquePhrase(
        `${attackerVariant}:attack:${result.attackZone}`,
        attackerPhrases.attack[result.attackZone],
        recentPhrasesByKey,
        result.commentary
      );
      return `${getZoneIcon(result.attackZone)} ${formatSkillPrefix(result)}${result.attackerName} ${phrase} (-${result.finalDamage} HP)`;
    }
  }
}

function formatSkillPrefix(result: RoundResult) {
  return result.skillName ? `[${result.skillName}] ` : "";
}

export function getBattleLogVisibleTags(entry: BattleLogEntry, limit = 4) {
  return BATTLE_LOG_VISIBLE_TAG_ORDER.flatMap((groupKey) => entry.tagGroups[groupKey]).slice(0, limit);
}

function buildBattleLogExplanation(tagGroups: BattleLogTagGroups) {
  const parts = [...tagGroups.context, ...tagGroups.reasons, ...tagGroups.effects];
  return parts.length > 0 ? parts.join(" | ") : null;
}

function buildBattleLogTagGroups(result: RoundResult): BattleLogTagGroups {
  const groups: BattleLogTagGroups = {
    outcome: [],
    context: [],
    reasons: [],
    effects: [],
  };

  if (isFullyBlockedResult(result)) {
    groups.outcome.push("Full Block");
    groups.reasons.push("Blocked All Damage");

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
      groups.reasons.push("Guard Held");
      break;
    case "dodge":
      groups.outcome.push("Dodge");
      groups.reasons.push("Clean Evade");
      break;
    case "consumable":
      groups.outcome.push("Solo Item");
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
    groups.context.push(`Zone: ${getZoneIcon(result.attackZone)}`);
  }

  if (result.damageType && !isEffectTickResult(result)) {
    groups.context.push(`Type: ${formatTitle(result.damageType)}`);
  }

  groups.effects.push(...buildResourceGainTags(result.attackerResourceGain, "Gain"));
  groups.effects.push(...buildResourceGainTags(result.defenderResourceGain, "Def"));
  groups.effects.push(...buildHealingTags(result.healedHp));
  groups.effects.push(...buildAppliedEffectTags(result.appliedEffects ?? []));
  groups.effects.push(...buildExpiredEffectTags(result.expiredEffects ?? []));

  return groups;
}

function resolveCommentatorVariant(actorId: string, playerId: string, botId: string): keyof Pick<
  typeof commentatorPhrases,
  "player" | "bot"
> {
  if (actorId === botId) {
    return "bot";
  }

  if (actorId === playerId) {
    return "player";
  }

  return "player";
}

export function getUniquePhrase(
  key: string,
  phrases: string[],
  recentPhrasesByKey: Map<string, string[]>,
  fallback?: string
) {
  if (phrases.length === 0) {
    return fallback ?? "";
  }

  const recent = recentPhrasesByKey.get(key) ?? [];
  const available = phrases.filter((phrase) => !recent.includes(phrase));
  const selected = available[0] ?? fallback ?? phrases[0];
  const nextRecent = [selected, ...recent].slice(0, Math.min(RECENT_HISTORY_LIMIT, phrases.length));

  recentPhrasesByKey.set(key, nextRecent);

  return selected;
}

function getZoneIcon(zone: CombatZone) {
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

function formatTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildResourceGainTags(resources: Partial<CombatResources>, prefix: string) {
  return Object.entries(resources)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([resource, value]) => `${prefix}: ${formatTitle(resource)} +${value}`);
}

function buildAppliedEffectTags(
  effects: NonNullable<RoundResult["appliedEffects"]>
) {
  return effects.map(
    (effect) =>
      `${effect.kind === "buff" ? "Buff" : "Debuff"}: ${effect.effectName}${effect.stackCount && effect.stackCount > 1 ? ` x${effect.stackCount}` : ""} on ${effect.targetName}`
  );
}

function buildExpiredEffectTags(
  effects: NonNullable<RoundResult["expiredEffects"]>
) {
  return effects.map((effect) => `Expired: ${effect.effectName}${effect.stackCount && effect.stackCount > 1 ? ` x${effect.stackCount}` : ""}`);
}

function buildHealingTags(healedHp: number) {
  return healedHp > 0 ? [`Heal: +${healedHp} HP`] : [];
}

function isEffectTickResult(result: RoundResult) {
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

function isFullyBlockedResult(result: RoundResult) {
  return result.finalDamage === 0 && result.blocked;
}
