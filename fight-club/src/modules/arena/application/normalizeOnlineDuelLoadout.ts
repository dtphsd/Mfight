import type {
  OnlineDuelFighterView,
  OnlineDuelParticipantLoadout,
} from "@/modules/arena/contracts/arenaPublicApi";
import { createEquipment, equipItem, getEquipmentBonuses } from "@/modules/equipment";
import { createStarterInventory, type Inventory } from "@/modules/inventory";

const MAX_ONLINE_DUEL_EQUIPPED_SKILLS = 5;

export function normalizeOnlineDuelLoadout(
  loadout?: OnlineDuelParticipantLoadout
): OnlineDuelParticipantLoadout {
  const baseLoadout = loadout ?? createFallbackParticipantLoadout();
  const inventory = cloneInventory(baseLoadout.inventory);
  const equipmentState = normalizeEquipmentState(baseLoadout, inventory);
  const availableSkillIds = new Set(
    getEquipmentBonuses(equipmentState, inventory).skills.map((skill) => skill.id)
  );

  return {
    equipmentState,
    inventory,
    equippedSkillIds: normalizeEquippedSkillIds(baseLoadout.equippedSkillIds, availableSkillIds),
  };
}

export function cloneOnlineDuelParticipantLoadout(
  loadout: OnlineDuelParticipantLoadout
): OnlineDuelParticipantLoadout {
  return {
    equipmentState: {
      slots: {
        ...loadout.equipmentState.slots,
      },
    },
    inventory: cloneInventory(loadout.inventory),
    equippedSkillIds: [...loadout.equippedSkillIds],
  };
}

export function cloneOnlineDuelFighterView(
  fighterView?: OnlineDuelFighterView
): OnlineDuelFighterView | undefined {
  if (!fighterView) {
    return undefined;
  }

  return {
    figure: fighterView.figure,
    equipment: fighterView.equipment.map((entry) => ({
      slot: entry.slot,
      item: entry.item,
    })),
  };
}

function createFallbackParticipantLoadout(): OnlineDuelParticipantLoadout {
  return {
    equipmentState: createEquipment(),
    inventory: createStarterInventory(),
    equippedSkillIds: [],
  };
}

function cloneInventory(inventory: Inventory): Inventory {
  return {
    maxSlots:
      Number.isFinite(inventory.maxSlots) && inventory.maxSlots > 0
        ? Math.floor(inventory.maxSlots)
        : createStarterInventory().maxSlots,
    entries: inventory.entries
      .map((entry) => ({
        ...entry,
        quantity:
          Number.isFinite(entry.quantity) && entry.quantity > 0 ? Math.floor(entry.quantity) : 0,
      }))
      .filter((entry) => entry.quantity > 0),
  };
}

function normalizeEquipmentState(
  loadout: OnlineDuelParticipantLoadout,
  inventory: Inventory
) {
  const nextEquipment = createEquipment();

  for (const itemCode of Object.values(loadout.equipmentState.slots)) {
    if (!itemCode) {
      continue;
    }

    const equipResult = equipItem(nextEquipment, inventory, itemCode);
    if (equipResult.success) {
      nextEquipment.slots = { ...equipResult.data.slots };
    }
  }

  return nextEquipment;
}

function normalizeEquippedSkillIds(
  equippedSkillIds: string[],
  availableSkillIds: Set<string>
) {
  const normalized: string[] = [];

  for (const skillId of equippedSkillIds) {
    if (!availableSkillIds.has(skillId) || normalized.includes(skillId)) {
      continue;
    }

    normalized.push(skillId);
    if (normalized.length >= MAX_ONLINE_DUEL_EQUIPPED_SKILLS) {
      break;
    }
  }

  return normalized;
}
