import type { CSSProperties } from "react";
import { getEquipmentSlotForItem, type EquipmentSlot } from "@/modules/equipment";
import type { InventoryEntry } from "@/modules/inventory";
import { ItemHoverPreview } from "@/ui/components/combat/ItemHoverPreview";
import { ItemPresentationCard } from "@/ui/components/combat/ItemPresentationCard";

interface InventoryPopoverProps {
  entries: InventoryEntry[];
  slotsUsed: number;
  slotsMax: number;
  equippedItems: Array<{ slot: EquipmentSlot; item: InventoryEntry["item"] | null }>;
  onEquip: (itemCode: string) => void;
  onClose: () => void;
}

const surfaceStyle: CSSProperties = {
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.12)",
  background:
    "linear-gradient(180deg, rgba(18,18,24,0.98), rgba(12,12,18,0.98)), radial-gradient(circle at top, rgba(120,189,255,0.08), transparent 32%)",
  boxShadow: "0 22px 44px rgba(0,0,0,0.38)",
};

const primaryButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "none",
  background: "#cf6a32",
  color: "#fff8ed",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff8ed",
  cursor: "pointer",
};

const slotToneBySlot: Record<EquipmentSlot, { icon: string; tint: string; border: string; text: string }> = {
  mainHand: { icon: "⚔", tint: "rgba(229,115,79,0.16)", border: "rgba(229,115,79,0.34)", text: "#f0a286" },
  offHand: { icon: "🛡", tint: "rgba(92,149,227,0.16)", border: "rgba(92,149,227,0.34)", text: "#b7d5ff" },
  helmet: { icon: "🪖", tint: "rgba(214,177,95,0.16)", border: "rgba(214,177,95,0.34)", text: "#ebcf8b" },
  armor: { icon: "🦺", tint: "rgba(176,126,96,0.16)", border: "rgba(176,126,96,0.34)", text: "#f2c3a7" },
  gloves: { icon: "🧤", tint: "rgba(92,199,178,0.16)", border: "rgba(92,199,178,0.34)", text: "#87e2cf" },
  accessory: { icon: "💍", tint: "rgba(130,111,213,0.16)", border: "rgba(130,111,213,0.34)", text: "#ccc0ff" },
  boots: { icon: "🥾", tint: "rgba(115,149,230,0.16)", border: "rgba(115,149,230,0.34)", text: "#b8cbff" },
};

export function InventoryPopover({
  entries,
  slotsUsed,
  slotsMax,
  equippedItems,
  onEquip,
  onClose,
}: InventoryPopoverProps) {
  const equippedCodes = new Set(equippedItems.map((entry) => entry.item?.code).filter((code): code is string => Boolean(code)));
  const equippedCount = equippedCodes.size;
  const equippableCount = entries.filter((entry) => getEquipmentSlotForItem(entry.item)).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        padding: "22px",
      }}
    >
      <button
        type="button"
        aria-label="Close inventory popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.72)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          ...surfaceStyle,
          position: "relative",
          width: "min(1180px, 100%)",
          maxHeight: "min(820px, calc(100vh - 44px))",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          overflow: "hidden",
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
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b9e0ff" }}>
                Inventory
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#eef7ff", lineHeight: 1.05 }}>Loadout Storage</div>
              <div style={{ fontSize: "11px", lineHeight: 1.35, color: "#c7d9ea" }}>
                Browse current items and equip compatible gear directly from the list.
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ ...secondaryButtonStyle, padding: "6px 10px", fontSize: "11px" }}>
              Close
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "6px" }}>
            <SummaryPill label="Slots" value={`${slotsUsed} / ${slotsMax}`} />
            <SummaryPill label="Items" value={String(entries.length)} />
            <SummaryPill label="Equippable" value={String(equippableCount)} />
            <SummaryPill label="Equipped" value={String(equippedCount)} />
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#c7d9ea", opacity: 0.78 }}>
              Stored Gear
            </div>
            <div style={{ fontSize: "10px", color: "#aabfce", opacity: 0.82 }}>
              Click any compatible item to equip it directly.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
            {entries.map((entry, index) => {
              const slot = getEquipmentSlotForItem(entry.item);
              const equipped = equippedCodes.has(entry.item.code);
              const occupiedBy = slot ? equippedItems.find((equippedEntry) => equippedEntry.slot === slot)?.item : null;
              const slotTone = slot ? slotToneBySlot[slot] : null;

              return (
                <ItemHoverPreview
                  key={`${entry.item.code}-${index}`}
                  entry={entry}
                  label={slot ? `${formatSlot(slot)} Item` : "Stored Item"}
                >
                  <ItemPresentationCard
                    entry={entry}
                    compact
                    footer={
                      <div style={{ display: "grid", gap: "6px" }}>
                        {slot ? (
                          <div
                            style={{
                              display: "grid",
                              gap: "6px",
                              borderRadius: "14px",
                              padding: "8px 10px",
                              background: slotTone?.tint,
                              border: `1px solid ${slotTone?.border}`,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "16px", lineHeight: 1 }}>{slotTone?.icon}</span>
                                <div style={{ display: "grid", gap: "1px" }}>
                                  <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.68 }}>Slot</div>
                                  <div style={{ fontSize: "11px", fontWeight: 800, color: slotTone?.text }}>{formatSlot(slot)}</div>
                                </div>
                              </div>
                              <span
                                style={{
                                  borderRadius: "999px",
                                  padding: "3px 7px",
                                  fontSize: "9px",
                                  background: equipped ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                }}
                              >
                                {equipped ? "Equipped" : "Available"}
                              </span>
                            </div>
                            {occupiedBy && !equipped ? (
                              <div style={{ fontSize: "10px", color: "#d8e3eb", lineHeight: 1.3 }}>
                                Current: <strong>{occupiedBy.name}</strong>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div style={{ fontSize: "10px", color: "#a8b7c3", lineHeight: 1.3 }}>
                            Stored item. Not equippable.
                          </div>
                        )}
                        {slot ? (
                          <button
                            type="button"
                            aria-label={`Equip ${entry.item.name}`}
                            onClick={() => onEquip(entry.item.code)}
                            style={{
                              ...(equipped ? secondaryButtonStyle : primaryButtonStyle),
                              width: "100%",
                              fontSize: "11px",
                              padding: "7px 10px",
                              border: equipped ? `1px solid ${slotTone?.border}` : "none",
                              background: equipped ? slotTone?.tint : primaryButtonStyle.background,
                              color: equipped ? slotTone?.text : primaryButtonStyle.color,
                            }}
                          >
                            {equipped ? "Equipped" : occupiedBy ? `Equip to ${formatSlot(slot)}` : "Equip"}
                          </button>
                        ) : null}
                      </div>
                    }
                  />
                </ItemHoverPreview>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "8px 10px",
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        gap: "2px",
      }}
    >
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.68 }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: 800, color: "#eef7ff" }}>{value}</div>
    </div>
  );
}

function formatSlot(slot: EquipmentSlot) {
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
