import type { Inventory } from "@/modules/inventory";
import type { Item, ItemType } from "@/modules/inventory";
import type { Equipment } from "@/modules/equipment/model/Equipment";
import type { EquipmentSlot } from "@/modules/equipment/model/EquipmentSlot";

export type EquipmentResult<T> =
  | { success: true; data: T }
  | { success: false; reason: string };

export function equipItem(
  equipment: Equipment,
  inventory: Inventory,
  itemCode: string
): EquipmentResult<Equipment> {
  const entry = inventory.entries.find((inventoryEntry) => inventoryEntry.item.code === itemCode);

  if (!entry) {
    return {
      success: false,
      reason: "item_not_found",
    };
  }

  const slot = getEquipmentSlotForItem(entry.item);
  if (!slot) {
    return {
      success: false,
      reason: "item_not_equippable",
    };
  }

  const mainHandItem = getEquippedItem(inventory, equipment.slots.mainHand);
  const mainHandHandedness = mainHandItem?.equip?.handedness ?? null;
  const itemHandedness = entry.item.equip?.handedness ?? null;

  if (slot === "offHand" && mainHandHandedness === "two_hand") {
    return {
      success: false,
      reason: "two_hand_conflict",
    };
  }

  if (slot === "mainHand" && itemHandedness === "two_hand" && equipment.slots.offHand) {
    return {
      success: false,
      reason: "offhand_occupied",
    };
  }

  return {
    success: true,
    data: {
      ...equipment,
      slots: {
        ...equipment.slots,
        [slot]: itemCode,
      },
    },
  };
}

export function getEquipmentSlotForItem(item: Item): EquipmentSlot | null {
  if (item.equip) {
    return item.equip.slot;
  }

  return getEquipmentSlotForItemType(item.type);
}

export function getEquipmentSlotForItemType(itemType: ItemType): EquipmentSlot | null {
  switch (itemType) {
    case "weapon":
      return "mainHand";
    case "shield":
      return "offHand";
    case "helmet":
    case "armor":
    case "boots":
    case "gloves":
    case "accessory":
      return itemType;
    default:
      return null;
  }
}

function getEquippedItem(inventory: Inventory, itemCode: string | null): Item | null {
  if (!itemCode) {
    return null;
  }

  return inventory.entries.find((entry) => entry.item.code === itemCode)?.item ?? null;
}
