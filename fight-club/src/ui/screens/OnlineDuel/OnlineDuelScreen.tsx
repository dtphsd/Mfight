import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SeededRandom } from "@/core/rng/SeededRandom";
import { createStarterInventory } from "@/modules/inventory";
import type { Item } from "@/modules/inventory";
import { getEquipmentBonuses } from "@/modules/equipment";
import type { EquipmentSlot } from "@/modules/equipment";
import {
  type OnlineDuelFighterView,
  type OnlineDuelRoundSummary,
  type OnlineDuelStateSync,
  createHttpOnlineDuelTransport,
  createInMemoryOnlineDuelService,
  createLocalOnlineDuelTransport,
  createOnlineDuelClient,
  subscribeToOnlineDuelEvents,
  type OnlineDuelClient,
  type OnlineDuelEventSubscription,
  type OnlineDuelServerMessage,
  type OnlineDuelTransport,
} from "@/modules/arena";
import { combatZones, type CombatZone } from "@/modules/combat";
import { combatBuildPresets, type CombatBuildPreset } from "@/orchestration/combat/combatSandboxConfigs";
import { buildPlayerRoundAction, createRoundDraft, setRoundDraftAttackZone, toggleRoundDraftDefenseZone, type RoundDraft } from "@/orchestration/combat/roundDraft";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { buildSandboxPresetState, requireSandboxCharacter, applySandboxAllocations } from "@/orchestration/combat/combatSandboxSupport";
import { CombatSilhouette } from "@/ui/components/combat/CombatSilhouette";
import { ArenaStageColumns, ArenaStageShell, MiniPanel, SidePanel } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { buildProfileDerivedStats, resolvePresetFigure } from "@/ui/screens/Combat/combatSandboxScreenDerived";
import { FightControlsPanel } from "@/ui/screens/Combat/combatSandboxScreenControls";
import { AttackTargetRoundPanel } from "@/ui/screens/Combat/combatSandboxScreenTargeting";
import { ResourceGrid } from "@/ui/screens/Combat/combatSandboxScreenResourceGrid";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";

interface OnlineDuelScreenProps {
  onBack: () => void;
  initialEntryMode?: "create" | "join" | "matchmaking";
  preparedPlayer?: PvpPreparedFighter | null;
  initialJoinCode?: string;
}

type ClientMode = "host" | "guest";
type EntryMode = "create" | "join";
type TransportSource = "checking" | "backend" | "local";

