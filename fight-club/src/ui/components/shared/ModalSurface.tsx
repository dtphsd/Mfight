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
  background: "rgb(14,14,18)",
  boxShadow: "0 22px 44px rgba(0,0,0,0.48)",
};

export function ModalSurface({ children, style }: ModalSurfaceProps) {
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
