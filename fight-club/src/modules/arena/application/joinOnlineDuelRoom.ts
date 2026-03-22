import { createId } from "@/core/ids/createId";
import type {
  JoinOnlineDuelRoomInput,
  OnlineDuelResult,
} from "@/modules/arena/contracts/arenaPublicApi";
import {
  cloneOnlineDuelFighterView,
  cloneOnlineDuelParticipantLoadout,
  normalizeOnlineDuelLoadout,
} from "@/modules/arena/application/normalizeOnlineDuelLoadout";
import {
  cloneCombatSnapshot,
  normalizeOnlineDuelSnapshot,
} from "@/modules/arena/application/normalizeOnlineDuelSnapshot";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";
import { startCombat } from "@/modules/combat";

export function joinOnlineDuelRoom(
  duel: OnlineDuel,
  input: JoinOnlineDuelRoomInput
): OnlineDuelResult<OnlineDuel> {
  const joinedAt = input.joinedAt ?? Date.now();
  const matchingSeat = resolveMatchingSeat(duel, input.playerId);

  if (matchingSeat) {
    const participant = matchingSeat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
    if (!participant) {
      return {
        success: false,
        reason: "participant_not_found",
      };
    }

    if (participant.connected && participant.sessionId === input.sessionId) {
      return {
        success: false,
        reason: "player_already_joined",
      };
    }

    const participants = {
      playerA:
        matchingSeat === "playerA"
          ? {
              ...duel.participants.playerA,
              sessionId: input.sessionId,
              resumeToken: createId("resume"),
              displayName: input.displayName,
              connected: true,
              joinedAt,
            }
          : duel.participants.playerA,
      playerB:
        matchingSeat === "playerB" && duel.participants.playerB
          ? {
              ...duel.participants.playerB,
              sessionId: input.sessionId,
              resumeToken: createId("resume"),
              displayName: input.displayName,
              connected: true,
              joinedAt,
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
        status:
          duel.status === "waiting_for_players"
            ? "waiting_for_players"
            : bothReady
              ? "planning"
              : "lobby",
        updatedAt: joinedAt,
        participants,
      },
    };
  }

  if (duel.status !== "waiting_for_players" || duel.participants.playerB) {
    return {
      success: false,
      reason: "room_full",
    };
  }

  const participantLoadout = normalizeOnlineDuelLoadout(input.loadout);
  const normalizedGuestSnapshot = normalizeOnlineDuelSnapshot(input.snapshot, duel.id, "playerB");
  const baselineLoadout = cloneOnlineDuelParticipantLoadout(participantLoadout);
  const runtimeLoadout = cloneOnlineDuelParticipantLoadout(participantLoadout);
  const baselineFighterView = cloneOnlineDuelFighterView(input.fighterView);
  const fighterView = cloneOnlineDuelFighterView(input.fighterView);
  const combatState = startCombat(duel.participants.playerA.snapshot, normalizedGuestSnapshot);

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: "lobby",
      updatedAt: joinedAt,
      combatState,
      participants: {
        ...duel.participants,
        playerA: duel.participants.playerA,
        playerB: {
          seat: "playerB",
          playerId: input.playerId,
          sessionId: input.sessionId,
          resumeToken: createId("resume"),
          displayName: input.displayName,
          baselineSnapshot: normalizedGuestSnapshot,
          snapshot: cloneCombatSnapshot(normalizedGuestSnapshot),
          ...(baselineFighterView ? { baselineFighterView } : {}),
          ...(fighterView ? { fighterView } : {}),
          baselineLoadout,
          loadout: runtimeLoadout,
          connected: true,
          joinedAt,
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

function resolveMatchingSeat(duel: OnlineDuel, playerId: string) {
  if (duel.participants.playerA.playerId === playerId) {
    return "playerA";
  }

  if (duel.participants.playerB?.playerId === playerId) {
    return "playerB";
  }

  return null;
}
