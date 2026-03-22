import type {
  OnlineDuelActionSelection,
  OnlineDuelFighterView,
  OnlineDuelParticipantLoadout,
} from "@/modules/arena/contracts/arenaPublicApi";
import type { CombatSnapshot, CombatState } from "@/modules/combat";

export type OnlineDuelSeat = "playerA" | "playerB";

export type OnlineDuelStatus =
  | "waiting_for_players"
  | "lobby"
  | "planning"
  | "ready_to_resolve"
  | "finished"
  | "abandoned";

export interface OnlineDuelParticipant {
  seat: OnlineDuelSeat;
  playerId: string;
  sessionId: string;
  resumeToken: string;
  displayName: string;
  baselineSnapshot: CombatSnapshot;
  snapshot: CombatSnapshot;
  baselineFighterView?: OnlineDuelFighterView;
  fighterView?: OnlineDuelFighterView;
  baselineLoadout: OnlineDuelParticipantLoadout;
  loadout: OnlineDuelParticipantLoadout;
  connected: boolean;
  joinedAt: number;
  readyAt: number | null;
}

export interface OnlineDuelRoundSubmission {
  seat: OnlineDuelSeat;
  playerId: string;
  selection: OnlineDuelActionSelection;
  submittedAt: number;
}

export interface OnlineDuelRoundState {
  round: number;
  submissions: Partial<Record<OnlineDuelSeat, OnlineDuelRoundSubmission>>;
  submittedAt: number | null;
  resolvedAt: number | null;
}

export interface OnlineDuel {
  id: string;
  roomCode: string;
  revision: number;
  status: OnlineDuelStatus;
  createdAt: number;
  updatedAt: number;
  combatState: CombatState | null;
  participants: {
    playerA: OnlineDuelParticipant;
    playerB: OnlineDuelParticipant | null;
  };
  currentRound: OnlineDuelRoundState | null;
  winnerSeat: OnlineDuelSeat | null;
}
