import { SeededRandom } from "@/core/rng/SeededRandom";
import { createCharacter } from "@/modules/character";
import { startCombat } from "@/modules/combat";
import { createEquipment, equipItem, getEquipmentBonuses } from "@/modules/equipment";
import { createStarterInventory } from "@/modules/inventory";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  prepareSandboxNextRound,
  resolveSandboxRound,
  startSandboxFight,
} from "@/orchestration/combat/combatSandboxController";
import { createRoundDraft, getRoundDraftSelectedConsumableCode } from "@/orchestration/combat/roundDraft";

describe("combatSandboxController", () => {
  it("starts a sandbox fight and moves into awaiting actions", () => {
    const { playerSnapshot, botSnapshot } = createSandboxSnapshots();

    const result = startSandboxFight({ playerSnapshot, botSnapshot });

    expect(result.combatState.status).toBe("active");
    expect(result.combatPhase).toBe("awaiting_actions");
    expect(result.botLastAction).toBeNull();
    expect(result.botLastPlan).toBeNull();
    expect(result.roundError).toBeNull();
  });

  it("prepares the next round only from round_resolved", () => {
    expect(prepareSandboxNextRound({ combatPhase: "round_resolved" })).toEqual({
      combatPhase: "awaiting_actions",
      roundError: null,
    });
    expect(prepareSandboxNextRound({ combatPhase: "setup" })).toBeNull();
  });

  it("rejects a skill when the player lacks the required resource", () => {
    const inventory = createStarterInventory();
    const equipment = createEquipment();
    const equipped = equipItem(equipment, inventory, "training-sword");

    if (!equipped.success) {
      throw new Error(equipped.reason);
    }

    const equipmentBonuses = getEquipmentBonuses(equipped.data, inventory);
    const { playerSnapshot, botSnapshot } = createSandboxSnapshots({
      playerEquipmentBonuses: equipmentBonuses,
    });
    const combatState = startCombat(playerSnapshot, botSnapshot);
    const skill = equipmentBonuses.skills.find((entry) => entry.id === "training-sword-feint");

    expect(skill).toBeDefined();

    const result = resolveSandboxRound({
      combatPhase: "awaiting_actions",
      combatState,
      roundDraft: {
        ...createRoundDraft(),
        selectedAction: { kind: "skill_attack", skillId: skill?.id ?? "" },
      },
      inventory,
      playerSnapshot,
      botSnapshot,
      availableSkills: equipmentBonuses.skills,
      availableConsumables: [],
      botAvailableSkills: [],
      selectedBotDifficulty: { plannerProfile: "veteran" },
      random: new SeededRandom(1337),
    });

    expect(result.success).toBe(false);
    expect(result.roundError).toBe("Not enough momentum for Feint Slash.");
    expect(result.botLastAction).toBeNull();
  });

  it("consumes a selected consumable only after successful round resolution", () => {
    const inventory = createStarterInventory();
    const { playerSnapshot, botSnapshot } = createSandboxSnapshots();
    const combatState = startCombat(playerSnapshot, botSnapshot);
    const initialPotionQuantity = getItemQuantity(inventory, "small-potion");

    const result = resolveSandboxRound({
      combatPhase: "awaiting_actions",
      combatState,
      roundDraft: {
        ...createRoundDraft(),
        selectedAction: {
          kind: "consumable",
          consumableCode: "small-potion",
          usageMode: "replace_attack",
        },
      },
      inventory,
      playerSnapshot,
      botSnapshot,
      availableSkills: [],
      availableConsumables: inventory.entries.filter((entry) => entry.item.consumableEffect && entry.quantity > 0),
      botAvailableSkills: [],
      selectedBotDifficulty: { plannerProfile: "veteran" },
      random: new SeededRandom(9),
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(getItemQuantity(result.inventory, "small-potion")).toBe(initialPotionQuantity - 1);
    expect(getRoundDraftSelectedConsumableCode(result.roundDraft)).toBeNull();
    expect(result.botLastAction).not.toBeNull();
    expect(result.combatState.log.some((entry) => entry.type === "consumable")).toBe(true);
  });
});

function createSandboxSnapshots(input: {
  playerEquipmentBonuses?: ReturnType<typeof getEquipmentBonuses>;
} = {}) {
  const player = createCharacter("Player");
  const bot = createCharacter("Arena Bot");

  if (!player.success || !bot.success) {
    throw new Error("character creation failed");
  }

  const playerEquipmentBonuses = input.playerEquipmentBonuses;

  return {
    playerSnapshot: buildCombatSnapshot({
      character: player.data,
      flatBonuses: playerEquipmentBonuses?.flatBonuses ?? [],
      percentBonuses: playerEquipmentBonuses?.percentBonuses ?? [],
      baseDamage: playerEquipmentBonuses?.baseDamage,
      baseArmor: playerEquipmentBonuses?.baseArmor,
      armorBySlot: playerEquipmentBonuses?.armorBySlot,
      combatBonuses: playerEquipmentBonuses?.combatBonuses,
      preferredDamageType: playerEquipmentBonuses?.preferredDamageType,
      weaponClass: playerEquipmentBonuses?.mainHandWeaponClass,
    }),
    botSnapshot: buildCombatSnapshot({
      character: bot.data,
      flatBonuses: [],
      percentBonuses: [],
    }),
  };
}

function getItemQuantity(inventory: ReturnType<typeof createStarterInventory>, itemCode: string) {
  return inventory.entries
    .filter((entry) => entry.item.code === itemCode)
    .reduce((total, entry) => total + entry.quantity, 0);
}
