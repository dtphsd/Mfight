import type { CSSProperties, ReactNode } from "react";

interface ModalSurfaceProps {
  children: ReactNode;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  position: "relative",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(180deg, rgba(18,18,24,0.98), rgba(12,12,18,0.98)), radial-gradient(circle at top, rgba(120,189,255,0.08), transparent 32%)",
  boxShadow: "0 22px 44px rgba(0,0,0,0.38)",
};

export function ModalSurface({ children, style }: ModalSurfaceProps) {
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
