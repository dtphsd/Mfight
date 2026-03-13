import type { CSSProperties, ReactNode } from "react";

interface ModalOverlayProps {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
  zIndex?: number;
  position?: "fixed" | "absolute";
  placeItems?: CSSProperties["placeItems"];
  padding?: CSSProperties["padding"];
  backdrop?: CSSProperties["background"];
}

export function ModalOverlay({
  children,
  onClose,
  closeLabel,
  zIndex = 40,
  position = "fixed",
  placeItems = "center",
  padding = "22px",
  backdrop = "rgba(7, 8, 12, 0.72)",
}: ModalOverlayProps) {
  return (
    <div
      style={{
        position,
        inset: 0,
        zIndex,
        display: "grid",
        placeItems,
        padding,
      }}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: backdrop,
          cursor: "pointer",
        }}
      />
      {children}
    </div>
  );
}
