import { starterItems } from "@/content/items/starterItems";
import { addItem } from "@/modules/inventory/application/addItem";
import { createInventory } from "@/modules/inventory/application/createInventory";
import { gameConfig } from "@/app/config/gameConfig";

export function createStarterInventory() {
  let inventory = createInventory(Math.max(gameConfig.inventoryMaxSize, starterItems.length + 6));

  for (const entry of starterItems) {
    const result = addItem(inventory, entry.item, entry.quantity);
    if (!result.success) {
      throw new Error(result.reason);
    }

    inventory = result.data;
  }

  return inventory;
}
