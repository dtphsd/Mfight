import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import type { CharacterStatName, CharacterStats } from "@/modules/character";
import {
  armorRange,
  baseBlockPenetration,
  baseCritChance,
  baseDodgeChance,
  critMultiplier,
  combatChanceCaps,
  combatFormulaConfig,
  combatZoneDamageModifiers,
  damageRange,
} from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { DamageProfile, Item } from "@/modules/inventory";
import {
  addProfileBattleResult,
  countUnreadMailboxEntries,
  createProfileMailboxes,
  createProfileMeta,
  markMailboxEntriesAsRead,
  sendProfileMail,
} from "@/modules/profile";
import { totalProfileValue } from "@/orchestration/combat/combatPressure";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import {
  formatConsumableDetailLines,
  formatMaybeTitle,
  formatResourceLabel,
  formatSkillDetailLines,
  getActionVisual,
  getSkillIcon,
  splitDetailLine,
  type CombatRuleEffectSummary,
} from "./combatSandboxScreenHelpers";
import { CombatActionsPanel } from "./combatSandboxScreenActions";
import { FightControlsPanel, RoundAdvanceControls } from "./combatSandboxScreenControls";
import { BattleLogSection } from "./combatSandboxScreenLayout";
import { BotCombatPanel, PlayerCombatPanel } from "./combatSandboxScreenPanels";
import { BotBuildPresetsPopover as CombatBotBuildPresetsPopover } from "./combatSandboxScreenPopovers";
import { ResourceGrid as CombatResourceGrid } from "./combatSandboxScreenResourceGrid";
import { AttackTargetRoundPanel } from "./combatSandboxScreenTargeting";

const loadBuildPresetsPopover = () =>
  import("@/ui/components/combat/BuildPresetsPopover").then((module) => ({ default: module.BuildPresetsPopover }));
const loadBuilderPopover = () =>
  import("@/ui/components/combat/BuilderPopover").then((module) => ({ default: module.BuilderPopover }));
const loadEquipmentSlotPopover = () =>
  import("@/ui/components/combat/EquipmentSlotPopover").then((module) => ({ default: module.EquipmentSlotPopover }));
const loadInventoryPopover = () =>
  import("@/ui/components/combat/InventoryPopover").then((module) => ({ default: module.InventoryPopover }));
const loadProfileModal = () =>
  import("@/ui/components/profile/ProfileModal").then((module) => ({ default: module.ProfileModal }));

const BuildPresetsPopover = lazy(loadBuildPresetsPopover);
const BuilderPopover = lazy(loadBuilderPopover);
const InventoryPopover = lazy(loadInventoryPopover);
const ProfileModal = lazy(loadProfileModal);

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

const shellStyle: CSSProperties = {
  borderRadius: "28px",
  border: "1px solid rgba(255,244,225,0.09)",
  background:
    "linear-gradient(180deg, rgba(25,21,19,0.98), rgba(11,10,9,0.98)), radial-gradient(circle at top, rgba(255,193,122,0.08), transparent 28%)",
  boxShadow: "0 30px 74px rgba(0,0,0,0.34)",
};

