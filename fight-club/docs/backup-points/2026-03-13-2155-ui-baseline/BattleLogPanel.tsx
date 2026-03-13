import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { getBattleLogVisibleTags, type BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";

export type BattleLogFilter = "all" | "hit" | "crit" | "block" | "dodge" | "penetration" | "consumable" | "system";

interface BattleLogPanelProps {
  entries: BattleLogEntry[];
  playerId: string;
  botId: string;
}

const primaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "999px",
  border: "none",
  background: "#cf6a32",
  color: "#fff8ed",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff8ed",
  cursor: "pointer",
};

const filterOptions: Array<{ id: BattleLogFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "hit", label: "Hits" },
  { id: "crit", label: "Crits" },
  { id: "block", label: "Blocks" },
  { id: "dodge", label: "Dodges" },
  { id: "penetration", label: "Pen" },
  { id: "consumable", label: "Items" },
  { id: "system", label: "System" },
];

export function BattleLogPanel({ entries, playerId, botId }: BattleLogPanelProps) {
  const [activeFilter, setActiveFilter] = useState<BattleLogFilter>("all");
  const [clearedAfterSequence, setClearedAfterSequence] = useState(0);

  useEffect(() => {
    if (entries.length === 0) {
      setClearedAfterSequence(0);
    }
  }, [entries.length]);

  const filterCounts = useMemo(() => {
    const filtered = entries.filter((entry) => entry.sequence > clearedAfterSequence);

    return {
      all: filtered.length,
      hit: filtered.filter((entry) => entry.type === "hit").length,
      crit: filtered.filter((entry) => entry.type === "crit").length,
      block: filtered.filter((entry) => entry.type === "block").length,
      dodge: filtered.filter((entry) => entry.type === "dodge").length,
      penetration: filtered.filter((entry) => entry.type === "penetration").length,
      consumable: filtered.filter((entry) => entry.type === "consumable").length,
      system: filtered.filter((entry) => entry.type === "system").length,
    } satisfies Record<BattleLogFilter, number>;
  }, [entries, clearedAfterSequence]);

  const visibleEntries = entries.filter((entry) => {
    if (entry.sequence <= clearedAfterSequence) {
      return false;
    }

    if (activeFilter === "all") {
      return true;
    }

    return entry.type === activeFilter;
  });

  return (
    <div data-testid="battle-log-panel" style={{ display: "grid", gap: "8px" }}>
      <div
        style={{
          borderRadius: "20px",
          padding: "12px 14px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(120,189,255,0.06), transparent 28%)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff7ee", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.82 }}>Combat Log</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <FeedSummaryCard label="Round" value={entries[0] ? `#${entries[0].round}` : "None"} compact />
            <FeedSummaryCard label="Damage" value={String(filterCounts.hit + filterCounts.crit + filterCounts.penetration)} compact />
            <FeedSummaryCard label="Defense" value={String(filterCounts.block + filterCounts.dodge)} compact />
            <FeedSummaryCard label="Items" value={String(filterCounts.consumable)} compact />
            <FeedSummaryCard label="System" value={String(filterCounts.system)} compact />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", flexWrap: "wrap" }}>
          {filterOptions.map((option) => {
            const active = activeFilter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-label={`Filter log ${option.id}`}
                onClick={() => setActiveFilter(option.id)}
                style={
                  active
                    ? {
                        ...primaryButtonStyle,
                        padding: "5px 9px",
                        fontSize: "11px",
                        boxShadow: "0 10px 20px rgba(207,106,50,0.18)",
                      }
                    : {
                        ...secondaryButtonStyle,
                        padding: "5px 9px",
                        fontSize: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
              >
                {option.label} {filterCounts[option.id]}
              </button>
            );
          })}
          <button
            type="button"
            aria-label="Clear battle log"
            onClick={() => setClearedAfterSequence(entries[0]?.sequence ?? 0)}
            style={{
              ...secondaryButtonStyle,
              padding: "5px 9px",
              fontSize: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "6px" }}>
        {visibleEntries.length === 0 ? (
          <div
            style={{
              opacity: 0.74,
              borderRadius: "18px",
              padding: "18px 16px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {entries.length === 0 ? "No rounds have been resolved yet." : "The active filter hid all log entries."}
          </div>
        ) : (
          visibleEntries.map((entry) => (
            <BattleLogCard key={entry.id} entry={entry} playerId={playerId} botId={botId} />
          ))
        )}
      </div>
    </div>
  );
}

function BattleLogCard({
  entry,
  playerId,
  botId,
}: {
  entry: BattleLogEntry;
  playerId: string;
  botId: string;
}) {
  const attackerAccent =
    entry.attackerId === playerId
      ? "#ff8f73"
      : entry.attackerId === botId
        ? "#78bdff"
        : "#b8b1a5";
  const actorLabel =
    entry.attackerId === playerId
      ? "Player"
      : entry.attackerId === botId
        ? "Bot"
        : "System";
  const entryTheme = getBattleLogTheme(entry.type);
  const timeLabel = formatBattleLogTimestamp(entry.timestamp);

  return (
    <div
      data-testid="battle-log-entry"
      style={{
        borderRadius: "18px",
        padding: "11px 13px",
        background:
          `linear-gradient(180deg, ${entryTheme.background}, rgba(255,255,255,0.015)), radial-gradient(circle at top right, ${entryTheme.glow}, transparent 34%)`,
        border: `1px solid ${entryTheme.border}`,
        boxShadow: `0 12px 24px ${entryTheme.shadow}`,
        display: "grid",
        gap: "7px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: entryTheme.badgeBackground,
              color: entryTheme.badgeText,
              fontSize: "11px",
              fontWeight: 800,
              border: `1px solid ${entryTheme.badgeBorder}`,
            }}
          >
            {entryTheme.icon}
            <span>{entryTheme.label}</span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.04)",
              color: attackerAccent,
              fontSize: "11px",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {actorLabel}
          </span>
          <span style={{ fontSize: "11px", opacity: 0.72 }}>Round {entry.round}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {entry.attackerName ? (
            <span style={{ fontSize: "11px", color: attackerAccent, fontWeight: 700 }}>{entry.attackerName}</span>
          ) : null}
          <span style={{ fontSize: "11px", opacity: 0.52 }}>{timeLabel}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "3px" }}>
        <div style={{ fontSize: "12px", lineHeight: 1.5, color: "#fff7ee" }}>{entry.headline}</div>
        {entry.explanation ? (
          <div style={{ fontSize: "10px", lineHeight: 1.4, color: "#d8d1c6", opacity: 0.82 }}>{entry.explanation}</div>
        ) : null}
      </div>

      {getBattleLogVisibleTags(entry).length > 0 ? (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {getBattleLogVisibleTags(entry).map((tag) => (
            <TagPill key={`${entry.id}-${tag}`} value={tag} />
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {entry.defenderName && !entry.isEffectTick ? <MetaPill label="Target" value={entry.defenderName} /> : null}
        {entry.attackZone && !entry.isEffectTick ? <MetaPill label="Zone" value={formatMaybeTitle(entry.attackZone)} /> : null}
        {entry.damageType && !entry.isEffectTick ? <MetaPill label="Type" value={formatMaybeTitle(entry.damageType)} /> : null}
        {entry.damage !== null && entry.damage > 0 ? (
          <EventPill tone={entry.type} label={`-${entry.damage} HP`} icon={getDamagePillIcon(entry.type)} />
        ) : null}
        {entry.healedHp > 0 ? (
          <EventPill tone="consumable" label={`+${entry.healedHp} HP`} icon={<PotionIcon size={12} />} />
        ) : null}
        {entry.blockedPercent !== null ? (
          <EventPill tone="block" label={`Block ${entry.blockedPercent}%`} icon={<ShieldSlashIcon size={12} />} />
        ) : null}
        {formatResourceGainPills(entry.attackerResourceGain, "Gain").map((pill) => (
          <MetaPill key={`attacker-${pill.label}`} label={pill.label} value={pill.value} />
        ))}
        {formatResourceGainPills(entry.defenderResourceGain, "Def").map((pill) => (
          <MetaPill key={`defender-${pill.label}`} label={pill.label} value={pill.value} />
        ))}
      </div>
    </div>
  );
}

function TagPill({ value }: { value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 7px",
        borderRadius: "999px",
        background: "rgba(255,248,237,0.05)",
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

function FeedSummaryCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        padding: compact ? "5px 8px" : "8px 10px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
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

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.05)",
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

function EventPill({
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

function getBattleLogTheme(type: BattleLogEntry["type"]) {
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

function getDamagePillIcon(type: BattleLogEntry["type"]) {
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

function getEventPillPalette(type: BattleLogEntry["type"]) {
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

function formatBattleLogTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatMaybeTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatResourceGainPills(
  gains: BattleLogEntry["attackerResourceGain"],
  prefix: string
) {
  return Object.entries(gains)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([key, value]) => ({
      label: `${prefix} ${formatMaybeTitle(key)}`,
      value: `+${value}`,
    }));
}

function StrikeIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M13.5 4 19 4.5l-.5 5.5-7.5 7.5-3.5-3.5L13.5 4Z" fill="#ffd6a2" stroke="#fff3de" strokeWidth="1.1" />
      <path d="M7.5 14.5 4 18l2 2 3.5-3.5" fill="#8f5d35" stroke="#d1a26f" strokeWidth="1" />
    </svg>
  );
}

function ShieldSlashIcon({ size }: { size: number }) {
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

function PotionIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M9 3h6v2l-1.5 1.8v1.4l3.7 5.2a5 5 0 0 1-4.1 7.6h-2.2a5 5 0 0 1-4.1-7.6l3.7-5.2V6.8L9 5V3Z" fill="#7fe0c6" stroke="#ddfff4" strokeWidth="1.1" />
      <path d="M8.5 13.5h7" stroke="#ddfff4" strokeWidth="1.1" strokeLinecap="round" />
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