interface OnlineBuildSelection {
  presetId: string;
  snapshot: ReturnType<typeof buildCombatSnapshot>;
}

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
      duelId ||
      transportSource === "checking" ||
      transportSource !== "backend" ||
      autoStartedRef.current
    ) {
      return;
    }

    autoStartedRef.current = true;
    void handleFindMatchmakingDuel();
  }, [duelId, initialEntryMode, launchedFromLobby, transportSource]);

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
  const matchStatusSummary = getMatchStatusSummary({
    duelId,
    status: matchSync?.status,
    joinedCount,
    readyCount,
    winnerName,
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
  const showPlanner = matchSync?.status === "planning" || matchSync?.status === "ready_to_resolve";
  const showPlayerFacingArena =
    !launchedFromLobby || initialEntryMode === "join" || Boolean(duelId);
  const liveRoomRequired = launchedFromLobby;
  const liveRoomUnavailable = liveRoomRequired && !duelId && transportSource === "local";
  const selectedActionLabel = getOnlineSelectedActionLabel({
    duelId,
    playerReady,
    showPlanner,
    matchLocked,
    draft: playerMode === "host" ? hostDraft : guestDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
  });
  const selectedActionTags = getOnlineSelectedActionTags({
    duelId,
    playerReady,
    showPlanner,
    currentStepBadge: currentStep.badge,
    draft: playerMode === "host" ? hostDraft : guestDraft,
    playerActionSubmitted: playerSync?.currentRoundState?.yourActionSubmitted ?? false,
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
  });
  const lastResolvedRound = hostSync?.lastResolvedRound ?? guestSync?.lastResolvedRound ?? null;
  const playerActionSubmitted = playerSync?.currentRoundState?.yourActionSubmitted ?? false;
  const playerActionBusy = playerMode === "host" ? hostActionSubmitting : guestActionSubmitting;
  const playerActionLocked = playerActionSubmitted || playerActionBusy;
  const playerDisplayName = playerParticipant?.displayName ?? preparedPlayer?.playerName ?? playerBuild.snapshot.name;
  const playerFigure = resolveFighterViewFigure(
    playerParticipant?.fighterView?.figure,
    preparedPlayer?.figure ?? resolvePresetFigure(playerBuild.presetId, playerMode === "host" ? "rush-chip" : "kitsune-bit")
  );
  const playerEquipment = playerParticipant?.fighterView?.equipment ?? preparedPlayer?.equipment ?? [];
  const playerCombatant = resolveCombatantSummary(lastResolvedRound, playerDisplayName);
  const playerCurrentHp = playerCombatant?.currentHp ?? playerBuild.snapshot.maxHp;
  const opponentBuild = playerMode === "host" ? guestBuild : hostBuild;
  const opponentFallbackName = opponentParticipant?.displayName ?? opponentBuild.snapshot.name ?? "Rival";
  const opponentFigure = resolveFighterViewFigure(
    opponentParticipant?.fighterView?.figure,
    resolvePresetFigure(opponentBuild.presetId, "vermin-tek")
  );
  const opponentEquipment = opponentParticipant?.fighterView?.equipment ?? [];
  const opponentCombatant = resolveCombatantSummary(lastResolvedRound, opponentFallbackName);
  const opponentCurrentHp = opponentCombatant?.currentHp ?? opponentBuild.snapshot.maxHp;
  const playerDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(playerBuild.snapshot.damage),
    stats: playerBuild.snapshot.stats,
    totalArmor: totalArmorProfileValue(playerBuild.snapshot.armor),
    dodgeBonus: playerBuild.snapshot.dodgeChanceBonus,
    critBonus: playerBuild.snapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + playerBuild.snapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: playerBuild.snapshot.blockPowerBonus,
    armorPenetrationPercent: playerBuild.snapshot.armorPenetrationPercent,
  }).slice(0, 4);
  const opponentDerivedStats = buildProfileDerivedStats({
    totalDamage: totalDamageProfileValue(opponentBuild.snapshot.damage),
    stats: opponentBuild.snapshot.stats,
    totalArmor: totalArmorProfileValue(opponentBuild.snapshot.armor),
    dodgeBonus: opponentBuild.snapshot.dodgeChanceBonus,
    critBonus: opponentBuild.snapshot.critChanceBonus,
    totalCritMultiplier: 1.5 + opponentBuild.snapshot.critMultiplierBonus / 100,
    baseBlockPenetrationValue: opponentBuild.snapshot.blockPowerBonus,
    armorPenetrationPercent: opponentBuild.snapshot.armorPenetrationPercent,
  }).slice(0, 4);
  const actionsDisabled = transportSource === "checking" || matchLocked;
  const entryActionsDisabled = actionsDisabled || liveRoomUnavailable;

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

  async function recoverRealtimeState(nextDuelId: string) {
    const hostMessages = await runClientAction(() => setupRef.current.hostClient.requestSync(nextDuelId));
    const guestMessages = await runClientAction(() => setupRef.current.guestClient.requestSync(nextDuelId));
    applyInboundMessages([...hostMessages, ...guestMessages]);
  }

  function refreshRealtimeSubscriptions(nextDuelId: string | null) {
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
    const hostResumeToken = setupRef.current.hostClient.getLastSync()?.resumeToken;
    const guestResumeToken = setupRef.current.guestClient.getLastSync()?.resumeToken;
    if (!hostResumeToken || !guestResumeToken) {
      setTransportIssue("missing_resume_token");
      return;
    }

    hostSubscriptionRef.current = subscribeToOnlineDuelEvents({
      baseUrl,
      duelId: nextDuelId,
      playerId: setupRef.current.hostClient.identity.playerId,
      resumeToken: hostResumeToken,
      afterEventId: hostLastEventIdRef.current ?? undefined,
      onMessage: (message, eventId) =>
        applyInboundMessages([message], eventId ? { host: eventId } : undefined),
      onOpen: () => void recoverRealtimeState(nextDuelId),
      onError: () => {
        setTransportIssue("event_stream_error");
        void recoverRealtimeState(nextDuelId);
      },
    });
    guestSubscriptionRef.current = subscribeToOnlineDuelEvents({
      baseUrl,
      duelId: nextDuelId,
      playerId: setupRef.current.guestClient.identity.playerId,
      resumeToken: guestResumeToken,
      afterEventId: guestLastEventIdRef.current ?? undefined,
      onMessage: (message, eventId) =>
        applyInboundMessages([message], eventId ? { guest: eventId } : undefined),
      onOpen: () => void recoverRealtimeState(nextDuelId),
      onError: () => {
        setTransportIssue("event_stream_error");
        void recoverRealtimeState(nextDuelId);
      },
    });
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
        }),
        preparedPlayer?.playerName ?? hostBuild.snapshot.name
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
      refreshRealtimeSubscriptions(created.duelId);
    }
    applyInboundMessages(nextMessages);
  }

  async function handleFindMatchmakingDuel() {
    if (liveRoomRequired && setupRef.current.transportLabel !== "backend") {
      setTransportIssue("live_service_required");
      return;
    }

    const nextMessages = await runClientAction(() =>
      setupRef.current.hostClient.findMatchmakingDuel(
        hostBuild.snapshot,
        buildClientFighterView({
          preparedPlayer,
          fallbackFigure: resolvePresetFigure(hostBuild.presetId, "rush-chip"),
        }),
        preparedPlayer?.playerName ?? hostBuild.snapshot.name
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
      refreshRealtimeSubscriptions(created.duelId);
    } else if (matchSync?.type === "duel_state_sync" && matchSync.payload.yourSeat) {
      setDuelId(matchSync.payload.duelId);
      setHostSeat(matchSync.payload.yourSeat);
      setJoinCode(matchSync.payload.roomCode);
      setPlayerMode("host");
      setDebugClientMode("host");
      setEntryMode("create");
      refreshRealtimeSubscriptions(matchSync.payload.duelId);
    }

    applyInboundMessages(nextMessages);
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
        }),
        preparedPlayer?.playerName ?? guestBuild.snapshot.name
      )
    );
    const joinSync = nextMessages.find((message) => message.type === "duel_state_sync");
    if (joinSync?.type === "duel_state_sync" && joinSync.payload.yourSeat) {
      setDuelId(joinSync.payload.duelId);
      setGuestSeat(joinSync.payload.yourSeat);
      setPlayerMode("guest");
      setDebugClientMode("guest");
      setEntryMode("join");
      refreshRealtimeSubscriptions(joinSync.payload.duelId);
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

    setHostActionSubmitting(true);
    try {
      const submitMessages = await runClientAction(() =>
        setupRef.current.hostClient.submitRoundAction(
          duelId,
          resolvedHostSeat,
          buildPlayerRoundAction({
            attackerId: hostBuild.snapshot.characterId,
            draft: hostDraft,
            skill: null,
            consumable: null,
          })
        )
      );
      const recoveredMessages = shouldRecoverFromSubmitError(submitMessages)
        ? await runClientAction(() => setupRef.current.hostClient.requestSync(duelId))
        : [];
      applyInboundMessages([...submitMessages, ...recoveredMessages]);
    } finally {
      setHostActionSubmitting(false);
    }
  }

  async function handleGuestAttack() {
    if (!duelId || guestActionSubmitting || guestSync?.currentRoundState?.yourActionSubmitted) {
      return;
    }

    setGuestActionSubmitting(true);
    try {
      const submitMessages = await runClientAction(() =>
        setupRef.current.guestClient.submitRoundAction(
          duelId,
          resolvedGuestSeat,
          buildPlayerRoundAction({
            attackerId: guestBuild.snapshot.characterId,
            draft: guestDraft,
            skill: null,
            consumable: null,
          })
        )
      );
      const recoveredMessages = shouldRecoverFromSubmitError(submitMessages)
        ? await runClientAction(() => setupRef.current.guestClient.requestSync(duelId))
        : [];
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

    const nextMessages = await runClientAction(() =>
      setupRef.current.hostClient.requestRematch(duelId)
    );
    const guestSyncMessages = await runClientAction(() =>
      setupRef.current.guestClient.requestSync(duelId)
    );
    applyInboundMessages([...nextMessages, ...guestSyncMessages]);
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
    setTransportIssue(null);
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
          <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>{launchedFromLobby ? "PvP Fight" : "1v1 Battle"}</h1>
          <p style={{ margin: "10px 0 0", maxWidth: 780, color: "rgba(255,244,231,0.72)", lineHeight: 1.6 }}>
            {launchedFromLobby
              ? matchmakingMode
                ? "Your fighter is ready. Matchmaking is now searching for another prepared player and will drop you straight into the fight."
                : "Your fighter is ready. This screen now focuses on your rival, the duel code, and the combat flow."
              : "Create a match, share the code, bring in the second fighter, and play through a 1v1 battle where both sides stay in step."}
          </p>
        </div>
        <button type="button" onClick={onBack} style={ghostButtonStyle}>
          {launchedFromLobby ? "Back to PvP Lobby" : "Back to Menu"}
        </button>
      </div>

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
      ) : duelId ? (
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Fight Status</span>
            <span style={chipStyle}>{currentStep.badge}</span>
          </div>
          <p style={helperTextStyle}>{currentStep.message}</p>
          {transportIssue ? <p style={warningTextStyle}>Connection issue: {describeTransportIssue(transportIssue)}</p> : null}
          <div style={statStripStyle}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Duel Code</div>
              <div style={{ ...statValueStyle, letterSpacing: "0.16em", fontFamily: "Consolas, monospace" }}>
                {hostSync?.roomCode ?? guestSync?.roomCode ?? "------"}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Opponent</div>
              <div style={statValueStyle}>{opponentParticipant?.displayName ?? "Waiting for rival"}</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Ready</div>
              <div style={statValueStyle}>{readyCount}/2 ready</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Connection</div>
              <div style={statValueStyle}>{transportBadgeLabel(transportSource)}</div>
            </div>
          </div>
        </article>
      ) : (
        <article style={panelStyle}>
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Fight Status</span>
            <span style={chipStyle}>{matchmakingMode ? "Searching" : initialEntryMode === "join" ? "Joining" : "Opening"}</span>
          </div>
          <p style={helperTextStyle}>
            {matchmakingMode
              ? "Searching for another prepared fighter and opening the combat screen as soon as a rival is found."
              : initialEntryMode === "join"
                ? "Joining the shared match code with your prepared fighter."
                : "Opening a fresh match for your prepared fighter."}
          </p>
          <div style={emptyCardStyle}>
            {matchmakingMode ? "Searching for a rival..." : initialEntryMode === "join" ? "Joining match..." : "Opening match..."}
          </div>
          {transportIssue ? <p style={warningTextStyle}>Connection issue: {describeTransportIssue(transportIssue)}</p> : null}
        </article>
      )}

      {showPlayerFacingArena ? (
        <>
          <article style={{ ...panelStyle, padding: 16 }}>
            <div style={sectionHeadStyle}>
              <span style={eyebrowStyle}>Combat Arena</span>
              <div style={combatArenaBadgeRowStyle}>
                <span style={chipStyle}>{playerSync?.yourSeat ?? playerSeat}</span>
                <span style={chipStyle}>{hostSync?.roomCode ?? guestSync?.roomCode ?? "------"}</span>
              </div>
            </div>
            <p style={{ ...helperTextStyle, marginTop: 10 }}>{currentStep.message}</p>
            {transportIssue ? <p style={warningTextStyle}>Connection issue: {describeTransportIssue(transportIssue)}</p> : null}
          </article>

          <ArenaStageShell shellStyle={shellStyle}>
            <ArenaStageColumns>
              <OnlinePlayerCombatPanel
                playerName={playerDisplayName}
                playerFigure={playerFigure}
                currentHp={playerCurrentHp}
                maxHp={playerBuild.snapshot.maxHp}
                equipment={playerEquipment}
                shellStyle={shellStyle}
                panelStyle={panelStyle}
                derivedStats={playerDerivedStats}
                roleLabel={playerMode === "host" ? "Host" : "Guest"}
                presetLabel={resolvePresetById(playerBuild.presetId)?.label ?? "Custom"}
                winner={matchSync?.winnerSeat === (playerSync?.yourSeat ?? playerSeat)}
                loser={Boolean(matchSync?.winnerSeat) && matchSync?.winnerSeat !== (playerSync?.yourSeat ?? playerSeat)}
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
                onLockAttack={() => void (playerMode === "host" ? handleHostAttack() : handleGuestAttack())}
                actionsDisabled={actionsDisabled}
              />

              <OnlineOpponentCombatPanel
                playerName={opponentParticipant?.displayName ?? "Player 2"}
                playerFigure={opponentFigure}
                currentHp={opponentCurrentHp}
                maxHp={opponentBuild.snapshot.maxHp}
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
              />
            </ArenaStageColumns>
          </ArenaStageShell>
        </>
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
                <SyncView sync={debugSync} emptyLabel="The selected debug client has not synced yet." />
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

      <RoundResultCard summary={lastResolvedRound} />
      <MatchFinishCard
        status={matchSync?.status ?? null}
        winnerName={winnerName}
        onLeave={() => void handleLeaveRoom()}
        onPlayAgain={() => void handlePlayAnotherMatch()}
      />
    </section>
  );
}

