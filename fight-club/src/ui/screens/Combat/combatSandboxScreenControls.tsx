import type { CSSProperties } from "react";
import { MiniPanel } from "./combatSandboxScreenLayout";

export function FightControlsPanel({
  panelStyle,
  primaryButtonStyle,
  canStartFight,
  combatPhase,
  combatRound,
  combatPhaseLabel,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  onStartFight,
}: {
  panelStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  canStartFight: boolean;
  combatPhase: string;
  combatRound: number | null;
  combatPhaseLabel: string;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  onStartFight: () => void;
}) {
  return (
    <MiniPanel panelStyle={panelStyle} title="Fight Controls">
      <div style={{ display: "grid", gap: "10px", height: "100%", alignContent: "space-between" }}>
        <div style={{ display: "grid", gap: "10px" }}>
          <button
            type="button"
            aria-label="Start fight"
            onClick={onStartFight}
            disabled={!canStartFight}
            style={{
              ...primaryButtonStyle,
              ...(canStartFight ? {} : { opacity: 0.48, cursor: "not-allowed" }),
            }}
          >
            {combatPhase === "finished" ? "Restart Fight" : "Start Fight"}
          </button>
        </div>
        <FightActionSummary
          combatRound={combatRound}
          selectedActionLabel={selectedActionLabel}
          selectedActionTags={selectedActionTags}
          selectedActionSummary={selectedActionSummary}
          combatPhaseLabel={combatPhaseLabel}
        />
      </div>
    </MiniPanel>
  );
}

function FightActionSummary({
  combatRound,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  combatPhaseLabel,
}: {
  combatRound: number | null;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  combatPhaseLabel: string;
}) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68 }}>Current Action</div>
        <div style={{ fontSize: "10px", opacity: 0.66 }}>{combatRound ? `Round ${combatRound}` : "Pre-fight"}</div>
      </div>
      <div data-testid="selected-action-label" style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2 }}>
        {selectedActionLabel}
      </div>
      <div data-testid="selected-action-tags" style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {selectedActionTags.map((tag) => (
          <span
            key={`${selectedActionLabel}-${tag}`}
            style={{
              borderRadius: "999px",
              padding: "3px 6px",
              fontSize: "8px",
              lineHeight: 1.1,
              background: "rgba(255,171,97,0.08)",
              border: "1px solid rgba(255,171,97,0.18)",
              color: "#ffe2c2",
              fontWeight: 700,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {selectedActionSummary.slice(0, 3).map((entry) => (
          <span
            key={`${selectedActionLabel}-${entry}`}
            style={{
              borderRadius: "999px",
              padding: "3px 6px",
              fontSize: "8px",
              lineHeight: 1.1,
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e7d9c8",
            }}
          >
            {entry}
          </span>
        ))}
      </div>
      <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#d7c6b2", opacity: 0.72 }}>
        Phase: {combatPhaseLabel}
      </div>
    </div>
  );
}

export function RoundAdvanceControls({
  primaryButtonStyle,
  canPrepareNextRound,
  canResolveRound,
  combatPhase,
  latestRoundSummary,
  onPrepareNextRound,
  onResolveNextRound,
}: {
  primaryButtonStyle: CSSProperties;
  canPrepareNextRound: boolean;
  canResolveRound: boolean;
  combatPhase: string;
  latestRoundSummary: string;
  onPrepareNextRound: () => void;
  onResolveNextRound: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: "7px" }}>
      {canPrepareNextRound ? (
        <button type="button" aria-label="Prepare next round" onClick={onPrepareNextRound} style={primaryButtonStyle}>
          Next Round
        </button>
      ) : (
        <button
          type="button"
          aria-label="Resolve round"
          onClick={onResolveNextRound}
          disabled={!canResolveRound}
          className={canResolveRound ? "combat-action-ready-pulse" : undefined}
          style={{
            ...primaryButtonStyle,
            ...(canResolveRound ? {} : { opacity: 0.48, cursor: "not-allowed" }),
          }}
        >
          {combatPhase === "resolving_round" ? "Resolving..." : "Resolve Round"}
        </button>
      )}
      <div data-testid="latest-round-summary" style={{ display: "none" }}>
        {latestRoundSummary}
      </div>
    </div>
  );
}
