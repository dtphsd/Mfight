import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CharacterStatName } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import {
  addProfileBattleResult,
  createProfileMailboxes,
  createProfileMeta,
} from "@/modules/profile";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { BattleLogSection } from "./combatSandboxScreenLayout";
import { resolvePresetFigure } from "./combatSandboxScreenDerived";
import { preloadCombatSandboxOverlays, CombatSandboxOverlays } from "./combatSandboxScreenOverlays";
import { CombatSandboxStage } from "./combatSandboxScreenStage";
import { resolveSelectedActionLabel, resolveSelectedActionSummary, resolveSelectedActionTags } from "./combatSandboxScreenState";

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
    void preloadCombatSandboxOverlays();
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
        shellStyle={shellStyle}
        panelStyle={panelStyle}
        buttonStyle={buttonStyle}
        primaryButtonStyle={primaryButtonStyle}
        deferredOverlayFallbackStyle={deferredOverlayFallbackStyle}
        statMeta={statMeta}
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
        buttonStyle={buttonStyle}
        panelStyle={panelStyle}
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
