import type { CSSProperties, ReactNode } from "react";

interface PanelCardProps {
  children: ReactNode;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  borderRadius: "16px",
  padding: "12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

export function PanelCard({ children, style }: PanelCardProps) {
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
