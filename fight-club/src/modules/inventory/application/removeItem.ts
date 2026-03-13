import type { Inventory } from "@/modules/inventory/model/Inventory";

import type { InventoryResult } from "@/modules/inventory/application/addItem";

export function removeItem(
  inventory: Inventory,
  itemCode: string,
  quantity = 1
): InventoryResult<Inventory> {
  if (quantity < 1) {
    return {
      success: false,
      reason: "invalid_quantity",
    };
  }

  const currentQuantity = inventory.entries
    .filter((entry) => entry.item.code === itemCode)
    .reduce((total, entry) => total + entry.quantity, 0);

  if (currentQuantity === 0) {
    return {
      success: false,
      reason: "item_not_found",
    };
  }

  if (currentQuantity < quantity) {
    return {
      success: false,
      reason: "not_enough_items",
    };
  }

  let remaining = quantity;
  const nextEntries = inventory.entries
    .map((entry) => ({ ...entry }))
    .flatMap((entry) => {
      if (entry.item.code !== itemCode || remaining === 0) {
        return [entry];
      }

      if (entry.quantity <= remaining) {
        remaining -= entry.quantity;
        return [];
      }

      entry.quantity -= remaining;
      remaining = 0;
      return [entry];
    });

  return {
    success: true,
    data: {
      ...inventory,
      entries: nextEntries,
    },
  };
}
