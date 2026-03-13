import type { CSSProperties, ReactNode, RefObject } from "react";
import type { InventoryEntry } from "@/modules/inventory";
import { ItemPresentationCard } from "@/ui/components/combat/ItemPresentationCard";
import { PreviewSurface } from "@/ui/components/shared/PreviewSurface";
import { PreviewTag } from "@/ui/components/shared/PreviewTag";

interface ItemPreviewPopoverProps {
  entry: InventoryEntry;
  popupRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties | null;
  label?: string;
  tagLabel: string;
  fallbackWidth: string;
  childrenAboveCard?: ReactNode;
}

export function ItemPreviewPopover({
  entry,
  popupRef,
  style,
  label,
  tagLabel,
  fallbackWidth,
  childrenAboveCard,
}: ItemPreviewPopoverProps) {
  return (
    <div
      ref={popupRef}
      style={{
        ...(style ?? {
          position: "fixed",
          left: "12px",
          top: "12px",
          width: fallbackWidth,
          zIndex: 30,
          pointerEvents: "none",
        }),
      }}
    >
      <PreviewSurface>
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
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,233,205,0.72)",
                }}
              >
                {label}
              </div>
              <PreviewTag label={tagLabel} />
            </div>
          ) : null}
          {childrenAboveCard}
          <ItemPresentationCard entry={entry} compact showQuantityTag={false} />
        </div>
      </PreviewSurface>
    </div>
  );
}
