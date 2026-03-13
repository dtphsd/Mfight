import type { Inventory } from "@/modules/inventory/model/Inventory";
import type { Item } from "@/modules/inventory/model/Item";
import type { InventoryResult } from "@/modules/inventory/application/addItem";

export interface InventoryPublicApi {
  addItem(inventory: Inventory, item: Item, quantity?: number): InventoryResult<Inventory>;
}
