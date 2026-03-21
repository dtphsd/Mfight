import { createId } from "@/core/ids/createId";
import type { CreateOnlineDuelRoomInput, OnlineDuelParticipantLoadout } from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";
import { createEquipment } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";

export function createOnlineDuelRoom(input: CreateOnlineDuelRoomInput): OnlineDuel {
  const createdAt = input.createdAt ?? Date.now();
  const id = createId("duel");
  const participantLoadout = cloneParticipantLoadout(input.loadout ?? createFallbackParticipantLoadout());

  return {
    id,
    roomCode: buildRoomCode(id),
    revision: 1,
    status: "waiting_for_players",
    createdAt,
    updatedAt: createdAt,
    combatState: null,
    participants: {
      playerA: {
        seat: "playerA",
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
        joinedAt: createdAt,
        readyAt: null,
      },
      playerB: null,
    },
    currentRound: null,
    winnerSeat: null,
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

function buildRoomCode(duelId: string): string {
  const compact = duelId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = compact.slice(-6);
  return suffix.length >= 6 ? suffix : compact.padEnd(6, "X").slice(-6);
}
