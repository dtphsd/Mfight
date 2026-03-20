import { assertOnlineDuelRevision } from "@/modules/arena/application/assertOnlineDuelRevision";
import type {
  LeaveOnlineDuelRoomInput,
  OnlineDuelResult,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export function leaveOnlineDuelRoom(
  duel: OnlineDuel,
  input: LeaveOnlineDuelRoomInput
): OnlineDuelResult<OnlineDuel> {
  const revisionCheck = assertOnlineDuelRevision(duel, input.expectedRevision);
  if (!revisionCheck.success) {
    return revisionCheck;
  }

  const seat =
    duel.participants.playerA.playerId === input.playerId
      ? "playerA"
      : duel.participants.playerB?.playerId === input.playerId
        ? "playerB"
        : null;
  if (!seat) {
    return {
      success: false,
      reason: "participant_not_found",
    };
  }

  const participant = seat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
  if (!participant) {
    return {
      success: false,
      reason: "participant_not_found",
    };
  }

  if (participant.sessionId !== input.sessionId) {
    return {
      success: false,
      reason: "displaced_session",
    };
  }

  const updatedAt = input.updatedAt ?? Date.now();

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: "abandoned",
      updatedAt,
      participants: {
        playerA: {
          ...duel.participants.playerA,
          connected: seat === "playerA" ? false : duel.participants.playerA.connected,
          readyAt: null,
        },
        playerB: duel.participants.playerB
          ? {
              ...duel.participants.playerB,
              connected: seat === "playerB" ? false : duel.participants.playerB.connected,
              readyAt: null,
            }
          : null,
      },
      currentRound: duel.currentRound
        ? {
            ...duel.currentRound,
            submissions: {},
            submittedAt: null,
          }
        : null,
    },
  };
}
