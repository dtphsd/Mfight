import { forwardRef, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAnchoredPopup } from "@/ui/hooks/useAnchoredPopup";
import { getActionVisual, splitDetailLine, type ActionVisual } from "./combatSandboxScreenHelpers";

export function ActionRail({
  panelStyle,
  title,
  entries,
  emptyLabel,
  basicActionSelected = false,
  onSelectBasicAction,
  entrySlots = 5,
  headerAction = null,
  countLabel,
}: {
  panelStyle: CSSProperties;
  title: string;
  entries: ReactNode[];
  emptyLabel: string;
  basicActionSelected?: boolean;
  onSelectBasicAction?: () => void;
  entrySlots?: number;
  headerAction?: ReactNode;
  countLabel?: string;
}) {
  const content = onSelectBasicAction
    ? [
        <ActionButton key="basic" selected={basicActionSelected} onClick={onSelectBasicAction} label="Basic Attack" note="No cost" />,
        ...entries,
      ]
    : entries;
  const totalSlots = entrySlots + (onSelectBasicAction ? 1 : 0);
  const visibleEntries = content.slice(0, totalSlots);
  const placeholders = Array.from({ length: Math.max(0, totalSlots - visibleEntries.length) }, (_, index) => (
    <ActionSlotPlaceholder key={`placeholder-${title}-${index}`} />
  ));

  return (
    <div style={{ ...panelStyle, padding: "8px", display: "grid", gap: "6px" }}>
      <ActionRailHeader title={title} countLabel={countLabel} headerAction={headerAction} />
      {content.length === 0 && emptyLabel ? (
        <div
          style={{
            fontSize: "9px",
            opacity: 0.64,
            minHeight: "32px",
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          {emptyLabel}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))`,
          gap: "6px",
          alignItems: "center",
          minHeight: "36px",
        }}
      >
        {visibleEntries}
        {placeholders}
      </div>
    </div>
  );
}

function ActionRailHeader({
  title,
  countLabel,
  headerAction,
}: {
  title: string;
  countLabel?: string;
  headerAction?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: "9px", fontWeight: 800, color: "#efe6da", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
        {countLabel ? (
          <span
            style={{
              borderRadius: "999px",
              padding: "2px 6px",
              fontSize: "8px",
              fontWeight: 800,
              color: "#e9d9c4",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {countLabel}
          </span>
        ) : null}
      </div>
      {headerAction}
    </div>
  );
}

export function ActionButton({
  selected,
  muted = false,
  ready = false,
  resourceProgress = 0,
  onClick,
  label,
  note,
  description,
  detailLines = [],
  icon,
  iconHint,
  badge,
}: {
  selected: boolean;
  muted?: boolean;
  ready?: boolean;
  resourceProgress?: number;
  onClick: () => void;
  label: string;
  note: string;
  description?: string;
  detailLines?: string[];
  icon?: string;
  iconHint?: string;
  badge?: string;
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const visual = getActionVisual(label, iconHint);
  const progress = Math.max(0, Math.min(1, resourceProgress));
  const showProgressRing = progress > 0 && progress < 1 && !ready;
  const popupStyle = useAnchoredPopup({
    open: popupOpen,
    triggerRef,
    popupRef,
    placement: "vertical",
    verticalPreference: "above",
    preferredWidth: 230,
    gap: 10,
    viewportPadding: 10,
    zIndex: 25,
  });

  return (
    <div style={{ position: "relative", display: "grid", justifyItems: "center", alignItems: "center" }}>
      {showProgressRing ? (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-3px",
            borderRadius: "999px",
            background: `conic-gradient(rgba(255,193,122,0.94) 0deg, rgba(255,193,122,0.94) ${progress * 360}deg, rgba(255,255,255,0.08) ${progress * 360}deg, rgba(255,255,255,0.08) 360deg)`,
            boxShadow: "0 0 12px rgba(255,171,97,0.16)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Select ${label}`}
        onClick={onClick}
        onMouseEnter={() => setPopupOpen(true)}
        onMouseLeave={() => setPopupOpen(false)}
        onFocus={() => setPopupOpen(true)}
        onBlur={() => setPopupOpen(false)}
        className={ready && !muted ? "combat-action-ready-pulse" : undefined}
        style={{
          width: "34px",
          height: "34px",
          minWidth: 0,
          borderRadius: "999px",
          border: selected ? "1px solid rgba(255,171,97,0.68)" : `1px solid ${visual.ring}`,
          background: selected ? "linear-gradient(180deg, rgba(207,106,50,0.24), rgba(207,106,50,0.12))" : visual.buttonBackground,
          color: muted ? "rgba(255,248,237,0.56)" : "#fff8ed",
          cursor: "pointer",
          padding: "0",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          boxShadow: selected
            ? "0 10px 22px rgba(207,106,50,0.18)"
            : ready && !muted
              ? "0 0 0 1px rgba(255,194,115,0.18), 0 10px 24px rgba(255,159,98,0.12)"
              : "none",
          fontSize: "15px",
          lineHeight: 1,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span aria-hidden="true">{icon ?? "\u2022"}</span>
        {badge ? (
          <span
            style={{
              position: "absolute",
              right: "-1px",
              bottom: "-1px",
              minWidth: "15px",
              height: "15px",
              padding: "0 3px",
              borderRadius: "999px",
              display: "grid",
              placeItems: "center",
              background: muted ? "rgba(102,87,73,0.94)" : "linear-gradient(180deg, rgba(255,193,122,0.96), rgba(214,129,63,0.96))",
              border: muted ? "1px solid rgba(196,175,155,0.26)" : "1px solid rgba(255,232,201,0.48)",
              color: muted ? "#e3d3c3" : "#2b1308",
              fontSize: "8px",
              fontWeight: 900,
              boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>
      {popupOpen ? (
        <ActionButtonPopup
          ref={popupRef}
          popupStyle={popupStyle}
          visual={visual}
          label={label}
          badge={badge}
          icon={icon}
          description={description}
          detailLines={detailLines}
          note={note}
        />
      ) : null}
    </div>
  );
}

const ActionButtonPopup = forwardRef<HTMLDivElement, {
  popupStyle: CSSProperties | null;
  visual: ActionVisual;
  label: string;
  badge?: string;
  icon?: string;
  description?: string;
  detailLines: string[];
  note: string;
}>(function ActionButtonPopup({ popupStyle, visual, label, badge, icon, description, detailLines, note }, ref) {
  return (
    <div
      ref={ref}
      style={{
        ...(popupStyle ?? {
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "230px",
          zIndex: 25,
          pointerEvents: "none",
        }),
        borderRadius: "16px",
        border: `1px solid ${visual.ring}`,
        background: "rgba(18,16,15,0.98)",
        boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
        padding: "11px",
        display: "grid",
        gap: "9px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff4e7", lineHeight: 1.15 }}>{label}</div>
        {badge ? (
          <div
            style={{
              borderRadius: "999px",
              padding: "5px 8px",
              background: "linear-gradient(180deg, rgba(255,200,132,0.22), rgba(214,129,63,0.12))",
              border: "1px solid rgba(255,200,132,0.36)",
              color: "#ffd9b1",
              fontSize: "10px",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            Cost {badge}
          </div>
        ) : null}
      </div>
      <div
        style={{
          minHeight: "112px",
          borderRadius: "14px",
          border: `1px solid ${visual.ring}`,
          background: visual.cardBackground,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "12px",
            borderRadius: "999px",
            background: visual.halo,
            filter: "blur(8px)",
            opacity: 0.85,
          }}
        />
        <div style={{ position: "relative", fontSize: "42px", lineHeight: 1 }}>{icon ?? "\u2022"}</div>
      </div>
      {description ? <div style={{ fontSize: "10px", lineHeight: 1.35, color: "#d7cbbc" }}>{description}</div> : null}
      {detailLines.length > 0 ? <ActionButtonDetailList label={label} detailLines={detailLines} /> : null}
      <div style={{ fontSize: "9px", color: "#c4b8aa" }}>{note}</div>
    </div>
  );
});

function ActionButtonDetailList({
  label,
  detailLines,
}: {
  label: string;
  detailLines: string[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "4px",
        borderRadius: "12px",
        padding: "8px 9px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {detailLines.map((line) => (
        <ActionButtonDetailRow key={`${label}-${line}`} line={line} />
      ))}
    </div>
  );
}

function ActionButtonDetailRow({ line }: { line: string }) {
  const detail = splitDetailLine(line);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "54px minmax(0, 1fr)",
        gap: "7px",
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: "7px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "#d3bfab",
          opacity: 0.82,
          fontWeight: 800,
          paddingTop: "2px",
        }}
      >
        {detail.label}
      </div>
      <div style={{ fontSize: "8px", color: "#f4e8d9", lineHeight: 1.28, fontWeight: 700 }}>{detail.value}</div>
    </div>
  );
}

function ActionSlotPlaceholder() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "32px",
        height: "32px",
        justifySelf: "center",
        borderRadius: "999px",
        border: "1px dashed rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    />
  );
}
