import { commentatorPhrases } from "@/content/commentator/phrases";
import type { CombatLogEventType, CombatResources, CombatState, CombatZone, RoundResult } from "@/modules/combat";
import {
  buildBattleLogExplanation,
  buildBattleLogTagGroups,
  getBattleLogZoneLabel,
  isEffectTickResult,
  isFullyBlockedResult,
} from "@/ui/components/combat/battleLogFormattingHelpers";

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
    return `${result.defenderName} fully blocks ${result.attackerName}'s attack`;
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
          return `${result.attackerName} resolves active effects: -${result.finalDamage} HP, +${result.healedHp} HP`;
        }
        if (result.healedHp > 0) {
          return `${result.attackerName} resolves active effects: +${result.healedHp} HP`;
        }
        if (result.finalDamage > 0) {
          return `${result.attackerName} resolves active effects: -${result.finalDamage} HP`;
        }
        return `${result.attackerName} resolves active effects`;
      }
      return `${result.attackerName} uses ${result.consumableName ?? "a consumable"}`;
    case "block":
      return `${result.defenderName} blocks ${result.attackerName}'s attack (${result.blockedPercent ?? 0}% blocked)`;
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
      return `${getBattleLogZoneLabel(result.attackZone)} ${formatSkillPrefix(result)}${result.attackerName} ${phrase} (-${result.finalDamage} HP)`;
    }
  }
}

function formatSkillPrefix(result: RoundResult) {
  return result.skillName ? `[${result.skillName}] ` : "";
}

export function getBattleLogVisibleTags(entry: BattleLogEntry, limit = 4) {
  return BATTLE_LOG_VISIBLE_TAG_ORDER.flatMap((groupKey) => entry.tagGroups[groupKey]).slice(0, limit);
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
