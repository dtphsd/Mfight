import type {
  OnlineDuelResult,
  SetOnlineDuelReadyInput,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel, OnlineDuelParticipant, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";

export function setOnlineDuelReadyState(
  duel: OnlineDuel,
  input: SetOnlineDuelReadyInput
): OnlineDuelResult<OnlineDuel> {
  if (
    duel.status !== "waiting_for_players" &&
    duel.status !== "lobby" &&
    duel.status !== "planning"
  ) {
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

  if (!participant.connected) {
    return {
      success: false,
      reason: "participant_disconnected",
    };
  }

  const updatedAt = input.updatedAt ?? Date.now();
  const readyAt = input.ready ? updatedAt : null;
  const participants = {
    playerA:
      input.seat === "playerA"
        ? {
            ...duel.participants.playerA,
            readyAt,
          }
        : duel.participants.playerA,
    playerB:
      input.seat === "playerB" && duel.participants.playerB
        ? {
            ...duel.participants.playerB,
            readyAt,
          }
        : duel.participants.playerB,
  };
  const bothReady = Boolean(
    participants.playerA.connected &&
      participants.playerB?.connected &&
      participants.playerA.readyAt &&
      participants.playerB?.readyAt
  );

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: !participants.playerB?.connected ? "waiting_for_players" : bothReady ? "planning" : "lobby",
      updatedAt,
      participants,
    },
  };
}

function resolveParticipant(duel: OnlineDuel, seat: OnlineDuelSeat): OnlineDuelParticipant | null {
  return seat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
}