function pickMostCompleteSync(
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

function resolveCombatantSummary(summary: OnlineDuelRoundSummary | null, displayName: string) {
  if (!summary) {
    return null;
  }

  return summary.combatants.find((combatant) => combatant.name === displayName) ?? null;
}

function buildClientFighterView({
  preparedPlayer,
  fallbackFigure,
}: {
  preparedPlayer: PvpPreparedFighter | null;
  fallbackFigure: string;
}): OnlineDuelFighterView {
  return {
    figure: preparedPlayer?.figure ?? fallbackFigure,
    equipment: preparedPlayer?.equipment ?? [],
  };
}

function resolveFighterViewFigure(figure: string | undefined, fallback: string) {
  return (figure ?? fallback) as Parameters<typeof CombatSilhouette>[0]["figure"];
}

function totalDamageProfileValue(profile: ReturnType<typeof buildCombatSnapshot>["damage"]) {
  return profile.slash + profile.pierce + profile.blunt + profile.chop;
}

function totalArmorProfileValue(profile: ReturnType<typeof buildCombatSnapshot>["armor"]) {
  return profile.slash + profile.pierce + profile.blunt + profile.chop;
}

function StatSummaryGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string; helper: string }>;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {stats.map((stat) => (
        <div key={stat.label} style={statSummaryRowStyle}>
          <span style={statSummaryLabelStyle}>{stat.label}</span>
          <span style={statSummaryValueStyle}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
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

function getMatchStatusSummary({
  duelId,
  status,
  joinedCount,
  readyCount,
  winnerName,
}: {
  duelId: string | null;
  status?: string;
  joinedCount: number;
  readyCount: number;
  winnerName: string | null;
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

  if (joinedCount < 2) {
    return {
      badge: "Waiting for rival",
      message: "The fight is open. Share the duel code and wait for the second fighter to connect.",
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

function getCurrentStepSummary({
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
        message: "You are ready. Share the duel code and wait for the second fighter to join the fight.",
      };
    }

    return {
      badge: "Share code",
      message: "Share the duel code and wait for the second fighter to appear before the battle can begin.",
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

function activeParticipantIsReady(
  sync: OnlineDuelStateSync | null,
  fallbackSeat: string
) {
  if (!sync) {
    return false;
  }

  return sync.participants.find((participant) => participant.seat === (sync.yourSeat ?? fallbackSeat))?.ready ?? false;
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
  onPrimaryAction,
  onCancelReady,
  onAttackZoneChange,
  onDefenseZoneToggle,
  onLockAttack,
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
  onPrimaryAction: () => void;
  onCancelReady: () => void;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
  onLockAttack: () => void;
}) {
  return (
    <div data-testid="fight-setup-panel" style={{ ...shellStyle, padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
      <div style={{ display: "grid", gap: 12 }}>
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
            resourcePanel={<ResourceGrid panelStyle={panelStyle} resources={null} />}
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

        <MiniPanel panelStyle={panelStyle} title="Combat Actions">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ ...panelStyle, padding: 10, display: "grid", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc5ae" }}>
                  Round State
                </div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{currentStep.badge}</div>
                <div style={{ fontSize: 12, color: "rgba(255,244,231,0.72)", lineHeight: 1.45 }}>{currentStep.message}</div>
              </div>
              <div style={{ ...panelStyle, padding: 10, display: "grid", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc5ae" }}>
                  Action Flow
                </div>
                <button
                  type="button"
                  aria-label="Cancel Ready"
                  onClick={onCancelReady}
                  disabled={!duelId || actionsDisabled || showPlanner || !playerReady}
                  style={{
                    ...buttonStyle,
                    ...(!duelId || actionsDisabled || showPlanner || !playerReady ? { opacity: 0.48, cursor: "not-allowed" } : {}),
                  }}
                >
                  Cancel Ready
                </button>
                <div style={{ fontSize: 12, color: "rgba(255,244,231,0.72)", lineHeight: 1.45 }}>
                  Ready both sides, then choose attack and guard zones exactly like the normal fight screen.
                </div>
              </div>
            </div>
          </div>
        </MiniPanel>
      </div>
    </div>
  );
}

function OnlinePlayerCombatPanel({
  playerName,
  playerFigure,
  currentHp,
  maxHp,
  equipment,
  shellStyle,
  panelStyle,
  derivedStats,
  roleLabel,
  presetLabel,
  winner,
  loser,
}: {
  playerName: string;
  playerFigure: string;
  currentHp: number;
  maxHp: number;
  equipment: Array<{ slot: string; item: unknown }>;
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  derivedStats: Array<{ label: string; value: string; helper: string }>;
  roleLabel: string;
  presetLabel: string;
  winner: boolean;
  loser: boolean;
}) {
  return (
    <SidePanel
      shellStyle={shellStyle}
      panelStyle={panelStyle}
      silhouette={
        <div className={winner ? "combat-postfight-silhouette combat-postfight-silhouette--victory-left" : loser ? "combat-postfight-silhouette combat-postfight-silhouette--defeat-left" : undefined}>
          <CombatSilhouette
            title={playerName}
            currentHp={currentHp}
            maxHp={maxHp}
            activeEffects={[]}
            equipmentSlots={equipment as Array<{ slot: EquipmentSlot; item: Item | null }>}
            figure={playerFigure as never}
            mirrored
          />
        </div>
      }
      sidebar={
        <div style={{ display: "grid", gap: 8, alignContent: "start", height: "100%" }}>
          <MiniPanel panelStyle={panelStyle} title="Utility">
            <div style={{ display: "grid", gap: 6 }}>
              <div style={combatArenaBadgeRowStyle}>
                <span style={chipStyle}>{roleLabel}</span>
                <span style={chipStyle}>{presetLabel}</span>
              </div>
            </div>
          </MiniPanel>
          <MiniPanel panelStyle={panelStyle} title="Build">
            <StatSummaryGrid stats={derivedStats} />
          </MiniPanel>
        </div>
      }
      blocks={[]}
    />
  );
}

function OnlineOpponentCombatPanel({
  playerName,
  playerFigure,
  currentHp,
  maxHp,
  equipment,
  shellStyle,
  panelStyle,
  derivedStats,
  connectionLabel,
  readinessLabel,
  winner,
  loser,
}: {
  playerName: string;
  playerFigure: string;
  currentHp: number;
  maxHp: number;
  equipment: Array<{ slot: string; item: unknown }>;
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  derivedStats: Array<{ label: string; value: string; helper: string }>;
  connectionLabel: string;
  readinessLabel: string;
  winner: boolean;
  loser: boolean;
}) {
  return (
    <SidePanel
      shellStyle={shellStyle}
      panelStyle={panelStyle}
      silhouette={
        <div style={{ display: "grid", gap: 8 }}>
          <div className={winner ? "combat-postfight-silhouette combat-postfight-silhouette--victory-right" : loser ? "combat-postfight-silhouette combat-postfight-silhouette--defeat-right" : undefined}>
            <CombatSilhouette
              title={playerName}
              currentHp={currentHp}
              maxHp={maxHp}
              activeEffects={[]}
              equipmentSlots={equipment as Array<{ slot: EquipmentSlot; item: Item | null }>}
              figure={playerFigure as never}
            />
          </div>
          <ResourceGrid panelStyle={panelStyle} resources={null} layout="row" showHeader={false} />
        </div>
      }
      sidebar={
        <div style={{ display: "grid", gap: 8, alignContent: "start", height: "100%" }}>
          <MiniPanel panelStyle={panelStyle} title="Utility">
            <div style={{ display: "grid", gap: 6 }}>
              <div style={combatArenaBadgeRowStyle}>
                <span style={chipStyle}>{connectionLabel}</span>
                <span style={chipStyle}>{readinessLabel}</span>
              </div>
            </div>
          </MiniPanel>
          <MiniPanel panelStyle={panelStyle} title="Snapshot">
            <StatSummaryGrid stats={derivedStats} />
          </MiniPanel>
        </div>
      }
      blocks={[]}
    />
  );
}

function getOnlineSelectedActionLabel({
  duelId,
  playerReady,
  showPlanner,
  matchLocked,
  draft,
  playerActionSubmitted,
}: {
  duelId: string | null;
  playerReady: boolean;
  showPlanner: boolean;
  matchLocked: boolean;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
}) {
  if (!duelId) return "Open Match";
  if (matchLocked) return "Fight Complete";
  if (!playerReady) return "Ready Check";
  if (!showPlanner) return "Waiting for Rival";
  if (playerActionSubmitted) return "Action Locked";
  return `${zoneLabels[draft.attackZone]} Strike`;
}

function getOnlineSelectedActionTags({
  duelId,
  playerReady,
  showPlanner,
  currentStepBadge,
  draft,
  playerActionSubmitted,
}: {
  duelId: string | null;
  playerReady: boolean;
  showPlanner: boolean;
  currentStepBadge: string;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
}) {
  if (!duelId) return ["Open"];
  if (!playerReady) return [currentStepBadge, "Ready Check"];
  if (!showPlanner) return [currentStepBadge, "Waiting"];
  return [
    currentStepBadge,
    playerActionSubmitted ? "Locked" : "Planning",
    `Target ${zoneLabels[draft.attackZone]}`,
  ];
}

function getOnlineSelectedActionSummary({
  duelId,
  currentStepMessage,
  opponentState,
  draft,
  playerActionSubmitted,
  showPlanner,
}: {
  duelId: string | null;
  currentStepMessage: string;
  opponentState: string;
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  showPlanner: boolean;
}) {
  if (!duelId) return ["Create or join a duel.", "Share the room code.", "Wait for both fighters."];
  if (!showPlanner) return [currentStepMessage, `Opponent ${opponentState}`, "Round planning unlocks after ready."];
  return [
    playerActionSubmitted ? "Your action is locked in." : "Choose attack and block zones.",
    `Attack ${zoneLabels[draft.attackZone]}`,
    `Guard ${draft.defenseZones.map((zone) => zoneLabels[zone]).join(" + ")}`,
  ];
}

function resolveWinnerName(sync: OnlineDuelStateSync | null) {
  if (!sync?.winnerSeat) {
    return null;
  }

  return sync.participants.find((participant) => participant.seat === sync.winnerSeat)?.displayName ?? sync.winnerSeat;
}

function RoundPlannerCard({
  draft,
  mode,
  onAttackZoneChange,
  onDefenseZoneToggle,
}: {
  draft: RoundDraft;
  mode: ClientMode;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
}) {
  return (
    <div style={plannerCardStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Round Plan</span>
        <span style={chipStyle}>
          {zoneLabels[draft.attackZone]} / Guard {draft.defenseZones.map((zone) => zoneLabels[zone]).join(" + ")}
        </span>
      </div>
      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div>
          <div style={plannerLabelStyle}>Attack Zone</div>
          <div style={plannerZoneRowStyle}>
            {combatZones.map((zone) => {
              const selected = draft.attackZone === zone;
              return (
                <button
                  key={`${mode}-attack-${zone}`}
                  type="button"
                  onClick={() => onAttackZoneChange(zone)}
                  aria-label={`${capitalizeLabel(mode)} attack zone ${zone}`}
                  style={selected ? plannerPrimaryButtonStyle : plannerGhostButtonStyle}
                >
                  {zoneLabels[zone]}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={plannerLabelStyle}>Defense Zones</div>
          <div style={plannerZoneRowStyle}>
            {combatZones.map((zone) => {
              const selected = draft.defenseZones.includes(zone);
              return (
                <button
                  key={`${mode}-defense-${zone}`}
                  type="button"
                  onClick={() => onDefenseZoneToggle(zone)}
                  aria-label={`${capitalizeLabel(mode)} defense zone ${zone}`}
                  style={selected ? plannerPrimaryButtonStyle : plannerGhostButtonStyle}
                >
                  {zoneLabels[zone]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundResultCard({
  summary,
}: {
  summary: OnlineDuelRoundSummary | null;
}) {
  if (!summary) {
    return (
      <article style={panelStyle}>
        <div style={sectionHeadStyle}>
          <span style={eyebrowStyle}>Round Result</span>
          <span style={chipStyle}>Waiting</span>
        </div>
        <p style={helperTextStyle}>Resolve a round to see the exchange summary here.</p>
      </article>
    );
  }

  return (
    <article style={panelStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Round Result</span>
        <span style={chipStyle}>Round {summary.round}</span>
      </div>
      <div style={statStripStyle}>
        {summary.combatants.map((combatant) => (
          <div key={combatant.id} style={statCardStyle}>
            <div style={statLabelStyle}>{combatant.name}</div>
            <div style={statValueStyle}>
              {combatant.currentHp} / {combatant.maxHp} HP
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {summary.entries.map((entry, index) => (
          <div key={`${summary.round}-${entry.attackerName}-${index}`} style={messageCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>
                {entry.attackerName} {"->"} {entry.defenderName}
              </strong>
              <span style={messageMetaStyle}>
                {zoneLabels[entry.attackZone]} | {entry.dodged ? "dodged" : entry.blocked ? "blocked" : "landed"}
                {entry.crit ? " | crit" : ""} | {entry.finalDamage} dmg
              </span>
            </div>
            <p style={{ margin: "10px 0 0", color: "rgba(255,244,231,0.82)", lineHeight: 1.55 }}>
              {entry.commentary}
            </p>
            {entry.knockoutCommentary ? (
              <p style={{ margin: "8px 0 0", color: "rgba(255,210,168,0.92)", lineHeight: 1.5 }}>
                KO: {entry.knockoutCommentary}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function MatchFinishCard({
  status,
  winnerName,
  onLeave,
  onPlayAgain,
}: {
  status: string | null;
  winnerName: string | null;
  onLeave: () => void | Promise<void>;
  onPlayAgain: () => void | Promise<void>;
}) {
  if (status !== "finished" && status !== "abandoned") {
    return null;
  }

  return (
    <article style={panelStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>Fight Finish</span>
        <span style={chipStyle}>{status === "finished" ? "Complete" : "Closed"}</span>
      </div>
      <p style={helperTextStyle}>
        {status === "finished"
          ? winnerName
            ? `${winnerName} wins the duel.`
            : "The duel has finished."
          : "This match has been closed."}
      </p>
      <div style={buttonRowStyle}>
        <button type="button" style={ghostButtonStyle} onClick={onLeave}>
          Leave Fight
        </button>
        <button type="button" style={primaryButtonStyle} onClick={onPlayAgain}>
          Fight Again
        </button>
      </div>
    </article>
  );
}

function SyncView({
  sync,
  emptyLabel,
}: {
  sync: ReturnType<OnlineDuelClient["getLastSync"]>;
  emptyLabel: string;
}) {
  if (!sync) {
    return <div style={emptyCardStyle}>{emptyLabel}</div>;
  }

  return (
    <>
      <div style={statStripStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Status</div>
          <div style={statValueStyle}>{sync.status}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Round</div>
          <div style={statValueStyle}>{sync.round ?? "-"}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Winner</div>
          <div style={statValueStyle}>{sync.winnerSeat ?? "-"}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Seat</div>
          <div style={statValueStyle}>{sync.yourSeat ?? "-"}</div>
        </div>
      </div>
      <div style={statStripStyle}>
        {sync.participants.map((participant) => (
          <div key={participant.seat} style={statCardStyle}>
            <div style={statLabelStyle}>{participant.displayName}</div>
            <div style={statValueStyle}>{participant.connected ? (participant.ready ? "Ready" : "Waiting") : "Offline"}</div>
            <div style={{ marginTop: 6, color: "rgba(255,244,231,0.58)", fontSize: 12 }}>
              {participant.connected ? "connected" : "disconnected"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function capitalizeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PresetChooser({
  title,
  selectedPresetId,
  locked,
  onSelect,
}: {
  title: string;
  selectedPresetId: string;
  locked: boolean;
  onSelect: (presetId: string) => void;
}) {
  return (
    <div style={presetChooserStyle}>
      <div style={sectionHeadStyle}>
        <span style={eyebrowStyle}>{title}</span>
        <span style={chipStyle}>{locked ? "Locked for this room" : "Pick before match"}</span>
      </div>
      <div style={presetGridStyle}>
        {combatBuildPresets.map((preset) => {
          const selected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              type="button"
              style={selected ? presetSelectedButtonStyle : presetButtonStyle}
              onClick={() => onSelect(preset.id)}
              disabled={locked}
            >
              <strong style={{ fontSize: 13 }}>{preset.label}</strong>
              <span style={presetMetaStyle}>{preset.archetype}</span>
            </button>
          );
        })}
      </div>
      <p style={{ ...helperTextStyle, marginTop: 10 }}>
        {resolvePresetById(selectedPresetId)?.description ?? "Choose one of the live curated combat presets."}
      </p>
    </div>
  );
}

function resolvePresetById(presetId: string): CombatBuildPreset | null {
  return combatBuildPresets.find((preset) => preset.id === presetId) ?? null;
}

function createOnlineBuildSelection(
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

interface OnlineDuelSetup {
  transportLabel: "backend" | "local";
  hostClient: OnlineDuelClient;
  guestClient: OnlineDuelClient;
  resetHostClient(): void;
  resetGuestClient(): void;
  expireRooms?: (now?: number) => void;
}

interface OnlineSetupClientIdentityOverride {
  playerId: string;
  sessionId: string;
  displayName: string;
}

function createOnlineSetupForScreen({
  mode,
  baseUrl,
  matchmakingIdentity,
}: {
  mode: "backend" | "local";
  baseUrl: string;
  matchmakingIdentity?: OnlineSetupClientIdentityOverride;
}) {
  return mode === "backend"
    ? createHttpOnlineSetup(baseUrl, matchmakingIdentity)
    : createLocalOnlineSetup(matchmakingIdentity);
}

function createLocalOnlineSetup(matchmakingIdentity?: OnlineSetupClientIdentityOverride): OnlineDuelSetup {
  const service = createInMemoryOnlineDuelService(new SeededRandom(21));
  const transport = createLocalOnlineDuelTransport(service);
  return createOnlineSetupFromTransport({
    transportLabel: "local",
    transport,
    hostIdentityOverride: matchmakingIdentity,
    expireRooms(now) {
      service.expireStaleRooms(now);
    },
  });
}

function createHttpOnlineSetup(
  baseUrl: string,
  matchmakingIdentity?: OnlineSetupClientIdentityOverride
): OnlineDuelSetup {
  const transport = createHttpOnlineDuelTransport({ baseUrl });
  return createOnlineSetupFromTransport({
    transportLabel: "backend",
    transport,
    hostIdentityOverride: matchmakingIdentity,
  });
}

function createOnlineSetupFromTransport({
  transportLabel,
  transport,
  hostIdentityOverride,
  expireRooms,
}: {
  transportLabel: "backend" | "local";
  transport: OnlineDuelTransport;
  hostIdentityOverride?: OnlineSetupClientIdentityOverride;
  expireRooms?: (now?: number) => void;
}): OnlineDuelSetup {
  let hostSessionVersion = 1;
  let guestSessionVersion = 1;

  const createHostClient = () =>
    createOnlineDuelClient(transport, {
      playerId: hostIdentityOverride?.playerId ?? "player-host",
      sessionId: hostIdentityOverride?.sessionId ?? `session-host-${hostSessionVersion}`,
      displayName: hostIdentityOverride?.displayName ?? "Host",
    });
  const createGuestClient = () =>
    createOnlineDuelClient(transport, {
      playerId: "player-guest",
      sessionId: `session-guest-${guestSessionVersion}`,
      displayName: "Guest",
    });

  const setup: OnlineDuelSetup = {
    transportLabel,
    hostClient: createHostClient(),
    guestClient: createGuestClient(),
    resetHostClient() {
      hostSessionVersion += 1;
      setup.hostClient = createHostClient();
    },
    resetGuestClient() {
      guestSessionVersion += 1;
      setup.guestClient = createGuestClient();
    },
  };

  if (expireRooms) {
    setup.expireRooms = expireRooms;
  }

  return setup;
}

function getOnlineDuelBackendBaseUrl() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:3001";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "127.0.0.1";
  return `${protocol}//${hostname}:3001`;
}

async function canReachOnlineDuelBackend(baseUrl: string) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }

  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

function describeTransportIssue(issue: string) {
  switch (issue) {
    case "missing_resume_token":
      return "the match link needs to refresh before updates can continue.";
    case "event_stream_error":
      return "live updates dropped for a moment. Trying to reconnect now.";
    case "online_duel_transport_error":
      return "the match service did not answer.";
    case "invalid_status":
      return "the match is not in the right phase for that action yet.";
    case "stale_sync":
      return "your match state is out of date. Refresh the room and try again.";
    case "displaced_session":
      return "this session was replaced by a newer one for the same fighter.";
    case "participant_disconnected":
      return "that fighter is disconnected right now.";
    case "seat_mismatch":
      return "that action was sent for the wrong side.";
    case "duel_not_found":
      return "that match could not be found.";
    case "live_service_required":
      return "the live match service is offline. Start online:server before creating or joining a PvP fight.";
    case "room_full":
      return "that match already has two fighters.";
    default:
      return issue.replaceAll("_", " ");
  }
}

function transportBadgeLabel(source: TransportSource) {
  switch (source) {
    case "backend":
      return "Live room";
    case "local":
      return "Local room";
    default:
      return "Checking room";
  }
}

function shouldRecoverFromSubmitError(messages: OnlineDuelServerMessage[]) {
  return messages.some(
    (message) =>
      message.type === "duel_error" &&
      (message.reason === "already_submitted" || message.reason === "stale_sync")
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
