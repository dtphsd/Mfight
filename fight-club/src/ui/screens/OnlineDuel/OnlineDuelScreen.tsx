import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createProfileMailboxes,
  createProfileMeta,
} from "@/modules/profile";
import { type OnlineDuelEventSubscription, type OnlineDuelServerMessage } from "@/modules/arena";
import type { CombatZone } from "@/modules/combat";
import { combatBuildPresets } from "@/orchestration/combat/combatSandboxConfigs";
import {
  createRoundDraft,
  setRoundDraftAttackZone,
  setRoundDraftConsumable,
  setRoundDraftIntent,
  setRoundDraftSkill,
  toggleRoundDraftDefenseZone,
  type RoundDraft,
} from "@/orchestration/combat/roundDraft";
import {
  MatchFinishCard,
  RoundPlannerCard,
  RoundResultCard,
  SyncView,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenCards";
import { OnlineDuelArena } from "@/ui/screens/OnlineDuel/onlineDuelScreenArena";
import { OnlineDuelDebugPanel } from "@/ui/screens/OnlineDuel/onlineDuelScreenDebug";
import { PresetChooser } from "@/ui/screens/OnlineDuel/onlineDuelScreenLobby";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";
import {
  createOnlineBuildSelection,
  ONLINE_DUEL_MATCHMAKING_TIMEOUT_MS,
  resolvePresetById,
  type ClientMode,
  type EntryMode,
  type OnlineBuildSelection,
  type TransportSource,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";
import {
  canReachOnlineDuelBackend,
  createOnlineSetupForScreen,
  describeTransportIssue,
  getOnlineDuelBackendBaseUrl,
  transportBadgeLabel,
  type OnlineDuelSetup,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSetup";
import { createOnlineDuelSessionController } from "@/ui/screens/OnlineDuel/onlineDuelScreenSession";
import { buildOnlineDuelScreenState } from "@/ui/screens/OnlineDuel/onlineDuelScreenState";

export { resolveOnlineActionClientMode, resolveOnlineRealtimeClientModes } from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

interface OnlineDuelScreenProps {
  onBack: () => void;
  initialEntryMode?: "create" | "join" | "matchmaking";
  preparedPlayer?: PvpPreparedFighter | null;
  initialJoinCode?: string;
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
  const [matchmakingSearchActive, setMatchmakingSearchActive] = useState(initialEntryMode === "matchmaking");
  const [matchmakingTimedOut, setMatchmakingTimedOut] = useState(false);
  const [, setClientRefresh] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profileTarget, setProfileTarget] = useState<"player" | "opponent" | null>(null);
  const [playerProfileName, setPlayerProfileName] = useState(preparedPlayer?.playerName ?? "Player");
  const [playerProfile, setPlayerProfile] = useState(() => createProfileMeta());
  const [opponentProfile] = useState(() => createProfileMeta());
  const [mailboxes, setMailboxes] = useState(() =>
    createProfileMailboxes({
      playerName: preparedPlayer?.playerName ?? "Player",
      botName: "Rival",
    })
  );

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
    void handleJoinDuel(joinCode);
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
  const {
    resolvedHostSeat,
    resolvedGuestSeat,
    matchSync,
    joinedCount,
    readyCount,
    winnerName,
    playerSync,
    playerSeat,
    playerBuild,
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
    liveStatus,
    showPlanner,
    showPlayerFacingArena,
    liveRoomRequired,
    liveRoomUnavailable,
    matchmakingStatus,
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
    actionsDisabled,
    entryActionsDisabled,
    recoveryActionConfig,
  } = buildOnlineDuelScreenState({
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

  useEffect(() => {
    setPlayerProfileName((current) => (current === playerDisplayName ? current : playerDisplayName));
  }, [playerDisplayName]);

  useEffect(() => {
    setMailboxes((current) => ({
      player: {
        entries: current.player.entries.map((entry) => ({
          ...entry,
          fromName: entry.fromActorId === "player" ? playerDisplayName : entry.fromName,
          toName: entry.toActorId === "player" ? playerDisplayName : entry.toName,
        })),
      },
      bot: {
        entries: current.bot.entries.map((entry) => ({
          ...entry,
          fromName: entry.fromActorId === "bot" ? opponentDisplayName : entry.fromName,
          toName: entry.toActorId === "bot" ? opponentDisplayName : entry.toName,
        })),
      },
    }));
  }, [opponentDisplayName, playerDisplayName]);

  async function handleCopyRoomCode() {
    if (!activeRoomCode || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(activeRoomCode);
    setCodeCopied(true);
    window.setTimeout(() => setCodeCopied(false), 1400);
  }
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

  const {
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
  } = createOnlineDuelSessionController({
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
  });

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
                    onClick={() => void handleJoinDuel(joinCode)}
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
            {activeRoomCode ? (
              <div
                style={{
                  marginTop: 2,
                  borderRadius: 18,
                  border: "1px solid rgba(255,184,107,0.2)",
                  background: "linear-gradient(180deg, rgba(177,84,43,0.16), rgba(255,255,255,0.03))",
                  padding: "14px 16px",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={sectionHeadStyle}>
                  <span style={eyebrowStyle}>Share Code</span>
                  <button
                    type="button"
                    style={{
                      ...ghostButtonStyle,
                      padding: "8px 12px",
                      fontSize: 12,
                    }}
                    onClick={() => void handleCopyRoomCode()}
                  >
                    {codeCopied ? "Copied" : "Copy Code"}
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: "0.24em",
                    fontFamily: "Consolas, monospace",
                    color: "#fff4eb",
                  }}
                >
                  {activeRoomCode}
                </div>
                <p style={{ ...helperTextStyle, marginTop: 0 }}>
                  Send this code to the second player. They can paste it into `Join Match` to enter your room.
                </p>
              </div>
            ) : null}
            <div style={statStripStyle}>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Match</div>
                <div style={statValueStyle}>{duelId ? "Live" : "Not opened yet"}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Match Code</div>
                <div style={{ ...statValueStyle, letterSpacing: "0.16em", fontFamily: "Consolas, monospace" }}>
                  {activeRoomCode || "------"}
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

      <OnlineDuelArena
        showPlayerFacingArena={showPlayerFacingArena}
        matchmakingStatus={matchmakingStatus && duelId ? matchmakingStatus : null}
        duelId={duelId}
        liveStatus={liveStatus}
        panelStyle={panelStyle}
        shellStyle={shellStyle}
        sectionHeadStyle={sectionHeadStyle}
        eyebrowStyle={eyebrowStyle}
        chipStyle={chipStyle}
        helperTextStyle={helperTextStyle}
        ghostButtonStyle={ghostButtonStyle}
        primaryButtonStyle={primaryButtonStyle}
        combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
        statSummaryRowStyle={statSummaryRowStyle}
        statSummaryLabelStyle={statSummaryLabelStyle}
        statSummaryValueStyle={statSummaryValueStyle}
        deferredOverlayFallbackStyle={deferredOverlayFallbackStyle}
        buttonRowStyle={buttonRowStyle}
        currentStepCardStyle={currentStepCardStyle}
        playerMode={playerMode}
        playerBuildPresetLabel={resolvePresetById(playerBuild.presetId)?.label ?? "Custom"}
        playerDisplayName={playerDisplayName}
        playerFigure={playerFigure}
        playerCurrentHp={playerCurrentHp}
        playerSnapshot={playerSnapshot}
        playerCombatantState={playerCombatantState}
        playerEquipment={playerEquipment}
        playerDerivedStats={playerDerivedStats}
        playerProfileName={playerProfileName}
        playerProfile={playerProfile}
        playerProfileDerivedStats={playerProfileDerivedStats}
        playerAvailableSkills={playerAvailableSkills}
        playerResources={playerResources}
        playerSkillCooldowns={playerCombatantState?.skillCooldowns ?? {}}
        opponentDisplayName={opponentDisplayName}
        opponentFigure={opponentFigure}
        opponentCurrentHp={opponentCurrentHp}
        opponentSnapshot={opponentSnapshot}
        opponentCombatantState={opponentCombatantState}
        opponentEquipment={opponentEquipment}
        opponentDerivedStats={opponentDerivedStats}
        opponentProfile={opponentProfile}
        opponentProfileDerivedStats={opponentProfileDerivedStats}
        opponentAvailableSkills={opponentAvailableSkills}
        opponentResources={opponentResources}
        opponentParticipant={opponentParticipant}
        matchSyncWinnerSeat={matchSync?.winnerSeat ?? null}
        playerSeat={playerSeat}
        playerSyncSeat={playerSync?.yourSeat ?? null}
        combatLog={combatLog}
        battleLogEntries={battleLogEntries}
        profileTarget={profileTarget}
        mailboxes={mailboxes}
        setProfileTarget={setProfileTarget}
        setPlayerProfileName={setPlayerProfileName}
        setPlayerProfile={setPlayerProfile}
        setMailboxes={setMailboxes}
        currentStep={currentStep}
        matchLocked={matchLocked}
        readyCount={readyCount}
        playerReady={playerReady}
        showPlanner={showPlanner}
        opponentActionSubmitted={playerSync?.currentRoundState?.opponentActionSubmitted ?? false}
        selectedActionLabel={selectedActionLabel}
        selectedActionTags={selectedActionTags}
        selectedActionSummary={selectedActionSummary}
        draft={playerMode === "host" ? hostDraft : guestDraft}
        playerActionSubmitted={playerActionLocked}
        actionsDisabled={actionsDisabled}
        latestRoundSummary={lastResolvedRound ? `Round ${lastResolvedRound.round}` : "No round resolved yet."}
        selectedIntent={(playerMode === "host" ? hostDraft : guestDraft).intent}
        availableConsumables={playerAvailableConsumables}
        roomCode={activeRoomCode}
        codeCopied={codeCopied}
        primaryActionLabel={primaryFightControlLabel}
        primaryActionAriaLabel={primaryFightControlAriaLabel}
        onPrimaryAction={() => void (playerMode === "host" ? handleHostReady(true) : handleGuestReady(true))}
        onCopyRoomCode={() => void handleCopyRoomCode()}
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
        recoveryAction={recoveryAction}
        onStopMatchmakingSearch={() => void handleStopMatchmakingSearch()}
      />

      <OnlineDuelDebugPanel
        launchedFromLobby={launchedFromLobby}
        panelStyle={panelStyle}
        sectionHeadStyle={sectionHeadStyle}
        eyebrowStyle={eyebrowStyle}
        chipStyle={chipStyle}
        ghostButtonStyle={ghostButtonStyle}
        primaryButtonStyle={primaryButtonStyle}
        helperTextStyle={helperTextStyle}
        buttonRowStyle={buttonRowStyle}
        plannerCardStyle={plannerCardStyle}
        plannerLabelStyle={plannerLabelStyle}
        plannerZoneRowStyle={plannerZoneRowStyle}
        plannerPrimaryButtonStyle={plannerPrimaryButtonStyle}
        plannerGhostButtonStyle={plannerGhostButtonStyle}
        emptyCardStyle={emptyCardStyle}
        statStripStyle={statStripStyle}
        statCardStyle={statCardStyle}
        statLabelStyle={statLabelStyle}
        statValueStyle={statValueStyle}
        clientMetaStyle={clientMetaStyle}
        messageCardStyle={messageCardStyle}
        messageMetaStyle={messageMetaStyle}
        debugOpen={debugOpen}
        setDebugOpen={setDebugOpen}
        debugClientMode={debugClientMode}
        setDebugClientMode={setDebugClientMode}
        debugSync={debugSync}
        debugSeat={debugSeat}
        hostDraft={hostDraft}
        guestDraft={guestDraft}
        duelId={duelId}
        actionsDisabled={actionsDisabled}
        messages={messages}
        setup={setupRef.current}
        onHostSync={handleHostSync}
        onGuestSync={handleGuestSync}
        onHostReady={handleHostReady}
        onGuestReady={handleGuestReady}
        onHostConnection={handleHostConnection}
        onGuestConnection={handleGuestConnection}
        onHostAttack={handleHostAttack}
        onGuestAttack={handleGuestAttack}
        onForceTimeout={handleForceTimeout}
        onNewHostSession={handleNewHostSession}
        onNewGuestSession={handleNewGuestSession}
        onHostAttackZoneChange={(zone) => setHostDraft((current) => setRoundDraftAttackZone(current, zone))}
        onGuestAttackZoneChange={(zone) => setGuestDraft((current) => setRoundDraftAttackZone(current, zone))}
        onHostDefenseZoneToggle={(zone) => setHostDraft((current) => toggleRoundDraftDefenseZone(current, zone))}
        onGuestDefenseZoneToggle={(zone) => setGuestDraft((current) => toggleRoundDraftDefenseZone(current, zone))}
      />

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

const deferredOverlayFallbackStyle: CSSProperties = {
  position: "fixed",
  inset: "24px 24px auto auto",
  zIndex: 90,
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(18,16,14,0.9)",
  color: "#efe6da",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
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
