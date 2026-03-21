import type {
  OnlineDuelResult,
  SubmitOnlineDuelActionInput,
} from "@/modules/arena/contracts/arenaPublicApi";
import { buildOnlineDuelRoundAction } from "@/modules/arena/application/buildOnlineDuelRoundAction";
import type { OnlineDuel, OnlineDuelParticipant, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";

export function submitOnlineDuelAction(
  duel: OnlineDuel,
  input: SubmitOnlineDuelActionInput
): OnlineDuelResult<OnlineDuel> {
  if (duel.status === "lobby") {
    return {
      success: false,
      reason: "not_ready",
    };
  }

  if (duel.status !== "planning" && duel.status !== "ready_to_resolve") {
    return {
      success: false,
      reason: "invalid_status",
    };
  }

  if (!duel.combatState || !duel.currentRound) {
    return {
      success: false,
      reason: "combat_not_started",
    };
  }

  if (input.expectedRound !== undefined && input.expectedRound !== duel.currentRound.round) {
    return {
      success: false,
      reason: "stale_sync",
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

  if (duel.currentRound.submissions[input.seat]) {
    return {
      success: false,
      reason: "already_submitted",
    };
  }

  const builtAction = buildOnlineDuelRoundAction(participant, duel.combatState, input.selection);
  if (!builtAction.success) {
    return builtAction;
  }

  const submittedAt = input.submittedAt ?? Date.now();
  const submissions = {
    ...duel.currentRound.submissions,
    [input.seat]: {
      seat: input.seat,
      playerId: input.playerId,
      action: builtAction.data,
      submittedAt,
    },
  };
  const bothSubmitted = Boolean(submissions.playerA && submissions.playerB);

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: bothSubmitted ? "ready_to_resolve" : "planning",
      updatedAt: submittedAt,
      currentRound: {
        ...duel.currentRound,
        submissions,
        submittedAt,
      },
    },
  };
}

function resolveParticipant(duel: OnlineDuel, seat: OnlineDuelSeat): OnlineDuelParticipant | null {
  return seat === "playerA" ? duel.participants.playerA : duel.participants.playerB;
}
