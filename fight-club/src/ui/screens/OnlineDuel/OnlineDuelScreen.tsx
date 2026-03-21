import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Inventory } from "@/modules/inventory";
import { getEquipmentBonuses } from "@/modules/equipment";
import type { Equipment } from "@/modules/equipment";
import {
  subscribeToOnlineDuelEvents,
  type OnlineDuelClient,
  type OnlineDuelEventSubscription,
  type OnlineDuelServerMessage,
} from "@/modules/arena";
import { combatZones, type CombatZone } from "@/modules/combat";
import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";
import {
  createRoundDraft,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  setRoundDraftAttackZone,
  setRoundDraftConsumable,
  setRoundDraftIntent,
  setRoundDraftSkill,
  toggleRoundDraftDefenseZone,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";
import { createBattleLogEntries } from "@/ui/components/combat/battleLogFormatting";
import { BattleLogSection } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { ArenaStageColumns, ArenaStageShell, SidePanel } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { buildProfileDerivedStats, resolvePresetFigure } from "@/ui/screens/Combat/combatSandboxScreenDerived";
import { FightControlsPanel } from "@/ui/screens/Combat/combatSandboxScreenControls";
import { AttackTargetRoundPanel } from "@/ui/screens/Combat/combatSandboxScreenTargeting";
import { ResourceGrid } from "@/ui/screens/Combat/combatSandboxScreenResourceGrid";
import {
  OnlineCombatActionsPanel,
  OnlineOpponentCombatPanel,
  OnlinePlayerCombatPanel,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenPanels";
import {
  MatchFinishCard,
  RoundPlannerCard,
  RoundResultCard,
  SyncView,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenCards";
import { PresetChooser } from "@/ui/screens/OnlineDuel/onlineDuelScreenLobby";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";
import {
  activeParticipantIsReady,
  buildClientFighterView,
  buildOnlineParticipantLoadout,
  createOnlineBuildSelection,
  getOnlineSelectedActionLabel,
  getOnlineSelectedActionSummary,
  getOnlineSelectedActionTags,
  getCurrentStepSummary,
  getMatchStatusSummary,
  ONLINE_DUEL_MATCHMAKING_TIMEOUT_MS,
  resolveOnlineDuelRecoveryAction,
  resolveOnlineDuelLiveStatus,
  resolveOnlineDuelMatchmakingStatus,
  pickMostCompleteSync,
  resolveCombatLoadoutForMode,
  resolveCombatantSummary,
  resolveFighterViewFigure,
  resolveOnlineActionClientMode,
  resolveOnlineRealtimeClientModes,
  resolvePresetById,
  resolveWinnerName,
  totalArmorProfileValue,
  totalDamageProfileValue,
  type OnlineDuelLiveStatus,
  type ClientMode,
  type EntryMode,
  type OnlineAvailableConsumable,
  type OnlineAvailableSkill,
  type OnlineBuildSelection,
  type TransportSource,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";
import {
  canReachOnlineDuelBackend,
  createOnlineSetupForScreen,
  describeTransportIssue,
  getOnlineDuelBackendBaseUrl,
  shouldRecoverFromSubmitError,
  shouldRefreshClientsAfterRoundResolution,
  transportBadgeLabel,
  type OnlineDuelSetup,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSetup";

export { resolveOnlineActionClientMode, resolveOnlineRealtimeClientModes } from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

interface OnlineDuelScreenProps {
  onBack: () => void;
  initialEntryMode?: "create" | "join" | "matchmaking";
  preparedPlayer?: PvpPreparedFighter | null;
  initialJoinCode?: string;
}

const onlineIntentVisuals: Record<
  RoundDraft["intent"],
  {
    accent: string;
    border: string;
    fill: string;
    glow: string;
  }
> = {
  neutral: {
    accent: "#f0a286",
    border: "rgba(240,162,134,0.34)",
    fill: "rgba(240,162,134,0.12)",
    glow: "rgba(240,162,134,0.22)",
  },
  aggressive: {
    accent: "#ee9abb",
    border: "rgba(238,154,187,0.36)",
    fill: "rgba(238,154,187,0.14)",
    glow: "rgba(238,154,187,0.24)",
  },
  guarded: {
    accent: "#b7d5ff",
    border: "rgba(183,213,255,0.36)",
    fill: "rgba(183,213,255,0.14)",
    glow: "rgba(183,213,255,0.24)",
  },
  precise: {
    accent: "#87e2cf",
    border: "rgba(135,226,207,0.36)",
    fill: "rgba(135,226,207,0.14)",
    glow: "rgba(135,226,207,0.24)",
  },
};

const onlinePlayerIntentSilhouetteTone: Record<
  RoundDraft["intent"],
  {
    accent: string;
    fill: string;
    edge: string;
    glow: string;
  }
> = {
  neutral: {
    accent: "#f0a286",
    fill: "rgba(240,162,134,0.11)",
    edge: "rgba(240,162,134,0.28)",
    glow: "rgba(240,162,134,0.18)",
  },
  aggressive: {
    accent: "#ee9abb",
    fill: "rgba(238,154,187,0.12)",
    edge: "rgba(238,154,187,0.3)",
    glow: "rgba(238,154,187,0.2)",
  },
  guarded: {
    accent: "#b7d5ff",
    fill: "rgba(183,213,255,0.12)",
    edge: "rgba(183,213,255,0.3)",
    glow: "rgba(183,213,255,0.2)",
  },
  precise: {
    accent: "#87e2cf",
    fill: "rgba(135,226,207,0.12)",
    edge: "rgba(135,226,207,0.3)",
    glow: "rgba(135,226,207,0.2)",
  },
};

export function OnlineDuelScreen({
  onBack,
  initialEntryMode = "create",
  preparedPlayer = null,
  initialJoinCode = "",
}: OnlineDuelScreenProps) {
  const launchedFromLobby = preparedPlayer !== null;
  const matchmakingMode = launchedFromLobby && initialEntryMode === "matchmaking";
  const screenInstanceIdRef = useRef(Math.random().toString(36).slice(2, 10));
  const setupRef = useRef(
    createOnlineSetupForScreen({
      mode: "local",
      baseUrl: getOnlineDuelBackendBaseUrl(),
      matchmakingIdentity:
        matchmakingMode && preparedPlayer
          ? {
              playerId: `match-${screenInstanceIdRef.current}`,
              sessionId: `match-session-${screenInstanceIdRef.current}`,
              displayName: preparedPlayer.playerName,
            }
          : undefined,
    })
  );
  const autoStartedRef = useRef(false);
  const hostSubscriptionRef = useRef<OnlineDuelEventSubscription | null>(null);
  const guestSubscriptionRef = useRef<OnlineDuelEventSubscription | null>(null);
  const hostLastEventIdRef = useRef<string | null>(null);
  const guestLastEventIdRef = useRef<string | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OnlineDuelServerMessage[]>([]);
  const [hostSeat, setHostSeat] = useState<string>("playerA");
  const [guestSeat, setGuestSeat] = useState<string>("playerB");
  const [joinCode, setJoinCode] = useState<string>(initialJoinCode);
  const [hostBuild, setHostBuild] = useState<OnlineBuildSelection>(() =>
    createOnlineBuildSelection(combatBuildPresets[0]?.id ?? "sword-bleed", "Host")
  );
  const [guestBuild, setGuestBuild] = useState<OnlineBuildSelection>(() =>
    createOnlineBuildSelection(combatBuildPresets[2]?.id ?? "dagger-crit", "Guest")
  );
  const [playerMode, setPlayerMode] = useState<ClientMode>("host");
  const [debugClientMode, setDebugClientMode] = useState<ClientMode>("host");
  const [entryMode, setEntryMode] = useState<EntryMode>(initialEntryMode === "join" ? "join" : "create");
  const [debugOpen, setDebugOpen] = useState(false);
  const [hostDraft, setHostDraft] = useState<RoundDraft>(() => createRoundDraft());
  const [guestDraft, setGuestDraft] = useState<RoundDraft>(() => createRoundDraft());
  const [hostActionSubmitting, setHostActionSubmitting] = useState(false);
  const [guestActionSubmitting, setGuestActionSubmitting] = useState(false);
  const [transportSource, setTransportSource] = useState<TransportSource>("checking");
  const [transportIssue, setTransportIssue] = useState<string | null>(null);
  const [matchmakingSearchActive, setMatchmakingSearchActive] = useState(initialEntryMode === "matchmaking");
  const [matchmakingTimedOut, setMatchmakingTimedOut] = useState(false);
  const [, setClientRefresh] = useState(0);

  useEffect(() => {
    let disposed = false;

    async function resolveTransport() {
      const backendBaseUrl = getOnlineDuelBackendBaseUrl();
      const backendAvailable = await canReachOnlineDuelBackend(backendBaseUrl);
      if (disposed) {
        return;
      }

      setupRef.current = createOnlineSetupForScreen({
        mode: backendAvailable ? "backend" : "local",
        baseUrl: backendBaseUrl,
        matchmakingIdentity:
          matchmakingMode && preparedPlayer
            ? {
                playerId: `match-${screenInstanceIdRef.current}`,
                sessionId: `match-session-${screenInstanceIdRef.current}`,
                displayName: preparedPlayer.playerName,
              }
            : undefined,
      });
      setTransportSource(backendAvailable ? "backend" : "local");
      setTransportIssue(backendAvailable || !launchedFromLobby ? null : "live_service_required");
      setClientRefresh((current) => current + 1);
    }

    void resolveTransport();

    return () => {
      disposed = true;
    };
  }, [matchmakingMode, preparedPlayer]);

  useEffect(() => {
    return () => {
      hostSubscriptionRef.current?.close();
      guestSubscriptionRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!preparedPlayer) {
      return;
    }

    const preparedBuild: OnlineBuildSelection = {
      presetId: "custom",
      snapshot: preparedPlayer.snapshot,
      equipmentState: preparedPlayer.equipmentState,
      inventory: preparedPlayer.inventory,
      equippedSkillIds: preparedPlayer.equippedSkillIds,
      equipment: preparedPlayer.equipment,
    };

    if (initialEntryMode === "join") {
      setGuestBuild(preparedBuild);
      setPlayerMode("guest");
      setDebugClientMode("guest");
      setEntryMode("join");
      return;
    }

    setHostBuild(preparedBuild);
    setPlayerMode("host");
    setDebugClientMode("host");
    setEntryMode("create");
  }, [initialEntryMode, preparedPlayer]);

  useEffect(() => {
    setJoinCode(initialJoinCode);
  }, [initialJoinCode]);

  useEffect(() => {
    if (
      !launchedFromLobby ||
      initialEntryMode !== "create" ||
      duelId ||
      transportSource === "checking" ||
      transportSource !== "backend" ||
      autoStartedRef.current
    ) {
      return;
    }

    autoStartedRef.current = true;
    void handleCreateDuel();
  }, [duelId, initialEntryMode, launchedFromLobby, transportSource]);

  useEffect(() => {
    if (
      !launchedFromLobby ||
      initialEntryMode !== "join" ||
      duelId ||
      transportSource === "checking" ||
      transportSource !== "backend" ||
      autoStartedRef.current ||
      !joinCode.trim()
    ) {
      return;
    }

    autoStartedRef.current = true;
    void handleJoinDuel();
  }, [duelId, initialEntryMode, joinCode, launchedFromLobby, transportSource]);

  useEffect(() => {
    if (
      !launchedFromLobby ||
      initialEntryMode !== "matchmaking" ||
      !matchmakingSearchActive ||
      duelId ||
      transportSource === "checking" ||
      transportSource !== "backend" ||
      autoStartedRef.current
    ) {
      return;
    }

    autoStartedRef.current = true;
    void handleFindMatchmakingDuel();
  }, [duelId, initialEntryMode, launchedFromLobby, matchmakingSearchActive, transportSource]);

  const hostSync = setupRef.current.hostClient.getLastSync();
  const guestSync = setupRef.current.guestClient.getLastSync();
  const resolvedHostSeat = hostSeat === "playerB" ? "playerB" : "playerA";
  const resolvedGuestSeat = guestSeat === "playerA" ? "playerA" : "playerB";
  const matchSync = pickMostCompleteSync(hostSync, guestSync);
  const participants = matchSync?.participants ?? [];
  const joinedCount = participants.filter((participant) => participant.connected).length;
  const readyCount = participants.filter((participant) => participant.connected && participant.ready).length;
  const winnerName = resolveWinnerName(matchSync);
  const playerSync = playerMode === "host" ? hostSync : guestSync;
  const playerSeat = playerMode === "host" ? resolvedHostSeat : resolvedGuestSeat;
  const playerBuild = playerMode === "host" ? hostBuild : guestBuild;
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
  const currentStep = getCurrentStepSummary({
    duelId,
    status: matchSync?.status,
    joinedCount,
    readyCount,
    playerReady: activeParticipantIsReady(playerSync, playerSeat),
    opponentConnected: opponentParticipant?.connected ?? false,
    opponentReady: opponentParticipant?.ready ?? false,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    opponentActionSubmitted: playerSync?.currentRoundState?.opponentActionSubmitted ?? false,
  });
  const matchLocked = matchSync?.status === "finished" || matchSync?.status === "abandoned";
  const playerReady = activeParticipantIsReady(playerSync, playerSeat);
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
  const showPlayerFacingArena =
    !launchedFromLobby || initialEntryMode === "join" || Boolean(duelId);
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

  useEffect(() => {
    if (
      !matchmakingMode ||
      !matchmakingSearchActive ||
      !duelId ||
      matchSync?.status !== "waiting_for_players" ||
      joinedCount >= 2
    ) {
      setMatchmakingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMatchmakingTimedOut(true);
    }, ONLINE_DUEL_MATCHMAKING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duelId, joinedCount, matchmakingMode, matchmakingSearchActive, matchSync?.status]);
  const playerEquipmentBonuses = getEquipmentBonuses(playerCombatLoadout.equipmentState, playerCombatLoadout.inventory);
  const playerAvailableSkills = playerEquipmentBonuses.skills.filter((skill) =>
    playerCombatLoadout.equippedSkillIds.includes(skill.id)
  );
  const playerAvailableConsumables = playerCombatLoadout.inventory.entries.filter(
    (entry) => entry.item.consumableEffect && entry.quantity > 0
  );
  const selectedActionLabel = getOnlineSelectedActionLabel({
    duelId,
    playerReady,
    showPlanner,
    matchLocked,
    draft: playerMode === "host" ? hostDraft : guestDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    availableSkills: playerAvailableSkills,
    availableConsumables: playerAvailableConsumables,
  });
  const selectedActionTags = getOnlineSelectedActionTags({
    duelId,
    playerReady,
    showPlanner,
    currentStepBadge: currentStep.badge,
    draft: playerMode === "host" ? hostDraft : guestDraft,
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
    draft: playerMode === "host" ? hostDraft : guestDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
    showPlanner,
    availableSkills: playerAvailableSkills,
    availableConsumables: playerAvailableConsumables,
  });
  const lastResolvedRound = hostSync?.lastResolvedRound ?? guestSync?.lastResolvedRound ?? null;
  const playerActionSubmitted = playerSync?.currentRoundState?.yourActionSubmitted ?? false;
  const playerActionBusy = playerMode === "host" ? hostActionSubmitting : guestActionSubmitting;
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
  const playerCombatantSummary = resolveCombatantSummary(lastResolvedRound, playerDisplayName);
  const playerCurrentHp =
    playerCombatantState?.currentHp ?? playerCombatantSummary?.currentHp ?? playerSnapshot.maxHp;
  const opponentBuild = playerMode === "host" ? guestBuild : hostBuild;
  const opponentSnapshot = playerSync?.opponentSnapshot ?? opponentBuild.snapshot;
  const opponentFallbackName = opponentParticipant?.displayName ?? opponentBuild.snapshot.name ?? "Rival";
  const opponentFigure = resolveFighterViewFigure(
    opponentParticipant?.fighterView?.figure,
    resolvePresetFigure(opponentBuild.presetId, "vermin-tek")
  );
  const opponentEquipment = opponentParticipant?.fighterView?.equipment ?? opponentBuild.equipment;
  const opponentCombatantState =
    matchSync?.combatState?.combatants.find((combatant) => combatant.id === opponentSnapshot.characterId) ?? null;
  const opponentCombatantSummary = resolveCombatantSummary(lastResolvedRound, opponentFallbackName);
  const opponentCurrentHp =
    opponentCombatantState?.currentHp ?? opponentCombatantSummary?.currentHp ?? opponentSnapshot.maxHp;
  const battleLogEntries = createBattleLogEntries(
    matchSync?.combatState ?? null,
    playerSnapshot.characterId,
    opponentSnapshot.characterId
  );
  const playerDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(playerSnapshot.damage),
    stats: playerSnapshot.stats,
    totalArmor: totalArmorProfileValue(playerSnapshot.armor),
    dodgeBonus: playerSnapshot.dodgeChanceBonus,
    critBonus: playerSnapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + playerSnapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: playerSnapshot.blockPowerBonus,
    armorPenetrationPercent: playerSnapshot.armorPenetrationPercent,
  }).slice(0, 4);
  const opponentDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(opponentSnapshot.damage),
    stats: opponentSnapshot.stats,
    totalArmor: totalArmorProfileValue(opponentSnapshot.armor),
    dodgeBonus: opponentSnapshot.dodgeChanceBonus,
    critBonus: opponentSnapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + opponentSnapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: opponentSnapshot.blockPowerBonus,
    armorPenetrationPercent: opponentSnapshot.armorPenetrationPercent,
  }).slice(0, 4);
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
  const recoveryAction = recoveryActionConfig
    ? {
        label: recoveryActionConfig.label,
        onClick:
          recoveryActionConfig.kind === "leave"
            ? () => void handleLeaveRoom()
            : () => void (playerMode === "host" ? handleHostSync() : handleGuestSync()),
      }
    : null;

  function record(nextMessages: OnlineDuelServerMessage[]) {
    setMessages((current) => [...nextMessages, ...current].slice(0, 18));
  }

  function applyInboundMessages(
    nextMessages: OnlineDuelServerMessage[],
    eventIds?: Partial<Record<ClientMode, string>>
  ) {
    let appliedSync = false;
    const latestError = [...nextMessages].reverse().find((message) => message.type === "duel_error");
    if (eventIds?.host) {
      hostLastEventIdRef.current = eventIds.host;
    }
    if (eventIds?.guest) {
      guestLastEventIdRef.current = eventIds.guest;
    }

    const latestHostSync = [...nextMessages]
      .reverse()
      .find(
        (message) =>
          message.type === "duel_state_sync" &&
          message.payload.yourSeat === (hostSeat === "playerB" ? "playerB" : "playerA")
      );
    if (latestHostSync?.type === "duel_state_sync") {
      appliedSync = setupRef.current.hostClient.acceptServerMessage(latestHostSync) || appliedSync;
    }

    const latestGuestSync = [...nextMessages]
      .reverse()
      .find(
        (message) =>
          message.type === "duel_state_sync" &&
          message.payload.yourSeat === (guestSeat === "playerA" ? "playerA" : "playerB")
      );
    if (latestGuestSync?.type === "duel_state_sync") {
      appliedSync = setupRef.current.guestClient.acceptServerMessage(latestGuestSync) || appliedSync;
    }

    record(nextMessages);
    if (appliedSync) {
      setTransportIssue(null);
      setClientRefresh((current) => current + 1);
      return;
    }

    if (latestError?.type === "duel_error") {
      setTransportIssue(latestError.reason);
    }
  }

  function getRealtimeClientModes(modeOverride?: ClientMode): ClientMode[] {
    return resolveOnlineRealtimeClientModes({
      launchedFromLobby,
      playerMode,
      modeOverride,
    });
  }

  function getClientForMode(mode: ClientMode) {
    return mode === "host" ? setupRef.current.hostClient : setupRef.current.guestClient;
  }

  function getCombatLoadoutForMode(mode: ClientMode) {
    return resolveCombatLoadoutForMode({
      mode,
      playerMode,
      preparedPlayer,
      hostBuild,
      guestBuild,
    });
  }

  async function recoverRealtimeState(nextDuelId: string, modeOverride?: ClientMode) {
    const nextMessages = await Promise.all(
      getRealtimeClientModes(modeOverride).map((mode) =>
        runClientAction(() => getClientForMode(mode).requestSync(nextDuelId))
      )
    );
    applyInboundMessages(nextMessages.flat());
  }

  function refreshRealtimeSubscriptions(nextDuelId: string | null, modeOverride?: ClientMode) {
    hostSubscriptionRef.current?.close();
    guestSubscriptionRef.current?.close();
    hostSubscriptionRef.current = null;
    guestSubscriptionRef.current = null;

    if (
      !nextDuelId ||
      setupRef.current.transportLabel !== "backend" ||
      typeof window === "undefined"
    ) {
      return;
    }

    const baseUrl = getOnlineDuelBackendBaseUrl();
    for (const mode of getRealtimeClientModes(modeOverride)) {
      const client = getClientForMode(mode);
      const resumeToken = client.getLastSync()?.resumeToken;
      if (!resumeToken) {
        setTransportIssue("missing_resume_token");
        return;
      }

      const subscription = subscribeToOnlineDuelEvents({
        baseUrl,
        duelId: nextDuelId,
        playerId: client.identity.playerId,
        resumeToken,
        afterEventId: mode === "host" ? hostLastEventIdRef.current ?? undefined : guestLastEventIdRef.current ?? undefined,
        onMessage: (message, eventId) =>
          applyInboundMessages([message], eventId ? { [mode]: eventId } : undefined),
        onOpen: () => void recoverRealtimeState(nextDuelId, mode),
        onError: () => {
          setTransportIssue("event_stream_error");
          void recoverRealtimeState(nextDuelId, mode);
        },
      });

      if (mode === "host") {
        hostSubscriptionRef.current = subscription;
      } else {
        guestSubscriptionRef.current = subscription;
      }
    }
  }

  async function runClientAction(action: () => Promise<OnlineDuelServerMessage[]>) {
    try {
      const nextMessages = await action();
      setTransportIssue(null);
      return nextMessages;
    } catch (error) {
      const message = error instanceof Error ? error.message : "online_duel_transport_error";
      setTransportIssue(message);
      return [];
    }
  }

  async function handleCreateDuel() {
    if (liveRoomRequired && setupRef.current.transportLabel !== "backend") {
      setTransportIssue("live_service_required");
      return;
    }

    const nextMessages = await runClientAction(() =>
      setupRef.current.hostClient.createDuel(
        hostBuild.snapshot,
        buildClientFighterView({
          preparedPlayer,
          fallbackFigure: resolvePresetFigure(hostBuild.presetId, "rush-chip"),
          fallbackEquipment: hostBuild.equipment,
        }),
        preparedPlayer?.playerName ?? hostBuild.snapshot.name,
        buildOnlineParticipantLoadout({
          preparedPlayer,
          fallbackBuild: hostBuild,
        })
      )
    );
    const created = nextMessages.find((message) => message.type === "duel_created");
    if (created?.type === "duel_created") {
      setDuelId(created.duelId);
      setHostSeat(created.yourSeat);
      setJoinCode(created.roomCode);
      setPlayerMode("host");
      setDebugClientMode("host");
      setEntryMode("create");
      refreshRealtimeSubscriptions(created.duelId, "host");
    }
    applyInboundMessages(nextMessages);
  }

  async function handleFindMatchmakingDuel() {
    if (liveRoomRequired && setupRef.current.transportLabel !== "backend") {
      setTransportIssue("live_service_required");
      return;
    }

    setMatchmakingTimedOut(false);
    const nextMessages = await runClientAction(() =>
      setupRef.current.hostClient.findMatchmakingDuel(
        hostBuild.snapshot,
        buildClientFighterView({
          preparedPlayer,
          fallbackFigure: resolvePresetFigure(hostBuild.presetId, "rush-chip"),
          fallbackEquipment: hostBuild.equipment,
        }),
        preparedPlayer?.playerName ?? hostBuild.snapshot.name,
        buildOnlineParticipantLoadout({
          preparedPlayer,
          fallbackBuild: hostBuild,
        })
      )
    );
    const created = nextMessages.find((message) => message.type === "duel_created");
    const matchSync = nextMessages.find((message) => message.type === "duel_state_sync");

    if (created?.type === "duel_created") {
      setDuelId(created.duelId);
      setHostSeat(created.yourSeat);
      setJoinCode(created.roomCode);
      setPlayerMode("host");
      setDebugClientMode("host");
      setEntryMode("create");
      refreshRealtimeSubscriptions(created.duelId, "host");
    } else if (matchSync?.type === "duel_state_sync" && matchSync.payload.yourSeat) {
      setDuelId(matchSync.payload.duelId);
      setHostSeat(matchSync.payload.yourSeat);
      setJoinCode(matchSync.payload.roomCode);
      setPlayerMode("host");
      setDebugClientMode("host");
      setEntryMode("create");
      refreshRealtimeSubscriptions(matchSync.payload.duelId, "host");
    }

    applyInboundMessages(nextMessages);
  }

  async function handleStopMatchmakingSearch() {
    setMatchmakingSearchActive(false);
    setMatchmakingTimedOut(false);

    if (duelId) {
      await handleLeaveRoom();
      return;
    }

    resetOnlineFlow();
  }

  function handleRestartMatchmakingSearch() {
    autoStartedRef.current = false;
    setMatchmakingTimedOut(false);
    setMatchmakingSearchActive(true);
  }

  async function handleJoinDuel() {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      return;
    }

    if (liveRoomRequired && setupRef.current.transportLabel !== "backend") {
      setTransportIssue("live_service_required");
      return;
    }

    const nextMessages = await runClientAction(() =>
      setupRef.current.guestClient.joinDuelByCode(
        normalizedCode,
        guestBuild.snapshot,
        buildClientFighterView({
          preparedPlayer,
          fallbackFigure: resolvePresetFigure(guestBuild.presetId, "kitsune-bit"),
          fallbackEquipment: guestBuild.equipment,
        }),
        preparedPlayer?.playerName ?? guestBuild.snapshot.name,
        buildOnlineParticipantLoadout({
          preparedPlayer,
          fallbackBuild: guestBuild,
        })
      )
    );
    const joinSync = nextMessages.find((message) => message.type === "duel_state_sync");
    if (joinSync?.type === "duel_state_sync" && joinSync.payload.yourSeat) {
      setDuelId(joinSync.payload.duelId);
      setGuestSeat(joinSync.payload.yourSeat);
      setPlayerMode("guest");
      setDebugClientMode("guest");
      setEntryMode("join");
      refreshRealtimeSubscriptions(joinSync.payload.duelId, "guest");
    }
    applyInboundMessages(nextMessages);
  }

  async function handleHostSync() {
    if (!duelId) {
      return;
    }
    applyInboundMessages(await runClientAction(() => setupRef.current.hostClient.requestSync(duelId)));
  }

  async function handleGuestSync() {
    if (!duelId) {
      return;
    }
    applyInboundMessages(await runClientAction(() => setupRef.current.guestClient.requestSync(duelId)));
  }

  async function handleHostReady(ready: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() =>
        setupRef.current.hostClient.setReady(
          duelId,
          resolvedHostSeat,
          ready
        )
      )
    );
  }

  async function handleHostConnection(connected: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() =>
        setupRef.current.hostClient.setConnection(
          duelId,
          resolvedHostSeat,
          connected
        )
      )
    );
  }

  async function handleGuestReady(ready: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() =>
        setupRef.current.guestClient.setReady(
          duelId,
          resolvedGuestSeat,
          ready
        )
      )
    );
  }

  async function handleGuestConnection(connected: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() =>
        setupRef.current.guestClient.setConnection(
          duelId,
          resolvedGuestSeat,
          connected
        )
      )
    );
  }

  async function handleHostAttack() {
    if (!duelId || hostActionSubmitting || hostSync?.currentRoundState?.yourActionSubmitted) {
      return;
    }

    const hostLoadout = getCombatLoadoutForMode("host");
    const selectedHostSkill =
      hostLoadout.availableSkills.find((skill) => skill.id === getRoundDraftSelectedSkillId(hostDraft)) ?? null;
    const selectedHostConsumableItem =
      hostLoadout.availableConsumables.find((entry) => entry.item.code === getRoundDraftSelectedConsumableCode(hostDraft))
        ?.item ?? null;

    setHostActionSubmitting(true);
    try {
      const submitMessages = await runClientAction(() =>
        setupRef.current.hostClient.submitRoundAction(
          duelId,
          resolvedHostSeat,
          {
            attackZone: hostDraft.attackZone,
            defenseZones: hostDraft.defenseZones,
            intent: hostDraft.intent,
            selectedAction:
              hostDraft.selectedAction.kind === "skill_attack" && !selectedHostSkill
                ? { kind: "basic_attack" }
                : hostDraft.selectedAction.kind === "consumable" && !selectedHostConsumableItem?.consumableEffect
                  ? { kind: "basic_attack" }
                  : hostDraft.selectedAction,
          }
        )
      );
      const syncModes: ClientMode[] = shouldRefreshClientsAfterRoundResolution(submitMessages)
        ? getRealtimeClientModes()
        : shouldRecoverFromSubmitError(submitMessages)
          ? ["host" satisfies ClientMode]
          : [];
      const recoveredMessages = (
        await Promise.all(
          syncModes.map((mode) => runClientAction(() => getClientForMode(mode).requestSync(duelId)))
        )
      ).flat();
      applyInboundMessages([...submitMessages, ...recoveredMessages]);
    } finally {
      setHostActionSubmitting(false);
    }
  }

  async function handleGuestAttack() {
    if (!duelId || guestActionSubmitting || guestSync?.currentRoundState?.yourActionSubmitted) {
      return;
    }

    const guestLoadout = getCombatLoadoutForMode("guest");
    const selectedGuestSkill =
      guestLoadout.availableSkills.find((skill) => skill.id === getRoundDraftSelectedSkillId(guestDraft)) ?? null;
    const selectedGuestConsumableItem =
      guestLoadout.availableConsumables.find((entry) => entry.item.code === getRoundDraftSelectedConsumableCode(guestDraft))
        ?.item ?? null;

    setGuestActionSubmitting(true);
    try {
      const submitMessages = await runClientAction(() =>
        setupRef.current.guestClient.submitRoundAction(
          duelId,
          resolvedGuestSeat,
          {
            attackZone: guestDraft.attackZone,
            defenseZones: guestDraft.defenseZones,
            intent: guestDraft.intent,
            selectedAction:
              guestDraft.selectedAction.kind === "skill_attack" && !selectedGuestSkill
                ? { kind: "basic_attack" }
                : guestDraft.selectedAction.kind === "consumable" && !selectedGuestConsumableItem?.consumableEffect
                  ? { kind: "basic_attack" }
                  : guestDraft.selectedAction,
          }
        )
      );
      const syncModes: ClientMode[] = shouldRefreshClientsAfterRoundResolution(submitMessages)
        ? getRealtimeClientModes()
        : shouldRecoverFromSubmitError(submitMessages)
          ? ["guest" satisfies ClientMode]
          : [];
      const recoveredMessages = (
        await Promise.all(
          syncModes.map((mode) => runClientAction(() => getClientForMode(mode).requestSync(duelId)))
        )
      ).flat();
      applyInboundMessages([...submitMessages, ...recoveredMessages]);
    } finally {
      setGuestActionSubmitting(false);
    }
  }

  async function handleForceTimeout() {
    if (!duelId || !setupRef.current.expireRooms) {
      return;
    }

    setupRef.current.expireRooms(Date.now() + 10 * 60 * 1000);
    record([
      ...(await runClientAction(() => setupRef.current.hostClient.requestSync(duelId))),
      ...(await runClientAction(() => setupRef.current.guestClient.requestSync(duelId))),
    ]);
  }

  async function handlePlayAnotherMatch() {
    if (!duelId || !matchLocked) {
      resetOnlineFlow();
      return;
    }

    const activeClient = getClientForMode(resolveOnlineActionClientMode(playerMode));
    const nextMessages = await runClientAction(() =>
      activeClient.requestRematch(duelId)
    );
    const recoveredMessages = await Promise.all(
      getRealtimeClientModes().map((mode) =>
        runClientAction(() => getClientForMode(mode).requestSync(duelId))
      )
    );
    applyInboundMessages([...nextMessages, ...recoveredMessages.flat()]);
    setDebugClientMode(playerMode);
    setHostDraft(createRoundDraft());
    setGuestDraft(createRoundDraft());
  }

  async function handleLeaveRoom() {
    if (!duelId) {
      resetOnlineFlow();
      return;
    }

    const activeClient =
      playerMode === "host" ? setupRef.current.hostClient : setupRef.current.guestClient;
    await runClientAction(() => activeClient.leaveDuel(duelId));
    resetOnlineFlow();
  }

  function handleNewHostSession() {
    setupRef.current.resetHostClient();
    setHostSeat("playerA");
    setClientRefresh((current) => current + 1);
  }

  function handleNewGuestSession() {
    setupRef.current.resetGuestClient();
    setGuestSeat("playerB");
    setClientRefresh((current) => current + 1);
  }

  function resetOnlineFlow() {
    hostSubscriptionRef.current?.close();
    guestSubscriptionRef.current?.close();
    hostSubscriptionRef.current = null;
    guestSubscriptionRef.current = null;
    hostLastEventIdRef.current = null;
    guestLastEventIdRef.current = null;
    setupRef.current = createOnlineSetupForScreen({
      mode: setupRef.current.transportLabel,
      baseUrl: getOnlineDuelBackendBaseUrl(),
      matchmakingIdentity:
        matchmakingMode && preparedPlayer
          ? {
              playerId: `match-${screenInstanceIdRef.current}`,
              sessionId: `match-session-${screenInstanceIdRef.current}`,
              displayName: preparedPlayer.playerName,
            }
          : undefined,
    });
    setDuelId(null);
    setMessages([]);
    setHostSeat("playerA");
    setGuestSeat("playerB");
    setJoinCode("");
    setPlayerMode("host");
    setDebugClientMode("host");
    setEntryMode("create");
    setHostDraft(createRoundDraft());
    setGuestDraft(createRoundDraft());
    setHostActionSubmitting(false);
    setGuestActionSubmitting(false);
    setMatchmakingSearchActive(matchmakingMode ? false : initialEntryMode === "matchmaking");
    setTransportIssue(null);
    setMatchmakingTimedOut(false);
    setDebugOpen(false);
    autoStartedRef.current = false;
    setClientRefresh((current) => current + 1);
  }

  return (
    <section
      style={{
        minHeight: "100%",
        display: "grid",
        gap: 20,
        color: "rgba(255,244,231,0.94)",
      }}
    >
      {!launchedFromLobby ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={eyebrowStyle}>PvP</p>
            <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>1v1 Battle</h1>
            <p style={{ margin: "10px 0 0", maxWidth: 780, color: "rgba(255,244,231,0.72)", lineHeight: 1.6 }}>
              Create a match, share the code, bring in the second fighter, and play through a 1v1 battle where both sides stay in step.
            </p>
          </div>
          <button type="button" onClick={onBack} style={ghostButtonStyle}>
            Back to Menu
          </button>
        </div>
      ) : null}

      {!launchedFromLobby ? (
        <div style={heroGridStyle}>
          <article style={panelStyle}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>{duelId ? "Match Access" : "Match Entry"}</span>
              <span style={chipStyle}>
                {matchmakingMode && !duelId
                  ? "Searching"
                  : duelId
                  ? "Match live"
                  : entryMode === "create"
                    ? "Create path"
                    : "Join path"}
              </span>
            </div>
            <p style={helperTextStyle}>
              Choose whether you are opening a match or joining an existing one. If the live battle service is
              available it will be used automatically.
            </p>
            {transportIssue ? <p style={warningTextStyle}>Connection issue: {describeTransportIssue(transportIssue)}</p> : null}
            {setupRef.current.transportLabel === "backend" ? (
              <p style={helperTextStyle}>The match is updating live for everyone inside this fight.</p>
            ) : null}
            <div style={buttonRowStyle}>
              <button
                type="button"
                style={entryMode === "create" ? primaryButtonStyle : ghostButtonStyle}
                onClick={() => setEntryMode("create")}
              >
                Create Match
              </button>
              <button
                type="button"
                style={entryMode === "join" ? primaryButtonStyle : ghostButtonStyle}
                onClick={() => setEntryMode("join")}
              >
                Join Match
              </button>
            </div>
            {entryMode === "create" ? (
              <>
                <div style={{ ...sectionHeadStyle, marginTop: 18 }}>
                  <span style={eyebrowStyle}>Create Match</span>
                  <span style={chipStyle}>{duelId ? "Match live" : transportBadgeLabel(transportSource)}</span>
                </div>
                <p style={helperTextStyle}>Create a match, receive a shareable code, and wait for the second player to join.</p>
                <PresetChooser
                  title="Your Class"
                  selectedPresetId={hostBuild.presetId}
                  locked={Boolean(duelId)}
                  onSelect={(presetId) => setHostBuild(createOnlineBuildSelection(presetId, "Host"))}
                  description={resolvePresetById(hostBuild.presetId)?.description ?? "Choose one of the live curated combat presets."}
                  presetChooserStyle={presetChooserStyle}
                  sectionHeadStyle={sectionHeadStyle}
                  eyebrowStyle={eyebrowStyle}
                  chipStyle={chipStyle}
                  presetGridStyle={presetGridStyle}
                  presetSelectedButtonStyle={presetSelectedButtonStyle}
                  presetButtonStyle={presetButtonStyle}
                  presetMetaStyle={presetMetaStyle}
                  helperTextStyle={helperTextStyle}
                />
                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => void handleCreateDuel()}
                    disabled={entryActionsDisabled}
                  >
                    Create Room
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ ...sectionHeadStyle, marginTop: 18 }}>
                  <span style={eyebrowStyle}>Join Match</span>
                  <span style={chipStyle}>{joinCode.trim() ? "Code ready" : "Waiting for code"}</span>
                </div>
                <p style={helperTextStyle}>Enter a match code to join an existing fight and take the second seat.</p>
                <PresetChooser
                  title="Your Class"
                  selectedPresetId={guestBuild.presetId}
                  locked={Boolean(duelId)}
                  onSelect={(presetId) => setGuestBuild(createOnlineBuildSelection(presetId, "Guest"))}
                  description={resolvePresetById(guestBuild.presetId)?.description ?? "Choose one of the live curated combat presets."}
                  presetChooserStyle={presetChooserStyle}
                  sectionHeadStyle={sectionHeadStyle}
                  eyebrowStyle={eyebrowStyle}
                  chipStyle={chipStyle}
                  presetGridStyle={presetGridStyle}
                  presetSelectedButtonStyle={presetSelectedButtonStyle}
                  presetButtonStyle={presetButtonStyle}
                  presetMetaStyle={presetMetaStyle}
                  helperTextStyle={helperTextStyle}
                />
                <div style={buttonRowStyle}>
                  <label
                    style={{
                      display: "grid",
                      gap: 6,
                      minWidth: 160,
                      color: "rgba(255,244,231,0.72)",
                      fontSize: 12,
                    }}
                  >
                    Match Code
                    <input
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                      placeholder="ABC123"
                      style={inputStyle}
                    />
                  </label>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => void handleJoinDuel()}
                    disabled={!joinCode.trim() || entryActionsDisabled}
                  >
                    Join Match
                  </button>
                </div>
              </>
            )}
          </article>

          <article style={panelStyle}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Battle Status</span>
              <span style={chipStyle}>{matchStatusSummary.badge}</span>
            </div>
            <p style={helperTextStyle}>{matchStatusSummary.message}</p>
            <div style={statStripStyle}>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Match</div>
                <div style={statValueStyle}>{duelId ? "Live" : "Not opened yet"}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Match Code</div>
                <div style={{ ...statValueStyle, letterSpacing: "0.16em", fontFamily: "Consolas, monospace" }}>
                  {hostSync?.roomCode ?? guestSync?.roomCode ?? "------"}
                </div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Outcome</div>
                <div style={statValueStyle}>{winnerName ?? (matchSync?.status === "abandoned" ? "Match closed" : "In progress")}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Live Link</div>
                <div style={statValueStyle}>{transportBadgeLabel(transportSource)}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Fighters</div>
                <div style={statValueStyle}>{joinedCount}/2 joined</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Ready</div>
                <div style={statValueStyle}>{readyCount}/2 ready</div>
              </div>
            </div>
            <div style={buttonRowStyle}>
              <button
                type="button"
                style={ghostButtonStyle}
                onClick={() => void handleLeaveRoom()}
                disabled={!duelId && transportSource === "checking"}
              >
                Leave Room
              </button>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => void handlePlayAnotherMatch()}
                disabled={!matchLocked}
              >
                Play Another Match
              </button>
            </div>
          </article>
        </div>
      ) : duelId ? null : (
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Fight Status</span>
            <span style={chipStyle}>
              {matchmakingStatus?.badge ?? (matchmakingMode ? "Searching" : initialEntryMode === "join" ? "Joining" : "Opening")}
            </span>
          </div>
          <p style={helperTextStyle}>
            {matchmakingStatus?.message ??
              (matchmakingMode
                ? "Searching for another prepared fighter and opening the combat screen as soon as a rival is found."
                : initialEntryMode === "join"
                  ? "Joining the shared match code with your prepared fighter."
                  : "Opening a fresh match for your prepared fighter.")}
          </p>
          <div style={emptyCardStyle}>
            {matchmakingStatus?.badge === "Search paused"
              ? "Search paused"
              : matchmakingMode
                ? "Searching for a rival..."
                : initialEntryMode === "join"
                  ? "Joining match..."
                  : "Opening match..."}
          </div>
          {transportIssue ? <p style={warningTextStyle}>Connection issue: {describeTransportIssue(transportIssue)}</p> : null}
          {matchmakingMode && !duelId ? (
            <div style={buttonRowStyle}>
              {matchmakingSearchActive ? (
                <button type="button" style={ghostButtonStyle} onClick={() => void handleStopMatchmakingSearch()}>
                  Stop Searching
                </button>
              ) : (
                <button type="button" style={primaryButtonStyle} onClick={handleRestartMatchmakingSearch}>
                  Search Again
                </button>
              )}
            </div>
          ) : null}
        </article>
      )}

      {showPlayerFacingArena ? (
        <>
          {matchmakingStatus && duelId ? (
            <article
              style={{
                ...panelStyle,
                marginBottom: 14,
                border:
                  matchmakingStatus.tone === "warning"
                    ? "1px solid rgba(255,196,120,0.26)"
                    : "1px solid rgba(135,217,255,0.24)",
                background:
                  matchmakingStatus.tone === "warning"
                    ? "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))"
                    : "linear-gradient(180deg, rgba(20,35,45,0.88), rgba(13,18,24,0.96))",
              }}
            >
              <div style={sectionHeadStyle}>
                <span style={eyebrowStyle}>Matchmaking</span>
                <span style={chipStyle}>{matchmakingStatus.badge}</span>
              </div>
              <p style={helperTextStyle}>{matchmakingStatus.message}</p>
              <div style={buttonRowStyle}>
                <button type="button" style={ghostButtonStyle} onClick={() => void handleStopMatchmakingSearch()}>
                  Stop Searching
                </button>
                {matchmakingTimedOut ? (
                  <button type="button" style={primaryButtonStyle} onClick={() => setMatchmakingTimedOut(false)}>
                    Keep Searching
                  </button>
                ) : null}
              </div>
            </article>
          ) : null}
          {liveStatus ? (
            <article
              style={{
                ...panelStyle,
                marginBottom: 14,
                border:
                  liveStatus.tone === "danger"
                    ? "1px solid rgba(255,127,127,0.3)"
                    : liveStatus.tone === "warning"
                      ? "1px solid rgba(255,196,120,0.26)"
                      : "1px solid rgba(135,217,255,0.24)",
                background:
                  liveStatus.tone === "danger"
                    ? "linear-gradient(180deg, rgba(62,21,21,0.92), rgba(23,12,12,0.96))"
                    : liveStatus.tone === "warning"
                      ? "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))"
                      : "linear-gradient(180deg, rgba(20,35,45,0.88), rgba(13,18,24,0.96))",
                boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
              }}
            >
              <div style={sectionHeadStyle}>
                <span style={eyebrowStyle}>Live Status</span>
                <span
                  style={{
                    ...chipStyle,
                    border:
                      liveStatus.tone === "danger"
                        ? "1px solid rgba(255,127,127,0.34)"
                        : liveStatus.tone === "warning"
                          ? "1px solid rgba(255,196,120,0.32)"
                          : chipStyle.border,
                    background:
                      liveStatus.tone === "danger"
                        ? "rgba(112,31,31,0.28)"
                        : liveStatus.tone === "warning"
                          ? "rgba(119,77,18,0.28)"
                          : chipStyle.background,
                    color:
                      liveStatus.tone === "danger"
                        ? "rgba(255,226,226,0.96)"
                        : liveStatus.tone === "warning"
                          ? "rgba(255,236,210,0.96)"
                          : chipStyle.color,
                  }}
                >
                  {liveStatus.badge}
                </span>
              </div>
              <p
                style={{
                  ...helperTextStyle,
                  color:
                    liveStatus.tone === "danger"
                      ? "rgba(255,220,220,0.88)"
                      : liveStatus.tone === "warning"
                        ? "rgba(255,232,205,0.88)"
                        : helperTextStyle.color,
                }}
              >
                {liveStatus.message}
              </p>
            </article>
          ) : null}
          <ArenaStageShell shellStyle={shellStyle}>
            <ArenaStageColumns>
              <OnlinePlayerCombatPanel
                playerName={playerDisplayName}
                playerFigure={playerFigure}
                currentHp={playerCurrentHp}
                maxHp={playerSnapshot.maxHp}
                equipment={playerEquipment}
                selectedIntent={(playerMode === "host" ? hostDraft : guestDraft).intent}
                shellStyle={shellStyle}
                panelStyle={panelStyle}
                derivedStats={playerDerivedStats}
                roleLabel={playerMode === "host" ? "Host" : "Guest"}
                presetLabel={resolvePresetById(playerBuild.presetId)?.label ?? "Custom"}
                winner={matchSync?.winnerSeat === (playerSync?.yourSeat ?? playerSeat)}
                loser={Boolean(matchSync?.winnerSeat) && matchSync?.winnerSeat !== (playerSync?.yourSeat ?? playerSeat)}
                sidePanelComponent={SidePanel}
                chipStyle={chipStyle}
                combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
                onlinePlayerIntentSilhouetteTone={onlinePlayerIntentSilhouetteTone}
                statSummaryRowStyle={statSummaryRowStyle}
                statSummaryLabelStyle={statSummaryLabelStyle}
                statSummaryValueStyle={statSummaryValueStyle}
              />

              <OnlineFightSetupPanel
                panelStyle={panelStyle}
                shellStyle={shellStyle}
                primaryButtonStyle={primaryButtonStyle}
                buttonStyle={ghostButtonStyle}
                currentStep={currentStep}
                duelId={duelId}
                matchLocked={matchLocked}
                playerReady={playerReady}
                showPlanner={showPlanner}
                selectedActionLabel={selectedActionLabel}
                selectedActionTags={selectedActionTags}
                selectedActionSummary={selectedActionSummary}
                draft={playerMode === "host" ? hostDraft : guestDraft}
                playerActionSubmitted={playerActionLocked}
                latestRoundSummary={lastResolvedRound ? `Round ${lastResolvedRound.round}` : "No round resolved yet."}
                selectedIntent={(playerMode === "host" ? hostDraft : guestDraft).intent}
                availableSkills={playerAvailableSkills}
                availableConsumables={playerAvailableConsumables}
                playerResources={playerCombatantState?.resources ?? null}
                playerSkillCooldowns={playerCombatantState?.skillCooldowns ?? {}}
                onPrimaryAction={() => void (playerMode === "host" ? handleHostReady(true) : handleGuestReady(true))}
                onCancelReady={() => void (playerMode === "host" ? handleHostReady(false) : handleGuestReady(false))}
                onAttackZoneChange={(zone) =>
                  playerMode === "host"
                    ? setHostDraft((current) => setRoundDraftAttackZone(current, zone))
                    : setGuestDraft((current) => setRoundDraftAttackZone(current, zone))
                }
                onDefenseZoneToggle={(zone) =>
                  playerMode === "host"
                    ? setHostDraft((current) => toggleRoundDraftDefenseZone(current, zone))
                    : setGuestDraft((current) => toggleRoundDraftDefenseZone(current, zone))
                }
                onIntentChange={(intent) =>
                  playerMode === "host"
                    ? setHostDraft((current) => setRoundDraftIntent(current, intent))
                    : setGuestDraft((current) => setRoundDraftIntent(current, intent))
                }
                onSkillChange={(skillId) =>
                  playerMode === "host"
                    ? setHostDraft((current) => setRoundDraftSkill(current, skillId))
                    : setGuestDraft((current) => setRoundDraftSkill(current, skillId))
                }
                onConsumableChange={(itemCode) =>
                  playerMode === "host"
                    ? setHostDraft((current) =>
                        setRoundDraftConsumable(
                          current,
                          itemCode,
                          playerAvailableConsumables.find((entry) => entry.item.code === itemCode)?.item.consumableEffect
                            ?.usageMode ?? null
                        )
                      )
                    : setGuestDraft((current) =>
                        setRoundDraftConsumable(
                          current,
                          itemCode,
                          playerAvailableConsumables.find((entry) => entry.item.code === itemCode)?.item.consumableEffect
                            ?.usageMode ?? null
                        )
                      )
                }
                onLockAttack={() => void (playerMode === "host" ? handleHostAttack() : handleGuestAttack())}
                actionsDisabled={actionsDisabled}
                blockedStatus={liveStatus}
                recoveryAction={recoveryAction}
              />

              <OnlineOpponentCombatPanel
                playerName={opponentParticipant?.displayName ?? "Player 2"}
                playerFigure={opponentFigure}
                currentHp={opponentCurrentHp}
                maxHp={opponentSnapshot.maxHp}
                equipment={opponentEquipment}
                shellStyle={shellStyle}
                panelStyle={panelStyle}
                derivedStats={opponentDerivedStats}
                connectionLabel={
                  opponentParticipant
                    ? opponentParticipant.connected
                      ? "Connected"
                      : "Offline"
                    : "Pending"
                }
                readinessLabel={opponentParticipant?.ready ? "Ready" : "Not ready"}
                winner={matchSync?.winnerSeat !== null && matchSync?.winnerSeat === opponentParticipant?.seat}
                loser={Boolean(matchSync?.winnerSeat) && matchSync?.winnerSeat !== opponentParticipant?.seat}
                sidePanelComponent={SidePanel}
                chipStyle={chipStyle}
                combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
                statSummaryRowStyle={statSummaryRowStyle}
                statSummaryLabelStyle={statSummaryLabelStyle}
                statSummaryValueStyle={statSummaryValueStyle}
              />
            </ArenaStageColumns>
          </ArenaStageShell>
        </>
      ) : null}
      {showPlayerFacingArena ? (
        <BattleLogSection
          entries={battleLogEntries}
          playerId={playerBuild.snapshot.characterId}
          botId={opponentBuild.snapshot.characterId}
          shellStyle={shellStyle}
        />
      ) : null}

      {!launchedFromLobby ? (
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Debug Tools</span>
            <button
              type="button"
              style={ghostButtonStyle}
              onClick={() => setDebugOpen((current) => !current)}
            >
              {debugOpen ? "Hide Debug Tools" : "Show Debug Tools"}
            </button>
          </div>
          {debugOpen ? (
            <>
              <p style={helperTextStyle}>
                These controls exercise session lifecycle behavior. Timeout forcing only works on the local fallback
                authority until the backend exposes the same debug hooks.
              </p>
              <div style={buttonRowStyle}>
                <button
                  type="button"
                  style={debugClientMode === "host" ? primaryButtonStyle : ghostButtonStyle}
                  onClick={() => setDebugClientMode("host")}
                >
                  Host Side
                </button>
                <button
                  type="button"
                  style={debugClientMode === "guest" ? primaryButtonStyle : ghostButtonStyle}
                  onClick={() => setDebugClientMode("guest")}
                >
                  Guest Side
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleHostSync()}
                  disabled={!duelId || actionsDisabled}
                >
                  Refresh Host
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleGuestSync()}
                  disabled={!duelId || actionsDisabled}
                >
                  Refresh Guest
                </button>
                <button type="button" style={ghostButtonStyle} onClick={handleNewHostSession}>
                  New Host Session
                </button>
                <button type="button" style={ghostButtonStyle} onClick={handleNewGuestSession}>
                  New Guest Session
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleHostConnection(false)}
                  disabled={!duelId || actionsDisabled}
                >
                  Host Disconnect
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleHostConnection(true)}
                  disabled={!duelId || actionsDisabled}
                >
                  Host Reconnect
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleGuestConnection(false)}
                  disabled={!duelId || actionsDisabled}
                >
                  Guest Disconnect
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleGuestConnection(true)}
                  disabled={!duelId || actionsDisabled}
                >
                  Guest Reconnect
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => void handleForceTimeout()}
                  disabled={!duelId || actionsDisabled || !setupRef.current.expireRooms}
                >
                  Force Timeout
                </button>
              </div>

              <div style={{ ...panelStyle, marginTop: 14, background: "rgba(255,255,255,0.02)", boxShadow: "none" }}>
                <div style={sectionHeadStyle}>
                  <span style={eyebrowStyle}>Selected Debug Side</span>
                  <span style={chipStyle}>{debugSync?.yourSeat ?? debugSeat}</span>
                </div>
                <p style={helperTextStyle}>
                  Use this operator view for local two-seat verification. It does not change the normal `Your Side`
                  player surface above.
                </p>
                <RoundPlannerCard
                  draft={debugClientMode === "host" ? hostDraft : guestDraft}
                  mode={debugClientMode}
                  onAttackZoneChange={(zone) =>
                    debugClientMode === "host"
                      ? setHostDraft((current) => setRoundDraftAttackZone(current, zone))
                      : setGuestDraft((current) => setRoundDraftAttackZone(current, zone))
                  }
                  onDefenseZoneToggle={(zone) =>
                    debugClientMode === "host"
                      ? setHostDraft((current) => toggleRoundDraftDefenseZone(current, zone))
                      : setGuestDraft((current) => toggleRoundDraftDefenseZone(current, zone))
                  }
                  plannerCardStyle={plannerCardStyle}
                  sectionHeadStyle={sectionHeadStyle}
                  eyebrowStyle={eyebrowStyle}
                  chipStyle={chipStyle}
                  plannerLabelStyle={plannerLabelStyle}
                  plannerZoneRowStyle={plannerZoneRowStyle}
                  plannerPrimaryButtonStyle={plannerPrimaryButtonStyle}
                  plannerGhostButtonStyle={plannerGhostButtonStyle}
                />
                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => void (debugClientMode === "host" ? handleHostReady(true) : handleGuestReady(true))}
                    disabled={!duelId || actionsDisabled}
                  >
                    Ready Selected Side
                  </button>
                  <button
                    type="button"
                    style={ghostButtonStyle}
                    onClick={() => void (debugClientMode === "host" ? handleHostReady(false) : handleGuestReady(false))}
                    disabled={!duelId || actionsDisabled}
                  >
                    Cancel Selected Ready
                  </button>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => void (debugClientMode === "host" ? handleHostAttack() : handleGuestAttack())}
                    disabled={!duelId || actionsDisabled}
                  >
                    Lock Selected Attack
                  </button>
                </div>
                <SyncView
                  sync={debugSync}
                  emptyLabel="The selected debug client has not synced yet."
                  emptyCardStyle={emptyCardStyle}
                  statStripStyle={statStripStyle}
                  statCardStyle={statCardStyle}
                  statLabelStyle={statLabelStyle}
                  statValueStyle={statValueStyle}
                />
              </div>

              <div style={{ ...panelStyle, marginTop: 14, background: "rgba(255,255,255,0.02)", boxShadow: "none" }}>
                <div style={sectionHeadStyle}>
                  <span style={eyebrowStyle}>Session Details</span>
                  <span style={chipStyle}>Developer</span>
                </div>
                <div style={{ ...clientMetaStyle, marginBottom: 0 }}>
                  <span>Duel</span>
                  <span>{duelId ?? "not-created"}</span>
                </div>
                <div style={{ ...clientMetaStyle, marginBottom: 0 }}>
                  <span>{setupRef.current.hostClient.identity.playerId}</span>
                  <span>{setupRef.current.hostClient.identity.sessionId}</span>
                </div>
                <div style={{ ...clientMetaStyle, marginBottom: 0, marginTop: 10 }}>
                  <span>{setupRef.current.guestClient.identity.playerId}</span>
                  <span>{setupRef.current.guestClient.identity.sessionId}</span>
                </div>
              </div>

              <div style={{ ...panelStyle, minHeight: 280, padding: 0, marginTop: 14, background: "transparent", boxShadow: "none" }}>
                <div style={sectionHeadStyle}>
                  <span style={eyebrowStyle}>Server Messages</span>
                  <span style={chipStyle}>{messages.length} entries</span>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gap: 10,
                    maxHeight: 320,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={emptyCardStyle}>No online messages yet.</div>
                  ) : (
                    messages.map((message, index) => (
                      <div key={`${message.type}-${index}`} style={messageCardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 14 }}>{message.type}</strong>
                          {"duelId" in message ? (
                            <span style={messageMetaStyle}>{message.duelId}</span>
                          ) : (
                            <span style={messageMetaStyle}>payload</span>
                          )}
                        </div>
                        <pre
                          style={{
                            margin: "10px 0 0",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "rgba(234, 229, 223, 0.78)",
                            fontSize: 12,
                            lineHeight: 1.5,
                            fontFamily: "Consolas, monospace",
                          }}
                        >
                          {JSON.stringify(message, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <p style={helperTextStyle}>Debug controls are hidden during normal play.</p>
          )}
        </article>
      ) : null}

      {!launchedFromLobby ? (
        <RoundResultCard
          summary={lastResolvedRound}
          panelStyle={panelStyle}
          sectionHeadStyle={sectionHeadStyle}
          eyebrowStyle={eyebrowStyle}
          chipStyle={chipStyle}
          helperTextStyle={helperTextStyle}
          statStripStyle={statStripStyle}
          statCardStyle={statCardStyle}
          statLabelStyle={statLabelStyle}
          statValueStyle={statValueStyle}
          messageCardStyle={messageCardStyle}
          messageMetaStyle={messageMetaStyle}
        />
      ) : null}
      <MatchFinishCard
        status={matchSync?.status ?? null}
        winnerName={winnerName}
        onLeave={() => void handleLeaveRoom()}
        onPlayAgain={() => void handlePlayAnotherMatch()}
        transportIssue={transportIssue}
        opponentConnected={!opponentSeatOffline}
        panelStyle={panelStyle}
        sectionHeadStyle={sectionHeadStyle}
        eyebrowStyle={eyebrowStyle}
        chipStyle={chipStyle}
        helperTextStyle={helperTextStyle}
        buttonRowStyle={buttonRowStyle}
        ghostButtonStyle={ghostButtonStyle}
        primaryButtonStyle={primaryButtonStyle}
      />
    </section>
  );
}

