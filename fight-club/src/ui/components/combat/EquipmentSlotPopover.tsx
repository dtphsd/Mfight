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
  mainHand: { icon: "W", tint: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.34)", text: "#f0a286" },
  offHand: { icon: "O", tint: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.34)", text: "#b7d5ff" },
  helmet: { icon: "H", tint: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.34)", text: "#ebcf8b" },
  shirt: { icon: "S", tint: "rgba(196,164,112,0.14)", border: "rgba(196,164,112,0.34)", text: "#e9d1a2" },
  armor: { icon: "A", tint: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.34)", text: "#f2c3a7" },
  bracers: { icon: "B", tint: "rgba(80,176,160,0.16)", border: "rgba(80,176,160,0.34)", text: "#9ee8d8" },
  belt: { icon: "T", tint: "rgba(160,116,74,0.16)", border: "rgba(160,116,74,0.34)", text: "#e3bf9a" },
  pants: { icon: "P", tint: "rgba(94,123,180,0.16)", border: "rgba(94,123,180,0.34)", text: "#c7d8ff" },
  boots: { icon: "F", tint: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.34)", text: "#b8cbff" },
  gloves: { icon: "G", tint: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.34)", text: "#87e2cf" },
  ring: { icon: "R", tint: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.34)", text: "#ccc0ff" },
  ring2: { icon: "R", tint: "rgba(154,128,226,0.16)", border: "rgba(154,128,226,0.34)", text: "#ddd1ff" },
  earring: { icon: "E", tint: "rgba(120,168,255,0.16)", border: "rgba(120,168,255,0.34)", text: "#cfe2ff" },
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
      backdrop="rgba(7, 8, 12, 0.84)"
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
            background: "linear-gradient(180deg, rgb(31,51,72), rgb(18,22,30))",
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
                    fontWeight: 800,
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
                    background: equippedItemCode ? slotTone.tint : "rgb(35,38,45)",
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
    case "shirt":
      return "Shirt";
    case "armor":
      return "Armor";
    case "bracers":
      return "Bracers";
    case "belt":
      return "Belt";
    case "pants":
      return "Pants";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "ring":
      return "Ring";
    case "ring2":
      return "Ring II";
    case "earring":
      return "Earring";
  }
}
