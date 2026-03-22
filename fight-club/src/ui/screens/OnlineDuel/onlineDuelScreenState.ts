import type { OnlineDuelStateSync } from "@/modules/arena";
import type { OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import { createBattleLogEntries } from "@/ui/components/combat/battleLogFormatting";
import { buildProfileDerivedStats, resolvePresetFigure } from "@/ui/screens/Combat/combatSandboxScreenDerived";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import {
  activeParticipantIsReady,
  getCurrentStepSummary,
  getMatchStatusSummary,
  getOnlineSelectedActionLabel,
  getOnlineSelectedActionSummary,
  getOnlineSelectedActionTags,
  pickMostCompleteSync,
  resolveCombatLoadoutForMode,
  resolveCombatantSummary,
  resolveFighterViewFigure,
  resolveOnlineDuelLiveStatus,
  resolveOnlineDuelMatchmakingStatus,
  resolveOnlineDuelRecoveryAction,
  resolveWinnerName,
  totalArmorProfileValue,
  totalDamageProfileValue,
  type ClientMode,
  type OnlineBuildSelection,
  type TransportSource,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

interface BuildOnlineDuelScreenStateArgs {
  launchedFromLobby: boolean;
  initialEntryMode: "create" | "join" | "matchmaking";
  playerMode: ClientMode;
  debugClientMode: ClientMode;
  preparedPlayer: PvpPreparedFighter | null;
  hostBuild: OnlineBuildSelection;
  guestBuild: OnlineBuildSelection;
  hostSeat: string;
  guestSeat: string;
  duelId: string | null;
  transportSource: TransportSource;
  transportIssue: string | null;
  matchmakingMode: boolean;
  matchmakingSearchActive: boolean;
  matchmakingTimedOut: boolean;
  hostSync: OnlineDuelStateSync | null;
  guestSync: OnlineDuelStateSync | null;
  hostDraft: RoundDraft;
  guestDraft: RoundDraft;
  hostActionSubmitting: boolean;
  guestActionSubmitting: boolean;
}

export function buildOnlineDuelScreenState({
  launchedFromLobby,
  initialEntryMode,
  playerMode,
  debugClientMode,
  preparedPlayer,
  hostBuild,
  guestBuild,
  hostSeat,
  guestSeat,
  duelId,
  transportSource,
  transportIssue,
  matchmakingMode,
  matchmakingSearchActive,
  matchmakingTimedOut,
  hostSync,
  guestSync,
  hostDraft,
  guestDraft,
  hostActionSubmitting,
  guestActionSubmitting,
}: BuildOnlineDuelScreenStateArgs) {
  const resolvedHostSeat: OnlineDuelSeat = hostSeat === "playerB" ? "playerB" : "playerA";
  const resolvedGuestSeat: OnlineDuelSeat = guestSeat === "playerA" ? "playerA" : "playerB";
  const matchSync = pickMostCompleteSync(hostSync, guestSync);
  const participants = matchSync?.participants ?? [];
  const joinedCount = participants.filter((participant) => participant.connected).length;
  const readyCount = participants.filter((participant) => participant.connected && participant.ready).length;
  const winnerName = resolveWinnerName(matchSync);
  const playerSync = playerMode === "host" ? hostSync : guestSync;
  const playerSeat = playerMode === "host" ? resolvedHostSeat : resolvedGuestSeat;
  const playerBuild = playerMode === "host" ? hostBuild : guestBuild;
  const playerDraft = playerMode === "host" ? hostDraft : guestDraft;
  const playerActionBusy = playerMode === "host" ? hostActionSubmitting : guestActionSubmitting;
  const playerParticipant =
    participants.find((participant) => participant.seat === (playerSync?.yourSeat ?? playerSeat)) ?? null;
  const opponentParticipant =
    participants.find((participant) => participant.seat !== (playerSync?.yourSeat ?? playerSeat)) ?? null;
  const debugSync = debugClientMode === "host" ? hostSync : guestSync;
  const debugSeat = debugClientMode === "host" ? resolvedHostSeat : resolvedGuestSeat;
  const playerSeatOffline = Boolean(duelId) && !(playerParticipant?.connected ?? Boolean(playerSync));
  const opponentSeatOffline = Boolean(duelId) && joinedCount >= 2 && !(opponentParticipant?.connected ?? false);

  const matchStatusSummary = getMatchStatusSummary({
    duelId,
    status: matchSync?.status,
    joinedCount,
    readyCount,
    winnerName,
    transportIssue,
    opponentConnected: !opponentSeatOffline,
  });

  const playerReady = activeParticipantIsReady(playerSync, playerSeat);
  const currentStep = getCurrentStepSummary({
    duelId,
    status: matchSync?.status,
    joinedCount,
    readyCount,
    playerReady,
    opponentConnected: opponentParticipant?.connected ?? false,
    opponentReady: opponentParticipant?.ready ?? false,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    opponentActionSubmitted: playerSync?.currentRoundState?.opponentActionSubmitted ?? false,
  });

  const matchLocked = matchSync?.status === "finished" || matchSync?.status === "abandoned";
  const sessionDisplaced = transportIssue === "displaced_session";
  const roomClosed = transportIssue === "duel_not_found" || matchSync?.status === "abandoned";
  const liveStatus = resolveOnlineDuelLiveStatus({
    duelId,
    transportSource,
    transportIssue,
    matchStatus: matchSync?.status,
    joinedCount,
    playerConnected: !playerSeatOffline,
    opponentConnected: !opponentSeatOffline,
  });
  const showPlanner = matchSync?.status === "planning" || matchSync?.status === "ready_to_resolve";
  const showPlayerFacingArena = !launchedFromLobby || initialEntryMode === "join" || Boolean(duelId);
  const liveRoomRequired = launchedFromLobby;
  const liveRoomUnavailable = liveRoomRequired && !duelId && transportSource === "local";
  const matchmakingStatus = resolveOnlineDuelMatchmakingStatus({
    matchmakingMode,
    searchActive: matchmakingSearchActive,
    duelId,
    joinedCount,
    status: matchSync?.status,
    timedOut: matchmakingTimedOut,
  });

  const playerCombatLoadout = resolveCombatLoadoutForMode({
    mode: playerMode,
    playerMode,
    preparedPlayer,
    syncedLoadout: playerSync?.yourLoadout,
    hostBuild,
    guestBuild,
  });
  const opponentMode = playerMode === "host" ? "guest" : "host";
  const opponentCombatLoadout = resolveCombatLoadoutForMode({
    mode: opponentMode,
    playerMode,
    syncedLoadout: playerSync?.opponentLoadout,
    preparedPlayer,
    hostBuild,
    guestBuild,
  });

  const playerAvailableSkills = playerCombatLoadout.availableSkills;
  const playerAvailableConsumables = playerCombatLoadout.availableConsumables;
  const opponentAvailableSkills = opponentCombatLoadout.availableSkills;

  const selectedActionLabel = getOnlineSelectedActionLabel({
    duelId,
    playerReady,
    showPlanner,
    matchLocked,
    draft: playerDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    availableSkills: playerAvailableSkills,
    availableConsumables: playerAvailableConsumables,
  });
  const selectedActionTags = getOnlineSelectedActionTags({
    duelId,
    playerReady,
    showPlanner,
    currentStepBadge: currentStep.badge,
    draft: playerDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    availableSkills: playerAvailableSkills,
    availableConsumables: playerAvailableConsumables,
  });
  const selectedActionSummary = getOnlineSelectedActionSummary({
    duelId,
    currentStepMessage: currentStep.message,
    opponentState:
      opponentParticipant
        ? opponentParticipant.connected
          ? opponentParticipant.ready
            ? "Ready"
            : "Waiting"
          : "Offline"
        : "Not joined",
    draft: playerDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    showPlanner,
    availableSkills: playerAvailableSkills,
    availableConsumables: playerAvailableConsumables,
  });

  const lastResolvedRound = hostSync?.lastResolvedRound ?? guestSync?.lastResolvedRound ?? null;
  const playerActionSubmitted = playerSync?.currentRoundState?.yourActionSubmitted ?? false;
  const playerActionLocked = playerActionSubmitted || playerActionBusy;
  const playerDisplayName = playerParticipant?.displayName ?? preparedPlayer?.playerName ?? playerBuild.snapshot.name;
  const playerSnapshot = playerSync?.yourSnapshot ?? playerBuild.snapshot;
  const playerFigure = resolveFighterViewFigure(
    playerParticipant?.fighterView?.figure,
    preparedPlayer?.figure ?? resolvePresetFigure(playerBuild.presetId, playerMode === "host" ? "rush-chip" : "kitsune-bit")
  );
  const playerEquipment = playerParticipant?.fighterView?.equipment ?? playerCombatLoadout.equipment;
  const playerCombatantState =
    matchSync?.combatState?.combatants.find((combatant) => combatant.id === playerSnapshot.characterId) ?? null;
  const playerCombatantSummary = resolveCombatantSummary(
    lastResolvedRound,
    playerSnapshot.characterId,
    playerDisplayName
  );
  const playerCurrentHp =
    playerCombatantState?.currentHp ?? playerCombatantSummary?.currentHp ?? playerSnapshot.maxHp;

  const opponentBuild = playerMode === "host" ? guestBuild : hostBuild;
  const opponentSnapshot = playerSync?.opponentSnapshot ?? opponentBuild.snapshot;
  const opponentDisplayName = opponentParticipant?.displayName ?? opponentBuild.snapshot.name ?? "Rival";
  const opponentFigure = resolveFighterViewFigure(
    opponentParticipant?.fighterView?.figure,
    resolvePresetFigure(opponentBuild.presetId, "vermin-tek")
  );
  const opponentEquipment = opponentParticipant?.fighterView?.equipment ?? opponentBuild.equipment;
  const opponentCombatantState =
    matchSync?.combatState?.combatants.find((combatant) => combatant.id === opponentSnapshot.characterId) ?? null;
  const opponentCombatantSummary = resolveCombatantSummary(
    lastResolvedRound,
    opponentSnapshot.characterId,
    opponentDisplayName
  );
  const opponentCurrentHp =
    opponentCombatantState?.currentHp ?? opponentCombatantSummary?.currentHp ?? opponentSnapshot.maxHp;
  const playerResources = playerCombatantState?.resources ?? null;
  const opponentResources = opponentCombatantState?.resources ?? null;
  const battleLogEntries = createBattleLogEntries(
    matchSync?.combatState ?? null,
    playerSnapshot.characterId,
    opponentSnapshot.characterId
  );
  const combatLog = matchSync?.combatState?.log ?? [];
  const activeRoomCode = hostSync?.roomCode ?? guestSync?.roomCode ?? "";
  const primaryFightControlLabel = matchLocked
    ? "Match Closed"
    : showPlanner
      ? playerActionSubmitted
        ? "Action Locked"
        : "Planning"
      : playerReady
        ? "Cancel Ready"
        : "Ready Up";
  const primaryFightControlAriaLabel = matchLocked
    ? "Match Closed"
    : showPlanner
      ? playerActionSubmitted
        ? "Action Locked"
        : "Planning phase"
      : playerReady
        ? "Cancel Ready"
        : "Ready Up";

  const playerProfileDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(playerSnapshot.damage),
    stats: playerSnapshot.stats,
    totalArmor: totalArmorProfileValue(playerSnapshot.armor),
    dodgeBonus: playerSnapshot.dodgeChanceBonus,
    critBonus: playerSnapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + playerSnapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: playerSnapshot.blockPowerBonus,
    armorPenetrationPercent: playerSnapshot.armorPenetrationPercent,
  });
  const opponentProfileDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(opponentSnapshot.damage),
    stats: opponentSnapshot.stats,
    totalArmor: totalArmorProfileValue(opponentSnapshot.armor),
    dodgeBonus: opponentSnapshot.dodgeChanceBonus,
    critBonus: opponentSnapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + opponentSnapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: opponentSnapshot.blockPowerBonus,
    armorPenetrationPercent: opponentSnapshot.armorPenetrationPercent,
  });
  const playerDerivedStats = playerProfileDerivedStats.slice(0, 4);
  const opponentDerivedStats = opponentProfileDerivedStats.slice(0, 4);
  const combatInteractionBlocked = matchLocked || sessionDisplaced || roomClosed || playerSeatOffline;
  const actionsDisabled = transportSource === "checking" || combatInteractionBlocked;
  const entryActionsDisabled = actionsDisabled || liveRoomUnavailable;
  const recoveryActionConfig = resolveOnlineDuelRecoveryAction({
    transportIssue,
    matchStatus: matchSync?.status,
    playerConnected: !playerSeatOffline,
    opponentConnected: !opponentSeatOffline,
    joinedCount,
  });

  return {
    resolvedHostSeat,
    resolvedGuestSeat,
    matchSync,
    participants,
    joinedCount,
    readyCount,
    winnerName,
    playerSync,
    playerSeat,
    playerBuild,
    playerDraft,
    playerParticipant,
    opponentParticipant,
    debugSync,
    debugSeat,
    playerSeatOffline,
    opponentSeatOffline,
    matchStatusSummary,
    currentStep,
    matchLocked,
    playerReady,
    sessionDisplaced,
    roomClosed,
    liveStatus,
    showPlanner,
    showPlayerFacingArena,
    liveRoomRequired,
    liveRoomUnavailable,
    matchmakingStatus,
    playerCombatLoadout,
    opponentCombatLoadout,
    playerAvailableSkills,
    playerAvailableConsumables,
    opponentAvailableSkills,
    selectedActionLabel,
    selectedActionTags,
    selectedActionSummary,
    lastResolvedRound,
    playerActionSubmitted,
    playerActionLocked,
    playerDisplayName,
    playerSnapshot,
    playerFigure,
    playerEquipment,
    playerCombatantState,
    playerCurrentHp,
    opponentBuild,
    opponentSnapshot,
    opponentDisplayName,
    opponentFigure,
    opponentEquipment,
    opponentCombatantState,
    opponentCurrentHp,
    playerResources,
    opponentResources,
    battleLogEntries,
    combatLog,
    activeRoomCode,
    primaryFightControlLabel,
    primaryFightControlAriaLabel,
    playerProfileDerivedStats,
    opponentProfileDerivedStats,
    playerDerivedStats,
    opponentDerivedStats,
    combatInteractionBlocked,
    actionsDisabled,
    entryActionsDisabled,
    recoveryActionConfig,
  };
}
