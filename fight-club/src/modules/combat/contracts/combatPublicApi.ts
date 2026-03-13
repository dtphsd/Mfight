import type { Random } from "@/core/rng/Random";
import type { CombatState } from "@/modules/combat/model/CombatState";
import type { CombatSnapshot } from "@/modules/combat/model/CombatSnapshot";
import type { RoundAction } from "@/modules/combat/model/RoundAction";

export type CombatResult<TData> =
  | { success: true; data: TData }
  | { success: false; reason: string };

export interface CombatPublicApi {
  start(snapshotA: CombatSnapshot, snapshotB: CombatSnapshot): CombatState;
  resolveRound(
    state: CombatState,
    actions: [RoundAction, RoundAction],
    random: Random
  ): CombatResult<CombatState>;
}
