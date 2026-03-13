import {
  canPrepareNextRound,
  canResolveCombatRound,
  canStartCombat,
  createInitialCombatPhase,
  formatCombatPhaseLabel,
  phaseAfterCombatStart,
  phaseAfterResolutionFailure,
  phaseAfterRoundResolution,
  phaseForNextRound,
  phaseWhileResolving,
  resetCombatPhase,
} from "@/orchestration/combat/combatStateMachine";

describe("combatStateMachine", () => {
  it("returns setup as the initial and reset phase", () => {
    expect(createInitialCombatPhase()).toBe("setup");
    expect(resetCombatPhase()).toBe("setup");
  });

  it("reports phase capabilities correctly", () => {
    expect(canStartCombat("setup")).toBe(true);
    expect(canStartCombat("finished")).toBe(true);
    expect(canStartCombat("awaiting_actions")).toBe(false);

    expect(canResolveCombatRound("awaiting_actions")).toBe(true);
    expect(canResolveCombatRound("setup")).toBe(false);

    expect(canPrepareNextRound("round_resolved")).toBe(true);
    expect(canPrepareNextRound("finished")).toBe(false);
  });

  it("computes combat lifecycle transitions from combat status", () => {
    expect(
      phaseAfterCombatStart({
        id: "combat-1",
        round: 1,
        status: "active",
        combatants: [] as never,
        winnerId: null,
        log: [],
      })
    ).toBe("awaiting_actions");

    expect(
      phaseAfterRoundResolution({
        id: "combat-1",
        round: 1,
        status: "active",
        combatants: [] as never,
        winnerId: null,
        log: [],
      })
    ).toBe("round_resolved");

    expect(
      phaseAfterRoundResolution({
        id: "combat-1",
        round: 1,
        status: "finished",
        combatants: [] as never,
        winnerId: "player-1",
        log: [],
      })
    ).toBe("finished");
  });

  it("handles resolving and failure fallback transitions", () => {
    expect(phaseWhileResolving()).toBe("resolving_round");
    expect(phaseAfterResolutionFailure("resolving_round")).toBe("awaiting_actions");
    expect(phaseAfterResolutionFailure("setup")).toBe("setup");
    expect(phaseForNextRound()).toBe("awaiting_actions");
  });

  it("formats all combat phases into stable labels", () => {
    expect(formatCombatPhaseLabel("idle")).toBe("Idle");
    expect(formatCombatPhaseLabel("setup")).toBe("Setup");
    expect(formatCombatPhaseLabel("awaiting_actions")).toBe("Awaiting Actions");
    expect(formatCombatPhaseLabel("resolving_round")).toBe("Resolving");
    expect(formatCombatPhaseLabel("round_resolved")).toBe("Round Resolved");
    expect(formatCombatPhaseLabel("finished")).toBe("Finished");
  });
});
