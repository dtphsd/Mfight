import type { Random } from "@/core/rng/Random";
import { buildOnlineDuelRoundAction } from "@/modules/arena/application/buildOnlineDuelRoundAction";
import type { OnlineDuelResult } from "@/modules/arena/contracts/arenaPublicApi";
import type {
  OnlineDuel,
  OnlineDuelParticipant,
  OnlineDuelRoundSubmission,
  OnlineDuelSeat,
} from "@/modules/arena/model/OnlineDuel";
import { resolveRound, type RoundAction } from "@/modules/combat";
import { getRoundActionConsumable } from "@/modules/combat/model/RoundAction";
import { removeItem } from "@/modules/inventory";

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

  const builtActions = buildResolvedActions(duel);
  if (!builtActions.success) {
    return builtActions;
  }

  const { playerAAction, playerBAction } = builtActions.data;
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
  const nextParticipants = consumeResolvedRoundLoadout(duel, [playerAAction, playerBAction]);
  if (!nextParticipants.success) {
    return nextParticipants;
  }

  return {
    success: true,
    data: {
      ...duel,
      revision: duel.revision + 1,
      status: resolved.data.status === "finished" ? "finished" : "planning",
      updatedAt: resolvedAt,
      combatState: resolved.data,
      participants: nextParticipants.data,
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

function consumeResolvedRoundLoadout(
  duel: OnlineDuel,
  actions: RoundAction[]
): OnlineDuelResult<OnlineDuel["participants"]> {
  let nextParticipants = duel.participants;

  for (const action of actions) {
    const consumable = getRoundActionConsumable(action);
    if (!consumable) {
      continue;
    }

    const seat = resolveSeatByCombatantId(duel, action.attackerId);
    if (!seat) {
      return {
        success: false,
        reason: "attacker_mismatch",
      };
    }

    const participant = nextParticipants[seat];
    if (!participant) {
      return {
        success: false,
        reason: "attacker_mismatch",
      };
    }
    const consumedInventory = removeItem(participant.loadout.inventory, consumable.itemCode, 1);
    if (!consumedInventory.success) {
      return {
        success: false,
        reason: "invalid_action",
      };
    }

    nextParticipants = {
      ...nextParticipants,
      [seat]: {
        ...participant,
        loadout: {
          ...participant.loadout,
          inventory: consumedInventory.data,
        },
      },
    };
  }

  return {
    success: true,
    data: nextParticipants,
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

function buildResolvedActions(
  duel: OnlineDuel
): OnlineDuelResult<{ playerAAction: RoundAction; playerBAction: RoundAction }> {
  const playerASubmission = duel.currentRound?.submissions.playerA;
  const playerBSubmission = duel.currentRound?.submissions.playerB;
  const playerBParticipant = duel.participants.playerB;
  if (!playerASubmission || !playerBSubmission || !playerBParticipant || !duel.combatState) {
    return {
      success: false,
      reason: "round_not_ready",
    };
  }

  const playerAAction = buildSubmissionAction(duel.participants.playerA, duel.combatState, playerASubmission);
  if (!playerAAction.success) {
    return playerAAction;
  }

  const playerBAction = buildSubmissionAction(playerBParticipant, duel.combatState, playerBSubmission);
  if (!playerBAction.success) {
    return playerBAction;
  }

  return {
    success: true,
    data: {
      playerAAction: playerAAction.data,
      playerBAction: playerBAction.data,
    },
  };
}

function buildSubmissionAction(
  participant: OnlineDuelParticipant,
  combatState: NonNullable<OnlineDuel["combatState"]>,
  submission: OnlineDuelRoundSubmission
): OnlineDuelResult<RoundAction> {
  return buildOnlineDuelRoundAction(participant, combatState, submission.selection);
}

function resolveSeatByCombatantId(duel: OnlineDuel, combatantId: string): OnlineDuelSeat | null {
  if (duel.participants.playerA.snapshot.characterId === combatantId) {
    return "playerA";
  }

  if (duel.participants.playerB?.snapshot.characterId === combatantId) {
    return "playerB";
  }

  return null;
}
