import { createCharacter } from "@/modules/character";
import { resolveRound, startCombat, type RoundAction } from "@/modules/combat";
import { createBasicAttackAction } from "@/modules/combat/model/RoundAction";
import { createEquipment, equipItem, getEquipmentBonuses } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  buildCombatSandboxDerivedState,
  buildCombatSandboxMetrics,
} from "@/orchestration/combat/combatSandboxMetrics";
import { SeededRandom } from "@/core/rng/SeededRandom";

describe("combatSandboxMetrics", () => {
  it("builds combat metrics from snapshots and equipped items", () => {
    const inventory = createStarterInventory();
    const equipped = equipPlayerLoadout(inventory, ["bk-item-6", "bk-item-366"]);
    const equipmentBonuses = getEquipmentBonuses(equipped, inventory);
    const { playerSnapshot, botSnapshot } = createSandboxSnapshots(equipmentBonuses);
    const equippedItems = getEquippedItems(equipped, inventory);

    const metrics = buildCombatSandboxMetrics({
      playerSnapshot,
      botSnapshot,
      playerWeaponItem: equippedItems.find((entry) => entry.slot === "mainHand")?.item ?? null,
      offHandItem: equippedItems.find((entry) => entry.slot === "offHand")?.item ?? null,
    });

    expect(metrics.mainHandLabel).toBe(
      inventory.entries.find((entry) => entry.item.code === "bk-item-6")?.item.name ?? null
    );
    expect(metrics.offHandLabel).toBeNull();
    expect(metrics.weaponHandedness).toBe("one_hand");
    expect(metrics.weaponDamageType).toBe("slash");
    expect(metrics.opponentMaxHp).toBe(botSnapshot.maxHp);
    expect(metrics.totalDamageRange.min).toBeLessThanOrEqual(metrics.totalDamageRange.max);
    expect(metrics.totalArmorRange.min).toBeLessThanOrEqual(metrics.totalArmorRange.max);
    expect(metrics.opponentTotalDamageRange.min).toBeLessThanOrEqual(metrics.opponentTotalDamageRange.max);
    expect(metrics.opponentTotalArmorRange.min).toBeLessThanOrEqual(metrics.opponentTotalArmorRange.max);
    expect(metrics.matchup.playerPrimaryType).toBe("slash");
    expect(metrics.matchup.playerZonePressure.zones).toHaveLength(5);
  });

  it("derives latest log entries, resource views, and battle log entries from combat state", () => {
    const inventory = createStarterInventory();
    const equipped = equipPlayerLoadout(inventory, ["bk-item-6"]);
    const equipmentBonuses = getEquipmentBonuses(equipped, inventory);
    const { playerSnapshot, botSnapshot } = createSandboxSnapshots(equipmentBonuses);
    const state = startCombat(playerSnapshot, botSnapshot);
    const actions: [RoundAction, RoundAction] = [
      createBasicAttackAction({
        attackerId: playerSnapshot.characterId,
        attackZone: "head",
        defenseZones: ["chest", "belly"],
      }),
      createBasicAttackAction({
        attackerId: botSnapshot.characterId,
        attackZone: "legs",
        defenseZones: ["head", "waist"],
      }),
    ];
    const resolved = resolveRound(state, actions, new SeededRandom(7));

    expect(resolved.success).toBe(true);
    if (!resolved.success) {
      return;
    }

    const derived = buildCombatSandboxDerivedState({
      combatState: resolved.data,
      playerSnapshot,
      botSnapshot,
      equippedItems: getEquippedItems(equipped, inventory),
    });

    expect(derived.playerCombatant?.id).toBe(playerSnapshot.characterId);
    expect(derived.botCombatant?.id).toBe(botSnapshot.characterId);
    expect(derived.latestPlayerLogEntry?.attackerId).toBe(playerSnapshot.characterId);
    expect(derived.latestBotLogEntry?.attackerId).toBe(botSnapshot.characterId);
    expect(derived.latestRoundEntries).toHaveLength(2);
    expect(derived.battleLogEntries.length).toBeGreaterThan(0);
    expect(derived.playerResources).not.toBeNull();
    expect(derived.botResources).not.toBeNull();
    expect(derived.metrics.mainHandLabel).toBe(
      inventory.entries.find((entry) => entry.item.code === "bk-item-6")?.item.name ?? null
    );
  });
});

function createSandboxSnapshots(playerEquipmentBonuses: ReturnType<typeof getEquipmentBonuses>) {
  const player = createCharacter("Player");
  const bot = createCharacter("Arena Bot");

  if (!player.success || !bot.success) {
    throw new Error("character creation failed");
  }

  return {
    playerSnapshot: buildCombatSnapshot({
      character: player.data,
      flatBonuses: playerEquipmentBonuses.flatBonuses,
      percentBonuses: playerEquipmentBonuses.percentBonuses,
      baseDamage: playerEquipmentBonuses.baseDamage,
      baseArmor: playerEquipmentBonuses.baseArmor,
      armorBySlot: playerEquipmentBonuses.armorBySlot,
      combatBonuses: playerEquipmentBonuses.combatBonuses,
      preferredDamageType: playerEquipmentBonuses.preferredDamageType,
      weaponClass: playerEquipmentBonuses.mainHandWeaponClass,
    }),
    botSnapshot: buildCombatSnapshot({
      character: bot.data,
      flatBonuses: [],
      percentBonuses: [],
    }),
  };
}

function equipPlayerLoadout(inventory: ReturnType<typeof createStarterInventory>, itemCodes: string[]) {
  let equipment = createEquipment();

  for (const itemCode of itemCodes) {
    const result = equipItem(equipment, inventory, itemCode);

    if (!result.success) {
      throw new Error(result.reason);
    }

    equipment = result.data;
  }

  return equipment;
}

function getEquippedItems(
  equipment: ReturnType<typeof createEquipment>,
  inventory: ReturnType<typeof createStarterInventory>
) {
  return Object.entries(equipment.slots).map(([slot, itemCode]) => ({
    slot,
    item: inventory.entries.find((entry) => entry.item.code === itemCode)?.item ?? null,
  }));
}
