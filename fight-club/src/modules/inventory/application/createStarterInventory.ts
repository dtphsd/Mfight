import { starterItems } from "@/content/items/starterItems";
import { addItem } from "@/modules/inventory/application/addItem";
import { createInventory } from "@/modules/inventory/application/createInventory";

export function createStarterInventory() {
  let inventory = createInventory();

  for (const entry of starterItems) {
    const result = addItem(inventory, entry.item, entry.quantity);
    if (!result.success) {
      throw new Error(result.reason);
    }

    inventory = result.data;
  }

  return inventory;
}
