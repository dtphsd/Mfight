import type { CSSProperties } from "react";
import { MiniPanel } from "./combatSandboxScreenLayout";

export function FightControlsPanel({
  panelStyle,
  primaryButtonStyle,
  canStartFight,
  primaryActionTone = "warm",
  combatPhase,
  combatRound,
  combatPhaseLabel,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  roomCode,
  codeCopied,
  waitStatus,
  roundProgressLabel,
  onCopyRoomCode,
  onStartFight,
  primaryActionLabel,
  primaryActionAriaLabel = "Start fight",
}: {
  panelStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  canStartFight: boolean;
  primaryActionTone?: "warm" | "ready";
  combatPhase: string;
  combatRound: number | null;
  combatPhaseLabel: string;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  roomCode?: string;
  codeCopied?: boolean;
  waitStatus?: string | null;
  roundProgressLabel?: string | null;
  onCopyRoomCode?: () => void;
  onStartFight: () => void;
  primaryActionLabel?: string;
  primaryActionAriaLabel?: string;
}) {
  const primaryActionToneStyle =
    primaryActionTone === "ready"
      ? {
          border: "1px solid rgba(102, 224, 138, 0.42)",
          background: "linear-gradient(180deg, rgba(56,148,84,0.92), rgba(30,96,55,0.96))",
          color: "#e8ffe9",
          boxShadow: "0 0 0 1px rgba(102,224,138,0.12) inset, 0 10px 26px rgba(45,132,74,0.24)",
        }
      : {};
  const turnFocus = buildTurnFocusModel({
    combatPhase,
    combatRound,
    combatPhaseLabel,
    waitStatus: waitStatus ?? null,
    roundProgressLabel: roundProgressLabel ?? null,
    selectedActionLabel,
  });

  return (
    <MiniPanel panelStyle={panelStyle} title="Fight Controls">
      <div style={{ display: "grid", gap: "8px", height: "100%", alignContent: "space-between" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <FightTurnFocus {...turnFocus} />
          {roomCode || waitStatus || roundProgressLabel ? (
            <FightStatusRail
              roomCode={roomCode}
              codeCopied={codeCopied}
              waitStatus={waitStatus}
              roundProgressLabel={roundProgressLabel}
              onCopyRoomCode={onCopyRoomCode}
            />
          ) : null}
          <button
            type="button"
            aria-label={primaryActionAriaLabel}
            onClick={onStartFight}
            disabled={!canStartFight}
            style={{
              ...primaryButtonStyle,
              ...primaryActionToneStyle,
              padding: "7px 12px",
              minHeight: 0,
              fontSize: "10px",
              ...(canStartFight ? {} : { opacity: 0.48, cursor: "not-allowed" }),
            }}
          >
            {primaryActionLabel ?? (combatPhase === "finished" ? "Restart Fight" : "Start Fight")}
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

function FightTurnFocus({
  eyebrow,
  title,
  subtitle,
  tone,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: "warm" | "ready" | "locked" | "finish";
}) {
  const toneStyle =
    tone === "ready"
      ? {
          border: "1px solid rgba(102, 224, 138, 0.26)",
          background: "linear-gradient(180deg, rgba(38,92,55,0.9), rgba(18,28,22,0.96))",
          eyebrow: "#9ef1b5",
          title: "#f0fff3",
          subtitle: "#d9f3de",
        }
      : tone === "locked"
        ? {
            border: "1px solid rgba(135,217,255,0.24)",
            background: "linear-gradient(180deg, rgba(24,48,66,0.92), rgba(12,18,24,0.96))",
            eyebrow: "#98dbff",
            title: "#ecf8ff",
            subtitle: "#cfe7f5",
          }
        : tone === "finish"
          ? {
              border: "1px solid rgba(255,196,120,0.26)",
              background: "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))",
              eyebrow: "#f3c58c",
              title: "#fff1df",
              subtitle: "#ebd6bc",
            }
          : {
              border: "1px solid rgba(255,171,97,0.2)",
              background: "linear-gradient(180deg, rgba(56,33,20,0.9), rgba(18,13,10,0.96))",
              eyebrow: "#ffcf9f",
              title: "#fff1e0",
              subtitle: "#ead7c1",
            };

  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: "8px 10px",
        borderRadius: 14,
        border: toneStyle.border,
        background: toneStyle.background,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <span
        style={{
          fontSize: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 800,
          color: toneStyle.eyebrow,
        }}
      >
        {eyebrow}
      </span>
      <span
        style={{
          fontSize: "14px",
          lineHeight: 1.1,
          fontWeight: 800,
          color: toneStyle.title,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "9px",
          lineHeight: 1.25,
          color: toneStyle.subtitle,
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

function buildTurnFocusModel({
  combatPhase,
  combatRound,
  combatPhaseLabel,
  waitStatus,
  roundProgressLabel,
  selectedActionLabel,
}: {
  combatPhase: string;
  combatRound: number | null;
  combatPhaseLabel: string;
  waitStatus: string | null;
  roundProgressLabel: string | null;
  selectedActionLabel: string;
}): {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: "warm" | "ready" | "locked" | "finish";
} {
  if (combatPhase === "finished") {
    return {
      eyebrow: "Match Status",
      title: "Fight Complete",
      subtitle: waitStatus ?? "Review the outcome and decide whether to queue the next fight.",
      tone: "finish" as const,
    };
  }

  if (combatPhase === "planning") {
    return {
      eyebrow: combatRound ? `Round ${combatRound}` : "Current Turn",
      title: selectedActionLabel,
      subtitle: waitStatus ?? roundProgressLabel ?? "Choose your attack path and lock the action.",
      tone: selectedActionLabel === "Action Locked" ? "locked" : "warm" as const,
    };
  }

  if (combatPhase === "resolving_round") {
    return {
      eyebrow: combatRound ? `Round ${combatRound}` : "Current Turn",
      title: "Resolving Exchange",
      subtitle: waitStatus ?? "The round is unfolding. Watch the impact and get ready for the next setup.",
      tone: "locked" as const,
    };
  }

  return {
    eyebrow: combatRound ? `Round ${combatRound}` : "Pre-Fight",
    title: combatPhaseLabel,
    subtitle: waitStatus ?? roundProgressLabel ?? "Lock in when you're ready to start the clash.",
    tone: roundProgressLabel?.includes("Ready") ? "ready" : "warm" as const,
  };
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
    <div
      style={{
        display: "grid",
        gap: "7px",
        padding: "9px 10px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.68 }}>Your Move</div>
        <div style={actionMetaChipStyle}>{combatRound ? `Round ${combatRound}` : "Pre-fight"}</div>
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: "9px", lineHeight: 1.2, color: "#d7c6b2", opacity: 0.9 }}>
          {selectedActionSummary[0] ?? "Pick your path, then lock it in."}
        </div>
        <div style={actionMetaChipStyle}>{combatPhaseLabel}</div>
      </div>
    </div>
  );
}

function FightStatusRail({
  roomCode,
  codeCopied,
  waitStatus,
  roundProgressLabel,
  onCopyRoomCode,
}: {
  roomCode?: string;
  codeCopied?: boolean;
  waitStatus?: string | null;
  roundProgressLabel?: string | null;
  onCopyRoomCode?: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 6,
        padding: "7px 9px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.018))",
      }}
    >
      {roomCode ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "grid", gap: 2 }}>
            <span style={compactLabelStyle}>Match Code</span>
            <div style={roomCodeValueStyle}>{roomCode}</div>
          </div>
          {onCopyRoomCode ? (
            <button type="button" style={copyButtonStyle} onClick={onCopyRoomCode}>
              {codeCopied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      ) : null}
      {waitStatus || roundProgressLabel ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {waitStatus ? (
            <div style={statusPillStyle}>
              <span style={statusPillLabelStyle}>Wait</span>
              <span style={statusPillValueStyle}>{waitStatus}</span>
            </div>
          ) : null}
          {roundProgressLabel ? (
            <div style={statusPillStyle}>
              <span style={statusPillLabelStyle}>Progress</span>
              <span style={statusPillValueStyle}>{roundProgressLabel}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const compactInfoCardStyle = {
  display: "grid",
  gap: "2px",
  padding: "4px 8px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.032)",
} as const;

const compactInfoHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
} as const;

const compactLabelStyle = {
  fontSize: "8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  opacity: 0.68,
} as const;

const copyButtonStyle = {
  borderRadius: "999px",
  padding: "2px 6px",
  fontSize: "8px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#e7d9c8",
  cursor: "pointer",
} as const;

const roomCodeValueStyle = {
  fontSize: "12px",
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: "0.16em",
  fontFamily: "Consolas, monospace",
  color: "#fff4eb",
} as const;

const waitStatusValueStyle = {
  fontSize: "10px",
  lineHeight: 1.15,
  color: "#e7d9c8",
} as const;

const statusPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  minHeight: 28,
  padding: "5px 9px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.032)",
} as const;

const statusPillLabelStyle = {
  fontSize: "8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#d9c4a8",
  opacity: 0.72,
  fontWeight: 700,
} as const;

const statusPillValueStyle = {
  fontSize: "9px",
  lineHeight: 1.15,
  color: "#fff1e0",
  fontWeight: 700,
} as const;

const actionMetaChipStyle = {
  borderRadius: "999px",
  padding: "3px 7px",
  fontSize: "8px",
  lineHeight: 1.1,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#ead8c4",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  fontWeight: 700,
} as const;

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
