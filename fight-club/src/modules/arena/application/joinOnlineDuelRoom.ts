import { createId } from "@/core/ids/createId";
import type {
  JoinOnlineDuelRoomInput,
  OnlineDuelParticipantLoadout,
  OnlineDuelResult,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";
import { startCombat } from "@/modules/combat";
import { createEquipment } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";

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

  const participantLoadout = cloneParticipantLoadout(input.loadout ?? createFallbackParticipantLoadout());
  const combatState = startCombat(duel.participants.playerA.snapshot, input.snapshot);

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
          baselineSnapshot: input.snapshot,
          snapshot: input.snapshot,
          ...(input.fighterView ? { baselineFighterView: input.fighterView } : {}),
          ...(input.fighterView ? { fighterView: input.fighterView } : {}),
          baselineLoadout: participantLoadout,
          loadout: cloneParticipantLoadout(participantLoadout),
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

function createFallbackParticipantLoadout() {
  return {
    equipmentState: createEquipment(),
    inventory: createStarterInventory(),
    equippedSkillIds: [],
  };
}

function cloneParticipantLoadout(loadout: OnlineDuelParticipantLoadout): OnlineDuelParticipantLoadout {
  return {
    equipmentState: loadout.equipmentState,
    inventory: {
      ...loadout.inventory,
      entries: loadout.inventory.entries.map((entry) => ({ ...entry })),
    },
    equippedSkillIds: [...loadout.equippedSkillIds],
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
