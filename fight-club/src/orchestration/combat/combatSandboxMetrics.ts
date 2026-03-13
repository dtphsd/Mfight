import {
  baseDamage,
  baseBlockPenetration,
  baseCritChance,
  baseDodgeChance,
  blockPenetration,
  critChance,
  critMultiplier,
  dodgeChance,
  type CombatSnapshot,
  type CombatState,
  type RoundResult,
} from "@/modules/combat";
import type { ArmorProfile, DamageProfile, DamageType } from "@/modules/inventory";
import { buildZonePressureLens, resolveDisplayDamageType, totalProfileValue } from "@/orchestration/combat/combatPressure";
import { createBattleLogEntries } from "@/ui/components/combat/battleLogFormatting";

export interface EquippedSandboxItem {
  slot: string;
  item: {
    name: string;
    equip?: {
      handedness?: string | null;
    } | null;
  } | null;
}

export interface CombatSandboxMatchupLens {
  playerPrimaryType: DamageType | null;
  botPrimaryType: DamageType | null;
  playerPrimaryDamage: number;
  botArmorVsPlayer: number;
  playerPenFlat: number;
  playerPenPercent: number;
  botPrimaryDamage: number;
  playerArmorVsBot: number;
  botPenFlat: number;
  botPenPercent: number;
  playerCritVsBot: number;
  botCritVsPlayer: number;
  playerDodgeVsBot: number;
  botDodgeVsPlayer: number;
  playerBlockPenVsBot: number;
  botBlockPenVsPlayer: number;
  playerZonePressure: ReturnType<typeof buildZonePressureLens>;
  botZonePressure: ReturnType<typeof buildZonePressureLens>;
}

export interface CombatSandboxMetrics {
  maxHp: number;
  baseAttackDamage: number;
  weaponDamage: number;
  totalDamage: number;
  totalArmor: number;
  baseDodgeChance: number;
  dodgeVsBot: number;
  baseCritChance: number;
  botDodgeVsPlayer: number;
  critVsBot: number;
  baseBlockPenetration: number;
  blockPenetrationVsBot: number;
  critMultiplier: number;
  totalCritMultiplier: number;
  critChanceBonus: number;
  dodgeChanceBonus: number;
  blockChanceBonus: number;
  blockPowerBonus: number;
  preferredDamageType: DamageType | null;
  weaponClass: CombatSnapshot["weaponClass"];
  damageProfile: DamageProfile;
  armorProfile: ArmorProfile;
  armorBySlot: CombatSnapshot["armorBySlot"];
  armorPenetrationFlat: DamageProfile;
  armorPenetrationPercent: DamageProfile;
  mainHandLabel: string | null;
  offHandLabel: string | null;
  weaponHandedness: string | null;
  weaponDamageType: DamageType | null;
  opponentMaxHp: number;
  opponentTotalDamage: number;
  opponentTotalArmor: number;
  opponentWeaponDamageType: DamageType | null;
  opponentDamageProfile: DamageProfile;
  opponentArmorProfile: ArmorProfile;
  matchup: CombatSandboxMatchupLens;
}

export interface CombatSandboxDerivedState {
  playerCombatant: CombatState["combatants"][number] | null;
  botCombatant: CombatState["combatants"][number] | null;
  latestPlayerLogEntry: RoundResult | null;
  latestBotLogEntry: RoundResult | null;
  latestRoundEntries: RoundResult[];
  battleLogEntries: ReturnType<typeof createBattleLogEntries>;
  playerActsFirst: boolean;
  playerResources: CombatState["combatants"][number]["resources"] | null;
  botResources: CombatState["combatants"][number]["resources"] | null;
  metrics: CombatSandboxMetrics;
}

