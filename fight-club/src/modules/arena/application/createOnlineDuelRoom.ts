import { createId } from "@/core/ids/createId";
import type { CreateOnlineDuelRoomInput } from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export function createOnlineDuelRoom(input: CreateOnlineDuelRoomInput): OnlineDuel {
  const createdAt = input.createdAt ?? Date.now();
  const id = createId("duel");

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
        snapshot: input.snapshot,
        ...(input.fighterView ? { fighterView: input.fighterView } : {}),
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
