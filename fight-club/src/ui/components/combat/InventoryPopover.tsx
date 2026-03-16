import { getEquipmentSlotForItem, type EquipmentSlot } from "@/modules/equipment";
import type { InventoryEntry, Item } from "@/modules/inventory";
import { ItemHoverPreview } from "@/ui/components/combat/ItemHoverPreview";
import { ActionButton } from "@/ui/components/shared/ActionButton";
import { ModalOverlay } from "@/ui/components/shared/ModalOverlay";
import { ModalSurface } from "@/ui/components/shared/ModalSurface";
import { PanelCard } from "@/ui/components/shared/PanelCard";
import {
  createPaperDollPlaceholderItem,
  formatSlot,
  InventoryGlyph,
  PaperDollFigure,
} from "./inventoryPopoverHelpers";

interface InventoryPopoverProps {
  entries: InventoryEntry[];
  slotsUsed: number;
  slotsMax: number;
  equippedItems: Array<{ slot: EquipmentSlot; item: InventoryEntry["item"] | null }>;
  onEquip: (itemCode: string) => void;
  onClose: () => void;
}

const rarityToneByRarity: Record<Item["rarity"], { border: string; glow: string; text: string }> = {
  common: {
    border: "rgba(171, 188, 202, 0.36)",
    glow: "rgba(171, 188, 202, 0.14)",
    text: "#dbe7f0",
  },
  rare: {
    border: "rgba(101, 162, 255, 0.58)",
    glow: "rgba(101, 162, 255, 0.24)",
    text: "#bfdaff",
  },
  epic: {
    border: "rgba(184, 110, 255, 0.62)",
    glow: "rgba(184, 110, 255, 0.26)",
    text: "#dec4ff",
  },
  legendary: {
    border: "rgba(255, 192, 99, 0.68)",
    glow: "rgba(255, 192, 99, 0.28)",
    text: "#ffe0a9",
  },
};

const slotToneBySlot: Record<EquipmentSlot, { accent: string; badge: string }> = {
  mainHand: { accent: "#f0a286", badge: "Weapon" },
  offHand: { accent: "#9ac6ff", badge: "Off Hand" },
  helmet: { accent: "#ebcf8b", badge: "Helmet" },
  shirt: { accent: "#e9d1a2", badge: "Shirt" },
  armor: { accent: "#f2c3a7", badge: "Armor" },
  bracers: { accent: "#9ee8d8", badge: "Bracers" },
  belt: { accent: "#e0bd96", badge: "Belt" },
  pants: { accent: "#c6d8ff", badge: "Pants" },
  gloves: { accent: "#87e2cf", badge: "Gloves" },
  ring: { accent: "#d8ccff", badge: "Ring" },
  ring2: { accent: "#cbbcff", badge: "Ring II" },
  earring: { accent: "#d2e1ff", badge: "Earring" },
  boots: { accent: "#b8cbff", badge: "Boots" },
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
  const consumableCount = entries.filter((entry) => entry.item.type === "consumable").length;
  const materialCount = entries.filter((entry) => entry.item.type === "material").length;
  const emptySlotCount = Math.max(0, slotsMax - entries.length);

  return (
    <ModalOverlay onClose={onClose} closeLabel="Close inventory popover">
      <ModalSurface
        style={{
          width: "min(1160px, 100%)",
          maxHeight: "min(820px, calc(100vh - 44px))",
          display: "grid",
          gridTemplateRows: "minmax(0, 1fr)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "grid", gap: "12px" }}>
          <div style={{ display: "none" }}>Loadout Storage</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 320px) minmax(0, 1fr) auto",
              gap: "12px",
              alignItems: "start",
            }}
          >
            <PanelCard
              style={{
                padding: "12px",
                display: "grid",
                gap: "8px",
                background:
                  "linear-gradient(180deg, rgba(25,27,34,0.98), rgba(14,16,20,0.98)), radial-gradient(circle at top, rgba(120,182,255,0.08), transparent 28%)",
              }}
            >
              <PaperDollLayout equippedItems={equippedItems} />
            </PanelCard>

            <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                  gap: "10px",
                  alignContent: "start",
                }}
              >
                {entries.map((entry, index) => {
                  const slot = getEquipmentSlotForItem(entry.item);
                  const equipped = equippedCodes.has(entry.item.code);
                  const occupiedBy = slot ? equippedItems.find((equippedEntry) => equippedEntry.slot === slot)?.item ?? null : null;

                  return (
                    <ItemHoverPreview
                      key={`${entry.item.code}-${index}`}
                      entry={entry}
                      label={slot ? `${formatSlot(slot)} Item` : entry.item.type === "consumable" ? "Consumable" : "Stored Item"}
                    >
                      <InventorySlotTile
                        entry={entry}
                        slot={slot}
                        equipped={equipped}
                        occupiedBy={occupiedBy}
                        onEquip={onEquip}
                      />
                    </ItemHoverPreview>
                  );
                })}
                {Array.from({ length: emptySlotCount }).map((_, index) => (
                  <EmptyInventorySlot key={`empty-slot-${index}`} />
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "6px", alignContent: "start" }}>
              <SummaryPill label="Slots" value={`${slotsUsed}/${slotsMax}`} compact />
              <SummaryPill label="Items" value={String(entries.length)} compact />
              <SummaryPill label="Gear" value={String(equippableCount)} compact />
              <SummaryPill label="Use" value={String(consumableCount)} compact />
              <SummaryPill label="Mat" value={String(materialCount)} compact />
              <SummaryPill label="EQ" value={String(equippedCount)} compact />
              <ActionButton type="button" onClick={onClose} tone="secondary" style={{ padding: "6px 10px", fontSize: "11px" }}>
                Close
              </ActionButton>
            </div>
          </div>
        </div>
      </ModalSurface>
    </ModalOverlay>
  );
}

