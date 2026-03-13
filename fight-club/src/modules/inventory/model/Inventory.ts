import type { Item } from "@/modules/inventory/model/Item";

export interface InventoryEntry {
  item: Item;
  quantity: number;
}

export interface Inventory {
  entries: InventoryEntry[];
  maxSlots: number;
}
