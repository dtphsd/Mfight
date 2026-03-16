import { useRef, type CSSProperties } from "react";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import { ItemPreviewPopover } from "@/ui/components/shared/ItemPreviewPopover";
import { useAnchoredPopup } from "@/ui/hooks/useAnchoredPopup";
import {
  formatEquipmentSlotLabel,
  renderEquipmentSlotIcon,
  shortenItemName,
} from "./combatSilhouetteHelpers";

const equipmentSlotPositions: Record<EquipmentSlot, CSSProperties> = {
  helmet: { top: 8, left: 86 },
  earring: { top: 34, left: 166 },
  bracers: { top: 44, left: 4 },
  mainHand: { top: 96, left: 4 },
  armor: { top: 148, left: 4 },
  shirt: { top: 200, left: 4 },
  gloves: { top: 252, left: 4 },
  belt: { top: 304, left: 4 },
  offHand: { top: 96, left: 166 },
  ring2: { top: 148, left: 166 },
  ring: { top: 200, left: 166 },
  pants: { top: 252, left: 166 },
  boots: { top: 304, left: 166 },
};

export function SilhouetteEquipmentLayer({
  equipmentSlots,
  hoveredEquipmentSlot,
  onHoverSlot,
  onEquipmentSlotClick,
}: {
  equipmentSlots: Array<{ slot: EquipmentSlot; item: Item | null }>;
  hoveredEquipmentSlot: EquipmentSlot | null;
  onHoverSlot: (slot: EquipmentSlot | null | ((current: EquipmentSlot | null) => EquipmentSlot | null)) => void;
  onEquipmentSlotClick?: (slot: EquipmentSlot) => void;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {equipmentSlots.map(({ slot, item }) => (
        <EquipmentSlotButton
          key={slot}
          slot={slot}
          item={item}
          hovered={hoveredEquipmentSlot === slot}
          onMouseEnter={() => onHoverSlot(slot)}
          onMouseLeave={() => onHoverSlot((current) => (current === slot ? null : current))}
          onClick={() => onEquipmentSlotClick?.(slot)}
        />
      ))}
    </div>
  );
}

function EquipmentSlotButton({
  slot,
  item,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  slot: EquipmentSlot;
  item: Item | null;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const equipped = Boolean(item);
  const itemName = item?.name ?? null;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useAnchoredPopup({
    open: hovered && Boolean(item),
    triggerRef: buttonRef,
    popupRef,
    placement: "vertical",
    preferredWidth: 320,
    gap: 8,
    viewportPadding: 12,
    zIndex: 30,
  });

  return (
    <div
      style={{
        position: "absolute",
        ...equipmentSlotPositions[slot],
        zIndex: hovered ? 4 : 2,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        style={{
          width: "49px",
          minHeight: "34px",
          borderRadius: "14px",
          border: hovered
            ? "1px solid rgba(255,211,141,0.72)"
            : equipped
              ? "1px solid rgba(255,171,97,0.5)"
              : "1px solid rgba(255,255,255,0.16)",
          background: hovered
            ? "linear-gradient(180deg, rgba(255,210,140,0.16), rgba(255,255,255,0.08))"
            : equipped
              ? "linear-gradient(180deg, rgba(207,106,50,0.24), rgba(255,255,255,0.05))"
              : "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
          color: "#fff8ed",
          cursor: "pointer",
          padding: "3px 4px",
          textAlign: "center",
          boxShadow: hovered
            ? "0 0 20px rgba(255,211,141,0.2)"
            : equipped
              ? "0 0 18px rgba(207,106,50,0.18)"
              : "0 0 0 transparent",
          transition: "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          opacity: hovered ? 1 : 0.52,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: hovered
                ? "rgba(255,217,166,0.22)"
                : equipped
                  ? "rgba(207,106,50,0.22)"
                  : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {renderEquipmentSlotIcon(slot, 18)}
          </span>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: hovered ? "#ffd38d" : equipped ? "#ff9d57" : "rgba(255,255,255,0.18)",
              boxShadow: hovered ? "0 0 10px rgba(255,211,141,0.55)" : "none",
            }}
          />
        </div>
        <div style={{ marginTop: "2px", fontSize: "6px", textTransform: "uppercase", opacity: 0.62, letterSpacing: "0.08em" }}>
          {formatEquipmentSlotLabel(slot)}
        </div>
        <div style={{ marginTop: "1px", fontSize: "6px", fontWeight: 700, lineHeight: 1.05 }}>
          {itemName ? shortenItemName(itemName) : "Empty"}
        </div>
      </button>
      {hovered && item ? <EquipmentItemPopover popupRef={popupRef} slot={slot} item={item} style={popupStyle} /> : null}
    </div>
  );
}

function EquipmentItemPopover({
  slot,
  item,
  style,
  popupRef,
}: {
  slot: EquipmentSlot;
  item: Item;
  style: CSSProperties | null;
  popupRef: React.RefObject<HTMLDivElement | null>;
}) {
  const previewEntry = { item, quantity: 1 as const };

  return (
    <ItemPreviewPopover
      entry={previewEntry}
      popupRef={popupRef}
      style={style}
      fallbackWidth="min(320px, calc(100vw - 24px))"
      label={`Equipped ${formatEquipmentSlotLabel(slot)}`}
      tagLabel="Equipped"
    />
  );
}