function OnlineFightSetupPanel({
  shellStyle,
  panelStyle,
  primaryButtonStyle,
  buttonStyle,
  currentStep,
  duelId,
  matchLocked,
  playerReady,
  showPlanner,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  draft,
  playerActionSubmitted,
  actionsDisabled,
  latestRoundSummary,
  selectedIntent,
  availableSkills,
  availableConsumables,
  playerResources,
  playerSkillCooldowns,
  onPrimaryAction,
  onCancelReady,
  onAttackZoneChange,
  onDefenseZoneToggle,
  onIntentChange,
  onSkillChange,
  onConsumableChange,
  onLockAttack,
  blockedStatus,
  recoveryAction,
}: {
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  buttonStyle: CSSProperties;
  currentStep: { badge: string; message: string };
  duelId: string | null;
  matchLocked: boolean;
  playerReady: boolean;
  showPlanner: boolean;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  actionsDisabled: boolean;
  latestRoundSummary: string;
  selectedIntent: RoundDraft["intent"];
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
  playerResources: { rage: number; guard: number; momentum: number; focus: number } | null;
  playerSkillCooldowns: Record<string, number>;
  onPrimaryAction: () => void;
  onCancelReady: () => void;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
  onIntentChange: (intent: RoundDraft["intent"]) => void;
  onSkillChange: (skillId: string | null) => void;
  onConsumableChange: (itemCode: string | null) => void;
  onLockAttack: () => void;
  blockedStatus: OnlineDuelLiveStatus | null;
  recoveryAction: { label: string; onClick: () => void } | null;
}) {
  return (
    <div data-testid="fight-setup-panel" style={{ ...shellStyle, padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
      <div style={{ display: "grid", gap: 12 }}>
        {blockedStatus && recoveryAction ? (
          <div
            style={{
              ...currentStepCardStyle,
              marginTop: 0,
              border:
                blockedStatus.tone === "danger"
                  ? "1px solid rgba(255,127,127,0.26)"
                  : "1px solid rgba(255,196,120,0.22)",
              background:
                blockedStatus.tone === "danger"
                  ? "linear-gradient(180deg, rgba(58,22,22,0.86), rgba(23,13,13,0.94))"
                  : "linear-gradient(180deg, rgba(63,46,20,0.8), rgba(24,17,9,0.94))",
            }}
          >
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Recovery</span>
              <span style={chipStyle}>{blockedStatus.badge}</span>
            </div>
            <p style={{ ...helperTextStyle, marginTop: 10 }}>{blockedStatus.message}</p>
            <div style={{ ...buttonRowStyle, marginTop: 12 }}>
              <button type="button" style={primaryButtonStyle} onClick={recoveryAction.onClick}>
                {recoveryAction.label}
              </button>
            </div>
          </div>
        ) : null}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)", gap: 12, alignItems: "stretch" }}>
          <FightControlsPanel
            panelStyle={panelStyle}
            primaryButtonStyle={primaryButtonStyle}
            canStartFight={Boolean(duelId) && !actionsDisabled && !playerReady && !showPlanner && !matchLocked}
            combatPhase={matchLocked ? "finished" : showPlanner ? "planning" : "lobby"}
            combatRound={null}
            combatPhaseLabel={currentStep.badge}
            selectedActionLabel={selectedActionLabel}
            selectedActionTags={selectedActionTags}
            selectedActionSummary={selectedActionSummary}
            onStartFight={onPrimaryAction}
            primaryActionLabel="Ready Up"
            primaryActionAriaLabel="Ready Up"
          />

          <AttackTargetRoundPanel
            panelStyle={panelStyle}
            resourcePanel={<ResourceGrid panelStyle={panelStyle} resources={playerResources} />}
            zones={combatZones}
            selectedAttackZone={draft.attackZone}
            selectedDefenseZones={draft.defenseZones}
            onSelectAttackZone={onAttackZoneChange}
            onToggleDefenseZone={onDefenseZoneToggle}
            interactionLocked={playerActionSubmitted}
            roundControls={
              <div style={{ display: "grid", gap: 7 }}>
                <button
                  type="button"
                  aria-label="Lock Attack"
                  onClick={onLockAttack}
                  disabled={!duelId || actionsDisabled || !showPlanner || playerActionSubmitted}
                  style={{
                    ...primaryButtonStyle,
                    ...(!duelId || actionsDisabled || !showPlanner || playerActionSubmitted
                      ? { opacity: 0.48, cursor: "not-allowed" }
                      : {}),
                  }}
                >
                  {playerActionSubmitted ? "Action Locked" : "Lock Attack"}
                </button>
                <div data-testid="latest-round-summary" style={{ display: "none" }}>
                  {latestRoundSummary}
                </div>
              </div>
            }
          />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {!showPlanner && playerReady ? (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                aria-label="Cancel Ready"
                onClick={onCancelReady}
                disabled={!duelId || actionsDisabled || showPlanner || !playerReady}
                style={{
                  ...buttonStyle,
                  padding: "8px 12px",
                  ...(!duelId || actionsDisabled || showPlanner || !playerReady ? { opacity: 0.48, cursor: "not-allowed" } : {}),
                }}
              >
                Cancel Ready
              </button>
            </div>
          ) : null}

          <OnlineCombatActionsPanel
            panelStyle={panelStyle}
            buttonStyle={buttonStyle}
            selectedIntent={selectedIntent}
            selectedAction={draft.selectedAction}
            availableSkills={availableSkills}
            availableConsumables={availableConsumables}
            playerResources={playerResources}
            playerSkillCooldowns={playerSkillCooldowns}
            onIntentChange={onIntentChange}
            onSkillChange={onSkillChange}
            onConsumableChange={onConsumableChange}
            onlineIntentVisuals={onlineIntentVisuals}
          />
        </div>
      </div>
    </div>
  );
}

const eyebrowStyle: CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,210,168,0.72)",
};

const heroGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const shellStyle: CSSProperties = {
  borderRadius: "28px",
  border: "1px solid rgba(255,244,225,0.09)",
  background:
    "linear-gradient(180deg, rgba(25,21,19,0.98), rgba(11,10,9,0.98)), radial-gradient(circle at top, rgba(255,193,122,0.08), transparent 28%)",
  boxShadow: "0 30px 74px rgba(0,0,0,0.34)",
};

const panelStyle: CSSProperties = {
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(26,22,24,0.96) 0%, rgba(17,14,16,0.98) 100%)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
  padding: 20,
};

const sectionHeadStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const chipStyle: CSSProperties = {
  borderRadius: 999,
  padding: "6px 12px",
  border: "1px solid rgba(135,217,255,0.28)",
  background: "rgba(41,81,101,0.24)",
  color: "rgba(210,241,255,0.92)",
  fontSize: 12,
  fontWeight: 700,
};

const clientMetaStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 12,
  marginBottom: 12,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,244,231,0.72)",
  fontSize: 12,
  fontFamily: "Consolas, monospace",
  wordBreak: "break-word",
};

const statStripStyle: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
  gap: 12,
};

const statCardStyle: CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: "14px 14px 12px",
};

const statLabelStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,244,231,0.48)",
};

