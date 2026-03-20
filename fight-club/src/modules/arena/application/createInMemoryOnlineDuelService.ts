import type { Random } from "@/core/rng/Random";
import type {
  CreateOnlineDuelRoomInput,
  FindOnlineDuelMatchInput,
  JoinOnlineDuelRoomInput,
  OnlineDuelAuthorityService,
  OnlineDuelResult,
  OnlineDuelStateSync,
  SetOnlineDuelReadyInput,
  SubmitOnlineDuelActionInput,
} from "@/modules/arena/contracts/arenaPublicApi";
import { createOnlineDuelStateSync } from "@/modules/arena/application/createOnlineDuelStateSync";
import { createOnlineDuelRoom } from "@/modules/arena/application/createOnlineDuelRoom";
import {
  defaultOnlineDuelTimeoutPolicy,
  hardenOnlineDuelTimeouts,
  type OnlineDuelTimeoutPolicy,
} from "@/modules/arena/application/hardenOnlineDuelTimeouts";
import { joinOnlineDuelRoom } from "@/modules/arena/application/joinOnlineDuelRoom";
import { leaveOnlineDuelRoom } from "@/modules/arena/application/leaveOnlineDuelRoom";
import { resetOnlineDuelMatch } from "@/modules/arena/application/resetOnlineDuelMatch";
import { resolveOnlineDuelRound } from "@/modules/arena/application/resolveOnlineDuelRound";
import { setOnlineDuelConnectionState } from "@/modules/arena/application/setOnlineDuelConnectionState";
import { setOnlineDuelReadyState } from "@/modules/arena/application/setOnlineDuelReadyState";
import { submitOnlineDuelAction } from "@/modules/arena/application/submitOnlineDuelAction";
import type { OnlineDuel } from "@/modules/arena/model/OnlineDuel";

