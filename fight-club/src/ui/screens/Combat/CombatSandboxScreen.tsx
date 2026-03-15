import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { CharacterStatName, CharacterStats } from "@/modules/character";
import {
  baseBlockPenetration,
  baseCritChance,
  baseDodgeChance,
  critMultiplier,
  combatChanceCaps,
  combatFormulaConfig,
  combatZoneDamageModifiers,
  type CombatZone,
} from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { DamageProfile, Item } from "@/modules/inventory";
import type { ArmorProfile } from "@/modules/inventory";
import {
  addProfileBattleResult,
  countUnreadMailboxEntries,
  createProfileMailboxes,
  createProfileMeta,
  markMailboxEntriesAsRead,
  sendProfileMail,
} from "@/modules/profile";
import { totalProfileValue } from "@/orchestration/combat/combatPressure";
import { BattleLogPanel } from "@/ui/components/combat/BattleLogPanel";
import { BuildPresetsPopover } from "@/ui/components/combat/BuildPresetsPopover";
import { BuilderPopover } from "@/ui/components/combat/BuilderPopover";
import { CombatSilhouette, type CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { EquipmentSlotPopover } from "@/ui/components/combat/EquipmentSlotPopover";
import { InventoryPopover } from "@/ui/components/combat/InventoryPopover";
import { ProfileModal } from "@/ui/components/profile/ProfileModal";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";

const playerEquipmentSlots: EquipmentSlot[] = ["helmet", "armor", "mainHand", "offHand", "gloves", "accessory", "boots"];

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

const statMeta: Record<CharacterStatName, { short: string; color: string; background: string; border: string }> = {
  strength: { short: "STR", color: "#f0a286", background: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)" },
  agility: { short: "AGI", color: "#87e2cf", background: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)" },
  rage: { short: "RAG", color: "#ee9abb", background: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)" },
  endurance: { short: "END", color: "#ebcf8b", background: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)" },
};

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

  return (
    <section data-testid="combat-sandbox-screen" style={{ display: "grid", gap: "14px" }}>
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
              onOpenBuilder={() => setBuilderOpen(true)}
              onOpenBuildPresets={() => setBuildPresetsOpen(true)}
              onOpenInventory={() => setInventoryOpen(true)}
              onOpenProfile={() => setProfileTarget("player")}
              onSelectEquipmentSlot={setSelectedEquipmentSlot}
              onCloseEquipmentSlot={() => setSelectedEquipmentSlot(null)}
              silhouetteState={outcomeWinner === "player" ? "victory" : outcomeWinner === "bot" ? "defeat" : null}
            />
          </div>

          <FightSetupPanel
            sandbox={sandbox}
            selectedActionLabel={selectedActionLabel}
            selectedActionTags={selectedActionTags}
            selectedActionSummary={selectedActionSummary}
            latestRoundSummary={latestRoundSummary}
            onOpenSkillLoadout={() => setSkillLoadoutOpen(true)}
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
              onOpenBuildPresets={() => setBotBuildPresetsOpen(true)}
              onOpenProfile={() => setProfileTarget("bot")}
              silhouetteState={outcomeWinner === "bot" ? "victory" : outcomeWinner === "player" ? "defeat" : null}
            />
          </div>
        </div>
      </div>

      <BattleLogSection
        entries={sandbox.battleLogEntries}
        playerId={sandbox.playerSnapshot.characterId}
        botId={sandbox.botSnapshot.characterId}
      />

      {buildPresetsOpen ? (
        <BuildPresetsPopover
          buildPresets={sandbox.buildPresets}
          onApplyBuild={(presetId) => {
            sandbox.applyPreset(presetId);
            setPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
            setBuildPresetsOpen(false);
          }}
          onApplyItemsOnly={(presetId) => {
            sandbox.applyPresetItemsOnly(presetId);
            setPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
          }}
          onApplySkillsOnly={(presetId) => {
            sandbox.applyPresetSkillsOnly(presetId);
            setPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
          }}
          onClose={() => setBuildPresetsOpen(false)}
        />
      ) : null}
      {botBuildPresetsOpen ? (
        <BotBuildPresetsPopover
          buildPresets={sandbox.botBuildPresets}
          selectedPresetId={sandbox.botBuildPresetId}
          onApplyBuild={(presetId) => {
            sandbox.setBotBuildPreset(presetId);
            setBotBuildPresetsOpen(false);
          }}
          onClose={() => setBotBuildPresetsOpen(false)}
        />
      ) : null}
      {builderOpen ? (
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
            setPlayerFigure(resolvePresetFigure(presetId, "rush-chip"));
          }}
          resetBuild={() => {
            sandbox.resetBuild();
            setPlayerFigure("rush-chip");
          }}
          toggleEquippedSkill={sandbox.toggleEquippedSkill}
          onOpenBuildPresets={() => setBuildPresetsOpen(true)}
          onClose={() => setBuilderOpen(false)}
        />
      ) : null}
      {skillLoadoutOpen ? (
        <SkillLoadoutPopover
          unlockedSkills={sandbox.unlockedSkills}
          equippedSkillIds={sandbox.equippedSkillIds}
          maxEquippedSkills={sandbox.maxEquippedSkills}
          onToggleSkill={sandbox.toggleEquippedSkill}
          onClose={() => setSkillLoadoutOpen(false)}
        />
      ) : null}

      {profileTarget === "player" ? (
        <ProfileModal
          onClose={() => setProfileTarget(null)}
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
                fromName: playerName,
                toActorId,
                toName,
                subject,
                body,
              })
            )
          }
        />
      ) : null}

      {profileTarget === "bot" ? (
        <ProfileModal
          onClose={() => setProfileTarget(null)}
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
            totalCritMultiplier: critMultiplier(sandbox.botSnapshot.stats.endurance) + sandbox.botSnapshot.critMultiplierBonus,
            baseBlockPenetrationValue: baseBlockPenetration(sandbox.botSnapshot.stats.strength),
            armorPenetrationPercent: sandbox.botSnapshot.armorPenetrationPercent,
          })}
          skillLabels={sandbox.botBuildPreset.skillLoadout.map(formatIdLabel)}
          mailboxActorId="bot"
          mailboxEntries={mailboxes.bot.entries}
          unreadMailCount={countUnreadMailboxEntries(mailboxes, "bot")}
          directMessageTarget={{ actorId: "bot", name: "Arena Bot" }}
          onOpenMailbox={() => setMailboxes((current) => markMailboxEntriesAsRead(current, "bot"))}
          onSendMail={({ toActorId, toName, subject, body }) =>
            setMailboxes((current) =>
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
      ) : null}

      {inventoryOpen ? (
        <InventoryPopover
          entries={sandbox.inventory.entries}
          slotsUsed={sandbox.inventorySlots.used}
          slotsMax={sandbox.inventorySlots.max}
          equippedItems={sandbox.equippedItems}
          onEquip={sandbox.equipItemByCode}
          onClose={() => setInventoryOpen(false)}
        />
      ) : null}
    </section>
  );
}

