import { useEffect, useMemo, useState } from "react";
import type { BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";
import { BattleLogCard } from "@/ui/components/combat/battleLogPanelCards";
import {
  battleLogPrimaryButtonStyle,
  battleLogSecondaryButtonStyle,
  FeedSummaryCard,
} from "@/ui/components/combat/battleLogPanelPrimitives";

export type BattleLogFilter = "all" | "hit" | "crit" | "block" | "dodge" | "penetration" | "consumable" | "system";

interface BattleLogPanelProps {
  entries: BattleLogEntry[];
  playerId: string;
  botId: string;
}

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
  const currentRoundLabel = entries[0] ? `#${entries[0].round}` : "None";
  const isEmpty = visibleEntries.length === 0;

  return (
    <div data-testid="battle-log-panel" style={{ display: "grid", gap: "10px" }}>
      <div
        style={{
          borderRadius: "22px",
          padding: "14px 16px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(120,189,255,0.1), transparent 28%), radial-gradient(circle at top left, rgba(255,214,162,0.07), transparent 32%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 32px rgba(0,0,0,0.16)",
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          alignItems: "flex-start",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: "4px",
            background: "linear-gradient(180deg, rgba(255,214,162,0.9), transparent)",
            opacity: 0.9,
          }}
        />
        <div style={{ display: "grid", gap: "8px", minWidth: "280px", flex: "1 1 340px" }}>
          <div style={{ display: "grid", gap: "4px" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,247,238,0.72)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Combat Log</div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff8ef" }}>
              Round flow, impact tags, and combat event detail
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <FeedSummaryCard label="Round" value={currentRoundLabel} compact />
            <FeedSummaryCard label="Damage" value={String(filterCounts.hit + filterCounts.crit + filterCounts.penetration)} compact />
            <FeedSummaryCard label="Defense" value={String(filterCounts.block + filterCounts.dodge)} compact />
            <FeedSummaryCard label="Items" value={String(filterCounts.consumable)} compact />
            <FeedSummaryCard label="System" value={String(filterCounts.system)} compact />
          </div>
        </div>
        <div style={{ display: "grid", gap: "6px", justifyItems: "end", flex: "1 1 300px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,247,238,0.58)" }}>
            Filters
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
                          ...battleLogPrimaryButtonStyle,
                          padding: "6px 10px",
                          fontSize: "11px",
                          boxShadow: "0 10px 20px rgba(207,106,50,0.18)",
                        }
                      : {
                          ...battleLogSecondaryButtonStyle,
                          padding: "6px 10px",
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
                ...battleLogSecondaryButtonStyle,
                padding: "6px 10px",
                fontSize: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {isEmpty ? (
          <div
            style={{
              opacity: 0.88,
              borderRadius: "20px",
              padding: "18px 16px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(255,214,162,0.06), transparent 36%)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: "5px",
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,247,238,0.58)" }}>
              Log State
            </div>
            <div style={{ color: "#fff8ef" }}>
              {entries.length === 0 ? "No rounds have been resolved yet." : "The active filter hid all log entries."}
            </div>
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
