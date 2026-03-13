import type { CombatantState } from "@/modules/combat/model/CombatantState";
import type { RoundResult } from "@/modules/combat/model/RoundResult";

export interface CombatState {
  id: string;
  round: number;
  status: "pending" | "active" | "finished";
  combatants: [CombatantState, CombatantState];
  winnerId: string | null;
  log: RoundResult[];
}
