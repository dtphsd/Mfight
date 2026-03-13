import type { Inventory } from "@/modules/inventory/model/Inventory";

export function getItemQuantity(inventory: Inventory, itemCode: string) {
  return inventory.entries
    .filter((entry) => entry.item.code === itemCode)
    .reduce((total, entry) => total + entry.quantity, 0);
}
