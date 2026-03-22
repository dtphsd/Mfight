import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import type {
  OnlineDuelClient,
  OnlineDuelEventSubscription,
  OnlineDuelServerMessage,
} from "@/modules/arena";
import { subscribeToOnlineDuelEvents } from "@/modules/arena";
import {
  createRoundDraft,
  getRoundDraftSelectedConsumableCode,
  getRoundDraftSelectedSkillId,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";
import {
  buildClientFighterView,
  buildOnlineParticipantLoadout,
  resolveCombatLoadoutForMode,
  resolveOnlineActionClientMode,
  resolveOnlineRealtimeClientModes,
  type ClientMode,
  type EntryMode,
  type OnlineBuildSelection,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";
import { resolvePresetFigure } from "@/ui/screens/Combat/combatSandboxScreenDerived";
import {
  createOnlineSetupForScreen,
  getOnlineDuelBackendBaseUrl,
  shouldRecoverFromSubmitError,
  shouldRefreshClientsAfterRoundResolution,
  type OnlineDuelSetup,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSetup";
import type { OnlineDuelStateSync } from "@/modules/arena/contracts/arenaPublicApi";

interface SessionControllerDeps {
  launchedFromLobby: boolean;
  playerMode: ClientMode;
  preparedPlayer: PvpPreparedFighter | null;
  hostBuild: OnlineBuildSelection;
  guestBuild: OnlineBuildSelection;
  hostSync: OnlineDuelStateSync | null;
  guestSync: OnlineDuelStateSync | null;
  hostDraft: RoundDraft;
  guestDraft: RoundDraft;
  resolvedHostSeat: OnlineDuelSeat;
  resolvedGuestSeat: OnlineDuelSeat;
  duelId: string | null;
  liveRoomRequired: boolean;
  matchmakingMode: boolean;
  initialEntryMode: "create" | "join" | "matchmaking";
  matchLocked: boolean;
  hostActionSubmitting: boolean;
  guestActionSubmitting: boolean;
  autoStartedRef: MutableRefObject<boolean>;
  screenInstanceIdRef: MutableRefObject<string>;
  setupRef: MutableRefObject<OnlineDuelSetup>;
  hostSubscriptionRef: MutableRefObject<OnlineDuelEventSubscription | null>;
  guestSubscriptionRef: MutableRefObject<OnlineDuelEventSubscription | null>;
  hostLastEventIdRef: MutableRefObject<string | null>;
  guestLastEventIdRef: MutableRefObject<string | null>;
  applyInboundMessages: (
    nextMessages: OnlineDuelServerMessage[],
    eventIds?: Partial<Record<ClientMode, string>>
  ) => void;
  record: (nextMessages: OnlineDuelServerMessage[]) => void;
  setTransportIssue: Dispatch<SetStateAction<string | null>>;
  setClientRefresh: Dispatch<SetStateAction<number>>;
  setDuelId: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<OnlineDuelServerMessage[]>>;
  setHostSeat: Dispatch<SetStateAction<string>>;
  setGuestSeat: Dispatch<SetStateAction<string>>;
  setJoinCode: Dispatch<SetStateAction<string>>;
  setPlayerMode: Dispatch<SetStateAction<ClientMode>>;
  setDebugClientMode: Dispatch<SetStateAction<ClientMode>>;
  setEntryMode: Dispatch<SetStateAction<EntryMode>>;
  setHostDraft: Dispatch<SetStateAction<RoundDraft>>;
  setGuestDraft: Dispatch<SetStateAction<RoundDraft>>;
  setHostActionSubmitting: Dispatch<SetStateAction<boolean>>;
  setGuestActionSubmitting: Dispatch<SetStateAction<boolean>>;
  setMatchmakingSearchActive: Dispatch<SetStateAction<boolean>>;
  setMatchmakingTimedOut: Dispatch<SetStateAction<boolean>>;
  setDebugOpen: Dispatch<SetStateAction<boolean>>;
}

export function createOnlineDuelSessionController({
  launchedFromLobby,
  playerMode,
  preparedPlayer,
  hostBuild,
  guestBuild,
  hostSync,
  guestSync,
  hostDraft,
  guestDraft,
  resolvedHostSeat,
  resolvedGuestSeat,
  duelId,
  liveRoomRequired,
  matchmakingMode,
  initialEntryMode,
  matchLocked,
  hostActionSubmitting,
  guestActionSubmitting,
  autoStartedRef,
  screenInstanceIdRef,
  setupRef,
  hostSubscriptionRef,
  guestSubscriptionRef,
  hostLastEventIdRef,
  guestLastEventIdRef,
  applyInboundMessages,
  record,
  setTransportIssue,
  setClientRefresh,
  setDuelId,
  setMessages,
  setHostSeat,
  setGuestSeat,
  setJoinCode,
  setPlayerMode,
  setDebugClientMode,
  setEntryMode,
  setHostDraft,
  setGuestDraft,
  setHostActionSubmitting,
  setGuestActionSubmitting,
  setMatchmakingSearchActive,
  setMatchmakingTimedOut,
  setDebugOpen,
}: SessionControllerDeps) {
  function getRealtimeClientModes(modeOverride?: ClientMode): ClientMode[] {
    return resolveOnlineRealtimeClientModes({
      launchedFromLobby,
      playerMode,
      modeOverride,
    });
  }

  function getClientForMode(mode: ClientMode): OnlineDuelClient {
    return mode === "host" ? setupRef.current.hostClient : setupRef.current.guestClient;
  }

  function getCombatLoadoutForMode(mode: ClientMode) {
    const syncedLoadout =
      mode === "host"
        ? hostSync?.yourSeat === resolvedHostSeat
          ? hostSync?.yourLoadout
          : undefined
        : guestSync?.yourSeat === resolvedGuestSeat
          ? guestSync?.yourLoadout
          : undefined;

    return resolveCombatLoadoutForMode({
      mode,
      playerMode,
      preparedPlayer,
      syncedLoadout,
      hostBuild,
      guestBuild,
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

    if (!nextDuelId || setupRef.current.transportLabel !== "backend" || typeof window === "undefined") {
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

  async function handleJoinDuel(joinCode: string) {
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
      await runClientAction(() => setupRef.current.hostClient.setReady(duelId, resolvedHostSeat, ready))
    );
  }

  async function handleHostConnection(connected: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() => setupRef.current.hostClient.setConnection(duelId, resolvedHostSeat, connected))
    );
  }

  async function handleGuestReady(ready: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() => setupRef.current.guestClient.setReady(duelId, resolvedGuestSeat, ready))
    );
  }

  async function handleGuestConnection(connected: boolean) {
    if (!duelId) {
      return;
    }
    applyInboundMessages(
      await runClientAction(() => setupRef.current.guestClient.setConnection(duelId, resolvedGuestSeat, connected))
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
        setupRef.current.hostClient.submitRoundAction(duelId, resolvedHostSeat, {
          attackZone: hostDraft.attackZone,
          defenseZones: hostDraft.defenseZones,
          intent: hostDraft.intent,
          selectedAction:
            hostDraft.selectedAction.kind === "skill_attack" && !selectedHostSkill
              ? { kind: "basic_attack" }
              : hostDraft.selectedAction.kind === "consumable" && !selectedHostConsumableItem?.consumableEffect
                ? { kind: "basic_attack" }
                : hostDraft.selectedAction,
        })
      );
      const syncModes: ClientMode[] = shouldRefreshClientsAfterRoundResolution(submitMessages)
        ? getRealtimeClientModes()
        : shouldRecoverFromSubmitError(submitMessages)
          ? ["host"]
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
        setupRef.current.guestClient.submitRoundAction(duelId, resolvedGuestSeat, {
          attackZone: guestDraft.attackZone,
          defenseZones: guestDraft.defenseZones,
          intent: guestDraft.intent,
          selectedAction:
            guestDraft.selectedAction.kind === "skill_attack" && !selectedGuestSkill
              ? { kind: "basic_attack" }
              : guestDraft.selectedAction.kind === "consumable" && !selectedGuestConsumableItem?.consumableEffect
                ? { kind: "basic_attack" }
                : guestDraft.selectedAction,
        })
      );
      const syncModes: ClientMode[] = shouldRefreshClientsAfterRoundResolution(submitMessages)
        ? getRealtimeClientModes()
        : shouldRecoverFromSubmitError(submitMessages)
          ? ["guest"]
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
    const nextMessages = await runClientAction(() => activeClient.requestRematch(duelId));
    const recoveredMessages = await Promise.all(
      getRealtimeClientModes().map((mode) => runClientAction(() => getClientForMode(mode).requestSync(duelId)))
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

    const activeClient = playerMode === "host" ? setupRef.current.hostClient : setupRef.current.guestClient;
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

  return {
    handleCreateDuel,
    handleFindMatchmakingDuel,
    handleStopMatchmakingSearch,
    handleRestartMatchmakingSearch,
    handleJoinDuel,
    handleHostSync,
    handleGuestSync,
    handleHostReady,
    handleHostConnection,
    handleGuestReady,
    handleGuestConnection,
    handleHostAttack,
    handleGuestAttack,
    handleForceTimeout,
    handlePlayAnotherMatch,
    handleLeaveRoom,
    handleNewHostSession,
    handleNewGuestSession,
    refreshRealtimeSubscriptions,
    resetOnlineFlow,
  };
}
