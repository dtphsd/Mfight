import { createId } from "@/core/ids/createId";
import type { CreateOnlineDuelRoomInput } from "@/modules/arena/contracts/arenaPublicApi";
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

export function createOnlineDuelRoom(input: CreateOnlineDuelRoomInput): OnlineDuel {
  const createdAt = input.createdAt ?? Date.now();
  const id = createId("duel");
  const normalizedHostSnapshot = normalizeOnlineDuelSnapshot(input.snapshot, id, "playerA");
  const participantLoadout = normalizeOnlineDuelLoadout(input.loadout);
  const baselineLoadout = cloneOnlineDuelParticipantLoadout(participantLoadout);
  const runtimeLoadout = cloneOnlineDuelParticipantLoadout(participantLoadout);
  const baselineFighterView = cloneOnlineDuelFighterView(input.fighterView);
  const fighterView = cloneOnlineDuelFighterView(input.fighterView);

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
        baselineSnapshot: normalizedHostSnapshot,
        snapshot: cloneCombatSnapshot(normalizedHostSnapshot),
        ...(baselineFighterView ? { baselineFighterView } : {}),
        ...(fighterView ? { fighterView } : {}),
        baselineLoadout,
        loadout: runtimeLoadout,
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

function buildRoomCode(duelId: string): string {
  const compact = duelId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = compact.slice(-6);
  return suffix.length >= 6 ? suffix : compact.padEnd(6, "X").slice(-6);
}
