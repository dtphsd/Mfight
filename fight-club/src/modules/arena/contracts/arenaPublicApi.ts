import type { Random } from "@/core/rng/Random";
import type { OnlineDuel, OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import type { CombatSnapshot, CombatState, CombatZone, RoundAction } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";

export type OnlineDuelFailureReason =
  | "duel_not_found"
  | "room_full"
  | "player_already_joined"
  | "rematch_not_ready"
  | "stale_sync"
  | "stale_session"
  | "displaced_session"
  | "invalid_status"
  | "not_ready"
  | "participant_not_found"
  | "participant_disconnected"
  | "seat_mismatch"
  | "attacker_mismatch"
  | "round_not_ready"
  | "already_submitted"
  | "combat_not_started"
  | "combat_not_active"
  | "invalid_action"
  | "combatant_not_found"
  | "duplicate_defense_zones"
  | "dead_combatant_action"
  | "insufficient_resources"
  | "skill_on_cooldown"
  | "combat_resolution_failed";

export type OnlineDuelResult<TData> =
  | { success: true; data: TData }
  | { success: false; reason: OnlineDuelFailureReason };

export interface CreateOnlineDuelRoomInput {
  playerId: string;
  sessionId: string;
  displayName: string;
  snapshot: CombatSnapshot;
  fighterView?: OnlineDuelFighterView;
  createdAt?: number;
}

export interface FindOnlineDuelMatchInput extends CreateOnlineDuelRoomInput {}

export interface JoinOnlineDuelRoomInput {
  playerId: string;
  sessionId: string;
  displayName: string;
  snapshot: CombatSnapshot;
  fighterView?: OnlineDuelFighterView;
  expectedRevision?: number;
  joinedAt?: number;
}

export interface OnlineDuelFighterView {
  figure: string;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
}

export interface SubmitOnlineDuelActionInput {
  seat: OnlineDuelSeat;
  playerId: string;
  sessionId: string;
  action: RoundAction;
  expectedRound?: number;
  expectedRevision?: number;
  submittedAt?: number;
}

export interface SetOnlineDuelReadyInput {
  seat: OnlineDuelSeat;
  playerId: string;
  sessionId: string;
  ready: boolean;
  expectedRevision?: number;
  updatedAt?: number;
}

export interface SetOnlineDuelConnectionInput {
  seat: OnlineDuelSeat;
  playerId: string;
  sessionId: string;
  connected: boolean;
  expectedRevision?: number;
  updatedAt?: number;
}

export interface ResetOnlineDuelMatchInput {
  playerId: string;
  sessionId: string;
  expectedRevision?: number;
  updatedAt?: number;
}

export interface LeaveOnlineDuelRoomInput {
  playerId: string;
  sessionId: string;
  expectedRevision?: number;
  updatedAt?: number;
}

export interface OnlineDuelParticipantSync {
  seat: OnlineDuelSeat;
  displayName: string;
  connected: boolean;
  ready: boolean;
  fighterView?: OnlineDuelFighterView;
}

export interface OnlineDuelRoundSummaryEntry {
  attackerName: string;
  defenderName: string;
  attackZone: CombatZone;
  finalDamage: number;
  blocked: boolean;
  dodged: boolean;
  crit: boolean;
  commentary: string;
  knockoutCommentary: string | null;
}

export interface OnlineDuelRoundCombatantSummary {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
}

export interface OnlineDuelRoundSummary {
  round: number;
  winnerSeat: OnlineDuelSeat | null;
  entries: OnlineDuelRoundSummaryEntry[];
  combatants: OnlineDuelRoundCombatantSummary[];
}

export interface OnlineDuelCurrentRoundSync {
  round: number;
  submittedSeats: OnlineDuelSeat[];
  yourActionSubmitted: boolean;
  opponentActionSubmitted: boolean;
  readyToResolve: boolean;
}

export interface OnlineDuelStateSync {
  duelId: string;
  roomCode: string;
  revision: number;
  status: OnlineDuel["status"];
  round: number | null;
  winnerSeat: OnlineDuelSeat | null;
  yourSeat: OnlineDuelSeat | null;
  resumeToken?: string;
  participants: OnlineDuelParticipantSync[];
  currentRoundState?: OnlineDuelCurrentRoundSync;
  lastResolvedRound?: OnlineDuelRoundSummary;
  combatState?: CombatState;
}

export interface OnlineDuelAuthorityService {
  createRoom(input: CreateOnlineDuelRoomInput): OnlineDuel;
  findMatchmakingDuel(
    input: FindOnlineDuelMatchInput
  ): OnlineDuelResult<{ duel: OnlineDuel; yourSeat: OnlineDuelSeat; queued: boolean }>;
  getRoom(duelId: string): OnlineDuelResult<OnlineDuel>;
  getRoomByCode(roomCode: string): OnlineDuelResult<OnlineDuel>;
  joinRoom(duelId: string, input: JoinOnlineDuelRoomInput): OnlineDuelResult<OnlineDuel>;
  setConnectionState(duelId: string, input: SetOnlineDuelConnectionInput): OnlineDuelResult<OnlineDuel>;
  setReadyState(duelId: string, input: SetOnlineDuelReadyInput): OnlineDuelResult<OnlineDuel>;
  submitAction(duelId: string, input: SubmitOnlineDuelActionInput): OnlineDuelResult<OnlineDuel>;
  resolveRound(duelId: string): OnlineDuelResult<OnlineDuel>;
  resetMatch(duelId: string, input: ResetOnlineDuelMatchInput): OnlineDuelResult<OnlineDuel>;
  leaveRoom(duelId: string, input: LeaveOnlineDuelRoomInput): OnlineDuelResult<OnlineDuel>;
  buildStateSync(duelId: string, playerId?: string, resumeToken?: string): OnlineDuelResult<OnlineDuelStateSync>;
  expireStaleRooms(now?: number): number;
}

export interface OnlineDuelTransport {
  send(message: OnlineDuelClientMessage): Promise<OnlineDuelServerMessage[]>;
}

export interface OnlineDuelClientIdentity {
  playerId: string;
  sessionId: string;
  displayName: string;
}

export interface OnlineDuelClient {
  readonly identity: OnlineDuelClientIdentity;
  createDuel(
    snapshot: CombatSnapshot,
    fighterView?: OnlineDuelFighterView,
    displayNameOverride?: string
  ): Promise<OnlineDuelServerMessage[]>;
  findMatchmakingDuel(
    snapshot: CombatSnapshot,
    fighterView?: OnlineDuelFighterView,
    displayNameOverride?: string
  ): Promise<OnlineDuelServerMessage[]>;
  joinDuel(
    duelId: string,
    snapshot: CombatSnapshot,
    fighterView?: OnlineDuelFighterView,
    displayNameOverride?: string
  ): Promise<OnlineDuelServerMessage[]>;
  joinDuelByCode(
    roomCode: string,
    snapshot: CombatSnapshot,
    fighterView?: OnlineDuelFighterView,
    displayNameOverride?: string
  ): Promise<OnlineDuelServerMessage[]>;
  setConnection(duelId: string, seat: OnlineDuelSeat, connected: boolean): Promise<OnlineDuelServerMessage[]>;
  setReady(duelId: string, seat: OnlineDuelSeat, ready: boolean): Promise<OnlineDuelServerMessage[]>;
  requestSync(duelId: string): Promise<OnlineDuelServerMessage[]>;
  requestRematch(duelId: string): Promise<OnlineDuelServerMessage[]>;
  leaveDuel(duelId: string): Promise<OnlineDuelServerMessage[]>;
  submitRoundAction(
    duelId: string,
    seat: OnlineDuelSeat,
    action: RoundAction
  ): Promise<OnlineDuelServerMessage[]>;
  getLastSync(): OnlineDuelStateSync | null;
  acceptServerMessage(message: OnlineDuelServerMessage): boolean;
}

export type OnlineDuelClientMessage =
  | {
      type: "create_duel";
      playerId: string;
      sessionId: string;
      displayName: string;
      snapshot: CombatSnapshot;
      fighterView?: OnlineDuelFighterView;
    }
  | {
      type: "find_matchmaking_duel";
      playerId: string;
      sessionId: string;
      displayName: string;
      snapshot: CombatSnapshot;
      fighterView?: OnlineDuelFighterView;
    }
  | {
      type: "join_duel";
      duelId: string;
      playerId: string;
      sessionId: string;
      displayName: string;
      snapshot: CombatSnapshot;
      fighterView?: OnlineDuelFighterView;
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
      expectedRevision?: number;
    }
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
      action: RoundAction;
      expectedRound?: number;
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
  | { type: "request_duel_sync"; duelId: string; playerId?: string; resumeToken?: string };

export type OnlineDuelServerMessage =
  | { type: "duel_created"; duelId: string; roomCode: string; yourSeat: OnlineDuelSeat }
  | { type: "duel_state_sync"; payload: OnlineDuelStateSync }
  | { type: "connection_updated"; duelId: string; seat: OnlineDuelSeat; connected: boolean }
  | { type: "readiness_updated"; duelId: string; seat: OnlineDuelSeat; ready: boolean }
  | { type: "duel_ready"; duelId: string }
  | { type: "round_ready"; duelId: string; round: number }
  | {
      type: "round_resolved";
      duelId: string;
      round: number;
      winnerSeat: OnlineDuelSeat | null;
      summary?: OnlineDuelRoundSummary;
    }
  | { type: "duel_error"; duelId: string; reason: OnlineDuelFailureReason };

export interface ArenaPublicApi {
  createOnlineDuelRoom(input: CreateOnlineDuelRoomInput): OnlineDuel;
  joinOnlineDuelRoom(duel: OnlineDuel, input: JoinOnlineDuelRoomInput): OnlineDuelResult<OnlineDuel>;
  submitOnlineDuelAction(
    duel: OnlineDuel,
    input: SubmitOnlineDuelActionInput
  ): OnlineDuelResult<OnlineDuel>;
  resolveOnlineDuelRound(duel: OnlineDuel, random: Random): OnlineDuelResult<OnlineDuel>;
}