function PlayerCombatPanel({
  sandbox,
  playerName,
  playerFigure,
  buildConfigured,
  equipment,
  selectedEquipmentSlot,
  onOpenBuilder,
  onOpenBuildPresets,
  onOpenInventory,
  onOpenProfile,
  onSelectEquipmentSlot,
  onCloseEquipmentSlot,
  silhouetteState = null,
}: {
  sandbox: CombatSandboxModel;
  playerName: string;
  playerFigure: CombatFigureId;
  buildConfigured: boolean;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  selectedEquipmentSlot: EquipmentSlot | null;
  onOpenBuilder: () => void;
  onOpenBuildPresets: () => void;
  onOpenInventory: () => void;
  onOpenProfile: () => void;
  onSelectEquipmentSlot: (slot: EquipmentSlot) => void;
  onCloseEquipmentSlot: () => void;
  silhouetteState?: "victory" | "defeat" | null;
}) {
  const impactEvent = useCombatImpactPulse(sandbox.playerIncomingResult);

  return (
    <SidePanel
      silhouette={
        <CombatOutcomeSilhouetteWrap side="player" state={silhouetteState}>
          <CombatSilhouette
            title={playerName}
            currentHp={sandbox.playerCombatant?.currentHp ?? sandbox.playerSnapshot.maxHp}
            maxHp={sandbox.playerCombatant?.maxHp ?? sandbox.playerSnapshot.maxHp}
            activeEffects={sandbox.playerCombatant?.activeEffects ?? []}
            equipmentSlots={equipment}
            figure={playerFigure}
            mirrored
            onProfileClick={onOpenProfile}
            impactKey={impactEvent?.key ?? null}
            impactVariant={impactEvent?.variant ?? "hit"}
            impactValue={impactEvent?.value ?? null}
            onEquipmentSlotClick={onSelectEquipmentSlot}
          />
        </CombatOutcomeSilhouetteWrap>
      }
      sidebar={
        <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
          <MiniPanel title="Utility">
            <div style={{ display: "grid", gap: "6px" }}>
              <button type="button" aria-label="Open builder" onClick={onOpenBuilder} style={buttonStyle}>Builder</button>
              <button
                type="button"
                aria-label="Open build presets"
                onClick={onOpenBuildPresets}
                style={{
                  ...buttonStyle,
                  ...(!buildConfigured
                    ? {
                        border: "1px solid rgba(102, 224, 138, 0.5)",
                        background: "linear-gradient(180deg, rgba(72, 154, 88, 0.28), rgba(39, 99, 51, 0.16))",
                        color: "#d8ffe0",
                        boxShadow: "0 0 0 rgba(90, 207, 122, 0)",
                        animation: "build-attention-pulse 1.9s ease-in-out infinite",
                      }
                    : {}),
                }}
              >
                Builds
              </button>
              <button type="button" aria-label="Open inventory" onClick={onOpenInventory} style={buttonStyle}>Inventory</button>
            </div>
          </MiniPanel>
          <MiniPanel title="Build">
            <StatTuning
              stats={sandbox.playerCharacter.baseStats}
              unspentPoints={sandbox.playerCharacter.unspentStatPoints}
              onIncrease={sandbox.increaseStat}
              onDecrease={sandbox.decreaseStat}
            />
          </MiniPanel>
          <MiniPanel title="Snapshot">
            <MetricGrid
              items={[
                { label: "HP", value: String(sandbox.metrics.maxHp) },
                { label: "DMG", value: String(sandbox.metrics.totalDamage), tone: "warm" },
                { label: "Armor", value: String(sandbox.metrics.totalArmor) },
                { label: "Crit", value: `${sandbox.metrics.baseCritChance + sandbox.metrics.critChanceBonus}%` },
                { label: "Dodge", value: `${sandbox.metrics.baseDodgeChance + sandbox.metrics.dodgeChanceBonus}%` },
                { label: "Type", value: formatMaybeTitle(sandbox.metrics.weaponDamageType) },
              ]}
            />
          </MiniPanel>
        </div>
      }
      blocks={[]}
      overlay={
        selectedEquipmentSlot ? (
          <EquipmentSlotPopover
            slot={selectedEquipmentSlot}
            entries={sandbox.getInventoryOptionsForSlot(selectedEquipmentSlot)}
            equippedItemCode={sandbox.equippedItems.find((entry) => entry.slot === selectedEquipmentSlot)?.item?.code ?? null}
            onEquip={(itemCode) => {
              sandbox.equipItemByCode(itemCode);
              onCloseEquipmentSlot();
            }}
            onUnequip={(slot) => {
              sandbox.unequipSlot(slot);
              onCloseEquipmentSlot();
            }}
            onClose={onCloseEquipmentSlot}
          />
        ) : null
      }
    />
  );
}

