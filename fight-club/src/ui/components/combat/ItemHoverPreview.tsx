import { useRef, useState, type ReactNode } from "react";
import type { InventoryEntry } from "@/modules/inventory";
import { ItemPreviewPopover } from "@/ui/components/shared/ItemPreviewPopover";
import { useAnchoredPopup } from "@/ui/hooks/useAnchoredPopup";

interface ItemHoverPreviewProps {
  entry: InventoryEntry;
  label?: string;
  children: ReactNode;
}

export function ItemHoverPreview({ entry, label, children }: ItemHoverPreviewProps) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const popupStyle = useAnchoredPopup({
    open: hovered,
    triggerRef,
    popupRef,
    placement: "horizontal",
    preferredWidth: 340,
    gap: 10,
    viewportPadding: 12,
    zIndex: 50,
  });

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      {children}
      {hovered ? (
        <ItemPreviewPopover
          entry={entry}
          popupRef={popupRef}
          style={popupStyle}
          fallbackWidth="min(340px, calc(100vw - 24px))"
          label={label}
          tagLabel="Preview"
        />
      ) : null}
    </div>
  );
}
