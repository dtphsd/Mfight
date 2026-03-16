import type { ReactNode } from "react";
import type { ArmorProfile, DamageProfile } from "@/modules/inventory";
import { PanelCard as SharedPanelCard } from "@/ui/components/shared/PanelCard";
import { compactText, formatMaybeTitle } from "./builderPopoverHelpers";
import type { ZoneOutlook } from "./builderPopoverTypes";

const metricPalette: Record<string, { bg: string; border: string; text: string }> = {
  DMG: {
    bg: "rgba(229,115,79,0.16)",
    border: "rgba(229,115,79,0.42)",
    text: "#f0a286",
  },
  HP: {
    bg: "rgba(214,177,95,0.16)",
    border: "rgba(214,177,95,0.42)",
    text: "#ebcf8b",
  },
  Dodge: {
    bg: "rgba(92,199,178,0.16)",
    border: "rgba(92,199,178,0.42)",
    text: "#87e2cf",
  },
  Crit: {
    bg: "rgba(216,93,145,0.16)",
    border: "rgba(216,93,145,0.42)",
    text: "#ee9abb",
  },
  Pen: {
    bg: "rgba(115,149,230,0.16)",
    border: "rgba(115,149,230,0.42)",
    text: "#b8cbff",
  },
  "Crit DMG": {
    bg: "rgba(130,111,213,0.16)",
    border: "rgba(130,111,213,0.42)",
    text: "#ccc0ff",
  },
};

export function PanelCard({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <SharedPanelCard
      style={{
        borderRadius: compact ? "12px" : "16px",
        padding: compact ? "9px" : "12px",
        display: "grid",
        gap: compact ? "7px" : "9px",
      }}
    >
      {children}
    </SharedPanelCard>
  );
}

export function SectionIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <SectionLabel label={label} />
      <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff6e7", lineHeight: 1.02 }}>{title}</div>
      {description ? (
        <div style={{ fontSize: "9px", lineHeight: 1.3, color: "#cdbda8", maxWidth: "48ch" }}>{description}</div>
      ) : null}
    </div>
  );
}

export function InfoBanner({
  tone,
  title,
  value,
  note,
}: {
  tone: "warm";
  title: string;
  value: string;
  note: string;
}) {
  const palette = tone === "warm"
    ? { bg: "rgba(207,106,50,0.14)", border: "rgba(207,106,50,0.32)", text: "#ffd4b6" }
    : { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", text: "#fff8ed" };

  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "8px 9px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        display: "grid",
        gap: "2px",
      }}
    >
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.8, letterSpacing: "0.08em" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: 900, color: palette.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "8px", opacity: 0.68, lineHeight: 1.24 }}>{note}</div>
    </div>
  );
}

export function StatBonusPill({
  label,
  accent,
  textColor,
}: {
  label: string;
  accent: string;
  textColor: string;
}) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "4px 7px",
        fontSize: compactText(label) ? "9px" : "10px",
        background: accent,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  const palette = metricPalette[label] ?? {
    bg: highlight ? "rgba(207,106,50,0.16)" : "rgba(255,255,255,0.03)",
    border: highlight ? "rgba(207,106,50,0.45)" : "rgba(255,255,255,0.08)",
    text: "#fff8ed",
  };

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "7px 8px",
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div style={{ fontSize: "8px", opacity: 0.82, color: palette.text, lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ marginTop: "3px", fontSize: "15px", fontWeight: 900, lineHeight: 1.02, color: "#fff7eb" }}>{value}</div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.78, letterSpacing: "0.16em", color: "#d6c3ad", fontWeight: 800 }}>{label}</div>;
}

export function LoadoutLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" }}>
      <span style={{ opacity: 0.62, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#c8b7a4", fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 800, textAlign: "right", fontSize: "11px", color: "#fff4e2", lineHeight: 1.15 }}>{value}</span>
    </div>
  );
}