export function createInMemoryOnlineDuelService(
  random: Random,
  policy: OnlineDuelTimeoutPolicy = defaultOnlineDuelTimeoutPolicy
): OnlineDuelAuthorityService {
  const rooms = new Map<string, OnlineDuel>();
  const matchmakingQueue: string[] = [];

  return {
    createRoom(input: CreateOnlineDuelRoomInput) {
      const duel = createOnlineDuelRoom(input);
      rooms.set(duel.id, duel);
      return duel;
    },
    findMatchmakingDuel(input: FindOnlineDuelMatchInput) {
      pruneMatchmakingQueue(rooms, matchmakingQueue);

      const openQueuedDuel = matchmakingQueue
        .map((duelId) => rooms.get(duelId) ?? null)
        .find(
          (duel) =>
            duel !== null &&
            duel.status === "waiting_for_players" &&
            duel.participants.playerB === null &&
            duel.participants.playerA.playerId !== input.playerId
        );

      if (!openQueuedDuel) {
        const duel = createOnlineDuelRoom(input);
        rooms.set(duel.id, duel);
        matchmakingQueue.push(duel.id);
        return {
          success: true,
          data: {
            duel,
            yourSeat: "playerA",
            queued: true,
          },
        };
      }

      const joined = joinOnlineDuelRoom(openQueuedDuel, {
        playerId: input.playerId,
        sessionId: input.sessionId,
        displayName: input.displayName,
        snapshot: input.snapshot,
        fighterView: input.fighterView,
        joinedAt: input.createdAt,
      });

      if (!joined.success) {
        removeQueuedDuel(matchmakingQueue, openQueuedDuel.id);
        return joined;
      }

      rooms.set(openQueuedDuel.id, joined.data);
      removeQueuedDuel(matchmakingQueue, openQueuedDuel.id);
      return {
        success: true,
        data: {
          duel: joined.data,
          yourSeat: "playerB",
          queued: false,
        },
      };
    },
    getRoom(duelId: string) {
      return getStoredRoom(rooms, duelId);
    },
    getRoomByCode(roomCode: string) {
      const normalizedCode = roomCode.trim().toUpperCase();
      const duel = [...rooms.values()].find((candidate) => candidate.roomCode === normalizedCode);
      if (!duel) {
        return {
          success: false,
          reason: "duel_not_found",
        };
      }

      return {
        success: true,
        data: duel,
      };
    },
    joinRoom(duelId: string, input: JoinOnlineDuelRoomInput) {
      const updated = mutateStoredRoom(rooms, duelId, (duel) => joinOnlineDuelRoom(duel, input));
      if (updated.success) {
        pruneMatchmakingQueue(rooms, matchmakingQueue);
      }

      return updated;
    },
    setConnectionState(duelId: string, input) {
      return mutateStoredRoom(rooms, duelId, (duel) => setOnlineDuelConnectionState(duel, input));
    },
    setReadyState(duelId: string, input: SetOnlineDuelReadyInput) {
      return mutateStoredRoom(rooms, duelId, (duel) => setOnlineDuelReadyState(duel, input));
    },
    submitAction(duelId: string, input: SubmitOnlineDuelActionInput) {
      return mutateStoredRoom(rooms, duelId, (duel) => submitOnlineDuelAction(duel, input));
    },
    resolveRound(duelId: string) {
      return mutateStoredRoom(rooms, duelId, (duel) => resolveOnlineDuelRound(duel, random));
    },
    resetMatch(duelId: string, input) {
      return mutateStoredRoom(rooms, duelId, (duel) => resetOnlineDuelMatch(duel, input));
    },
    leaveRoom(duelId: string, input) {
      const updated = mutateStoredRoom(rooms, duelId, (duel) => leaveOnlineDuelRoom(duel, input));
      if (updated.success) {
        pruneMatchmakingQueue(rooms, matchmakingQueue);
      }

      return updated;
    },
    buildStateSync(duelId: string, playerId?: string, resumeToken?: string) {
      const room = getStoredRoom(rooms, duelId);
      if (!room.success) {
        return room as OnlineDuelResult<OnlineDuelStateSync>;
      }

      return createOnlineDuelStateSync(room.data, playerId, resumeToken);
    },
    expireStaleRooms(now = Date.now()) {
      let expiredCount = 0;
      rooms.forEach((duel, duelId) => {
        const hardened = hardenOnlineDuelTimeouts(duel, now, policy);
        if (hardened !== duel) {
          rooms.set(duelId, hardened);
          expiredCount += 1;
        }
      });
      pruneMatchmakingQueue(rooms, matchmakingQueue);
      return expiredCount;
    },
  };
}

function pruneMatchmakingQueue(rooms: Map<string, OnlineDuel>, queue: string[]) {
  for (let index = queue.length - 1; index >= 0; index -= 1) {
    const duel = rooms.get(queue[index] ?? "");
    if (
      !duel ||
      duel.status !== "waiting_for_players" ||
      duel.participants.playerB !== null ||
      !duel.participants.playerA.connected
    ) {
      queue.splice(index, 1);
    }
  }
}

function removeQueuedDuel(queue: string[], duelId: string) {
  const index = queue.indexOf(duelId);
  if (index >= 0) {
    queue.splice(index, 1);
  }
}

function getStoredRoom(
  rooms: Map<string, OnlineDuel>,
  duelId: string
): OnlineDuelResult<OnlineDuel> {
  const duel = rooms.get(duelId);
  if (!duel) {
    return {
      success: false,
      reason: "duel_not_found",
    };
  }

  return {
    success: true,
    data: duel,
  };
}

function mutateStoredRoom(
  rooms: Map<string, OnlineDuel>,
  duelId: string,
  updater: (duel: OnlineDuel) => OnlineDuelResult<OnlineDuel>
): OnlineDuelResult<OnlineDuel> {
  const current = getStoredRoom(rooms, duelId);
  if (!current.success) {
    return current;
  }

  const updated = updater(current.data);
  if (updated.success) {
    rooms.set(duelId, updated.data);
  }

  return updated;
}
