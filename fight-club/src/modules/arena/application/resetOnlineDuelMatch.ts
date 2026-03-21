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

  const combatState = startCombat(duel.participants.playerA.baselineSnapshot, playerB.baselineSnapshot);
  const updatedAt = input.updatedAt ?? Date.now();
  const resetPlayerA = resetParticipantForRematch(duel.participants.playerA);
  const resetPlayerB = resetParticipantForRematch(playerB);

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
        playerA: resetPlayerA,
        playerB: resetPlayerB,
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

function resetParticipantForRematch<TParticipant extends OnlineDuel["participants"]["playerA"] | NonNullable<OnlineDuel["participants"]["playerB"]>>(
  participant: TParticipant
): TParticipant {
  return {
    ...participant,
    snapshot: participant.baselineSnapshot,
    fighterView: participant.baselineFighterView,
    loadout: {
      equipmentState: participant.baselineLoadout.equipmentState,
      inventory: {
        ...participant.baselineLoadout.inventory,
        entries: participant.baselineLoadout.inventory.entries.map((entry) => ({ ...entry })),
      },
      equippedSkillIds: [...participant.baselineLoadout.equippedSkillIds],
    },
    readyAt: null,
  };
}
