import { Suspense, lazy, type CSSProperties } from "react";
import type { ProfileMailboxes, ProfileMeta } from "@/modules/profile";
import { countUnreadMailboxEntries, markMailboxEntriesAsRead, sendProfileMail } from "@/modules/profile";
import type { OnlineDuelSeat } from "@/modules/arena/model/OnlineDuel";
import type { Item } from "@/modules/inventory";
import type { EquipmentSlot } from "@/modules/equipment";
import type { OnlineDuelParticipantSync } from "@/modules/arena/contracts/arenaPublicApi";
import type { CombatSnapshot, CombatZone, RoundResult } from "@/modules/combat";
import { combatZones } from "@/modules/combat";
import type { ActiveCombatEffect } from "@/modules/combat/model/CombatEffect";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import { createBattleLogEntries } from "@/ui/components/combat/battleLogFormatting";
import { BattleLogSection } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { SidePanel } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { createOnlineDuelCombatPresentationModel } from "@/ui/screens/Combat/combatPresentationAdapters";
import { CombatPresentationShell } from "@/ui/screens/Combat/combatPresentationShell";
import { FightControlsPanel } from "@/ui/screens/Combat/combatSandboxScreenControls";
import { CombatRoundReveal } from "@/ui/screens/Combat/combatRoundReveal";
import { AttackTargetRoundPanel } from "@/ui/screens/Combat/combatSandboxScreenTargeting";
import { ResourceGrid } from "@/ui/screens/Combat/combatSandboxScreenResourceGrid";
import {
  OnlineCombatActionsPanel,
  OnlineOpponentCombatPanel,
  OnlinePlayerCombatPanel,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenPanels";
import type {
  OnlineAvailableConsumable,
  OnlineAvailableSkill,
  OnlineDuelLiveStatus,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

const ProfileModal = lazy(() =>
  import("@/ui/components/profile/ProfileModal").then((module) => ({ default: module.ProfileModal }))
);

type OnlineRoundRevealEntry = {
  attackerName: string;
  defenderName?: string | null;
  skillName?: string | null;
  consumableName?: string | null;
  finalDamage?: number | null;
  healedHp?: number | null;
  blocked?: boolean;
  blockedPercent?: number | null;
  dodged?: boolean;
  crit?: boolean;
  knockoutCommentary?: string | null;
  commentary?: string | null;
};

export function OnlineDuelArena({
  showPlayerFacingArena,
  matchmakingStatus,
  duelId,
  liveStatus,
  panelStyle,
  shellStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  helperTextStyle,
  ghostButtonStyle,
  primaryButtonStyle,
  combatArenaBadgeRowStyle,
  statSummaryRowStyle,
  statSummaryLabelStyle,
  statSummaryValueStyle,
  deferredOverlayFallbackStyle,
  buttonRowStyle,
  currentStepCardStyle,
  playerMode,
  playerBuildPresetLabel,
  playerDisplayName,
  playerFigure,
  playerCurrentHp,
  playerSnapshot,
  playerCombatantState,
  playerEquipment,
  playerDerivedStats,
  playerProfileName,
  playerProfile,
  playerProfileDerivedStats,
  playerAvailableSkills,
  playerResources,
  playerSkillCooldowns,
  opponentDisplayName,
  opponentFigure,
  opponentCurrentHp,
  opponentSnapshot,
  opponentCombatantState,
  opponentEquipment,
  opponentDerivedStats,
  opponentProfile,
  opponentProfileDerivedStats,
  opponentAvailableSkills,
  opponentResources,
  opponentParticipant,
  matchSyncWinnerSeat,
  playerSeat,
  playerSyncSeat,
  combatLog,
  battleLogEntries,
  profileTarget,
  mailboxes,
  setProfileTarget,
  setPlayerProfileName,
  setPlayerProfile,
  setMailboxes,
  currentStep,
  matchLocked,
  readyCount,
  playerReady,
  showPlanner,
  opponentActionSubmitted,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  draft,
  playerActionSubmitted,
  actionsDisabled,
  latestRoundSummary,
  selectedIntent,
  availableConsumables,
  roomCode,
  codeCopied,
  primaryActionLabel,
  primaryActionAriaLabel,
  onPrimaryAction,
  onCopyRoomCode,
  onCancelReady,
  onAttackZoneChange,
  onDefenseZoneToggle,
  onIntentChange,
  onSkillChange,
  onConsumableChange,
  onLockAttack,
  recoveryAction,
  onStopMatchmakingSearch,
}: OnlineDuelArenaProps) {
  if (!showPlayerFacingArena) {
    return null;
  }

  const playerWinner = matchSyncWinnerSeat === (playerSyncSeat ?? playerSeat);
  const opponentWinner = matchSyncWinnerSeat !== null && matchSyncWinnerSeat === opponentParticipant?.seat;
  const waitingHint =
    currentStep.badge === "Hold" || currentStep.badge === "Waiting"
      ? currentStep.message
      : currentStep.badge === "Pick zones" && playerActionSubmitted
        ? "Your action is locked. Waiting for the rival to lock theirs."
        : null;
  const roundProgressLabel =
    !duelId
      ? null
      : !showPlanner
        ? `Ready ${readyCount}/2`
        : `Locked ${Number(playerActionSubmitted) + Number(opponentActionSubmitted)}/2`;
  const presentation = createOnlineDuelCombatPresentationModel({
    player: {
      name: playerDisplayName,
      figure: playerFigure,
      currentHp: playerCurrentHp,
      maxHp: playerSnapshot.maxHp,
      equipment: playerEquipment,
      activeEffects: playerCombatantState?.activeEffects ?? [],
      derivedStats: playerDerivedStats,
      badges: [playerMode === "host" ? "Host" : "Guest", playerBuildPresetLabel].filter(Boolean),
      resources: playerResources,
      winner: playerWinner,
      loser: Boolean(matchSyncWinnerSeat) && !playerWinner,
    },
    rival: {
      name: opponentDisplayName,
      figure: opponentFigure,
      currentHp: opponentCurrentHp,
      maxHp: opponentSnapshot.maxHp,
      equipment: opponentEquipment,
      activeEffects: opponentCombatantState?.activeEffects ?? [],
      derivedStats: opponentDerivedStats,
      badges: [
        opponentParticipant ? (opponentParticipant.connected ? "Connected" : "Offline") : "Pending",
        opponentParticipant?.ready ? "Ready" : "Not ready",
      ],
      resources: opponentResources,
      winner: opponentWinner,
      loser: Boolean(matchSyncWinnerSeat) && !opponentWinner,
    },
    controls: {
      currentActionLabel: selectedActionLabel,
      currentActionTags: selectedActionTags,
      currentActionSummary: selectedActionSummary,
      phaseLabel: currentStep.badge,
      round: null,
      roomCode: roomCode || null,
      roundProgressLabel,
      waitStatus: waitingHint,
      latestRoundSummary,
      primaryActionLabel,
      primaryActionAriaLabel,
      primaryActionTone: playerReady && !showPlanner ? "ready" : "warm",
      canPrimaryAction: Boolean(duelId) && !actionsDisabled && !showPlanner && !matchLocked,
    },
  });
  const showMatchFlowBanner = Boolean(
    matchmakingStatus &&
      duelId &&
      (matchmakingStatus.tone === "warning" || matchmakingStatus.badge === "Search paused")
  );
  const showLiveAlertBanner = Boolean(liveStatus && liveStatus.tone === "danger" && !recoveryAction);
  const playerFacingMatchFlowMessage =
    matchmakingStatus?.badge === "Search paused"
      ? "Search is paused. Resume it when you are ready to keep looking for a rival."
      : matchmakingStatus?.message ?? "";
  const playerFacingLiveMessage =
    liveStatus?.badge === "Backend offline"
      ? "The live match service is not responding right now. Use the recovery action below to get back into the fight."
      : liveStatus?.message ?? "";
  const activeMatchmakingStatus = showMatchFlowBanner ? matchmakingStatus : null;
  const activeLiveStatus = showLiveAlertBanner ? liveStatus : null;
  const latestResolvedRoundNumber = combatLog.length > 0 ? combatLog[combatLog.length - 1]?.round ?? null : null;
  const roundRevealEntries: OnlineRoundRevealEntry[] = latestResolvedRoundNumber
    ? combatLog
        .filter((entry) => entry.round === latestResolvedRoundNumber)
        .slice(-2)
        .map((entry) => ({
    attackerName: entry.attackerName,
    defenderName: entry.defenderName,
    skillName: entry.skillName,
    consumableName: entry.consumableName,
    finalDamage: entry.finalDamage,
    healedHp: entry.healedHp,
    blocked: entry.blocked,
    blockedPercent: entry.blockedPercent,
    dodged: entry.dodged,
    crit: entry.crit,
    knockoutCommentary: entry.knockoutCommentary,
    commentary: entry.commentary,
        }))
    : [];

  return (
    <>
      {activeMatchmakingStatus ? (
        <article
          style={{
            ...panelStyle,
            marginBottom: 14,
            border:
              activeMatchmakingStatus.tone === "warning"
                ? "1px solid rgba(255,196,120,0.26)"
                : "1px solid rgba(135,217,255,0.24)",
            background:
              activeMatchmakingStatus.tone === "warning"
                ? "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))"
                : "linear-gradient(180deg, rgba(20,35,45,0.88), rgba(13,18,24,0.96))",
          }}
        >
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Room Status</span>
            <span style={chipStyle}>{activeMatchmakingStatus.badge}</span>
          </div>
          <p style={helperTextStyle}>{playerFacingMatchFlowMessage}</p>
          <div style={buttonRowStyle}>
            <button type="button" style={ghostButtonStyle} onClick={onStopMatchmakingSearch}>
              Stop Searching
            </button>
            {activeMatchmakingStatus.badge === "Search paused" ? (
              <button type="button" style={primaryButtonStyle} onClick={() => undefined}>
                Keep Searching
              </button>
            ) : null}
          </div>
        </article>
      ) : null}
      {activeLiveStatus ? (
        <article
          style={{
            ...panelStyle,
            marginBottom: 14,
            border:
              activeLiveStatus.tone === "danger"
                ? "1px solid rgba(255,127,127,0.3)"
                : activeLiveStatus.tone === "warning"
                  ? "1px solid rgba(255,196,120,0.26)"
                  : "1px solid rgba(135,217,255,0.24)",
            background:
              activeLiveStatus.tone === "danger"
                ? "linear-gradient(180deg, rgba(62,21,21,0.92), rgba(23,12,12,0.96))"
                : activeLiveStatus.tone === "warning"
                  ? "linear-gradient(180deg, rgba(62,42,18,0.9), rgba(25,17,10,0.96))"
                  : "linear-gradient(180deg, rgba(20,35,45,0.88), rgba(13,18,24,0.96))",
            boxShadow: "0 18px 36px rgba(0,0,0,0.24)",
          }}
        >
          <div style={sectionHeadStyle}>
            <span style={eyebrowStyle}>Match Alert</span>
            <span
              style={{
                ...chipStyle,
                border:
                  activeLiveStatus.tone === "danger"
                    ? "1px solid rgba(255,127,127,0.34)"
                    : activeLiveStatus.tone === "warning"
                      ? "1px solid rgba(255,196,120,0.32)"
                      : chipStyle.border,
                background:
                  activeLiveStatus.tone === "danger"
                    ? "rgba(112,31,31,0.28)"
                    : activeLiveStatus.tone === "warning"
                      ? "rgba(119,77,18,0.28)"
                      : chipStyle.background,
                color:
                  activeLiveStatus.tone === "danger"
                    ? "rgba(255,226,226,0.96)"
                    : activeLiveStatus.tone === "warning"
                      ? "rgba(255,236,210,0.96)"
                      : chipStyle.color,
              }}
            >
              {activeLiveStatus.badge}
            </span>
          </div>
          <p
            style={{
              ...helperTextStyle,
              color:
                activeLiveStatus.tone === "danger"
                  ? "rgba(255,220,220,0.88)"
                  : activeLiveStatus.tone === "warning"
                    ? "rgba(255,232,205,0.88)"
                    : helperTextStyle.color,
            }}
          >
            {playerFacingLiveMessage}
          </p>
        </article>
      ) : null}
      <CombatPresentationShell
        shellStyle={shellStyle}
        resultReveal={
          matchLocked
            ? presentation.player.winner
              ? {
                  eyebrow: "Match Result",
                  title: "Victory",
                  subtitle: `${presentation.rival.name} falls. You can queue a rematch or leave with the room code in hand.`,
                  tone: "victory" as const,
                }
              : presentation.player.loser
                ? {
                    eyebrow: "Match Result",
                    title: "Defeat",
                    subtitle: `${presentation.rival.name} takes this duel. Shake it off and fire up the rematch.`,
                    tone: "defeat" as const,
                  }
                : {
                    eyebrow: "Match Result",
                    title: "Match Closed",
                    subtitle: "This room is no longer active. Start a fresh fight when you are ready.",
                    tone: "neutral" as const,
                  }
            : null
        }
        left={
          <OnlinePlayerCombatPanel
            playerName={presentation.player.name}
            playerFigure={presentation.player.figure}
            currentHp={presentation.player.currentHp}
            maxHp={presentation.player.maxHp}
            combatantId={playerSnapshot.characterId}
            combatLog={combatLog}
            activeEffects={presentation.player.activeEffects}
            equipment={presentation.player.equipment}
            selectedIntent={draft.intent}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            derivedStats={presentation.player.derivedStats}
            roleLabel={presentation.player.badges[0] ?? "Player"}
            presetLabel={presentation.player.badges[1] ?? "Custom"}
            winner={presentation.player.winner}
            loser={presentation.player.loser}
            onOpenProfile={() => setProfileTarget("player")}
            sidePanelComponent={SidePanel}
            chipStyle={chipStyle}
            combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
            onlinePlayerIntentSilhouetteTone={onlinePlayerIntentSilhouetteTone}
            statSummaryRowStyle={statSummaryRowStyle}
            statSummaryLabelStyle={statSummaryLabelStyle}
            statSummaryValueStyle={statSummaryValueStyle}
          />
        }
        center={
          <OnlineFightSetupPanel
            panelStyle={panelStyle}
            shellStyle={shellStyle}
            primaryButtonStyle={primaryButtonStyle}
            buttonStyle={ghostButtonStyle}
            currentStep={currentStep}
            duelId={duelId}
            matchLocked={matchLocked}
            readyCount={readyCount}
            playerReady={playerReady}
            showPlanner={showPlanner}
            opponentActionSubmitted={opponentActionSubmitted}
            selectedActionLabel={presentation.controls.currentActionLabel}
            selectedActionTags={presentation.controls.currentActionTags}
            selectedActionSummary={presentation.controls.currentActionSummary}
            draft={draft}
            playerActionSubmitted={playerActionSubmitted}
            latestRoundSummary={presentation.controls.latestRoundSummary}
            roundRevealEntries={roundRevealEntries}
            selectedIntent={selectedIntent}
            availableSkills={playerAvailableSkills}
            availableConsumables={availableConsumables}
            playerResources={playerResources}
            playerSkillCooldowns={playerSkillCooldowns}
            roomCode={presentation.controls.roomCode ?? ""}
            codeCopied={codeCopied}
            primaryActionLabel={presentation.controls.primaryActionLabel}
            primaryActionAriaLabel={presentation.controls.primaryActionAriaLabel}
            onPrimaryAction={onPrimaryAction}
            onCopyRoomCode={onCopyRoomCode}
            onCancelReady={onCancelReady}
            onAttackZoneChange={onAttackZoneChange}
            onDefenseZoneToggle={onDefenseZoneToggle}
            onIntentChange={onIntentChange}
            onSkillChange={onSkillChange}
            onConsumableChange={onConsumableChange}
            onLockAttack={onLockAttack}
            actionsDisabled={actionsDisabled}
            blockedStatus={liveStatus}
            recoveryAction={recoveryAction}
            buttonRowStyle={buttonRowStyle}
            sectionHeadStyle={sectionHeadStyle}
            eyebrowStyle={eyebrowStyle}
            chipStyle={chipStyle}
            helperTextStyle={helperTextStyle}
            currentStepCardStyle={currentStepCardStyle}
            roundProgressLabel={presentation.controls.roundProgressLabel}
            waitingHint={presentation.controls.waitStatus}
            canPrimaryAction={presentation.controls.canPrimaryAction}
            primaryActionTone={presentation.controls.primaryActionTone}
          />
        }
        right={
          <OnlineOpponentCombatPanel
            playerName={presentation.rival.name}
            playerFigure={presentation.rival.figure}
            currentHp={presentation.rival.currentHp}
            maxHp={presentation.rival.maxHp}
            combatantId={opponentSnapshot.characterId}
            combatLog={combatLog}
            activeEffects={presentation.rival.activeEffects}
            equipment={presentation.rival.equipment}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            derivedStats={presentation.rival.derivedStats}
            resources={presentation.rival.resources}
            connectionLabel={presentation.rival.badges[0] ?? "Pending"}
            readinessLabel={presentation.rival.badges[1] ?? "Not ready"}
            winner={presentation.rival.winner}
            loser={presentation.rival.loser}
            onOpenProfile={() => setProfileTarget("opponent")}
            sidePanelComponent={SidePanel}
            chipStyle={chipStyle}
            combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
            statSummaryRowStyle={statSummaryRowStyle}
            statSummaryLabelStyle={statSummaryLabelStyle}
            statSummaryValueStyle={statSummaryValueStyle}
          />
        }
      />

      <BattleLogSection
        entries={battleLogEntries}
        playerId={playerSnapshot.characterId}
        botId={opponentSnapshot.characterId}
        shellStyle={shellStyle}
      />

      {profileTarget === "player" ? (
        <Suspense fallback={<div style={deferredOverlayFallbackStyle}>Loading profile...</div>}>
          <ProfileModal
            onClose={() => setProfileTarget(null)}
            name={playerProfileName}
            level={1}
            figure={playerFigure as never}
            mirrored
            currentHp={playerCurrentHp}
            maxHp={playerSnapshot.maxHp}
            activeEffects={playerCombatantState?.activeEffects ?? []}
            equipmentSlots={playerEquipment}
            profile={playerProfile}
            baseStats={playerSnapshot.stats}
            derivedStats={playerProfileDerivedStats}
            skillLabels={playerAvailableSkills.map((skill) => skill.name)}
            isOwnProfile
            onNameChange={setPlayerProfileName}
            onMottoChange={(value) => setPlayerProfile((current) => ({ ...current, motto: value }))}
            mailboxActorId="player"
            mailboxEntries={mailboxes.player.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "player")}
            onOpenMailbox={() => setMailboxes((current) => markMailboxEntriesAsRead(current, "player"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              setMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerProfileName,
                  toActorId,
                  toName,
                  subject,
                  body,
                })
              )
            }
          />
        </Suspense>
      ) : null}
      {profileTarget === "opponent" ? (
        <Suspense fallback={<div style={deferredOverlayFallbackStyle}>Loading profile...</div>}>
          <ProfileModal
            onClose={() => setProfileTarget(null)}
            name={opponentDisplayName}
            level={1}
            figure={opponentFigure as never}
            currentHp={opponentCurrentHp}
            maxHp={opponentSnapshot.maxHp}
            activeEffects={opponentCombatantState?.activeEffects ?? []}
            equipmentSlots={opponentEquipment}
            profile={opponentProfile}
            baseStats={opponentSnapshot.stats}
            derivedStats={opponentProfileDerivedStats}
            skillLabels={opponentAvailableSkills.map((skill) => skill.name)}
            mailboxActorId="bot"
            mailboxEntries={mailboxes.bot.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "bot")}
            directMessageTarget={{ actorId: "bot", name: opponentDisplayName }}
            onOpenMailbox={() => setMailboxes((current) => markMailboxEntriesAsRead(current, "bot"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              setMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerProfileName,
                  toActorId,
                  toName,
                  subject,
                  body,
                })
              )
            }
          />
        </Suspense>
      ) : null}
    </>
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
  readyCount,
  playerReady,
  showPlanner,
  opponentActionSubmitted,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  draft,
  playerActionSubmitted,
  actionsDisabled,
  latestRoundSummary,
  roundRevealEntries,
  selectedIntent,
  availableSkills,
  availableConsumables,
  playerResources,
  playerSkillCooldowns,
  roomCode,
  codeCopied,
  primaryActionLabel,
  primaryActionAriaLabel,
  onPrimaryAction,
  onCopyRoomCode,
  onCancelReady,
  onAttackZoneChange,
  onDefenseZoneToggle,
  onIntentChange,
  onSkillChange,
  onConsumableChange,
  onLockAttack,
  blockedStatus,
  recoveryAction,
  buttonRowStyle,
  sectionHeadStyle,
  eyebrowStyle,
  chipStyle,
  helperTextStyle,
  currentStepCardStyle,
  roundProgressLabel,
  waitingHint,
  canPrimaryAction,
  primaryActionTone,
}: OnlineFightSetupPanelProps) {
  const roundRevealTone =
    currentStep.badge === "Resolving"
      ? "Resolving exchange"
      : currentStep.badge === "Match over"
        ? "Final blow landed"
        : latestRoundSummary !== "No round resolved yet."
          ? latestRoundSummary
          : null;

  return (
    <div data-testid="fight-setup-panel" style={{ ...shellStyle, padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
      <div style={{ display: "grid", gap: 12 }}>
        <CombatRoundReveal
          title={roundRevealTone}
          tone={currentStep.badge === "Match over" ? "finish" : "round"}
          entries={roundRevealEntries}
        />
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
            canStartFight={canPrimaryAction}
            primaryActionTone={primaryActionTone}
            combatPhase={matchLocked ? "finished" : showPlanner ? "planning" : "lobby"}
            combatRound={null}
            combatPhaseLabel={currentStep.badge}
            selectedActionLabel={selectedActionLabel}
            selectedActionTags={selectedActionTags}
            selectedActionSummary={selectedActionSummary}
            roomCode={roomCode}
            codeCopied={codeCopied}
            waitStatus={waitingHint}
            roundProgressLabel={roundProgressLabel}
            onCopyRoomCode={onCopyRoomCode}
            onStartFight={playerReady && !showPlanner ? onCancelReady : onPrimaryAction}
            primaryActionLabel={primaryActionLabel}
            primaryActionAriaLabel={primaryActionAriaLabel}
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

interface OnlineDuelArenaProps {
  showPlayerFacingArena: boolean;
  matchmakingStatus: { tone: "info" | "warning"; badge: string; message: string } | null;
  duelId: string | null;
  liveStatus: OnlineDuelLiveStatus | null;
  panelStyle: CSSProperties;
  shellStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  helperTextStyle: CSSProperties;
  ghostButtonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  combatArenaBadgeRowStyle: CSSProperties;
  statSummaryRowStyle: CSSProperties;
  statSummaryLabelStyle: CSSProperties;
  statSummaryValueStyle: CSSProperties;
  deferredOverlayFallbackStyle: CSSProperties;
  buttonRowStyle: CSSProperties;
  currentStepCardStyle: CSSProperties;
  playerMode: "host" | "guest";
  playerBuildPresetLabel: string;
  playerDisplayName: string;
  playerFigure: string;
  playerCurrentHp: number;
  playerSnapshot: {
    characterId: CombatSnapshot["characterId"];
    maxHp: CombatSnapshot["maxHp"];
    stats: CombatSnapshot["stats"];
  } & CombatSnapshot;
  playerCombatantState: {
    activeEffects?: ActiveCombatEffect[];
    skillCooldowns?: Record<string, number>;
  } | null;
  playerEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  playerDerivedStats: Array<{ label: string; value: string; helper: string }>;
  playerProfileName: string;
  playerProfile: ProfileMeta;
  playerProfileDerivedStats: Array<{ label: string; value: string; helper: string }>;
  playerAvailableSkills: OnlineAvailableSkill[];
  playerResources: { rage: number; guard: number; momentum: number; focus: number } | null;
  playerSkillCooldowns: Record<string, number>;
  opponentDisplayName: string;
  opponentFigure: string;
  opponentCurrentHp: number;
  opponentSnapshot: {
    characterId: CombatSnapshot["characterId"];
    maxHp: CombatSnapshot["maxHp"];
    stats: CombatSnapshot["stats"];
  } & CombatSnapshot;
  opponentCombatantState: { activeEffects?: ActiveCombatEffect[] } | null;
  opponentEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  opponentDerivedStats: Array<{ label: string; value: string; helper: string }>;
  opponentProfile: ProfileMeta;
  opponentProfileDerivedStats: Array<{ label: string; value: string; helper: string }>;
  opponentAvailableSkills: OnlineAvailableSkill[];
  opponentResources: { rage: number; guard: number; momentum: number; focus: number } | null;
  opponentParticipant: OnlineDuelParticipantSync | null;
  matchSyncWinnerSeat: OnlineDuelSeat | null;
  playerSeat: OnlineDuelSeat | null;
  playerSyncSeat: OnlineDuelSeat | null;
  combatLog: RoundResult[];
  battleLogEntries: ReturnType<typeof createBattleLogEntries>;
  profileTarget: "player" | "opponent" | null;
  mailboxes: ProfileMailboxes;
  setProfileTarget: (value: "player" | "opponent" | null) => void;
  setPlayerProfileName: (value: string | ((current: string) => string)) => void;
  setPlayerProfile: (value: ProfileMeta | ((current: ProfileMeta) => ProfileMeta)) => void;
  setMailboxes: (value: ProfileMailboxes | ((current: ProfileMailboxes) => ProfileMailboxes)) => void;
  currentStep: { badge: string; message: string };
  matchLocked: boolean;
  readyCount: number;
  playerReady: boolean;
  showPlanner: boolean;
  opponentActionSubmitted: boolean;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  actionsDisabled: boolean;
  latestRoundSummary: string;
  selectedIntent: RoundDraft["intent"];
  availableConsumables: OnlineAvailableConsumable[];
  roomCode: string;
  codeCopied: boolean;
  primaryActionLabel: string;
  primaryActionAriaLabel: string;
  onPrimaryAction: () => void;
  onCopyRoomCode: () => void;
  onCancelReady: () => void;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
  onIntentChange: (intent: RoundDraft["intent"]) => void;
  onSkillChange: (skillId: string | null) => void;
  onConsumableChange: (itemCode: string | null) => void;
  onLockAttack: () => void;
  recoveryAction: { label: string; onClick: () => void } | null;
  onStopMatchmakingSearch: () => void;
}

interface OnlineFightSetupPanelProps {
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  buttonStyle: CSSProperties;
  currentStep: { badge: string; message: string };
  duelId: string | null;
  matchLocked: boolean;
  readyCount: number;
  playerReady: boolean;
  showPlanner: boolean;
  opponentActionSubmitted: boolean;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  draft: RoundDraft;
  playerActionSubmitted: boolean;
  actionsDisabled: boolean;
  latestRoundSummary: string;
  roundRevealEntries: OnlineRoundRevealEntry[];
  selectedIntent: RoundDraft["intent"];
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
  playerResources: { rage: number; guard: number; momentum: number; focus: number } | null;
  playerSkillCooldowns: Record<string, number>;
  roomCode: string;
  codeCopied: boolean;
  primaryActionLabel: string;
  primaryActionAriaLabel: string;
  onPrimaryAction: () => void;
  onCopyRoomCode: () => void;
  onCancelReady: () => void;
  onAttackZoneChange: (zone: CombatZone) => void;
  onDefenseZoneToggle: (zone: CombatZone) => void;
  onIntentChange: (intent: RoundDraft["intent"]) => void;
  onSkillChange: (skillId: string | null) => void;
  onConsumableChange: (itemCode: string | null) => void;
  onLockAttack: () => void;
  blockedStatus: OnlineDuelLiveStatus | null;
  recoveryAction: { label: string; onClick: () => void } | null;
  buttonRowStyle: CSSProperties;
  sectionHeadStyle: CSSProperties;
  eyebrowStyle: CSSProperties;
  chipStyle: CSSProperties;
  helperTextStyle: CSSProperties;
  currentStepCardStyle: CSSProperties;
  roundProgressLabel: string | null;
  waitingHint: string | null;
  canPrimaryAction: boolean;
  primaryActionTone: "warm" | "ready";
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