function BotCombatPanel({
  sandbox,
  botFigure,
  equipment,
  onOpenBuildPresets,
  onOpenProfile,
  silhouetteState = null,
}: {
  sandbox: CombatSandboxModel;
  botFigure: CombatFigureId;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  onOpenBuildPresets: () => void;
  onOpenProfile: () => void;
  silhouetteState?: "victory" | "defeat" | null;
}) {
  const impactEvent = useCombatImpactPulse(sandbox.botIncomingResult);

  return (
    <SidePanel
      silhouette={
        <div style={{ display: "grid", gap: "8px" }}>
          <CombatOutcomeSilhouetteWrap side="bot" state={silhouetteState}>
            <CombatSilhouette
              title="Bot"
              currentHp={sandbox.botCombatant?.currentHp ?? sandbox.botSnapshot.maxHp}
              maxHp={sandbox.botCombatant?.maxHp ?? sandbox.botSnapshot.maxHp}
              activeEffects={sandbox.botCombatant?.activeEffects ?? []}
              equipmentSlots={equipment}
              figure={botFigure}
              onProfileClick={onOpenProfile}
              impactKey={impactEvent?.key ?? null}
              impactVariant={impactEvent?.variant ?? "hit"}
              impactValue={impactEvent?.value ?? null}
            />
          </CombatOutcomeSilhouetteWrap>
          <ResourceGrid resources={sandbox.botResources} layout="row" showHeader={false} />
        </div>
      }
      sidebar={<BotCombatPanelSidebar sandbox={sandbox} onOpenBuildPresets={onOpenBuildPresets} />}
      blocks={[]}
    />
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
      <div style={{ display: "grid", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)", gap: "12px", alignItems: "stretch" }}>
          <FightControlsPanel
            sandbox={sandbox}
            selectedActionLabel={selectedActionLabel}
            selectedActionTags={selectedActionTags}
            selectedActionSummary={selectedActionSummary}
          />

          <AttackTargetRoundPanel sandbox={sandbox} latestRoundSummary={latestRoundSummary} />
        </div>

        <CombatActionsPanel sandbox={sandbox} onOpenSkillLoadout={onOpenSkillLoadout} />
      </div>
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

function CombatOutcomeSilhouetteWrap({
  side,
  state,
  children,
}: {
  side: "player" | "bot";
  state: "victory" | "defeat" | null;
  children: ReactNode;
}) {
  const className =
    state === "victory"
      ? side === "player"
        ? "combat-postfight-silhouette combat-postfight-silhouette--victory-left"
        : "combat-postfight-silhouette combat-postfight-silhouette--victory-right"
      : state === "defeat"
        ? side === "player"
          ? "combat-postfight-silhouette combat-postfight-silhouette--defeat-left"
          : "combat-postfight-silhouette combat-postfight-silhouette--defeat-right"
        : undefined;

  return (
    <div style={{ position: "relative" }}>
      <div className={className}>{children}</div>
      {state === "defeat" ? (
        <div
          className="combat-outcome-stamp combat-outcome-stamp--defeat"
          style={{
            position: "absolute",
            top: "44%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-13deg)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          DEFEAT
        </div>
      ) : null}
      {state === "victory" ? (
        <div
          className="combat-outcome-stamp combat-outcome-stamp--victory"
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%) rotate(-8deg)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          Victory!
        </div>
      ) : null}
      {state === "defeat" ? (
        <div
          style={{
            position: "absolute",
            inset: "54px 18px 40px",
            borderRadius: "28px",
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.08), rgba(8,8,8,0.34)), radial-gradient(circle at 50% 36%, rgba(255,86,86,0.08), transparent 34%)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />
      ) : null}
    </div>
  );
}

function FightControlsPanel({
  sandbox,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
}: {
  sandbox: CombatSandboxModel;
  selectedActionLabel: string;
  selectedActionTags: string[];
  selectedActionSummary: string[];
}) {
  return (
    <MiniPanel title="Fight Controls">
      <div style={{ display: "grid", gap: "10px", height: "100%", alignContent: "space-between" }}>
        <div style={{ display: "grid", gap: "10px" }}>
          <button
            type="button"
            aria-label="Start fight"
            onClick={sandbox.startFight}
            disabled={!sandbox.canStartFight}
            style={{
              ...primaryButtonStyle,
              ...(sandbox.canStartFight ? {} : { opacity: 0.48, cursor: "not-allowed" }),
            }}
          >
            {sandbox.combatPhase === "finished" ? "Restart Fight" : "Start Fight"}
          </button>
        </div>
        <div style={{ display: "grid", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68 }}>Current Action</div>
            <div style={{ fontSize: "10px", opacity: 0.66 }}>{sandbox.combatState ? `Round ${sandbox.combatState.round}` : "Pre-fight"}</div>
          </div>
          <div data-testid="selected-action-label" style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2 }}>{selectedActionLabel}</div>
          <div data-testid="selected-action-tags" style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {selectedActionTags.map((tag) => (
              <span
                key={`${selectedActionLabel}-${tag}`}
                style={{
                  borderRadius: "999px",
                  padding: "3px 6px",
                  fontSize: "8px",
                  lineHeight: 1.1,
                  background: "rgba(255,171,97,0.08)",
                  border: "1px solid rgba(255,171,97,0.18)",
                  color: "#ffe2c2",
                  fontWeight: 700,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {selectedActionSummary.slice(0, 3).map((entry) => (
              <span
                key={`${selectedActionLabel}-${entry}`}
                style={{
                  borderRadius: "999px",
                  padding: "3px 6px",
                  fontSize: "8px",
                  lineHeight: 1.1,
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e7d9c8",
                }}
              >
                {entry}
              </span>
            ))}
          </div>
          <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#d7c6b2", opacity: 0.72 }}>
            Phase: {sandbox.combatPhaseLabel}
          </div>
        </div>
      </div>
    </MiniPanel>
  );
}

function AttackTargetRoundPanel({
  sandbox,
  latestRoundSummary,
}: {
  sandbox: CombatSandboxModel;
  latestRoundSummary: string;
}) {
  return (
    <MiniPanel title="Attack Target + Round">
      <div style={{ display: "grid", gap: "10px", height: "100%", alignContent: "space-between" }}>
        <div style={{ display: "grid", gap: "9px" }}>
          <ResourceGrid resources={sandbox.playerResources} />
          <div
            style={{
              ...panelStyle,
              padding: "10px",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "8px",
              alignItems: "start",
            }}
          >
            <ZoneCircleRow
              title="Attack"
              zones={sandbox.zones}
              selectedZones={[sandbox.selectedAttackZone]}
              onSelectZone={sandbox.setSelectedAttackZone}
              activeBackground="rgba(207,106,50,0.18)"
              activeBorder="rgba(255,171,97,0.48)"
              activeColor="#ffe2c2"
              badgeBackground="rgba(255,171,97,0.14)"
              badgeColor="#ffcf9a"
              sectionBackground="linear-gradient(180deg, rgba(207,106,50,0.12), rgba(255,255,255,0.02))"
              sectionBorder="rgba(255,171,97,0.16)"
              titleColor="#ffcf9a"
              selectedTransform="translateY(-1px) scale(1.02)"
              selectedShadowTint="rgba(255,171,97,0.18)"
              selectedInnerRing="rgba(255,227,192,0.16)"
            />
            <ZoneCircleRow
              title="Block"
              zones={sandbox.zones}
              selectedZones={sandbox.selectedDefenseZones}
              onSelectZone={sandbox.toggleDefenseZone}
              multiSelect
              activeBackground="rgba(76,143,255,0.18)"
              activeBorder="rgba(122,187,255,0.48)"
              activeColor="#dcefff"
              badgeBackground="rgba(93,162,255,0.14)"
              badgeColor="#9fd0ff"
              sectionBackground="linear-gradient(180deg, rgba(76,143,255,0.12), rgba(255,255,255,0.02))"
              sectionBorder="rgba(122,187,255,0.16)"
              titleColor="#b7d5ff"
              selectedTransform="translateY(0) scale(1.01)"
              selectedShadowTint="rgba(122,187,255,0.16)"
              selectedInnerRing="rgba(215,236,255,0.18)"
            />
          </div>
        </div>
        <div style={{ display: "grid", gap: "7px" }}>
          {sandbox.canPrepareNextRound ? (
            <button
              type="button"
              aria-label="Prepare next round"
              onClick={sandbox.prepareNextRound}
              style={primaryButtonStyle}
            >
              Next Round
            </button>
          ) : (
            <button
              type="button"
              aria-label="Resolve round"
              onClick={sandbox.resolveNextRound}
              disabled={!sandbox.canResolveRound}
              className={sandbox.canResolveRound ? "combat-action-ready-pulse" : undefined}
              style={{
                ...primaryButtonStyle,
                ...(sandbox.canResolveRound ? {} : { opacity: 0.48, cursor: "not-allowed" }),
              }}
            >
              {sandbox.combatPhase === "resolving_round" ? "Resolving..." : "Resolve Round"}
            </button>
          )}
          <div data-testid="latest-round-summary" style={{ display: "none" }}>{latestRoundSummary}</div>
        </div>
      </div>
    </MiniPanel>
  );
}

function ZoneCircleRow({
  title,
  zones,
  selectedZones,
  onSelectZone,
  multiSelect = false,
  activeBackground,
  activeBorder,
  activeColor,
  badgeBackground,
  badgeColor,
  sectionBackground,
  sectionBorder,
  titleColor,
  selectedTransform,
  selectedShadowTint,
  selectedInnerRing,
}: {
  title: string;
  zones: CombatZone[];
  selectedZones: CombatZone[];
  onSelectZone: (zone: CombatZone) => void;
  multiSelect?: boolean;
  activeBackground: string;
  activeBorder: string;
  activeColor: string;
  badgeBackground: string;
  badgeColor: string;
  sectionBackground: string;
  sectionBorder: string;
  titleColor: string;
  selectedTransform: string;
  selectedShadowTint: string;
  selectedInnerRing: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "6px",
        alignContent: "start",
        borderRadius: "14px",
        padding: "8px",
        background: sectionBackground,
        border: `1px solid ${sectionBorder}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.9, color: titleColor, fontWeight: 800 }}>{title}</div>
        <div
          style={{
            borderRadius: "999px",
            padding: "2px 6px",
            fontSize: "8px",
            fontWeight: 700,
            background: badgeBackground,
            color: badgeColor,
            border: `1px solid ${activeBorder}`,
          }}
          title={multiSelect ? selectedZones.map((zone) => formatMaybeTitle(zone)).join(", ") || "None" : formatMaybeTitle(selectedZones[0] ?? "none")}
        >
          {formatZoneSelectionSummary(selectedZones, multiSelect)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "7px" }}>
        {zones.map((zone) => {
          const selected = selectedZones.includes(zone);

          return (
            <button
              key={`${title}-${zone}`}
              type="button"
              aria-label={multiSelect ? `Toggle defense zone ${zone}` : `Select attack zone ${zone}`}
              onClick={() => onSelectZone(zone)}
              title={formatMaybeTitle(zone)}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "999px",
                border: selected ? `1px solid ${activeBorder}` : "1px solid rgba(255,255,255,0.1)",
                background: selected ? activeBackground : "rgba(255,255,255,0.03)",
                color: selected ? activeColor : "#d9ccbc",
                cursor: "pointer",
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                boxShadow: selected
                  ? `0 0 18px ${selectedShadowTint}, inset 0 0 0 1px ${selectedInnerRing}`
                  : "none",
                transform: selected ? selectedTransform : "translateY(0) scale(1)",
                transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease",
                display: "grid",
                placeItems: "center",
              }}
            >
              {zone.slice(0, 2)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CombatActionsPanel({
  sandbox,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <MiniPanel title="Combat Actions">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <ActionRail
          title="Skills"
          emptyLabel=""
          countLabel={`${sandbox.equippedSkills.length}/${sandbox.maxEquippedSkills}`}
          entrySlots={sandbox.maxEquippedSkills}
          headerAction={
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                type="button"
                aria-label="Select basic attack"
                onClick={sandbox.selectBasicAction}
                style={{
                  ...buttonStyle,
                  padding: "5px 8px",
                  fontSize: "9px",
                  ...(sandbox.selectedAction.kind === "basic_attack"
                    ? {
                        border: "1px solid rgba(255,171,97,0.4)",
                        background: "linear-gradient(180deg, rgba(221,122,68,0.24), rgba(207,106,50,0.12))",
                        color: "#ffe2c2",
                      }
                    : {}),
                }}
              >
                Basic
              </button>
              {sandbox.unlockedSkills.length > 0 ? (
                <button
                  type="button"
                  aria-label="Manage equipped skills"
                  onClick={onOpenSkillLoadout}
                  style={{ ...buttonStyle, padding: "5px 8px", fontSize: "9px" }}
                >
                  Manage
                </button>
              ) : null}
            </div>
          }
          entries={sandbox.equippedSkills.map((skill) => {
            const currentValue = (sandbox.playerResources ?? { rage: 0, guard: 0, momentum: 0, focus: 0 })[skill.resourceType];
            return (
              <ActionButton
                key={skill.id}
                selected={sandbox.selectedAction.kind === "skill_attack" && sandbox.selectedAction.skillId === skill.id}
                muted={currentValue < skill.cost}
                ready={currentValue >= skill.cost}
                resourceProgress={skill.cost > 0 ? Math.min(1, currentValue / skill.cost) : 1}
                onClick={() =>
                  sandbox.setSelectedSkillAction(
                    sandbox.selectedAction.kind === "skill_attack" && sandbox.selectedAction.skillId === skill.id
                      ? null
                      : skill.id
                  )}
                label={skill.name}
                note={`${currentValue}/${skill.cost} ${skill.resourceType}`}
                description={skill.description}
                detailLines={formatSkillDetailLines(skill)}
                icon={getSkillIcon(skill.name, skill.sourceItemCode)}
                iconHint={skill.sourceItemCode}
                badge={`${skill.cost}`}
              />
            );
          })}
        />
        <ActionRail
          title="Consumables"
          emptyLabel="No consumables."
          countLabel={String(sandbox.availableConsumables.length)}
          entries={sandbox.availableConsumables.map((entry) => (
            <ActionButton
              key={entry.item.code}
              selected={sandbox.selectedAction.kind === "consumable" && sandbox.selectedAction.consumableCode === entry.item.code}
              onClick={() =>
                sandbox.setSelectedConsumableAction(
                  sandbox.selectedAction.kind === "consumable" &&
                    sandbox.selectedAction.consumableCode === entry.item.code
                    ? null
                    : entry.item.code
                )}
              label={entry.item.name}
              note={`x${entry.quantity}`}
              description={entry.item.description}
              detailLines={formatConsumableDetailLines(entry.item)}
              icon={getConsumableIcon(entry.item.name)}
            />
          ))}
        />
      </div>
    </MiniPanel>
  );
}

function BotCombatPanelSidebar({
  sandbox,
  onOpenBuildPresets,
}: {
  sandbox: CombatSandboxModel;
  onOpenBuildPresets: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
      <MiniPanel title="Utility">
        <div style={{ display: "grid", gap: "6px" }}>
          <button
            type="button"
            aria-label="Open bot build presets"
            onClick={onOpenBuildPresets}
            style={buttonStyle}
          >
            Bot Build
          </button>
          <div
            style={{
              borderRadius: "10px",
              padding: "7px 8px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: "2px",
            }}
          >
            <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#d8c7b1", opacity: 0.76 }}>
              Current Build
            </div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff3e2", lineHeight: 1.15 }}>
              {sandbox.botBuildPreset.label}
            </div>
            <div style={{ fontSize: "8px", lineHeight: 1.25, color: "#cbbba8" }}>
              {sandbox.botBuildPreset.archetype} vs {sandbox.botBuildPreset.targetFightLength}
            </div>
          </div>
        </div>
      </MiniPanel>
      <MiniPanel title="Snapshot">
        <StatGrid stats={sandbox.botSnapshot.stats} />
        <MetricGrid
          items={[
            { label: "HP", value: String(sandbox.metrics.opponentMaxHp) },
            { label: "DMG", value: String(sandbox.metrics.opponentTotalDamage), tone: "warm" },
            { label: "Armor", value: String(sandbox.metrics.opponentTotalArmor) },
            { label: "Type", value: formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType) },
          ]}
        />
      </MiniPanel>
    </div>
  );
}

function BattleLogSection({
  entries,
  playerId,
  botId,
}: {
  entries: CombatSandboxModel["battleLogEntries"];
  playerId: string;
  botId: string;
}) {
  return (
    <div style={{ ...shellStyle, padding: "16px" }}>
      <BattleLogPanel entries={entries} playerId={playerId} botId={botId} />
    </div>
  );
}

function SidePanel({
  silhouette,
  sidebar = null,
  blocks,
  overlay = null,
}: {
  silhouette: ReactNode;
  sidebar?: ReactNode;
  blocks: ReactNode[];
  overlay?: ReactNode;
}) {
  return (
    <div style={{ ...shellStyle, padding: "16px", display: "grid", gap: "10px", alignContent: "start" }}>
      <div style={{ ...panelStyle, padding: "12px", position: "relative" }}>
        <div style={sidebar ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 132px", gap: "12px", alignItems: "stretch" } : undefined}>
          {silhouette}
          {sidebar}
        </div>
        {overlay}
      </div>
      {blocks.length > 0 ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>{blocks.slice(0, 2)}</div> : null}
      {blocks.length > 2 ? blocks[2] : null}
    </div>
  );
}

function MiniPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ ...panelStyle, padding: "10px", display: "grid", gap: "7px" }}>
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.66, letterSpacing: "0.1em", color: "#d9b28b" }}>{title}</div>
      {children}
    </div>
  );
}

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

function MetricGrid({ items }: { items: Array<{ label: string; value: string; tone?: "neutral" | "warm" }> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px" }}>
      {items.map((item) => (
        <MetricChip key={`${item.label}-${item.value}`} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </div>
  );
}

function MetricChip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warm" }) {
  const palette = tone === "warm"
    ? { background: "rgba(207,106,50,0.14)", border: "rgba(214,151,94,0.32)", label: "#e6bf92", value: "#ffe2c2" }
    : { background: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.08)", label: "rgba(255,255,255,0.62)", value: "#efe6da" };

  return (
    <div style={{ borderRadius: "12px", padding: "7px 8px", background: palette.background, border: `1px solid ${palette.border}`, display: "grid", gap: "2px", textAlign: "center" }}>
      <div style={{ fontSize: "9px", textTransform: "uppercase", color: palette.label }}>{label}</div>
      <div style={{ fontSize: "10px", lineHeight: 1.2, fontWeight: 700, color: palette.value, textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}

function StatTuning({
  stats,
  unspentPoints,
  onIncrease,
  onDecrease,
}: {
  stats: Record<CharacterStatName, number>;
  unspentPoints: number;
  onIncrease: (statName: CharacterStatName) => void;
  onDecrease: (statName: CharacterStatName) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>Inline Build</div>
        <div style={{ fontSize: "8px", opacity: 0.68 }}>Pts {unspentPoints}</div>
      </div>
      {(Object.entries(stats) as Array<[CharacterStatName, number]>).map(([name, value]) => (
        <div key={name} style={{ borderRadius: "10px", padding: "4px 5px", background: statMeta[name].background, border: `1px solid ${statMeta[name].border}`, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px", alignItems: "center" }}>
          <div style={{ fontSize: "7px", fontWeight: 800, color: statMeta[name].color }}>{statMeta[name].short}</div>
          <div style={{ fontSize: "11px", fontWeight: 800, textAlign: "center" }}>{value}</div>
          <div style={{ display: "flex", gap: "2px" }}>
            <TinyButton label="-" color={statMeta[name].color} onClick={() => onDecrease(name)} />
            <TinyButton label="+" color={statMeta[name].color} onClick={() => onIncrease(name)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TinyButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ width: "14px", height: "14px", borderRadius: "999px", border: `1px solid ${color}66`, background: "rgba(255,255,255,0.07)", color, cursor: "pointer", padding: 0, fontWeight: 800, lineHeight: 1, fontSize: "8px" }}>
      {label}
    </button>
  );
}

function StatGrid({ stats }: { stats: CharacterStats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px" }}>
      {Object.entries(stats).map(([name, value]) => {
        const meta = statMeta[name as CharacterStatName];
        return (
          <div key={name} style={{ borderRadius: "10px", padding: "6px 4px", background: meta.background, border: `1px solid ${meta.border}`, textAlign: "center" }}>
            <div style={{ fontSize: "7px", opacity: 0.9, textTransform: "uppercase", color: meta.color }}>{meta.short}</div>
            <div style={{ fontWeight: 700, marginTop: "2px", fontSize: "11px" }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

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

function formatZoneSelectionSummary(selectedZones: CombatZone[], multiSelect: boolean) {
  if (selectedZones.length === 0) {
    return "None";
  }

  if (!multiSelect) {
    return formatMaybeTitle(selectedZones[0]);
  }

  const abbreviations = selectedZones.map((zone) => zone.slice(0, 2).toUpperCase());
  if (abbreviations.length <= 3) {
    return abbreviations.join(" / ");
  }

  return `${abbreviations.slice(0, 2).join(" / ")} +${abbreviations.length - 2}`;
}

function ActionRail({
  title,
  entries,
  emptyLabel,
  basicActionSelected = false,
  onSelectBasicAction,
  entrySlots = 5,
  headerAction = null,
  countLabel,
}: {
  title: string;
  entries: ReactNode[];
  emptyLabel: string;
  basicActionSelected?: boolean;
  onSelectBasicAction?: () => void;
  entrySlots?: number;
  headerAction?: ReactNode;
  countLabel?: string;
}) {
  const content = onSelectBasicAction
    ? [
        <ActionButton key="basic" selected={basicActionSelected} onClick={onSelectBasicAction} label="Basic Attack" note="No cost" />,
        ...entries,
      ]
    : entries;
  const totalSlots = entrySlots + (onSelectBasicAction ? 1 : 0);
  const visibleEntries = content.slice(0, totalSlots);
  const placeholders = Array.from({ length: Math.max(0, totalSlots - visibleEntries.length) }, (_, index) => (
    <ActionSlotPlaceholder key={`placeholder-${title}-${index}`} />
  ));

  return (
    <div style={{ ...panelStyle, padding: "8px", display: "grid", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "#efe6da", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
          {countLabel ? (
            <span
              style={{
                borderRadius: "999px",
                padding: "2px 6px",
                fontSize: "8px",
                fontWeight: 800,
                color: "#e9d9c4",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {countLabel}
            </span>
          ) : null}
        </div>
        {headerAction}
      </div>
      {content.length === 0 && emptyLabel ? (
        <div
          style={{
            fontSize: "9px",
            opacity: 0.64,
            minHeight: "32px",
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          {emptyLabel}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))`,
          gap: "6px",
          alignItems: "center",
          minHeight: "36px",
        }}
      >
        {visibleEntries}
        {placeholders}
      </div>
    </div>
  );
}

function ActionButton({
  selected,
  muted = false,
  ready = false,
  resourceProgress = 0,
  onClick,
  label,
  note,
  description,
  detailLines = [],
  icon,
  iconHint,
  badge,
}: {
  selected: boolean;
  muted?: boolean;
  ready?: boolean;
  resourceProgress?: number;
  onClick: () => void;
  label: string;
  note: string;
  description?: string;
  detailLines?: string[];
  icon?: string;
  iconHint?: string;
  badge?: string;
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const visual = getActionVisual(label, iconHint);
  const progress = Math.max(0, Math.min(1, resourceProgress));
  const showProgressRing = progress > 0 && progress < 1 && !ready;

  return (
    <div style={{ position: "relative", display: "grid", justifyItems: "center", alignItems: "center" }}>
      {showProgressRing ? (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-3px",
            borderRadius: "999px",
            background: `conic-gradient(rgba(255,193,122,0.94) 0deg, rgba(255,193,122,0.94) ${progress * 360}deg, rgba(255,255,255,0.08) ${progress * 360}deg, rgba(255,255,255,0.08) 360deg)`,
            boxShadow: "0 0 12px rgba(255,171,97,0.16)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <button
        type="button"
        aria-label={`Select ${label}`}
        onClick={onClick}
        onMouseEnter={() => setPopupOpen(true)}
        onMouseLeave={() => setPopupOpen(false)}
        onFocus={() => setPopupOpen(true)}
        onBlur={() => setPopupOpen(false)}
        className={ready && !muted ? "combat-action-ready-pulse" : undefined}
        style={{
          width: "34px",
          height: "34px",
          minWidth: 0,
          borderRadius: "999px",
          border: selected ? "1px solid rgba(255,171,97,0.68)" : `1px solid ${visual.ring}`,
          background: selected
            ? "linear-gradient(180deg, rgba(207,106,50,0.24), rgba(207,106,50,0.12))"
            : visual.buttonBackground,
          color: muted ? "rgba(255,248,237,0.56)" : "#fff8ed",
          cursor: "pointer",
          padding: "0",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          boxShadow: selected
            ? "0 10px 22px rgba(207,106,50,0.18)"
            : ready && !muted
              ? "0 0 0 1px rgba(255,194,115,0.18), 0 10px 24px rgba(255,159,98,0.12)"
              : "none",
          fontSize: "15px",
          lineHeight: 1,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span aria-hidden="true">{icon ?? "\u2022"}</span>
        {badge ? (
          <span
            style={{
              position: "absolute",
              right: "-1px",
              bottom: "-1px",
              minWidth: "15px",
              height: "15px",
              padding: "0 3px",
              borderRadius: "999px",
              display: "grid",
              placeItems: "center",
              background: muted ? "rgba(102,87,73,0.94)" : "linear-gradient(180deg, rgba(255,193,122,0.96), rgba(214,129,63,0.96))",
              border: muted ? "1px solid rgba(196,175,155,0.26)" : "1px solid rgba(255,232,201,0.48)",
              color: muted ? "#e3d3c3" : "#2b1308",
              fontSize: "8px",
              fontWeight: 900,
              boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>
      {popupOpen ? (
        <div
          style={{
            position: "absolute",
            zIndex: 5,
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "230px",
            borderRadius: "16px",
            border: `1px solid ${visual.ring}`,
            background: "rgba(18,16,15,0.98)",
            boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
            padding: "11px",
            display: "grid",
            gap: "9px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff4e7", lineHeight: 1.15 }}>{label}</div>
            {badge ? (
              <div
                style={{
                  borderRadius: "999px",
                  padding: "5px 8px",
                  background: "linear-gradient(180deg, rgba(255,200,132,0.22), rgba(214,129,63,0.12))",
                  border: "1px solid rgba(255,200,132,0.36)",
                  color: "#ffd9b1",
                  fontSize: "10px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                Cost {badge}
              </div>
            ) : null}
          </div>
          <div
            style={{
              minHeight: "112px",
              borderRadius: "14px",
              border: `1px solid ${visual.ring}`,
              background: visual.cardBackground,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "12px",
                borderRadius: "999px",
                background: visual.halo,
                filter: "blur(8px)",
                opacity: 0.85,
              }}
            />
            <div style={{ position: "relative", fontSize: "42px", lineHeight: 1 }}>{icon ?? "\u2022"}</div>
          </div>
          {description ? <div style={{ fontSize: "10px", lineHeight: 1.35, color: "#d7cbbc" }}>{description}</div> : null}
          {detailLines.length > 0 ? (
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
              {detailLines.map((line) => (
                <div
                  key={`${label}-${line}`}
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
                    {splitDetailLine(line).label}
                  </div>
                  <div style={{ fontSize: "8px", color: "#f4e8d9", lineHeight: 1.28, fontWeight: 700 }}>
                    {splitDetailLine(line).value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ fontSize: "9px", color: "#c4b8aa" }}>{note}</div>
        </div>
      ) : null}
    </div>
  );
}

function ActionSlotPlaceholder() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "32px",
        height: "32px",
        justifySelf: "center",
        borderRadius: "999px",
        border: "1px dashed rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    />
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

function getSkillIcon(skillName: string, iconHint?: string) {
  const normalizedName = skillName.toLowerCase();
  const normalizedHint = (iconHint ?? "").toLowerCase();

  if (normalizedHint.includes("shield") || normalizedName.includes("shield")) {
    return "\uD83D\uDEE1";
  }

  if (normalizedHint.includes("helmet") || normalizedHint.includes("cap") || normalizedName.includes("head")) {
    return "\uD83E\uDE96";
  }

  if (normalizedHint.includes("armor") || normalizedHint.includes("vest") || normalizedHint.includes("jacket")) {
    return "\uD83E\uDDBA";
  }

  if (normalizedHint.includes("glove") || normalizedHint.includes("gauntlet") || normalizedName.includes("grip")) {
    return "\uD83E\uDDE4";
  }

  if (normalizedHint.includes("boot") || normalizedName.includes("step") || normalizedName.includes("kick")) {
    return "\uD83E\uDD7E";
  }

  if (
    normalizedHint.includes("ring") ||
    normalizedHint.includes("charm") ||
    normalizedHint.includes("earring") ||
    normalizedHint.includes("medallion") ||
    normalizedHint.includes("accessory")
  ) {
    return "\uD83D\uDC8D";
  }

  if (normalizedHint.includes("dagger") || normalizedName.includes("pierc") || normalizedName.includes("lunge")) {
    return "\uD83D\uDDE1";
  }

  if (normalizedHint.includes("axe") || normalizedName.includes("cleave")) {
    return "\uD83E\uDE93";
  }

  if (normalizedHint.includes("mace") || normalizedHint.includes("hammer") || normalizedName.includes("bash")) {
    return "\uD83D\uDD28";
  }

  if (normalizedHint.includes("sword") || normalizedName.includes("slash")) {
    return "\u2694";
  }

  if (normalizedName.includes("shield")) {
    return "\uD83D\uDEE1";
  }

  if (normalizedName.includes("pierc") || normalizedName.includes("lunge") || normalizedName.includes("dagger")) {
    return "\uD83D\uDDE1";
  }

  if (normalizedName.includes("cleave") || normalizedName.includes("slash") || normalizedName.includes("sword")) {
    return "\u2694";
  }

  return "\u2726";
}

function getConsumableIcon(itemName: string) {
  const normalizedName = itemName.toLowerCase();

  if (normalizedName.includes("potion")) {
    return "\uD83E\uDDEA";
  }

  if (normalizedName.includes("bandage")) {
    return "\uD83E\uDE79";
  }

  return "\u25C9";
}


function getActionVisual(label: string, iconHint?: string) {
  const normalized = label.toLowerCase();
  const normalizedHint = (iconHint ?? "").toLowerCase();

  if (normalized.includes("potion") || normalized.includes("elixir")) {
    return {
      ring: "rgba(93, 197, 177, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(67,142,126,0.22), rgba(24,53,49,0.3))",
      innerBackground:
        "radial-gradient(circle at 30% 25%, rgba(180,255,238,0.26), transparent 42%), linear-gradient(180deg, rgba(42,94,84,0.62), rgba(18,36,33,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(107,233,212,0.24), transparent 40%), linear-gradient(180deg, rgba(17,44,40,0.98), rgba(8,18,17,0.98))",
      halo: "radial-gradient(circle, rgba(94,233,209,0.42), rgba(94,233,209,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("bandage")) {
    return {
      ring: "rgba(234, 208, 153, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(166,136,79,0.18), rgba(49,39,21,0.28))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,241,202,0.24), transparent 40%), linear-gradient(180deg, rgba(96,73,35,0.54), rgba(34,26,15,0.92))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(255,224,162,0.18), transparent 40%), linear-gradient(180deg, rgba(48,34,20,0.98), rgba(21,15,10,0.98))",
      halo: "radial-gradient(circle, rgba(255,227,175,0.32), rgba(255,227,175,0.06) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("shield") || normalized.includes("guard")) {
    return {
      ring: "rgba(117, 176, 255, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(73,112,171,0.2), rgba(22,34,55,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(212,235,255,0.24), transparent 40%), linear-gradient(180deg, rgba(42,65,103,0.62), rgba(17,27,46,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(111,173,255,0.22), transparent 40%), linear-gradient(180deg, rgba(17,29,49,0.98), rgba(9,16,28,0.98))",
      halo: "radial-gradient(circle, rgba(120,180,255,0.34), rgba(120,180,255,0.08) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("helmet") || normalizedHint.includes("cap")) {
    return {
      ring: "rgba(218, 187, 118, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(167,132,65,0.2), rgba(56,40,17,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,239,197,0.24), transparent 40%), linear-gradient(180deg, rgba(122,94,42,0.62), rgba(42,28,11,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(232,197,116,0.2), transparent 40%), linear-gradient(180deg, rgba(52,38,18,0.98), rgba(24,16,8,0.98))",
      halo: "radial-gradient(circle, rgba(241,206,123,0.32), rgba(241,206,123,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("armor") || normalizedHint.includes("vest") || normalizedHint.includes("jacket")) {
    return {
      ring: "rgba(176, 126, 96, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(130,86,58,0.22), rgba(49,28,19,0.34))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(248,212,193,0.2), transparent 40%), linear-gradient(180deg, rgba(96,59,40,0.62), rgba(34,19,12,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(223,164,126,0.2), transparent 40%), linear-gradient(180deg, rgba(49,28,21,0.98), rgba(19,11,8,0.98))",
      halo: "radial-gradient(circle, rgba(229,168,128,0.3), rgba(229,168,128,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("glove") || normalizedHint.includes("gauntlet")) {
    return {
      ring: "rgba(134, 181, 144, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(79,125,93,0.2), rgba(25,42,31,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(208,241,215,0.22), transparent 40%), linear-gradient(180deg, rgba(51,86,60,0.62), rgba(18,31,21,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(142,216,157,0.2), transparent 40%), linear-gradient(180deg, rgba(19,39,23,0.98), rgba(10,20,12,0.98))",
      halo: "radial-gradient(circle, rgba(147,227,163,0.3), rgba(147,227,163,0.06) 58%, transparent 78%)",
    };
  }

  if (normalizedHint.includes("boot")) {
    return {
      ring: "rgba(126, 171, 222, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(67,108,154,0.2), rgba(20,33,52,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(208,229,255,0.22), transparent 40%), linear-gradient(180deg, rgba(42,71,108,0.62), rgba(14,24,40,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(136,185,255,0.2), transparent 40%), linear-gradient(180deg, rgba(17,29,47,0.98), rgba(8,14,24,0.98))",
      halo: "radial-gradient(circle, rgba(141,193,255,0.3), rgba(141,193,255,0.06) 58%, transparent 78%)",
    };
  }

  if (
    normalizedHint.includes("ring") ||
    normalizedHint.includes("charm") ||
    normalizedHint.includes("earring") ||
    normalizedHint.includes("medallion") ||
    normalizedHint.includes("accessory")
  ) {
    return {
      ring: "rgba(194, 126, 212, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(133,78,161,0.2), rgba(40,21,53,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(245,214,255,0.22), transparent 40%), linear-gradient(180deg, rgba(89,50,108,0.62), rgba(28,14,37,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(218,155,255,0.18), transparent 40%), linear-gradient(180deg, rgba(42,22,54,0.98), rgba(17,9,23,0.98))",
      halo: "radial-gradient(circle, rgba(220,160,255,0.3), rgba(220,160,255,0.06) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("slash") || normalized.includes("sword") || normalized.includes("cleave")) {
    return {
      ring: "rgba(224, 130, 91, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(173,85,52,0.2), rgba(54,25,18,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,217,192,0.22), transparent 40%), linear-gradient(180deg, rgba(112,51,35,0.62), rgba(38,17,11,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(235,143,105,0.22), transparent 40%), linear-gradient(180deg, rgba(50,23,17,0.98), rgba(22,10,8,0.98))",
      halo: "radial-gradient(circle, rgba(236,146,108,0.36), rgba(236,146,108,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("pierc") || normalized.includes("lunge") || normalized.includes("dagger")) {
    return {
      ring: "rgba(180, 140, 233, 0.22)",
      buttonBackground: "linear-gradient(180deg, rgba(112,82,164,0.18), rgba(33,22,53,0.3))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(232,215,255,0.22), transparent 40%), linear-gradient(180deg, rgba(72,49,110,0.62), rgba(25,16,42,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(195,154,255,0.18), transparent 40%), linear-gradient(180deg, rgba(38,24,59,0.98), rgba(19,11,30,0.98))",
      halo: "radial-gradient(circle, rgba(197,158,255,0.3), rgba(197,158,255,0.06) 58%, transparent 78%)",
    };
  }

  return {
    ring: "rgba(255,255,255,0.12)",
    buttonBackground: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    innerBackground:
      "radial-gradient(circle at 32% 25%, rgba(255,255,255,0.14), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    cardBackground:
      "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(180deg, rgba(29,26,24,0.98), rgba(14,12,11,0.98))",
    halo: "radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 58%, transparent 78%)",
  };
}

function formatMaybeTitle(value: string | null) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "None";
}

type CombatRuleEffectSummary = {
  name: string;
  kind: "buff" | "debuff";
  target: "self" | "target";
  durationTurns: number;
  trigger?: "on_use" | "on_hit";
  modifiers?: Partial<{
    critChanceBonus: number;
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    blockPowerBonus: number;
    outgoingDamagePercent: number;
    incomingDamagePercent: number;
    armorFlatBonus: ArmorProfile;
    damageFlatBonus: DamageProfile;
    armorPenetrationPercentBonus: DamageProfile;
  }>;
  periodic?: Partial<{
    heal: number;
    damage: number;
    resourceDelta: Partial<{ rage: number; guard: number; momentum: number; focus: number }>;
  }>;
};

function formatSkillDetailLines(skill: {
  damageMultiplier: number;
  critChanceBonus: number;
  armorPenetrationPercentBonus: DamageProfile;
  effects?: CombatRuleEffectSummary[];
} | null) {
  if (!skill) {
    return [];
  }

  const lines = [`Damage: x${skill.damageMultiplier.toFixed(2)} weapon damage.`];

  if (skill.critChanceBonus > 0) {
    lines.push(`Crit: Adds +${skill.critChanceBonus}% crit chance.`);
  }

  lines.push(
    ...(skill.effects ?? []).map(
      (effect) => `${effect.trigger === "on_hit" ? "On Hit" : "Apply"}: ${formatEffectSummary(effect)}`
    )
  );

  return [...lines, ...formatDamageProfileBonuses(skill.armorPenetrationPercentBonus, "Pen").map((entry) => `Pen: ${entry}.`)];
}

function formatConsumableDetailLines(item: {
  consumableEffect?: {
    usageMode: "replace_attack" | "with_attack";
    heal: number;
    resourceRestore: Partial<{ rage: number; guard: number; momentum: number; focus: number }>;
    effects?: Array<CombatRuleEffectSummary>;
  } | null;
} | null) {
  const effect = item?.consumableEffect;

  if (!effect) {
    return [];
  }

  const lines: string[] = [];
  lines.push(`Usage: ${formatConsumableUsageLabel(effect.usageMode)}.`);

  if (effect.heal > 0) {
    lines.push(`Heal: Restores ${effect.heal} HP.`);
  }

  lines.push(
    ...Object.entries(effect.resourceRestore)
      .filter(([, value]) => (value ?? 0) > 0)
      .map(([resource, value]) => `Restore: +${value} ${formatResourceLabel(resource)}.`)
  );

  lines.push(
    ...(effect.effects ?? []).map((entry) => `Apply: ${formatEffectSummary(entry)}`)
  );

  if (lines.length === 1) {
    lines.push("Effect: No healing, restore, or status effect.");
  }

  return lines;
}

function formatEffectSummary(effect: CombatRuleEffectSummary) {
  const parts: string[] = [];
  const who = effect.target === "self" ? "Self" : "Target";
  const role = effect.kind === "buff" ? "buff" : "debuff";

  parts.push(`${effect.name} on ${who.toLowerCase()}, ${role}, ${effect.durationTurns}t.`);

  if (effect.modifiers?.critChanceBonus) {
    parts.push(`Crit ${formatSignedValue(effect.modifiers.critChanceBonus)}%.`);
  }
  if (effect.modifiers?.dodgeChanceBonus) {
    parts.push(`Dodge ${formatSignedValue(effect.modifiers.dodgeChanceBonus)}%.`);
  }
  if (effect.modifiers?.blockChanceBonus) {
    parts.push(`Block ${formatSignedValue(effect.modifiers.blockChanceBonus)}%.`);
  }
  if (effect.modifiers?.blockPowerBonus) {
    parts.push(`Block power ${formatSignedValue(effect.modifiers.blockPowerBonus)}%.`);
  }
  if (effect.modifiers?.outgoingDamagePercent) {
    parts.push(`Outgoing damage ${formatSignedValue(effect.modifiers.outgoingDamagePercent)}%.`);
  }
  if (effect.modifiers?.incomingDamagePercent) {
    parts.push(`Incoming damage ${formatSignedValue(effect.modifiers.incomingDamagePercent)}%.`);
  }

  const damageBonus = formatProfileEntries(effect.modifiers?.damageFlatBonus);
  if (damageBonus) {
    parts.push(`Damage ${damageBonus}.`);
  }
  const armorBonus = formatProfileEntries(effect.modifiers?.armorFlatBonus);
  if (armorBonus) {
    parts.push(`Armor ${armorBonus}.`);
  }
  const penBonus = formatProfileEntries(effect.modifiers?.armorPenetrationPercentBonus, "%");
  if (penBonus) {
    parts.push(`Pen ${penBonus}.`);
  }
  if (effect.periodic?.heal) {
    parts.push(`Heals ${effect.periodic.heal} HP each turn.`);
  }
  if (effect.periodic?.damage) {
    parts.push(`Deals ${effect.periodic.damage} HP each turn.`);
  }

  const resourceDelta = formatResourceDelta(effect.periodic?.resourceDelta);
  if (resourceDelta) {
    parts.push(resourceDelta);
  }

  return parts.join(" ");
}

function formatDamageProfileBonuses(profile: DamageProfile, suffix: string) {
  return (Object.entries(profile) as Array<[keyof DamageProfile, number]>)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => `${formatMaybeTitle(type)} ${suffix} +${value}%`);
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatProfileEntries(
  profile: Partial<Record<keyof DamageProfile, number>> | Partial<Record<keyof ArmorProfile, number>> | undefined,
  suffix = ""
) {
  if (!profile) {
    return "";
  }

  return Object.entries(profile)
    .filter(([, value]) => value && value !== 0)
    .map(([type, value]) => `${formatMaybeTitle(type)} ${formatSignedValue(Number(value))}${suffix}`)
    .join(" | ");
}

function formatResourceDelta(resourceDelta: Partial<{ rage: number; guard: number; momentum: number; focus: number }> | undefined) {
  if (!resourceDelta) {
    return "";
  }

  return Object.entries(resourceDelta)
    .filter(([, value]) => value && value !== 0)
    .map(([resource, value]) => `${formatResourceLabel(resource)} ${formatSignedValue(Number(value))} each turn.`)
    .join(" ");
}

function splitDetailLine(line: string) {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return { label: "Info", value: line };
  }

  return {
    label: line.slice(0, separatorIndex).trim(),
    value: line.slice(separatorIndex + 1).trim(),
  };
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

function formatResourceLabel(resource: string) {
  switch (resource) {
    case "momentum":
      return "Momentum";
    case "focus":
      return "Focus";
    case "guard":
      return "Guard";
    case "rage":
      return "Rage";
    default:
      return resource;
  }
}

function formatConsumableUsageLabel(usageMode: "replace_attack" | "with_attack") {
  switch (usageMode) {
    case "replace_attack":
      return "Separate Action";
    case "with_attack":
      return "With Attack";
  }
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

function resolveImpactVariant(result: CombatSandboxModel["playerIncomingResult"]) {
  if (!result) {
    return "hit" as const;
  }

  if (result.dodged) {
    return "dodge" as const;
  }

  if (result.blocked && result.finalDamage > 0) {
    return "block_break" as const;
  }

  if (result.blocked && result.finalDamage <= 0) {
    return "block" as const;
  }

  if (result.crit) {
    return "crit" as const;
  }

  if (result.blocked) {
    return "block" as const;
  }

  return "hit" as const;
}

function resolveImpactValue(result: CombatSandboxModel["playerIncomingResult"]) {
  if (!result) {
    return null;
  }

  return result.finalDamage > 0 ? result.finalDamage : null;
}

function useCombatImpactPulse(result: CombatSandboxModel["playerIncomingResult"]) {
  const [event, setEvent] = useState<null | { key: string; variant: ReturnType<typeof resolveImpactVariant>; value: number | null }>(
    null
  );
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const rawKey =
      result && (result.finalDamage > 0 || result.blocked || result.dodged)
        ? `${result.timestamp}-${result.attackerId}-${result.finalDamage}-${result.type}-${result.crit ? "crit" : "normal"}-${result.blocked ? "block" : "open"}-${result.dodged ? "dodge" : "land"}`
        : null;

    if (!rawKey) {
      debugCombatImpact("skip", { reason: "no-impact", result });
      return;
    }

    if (lastKeyRef.current === rawKey) {
      debugCombatImpact("skip", { reason: "duplicate-key", key: rawKey, result });
      return;
    }

    lastKeyRef.current = rawKey;
    const nextEvent = {
      key: rawKey,
      variant: resolveImpactVariant(result),
      value: resolveImpactValue(result),
    };

    debugCombatImpact("emit", nextEvent);
    setEvent(nextEvent);

    const timeoutId = window.setTimeout(() => {
      setEvent((current) => {
        if (current?.key === rawKey) {
          debugCombatImpact("clear", { key: rawKey });
          return null;
        }

        return current;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [result]);

  return event;
}

function debugCombatImpact(stage: "emit" | "clear" | "skip", payload: unknown) {
  if (!isCombatImpactDebugEnabled()) {
    return;
  }

  console.debug("[combat-impact]", stage, payload);
}

function isCombatImpactDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const debugFlag = (window as Window & { __FIGHT_CLUB_DEBUG_IMPACTS__?: unknown }).__FIGHT_CLUB_DEBUG_IMPACTS__;

  if (debugFlag === true) {
    return true;
  }

  try {
    return window.localStorage.getItem("fight-club-debug-impacts") === "true";
  } catch {
    return false;
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
    { label: "Damage", value: String(input.totalDamage), helper: "Current total damage after weapon, stat and gear bonuses." },
    { label: "Armor", value: String(input.totalArmor), helper: "Total armor across all damage types." },
    { label: "Dodge", value: `${totalDodge}%`, helper: `Base ${baseDodgeChance(input.stats.agility)}% + bonuses ${input.dodgeBonus}%.` },
    { label: "Crit Chance", value: `${totalCrit}%`, helper: `Base ${baseCritChance(input.stats.rage)}% + bonuses ${input.critBonus}%.` },
    { label: "Anti-Dodge", value: `${antiDodge}%`, helper: "How much enemy dodge is suppressed by your agility." },
    { label: "Anti-Crit", value: `${antiCrit}%`, helper: "How much enemy crit chance is suppressed by your rage." },
    { label: "Crit Damage", value: `x${input.totalCritMultiplier.toFixed(2)}`, helper: "Base multiplier plus endurance and gear bonuses." },
    { label: "Block Penetration", value: `${input.baseBlockPenetrationValue}%`, helper: "Base pressure through guarded hits from strength." },
    { label: "Armor Pen", value: `${totalArmorPenetration}%`, helper: "Combined item-based armor penetration profile." },
  ];
}

function formatIdLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