export function buildCombatSandboxDerivedState(input: {
  combatState: CombatState | null;
  playerSnapshot: CombatSnapshot;
  botSnapshot: CombatSnapshot;
  equippedItems: EquippedSandboxItem[];
}): CombatSandboxDerivedState {
  const { combatState, playerSnapshot, botSnapshot, equippedItems } = input;
  const playerCombatant =
    combatState?.combatants.find((combatant) => combatant.id === playerSnapshot.characterId) ?? null;
  const botCombatant =
    combatState?.combatants.find((combatant) => combatant.id === botSnapshot.characterId) ?? null;
  const latestPlayerLogEntry =
    [...(combatState?.log ?? [])].reverse().find((entry) => entry.attackerId === playerSnapshot.characterId) ?? null;
  const latestBotLogEntry =
    [...(combatState?.log ?? [])].reverse().find((entry) => entry.attackerId === botSnapshot.characterId) ?? null;
  const latestRoundEntries =
    combatState && combatState.log.length > 0
      ? combatState.log.slice(Math.max(0, combatState.log.length - 2))
      : [];
  const playerActsFirst = playerSnapshot.stats.agility >= botSnapshot.stats.agility;
  const battleLogEntries = createBattleLogEntries(
    combatState,
    playerSnapshot.characterId,
    botSnapshot.characterId
  );
  const playerWeaponItem = equippedItems.find((entry) => entry.slot === "mainHand")?.item ?? null;
  const offHandItem = equippedItems.find((entry) => entry.slot === "offHand")?.item ?? null;

  return {
    playerCombatant,
    botCombatant,
    latestPlayerLogEntry,
    latestBotLogEntry,
    latestRoundEntries,
    battleLogEntries,
    playerActsFirst,
    playerResources: playerCombatant?.resources ?? null,
    botResources: botCombatant?.resources ?? null,
    metrics: buildCombatSandboxMetrics({
      playerSnapshot,
      botSnapshot,
      playerWeaponItem,
      offHandItem,
    }),
  };
}

export function buildCombatSandboxMetrics(input: {
  playerSnapshot: CombatSnapshot;
  botSnapshot: CombatSnapshot;
  playerWeaponItem: EquippedSandboxItem["item"];
  offHandItem: EquippedSandboxItem["item"];
}): CombatSandboxMetrics {
  const { playerSnapshot, botSnapshot, playerWeaponItem, offHandItem } = input;

  return {
    maxHp: playerSnapshot.maxHp,
    baseAttackDamage: Math.floor(baseDamage(playerSnapshot.stats.strength)),
    weaponDamage: Math.floor(totalProfileValue(playerSnapshot.damage)),
    totalDamage: Math.floor(baseDamage(playerSnapshot.stats.strength) + totalProfileValue(playerSnapshot.damage)),
    totalArmor: Math.floor(totalProfileValue(playerSnapshot.armor)),
    baseDodgeChance: baseDodgeChance(playerSnapshot.stats.agility),
    dodgeVsBot: dodgeChance(botSnapshot.stats.agility, playerSnapshot.stats.agility),
    baseCritChance: baseCritChance(playerSnapshot.stats.rage),
    botDodgeVsPlayer: dodgeChance(playerSnapshot.stats.agility, botSnapshot.stats.agility),
    critVsBot: critChance(playerSnapshot.stats.rage, botSnapshot.stats.rage),
    baseBlockPenetration: baseBlockPenetration(playerSnapshot.stats.strength),
    blockPenetrationVsBot: blockPenetration(playerSnapshot.stats.strength, botSnapshot.stats.strength),
    critMultiplier: playerSnapshot.critMultiplierBonus,
    totalCritMultiplier: critMultiplier(playerSnapshot.stats.endurance) + playerSnapshot.critMultiplierBonus,
    critChanceBonus: playerSnapshot.critChanceBonus,
    dodgeChanceBonus: playerSnapshot.dodgeChanceBonus,
    blockChanceBonus: playerSnapshot.blockChanceBonus,
    blockPowerBonus: playerSnapshot.blockPowerBonus,
    preferredDamageType: playerSnapshot.preferredDamageType,
    weaponClass: playerSnapshot.weaponClass,
    damageProfile: playerSnapshot.damage,
    armorProfile: playerSnapshot.armor,
    armorBySlot: playerSnapshot.armorBySlot,
    armorPenetrationFlat: playerSnapshot.armorPenetrationFlat,
    armorPenetrationPercent: playerSnapshot.armorPenetrationPercent,
    mainHandLabel: playerWeaponItem?.name ?? null,
    offHandLabel: offHandItem?.name ?? null,
    weaponHandedness: playerWeaponItem?.equip?.handedness ?? null,
    weaponDamageType: resolveDisplayDamageType(playerSnapshot.preferredDamageType, playerSnapshot.damage),
    opponentMaxHp: botSnapshot.maxHp,
    opponentTotalDamage: Math.floor(totalProfileValue(botSnapshot.damage)),
    opponentTotalArmor: Math.floor(totalProfileValue(botSnapshot.armor)),
    opponentWeaponDamageType: resolveDisplayDamageType(botSnapshot.preferredDamageType, botSnapshot.damage),
    opponentDamageProfile: botSnapshot.damage,
    opponentArmorProfile: botSnapshot.armor,
    matchup: buildMatchupLens(playerSnapshot, botSnapshot),
  };
}

