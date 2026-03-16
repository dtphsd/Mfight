import type { CSSProperties } from "react";

export function ResourceGrid({
  panelStyle,
  resources,
  compact = false,
  layout = "grid",
  showHeader = true,
}: {
  panelStyle: CSSProperties;
  resources: { rage: number; guard: number; momentum: number; focus: number } | null;
  compact?: boolean;
  layout?: "grid" | "row";
  showHeader?: boolean;
}) {
  const items = [
    { key: "rage", label: "Rage", short: "R", icon: "\u2666", color: "#ee9abb" },
    { key: "guard", label: "Guard", short: "G", icon: "\u25a0", color: "#b7d5ff" },
    { key: "momentum", label: "Momentum", short: "M", icon: "\u27a4", color: "#f0a286" },
    { key: "focus", label: "Focus", short: "F", icon: "\u25cc", color: "#87e2cf" },
  ] as const;

  return (
    <div
      style={{
        ...panelStyle,
        padding: layout === "row" ? "6px 8px" : compact ? "8px" : "9px 10px",
        display: "grid",
        gap: layout === "row" ? "5px" : "7px",
      }}
    >
      {showHeader ? (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.68 }}>
            {compact ? "Resource" : "Resource Gain"}
          </div>
          <div
            style={{
              borderRadius: "999px",
              padding: "2px 6px",
              fontSize: "8px",
              fontWeight: 700,
              background: "rgba(255,255,255,0.06)",
              color: "#e7d9c8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {(resources?.rage ?? 0) + (resources?.guard ?? 0) + (resources?.momentum ?? 0) + (resources?.focus ?? 0)} stored
          </div>
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            layout === "row" ? "repeat(4, minmax(0, 1fr))" : compact ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
          gap: layout === "row" ? "4px" : compact ? "6px" : "5px",
        }}
      >
        {items.map((item) => {
          const value = resources?.[item.key] ?? 0;
          const progress = Math.min(1, value / 6);

          return (
            <div
              key={item.key}
              className={
                value > 0
                  ? `combat-resource-card combat-resource-card--charged combat-resource-card--${item.key}`
                  : `combat-resource-card combat-resource-card--${item.key}`
              }
              style={{
                borderRadius: "12px",
                padding: layout === "row" ? "5px 4px" : compact ? "6px 5px" : "7px 6px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                display: "grid",
                gap: layout === "row" ? "4px" : "6px",
              }}
              title={`${item.label}: ${value}`}
            >
              <div
                style={{
                  width: layout === "row" ? "24px" : compact ? "28px" : "32px",
                  height: layout === "row" ? "24px" : compact ? "28px" : "32px",
                  margin: "0 auto",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: `conic-gradient(${item.color} ${Math.max(progress * 360, value > 0 ? 30 : 0)}deg, rgba(255,255,255,0.08) 0deg)`,
                  boxShadow: value > 0 ? `0 0 14px ${item.color}22` : "none",
                }}
              >
                <div
                  style={{
                    width: layout === "row" ? "16px" : compact ? "20px" : "24px",
                    height: layout === "row" ? "16px" : compact ? "20px" : "24px",
                    borderRadius: "999px",
                    background: "rgba(18,16,15,0.94)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    placeItems: "center",
                    color: item.color,
                    fontSize: layout === "row" ? "8px" : compact ? "10px" : "11px",
                    fontWeight: 900,
                    lineHeight: 1,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: layout === "row" ? "7px" : compact ? "9px" : "10px",
                      opacity: 0.28,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ position: "relative", zIndex: 1 }}>{item.short}</span>
                </div>
              </div>
              <div style={{ fontSize: layout === "row" ? "11px" : compact ? "12px" : "13px", fontWeight: 800 }}>{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