const panelStyle: CSSProperties = {
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02)), radial-gradient(circle at top right, rgba(255,210,140,0.04), transparent 28%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const buttonStyle: CSSProperties = {
  padding: "9px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.03))",
  color: "#efe6da",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  border: "1px solid rgba(255,171,97,0.44)",
  background: "linear-gradient(180deg, rgba(221,122,68,0.34), rgba(207,106,50,0.16))",
  color: "#ffe2c2",
  boxShadow: "0 14px 30px rgba(207,106,50,0.2)",
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

const statMeta: Record<CharacterStatName, { short: string; color: string; background: string; border: string }> = {
  strength: { short: "STR", color: "#f0a286", background: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)" },
  agility: { short: "AGI", color: "#87e2cf", background: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)" },
  rage: { short: "RAG", color: "#ee9abb", background: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)" },
  endurance: { short: "END", color: "#ebcf8b", background: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)" },
};

function DeferredOverlayFallback({ label = "Loading..." }: { label?: string }) {
  return <div style={deferredOverlayFallbackStyle}>{label}</div>;
}

const presetFigureById: Record<string, CombatFigureId> = {
  "sword-bleed": "rush-chip",
  "shield-guard": "quack-core",
  "dagger-crit": "kitsune-bit",
  "mace-control": "neo-scope",
  "axe-pressure": "razor-boar",
  "heavy-two-hand": "hound-drive",
  "sustain-regen": "trash-flux",
};

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function CombatSandboxScreen({
  playerName = "Player",
  onPlayerNameChange = () => {},
}: {
  playerName?: string;
  onPlayerNameChange?: (value: string) => void;
}) {
  const sandbox = useCombatSandbox();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [buildPresetsOpen, setBuildPresetsOpen] = useState(false);
  const [botBuildPresetsOpen, setBotBuildPresetsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState<"player" | "bot" | null>(null);
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<EquipmentSlot | null>(null);
  const [skillLoadoutOpen, setSkillLoadoutOpen] = useState(false);
  const [deathFinisher, setDeathFinisher] = useState<null | { winner: "player" | "bot"; key: string }>(null);
  const [playerProfile, setPlayerProfile] = useState(() => createProfileMeta({ side: "player" }));
  const [botProfile, setBotProfile] = useState(() => createProfileMeta({ side: "bot" }));
  const [playerFigure, setPlayerFigure] = useState<CombatFigureId>("rush-chip");
  const [mailboxes, setMailboxes] = useState(() =>
    createProfileMailboxes({
      playerName,
      botName: "Arena Bot",
    })
  );
  const lastWinnerIdRef = useRef<string | null>(null);
  const botFigure = resolvePresetFigure(sandbox.botBuildPresetId, "vermin-tek");

  const playerEquipment = useMemo(
    () =>
      playerEquipmentSlots.map((slot) => ({
        slot,
        item: (sandbox.equippedItems.find((entry) => entry.slot === slot)?.item as Item | null) ?? null,
      })),
    [sandbox.equippedItems]
  );
  const botEquipment = useMemo(
    () =>
      playerEquipmentSlots.map((slot) => ({
        slot,
        item: (sandbox.botEquippedItems.find((entry) => entry.slot === slot)?.item as Item | null) ?? null,
      })),
    [sandbox.botEquippedItems]
  );

  const selectedActionLabel = resolveSelectedActionLabel(sandbox);
  const selectedActionSummary = resolveSelectedActionSummary(sandbox);
  const selectedActionTags = resolveSelectedActionTags(sandbox);
  const latestRoundSummary =
    sandbox.latestRoundEntries.length > 0
      ? sandbox.latestRoundEntries.map((entry) => `${entry.attackerName}: ${entry.commentary}`).join(" | ")
      : "No round resolved yet.";
  const outcomeWinner = sandbox.combatPhase === "finished" ? deathFinisher?.winner ?? null : null;
  const buildConfigured =
    Object.values(sandbox.playerAllocations).some((value) => value > 0) ||
    sandbox.equippedItems.some((entry) => entry.item) ||
    sandbox.equippedSkillIds.length > 0;

  useEffect(() => {
    const winnerId = sandbox.combatState?.winnerId ?? null;

    if (!winnerId || winnerId === lastWinnerIdRef.current) {
      return;
    }

    lastWinnerIdRef.current = winnerId;
    const winner =
      winnerId === sandbox.playerSnapshot.characterId
        ? "player"
        : winnerId === sandbox.botSnapshot.characterId
          ? "bot"
          : null;

    if (!winner) {
      return;
    }

    setDeathFinisher({ winner, key: `${winnerId}-${sandbox.combatState?.round ?? "finish"}` });
    setPlayerProfile((current) => addProfileBattleResult(current, winner === "player" ? "win" : "loss"));
    setBotProfile((current) => addProfileBattleResult(current, winner === "bot" ? "win" : "loss"));
  }, [sandbox.botSnapshot.characterId, sandbox.combatState, sandbox.playerSnapshot.characterId]);

  useEffect(() => {
    if (sandbox.combatPhase !== "finished") {
      lastWinnerIdRef.current = null;
      setDeathFinisher(null);
    }
  }, [sandbox.combatPhase]);

  useEffect(() => {
    setMailboxes((current) => ({
      player: {
        entries: current.player.entries.map((entry) => ({
          ...entry,
          fromName: entry.fromActorId === "player" ? playerName : entry.fromName,
          toName: entry.toActorId === "player" ? playerName : entry.toName,
        })),
      },
      bot: {
        entries: current.bot.entries.map((entry) => ({
          ...entry,
          fromName: entry.fromActorId === "player" ? playerName : entry.fromName,
          toName: entry.toActorId === "player" ? playerName : entry.toName,
        })),
      },
    }));
  }, [playerName]);

  useEffect(() => {
    void Promise.allSettled([
      loadBuildPresetsPopover(),
      loadBuilderPopover(),
      loadEquipmentSlotPopover(),
      loadInventoryPopover(),
      loadProfileModal(),
    ]);
  }, []);

  return (
    <section data-testid="combat-sandbox-screen" style={{ display: "grid", gap: "14px" }}>
      <CombatSandboxStage
        sandbox={sandbox}
        deathFinisher={deathFinisher}
        playerName={playerName}
        playerFigure={playerFigure}
        botFigure={botFigure}
        buildConfigured={buildConfigured}
        playerEquipment={playerEquipment}
        botEquipment={botEquipment}
        selectedEquipmentSlot={selectedEquipmentSlot}
        outcomeWinner={outcomeWinner}
        selectedActionLabel={selectedActionLabel}
        selectedActionTags={selectedActionTags}
        selectedActionSummary={selectedActionSummary}
        latestRoundSummary={latestRoundSummary}
        onOpenBuilder={() => setBuilderOpen(true)}
        onOpenBuildPresets={() => setBuildPresetsOpen(true)}
        onOpenBotBuildPresets={() => setBotBuildPresetsOpen(true)}
        onOpenInventory={() => setInventoryOpen(true)}
        onOpenPlayerProfile={() => setProfileTarget("player")}
        onOpenBotProfile={() => setProfileTarget("bot")}
        onSelectEquipmentSlot={setSelectedEquipmentSlot}
        onCloseEquipmentSlot={() => setSelectedEquipmentSlot(null)}
        onOpenSkillLoadout={() => setSkillLoadoutOpen(true)}
      />

      <BattleLogSection
        entries={sandbox.battleLogEntries}
        playerId={sandbox.playerSnapshot.characterId}
        botId={sandbox.botSnapshot.characterId}
        shellStyle={shellStyle}
      />

      <CombatSandboxOverlays
        sandbox={sandbox}
        buildPresetsOpen={buildPresetsOpen}
        botBuildPresetsOpen={botBuildPresetsOpen}
        builderOpen={builderOpen}
        skillLoadoutOpen={skillLoadoutOpen}
        inventoryOpen={inventoryOpen}
        profileTarget={profileTarget}
        playerName={playerName}
        playerFigure={playerFigure}
        botFigure={botFigure}
        playerEquipment={playerEquipment}
        botEquipment={botEquipment}
        playerProfile={playerProfile}
        botProfile={botProfile}
        mailboxes={mailboxes}
        onPlayerNameChange={onPlayerNameChange}
        onCloseBuildPresets={() => setBuildPresetsOpen(false)}
        onCloseBotBuildPresets={() => setBotBuildPresetsOpen(false)}
        onCloseBuilder={() => setBuilderOpen(false)}
        onOpenBuildPresets={() => setBuildPresetsOpen(true)}
        onCloseSkillLoadout={() => setSkillLoadoutOpen(false)}
        onCloseInventory={() => setInventoryOpen(false)}
        onCloseProfile={() => setProfileTarget(null)}
        onSetPlayerFigure={setPlayerFigure}
        onSetPlayerProfile={setPlayerProfile}
        onSetMailboxes={setMailboxes}
      />
    </section>
  );
}

function CombatSandboxStage({
  sandbox,
  deathFinisher,
  playerName,
  playerFigure,
  botFigure,
  buildConfigured,
  playerEquipment,
  botEquipment,
  selectedEquipmentSlot,
  outcomeWinner,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  latestRoundSummary,
  onOpenBuilder,
  onOpenBuildPresets,
  onOpenBotBuildPresets,
  onOpenInventory,
  onOpenPlayerProfile,
  onOpenBotProfile,
  onSelectEquipmentSlot,
  onCloseEquipmentSlot,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  deathFinisher: null | { winner: "player" | "bot"; key: string };
  playerName: string;
  playerFigure: CombatFigureId;
  botFigure: CombatFigureId;
  buildConfigured: boolean;
  playerEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  botEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  selectedEquipmentSlot: EquipmentSlot | null;
  outcomeWinner: "player" | "bot" | null;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  latestRoundSummary: string;
  onOpenBuilder: () => void;
  onOpenBuildPresets: () => void;
  onOpenBotBuildPresets: () => void;
  onOpenInventory: () => void;
  onOpenPlayerProfile: () => void;
  onOpenBotProfile: () => void;
  onSelectEquipmentSlot: (slot: EquipmentSlot) => void;
  onCloseEquipmentSlot: () => void;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <div style={{ ...shellStyle, padding: "16px", display: "grid", gap: "14px", position: "relative", overflow: "hidden" }}>
      {deathFinisher ? (
        <div
          key={deathFinisher.key}
          className={`combat-death-scene-flash combat-death-scene-flash--${deathFinisher.winner}`}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", alignItems: "start" }}>
        <div
          key={deathFinisher?.winner === "player" ? `${deathFinisher.key}-player-winner` : deathFinisher?.winner === "bot" ? `${deathFinisher.key}-player-loser` : "player-panel"}
          className={resolveDeathFinisherClassName("player", deathFinisher?.winner ?? null)}
          style={{ position: "relative", zIndex: 1 }}
        >
          <PlayerCombatPanel
            sandbox={sandbox}
            playerName={playerName}
            playerFigure={playerFigure}
            buildConfigured={buildConfigured}
            equipment={playerEquipment}
            selectedEquipmentSlot={selectedEquipmentSlot}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            buttonStyle={buttonStyle}
            statMeta={statMeta}
            deferredOverlayFallbackStyle={deferredOverlayFallbackStyle}
            onOpenBuilder={onOpenBuilder}
            onOpenBuildPresets={onOpenBuildPresets}
            onOpenInventory={onOpenInventory}
            onOpenProfile={onOpenPlayerProfile}
            onSelectEquipmentSlot={onSelectEquipmentSlot}
            onCloseEquipmentSlot={onCloseEquipmentSlot}
            silhouetteState={outcomeWinner === "player" ? "victory" : outcomeWinner === "bot" ? "defeat" : null}
          />
        </div>

        <FightSetupPanel
          sandbox={sandbox}
          selectedActionLabel={selectedActionLabel}
          selectedActionTags={selectedActionTags}
          selectedActionSummary={selectedActionSummary}
          latestRoundSummary={latestRoundSummary}
          onOpenSkillLoadout={onOpenSkillLoadout}
        />

        <div
          key={deathFinisher?.winner === "bot" ? `${deathFinisher.key}-bot-winner` : deathFinisher?.winner === "player" ? `${deathFinisher.key}-bot-loser` : "bot-panel"}
          className={resolveDeathFinisherClassName("bot", deathFinisher?.winner ?? null)}
          style={{ position: "relative", zIndex: 1 }}
        >
          <BotCombatPanel
            sandbox={sandbox}
            botFigure={botFigure}
            equipment={botEquipment}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            buttonStyle={buttonStyle}
            onOpenBuildPresets={onOpenBotBuildPresets}
            onOpenProfile={onOpenBotProfile}
            silhouetteState={outcomeWinner === "bot" ? "victory" : outcomeWinner === "player" ? "defeat" : null}
          />
        </div>
      </div>
    </div>
  );
}

function CombatSandboxOverlays({
  sandbox,
  buildPresetsOpen,
  botBuildPresetsOpen,
  builderOpen,
  skillLoadoutOpen,
  inventoryOpen,
  profileTarget,
  playerName,
  playerFigure,
  botFigure,
  playerEquipment,
  botEquipment,
  playerProfile,
  botProfile,
  mailboxes,
  onPlayerNameChange,
  onCloseBuildPresets,
  onCloseBotBuildPresets,
  onCloseBuilder,
  onOpenBuildPresets,
  onCloseSkillLoadout,
  onCloseInventory,
  onCloseProfile,
  onSetPlayerFigure,
  onSetPlayerProfile,
  onSetMailboxes,
}: {
  sandbox: CombatSandboxModel;
  buildPresetsOpen: boolean;
  botBuildPresetsOpen: boolean;
  builderOpen: boolean;
  skillLoadoutOpen: boolean;
  inventoryOpen: boolean;
  profileTarget: "player" | "bot" | null;
  playerName: string;
  playerFigure: CombatFigureId;
  botFigure: CombatFigureId;
  playerEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  botEquipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  playerProfile: ReturnType<typeof createProfileMeta>;
  botProfile: ReturnType<typeof createProfileMeta>;
  mailboxes: ReturnType<typeof createProfileMailboxes>;
  onPlayerNameChange: (value: string) => void;
  onCloseBuildPresets: () => void;
  onCloseBotBuildPresets: () => void;
  onCloseBuilder: () => void;
  onOpenBuildPresets: () => void;
  onCloseSkillLoadout: () => void;
  onCloseInventory: () => void;
  onCloseProfile: () => void;
  onSetPlayerFigure: (figure: CombatFigureId) => void;
  onSetPlayerProfile: Dispatch<SetStateAction<ReturnType<typeof createProfileMeta>>>;
  onSetMailboxes: Dispatch<SetStateAction<ReturnType<typeof createProfileMailboxes>>>;
}) {
  return (
    <>
      {buildPresetsOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading builds..." />}>
          <BuildPresetsPopover
            buildPresets={sandbox.buildPresets}
            onApplyBuild={(presetId) => {
              sandbox.applyPreset(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
              onCloseBuildPresets();
            }}
            onApplyItemsOnly={(presetId) => {
              sandbox.applyPresetItemsOnly(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            onApplySkillsOnly={(presetId) => {
              sandbox.applyPresetSkillsOnly(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            onClose={onCloseBuildPresets}
          />
        </Suspense>
      ) : null}
      {botBuildPresetsOpen ? (
        <CombatBotBuildPresetsPopover
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          buildPresets={sandbox.botBuildPresets}
          selectedPresetId={sandbox.botBuildPresetId}
          onApplyBuild={(presetId) => {
            sandbox.setBotBuildPreset(presetId);
            onCloseBotBuildPresets();
          }}
          onClose={onCloseBotBuildPresets}
        />
      ) : null}
      {builderOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading builder..." />}>
          <BuilderPopover
            buildPresets={sandbox.buildPresets}
            unlockedSkills={sandbox.unlockedSkills}
            equippedSkillIds={sandbox.equippedSkillIds}
            maxEquippedSkills={sandbox.maxEquippedSkills}
            playerCharacter={sandbox.playerCharacter}
            metrics={sandbox.metrics}
            increaseStat={sandbox.increaseStat}
            decreaseStat={sandbox.decreaseStat}
            applyPreset={(presetId) => {
              sandbox.applyPreset(presetId);
              onSetPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            }}
            resetBuild={() => {
              sandbox.resetBuild();
              onSetPlayerFigure("rush-chip");
            }}
            toggleEquippedSkill={sandbox.toggleEquippedSkill}
            onOpenBuildPresets={onOpenBuildPresets}
            onClose={onCloseBuilder}
          />
        </Suspense>
      ) : null}
      {skillLoadoutOpen ? (
        <SkillLoadoutPopover
          unlockedSkills={sandbox.unlockedSkills}
          equippedSkillIds={sandbox.equippedSkillIds}
          maxEquippedSkills={sandbox.maxEquippedSkills}
          onToggleSkill={sandbox.toggleEquippedSkill}
          onClose={onCloseSkillLoadout}
        />
      ) : null}
      {profileTarget === "player" ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading profile..." />}>
          <ProfileModal
            onClose={onCloseProfile}
            name={playerName}
            level={sandbox.playerCharacter.level}
            figure={playerFigure}
            mirrored
            currentHp={sandbox.playerCombatant?.currentHp ?? sandbox.playerSnapshot.maxHp}
            maxHp={sandbox.playerCombatant?.maxHp ?? sandbox.playerSnapshot.maxHp}
            activeEffects={sandbox.playerCombatant?.activeEffects ?? []}
            equipmentSlots={playerEquipment}
            profile={playerProfile}
            baseStats={sandbox.playerSnapshot.stats}
            derivedStats={buildProfileDerivedStats({
              totalDamage: sandbox.metrics.totalDamage,
              stats: sandbox.playerSnapshot.stats,
              totalArmor: sandbox.metrics.totalArmor,
              dodgeBonus: sandbox.playerSnapshot.dodgeChanceBonus,
              critBonus: sandbox.playerSnapshot.critChanceBonus,
              totalCritMultiplier: sandbox.metrics.totalCritMultiplier,
              baseBlockPenetrationValue: sandbox.metrics.baseBlockPenetration,
              armorPenetrationPercent: sandbox.playerSnapshot.armorPenetrationPercent,
            })}
            skillLabels={sandbox.equippedSkills.map((skill) => skill.name)}
            isOwnProfile
            onNameChange={onPlayerNameChange}
            onMottoChange={(value) => onSetPlayerProfile((current) => ({ ...current, motto: value }))}
            mailboxActorId="player"
            mailboxEntries={mailboxes.player.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "player")}
            onOpenMailbox={() => onSetMailboxes((current) => markMailboxEntriesAsRead(current, "player"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              onSetMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerName,
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
      {profileTarget === "bot" ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading profile..." />}>
          <ProfileModal
            onClose={onCloseProfile}
            name="Arena Bot"
            level={sandbox.botBuildPreset.targetFightLength === "long" ? 4 : 3}
            figure={botFigure}
            currentHp={sandbox.botCombatant?.currentHp ?? sandbox.botSnapshot.maxHp}
            maxHp={sandbox.botCombatant?.maxHp ?? sandbox.botSnapshot.maxHp}
            activeEffects={sandbox.botCombatant?.activeEffects ?? []}
            equipmentSlots={botEquipment}
            profile={botProfile}
            baseStats={sandbox.botSnapshot.stats}
            derivedStats={buildProfileDerivedStats({
              totalDamage: sandbox.metrics.opponentTotalDamage,
              stats: sandbox.botSnapshot.stats,
              totalArmor: sandbox.metrics.opponentTotalArmor,
              dodgeBonus: sandbox.botSnapshot.dodgeChanceBonus,
              critBonus: sandbox.botSnapshot.critChanceBonus,
              totalCritMultiplier:
                critMultiplier(sandbox.botSnapshot.stats.rage, sandbox.botSnapshot.stats.endurance) +
                sandbox.botSnapshot.critMultiplierBonus,
              baseBlockPenetrationValue: baseBlockPenetration(sandbox.botSnapshot.stats.strength),
              armorPenetrationPercent: sandbox.botSnapshot.armorPenetrationPercent,
            })}
            skillLabels={sandbox.botBuildPreset.skillLoadout.map(formatIdLabel)}
            mailboxActorId="bot"
            mailboxEntries={mailboxes.bot.entries}
            unreadMailCount={countUnreadMailboxEntries(mailboxes, "bot")}
            directMessageTarget={{ actorId: "bot", name: "Arena Bot" }}
            onOpenMailbox={() => onSetMailboxes((current) => markMailboxEntriesAsRead(current, "bot"))}
            onSendMail={({ toActorId, toName, subject, body }) =>
              onSetMailboxes((current) =>
                sendProfileMail({
                  mailboxes: current,
                  fromActorId: "player",
                  fromName: playerName,
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
      {inventoryOpen ? (
        <Suspense fallback={<DeferredOverlayFallback label="Loading inventory..." />}>
          <InventoryPopover
            entries={sandbox.inventory.entries}
            slotsUsed={sandbox.inventorySlots.used}
            slotsMax={sandbox.inventorySlots.max}
            equippedItems={sandbox.equippedItems}
            onEquip={sandbox.equipItemByCode}
            onClose={onCloseInventory}
          />
        </Suspense>
      ) : null}
    </>
  );
}


function FightSetupPanel({
  sandbox,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  latestRoundSummary,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  latestRoundSummary: string;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <div data-testid="fight-setup-panel" style={{ ...shellStyle, padding: "16px", display: "grid", gap: "12px", alignContent: "start" }}>
      <FightSetupStage
        sandbox={sandbox}
        selectedActionLabel={selectedActionLabel}
        selectedActionTags={selectedActionTags}
        selectedActionSummary={selectedActionSummary}
        latestRoundSummary={latestRoundSummary}
        onOpenSkillLoadout={onOpenSkillLoadout}
      />
    </div>
  );
}

function FightSetupStage({
  sandbox,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  latestRoundSummary,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
  latestRoundSummary: string;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)", gap: "12px", alignItems: "stretch" }}>
        <FightControlsPanel
          panelStyle={panelStyle}
          primaryButtonStyle={primaryButtonStyle}
          canStartFight={sandbox.canStartFight}
          combatPhase={sandbox.combatPhase}
          combatRound={sandbox.combatState?.round ?? null}
          combatPhaseLabel={sandbox.combatPhaseLabel}
          selectedActionLabel={selectedActionLabel}
          selectedActionTags={selectedActionTags}
          selectedActionSummary={selectedActionSummary}
          onStartFight={sandbox.startFight}
        />

        <AttackTargetRoundPanel
          panelStyle={panelStyle}
          resourcePanel={<CombatResourceGrid panelStyle={panelStyle} resources={sandbox.playerResources} />}
          zones={sandbox.zones}
          selectedAttackZone={sandbox.selectedAttackZone}
          selectedDefenseZones={sandbox.selectedDefenseZones}
          onSelectAttackZone={sandbox.setSelectedAttackZone}
          onToggleDefenseZone={sandbox.toggleDefenseZone}
          roundControls={
            <RoundAdvanceControls
              primaryButtonStyle={primaryButtonStyle}
              canPrepareNextRound={sandbox.canPrepareNextRound}
              canResolveRound={sandbox.canResolveRound}
              combatPhase={sandbox.combatPhase}
              latestRoundSummary={latestRoundSummary}
              onPrepareNextRound={sandbox.prepareNextRound}
              onResolveNextRound={sandbox.resolveNextRound}
            />
          }
        />
      </div>

      <CombatActionsPanel
        sandbox={sandbox}
        panelStyle={panelStyle}
        buttonStyle={buttonStyle}
        onOpenSkillLoadout={onOpenSkillLoadout}
      />
    </div>
  );
}

function resolveDeathFinisherClassName(side: "player" | "bot", winner: "player" | "bot" | null) {
  if (!winner) {
    return undefined;
  }

  if (side === winner) {
    return side === "player"
      ? "combat-finish-panel combat-finish-panel--winner-left"
      : "combat-finish-panel combat-finish-panel--winner-right";
  }

  return side === "player"
    ? "combat-finish-panel combat-finish-panel--loser-left"
    : "combat-finish-panel combat-finish-panel--loser-right";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BotBuildPresetsPopover({
  buildPresets,
  selectedPresetId,
  onApplyBuild,
  onClose,
}: {
  buildPresets: Array<{
    id: string;
    label: string;
    archetype: string;
    description: string;
    targetFightLength: string;
    tags: string[];
  }>;
  selectedPresetId: string;
  onApplyBuild: (presetId: string) => void;
  onClose: () => void;
}) {
  const activePreset = buildPresets.find((preset) => preset.id === selectedPresetId) ?? buildPresets[0] ?? null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <button
        type="button"
        aria-label="Close bot build presets popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.72)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(760px, 100%)",
          maxHeight: "min(720px, calc(100vh - 36px))",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(24,20,19,0.98), rgba(12,11,10,0.98)), radial-gradient(circle at top, rgba(255,188,118,0.08), transparent 30%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.48)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr)", gap: "10px", alignItems: "center" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "11px",
                    fontWeight: 900,
                    background: "linear-gradient(180deg, rgba(255,171,97,0.16), rgba(207,106,50,0.08))",
                    border: "1px solid rgba(255,171,97,0.22)",
                    color: "#ffe2c2",
                  }}
                >
                  BOT
                </div>
                <div style={{ display: "grid", gap: "2px" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      color: "#d8c7b1",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    Arena Bot
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff7ea", lineHeight: 0.98 }}>
                    Bot Builds
                  </div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d7c3ad" }}>
                    curated opponent presets
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "10px", lineHeight: 1.32, color: "#cabfb0", maxWidth: "620px" }}>
                Swap the bot into one of the same curated archetypes the player can use. This changes gear, skills, and consumables without bloating the side column.
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, padding: "6px 10px", fontSize: "10px" }}>
              Close
            </button>
          </div>

          {activePreset ? (
            <div
              style={{
                ...panelStyle,
                padding: "10px 11px",
                display: "grid",
                gap: "7px",
                background: "linear-gradient(180deg, rgba(255,171,97,0.10), rgba(255,255,255,0.025))",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "3px" }}>
                  <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#d7c3ad" }}>
                    Active Now
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        background: getBotBuildTone(activePreset.archetype).surface,
                        border: `1px solid ${getBotBuildTone(activePreset.archetype).border}`,
                        color: getBotBuildTone(activePreset.archetype).text,
                        fontSize: "10px",
                        fontWeight: 900,
                      }}
                    >
                      {getBotPresetIcon(activePreset.id, activePreset.archetype)}
                    </span>
                    <div style={{ display: "grid", gap: "2px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff4e7", lineHeight: 1.04 }}>{activePreset.label}</div>
                      <div
                        style={{
                          fontSize: "9px",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: getBotBuildTone(activePreset.archetype).text,
                        }}
                      >
                        {activePreset.archetype}
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: "999px",
                    padding: "4px 8px",
                    fontSize: "8px",
                    fontWeight: 800,
                    background: "rgba(255,171,97,0.12)",
                    border: "1px solid rgba(255,171,97,0.24)",
                    color: "#ffd9b1",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activePreset.targetFightLength}
                </span>
              </div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {activePreset.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`active-${tag}`}
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#efe2d3",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "grid", gap: "8px" }}>
          {buildPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyBuild(preset.id)}
              style={{
                borderRadius: "16px",
                padding: "10px 11px",
                background: preset.id === selectedPresetId
                  ? `linear-gradient(180deg, ${getBotBuildTone(preset.archetype).surface}, rgba(255,255,255,0.03))`
                  : "rgba(255,255,255,0.03)",
                border: preset.id === selectedPresetId
                  ? `1px solid ${getBotBuildTone(preset.archetype).border}`
                  : "1px solid rgba(255,255,255,0.08)",
                display: "grid",
                gap: "6px",
                textAlign: "left",
                color: "#fff2df",
                cursor: "pointer",
                boxShadow: preset.id === selectedPresetId ? `0 10px 24px ${getBotBuildTone(preset.archetype).shadow}` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                <div style={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: "8px", alignItems: "start", flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      background: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).surface : "rgba(255,255,255,0.05)",
                      border: `1px solid ${preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).border : "rgba(255,255,255,0.08)"}`,
                      color: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).text : "#ffd9b1",
                      fontSize: "10px",
                      fontWeight: 900,
                    }}
                  >
                    {getBotPresetIcon(preset.id, preset.archetype)}
                  </div>
                  <div style={{ display: "grid", gap: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "#fff6e7", lineHeight: 1.04 }}>{preset.label}</div>
                    <div
                      style={{
                        fontSize: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: preset.id === selectedPresetId ? getBotBuildTone(preset.archetype).text : "#d7c6b2",
                        opacity: 0.86,
                      }}
                    >
                      {preset.archetype} / {preset.targetFightLength}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: "999px",
                    padding: "5px 8px",
                    fontSize: "8px",
                    fontWeight: 800,
                    border: preset.id === selectedPresetId ? "1px solid rgba(255,171,97,0.34)" : "1px solid rgba(255,255,255,0.12)",
                    background: preset.id === selectedPresetId
                      ? "linear-gradient(180deg, rgba(221,122,68,0.28), rgba(207,106,50,0.12))"
                      : "rgba(255,255,255,0.04)",
                    color: preset.id === selectedPresetId ? "#ffe2c2" : "#efe6da",
                    whiteSpace: "nowrap",
                  }}
                >
                  {preset.id === selectedPresetId ? "Selected" : "Use Build"}
                </span>
              </div>
              <div style={{ fontSize: "9px", lineHeight: 1.32, color: "#d7cbbc" }}>{preset.description}</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {preset.tags.map((tag) => (
                  <span
                    key={`${preset.id}-${tag}`}
                    style={{
                      borderRadius: "999px",
                      padding: "3px 7px",
                      fontSize: "8px",
                      background: preset.id === selectedPresetId ? getBotTagTone(tag).surface : "rgba(255,255,255,0.05)",
                      border: `1px solid ${preset.id === selectedPresetId ? getBotTagTone(tag).border : "rgba(255,255,255,0.08)"}`,
                      color: "#efe2d3",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getBotPresetIcon(presetId: string, archetype: string) {
  const normalizedId = presetId.toLowerCase();
  const normalizedArchetype = archetype.toLowerCase();

  if (normalizedId.includes("shield") || normalizedArchetype.includes("defense")) return "SH";
  if (normalizedId.includes("dagger") || normalizedArchetype.includes("burst")) return "DG";
  if (normalizedId.includes("mace") || normalizedArchetype.includes("control")) return "MC";
  if (normalizedId.includes("axe") || normalizedArchetype.includes("tempo")) return "AX";
  if (normalizedId.includes("heavy") || normalizedArchetype.includes("heavy")) return "HV";
  if (normalizedId.includes("sustain")) return "RG";
  return "SW";
}

function getBotBuildTone(archetype: string) {
  const normalized = archetype.toLowerCase();
  if (normalized.includes("defense")) {
    return { surface: "rgba(92,149,227,0.14)", border: "rgba(92,149,227,0.28)", text: "#b7d5ff", shadow: "rgba(92,149,227,0.12)" };
  }
  if (normalized.includes("burst")) {
    return { surface: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)", text: "#ee9abb", shadow: "rgba(216,93,145,0.12)" };
  }
  if (normalized.includes("control")) {
    return { surface: "rgba(130,111,213,0.14)", border: "rgba(130,111,213,0.28)", text: "#cdc1ff", shadow: "rgba(130,111,213,0.12)" };
  }
  if (normalized.includes("tempo")) {
    return { surface: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)", text: "#87e2cf", shadow: "rgba(92,199,178,0.12)" };
  }
  if (normalized.includes("heavy")) {
    return { surface: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)", text: "#ebcf8b", shadow: "rgba(214,177,95,0.12)" };
  }
  if (normalized.includes("sustain")) {
    return { surface: "rgba(126,171,222,0.14)", border: "rgba(126,171,222,0.28)", text: "#cae0ff", shadow: "rgba(126,171,222,0.12)" };
  }
  return { surface: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)", text: "#f0a286", shadow: "rgba(229,115,79,0.12)" };
}

function getBotTagTone(tag: string) {
  const normalized = tag.toLowerCase();
  if (normalized.includes("guard") || normalized.includes("tank") || normalized.includes("stability")) {
    return { surface: "rgba(92,149,227,0.12)", border: "rgba(92,149,227,0.22)" };
  }
  if (normalized.includes("crit") || normalized.includes("high line")) {
    return { surface: "rgba(216,93,145,0.12)", border: "rgba(216,93,145,0.22)" };
  }
  if (normalized.includes("control") || normalized.includes("resource")) {
    return { surface: "rgba(130,111,213,0.12)", border: "rgba(130,111,213,0.22)" };
  }
  if (normalized.includes("tempo") || normalized.includes("pressure") || normalized.includes("waist") || normalized.includes("legs")) {
    return { surface: "rgba(92,199,178,0.12)", border: "rgba(92,199,178,0.22)" };
  }
  if (normalized.includes("heavy") || normalized.includes("finisher")) {
    return { surface: "rgba(214,177,95,0.12)", border: "rgba(214,177,95,0.22)" };
  }
  if (normalized.includes("sustain") || normalized.includes("midrange")) {
    return { surface: "rgba(126,171,222,0.12)", border: "rgba(126,171,222,0.22)" };
  }
  return { surface: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ResourceGrid({
  resources,
  compact = false,
  layout = "grid",
  showHeader = true,
}: {
  resources: { rage: number; guard: number; momentum: number; focus: number } | null;
  compact?: boolean;
  layout?: "grid" | "row";
  showHeader?: boolean;
}) {
  const items = [
    { key: "rage", label: "Rage", short: "R", icon: "✦", color: "#ee9abb" },
    { key: "guard", label: "Guard", short: "G", icon: "⬢", color: "#b7d5ff" },
    { key: "momentum", label: "Momentum", short: "M", icon: "➤", color: "#f0a286" },
    { key: "focus", label: "Focus", short: "F", icon: "◌", color: "#87e2cf" },
  ] as const;

  return (
    <div
      style={{
        ...panelStyle,
        padding: layout === "row" ? "6px 8px" : compact ? "8px" : "9px 10px",
        display: "grid",
        gap: layout === "row" ? "5px" : "7px",
      }}
    >
      {showHeader ? (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.68 }}>
            {compact ? "Resource" : "Resource Gain"}
          </div>
          <div
            style={{
              borderRadius: "999px",
              padding: "2px 6px",
              fontSize: "8px",
              fontWeight: 700,
              background: "rgba(255,255,255,0.06)",
              color: "#e7d9c8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {(resources?.rage ?? 0) + (resources?.guard ?? 0) + (resources?.momentum ?? 0) + (resources?.focus ?? 0)} stored
          </div>
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            layout === "row" ? "repeat(4, minmax(0, 1fr))" : compact ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
          gap: layout === "row" ? "4px" : compact ? "6px" : "5px",
        }}
      >
        {items.map((item) => {
          const value = resources?.[item.key] ?? 0;
          const progress = Math.min(1, value / 6);

          return (
            <div
              key={item.key}
              className={
                value > 0
                  ? `combat-resource-card combat-resource-card--charged combat-resource-card--${item.key}`
                  : `combat-resource-card combat-resource-card--${item.key}`
              }
              style={{
                borderRadius: "12px",
                padding: layout === "row" ? "5px 4px" : compact ? "6px 5px" : "7px 6px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                display: "grid",
                gap: layout === "row" ? "4px" : "6px",
              }}
              title={`${item.label}: ${value}`}
            >
              <div
                style={{
                  width: layout === "row" ? "24px" : compact ? "28px" : "32px",
                  height: layout === "row" ? "24px" : compact ? "28px" : "32px",
                  margin: "0 auto",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: `conic-gradient(${item.color} ${Math.max(progress * 360, value > 0 ? 30 : 0)}deg, rgba(255,255,255,0.08) 0deg)`,
                  boxShadow: value > 0 ? `0 0 14px ${item.color}22` : "none",
                }}
              >
                <div
                  style={{
                    width: layout === "row" ? "16px" : compact ? "20px" : "24px",
                    height: layout === "row" ? "16px" : compact ? "20px" : "24px",
                    borderRadius: "999px",
                    background: "rgba(18,16,15,0.94)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    placeItems: "center",
                    color: item.color,
                    fontSize: layout === "row" ? "8px" : compact ? "10px" : "11px",
                    fontWeight: 900,
                    lineHeight: 1,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: layout === "row" ? "7px" : compact ? "9px" : "10px",
                      opacity: 0.28,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ position: "relative", zIndex: 1 }}>{item.short}</span>
                </div>
              </div>
              <div style={{ fontSize: layout === "row" ? "11px" : compact ? "12px" : "13px", fontWeight: 800 }}>{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillLoadoutPopover({
  unlockedSkills,
  equippedSkillIds,
  maxEquippedSkills,
  onToggleSkill,
  onClose,
}: {
  unlockedSkills: Array<{
    id: string;
    name: string;
    description: string;
    sourceItemCode: string;
    resourceType: string;
    cost: number;
    damageMultiplier: number;
    critChanceBonus: number;
    cooldownTurns?: number;
    requirements?: {
      minLevel?: number;
      notes?: string[];
    };
    unlock?: {
      kind: "item" | "book" | "trainer" | "quest" | "default";
      sourceName?: string;
      note?: string;
    };
    armorPenetrationPercentBonus: DamageProfile;
    effects?: CombatRuleEffectSummary[];
  }>;
  equippedSkillIds: string[];
  maxEquippedSkills: number;
  onToggleSkill: (skillId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <button
        type="button"
        aria-label="Close skill loadout popover"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: "rgba(7, 8, 12, 0.72)",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(760px, 100%)",
          maxHeight: "min(720px, calc(100vh - 36px))",
          overflow: "hidden",
          borderRadius: "22px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(25,22,27,0.98), rgba(14,13,18,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
          boxShadow: "0 28px 72px rgba(0,0,0,0.48)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
        }}
      >
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "3px" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "#d8c7b1", textTransform: "uppercase" }}>
                Combat Actions
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff7ea", lineHeight: 1.05 }}>
                Equipped Skills
              </div>
              <div style={{ fontSize: "11px", lineHeight: 1.35, color: "#cabfb0" }}>
                Choose up to {maxEquippedSkills} active skills from all equipped items. These are the skills shown in the battle panel.
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, padding: "6px 10px", fontSize: "10px" }}>
              Close
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxEquippedSkills}, minmax(0, 1fr))`, gap: "6px" }}>
            {Array.from({ length: maxEquippedSkills }, (_, index) => {
              const skillId = equippedSkillIds[index] ?? null;
              const skill = unlockedSkills.find((entry) => entry.id === skillId) ?? null;

              return (
                <div
                  key={`equipped-skill-slot-${index + 1}`}
                  style={{
                    borderRadius: "16px",
                    padding: "10px",
                    minHeight: "96px",
                    background: skill ? "rgba(207,106,50,0.10)" : "rgba(255,255,255,0.03)",
                    border: skill ? "1px solid rgba(255,171,97,0.28)" : "1px dashed rgba(255,255,255,0.14)",
                    display: "grid",
                    gap: "6px",
                    alignContent: "start",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                    <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>Slot {index + 1}</div>
                    {skill ? <div style={{ fontSize: "20px", lineHeight: 1 }}>{getSkillIcon(skill.name, skill.sourceItemCode)}</div> : null}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 800, lineHeight: 1.2 }}>{skill?.name ?? "Empty"}</div>
                  <div style={{ fontSize: "9px", opacity: 0.68, lineHeight: 1.25 }}>
                    {skill ? formatMaybeTitle(skill.sourceItemCode.replace(/-/g, " ")) : "Assign a skill below"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "grid", gap: "8px" }}>
          {unlockedSkills.length === 0 ? (
            <div style={{ fontSize: "11px", opacity: 0.66, lineHeight: 1.4 }}>
              Equip items with `skills[]` to unlock combat actions here.
            </div>
          ) : (
            unlockedSkills.map((skill) => {
              const equippedIndex = equippedSkillIds.indexOf(skill.id);
              const isEquipped = equippedIndex >= 0;
              const canEquip = isEquipped || equippedSkillIds.length < maxEquippedSkills;

              return (
                <div
                  key={skill.id}
                  style={{
                    borderRadius: "15px",
                    padding: "12px",
                    background: isEquipped ? "rgba(207,106,50,0.08)" : "rgba(255,255,255,0.03)",
                    border: isEquipped ? "1px solid rgba(255,171,97,0.28)" : "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "12px",
                          display: "grid",
                          placeItems: "center",
                          background: getActionVisual(skill.name, skill.sourceItemCode).innerBackground,
                          border: `1px solid ${getActionVisual(skill.name, skill.sourceItemCode).ring}`,
                          fontSize: "18px",
                        }}
                      >
                        {getSkillIcon(skill.name, skill.sourceItemCode)}
                      </div>
                      <div style={{ display: "grid", gap: "3px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800 }}>{skill.name}</div>
                        <div style={{ fontSize: "9px", opacity: 0.68 }}>
                          {formatMaybeTitle(skill.sourceItemCode.replace(/-/g, " "))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: "#ffd9b1",
                          borderRadius: "999px",
                          padding: "4px 8px",
                          background: "linear-gradient(180deg, rgba(255,200,132,0.18), rgba(214,129,63,0.08))",
                          border: "1px solid rgba(255,200,132,0.28)",
                        }}
                      >
                        {skill.cost} {formatResourceLabel(skill.resourceType)}
                      </div>
                      {typeof skill.cooldownTurns === "number" ? (
                        <div
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "#b8cbff",
                            borderRadius: "999px",
                            padding: "3px 7px",
                            background: "rgba(115,149,230,0.12)",
                            border: "1px solid rgba(115,149,230,0.22)",
                          }}
                        >
                          CD {skill.cooldownTurns}T
                        </div>
                      ) : null}
                      <button
                        type="button"
                        aria-label={isEquipped ? `Remove ${skill.name} from panel skills` : `Add ${skill.name} to panel skills`}
                        onClick={() => onToggleSkill(skill.id)}
                        disabled={!canEquip}
                        style={{
                          ...buttonStyle,
                          padding: "5px 8px",
                          fontSize: "9px",
                          opacity: canEquip ? 1 : 0.5,
                          cursor: canEquip ? "pointer" : "not-allowed",
                        }}
                      >
                        {isEquipped ? `Slot ${equippedIndex + 1}` : "Add To Panel"}
                      </button>
                    </div>
                  </div>
                  <FactList rows={formatSkillDetailLines(skill)} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FactList({ rows }: { rows: string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "4px",
        borderRadius: "12px",
        padding: "8px 9px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {rows.map((line) => {
        const entry = splitDetailLine(line);
        return (
          <div
            key={`${entry.label}-${entry.value}`}
            style={{
              display: "grid",
              gridTemplateColumns: "54px minmax(0, 1fr)",
              gap: "7px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                fontSize: "7px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#d3bfab",
                opacity: 0.82,
                fontWeight: 800,
                paddingTop: "2px",
              }}
            >
              {entry.label}
            </div>
            <div style={{ fontSize: "8px", color: "#f4e8d9", lineHeight: 1.28, fontWeight: 700 }}>{entry.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function resolvePresetFigure(presetId: string, fallback: CombatFigureId): CombatFigureId {
  return presetFigureById[presetId] ?? fallback;
}

function resolveSelectedActionLabel(sandbox: ReturnType<typeof useCombatSandbox>) {
  const selectedAction = sandbox.selectedAction;

  switch (selectedAction.kind) {
    case "skill_attack":
      return sandbox.equippedSkills.find((skill) => skill.id === selectedAction.skillId)?.name ?? "Skill";
    case "consumable":
      return sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item.name ?? "Consumable";
    case "basic_attack":
    default:
      return "Basic Attack";
  }
}

function resolveSelectedActionSummary(sandbox: ReturnType<typeof useCombatSandbox>) {
  const selectedAction = sandbox.selectedAction;
  const zone = sandbox.selectedAttackZone;
  const zoneMultiplier = combatZoneDamageModifiers[zone];

  switch (selectedAction.kind) {
    case "skill_attack":
      return formatSkillDetailLines(sandbox.equippedSkills.find((skill) => skill.id === selectedAction.skillId) ?? null);
    case "consumable":
      return formatConsumableDetailLines(sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null);
    case "basic_attack":
    default:
      return [
        `Zone: ${formatMaybeTitle(zone)} x${zoneMultiplier.toFixed(2)}.`,
        `Damage x${zoneMultiplier.toFixed(2)}`,
        `Hit: Deals x${zoneMultiplier.toFixed(2)} basic damage.`,
        "Cost: 0.",
      ];
  }
}

function resolveSelectedActionTags(sandbox: ReturnType<typeof useCombatSandbox>) {
  const tags: string[] = [];
  const selectedAction = sandbox.selectedAction;

    switch (selectedAction.kind) {
    case "skill_attack": {
      const skill = sandbox.equippedSkills.find((entry) => entry.id === selectedAction.skillId) ?? null;
      tags.push("Skill");
      if (skill) {
        tags.push(`Damage x${skill.damageMultiplier.toFixed(2)}`);
        if (skill.critChanceBonus > 0) {
          tags.push(`Crit +${skill.critChanceBonus}%`);
        }
        if (skill.effects?.length) {
          tags.push(
            ...skill.effects.slice(0, 2).map((effect) => `${effect.name} ${effect.durationTurns}T`)
          );
        }
      }
      break;
    }
    case "consumable": {
      const consumable =
        sandbox.availableConsumables.find((entry) => entry.item.code === selectedAction.consumableCode)?.item ?? null;
      tags.push(selectedAction.usageMode === "with_attack" ? "With Attack" : "Separate Action");
      if (consumable?.consumableEffect?.heal) {
        tags.push(`Heal ${consumable.consumableEffect.heal} HP`);
      }
      if (consumable?.consumableEffect?.effects?.length) {
        tags.push(...consumable.consumableEffect.effects.slice(0, 2).map((effect) => `Apply ${effect.name}`));
      }
      break;
    }
    case "basic_attack":
    default:
      tags.push("Basic");
      tags.push(`Target ${formatMaybeTitle(sandbox.selectedAttackZone)}`);
      tags.push(`Zone x${combatZoneDamageModifiers[sandbox.selectedAttackZone].toFixed(2)}`);
      tags.push(`x${combatZoneDamageModifiers[sandbox.selectedAttackZone].toFixed(2)} Final`);
      tags.push("Cost 0");
      break;
  }

  return tags;
}

function buildProfileDerivedStats(input: {
  totalDamage: number;
  stats: CharacterStats;
  totalArmor: number;
  dodgeBonus: number;
  critBonus: number;
  totalCritMultiplier: number;
  baseBlockPenetrationValue: number;
  armorPenetrationPercent: DamageProfile;
}) {
  const totalDodge = baseDodgeChance(input.stats.agility) + input.dodgeBonus;
  const totalCrit = baseCritChance(input.stats.rage) + input.critBonus;
  const antiDodge = Math.min(
    combatChanceCaps.dodgeChance,
    Math.max(0, input.stats.agility * combatFormulaConfig.attackerAgilityDodgePenaltyFactor)
  );
  const antiCrit = Math.min(
    combatChanceCaps.baseCritChance,
    Math.max(0, input.stats.rage * combatFormulaConfig.defenderRageCritPenaltyFactor)
  );
  const totalArmorPenetration = totalProfileValue(input.armorPenetrationPercent);

  return [
    { label: "Damage", value: formatRangeLabel(damageRange(input.totalDamage)), helper: "Current rolled damage range after weapon, stat and gear bonuses." },
    { label: "Armor", value: formatRangeLabel(armorRange(input.totalArmor)), helper: "Current rolled armor range across all damage types." },
    { label: "Dodge", value: `${totalDodge}%`, helper: `Base ${baseDodgeChance(input.stats.agility)}% + bonuses ${input.dodgeBonus}%.` },
    { label: "Crit Chance", value: `${totalCrit}%`, helper: `Base ${baseCritChance(input.stats.rage)}% + bonuses ${input.critBonus}%.` },
    { label: "Anti-Dodge", value: `${antiDodge}%`, helper: "How much enemy dodge is suppressed by your agility." },
    { label: "Anti-Crit", value: `${antiCrit}%`, helper: "How much enemy crit chance is suppressed by your rage." },
    { label: "Crit Damage", value: `x${input.totalCritMultiplier.toFixed(2)}`, helper: "Base multiplier plus endurance and gear bonuses." },
    { label: "Block Penetration", value: `${input.baseBlockPenetrationValue}%`, helper: "Base pressure through guarded hits from strength." },
    { label: "Armor Pen", value: `${totalArmorPenetration}%`, helper: "Combined item-based armor penetration profile." },
  ];
}

function formatRangeLabel(range: { min: number; max: number }) {
  return `${range.min}-${range.max}`;
}

function formatIdLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

