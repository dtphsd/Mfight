import type { OnlineDuelResult, OnlineDuelStateSync } from "@/modules/arena/contracts/arenaPublicApi";
import { createOnlineDuelRoundSummary } from "@/modules/arena/application/createOnlineDuelRoundSummary";
import type { OnlineDuel, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";

export function createOnlineDuelStateSync(
  duel: OnlineDuel,
  playerId?: string,
  resumeToken?: string
): OnlineDuelResult<OnlineDuelStateSync> {
  const participant = resolveParticipant(duel, playerId);
  if (playerId && !participant) {
    return {
      success: false,
      reason: "participant_not_found",
    };
  }

  if (participant && resumeToken && participant.resumeToken !== resumeToken) {
    return {
      success: false,
      reason: "stale_session",
    };
  }

  const lastResolvedRound = createOnlineDuelRoundSummary(duel);
  const yourSeat = resolveSeat(duel, playerId);
  const opponentSeat = resolveOpponentSeat(duel, yourSeat);
  const opponentParticipant = resolveParticipantBySeat(duel, opponentSeat);

  return {
    success: true,
    data: {
      duelId: duel.id,
      roomCode: duel.roomCode,
      revision: duel.revision,
      status: duel.status,
      round: duel.currentRound?.round ?? duel.combatState?.round ?? null,
      winnerSeat: duel.winnerSeat,
      yourSeat,
      ...(participant ? { resumeToken: participant.resumeToken } : {}),
      ...(participant ? { yourLoadout: participant.loadout } : {}),
      ...(participant ? { yourSnapshot: participant.snapshot } : {}),
      ...(opponentParticipant ? { opponentSnapshot: opponentParticipant.snapshot } : {}),
      participants: [
        {
          seat: duel.participants.playerA.seat,
          displayName: duel.participants.playerA.displayName,
          connected: duel.participants.playerA.connected,
          ready: Boolean(duel.participants.playerA.readyAt),
          ...(duel.participants.playerA.fighterView ? { fighterView: duel.participants.playerA.fighterView } : {}),
        },
        ...(duel.participants.playerB
          ? [
              {
                seat: duel.participants.playerB.seat,
                displayName: duel.participants.playerB.displayName,
                connected: duel.participants.playerB.connected,
                ready: Boolean(duel.participants.playerB.readyAt),
                ...(duel.participants.playerB.fighterView ? { fighterView: duel.participants.playerB.fighterView } : {}),
              },
            ]
          : []),
      ],
      ...(duel.currentRound && (duel.status === "planning" || duel.status === "ready_to_resolve")
        ? {
            currentRoundState: {
              round: duel.currentRound.round,
              submittedSeats: resolveSubmittedSeats(duel),
              yourActionSubmitted: hasSubmittedAction(duel, resolveSeat(duel, playerId)),
              opponentActionSubmitted: hasSubmittedAction(
                duel,
                resolveOpponentSeat(duel, resolveSeat(duel, playerId))
              ),
              readyToResolve: duel.status === "ready_to_resolve",
            },
          }
        : {}),
      ...(lastResolvedRound ? { lastResolvedRound } : {}),
      ...(duel.combatState ? { combatState: duel.combatState } : {}),
    },
  };
}

function resolveSubmittedSeats(duel: OnlineDuel): OnlineDuelSeat[] {
  return (["playerA", "playerB"] as const).filter((seat) => Boolean(duel.currentRound?.submissions[seat]));
}

function hasSubmittedAction(duel: OnlineDuel, seat: OnlineDuelSeat | null): boolean {
  return seat ? Boolean(duel.currentRound?.submissions[seat]) : false;
}

function resolveParticipant(duel: OnlineDuel, playerId?: string) {
  if (!playerId) {
    return null;
  }

  if (duel.participants.playerA.playerId === playerId) {
    return duel.participants.playerA;
  }

  if (duel.participants.playerB?.playerId === playerId) {
    return duel.participants.playerB;
  }

  return null;
}

function resolveSeat(duel: OnlineDuel, playerId?: string): OnlineDuelSeat | null {
  if (!playerId) {
    return null;
  }

  if (duel.participants.playerA.playerId === playerId) {
    return "playerA";
  }

  if (duel.participants.playerB?.playerId === playerId) {
    return "playerB";
  }

  return null;
}

function resolveOpponentSeat(
  duel: OnlineDuel,
  playerSeat: OnlineDuelSeat | null
): OnlineDuelSeat | null {
  if (!playerSeat) {
    return null;
  }

  const opponentSeat = playerSeat === "playerA" ? "playerB" : "playerA";
  if (opponentSeat === "playerB" && !duel.participants.playerB) {
    return null;
  }

  return opponentSeat;
}

function resolveParticipantBySeat(duel: OnlineDuel, seat: OnlineDuelSeat | null) {
  if (!seat) {
    return null;
  }

  return seat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
}
