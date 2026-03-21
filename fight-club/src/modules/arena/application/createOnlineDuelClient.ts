import type {
  OnlineDuelFighterView,
  OnlineDuelClient,
  OnlineDuelClientIdentity,
  OnlineDuelActionSelection,
  OnlineDuelParticipantLoadout,
  OnlineDuelServerMessage,
  OnlineDuelStateSync,
  OnlineDuelTransport,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import type { CombatSnapshot } from "@/modules/combat";
import { createEquipment } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";

export function createOnlineDuelClient(
  transport: OnlineDuelTransport,
  identity: OnlineDuelClientIdentity
): OnlineDuelClient {
  let lastSync: OnlineDuelStateSync | null = null;

  return {
    identity,
    createDuel(snapshot, fighterView, displayNameOverride, loadout) {
      return dispatch({
        type: "create_duel",
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        displayName: displayNameOverride ?? identity.displayName,
        snapshot,
        fighterView,
        loadout: resolveClientLoadout(loadout),
      });
    },
    findMatchmakingDuel(snapshot, fighterView, displayNameOverride, loadout) {
      return dispatch({
        type: "find_matchmaking_duel",
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        displayName: displayNameOverride ?? identity.displayName,
        snapshot,
        fighterView,
        loadout: resolveClientLoadout(loadout),
      });
    },
    joinDuel(duelId, snapshot, fighterView, displayNameOverride, loadout) {
      return dispatch({
        type: "join_duel",
        duelId,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        displayName: displayNameOverride ?? identity.displayName,
        snapshot,
        fighterView,
        loadout: resolveClientLoadout(loadout),
        expectedRevision: lastSync?.revision,
      });
    },
    joinDuelByCode(roomCode, snapshot, fighterView, displayNameOverride, loadout) {
      return dispatch({
        type: "join_duel_by_code",
        roomCode,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        displayName: displayNameOverride ?? identity.displayName,
        snapshot,
        fighterView,
        loadout: resolveClientLoadout(loadout),
        expectedRevision: lastSync?.revision,
      });
    },
    setConnection(duelId, seat, connected) {
      return dispatch({
        type: "set_connection",
        duelId,
        seat,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        connected,
        expectedRevision: lastSync?.revision,
      });
    },
    setReady(duelId, seat, ready) {
      return dispatch({
        type: "set_ready",
        duelId,
        seat,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        ready,
        expectedRevision: lastSync?.revision,
      });
    },
    requestSync(duelId) {
      return dispatch({
        type: "request_duel_sync",
        duelId,
        playerId: identity.playerId,
        resumeToken: lastSync?.resumeToken,
      });
    },
    requestRematch(duelId) {
      return dispatch({
        type: "rematch_duel",
        duelId,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        expectedRevision: lastSync?.revision,
      });
    },
    leaveDuel(duelId) {
      return dispatch({
        type: "leave_duel",
        duelId,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        expectedRevision: lastSync?.revision,
      });
    },
    submitRoundAction(duelId, seat, selection) {
      return dispatch({
        type: "submit_round_action",
        duelId,
        seat,
        playerId: identity.playerId,
        sessionId: identity.sessionId,
        selection,
        expectedRound: lastSync?.round ?? undefined,
      });
    },
    getLastSync() {
      return lastSync;
    },
    acceptServerMessage(message) {
      if (
        message.type === "duel_state_sync" &&
        (!lastSync || message.payload.revision > lastSync.revision)
      ) {
        lastSync = message.payload;
        return true;
      }

      return false;
    },
  };

  async function dispatch(
    message:
      | {
          type: "create_duel";
          playerId: string;
          sessionId: string;
          displayName: string;
          snapshot: CombatSnapshot;
          fighterView?: OnlineDuelFighterView;
          loadout: OnlineDuelParticipantLoadout;
          expectedRevision?: number;
        }
      | {
          type: "find_matchmaking_duel";
          playerId: string;
          sessionId: string;
          displayName: string;
          snapshot: CombatSnapshot;
          fighterView?: OnlineDuelFighterView;
          loadout: OnlineDuelParticipantLoadout;
          expectedRevision?: number;
        }
      | {
          type: "set_connection";
          duelId: string;
          seat: OnlineDuelSeat;
          playerId: string;
          sessionId: string;
          connected: boolean;
          expectedRevision?: number;
        }
      | {
          type: "set_ready";
          duelId: string;
          seat: OnlineDuelSeat;
          playerId: string;
          sessionId: string;
          ready: boolean;
          expectedRevision?: number;
        }
      | {
          type: "join_duel";
          duelId: string;
          playerId: string;
          sessionId: string;
          displayName: string;
          snapshot: CombatSnapshot;
          fighterView?: OnlineDuelFighterView;
          loadout: OnlineDuelParticipantLoadout;
          expectedRevision?: number;
        }
      | {
          type: "join_duel_by_code";
          roomCode: string;
          playerId: string;
          sessionId: string;
          displayName: string;
          snapshot: CombatSnapshot;
          fighterView?: OnlineDuelFighterView;
          loadout: OnlineDuelParticipantLoadout;
          expectedRevision?: number;
        }
      | { type: "request_duel_sync"; duelId: string; playerId?: string; resumeToken?: string }
      | {
          type: "leave_duel";
          duelId: string;
          playerId: string;
          sessionId: string;
          expectedRevision?: number;
        }
      | {
          type: "rematch_duel";
          duelId: string;
          playerId: string;
          sessionId: string;
          expectedRevision?: number;
        }
      | {
          type: "submit_round_action";
          duelId: string;
          seat: OnlineDuelSeat;
          playerId: string;
          sessionId: string;
          selection: OnlineDuelActionSelection;
          expectedRound?: number;
          expectedRevision?: number;
        }
  ): Promise<OnlineDuelServerMessage[]> {
    const responses = await transport.send(message);
    const latestSync = [...responses].reverse().find((response) => response.type === "duel_state_sync");
    if (latestSync?.type === "duel_state_sync") {
      lastSync = latestSync.payload;
    }

    return responses;
  }
}

function resolveClientLoadout(
  loadout?: OnlineDuelParticipantLoadout
): OnlineDuelParticipantLoadout {
  return (
    loadout ?? {
      equipmentState: createEquipment(),
      inventory: createStarterInventory(),
      equippedSkillIds: [],
    }
  );
}
