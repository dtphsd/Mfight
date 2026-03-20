import type { OnlineDuelRoundSummary } from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export function createOnlineDuelRoundSummary(duel: OnlineDuel): OnlineDuelRoundSummary | null {
  const combatState = duel.combatState;
  if (!combatState || combatState.log.length === 0) {
    return null;
  }

  const latestRound = combatState.log.reduce((highestRound, entry) => {
    return entry.round > highestRound ? entry.round : highestRound;
  }, 0);

  const entries = combatState.log
    .filter((entry) => entry.round === latestRound)
    .map((entry) => ({
      attackerName: entry.attackerName,
      defenderName: entry.defenderName,
      attackZone: entry.attackZone,
      finalDamage: entry.finalDamage,
      blocked: entry.blocked,
      dodged: entry.dodged,
      crit: entry.crit,
      commentary: entry.commentary,
      knockoutCommentary: entry.knockoutCommentary,
    }));

  if (entries.length === 0) {
    return null;
  }

  return {
    round: latestRound,
    winnerSeat: duel.winnerSeat,
    entries,
    combatants: combatState.combatants.map((combatant) => ({
      id: combatant.id,
      name: combatant.name,
      currentHp: combatant.currentHp,
      maxHp: combatant.maxHp,
    })),
  };
}