function InventorySlotTile({
  entry,
  slot,
  equipped,
  occupiedBy,
  onEquip,
}: {
  entry: InventoryEntry;
  slot: EquipmentSlot | null;
  equipped: boolean;
  occupiedBy: Item | null;
  onEquip: (itemCode: string) => void;
}) {
  const tone = rarityToneByRarity[entry.item.rarity];
  const slotTone = slot ? slotToneBySlot[slot] : null;
  const equippable = Boolean(slot);
  const iconTone = slotTone?.accent ?? tone.text;

  return (
    <button
      type="button"
      aria-label={equippable ? `Equip ${entry.item.name}` : `Inspect ${entry.item.name}`}
      onClick={() => {
        if (equippable) {
          onEquip(entry.item.code);
        }
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        border: equipped ? "2px solid rgba(255,171,97,0.78)" : `1px solid ${tone.border}`,
        background: equipped
          ? "radial-gradient(circle at top left, rgba(255,171,97,0.18), transparent 54%), linear-gradient(180deg, rgba(38,30,22,0.98), rgba(18,15,12,0.98))"
          : `radial-gradient(circle at top left, ${tone.glow}, transparent 52%), linear-gradient(180deg, rgba(29,33,40,0.98), rgba(12,14,18,0.98))`,
        boxShadow: equipped
          ? "0 0 0 1px rgba(255,171,97,0.24), 0 0 26px rgba(255,171,97,0.18), 0 14px 26px rgba(0,0,0,0.26)"
          : `0 0 18px ${tone.glow}, 0 10px 20px rgba(0,0,0,0.2)`,
        color: "#eef7ff",
        cursor: equippable ? "pointer" : "default",
        padding: "7px",
        display: "grid",
        gridTemplateRows: "1fr auto",
        alignItems: "start",
        textAlign: "left",
        transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
        overflow: "hidden",
      }}
      title={
        equippable
          ? equipped
            ? `${entry.item.name} is equipped`
            : occupiedBy
              ? `${entry.item.name} will replace ${occupiedBy.name}`
              : `Equip ${entry.item.name}`
          : entry.item.name
      }
    >
      <div style={{ display: "grid", placeItems: "center", alignSelf: "stretch" }}>
        <div
          aria-hidden="true"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            fontSize: "20px",
            fontWeight: 900,
            color: "#fff5e7",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px ${tone.glow}`,
          }}
        >
          <InventoryGlyph item={entry.item} slot={slot} color={iconTone} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "4px", alignSelf: "end" }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#f5ede3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "21px",
          }}
        >
          {entry.item.name}
        </div>
      </div>
      {entry.quantity > 1 ? (
        <div
          style={{
            position: "absolute",
            right: "6px",
            bottom: "6px",
            minWidth: "18px",
            height: "18px",
            padding: "0 5px",
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            fontSize: "8px",
            fontWeight: 900,
            background: "rgba(9,11,15,0.78)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#eef7ff",
          }}
        >
          {entry.quantity}
        </div>
      ) : null}
    </button>
  );
}

function PaperDollSlot({ slot, item }: { slot: EquipmentSlot; item: Item | null }) {
  const tone = slotToneBySlot[slot];
  const content = (
    <div
      style={{
        borderRadius: "16px",
        border: item ? "2px solid rgba(255,171,97,0.72)" : "1px solid rgba(255,255,255,0.08)",
        background: item
          ? "radial-gradient(circle at top left, rgba(255,171,97,0.16), transparent 52%), linear-gradient(180deg, rgba(38,31,24,0.98), rgba(18,15,12,0.98))"
          : "linear-gradient(180deg, rgba(26,29,37,0.92), rgba(14,16,21,0.96))",
        padding: "9px 10px",
        display: "grid",
        justifyItems: "center",
        gap: "8px",
        alignItems: "center",
        minHeight: "98px",
        boxShadow: item ? "0 0 24px rgba(255,171,97,0.14)" : "inset 0 1px 0 rgba(255,255,255,0.02)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: item
            ? "radial-gradient(circle at center, rgba(255,171,97,0.08), transparent 60%)"
            : "radial-gradient(circle at center, rgba(255,255,255,0.03), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "13px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
          display: "grid",
          placeItems: "center",
          position: "relative",
        }}
      >
        <InventoryGlyph item={item ?? createPaperDollPlaceholderItem(slot)} slot={slot} color={tone.accent} />
      </div>
      <div style={{ minWidth: 0, display: "grid", gap: "3px", justifyItems: "center", position: "relative" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            lineHeight: 1.2,
            color: item ? "#f5ede3" : "#8fa0b2",
            textAlign: "center",
            maxWidth: "12ch",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item?.name ?? "Empty slot"}
        </div>
      </div>
    </div>
  );

  if (!item) {
    return content;
  }

  return (
    <ItemHoverPreview
      entry={{ item, quantity: 1 }}
      label={`${formatSlot(slot)} Equipped`}
    >
      {content}
    </ItemHoverPreview>
  );
}

function PaperDollLayout({
  equippedItems,
}: {
  equippedItems: Array<{ slot: EquipmentSlot; item: InventoryEntry["item"] | null }>;
}) {
  const itemBySlot = new Map(equippedItems.map((entry) => [entry.slot, entry.item ?? null]));

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateAreas: `
          ". helmet ."
          "earring shirt ring"
          "mainHand armor offHand"
          "bracers belt gloves"
          "ring2 pants ."
          ". boots ."
        `,
        gap: "8px",
        alignItems: "stretch",
        padding: "8px 0 2px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "6px 18px 6px 18px",
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          opacity: 0.18,
        }}
      >
        <PaperDollFigure />
      </div>
      <div style={{ gridArea: "helmet" }}>
        <PaperDollSlot slot="helmet" item={itemBySlot.get("helmet") ?? null} />
      </div>
      <div style={{ gridArea: "earring" }}>
        <PaperDollSlot slot="earring" item={itemBySlot.get("earring") ?? null} />
      </div>
      <div style={{ gridArea: "shirt" }}>
        <PaperDollSlot slot="shirt" item={itemBySlot.get("shirt") ?? null} />
      </div>
      <div style={{ gridArea: "ring" }}>
        <PaperDollSlot slot="ring" item={itemBySlot.get("ring") ?? null} />
      </div>
      <div style={{ gridArea: "mainHand" }}>
        <PaperDollSlot slot="mainHand" item={itemBySlot.get("mainHand") ?? null} />
      </div>
      <div style={{ gridArea: "armor" }}>
        <PaperDollSlot slot="armor" item={itemBySlot.get("armor") ?? null} />
      </div>
      <div style={{ gridArea: "offHand" }}>
        <PaperDollSlot slot="offHand" item={itemBySlot.get("offHand") ?? null} />
      </div>
      <div style={{ gridArea: "bracers" }}>
        <PaperDollSlot slot="bracers" item={itemBySlot.get("bracers") ?? null} />
      </div>
      <div style={{ gridArea: "belt" }}>
        <PaperDollSlot slot="belt" item={itemBySlot.get("belt") ?? null} />
      </div>
      <div style={{ gridArea: "gloves" }}>
        <PaperDollSlot slot="gloves" item={itemBySlot.get("gloves") ?? null} />
      </div>
      <div style={{ gridArea: "ring2" }}>
        <PaperDollSlot slot="ring2" item={itemBySlot.get("ring2") ?? null} />
      </div>
      <div style={{ gridArea: "pants" }}>
        <PaperDollSlot slot="pants" item={itemBySlot.get("pants") ?? null} />
      </div>
      <div style={{ gridArea: "boots" }}>
        <PaperDollSlot slot="boots" item={itemBySlot.get("boots") ?? null} />
      </div>
    </div>
  );
}

function EmptyInventorySlot() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        border: "1px dashed rgba(177, 197, 217, 0.18)",
        background:
          "linear-gradient(180deg, rgba(20,24,31,0.82), rgba(11,14,18,0.9)), repeating-linear-gradient(135deg, rgba(255,255,255,0.018), rgba(255,255,255,0.018) 6px, transparent 6px, transparent 12px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
    />
  );
}

function SummaryPill({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <PanelCard
      style={{
        padding: compact ? "6px 8px" : "8px 10px",
        background: "rgb(32,35,42)",
        display: "grid",
        gap: "2px",
        minWidth: compact ? "64px" : undefined,
      }}
    >
      <div style={{ fontSize: compact ? "8px" : "9px", textTransform: "uppercase", opacity: 0.68 }}>{label}</div>
      <div style={{ fontSize: compact ? "12px" : "14px", fontWeight: 800, color: "#eef7ff" }}>{value}</div>
    </PanelCard>
  );
}
