import type { Inventory } from "@/modules/inventory/model/Inventory";

export function createInventory(maxSlots = 20): Inventory {
  return {
    entries: [],
    maxSlots,
  };
}
