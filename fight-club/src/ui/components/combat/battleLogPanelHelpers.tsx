import type { ReactNode } from "react";
import type { BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";
import { formatBattleLogTitle } from "@/ui/components/combat/battleLogFormattingHelpers";

interface BattleLogTheme {
  icon: ReactNode;
  label: string;
  background: string;
  border: string;
  shadow: string;
  glow: string;
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
}

interface EventPillPalette {
  background: string;
  border: string;
  color: string;
}

export function getBattleLogTheme(type: BattleLogEntry["type"]): BattleLogTheme {
  switch (type) {
    case "dodge":
      return {
        icon: <FootworkIcon size={12} />,
        label: "Dodge",
        background: "rgba(255, 220, 92, 0.08)",
        border: "rgba(255, 220, 92, 0.24)",
        shadow: "rgba(255, 220, 92, 0.08)",
        glow: "rgba(255, 220, 92, 0.12)",
        badgeBackground: "rgba(255, 220, 92, 0.14)",
        badgeBorder: "rgba(255, 220, 92, 0.24)",
        badgeText: "#ffe064",
      };
    case "block":
      return {
        icon: <ShieldSlashIcon size={12} />,
        label: "Block",
        background: "rgba(116, 142, 255, 0.08)",
        border: "rgba(116, 142, 255, 0.24)",
        shadow: "rgba(116, 142, 255, 0.08)",
        glow: "rgba(116, 142, 255, 0.12)",
        badgeBackground: "rgba(116, 142, 255, 0.14)",
        badgeBorder: "rgba(116, 142, 255, 0.24)",
        badgeText: "#9fb2ff",
      };
    case "penetration":
      return {
        icon: <BrokenShieldIcon size={12} />,
        label: "Penetration",
        background: "rgba(255, 144, 61, 0.09)",
        border: "rgba(255, 144, 61, 0.24)",
        shadow: "rgba(255, 144, 61, 0.08)",
        glow: "rgba(255, 144, 61, 0.12)",
        badgeBackground: "rgba(255, 144, 61, 0.14)",
        badgeBorder: "rgba(255, 144, 61, 0.24)",
        badgeText: "#ffaf68",
      };
    case "consumable":
      return {
        icon: <PotionIcon size={12} />,
        label: "Consumable",
        background: "rgba(92, 199, 178, 0.08)",
        border: "rgba(92, 199, 178, 0.22)",
        shadow: "rgba(92, 199, 178, 0.08)",
        glow: "rgba(92, 199, 178, 0.12)",
        badgeBackground: "rgba(92, 199, 178, 0.14)",
        badgeBorder: "rgba(92, 199, 178, 0.24)",
        badgeText: "#a7f0df",
      };
    case "crit":
      return {
        icon: <BloodDropIcon size={12} />,
        label: "Critical",
        background: "rgba(255, 83, 83, 0.1)",
        border: "rgba(255, 83, 83, 0.24)",
        shadow: "rgba(255, 83, 83, 0.1)",
        glow: "rgba(255, 83, 83, 0.13)",
        badgeBackground: "rgba(255, 83, 83, 0.14)",
        badgeBorder: "rgba(255, 83, 83, 0.24)",
        badgeText: "#ff8a8a",
      };
    case "system":
      return {
        icon: <SkullIcon size={12} />,
        label: "System",
        background: "rgba(180, 180, 180, 0.08)",
        border: "rgba(180, 180, 180, 0.18)",
        shadow: "rgba(180, 180, 180, 0.06)",
        glow: "rgba(180, 180, 180, 0.08)",
        badgeBackground: "rgba(180, 180, 180, 0.12)",
        badgeBorder: "rgba(180, 180, 180, 0.2)",
        badgeText: "#d8d8d8",
      };
    case "hit":
    default:
      return {
        icon: <StrikeIcon size={12} />,
        label: "Hit",
        background: "rgba(255, 116, 195, 0.08)",
        border: "rgba(255, 116, 195, 0.22)",
        shadow: "rgba(255, 116, 195, 0.07)",
        glow: "rgba(255, 116, 195, 0.1)",
        badgeBackground: "rgba(255, 116, 195, 0.12)",
        badgeBorder: "rgba(255, 116, 195, 0.2)",
        badgeText: "#ff9cdd",
      };
  }
}

export function getDamagePillIcon(type: BattleLogEntry["type"]) {
  switch (type) {
    case "crit":
      return <BloodDropIcon size={12} />;
    case "penetration":
      return <BrokenShieldIcon size={12} />;
    case "dodge":
      return <FootworkIcon size={12} />;
    case "consumable":
      return <PotionIcon size={12} />;
    default:
      return <StrikeIcon size={12} />;
  }
}

export function getEventPillPalette(type: BattleLogEntry["type"]): EventPillPalette {
  switch (type) {
    case "crit":
      return {
        background: "rgba(255, 83, 83, 0.16)",
        border: "rgba(255, 83, 83, 0.24)",
        color: "#ff8a8a",
      };
    case "penetration":
      return {
        background: "rgba(255, 144, 61, 0.16)",
        border: "rgba(255, 144, 61, 0.24)",
        color: "#ffaf68",
      };
    case "dodge":
      return {
        background: "rgba(255, 220, 92, 0.16)",
        border: "rgba(255, 220, 92, 0.24)",
        color: "#ffe064",
      };
    case "block":
      return {
        background: "rgba(116, 142, 255, 0.16)",
        border: "rgba(116, 142, 255, 0.24)",
        color: "#bfc9ff",
      };
    case "consumable":
      return {
        background: "rgba(92, 199, 178, 0.16)",
        border: "rgba(92, 199, 178, 0.24)",
        color: "#a7f0df",
      };
    default:
      return {
        background: "rgba(255, 116, 195, 0.16)",
        border: "rgba(255, 116, 195, 0.22)",
        color: "#ff9cdd",
      };
  }
}

export function formatBattleLogTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatMaybeTitle(value: string) {
  return formatBattleLogTitle(value);
}

export function formatResourceGainPills(gains: BattleLogEntry["attackerResourceGain"], prefix: string) {
  return (Object.entries(gains) as Array<[string, number | undefined]>)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([key, value]) => ({
      label: `${prefix} ${formatMaybeTitle(key)}`,
      value: `+${value}`,
    }));
}

