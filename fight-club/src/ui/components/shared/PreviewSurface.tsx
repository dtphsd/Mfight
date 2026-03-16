import type { CSSProperties, ReactNode } from "react";

interface PreviewSurfaceProps {
  children: ReactNode;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgb(17,15,13)",
  boxShadow: "0 24px 40px rgba(0,0,0,0.5)",
  padding: "8px",
  opacity: 1,
};

export function PreviewSurface({ children, style }: PreviewSurfaceProps) {
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