export function ProfileCard({
  profile,
  accent,
  textColor,
  compact = false,
}: {
  profile: DamageProfile | ArmorProfile;
  accent: string;
  textColor: string;
  compact?: boolean;
}) {
  const entries = Object.entries(profile).filter(([, value]) => value !== 0);

  if (entries.length === 0) {
    return <div style={{ fontSize: compact ? "10px" : "11px", opacity: 0.66 }}>No active values.</div>;
  }

  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {entries.map(([name, value]) => (
        <StatBonusPill
          key={name}
          label={`${formatDamageTypeName(name)} ${value}`}
          accent={accent}
          textColor={textColor}
        />
      ))}
    </div>
  );
}

export function CompareCard({
  title,
  accent,
  textColor,
  lines,
}: {
  title: string;
  accent: string;
  textColor: string;
  lines: Array<{ label: string; value: number | string }>;
}) {
  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "8px",
        background: accent,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "5px",
      }}
    >
      <div style={{ display: "grid", gap: "1px" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", color: textColor, fontWeight: 800, letterSpacing: "0.14em", opacity: 0.82 }}>
          Outlook
        </div>
        <div style={{ fontSize: "12px", color: "#fff6e7", fontWeight: 900, lineHeight: 1.05 }}>{title}</div>
      </div>
      {lines.map((line) => (
        <LoadoutLine key={`${title}-${line.label}`} label={line.label} value={String(line.value)} />
      ))}
    </div>
  );
}

export function formatDamageTypeName(name: string) {
  switch (name) {
    case "slash":
      return "Slash";
    case "pierce":
      return "Pierce";
    case "blunt":
      return "Blunt";
    case "chop":
      return "Chop";
    default:
      return name;
  }
}

export function formatZoneOutlook(entry: ZoneOutlook) {
  return `${formatMaybeTitle(entry.zone)} (${entry.openDamage}/${entry.guardedDamage})`;
}

export function formatCombatBonuses(metrics: {
  critChanceBonus: number;
  dodgeChanceBonus: number;
  blockChanceBonus: number;
  blockPowerBonus: number;
  armorPenetrationFlat: DamageProfile;
  armorPenetrationPercent: DamageProfile;
}) {
  return [
    metrics.critChanceBonus
      ? { label: `Crit +${metrics.critChanceBonus}%`, accent: "rgba(216,93,145,0.16)", textColor: "#ee9abb" }
      : null,
    metrics.dodgeChanceBonus
      ? { label: `Dodge +${metrics.dodgeChanceBonus}%`, accent: "rgba(92,199,178,0.16)", textColor: "#87e2cf" }
      : null,
    metrics.blockChanceBonus
      ? { label: `Block +${metrics.blockChanceBonus}%`, accent: "rgba(115,149,230,0.16)", textColor: "#b8cbff" }
      : null,
    metrics.blockPowerBonus
      ? { label: `Block Pow +${metrics.blockPowerBonus}%`, accent: "rgba(214,177,95,0.16)", textColor: "#ebcf8b" }
      : null,
    hasAnyProfile(metrics.armorPenetrationFlat)
      ? {
          label: `Pen Flat ${formatProfile(metrics.armorPenetrationFlat)}`,
          accent: "rgba(229,115,79,0.16)",
          textColor: "#f0a286",
        }
      : null,
    hasAnyProfile(metrics.armorPenetrationPercent)
      ? {
          label: `Pen % ${formatProfile(metrics.armorPenetrationPercent)}`,
          accent: "rgba(232,72,72,0.16)",
          textColor: "#ffaaa1",
        }
      : null,
  ].filter((entry): entry is { label: string; accent: string; textColor: string } => Boolean(entry));
}

function hasAnyProfile(profile: DamageProfile | ArmorProfile) {
  return Object.values(profile).some((value) => value !== 0);
}

function formatProfile(profile: DamageProfile | ArmorProfile) {
  return Object.entries(profile)
    .filter(([, value]) => value !== 0)
    .map(([name, value]) => `${formatDamageTypeName(name)} ${value}`)
    .join(" | ");
}
