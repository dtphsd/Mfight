import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export interface OnlineDuelTimeoutPolicy {
  lobbyTimeoutMs: number;
  planningTimeoutMs: number;
  reconnectGraceMs: number;
}

export const defaultOnlineDuelTimeoutPolicy: OnlineDuelTimeoutPolicy = {
  lobbyTimeoutMs: 5 * 60 * 1000,
  planningTimeoutMs: 3 * 60 * 1000,
  reconnectGraceMs: 2 * 60 * 1000,
};

export function hardenOnlineDuelTimeouts(
  duel: OnlineDuel,
  now: number,
  policy: OnlineDuelTimeoutPolicy
): OnlineDuel {
  if (duel.status === "finished" || duel.status === "abandoned") {
    return duel;
  }

  const ageMs = now - duel.updatedAt;
  const hasDisconnectedParticipant = Boolean(
    !duel.participants.playerA.connected || (duel.participants.playerB && !duel.participants.playerB.connected)
  );
  const lobbyExpired =
    (duel.status === "waiting_for_players" || duel.status === "lobby") && ageMs >= policy.lobbyTimeoutMs;
  const planningExpired =
    (duel.status === "planning" || duel.status === "ready_to_resolve") && ageMs >= policy.planningTimeoutMs;
  const reconnectExpired = hasDisconnectedParticipant && ageMs >= policy.reconnectGraceMs;

  if (!lobbyExpired && !planningExpired && !reconnectExpired) {
    return duel;
  }

  return {
    ...duel,
    status: "abandoned",
    updatedAt: now,
    participants: {
      playerA: {
        ...duel.participants.playerA,
        readyAt: null,
      },
      playerB: duel.participants.playerB
        ? {
            ...duel.participants.playerB,
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
  };
}
