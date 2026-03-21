import { createStarterInventory } from "@/modules/inventory";
import type { Inventory, Item } from "@/modules/inventory";
import { getEquipmentBonuses } from "@/modules/equipment";
import type { Equipment, EquipmentSlot } from "@/modules/equipment";
import type {
  OnlineDuelFighterView,
  OnlineDuelParticipantLoadout,
  OnlineDuelRoundSummary,
  OnlineDuelStateSync,
} from "@/modules/arena";
import { formatCombatIntentLabel, type CombatZone } from "@/modules/combat";
import { combatBuildPresets, type CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import {
  applySandboxAllocations,
  buildSandboxPresetState,
  requireSandboxCharacter,
} from "@/orchestration/combat/combatSandboxSupport";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import {
  formatConsumableDetailLines,
  formatSkillDetailLines,
} from "@/ui/screens/Combat/combatSandboxScreenHelpers";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";

export type ClientMode = "host" | "guest";
export type EntryMode = "create" | "join";
export type TransportSource = "checking" | "backend" | "local";

export interface OnlineBuildSelection {
  presetId: string;
  snapshot: ReturnType<typeof buildCombatSnapshot>;
  equipmentState: Equipment;
  inventory: Inventory;
  equippedSkillIds: string[];
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
}

export type OnlineAvailableSkill = ReturnType<typeof getEquipmentBonuses>["skills"][number];
export type OnlineAvailableConsumable = Inventory["entries"][number];

export interface OnlineDuelLiveStatus {
  tone: "info" | "warning" | "danger";
  badge: string;
  message: string;
}

export interface OnlineDuelRecoveryAction {
  kind: "leave" | "refresh";
  label: string;
}

export interface OnlineDuelMatchmakingStatus {
  tone: "info" | "warning";
  badge: string;
  message: string;
}

export const ONLINE_DUEL_MATCHMAKING_TIMEOUT_MS = 45_000;

const zoneLabels: Record<CombatZone, string> = {
  head: "Head",
  chest: "Chest",
  belly: "Belly",
  waist: "Waist",
  legs: "Legs",
};

const playerEquipmentSlots: EquipmentSlot[] = [
  "helmet",
  "earring",
  "shirt",
  "armor",
  "bracers",
  "gloves",
  "mainHand",
  "offHand",
  "belt",
  "ring",
  "ring2",
  "pants",
  "boots",
];

export function resolveOnlineRealtimeClientModes({
  launchedFromLobby,
  playerMode,
  modeOverride,
}: {
  launchedFromLobby: boolean;
  playerMode: ClientMode;
  modeOverride?: ClientMode;
}): ClientMode[] {
  if (launchedFromLobby) {
    return [modeOverride ?? playerMode];
  }

  return ["host", "guest"];
}

export function resolveOnlineActionClientMode(playerMode: ClientMode): ClientMode {
  return playerMode;
}

export function pickMostCompleteSync(
  first: OnlineDuelStateSync | null,
  second: OnlineDuelStateSync | null
): OnlineDuelStateSync | null {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  const firstScore = scoreSyncCompleteness(first);
  const secondScore = scoreSyncCompleteness(second);
  return secondScore > firstScore ? second : first;
}

export function resolveCombatantSummary(summary: OnlineDuelRoundSummary | null, displayName: string) {
  if (!summary) {
    return null;
  }

  return summary.combatants.find((combatant) => combatant.name === displayName) ?? null;
}

export function resolveCombatLoadoutForMode({
  mode,
  playerMode,
  preparedPlayer,
  syncedLoadout,
  hostBuild,
  guestBuild,
}: {
  mode: ClientMode;
  playerMode: ClientMode;
  preparedPlayer: PvpPreparedFighter | null;
  syncedLoadout?: OnlineDuelParticipantLoadout;
  hostBuild: OnlineBuildSelection;
  guestBuild: OnlineBuildSelection;
}) {
  const build = mode === "host" ? hostBuild : guestBuild;
  const loadout =
    syncedLoadout && mode === playerMode
      ? {
          equipmentState: syncedLoadout.equipmentState,
          inventory: syncedLoadout.inventory,
          equippedSkillIds: syncedLoadout.equippedSkillIds,
          equipment: preparedPlayer?.equipment ?? build.equipment,
        }
      : preparedPlayer && mode === playerMode
        ? {
            equipmentState: preparedPlayer.equipmentState,
            inventory: preparedPlayer.inventory,
            equippedSkillIds: preparedPlayer.equippedSkillIds,
            equipment: preparedPlayer.equipment,
          }
        : {
            equipmentState: build.equipmentState,
            inventory: build.inventory,
            equippedSkillIds: build.equippedSkillIds,
            equipment: build.equipment,
          };
  const bonuses = getEquipmentBonuses(loadout.equipmentState, loadout.inventory);
  const availableSkills = bonuses.skills.filter((skill) => loadout.equippedSkillIds.includes(skill.id));
  const availableConsumables = loadout.inventory.entries.filter(
    (entry) => entry.item.consumableEffect && entry.quantity > 0
  );

  return {
    ...loadout,
    availableSkills,
    availableConsumables,
  };
}

export function buildClientFighterView({
  preparedPlayer,
  fallbackFigure,
  fallbackEquipment = [],
}: {
  preparedPlayer: PvpPreparedFighter | null;
  fallbackFigure: string;
  fallbackEquipment?: Array<{ slot: EquipmentSlot; item: Item | null }>;
}): OnlineDuelFighterView {
  return {
    figure: preparedPlayer?.figure ?? fallbackFigure,
    equipment: preparedPlayer?.equipment ?? fallbackEquipment,
  };
}

export function buildOnlineParticipantLoadout({
  preparedPlayer,
  fallbackBuild,
}: {
  preparedPlayer: PvpPreparedFighter | null;
  fallbackBuild: OnlineBuildSelection;
}) {
  return {
    equipmentState: preparedPlayer?.equipmentState ?? fallbackBuild.equipmentState,
    inventory: preparedPlayer?.inventory ?? fallbackBuild.inventory,
    equippedSkillIds: preparedPlayer?.equippedSkillIds ?? fallbackBuild.equippedSkillIds,
  };
}

export function resolveFighterViewFigure(figure: string | undefined, fallback: string) {
  return figure ?? fallback;
}

export function totalDamageProfileValue(profile: ReturnType<typeof buildCombatSnapshot>["damage"]) {
  return profile.slash + profile.pierce + profile.blunt + profile.chop;
}

export function totalArmorProfileValue(profile: ReturnType<typeof buildCombatSnapshot>["armor"]) {
  return profile.slash + profile.pierce + profile.blunt + profile.chop;
}

function scoreSyncCompleteness(sync: OnlineDuelStateSync): number {
  const joinedCount = sync.participants.filter((participant) => participant.connected).length;
  const readyCount = sync.participants.filter((participant) => participant.connected && participant.ready).length;
  const roundScore = sync.round ?? 0;
  const statusScore =
    sync.status === "finished"
      ? 4
      : sync.status === "ready_to_resolve"
        ? 3
        : sync.status === "planning"
          ? 2
          : sync.status === "lobby"
            ? 1
            : 0;

  return joinedCount * 100 + readyCount * 10 + roundScore + statusScore;
}

export function getMatchStatusSummary({
  duelId,
  status,
  joinedCount,
  readyCount,
  winnerName,
  transportIssue,
  opponentConnected,
}: {
  duelId: string | null;
  status?: string;
  joinedCount: number;
  readyCount: number;
  winnerName: string | null;
  transportIssue?: string | null;
  opponentConnected?: boolean;
}) {
  if (!duelId) {
    return {
      badge: "Open match",
      message: "Open a match first, then share the code so the second player can join.",
    };
  }

  if (status === "finished") {
    return {
      badge: "Match finished",
      message: winnerName
        ? `${winnerName} won the fight. Leave this match or start a fresh one from here.`
        : "The fight is over. Leave this match or start a fresh one from here.",
    };
  }

  if (status === "abandoned") {
    return {
      badge: "Match closed",
      message: "This match is no longer active. Leave it or start a fresh one.",
    };
  }

  if (transportIssue === "displaced_session") {
    return {
      badge: "Session replaced",
      message: "This fighter is now controlled by a newer session. Leave this screen and continue from the latest one.",
    };
  }

  if (joinedCount < 2) {
    return {
      badge: "Waiting for rival",
      message: "The fight is open. Share the duel code and wait for the second fighter to connect.",
    };
  }

  if (joinedCount >= 2 && opponentConnected === false) {
    return {
      badge: "Opponent offline",
      message: "Your opponent left the live room for now. Stay here if you want to wait for their reconnect.",
    };
  }

  if (readyCount < 2) {
    return {
      badge: "Ready check",
      message: "Both fighters are here. Each side needs to ready up before the first exchange can start.",
    };
  }

  if (status === "planning") {
    return {
      badge: "Choose actions",
      message: "Ready check passed. Each fighter can now choose zones and lock in an attack for the round.",
    };
  }

  if (status === "ready_to_resolve" || status === "finished") {
    return {
      badge: "Round resolved",
      message: "Both actions are in. The exchange is resolved and the result is now shown to both fighters.",
    };
  }

  return {
    badge: status ?? "Match live",
    message: "The fight is active and both fighters are looking at the same battle state.",
  };
}

export function getCurrentStepSummary({
  duelId,
  status,
  joinedCount,
  readyCount,
  playerReady,
  opponentConnected,
  opponentReady,
  playerActionSubmitted,
  opponentActionSubmitted,
}: {
  duelId: string | null;
  status?: string;
  joinedCount: number;
  readyCount: number;
  playerReady: boolean;
  opponentConnected: boolean;
  opponentReady: boolean;
  playerActionSubmitted: boolean;
  opponentActionSubmitted: boolean;
}) {
  if (!duelId) {
    return {
      badge: "Open match",
      message: "Create a match first or switch to Join Match if you already have a match code.",
    };
  }

  if (status === "finished") {
    return {
      badge: "Match over",
      message: "This fight is finished. Leave the match or start another one from here.",
    };
  }

  if (status === "abandoned") {
    return {
      badge: "Match closed",
      message: "This match is closed. Leave it or start another fight when you are ready.",
    };
  }

  if (joinedCount < 2) {
    if (playerReady) {
      return {
        badge: "Hold",
        message: "You are ready. Waiting for the second fighter.",
      };
    }

    return {
      badge: "Waiting",
      message: "Waiting for the second fighter.",
    };
  }

  if (!opponentConnected) {
    return {
      badge: "Waiting",
      message: "Your opponent is away right now. Stay in the match and wait for them to return.",
    };
  }

  if (readyCount < 2) {
    if (!playerReady) {
      return {
        badge: "Ready up",
        message: "Both fighters are here. Ready up to signal that you want to begin the round setup.",
      };
    }

    if (!opponentReady) {
      return {
        badge: "Hold",
        message: "You are ready. Wait for the other fighter so both sides can plan the round.",
      };
    }
  }

  if (status === "planning") {
    if (playerActionSubmitted && !opponentActionSubmitted) {
      return {
        badge: "Waiting",
        message: "Your action is locked in. Wait for the other fighter to finish their pick.",
      };
    }

    return {
      badge: "Pick zones",
      message: "Choose your attack zone, set two guard zones, then lock your action for this round.",
    };
  }

  if (status === "ready_to_resolve") {
    return {
      badge: "Resolving",
      message: "Both actions are locked in. The round result is being shown below.",
    };
  }

  return {
    badge: status ?? "Live",
    message: "Stay with the match and follow the next visible battle update from this panel.",
  };
}

export function resolveOnlineDuelMatchmakingStatus({
  matchmakingMode,
  searchActive,
  duelId,
  joinedCount,
  status,
  timedOut,
}: {
  matchmakingMode: boolean;
  searchActive: boolean;
  duelId: string | null;
  joinedCount: number;
  status?: string;
  timedOut: boolean;
}): OnlineDuelMatchmakingStatus | null {
  if (!matchmakingMode) {
    return null;
  }

  if (!searchActive && !duelId) {
    return {
      tone: "warning",
      badge: "Search paused",
      message: "Matchmaking is paused. Start the search again when you want to look for a live rival.",
    };
  }

  if (searchActive && duelId && joinedCount < 2 && status === "waiting_for_players") {
    if (timedOut) {
      return {
        tone: "warning",
        badge: "Search timeout",
        message: "No rival joined in time. You can stop searching now or keep this queue open a bit longer.",
      };
    }

    return {
      tone: "info",
      badge: "Searching",
      message: "The queue is live. As soon as another fighter joins, this room will turn into a real match.",
    };
  }

  return null;
}

export function activeParticipantIsReady(sync: OnlineDuelStateSync | null, fallbackSeat: string) {
  if (!sync) {
    return false;
  }

  return sync.participants.find((participant) => participant.seat === (sync.yourSeat ?? fallbackSeat))?.ready ?? false;
}

export function resolveWinnerName(sync: OnlineDuelStateSync | null) {
  if (!sync?.winnerSeat) {
    return null;
  }

  return sync.participants.find((participant) => participant.seat === sync.winnerSeat)?.displayName ?? sync.winnerSeat;
}

export function resolvePresetById(presetId: string): CombatBuildPreset | null {
  return combatBuildPresets.find((preset) => preset.id === presetId) ?? null;
}

export function createOnlineBuildSelection(
  presetId: string,
  fighterName: string
): OnlineBuildSelection {
  const preset = resolvePresetById(presetId) ?? combatBuildPresets[0];
  if (!preset) {
    throw new Error("missing_online_preset");
  }

  const inventory = createStarterInventory();
  const presetState = buildSandboxPresetState({
    inventory,
    preset: {
      loadout: preset.loadout,
      allocations: preset.allocations,
      skillLoadout: preset.skillLoadout,
    },
  });
  const equipmentBonuses = getEquipmentBonuses(presetState.equipment, inventory);
  const baseCharacter = requireSandboxCharacter(fighterName);
  const character = applySandboxAllocations(baseCharacter, preset.allocations);

  return {
    presetId: preset.id,
    inventory,
    equipmentState: presetState.equipment,
    equippedSkillIds: presetState.equippedSkillIds,
    equipment: playerEquipmentSlots.map((slot) => ({
      slot,
      item: inventory.entries.find((entry) => entry.item.code === presetState.equipment.slots[slot])?.item ?? null,
    })),
    snapshot: buildCombatSnapshot({
      character,
      flatBonuses: equipmentBonuses.flatBonuses,
      percentBonuses: equipmentBonuses.percentBonuses,
      baseDamage: equipmentBonuses.baseDamage,
      baseArmor: equipmentBonuses.baseArmor,
      baseZoneArmor: equipmentBonuses.baseZoneArmor,
      armorBySlot: equipmentBonuses.armorBySlot,
      zoneArmorBySlot: equipmentBonuses.zoneArmorBySlot,
      combatBonuses: equipmentBonuses.combatBonuses,
      preferredDamageType: equipmentBonuses.preferredDamageType,
      weaponClass: equipmentBonuses.mainHandWeaponClass,
    }),
  };
}

export function getOnlineSelectedActionLabel({
  duelId,
  playerReady,
  showPlanner,
  matchLocked,
  draft,
  playerActionSubmitted,
  availableSkills,
  availableConsumables,
}: {
  duelId: string | null;
  playerReady: boolean;
  showPlanner: boolean;
  matchLocked: boolean;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
}) {
  const selectedAction = draft.selectedAction;

  if (!duelId) return "Open Match";
  if (matchLocked) return "Fight Complete";
  if (!playerReady) return "Ready Check";
  if (!showPlanner) return "Waiting for Rival";
  if (playerActionSubmitted) return "Action Locked";
  if (selectedAction.kind === "skill_attack") {
    return availableSkills.find((skill) => skill.id === selectedAction.skillId)?.name ?? "Skill";
  }
  if (selectedAction.kind === "consumable") {
    return availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item.name ?? "Consumable";
  }
  return `${zoneLabels[draft.attackZone]} Strike`;
}

export function getOnlineSelectedActionTags({
  duelId,
  playerReady,
  showPlanner,
  currentStepBadge,
  draft,
  playerActionSubmitted,
  availableSkills,
  availableConsumables,
}: {
  duelId: string | null;
  playerReady: boolean;
  showPlanner: boolean;
  currentStepBadge: string;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
}) {
  const selectedAction = draft.selectedAction;

  if (!duelId) return ["Open"];
  if (!playerReady) return [currentStepBadge, "Ready Check"];
  if (!showPlanner) return [currentStepBadge, "Waiting"];
  const baseTags = [
    currentStepBadge,
    playerActionSubmitted ? "Locked" : "Planning",
    `Intent ${formatCombatIntentLabel(draft.intent)}`,
    `Target ${zoneLabels[draft.attackZone]}`,
  ];
  if (selectedAction.kind === "skill_attack") {
    const skill = availableSkills.find((entry) => entry.id === selectedAction.skillId) ?? null;
    return [...baseTags, "Skill", skill?.damageMultiplier ? `Damage x${skill.damageMultiplier.toFixed(2)}` : "Skill"];
  }
  if (selectedAction.kind === "consumable") {
    const consumable = availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null;
    return [
      ...baseTags,
      selectedAction.usageMode === "with_attack" ? "With Attack" : "Separate Action",
      consumable?.consumableEffect?.heal ? `Heal ${consumable.consumableEffect.heal} HP` : "Consumable",
    ];
  }
  return baseTags;
}

export function getOnlineSelectedActionSummary({
  duelId,
  currentStepMessage,
  opponentState,
  draft,
  playerActionSubmitted,
  showPlanner,
  availableSkills,
  availableConsumables,
}: {
  duelId: string | null;
  currentStepMessage: string;
  opponentState: string;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  showPlanner: boolean;
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
}) {
  const selectedAction = draft.selectedAction;

  if (!duelId) return ["Create or join a duel.", "Wait for both fighters.", "Battle planning unlocks in the room."];
  if (!showPlanner) return [currentStepMessage, `Opponent ${opponentState}`, playerActionSubmitted ? "Action locked." : "Waiting for round planning."];
  if (selectedAction.kind === "skill_attack") {
    const skill = availableSkills.find((entry) => entry.id === selectedAction.skillId) ?? null;
    return [
      playerActionSubmitted ? "Your action is locked in." : "Skill selected for this round.",
      ...(formatSkillDetailLines(skill).slice(0, 2)),
      `Intent: ${formatCombatIntentLabel(draft.intent)}.`,
    ];
  }
  if (selectedAction.kind === "consumable") {
    const consumable = availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null;
    return [
      playerActionSubmitted ? "Your action is locked in." : "Consumable selected for this round.",
      ...(formatConsumableDetailLines(consumable).slice(0, 2)),
      `Intent: ${formatCombatIntentLabel(draft.intent)}.`,
    ];
  }
  return [
    playerActionSubmitted ? "Your action is locked in." : "Choose attack and block zones.",
    `Attack ${zoneLabels[draft.attackZone]}`,
    `Guard ${draft.defenseZones.map((zone) => zoneLabels[zone]).join(" + ")}`,
    `Intent: ${formatCombatIntentLabel(draft.intent)}.`,
  ];
}

export function resolveOnlineDuelLiveStatus({
  duelId,
  transportSource,
  transportIssue,
  matchStatus,
  joinedCount,
  playerConnected,
  opponentConnected,
}: {
  duelId: string | null;
  transportSource: TransportSource;
  transportIssue: string | null;
  matchStatus?: string;
  joinedCount: number;
  playerConnected: boolean;
  opponentConnected: boolean;
}): OnlineDuelLiveStatus | null {
  if (transportSource === "checking") {
    return {
      tone: "info",
      badge: "Checking room",
      message: "Checking the live room connection before the next PvP update.",
    };
  }

  if (transportIssue === "displaced_session") {
    return {
      tone: "danger",
      badge: "Session replaced",
      message: "This fighter was opened in a newer session. Rejoin the match from the latest window to continue.",
    };
  }

  if (transportIssue === "live_service_required") {
    return {
      tone: "danger",
      badge: "Live service offline",
      message: "The public PvP service is offline right now. Start the live backend before opening this match.",
    };
  }

  if (transportIssue === "duel_not_found" || matchStatus === "abandoned") {
    return {
      tone: "danger",
      badge: "Match closed",
      message: "This room is no longer active. Leave the match and open a fresh duel when you are ready.",
    };
  }

  if (transportIssue === "event_stream_error" || transportIssue === "missing_resume_token" || transportIssue === "online_duel_transport_error") {
    return {
      tone: "warning",
      badge: "Reconnecting",
      message: "Live updates dropped for a moment. The fight is trying to resync your room now.",
    };
  }

  if (transportIssue === "stale_sync" || transportIssue === "combat_not_active") {
    return {
      tone: "warning",
      badge: "Syncing room",
      message: "Your room state is catching up to the latest round before the next action can continue.",
    };
  }

  if (transportIssue === "participant_disconnected") {
    return {
      tone: "warning",
      badge: "Opponent away",
      message: "The other fighter is disconnected right now. Stay in the room and the duel can continue when they return.",
    };
  }

  if (duelId && !playerConnected) {
    return {
      tone: "warning",
      badge: "Rejoining seat",
      message: "Your seat is marked offline for a moment. Stay on this page while the room reconnects.",
    };
  }

  if (duelId && joinedCount >= 2 && !opponentConnected) {
    return {
      tone: "warning",
      badge: "Opponent disconnected",
      message: "Your opponent stepped out of the live room. Their seat can resume the same fight when they reconnect.",
    };
  }

  return null;
}

export function resolveOnlineDuelRecoveryAction({
  transportIssue,
  matchStatus,
  playerConnected,
  opponentConnected,
  joinedCount,
}: {
  transportIssue: string | null;
  matchStatus?: string;
  playerConnected: boolean;
  opponentConnected: boolean;
  joinedCount: number;
}): OnlineDuelRecoveryAction | null {
  if (transportIssue === "displaced_session" || transportIssue === "duel_not_found" || matchStatus === "abandoned") {
    return {
      kind: "leave",
      label: "Leave Fight",
    };
  }

  if (
    transportIssue === "event_stream_error" ||
    transportIssue === "missing_resume_token" ||
    transportIssue === "online_duel_transport_error" ||
    transportIssue === "stale_sync" ||
    transportIssue === "combat_not_active" ||
    !playerConnected ||
    (joinedCount >= 2 && !opponentConnected)
  ) {
    return {
      kind: "refresh",
      label: "Refresh Room",
    };
  }

  return null;
}
