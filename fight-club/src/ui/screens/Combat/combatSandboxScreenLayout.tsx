import type { CSSProperties, ReactNode } from "react";
import type { BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";
import { BattleLogPanel } from "@/ui/components/combat/BattleLogPanel";

export function BattleLogSection({
  entries,
  playerId,
  botId,
  shellStyle,
}: {
  entries: BattleLogEntry[];
  playerId: string;
  botId: string;
  shellStyle: CSSProperties;
}) {
  return (
    <div style={{ ...shellStyle, padding: "16px" }}>
      <BattleLogPanel entries={entries} playerId={playerId} botId={botId} />
    </div>
  );
}

export function SidePanel({
  shellStyle,
  panelStyle,
  silhouette,
  sidebar = null,
  blocks,
  overlay = null,
}: {
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  silhouette: ReactNode;
  sidebar?: ReactNode;
  blocks: ReactNode[];
  overlay?: ReactNode;
}) {
  return (
    <div style={{ ...shellStyle, padding: "16px", display: "grid", gap: "10px", alignContent: "start" }}>
      <div style={{ ...panelStyle, padding: "12px", position: "relative" }}>
        <div
          style={
            sidebar
              ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 132px", gap: "12px", alignItems: "stretch" }
              : undefined
          }
        >
          {silhouette}
          {sidebar}
        </div>
        {overlay}
      </div>
      {blocks.length > 0 ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>{blocks.slice(0, 2)}</div> : null}
      {blocks.length > 2 ? blocks[2] : null}
    </div>
  );
}

export function MiniPanel({
  panelStyle,
  title,
  children,
}: {
  panelStyle: CSSProperties;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ ...panelStyle, padding: "10px", display: "grid", gap: "7px" }}>
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.66, letterSpacing: "0.1em", color: "#d9b28b" }}>{title}</div>
      {children}
    </div>
  );
}