const statValueStyle: CSSProperties = {
  marginTop: 7,
  fontSize: 15,
  fontWeight: 700,
  color: "rgba(255,244,231,0.96)",
  wordBreak: "break-word",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 14,
};

const primaryButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,184,107,0.38)",
  background: "linear-gradient(180deg, rgba(177,84,43,0.94), rgba(122,45,27,0.96))",
  color: "#fff4eb",
  fontWeight: 800,
  padding: "12px 16px",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,244,231,0.92)",
  fontWeight: 700,
  padding: "12px 16px",
  cursor: "pointer",
};

const helperTextStyle: CSSProperties = {
  margin: "14px 0 0",
  color: "rgba(255,244,231,0.7)",
  lineHeight: 1.6,
};

const warningTextStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "rgba(255,191,191,0.92)",
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(7,10,18,0.78)",
  color: "rgba(255,244,231,0.94)",
  padding: "10px 12px",
  fontSize: 14,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  outline: "none",
};

const emptyCardStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: "1px dashed rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  padding: "18px 16px",
  color: "rgba(255,244,231,0.58)",
};

const messageCardStyle: CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.03)",
  padding: "14px 16px",
};

const messageMetaStyle: CSSProperties = {
  color: "rgba(255,244,231,0.54)",
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const plannerCardStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: "16px 16px 14px",
};

const currentStepCardStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,184,107,0.18)",
  background: "linear-gradient(180deg, rgba(177,84,43,0.14), rgba(255,255,255,0.03))",
  padding: "16px 16px 14px",
};

const combatArenaGridStyle: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
  alignItems: "start",
};

const combatArenaPanelStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
  padding: 14,
  display: "grid",
  gap: 12,
  alignContent: "start",
};

const combatArenaCenterStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: 14,
  display: "grid",
  gap: 12,
  alignContent: "start",
};

const combatArenaSidebarStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const innerMiniPanelStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.035)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const combatArenaBadgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const statSummaryRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "8px 10px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const statSummaryLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "rgba(255,244,231,0.64)",
};

const statSummaryValueStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,244,231,0.96)",
};

const presetChooserStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: "16px 16px 14px",
};

const presetGridStyle: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))",
  gap: 10,
};

const presetButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,244,231,0.94)",
  padding: "12px 12px 10px",
  display: "grid",
  gap: 6,
  textAlign: "left",
  cursor: "pointer",
};

const presetSelectedButtonStyle: CSSProperties = {
  ...presetButtonStyle,
  border: "1px solid rgba(255,184,107,0.42)",
  background: "linear-gradient(180deg, rgba(177,84,43,0.26), rgba(255,255,255,0.05))",
  boxShadow: "0 0 0 1px rgba(255,184,107,0.16) inset",
};

const presetMetaStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,210,168,0.72)",
};

const guidedActionRowStyle: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const guidedActionCardStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  padding: "12px 12px 10px",
};

const plannerLockedCardStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 18,
  border: "1px dashed rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.025)",
  padding: "16px 16px 14px",
};

const plannerLabelStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,244,231,0.56)",
  marginBottom: 8,
};

const plannerZoneRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const plannerPrimaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  padding: "10px 12px",
  fontSize: 13,
};

const plannerGhostButtonStyle: CSSProperties = {
  ...ghostButtonStyle,
  padding: "10px 12px",
  fontSize: 13,
};

const zoneLabels: Record<CombatZone, string> = {
  head: "Head",
  chest: "Chest",
  belly: "Belly",
  waist: "Waist",
  legs: "Legs",
};
