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
import { ArenaStageColumns, ArenaStageShell, SidePanel } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { FightControlsPanel } from "@/ui/screens/Combat/combatSandboxScreenControls";
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

  return (
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
            <button type="button" style={ghostButtonStyle} onClick={onStopMatchmakingSearch}>
              Stop Searching
            </button>
            {matchmakingStatus.badge === "Search paused" ? (
              <button type="button" style={primaryButtonStyle} onClick={() => undefined}>
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
            combatantId={playerSnapshot.characterId}
            combatLog={combatLog}
            activeEffects={playerCombatantState?.activeEffects ?? []}
            equipment={playerEquipment}
            selectedIntent={draft.intent}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            derivedStats={playerDerivedStats}
            roleLabel={playerMode === "host" ? "Host" : "Guest"}
            presetLabel={playerBuildPresetLabel}
            winner={matchSyncWinnerSeat === (playerSyncSeat ?? playerSeat)}
            loser={Boolean(matchSyncWinnerSeat) && matchSyncWinnerSeat !== (playerSyncSeat ?? playerSeat)}
            onOpenProfile={() => setProfileTarget("player")}
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
            readyCount={readyCount}
            playerReady={playerReady}
            showPlanner={showPlanner}
            opponentActionSubmitted={opponentActionSubmitted}
            selectedActionLabel={selectedActionLabel}
            selectedActionTags={selectedActionTags}
            selectedActionSummary={selectedActionSummary}
            draft={draft}
            playerActionSubmitted={playerActionSubmitted}
            latestRoundSummary={latestRoundSummary}
            selectedIntent={selectedIntent}
            availableSkills={playerAvailableSkills}
            availableConsumables={availableConsumables}
            playerResources={playerResources}
            playerSkillCooldowns={playerSkillCooldowns}
            roomCode={roomCode}
            codeCopied={codeCopied}
            primaryActionLabel={primaryActionLabel}
            primaryActionAriaLabel={primaryActionAriaLabel}
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
          />

          <OnlineOpponentCombatPanel
            playerName={opponentDisplayName}
            playerFigure={opponentFigure}
            currentHp={opponentCurrentHp}
            maxHp={opponentSnapshot.maxHp}
            combatantId={opponentSnapshot.characterId}
            combatLog={combatLog}
            activeEffects={opponentCombatantState?.activeEffects ?? []}
            equipment={opponentEquipment}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            derivedStats={opponentDerivedStats}
            resources={opponentResources}
            connectionLabel={opponentParticipant ? (opponentParticipant.connected ? "Connected" : "Offline") : "Pending"}
            readinessLabel={opponentParticipant?.ready ? "Ready" : "Not ready"}
            winner={matchSyncWinnerSeat !== null && matchSyncWinnerSeat === opponentParticipant?.seat}
            loser={Boolean(matchSyncWinnerSeat) && matchSyncWinnerSeat !== opponentParticipant?.seat}
            onOpenProfile={() => setProfileTarget("opponent")}
            sidePanelComponent={SidePanel}
            chipStyle={chipStyle}
            combatArenaBadgeRowStyle={combatArenaBadgeRowStyle}
            statSummaryRowStyle={statSummaryRowStyle}
            statSummaryLabelStyle={statSummaryLabelStyle}
            statSummaryValueStyle={statSummaryValueStyle}
          />
        </ArenaStageColumns>
      </ArenaStageShell>

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
}: OnlineFightSetupPanelProps) {
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
            canStartFight={Boolean(duelId) && !actionsDisabled && !showPlanner && !matchLocked}
            primaryActionTone={playerReady && !showPlanner ? "ready" : "warm"}
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
