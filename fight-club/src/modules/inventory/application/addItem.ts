import type { Inventory } from "@/modules/inventory/model/Inventory";
import type { Item } from "@/modules/inventory/model/Item";

export type InventoryResult<T> =
  | { success: true; data: T }
  | { success: false; reason: string };

export function addItem(
  inventory: Inventory,
  item: Item,
  quantity = 1
): InventoryResult<Inventory> {
  if (quantity < 1) {
    return {
      success: false,
      reason: "invalid_quantity",
    };
  }

  let nextEntries = inventory.entries.map((entry) => ({ ...entry }));
  let remaining = quantity;

  if (item.stackable) {
    nextEntries = nextEntries.map((entry) => {
      if (entry.item.code !== item.code || remaining === 0) {
        return entry;
      }

      const availableSpace = entry.item.maxStack - entry.quantity;
      if (availableSpace <= 0) {
        return entry;
      }

      const movedQuantity = Math.min(remaining, availableSpace);
      remaining -= movedQuantity;

      return {
        ...entry,
        quantity: entry.quantity + movedQuantity,
      };
    });
  }

  while (remaining > 0) {
    if (nextEntries.length >= inventory.maxSlots) {
      return {
        success: false,
        reason: "inventory_full",
      };
    }

    const stackQuantity = item.stackable ? Math.min(remaining, item.maxStack) : 1;
    nextEntries.push({
      item,
      quantity: stackQuantity,
    });
    remaining -= stackQuantity;
  }

  if (!item.stackable) {
    nextEntries = nextEntries.map((entry) =>
      entry.item.code === item.code ? { ...entry, quantity: 1 } : entry
    );
  }

  return {
    success: true,
    data: {
      ...inventory,
      entries: nextEntries,
    },
  };
}

export function hasFreeSlot(inventory: Inventory) {
  return inventory.entries.length < inventory.maxSlots;
}
