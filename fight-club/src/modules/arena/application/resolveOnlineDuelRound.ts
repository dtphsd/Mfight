import type { Random } from "@/core/rng/Random";
import type { OnlineDuelResult } from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import { resolveRound, type RoundAction } from "@/modules/combat";

export function resolveOnlineDuelRound(
  duel: OnlineDuel,
  random: Random
): OnlineDuelResult<OnlineDuel> {
  if (duel.status !== "ready_to_resolve" || !duel.currentRound) {
    return {
      success: false,
      reason: "round_not_ready",
    };
  }

  if (!duel.combatState) {
    return {
      success: false,
      reason: "combat_not_started",
    };
  }

  const playerAAction = duel.currentRound.submissions.playerA?.action;
  const playerBAction = duel.currentRound.submissions.playerB?.action;

  if (!playerAAction || !playerBAction) {
    return {
      success: false,
      reason: "round_not_ready",
    };
  }

  const actionsByCombatant = new Map([
    [playerAAction.attackerId, playerAAction],
    [playerBAction.attackerId, playerBAction],
  ]);
  const orderedActions = duel.combatState.combatants.map((combatant) => actionsByCombatant.get(combatant.id));

  if (orderedActions.some((action) => !action)) {
    return {
      success: false,
      reason: "attacker_mismatch",
    };
  }

  const resolved = resolveRound(duel.combatState, orderedActions as [RoundAction, RoundAction], random);

  if (!resolved.success) {
    return {
      success: false,
      reason: resolved.reason,
    };
  }

  const resolvedAt = Date.now();
  const winnerSeat = resolveWinnerSeat(duel, resolved.data.winnerId);

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: resolved.data.status === "finished" ? "finished" : "planning",
      updatedAt: resolvedAt,
      combatState: resolved.data,
      winnerSeat,
      currentRound:
        resolved.data.status === "finished"
          ? {
              ...duel.currentRound,
              resolvedAt,
            }
          : {
              round: resolved.data.round,
              submissions: {},
              submittedAt: null,
              resolvedAt,
            },
    },
  };
}

function resolveWinnerSeat(duel: OnlineDuel, winnerId: string | null): OnlineDuelSeat | null {
  if (!winnerId) {
    return null;
  }

  if (duel.participants.playerA.snapshot.characterId === winnerId) {
    return "playerA";
  }

  if (duel.participants.playerB?.snapshot.characterId === winnerId) {
    return "playerB";
  }

  return null;
}
