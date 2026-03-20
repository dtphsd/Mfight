import { assertOnlineDuelRevision } from "@/modules/arena/application/assertOnlineDuelRevision";
import type {
  OnlineDuelResult,
  ResetOnlineDuelMatchInput,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";
import { startCombat } from "@/modules/combat";

export function resetOnlineDuelMatch(
  duel: OnlineDuel,
  input: ResetOnlineDuelMatchInput
): OnlineDuelResult<OnlineDuel> {
  const revisionCheck = assertOnlineDuelRevision(duel, input.expectedRevision);
  if (!revisionCheck.success) {
    return revisionCheck;
  }

  if (duel.status !== "finished" && duel.status !== "abandoned") {
    return {
      success: false,
      reason: "invalid_status",
    };
  }

  const playerB = duel.participants.playerB;
  if (!playerB) {
    return {
      success: false,
      reason: "rematch_not_ready",
    };
  }

  const requestingParticipant =
    duel.participants.playerA.playerId === input.playerId
      ? duel.participants.playerA
      : playerB.playerId === input.playerId
        ? playerB
        : null;

  if (!requestingParticipant) {
    return {
      success: false,
      reason: "participant_not_found",
    };
  }

  if (requestingParticipant.sessionId !== input.sessionId) {
    return {
      success: false,
      reason: "displaced_session",
    };
  }

  if (!duel.participants.playerA.connected || !playerB.connected) {
    return {
      success: false,
      reason: "participant_disconnected",
    };
  }

  const combatState = startCombat(duel.participants.playerA.snapshot, playerB.snapshot);
  const updatedAt = input.updatedAt ?? Date.now();

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: "lobby",
      updatedAt,
      combatState,
      winnerSeat: null,
      participants: {
        playerA: {
          ...duel.participants.playerA,
          readyAt: null,
        },
        playerB: {
          ...playerB,
          readyAt: null,
        },
      },
      currentRound: {
        round: combatState.round,
        submissions: {},
        submittedAt: null,
        resolvedAt: null,
      },
    },
  };
}
