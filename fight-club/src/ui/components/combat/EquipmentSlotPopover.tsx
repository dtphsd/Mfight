import type { EquipmentSlot } from "@/modules/equipment";
import type { InventoryEntry } from "@/modules/inventory";
import { ItemHoverPreview } from "@/ui/components/combat/ItemHoverPreview";
import { ItemPresentationCard } from "@/ui/components/combat/ItemPresentationCard";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";

interface EquipmentSlotPopoverProps {
  slot: EquipmentSlot;
  entries: InventoryEntry[];
  equippedItemCode: string | null;
  onEquip: (itemCode: string) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onClose: () => void;
}

const slotToneBySlot: Record<EquipmentSlot, { icon: string; tint: string; border: string; text: string }> = {
  mainHand: { icon: "⚔", tint: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.34)", text: "#f0a286" },
  offHand: { icon: "🛡", tint: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.34)", text: "#b7d5ff" },
  helmet: { icon: "🪖", tint: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.34)", text: "#ebcf8b" },
  armor: { icon: "🦺", tint: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.34)", text: "#f2c3a7" },
  gloves: { icon: "🧤", tint: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.34)", text: "#87e2cf" },
  accessory: { icon: "💍", tint: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.34)", text: "#ccc0ff" },
  boots: { icon: "🥾", tint: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.34)", text: "#b8cbff" },
};

export function EquipmentSlotPopover({
  slot,
  entries,
  equippedItemCode,
  onEquip,
  onUnequip,
  onClose,
}: EquipmentSlotPopoverProps) {
  const slotTone = slotToneBySlot[slot];

  return (
    <ModalOverlay
      onClose={onClose}
      closeLabel="Close equipment popover"
      zIndex={20}
      position="absolute"
      placeItems="start center"
      padding="18px"
      backdrop="rgba(7, 8, 12, 0.62)"
    >
      <ModalSurface
        style={{
          width: "min(540px, 100%)",
          maxHeight: "min(640px, calc(100vh - 140px))",
          display: "grid",
          gridTemplateRows: "auto auto minmax(0, 1fr)",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: "10px",
            background: "linear-gradient(180deg, rgba(62,128,199,0.14), rgba(255,255,255,0.02))",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    background: slotTone.tint,
                    border: `1px solid ${slotTone.border}`,
                    fontSize: "18px",
                  }}
                >
                  {slotTone.icon}
                </div>
                <div style={{ display: "grid", gap: "2px" }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.08em", color: slotTone.text }}>
                    {formatEquipmentSlot(slot)}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#eef7ff", lineHeight: 1.05 }}>Equip Item</div>
                </div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    border: `1px solid ${slotTone.border}`,
                    background: equippedItemCode ? slotTone.tint : "rgba(255,255,255,0.04)",
                    color: equippedItemCode ? slotTone.text : "#d7d0c6",
                  }}
                >
                  {equippedItemCode ? "Occupied" : "Empty"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#c7d9ea", lineHeight: 1.35 }}>
                Choose a compatible item for this slot.
              </div>
            </div>
            <ActionButton type="button" onClick={onClose} tone="secondary" style={{ padding: "6px 10px", fontSize: "11px" }}>
              Close
            </ActionButton>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "10px", color: "#c7d9ea", opacity: 0.82 }}>
              Browse compatible items and swap gear directly from this slot.
            </div>
            <span
              style={{
                borderRadius: "999px",
                padding: "4px 8px",
                fontSize: "9px",
                fontWeight: 800,
                color: slotTone.text,
                background: slotTone.tint,
                border: `1px solid ${slotTone.border}`,
              }}
            >
              {entries.length} options
            </span>
          </div>
        </div>

        {equippedItemCode ? (
          <ActionButton
            type="button"
            onClick={() => onUnequip(slot)}
            tone="secondary"
            style={{ width: "calc(100% - 32px)", margin: "12px 16px 0", fontSize: "12px" }}
          >
            Unequip current item
          </ActionButton>
        ) : null}

        <div style={{ display: "grid", gap: "10px", maxHeight: "480px", overflowY: "auto", padding: "12px 16px 16px", paddingRight: "12px" }}>
          {entries.length === 0 ? (
            <div style={{ opacity: 0.64, fontSize: "12px" }}>No compatible items for this slot.</div>
          ) : (
            entries.map((entry, index) => (
              <ItemHoverPreview
                key={`${entry.item.code}-${index}`}
                entry={entry}
                label={`${formatEquipmentSlot(slot)} Candidate`}
              >
                <ItemPresentationCard
                  entry={entry}
                  footer={
                    <ActionButton
                      type="button"
                      aria-label={`Equip ${entry.item.name}`}
                      onClick={() => onEquip(entry.item.code)}
                      tone={equippedItemCode === entry.item.code ? "secondary" : "primary"}
                      style={{
                        width: "100%",
                        fontSize: "12px",
                        border: equippedItemCode === entry.item.code ? `1px solid ${slotTone.border}` : "none",
                        background: equippedItemCode === entry.item.code ? slotTone.tint : undefined,
                        color: equippedItemCode === entry.item.code ? slotTone.text : undefined,
                      }}
                    >
                      {equippedItemCode === entry.item.code ? "Equipped" : "Equip"}
                    </ActionButton>
                  }
                />
              </ItemHoverPreview>
            ))
          )}
        </div>
      </ModalSurface>
    </ModalOverlay>
  );
}

function formatEquipmentSlot(slot: EquipmentSlot) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "accessory":
      return "Accessory";
  }
}
