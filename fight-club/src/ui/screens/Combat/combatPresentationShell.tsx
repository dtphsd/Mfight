import type { CSSProperties, ReactNode } from "react";
import { ArenaStageColumns, ArenaStageShell } from "./combatSandboxScreenLayout";

export function CombatPresentationShell({
  shellStyle,
  overlay,
  left,
  center,
  right,
  leftState = null,
  rightState = null,
  resultReveal = null,
}: {
  shellStyle: CSSProperties;
  overlay?: ReactNode;
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  leftState?: "winner" | "loser" | null;
  rightState?: "winner" | "loser" | null;
  resultReveal?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tone: "victory" | "defeat" | "neutral";
  } | null;
}) {
  return (
    <ArenaStageShell shellStyle={shellStyle} overlay={overlay}>
      {resultReveal ? <CombatPresentationResultReveal {...resultReveal} /> : null}
      <ArenaStageColumns>
        <CombatPresentationPane side="left" state={leftState}>
          {left}
        </CombatPresentationPane>
        {center}
        <CombatPresentationPane side="right" state={rightState}>
          {right}
        </CombatPresentationPane>
      </ArenaStageColumns>
    </ArenaStageShell>
  );
}

function CombatPresentationPane({
  side,
  state,
  children,
}: {
  side: "left" | "right";
  state: "winner" | "loser" | null;
  children: ReactNode;
}) {
  const className =
    side === "left"
      ? state === "winner"
        ? "combat-finish-panel combat-finish-panel--winner-left"
        : state === "loser"
          ? "combat-finish-panel combat-finish-panel--loser-left"
          : undefined
      : state === "winner"
        ? "combat-finish-panel combat-finish-panel--winner-right"
        : state === "loser"
          ? "combat-finish-panel combat-finish-panel--loser-right"
          : undefined;

  return <div className={className}>{children}</div>;
}

function CombatPresentationResultReveal({
  eyebrow,
  title,
  subtitle,
  tone,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: "victory" | "defeat" | "neutral";
}) {
  const toneStyle =
    tone === "victory"
      ? {
          border: "1px solid rgba(102,224,138,0.34)",
          background: "linear-gradient(180deg, rgba(34,76,46,0.92), rgba(16,26,18,0.96))",
          glow: "0 20px 48px rgba(23,90,44,0.26)",
          eyebrow: "#9ef1b5",
          title: "#effff2",
          subtitle: "#d9f3de",
        }
      : tone === "defeat"
        ? {
            border: "1px solid rgba(255,127,127,0.3)",
            background: "linear-gradient(180deg, rgba(72,28,28,0.92), rgba(23,12,12,0.96))",
            glow: "0 20px 48px rgba(95,28,28,0.24)",
            eyebrow: "#ffb6b6",
            title: "#fff1f1",
            subtitle: "#f1d3d3",
          }
        : {
            border: "1px solid rgba(255,196,120,0.26)",
            background: "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))",
            glow: "0 20px 48px rgba(77,49,19,0.24)",
            eyebrow: "#f3c58c",
            title: "#fff2e1",
            subtitle: "#ecd7bd",
          };

  return (
    <div
      style={{
        position: "absolute",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        width: "min(440px, calc(100% - 40px))",
        pointerEvents: "none",
      }}
    >
      <div
        className="combat-round-reveal"
        style={{
          display: "grid",
          gap: 4,
          justifyItems: "center",
          textAlign: "center",
          borderRadius: 20,
          border: toneStyle.border,
          background: toneStyle.background,
          boxShadow: `${toneStyle.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          padding: "12px 16px",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: toneStyle.eyebrow,
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 900,
            color: toneStyle.title,
          }}
        >
          {title}
        </span>
        <span
          style={{
            maxWidth: 340,
            fontSize: 12,
            lineHeight: 1.3,
            color: toneStyle.subtitle,
          }}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}
