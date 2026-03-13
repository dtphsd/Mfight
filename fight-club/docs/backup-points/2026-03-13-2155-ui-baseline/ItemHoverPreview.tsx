import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { InventoryEntry } from "@/modules/inventory";
import { ItemPresentationCard } from "@/ui/components/combat/ItemPresentationCard";

interface ItemHoverPreviewProps {
  entry: InventoryEntry;
  label?: string;
  children: ReactNode;
}

export function ItemHoverPreview({ entry, label, children }: ItemHoverPreviewProps) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!hovered || !triggerRef.current || !popupRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !popupRef.current) {
        return;
      }

      const viewportPadding = 12;
      const gap = 10;
      const preferredWidth = Math.min(340, window.innerWidth - viewportPadding * 2);
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const popupWidth = Math.min(preferredWidth, popupRect.width || preferredWidth);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const hasRoomRight = viewportWidth - triggerRect.right >= popupWidth + gap;
      const hasRoomLeft = triggerRect.left >= popupWidth + gap;

      let left = triggerRect.right + gap;
      if (!hasRoomRight && hasRoomLeft) {
        left = triggerRect.left - popupWidth - gap;
      } else if (!hasRoomRight) {
        left = Math.max(viewportPadding, viewportWidth - popupWidth - viewportPadding);
      }

      const desiredTop = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
      const top = Math.max(viewportPadding, Math.min(desiredTop, viewportHeight - popupRect.height - viewportPadding));

      setPopupStyle({
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${popupWidth}px`,
        zIndex: 50,
        pointerEvents: "none",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [hovered]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      {children}
      {hovered ? (
        <div
          ref={popupRef}
          style={
            popupStyle ?? {
              position: "fixed",
              left: "12px",
              top: "12px",
              width: "min(340px, calc(100vw - 24px))",
              zIndex: 50,
              pointerEvents: "none",
            }
          }
        >
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(25,22,27,0.98), rgba(14,13,18,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
              boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
              padding: "8px",
            }}
          >
            <div style={{ display: "grid", gap: "8px" }}>
              {label ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "center",
                    padding: "2px 4px 0",
                  }}
                >
                  <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,233,205,0.72)" }}>
                    {label}
                  </div>
                  <span
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "9px",
                      color: "#e8dbc9",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Preview
                  </span>
                </div>
              ) : null}
              <ItemPresentationCard entry={entry} compact showQuantityTag={false} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
