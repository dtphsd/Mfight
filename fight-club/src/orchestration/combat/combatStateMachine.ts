import type { CombatState } from "@/modules/combat";
import type { CombatPhase } from "@/modules/combat/model/CombatPhase";

export function createInitialCombatPhase(): CombatPhase {
  return "setup";
}

export function resetCombatPhase(): CombatPhase {
  return "setup";
}

export function canStartCombat(phase: CombatPhase) {
  return phase === "idle" || phase === "setup" || phase === "finished";
}

export function canResolveCombatRound(phase: CombatPhase) {
  return phase === "awaiting_actions";
}

export function canPrepareNextRound(phase: CombatPhase) {
  return phase === "round_resolved";
}

export function phaseAfterCombatStart(state: CombatState): CombatPhase {
  return state.status === "finished" ? "finished" : "awaiting_actions";
}

export function phaseWhileResolving(): CombatPhase {
  return "resolving_round";
}

export function phaseAfterRoundResolution(state: CombatState): CombatPhase {
  return state.status === "finished" ? "finished" : "round_resolved";
}

export function phaseAfterResolutionFailure(previousPhase: CombatPhase): CombatPhase {
  return previousPhase === "resolving_round" ? "awaiting_actions" : previousPhase;
}

export function phaseForNextRound(): CombatPhase {
  return "awaiting_actions";
}

export function formatCombatPhaseLabel(phase: CombatPhase) {
  switch (phase) {
    case "idle":
      return "Idle";
    case "setup":
      return "Setup";
    case "awaiting_actions":
      return "Awaiting Actions";
    case "resolving_round":
      return "Resolving";
    case "round_resolved":
      return "Round Resolved";
    case "finished":
      return "Finished";
  }
}
