export type CombatPhase =
  | "idle"
  | "setup"
  | "awaiting_actions"
  | "resolving_round"
  | "round_resolved"
  | "finished";