function buildMatchupLens(playerSnapshot: CombatSnapshot, botSnapshot: CombatSnapshot): CombatSandboxMatchupLens {
  const playerPrimaryType = resolveDisplayDamageType(playerSnapshot.preferredDamageType, playerSnapshot.damage);
  const botPrimaryType = resolveDisplayDamageType(botSnapshot.preferredDamageType, botSnapshot.damage);
  const playerZonePressure = buildZonePressureLens(playerSnapshot, botSnapshot);
  const botZonePressure = buildZonePressureLens(botSnapshot, playerSnapshot);

  return {
    playerPrimaryType,
    botPrimaryType,
    playerPrimaryDamage: playerPrimaryType ? getProfileValue(playerSnapshot.damage, playerPrimaryType) : 0,
    botArmorVsPlayer: playerPrimaryType ? getProfileValue(botSnapshot.armor, playerPrimaryType) : 0,
    playerPenFlat: playerPrimaryType ? getProfileValue(playerSnapshot.armorPenetrationFlat, playerPrimaryType) : 0,
    playerPenPercent: playerPrimaryType ? getProfileValue(playerSnapshot.armorPenetrationPercent, playerPrimaryType) : 0,
    botPrimaryDamage: botPrimaryType ? getProfileValue(botSnapshot.damage, botPrimaryType) : 0,
    playerArmorVsBot: botPrimaryType ? getProfileValue(playerSnapshot.armor, botPrimaryType) : 0,
    botPenFlat: botPrimaryType ? getProfileValue(botSnapshot.armorPenetrationFlat, botPrimaryType) : 0,
    botPenPercent: botPrimaryType ? getProfileValue(botSnapshot.armorPenetrationPercent, botPrimaryType) : 0,
    playerCritVsBot: critChance(playerSnapshot.stats.rage, botSnapshot.stats.rage) + playerSnapshot.critChanceBonus,
    botCritVsPlayer: critChance(botSnapshot.stats.rage, playerSnapshot.stats.rage) + botSnapshot.critChanceBonus,
    playerDodgeVsBot: dodgeChance(botSnapshot.stats.agility, playerSnapshot.stats.agility) + playerSnapshot.dodgeChanceBonus,
    botDodgeVsPlayer: dodgeChance(playerSnapshot.stats.agility, botSnapshot.stats.agility) + botSnapshot.dodgeChanceBonus,
    playerBlockPenVsBot: blockPenetration(playerSnapshot.stats.strength, botSnapshot.stats.strength),
    botBlockPenVsPlayer: blockPenetration(botSnapshot.stats.strength, playerSnapshot.stats.strength),
    playerZonePressure,
    botZonePressure,
  };
}

function getProfileValue(profile: DamageProfile | ArmorProfile, type: DamageType) {
  return profile[type];
}
