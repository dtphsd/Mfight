import type { CSSProperties, ReactNode } from "react";
import type { BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";
import { getEventPillPalette } from "@/ui/components/combat/battleLogPanelHelpers";

export const battleLogPrimaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(180deg, #d87a3f, #b95d29)",
  color: "#fff8ed",
  cursor: "pointer",
  fontWeight: 800,
};

export const battleLogSecondaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.035))",
  color: "#fff8ed",
  cursor: "pointer",
  fontWeight: 700,
};

export function FeedSummaryCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        padding: compact ? "5px 8px" : "8px 10px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025)), radial-gradient(circle at top right, rgba(255,214,162,0.06), transparent 42%)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: compact ? "1px" : "3px",
      }}
    >
      <div style={{ fontSize: compact ? "9px" : "10px", opacity: 0.66 }}>{label}</div>
      <div style={{ fontSize: compact ? "12px" : "15px", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export function BattleLogSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "5px" }}>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,247,238,0.56)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

export function TagPill({ value }: { value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "linear-gradient(180deg, rgba(255,248,237,0.08), rgba(255,248,237,0.04))",
        color: "#fff0de",
        fontSize: "10px",
        fontWeight: 700,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {value}
    </span>
  );
}

export function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.035))",
        color: "#d8d1c6",
        fontSize: "11px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ opacity: 0.62 }}>{label}</span>
      <span>{value}</span>
    </span>
  );
}

export function EventPill({
  tone,
  label,
  icon,
}: {
  tone: BattleLogEntry["type"];
  label: string;
  icon: ReactNode;
}) {
  const palette = getEventPillPalette(tone);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: palette.background,
        color: palette.color,
        fontSize: "11px",
        fontWeight: 800,
        border: `1px solid ${palette.border}`,
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