export function PotionIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M9 3h6v2l-1.5 1.8v1.4l3.7 5.2a5 5 0 0 1-4.1 7.6h-2.2a5 5 0 0 1-4.1-7.6l3.7-5.2V6.8L9 5V3Z" fill="#7fe0c6" stroke="#ddfff4" strokeWidth="1.1" />
      <path d="M8.5 13.5h7" stroke="#ddfff4" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function StrikeIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M13.5 4 19 4.5l-.5 5.5-7.5 7.5-3.5-3.5L13.5 4Z" fill="#ffd6a2" stroke="#fff3de" strokeWidth="1.1" />
      <path d="M7.5 14.5 4 18l2 2 3.5-3.5" fill="#8f5d35" stroke="#d1a26f" strokeWidth="1" />
    </svg>
  );
}

export function ShieldSlashIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 3 6 5.5v5.2c0 4.2 2.3 7.2 6 9.3 3.7-2.1 6-5.1 6-9.3V5.5L12 3Z" fill="#81baff" stroke="#eff7ff" strokeWidth="1.1" />
      <path d="M8 16 16 8" stroke="#eff7ff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BrokenShieldIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11 4.2-2.3 7-5.9 7-11V5l-7-3Z" fill="#ff6e63" opacity="0.25" />
      <path d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11V2Z" fill="#ff8978" stroke="#ffd7cf" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 2v20c4.2-2.3 7-5.9 7-11V5l-7-3Z" fill="#c43b2a" stroke="#ffd7cf" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12.2 4.8 10.1 9.4l1.7 1.6-2.4 3.2 1.4 1.4-1.8 3.4" fill="none" stroke="#fff0ec" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BloodDropIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 3c2.7 4 5.5 7 5.5 10.6A5.5 5.5 0 1 1 6.5 13.6C6.5 10 9.3 7 12 3Z" fill="#f06262" stroke="#ffd1d1" strokeWidth="1.1" />
      <circle cx="10.5" cy="15" r="1.2" fill="#ffd8d8" opacity="0.8" />
    </svg>
  );
}

function FootworkIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 5h4v6c0 1.5 1.2 2.7 2.7 2.7H19V16H5v-2.5L8 12V5Z" fill="#d8bb96" stroke="#fff0da" strokeWidth="1.1" />
      <path d="M6 18c2.2-.4 4.7-.4 7 0" stroke="#fff0da" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function SkullIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 4c4.2 0 7 3 7 6.9 0 2.3-.9 4.1-2.5 5.2V20h-2v-2h-1v2h-3v-2h-1v2h-2v-3.9C5.9 15 5 13.2 5 10.9 5 7 7.8 4 12 4Z" fill="#d4d4d4" stroke="#f2f2f2" strokeWidth="1.1" />
      <circle cx="9.2" cy="11.1" r="1.2" fill="#555" />
      <circle cx="14.8" cy="11.1" r="1.2" fill="#555" />
      <path d="M10 14.6h4" stroke="#777" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
