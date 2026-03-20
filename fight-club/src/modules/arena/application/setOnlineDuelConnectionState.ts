import type {
  OnlineDuelResult,
  SetOnlineDuelConnectionInput,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel, OnlineDuelParticipant, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";

export function setOnlineDuelConnectionState(
  duel: OnlineDuel,
  input: SetOnlineDuelConnectionInput
): OnlineDuelResult<OnlineDuel> {
  if (duel.status === "finished" || duel.status === "abandoned") {
    return {
      success: false,
      reason: "invalid_status",
    };
  }

  const participant = resolveParticipant(duel, input.seat);
  if (!participant) {
    return {
      success: false,
      reason: "participant_not_found",
    };
  }

  if (participant.playerId !== input.playerId) {
    return {
      success: false,
      reason: "seat_mismatch",
    };
  }

  if (participant.sessionId !== input.sessionId) {
    return {
      success: false,
      reason: "displaced_session",
    };
  }

  const updatedAt = input.updatedAt ?? Date.now();
  const nextReadyAt = input.connected ? participant.readyAt : null;
  const participants = {
    playerA:
      input.seat === "playerA"
        ? {
            ...duel.participants.playerA,
            connected: input.connected,
            readyAt: nextReadyAt,
          }
        : duel.participants.playerA,
    playerB:
      input.seat === "playerB" && duel.participants.playerB
        ? {
            ...duel.participants.playerB,
            connected: input.connected,
            readyAt: nextReadyAt,
          }
        : duel.participants.playerB,
  };
  const bothConnected = Boolean(participants.playerA.connected && participants.playerB?.connected);
  const bothReady = Boolean(participants.playerA.readyAt && participants.playerB?.readyAt);
  const shouldPause = duel.status !== "waiting_for_players" && !bothConnected;
  const shouldResetRound = shouldPause && duel.status !== "ready_to_resolve";

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: shouldPause
        ? "lobby"
        : duel.status === "waiting_for_players"
          ? "waiting_for_players"
          : bothReady
            ? "planning"
            : "lobby",
      updatedAt,
      participants,
      currentRound:
        shouldResetRound && duel.currentRound
          ? {
              ...duel.currentRound,
              submissions: {},
              submittedAt: null,
            }
          : duel.currentRound,
    },
  };
}

function resolveParticipant(duel: OnlineDuel, seat: OnlineDuelSeat): OnlineDuelParticipant | null {
  return seat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
}
