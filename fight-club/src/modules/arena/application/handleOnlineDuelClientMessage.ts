import type {
  OnlineDuelAuthorityService,
  OnlineDuelClientMessage,
  OnlineDuelServerMessage,
} from "@/modules/arena/contracts/arenaPublicApi";
import { createOnlineDuelRoundSummary } from "@/modules/arena/application/createOnlineDuelRoundSummary";

export function handleOnlineDuelClientMessage(
  service: OnlineDuelAuthorityService,
  message: OnlineDuelClientMessage
): OnlineDuelServerMessage[] {
  switch (message.type) {
    case "create_duel": {
      const duel = service.createRoom({
        playerId: message.playerId,
        sessionId: message.sessionId,
        displayName: message.displayName,
        snapshot: message.snapshot,
        fighterView: message.fighterView,
      });
      const sync = service.buildStateSync(duel.id, message.playerId);

      return [
        {
          type: "duel_created",
          duelId: duel.id,
          roomCode: duel.roomCode,
          yourSeat: "playerA",
        },
        ...(sync.success
          ? [{ type: "duel_state_sync", payload: sync.data } satisfies OnlineDuelServerMessage]
          : [{ type: "duel_error", duelId: duel.id, reason: sync.reason } satisfies OnlineDuelServerMessage]),
      ];
    }

    case "find_matchmaking_duel": {
      const matched = service.findMatchmakingDuel({
        playerId: message.playerId,
        sessionId: message.sessionId,
        displayName: message.displayName,
        snapshot: message.snapshot,
        fighterView: message.fighterView,
      });

      if (!matched.success) {
        return [
          {
            type: "duel_error",
            duelId: message.playerId,
            reason: matched.reason,
          },
        ];
      }

      const sync = service.buildStateSync(matched.data.duel.id, message.playerId);
      const responses: OnlineDuelServerMessage[] = [];

      if (matched.data.queued) {
        responses.push({
          type: "duel_created",
          duelId: matched.data.duel.id,
          roomCode: matched.data.duel.roomCode,
          yourSeat: matched.data.yourSeat,
        });
      }

      responses.push(
        ...(sync.success
          ? [{ type: "duel_state_sync", payload: sync.data } satisfies OnlineDuelServerMessage]
          : [
              {
                type: "duel_error",
                duelId: matched.data.duel.id,
                reason: sync.reason,
              } satisfies OnlineDuelServerMessage,
            ])
      );

      return responses;
    }

    case "join_duel": {
      const joined = service.joinRoom(message.duelId, {
        playerId: message.playerId,
        sessionId: message.sessionId,
        displayName: message.displayName,
        snapshot: message.snapshot,
        fighterView: message.fighterView,
        expectedRevision: message.expectedRevision,
      });

      if (!joined.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: joined.reason,
          },
        ];
      }

      const sync = service.buildStateSync(message.duelId, message.playerId);
      return sync.success
        ? [{ type: "duel_state_sync", payload: sync.data }]
        : [{ type: "duel_error", duelId: message.duelId, reason: sync.reason }];
    }

    case "join_duel_by_code": {
      const room = service.getRoomByCode(message.roomCode);
      if (!room.success) {
        return [
          {
            type: "duel_error",
            duelId: message.roomCode,
            reason: room.reason,
          },
        ];
      }

      const joined = service.joinRoom(room.data.id, {
        playerId: message.playerId,
        sessionId: message.sessionId,
        displayName: message.displayName,
        snapshot: message.snapshot,
        fighterView: message.fighterView,
        expectedRevision: message.expectedRevision,
      });

      if (!joined.success) {
        return [
          {
            type: "duel_error",
            duelId: room.data.id,
            reason: joined.reason,
          },
        ];
      }

      const sync = service.buildStateSync(room.data.id, message.playerId);
      return sync.success
        ? [{ type: "duel_state_sync", payload: sync.data }]
        : [{ type: "duel_error", duelId: room.data.id, reason: sync.reason }];
    }

    case "set_connection": {
      const updated = service.setConnectionState(message.duelId, {
        seat: message.seat,
        playerId: message.playerId,
        sessionId: message.sessionId,
        connected: message.connected,
        expectedRevision: message.expectedRevision,
      });

      if (!updated.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: updated.reason,
          },
        ];
      }

      const responses: OnlineDuelServerMessage[] = [
        {
          type: "connection_updated",
          duelId: message.duelId,
          seat: message.seat,
          connected: message.connected,
        },
      ];
      const sync = service.buildStateSync(message.duelId, message.playerId);
      if (sync.success) {
        responses.push({ type: "duel_state_sync", payload: sync.data });
      } else {
        responses.push({ type: "duel_error", duelId: message.duelId, reason: sync.reason });
      }

      return responses;
    }

    case "set_ready": {
      const updated = service.setReadyState(message.duelId, {
        seat: message.seat,
        playerId: message.playerId,
        sessionId: message.sessionId,
        ready: message.ready,
        expectedRevision: message.expectedRevision,
      });

      if (!updated.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: updated.reason,
          },
        ];
      }

      const responses: OnlineDuelServerMessage[] = [
        {
          type: "readiness_updated",
          duelId: message.duelId,
          seat: message.seat,
          ready: message.ready,
        },
      ];
      if (updated.data.status === "planning") {
        responses.push({
          type: "duel_ready",
          duelId: message.duelId,
        });
      }

      const sync = service.buildStateSync(message.duelId, message.playerId);
      if (sync.success) {
        responses.push({ type: "duel_state_sync", payload: sync.data });
      } else {
        responses.push({ type: "duel_error", duelId: message.duelId, reason: sync.reason });
      }

      return responses;
    }

    case "request_duel_sync": {
      const sync = service.buildStateSync(message.duelId, message.playerId, message.resumeToken);
      return sync.success
        ? [{ type: "duel_state_sync", payload: sync.data }]
        : [{ type: "duel_error", duelId: message.duelId, reason: sync.reason }];
    }

    case "leave_duel": {
      const left = service.leaveRoom(message.duelId, {
        playerId: message.playerId,
        sessionId: message.sessionId,
        expectedRevision: message.expectedRevision,
      });
      if (!left.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: left.reason,
          },
        ];
      }

      const sync = service.buildStateSync(message.duelId, message.playerId);
      return sync.success
        ? [{ type: "duel_state_sync", payload: sync.data }]
        : [{ type: "duel_error", duelId: message.duelId, reason: sync.reason }];
    }

    case "rematch_duel": {
      const reset = service.resetMatch(message.duelId, {
        playerId: message.playerId,
        sessionId: message.sessionId,
        expectedRevision: message.expectedRevision,
      });
      if (!reset.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: reset.reason,
          },
        ];
      }

      const sync = service.buildStateSync(message.duelId, message.playerId);
      return sync.success
        ? [{ type: "duel_state_sync", payload: sync.data }]
        : [{ type: "duel_error", duelId: message.duelId, reason: sync.reason }];
    }

    case "submit_round_action": {
      const submitted = service.submitAction(message.duelId, {
        seat: message.seat,
        playerId: message.playerId,
        sessionId: message.sessionId,
        action: message.action,
        expectedRound: message.expectedRound,
        expectedRevision: message.expectedRevision,
      });

      if (!submitted.success) {
        return [
          {
            type: "duel_error",
            duelId: message.duelId,
            reason: submitted.reason,
          },
        ];
      }

      const responses: OnlineDuelServerMessage[] = [];
      const syncAfterSubmit = service.buildStateSync(message.duelId, message.playerId);
      if (syncAfterSubmit.success) {
        responses.push({ type: "duel_state_sync", payload: syncAfterSubmit.data });
      }

      if (submitted.data.status === "ready_to_resolve" && submitted.data.currentRound) {
        responses.push({
          type: "round_ready",
          duelId: message.duelId,
          round: submitted.data.currentRound.round,
        });

        const resolved = service.resolveRound(message.duelId);
        if (!resolved.success) {
          responses.push({
            type: "duel_error",
            duelId: message.duelId,
            reason: resolved.reason,
          });
          return responses;
        }

        responses.push({
          type: "round_resolved",
          duelId: message.duelId,
          round: resolved.data.combatState?.round ?? resolved.data.currentRound?.round ?? 0,
          winnerSeat: resolved.data.winnerSeat,
          summary: createOnlineDuelRoundSummary(resolved.data) ?? undefined,
        });

        const syncAfterResolve = service.buildStateSync(message.duelId, message.playerId);
        if (syncAfterResolve.success) {
          responses.push({ type: "duel_state_sync", payload: syncAfterResolve.data });
        } else {
          responses.push({
            type: "duel_error",
            duelId: message.duelId,
            reason: syncAfterResolve.reason,
          });
        }
      }

      return responses;
    }
  }
}
