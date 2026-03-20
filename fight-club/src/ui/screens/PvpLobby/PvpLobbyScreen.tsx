import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { CharacterStatName } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import { createProfileMailboxes, createProfileMeta } from "@/modules/profile";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { PlayerCombatPanel } from "@/ui/screens/Combat/combatSandboxScreenPanels";
import {
  preloadCombatSandboxOverlays,
  CombatSandboxOverlays,
} from "@/ui/screens/Combat/combatSandboxScreenOverlays";
import { resolvePresetFigure } from "@/ui/screens/Combat/combatSandboxScreenDerived";
import type { PvpPreparedFighter } from "./pvpLobbyTypes";

interface PvpLobbyScreenProps {
  playerName?: string;
  onPlayerNameChange?: (value: string) => void;
  onBack: () => void;
  onCreateMatch: (fighter: PvpPreparedFighter) => void;
  onJoinMatch: (fighter: PvpPreparedFighter, roomCode: string) => void;
  onMatchmaking: (fighter: PvpPreparedFighter) => void;
}

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

const mutedButtonStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.58,
  cursor: "not-allowed",
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

const statMeta: Record<
  CharacterStatName,
  { short: string; color: string; background: string; border: string }
> = {
  strength: {
    short: "STR",
    color: "#f0a286",
    background: "rgba(229,115,79,0.14)",
    border: "rgba(229,115,79,0.28)",
  },
  agility: {
    short: "AGI",
    color: "#87e2cf",
    background: "rgba(92,199,178,0.14)",
    border: "rgba(92,199,178,0.28)",
  },
  rage: {
    short: "RAG",
    color: "#ee9abb",
    background: "rgba(216,93,145,0.14)",
    border: "rgba(216,93,145,0.28)",
  },
  endurance: {
    short: "END",
    color: "#ebcf8b",
    background: "rgba(214,177,95,0.14)",
    border: "rgba(214,177,95,0.28)",
  },
};

export function PvpLobbyScreen({
  playerName = "Player",
  onPlayerNameChange = () => {},
  onBack,
  onCreateMatch,
  onJoinMatch,
  onMatchmaking,
}: PvpLobbyScreenProps) {
  const sandbox = useCombatSandbox();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [buildPresetsOpen, setBuildPresetsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState<"player" | "bot" | null>(null);
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<EquipmentSlot | null>(null);
  const [playerFigure, setPlayerFigure] = useState<CombatFigureId>("rush-chip");
  const [joinCode, setJoinCode] = useState("");
  const [playerProfile, setPlayerProfile] = useState(() => createProfileMeta({ side: "player" }));
  const [botProfile, setBotProfile] = useState(() => createProfileMeta({ side: "bot" }));
  const [mailboxes, setMailboxes] = useState(() =>
    createProfileMailboxes({
      playerName,
      botName: "PvP Rival",
    })
  );

  useEffect(() => {
    void preloadCombatSandboxOverlays();
  }, []);

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

  const buildConfigured =
    Object.values(sandbox.playerAllocations).some((value) => value > 0) ||
    sandbox.equippedItems.some((entry) => entry.item) ||
    sandbox.equippedSkillIds.length > 0;

  const joinCodeReady = buildConfigured || sandbox.equippedItems.some((entry) => entry.item);
  const preparedFighter: PvpPreparedFighter = {
    snapshot: sandbox.playerSnapshot,
    figure: playerFigure,
    playerName,
    equipment: playerEquipment,
    equipmentState: sandbox.equipment,
    inventory: sandbox.inventory,
    equippedSkillIds: sandbox.equippedSkillIds,
  };

  return (
    <section data-testid="pvp-lobby-screen" style={{ display: "grid", gap: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255,210,168,0.72)",
            }}
          >
            PvP
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: "32px" }}>Pre-Match Lobby</h1>
          <p style={{ margin: "10px 0 0", maxWidth: 780, color: "rgba(255,244,231,0.72)", lineHeight: 1.6 }}>
            Build your fighter on the left with the same silhouette, builder, builds, and inventory flow as the bot
            mode. When you are happy with the setup, enter a match from the right side and continue into PvP combat.
          </p>
        </div>
        <button type="button" style={{ ...buttonStyle, padding: "12px 16px" }} onClick={onBack}>
          Back to Menu
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.18fr) minmax(320px, 0.82fr)",
          gap: "18px",
          alignItems: "start",
        }}
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
          onOpenBuilder={() => setBuilderOpen(true)}
          onOpenBuildPresets={() => setBuildPresetsOpen(true)}
          onOpenInventory={() => setInventoryOpen(true)}
          onOpenProfile={() => setProfileTarget("player")}
          onSelectEquipmentSlot={setSelectedEquipmentSlot}
          onCloseEquipmentSlot={() => setSelectedEquipmentSlot(null)}
        />

        <article style={{ ...shellStyle, padding: "16px", display: "grid", gap: "12px", alignContent: "start" }}>
          <div style={{ ...panelStyle, padding: "14px", display: "grid", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "rgba(255,210,168,0.72)",
                }}
              >
                Match Entry
              </span>
              <span
                style={{
                  borderRadius: "999px",
                  padding: "6px 12px",
                  border: "1px solid rgba(135,217,255,0.28)",
                  background: "rgba(41,81,101,0.24)",
                  color: "rgba(210,241,255,0.92)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Live flow
              </span>
            </div>
            <p style={{ margin: 0, color: "rgba(255,244,231,0.7)", lineHeight: 1.6 }}>
              Create a match, join one by code, or jump into matchmaking. This screen prepares your fighter and launches
              the real PvP match flow.
            </p>
          </div>

          <div style={{ ...panelStyle, padding: "16px", display: "grid", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "rgba(255,210,168,0.72)",
                }}
              >
                Enter Battle
              </span>
              <span
                style={{
                  borderRadius: "999px",
                  padding: "6px 12px",
                  border: "1px solid rgba(102,224,138,0.28)",
                  background: "rgba(34,77,50,0.24)",
                  color: "rgba(223,255,230,0.92)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Build ready
              </span>
            </div>
            <button type="button" style={primaryButtonStyle} onClick={() => onCreateMatch(preparedFighter)}>
              Create Match
            </button>
            <label
              style={{
                display: "grid",
                gap: "6px",
                color: "rgba(255,244,231,0.72)",
                fontSize: "12px",
              }}
            >
              Room Code
              <input
                aria-label="PvP lobby room code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(7,10,18,0.78)",
                  color: "rgba(255,244,231,0.94)",
                  padding: "10px 12px",
                  fontSize: "14px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  outline: "none",
                }}
              />
            </label>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => onJoinMatch(preparedFighter, joinCode.trim().toUpperCase())}
              disabled={!joinCode.trim()}
            >
              Join by Code
            </button>
            <button type="button" style={mutedButtonStyle} disabled aria-label="Ready inside room only">
              Ready
            </button>
            <button type="button" style={buttonStyle} onClick={() => onMatchmaking(preparedFighter)}>
              Matchmaking
            </button>
          </div>

          <div style={{ ...panelStyle, padding: "16px", display: "grid", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "rgba(255,210,168,0.72)",
                }}
              >
                Status
              </span>
              <span
                style={{
                  borderRadius: "999px",
                  padding: "6px 12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#efe6da",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {joinCodeReady ? "Configured" : "Starter loadout"}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "#fff4eb", lineHeight: 1.5 }}>
              Your build is prepared in the same player panel used by the normal combat mode. The next screen should
              only handle match entry and then pass into live combat.
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,244,231,0.68)", lineHeight: 1.55 }}>
              Ready becomes active after you enter a match. Matchmaking now searches for another prepared fighter
              automatically.
            </div>
          </div>
        </article>
      </div>

      <CombatSandboxOverlays
        sandbox={sandbox}
        buttonStyle={buttonStyle}
        panelStyle={panelStyle}
        buildPresetsOpen={buildPresetsOpen}
        botBuildPresetsOpen={false}
        builderOpen={builderOpen}
        skillLoadoutOpen={false}
        inventoryOpen={inventoryOpen}
        profileTarget={profileTarget}
        playerName={playerName}
        playerFigure={playerFigure}
        botFigure={resolvePresetFigure(sandbox.botBuildPresetId, "vermin-tek")}
        playerEquipment={playerEquipment}
        botEquipment={botEquipment}
        playerProfile={playerProfile}
        botProfile={botProfile}
        mailboxes={mailboxes}
        onPlayerNameChange={onPlayerNameChange}
        onCloseBuildPresets={() => setBuildPresetsOpen(false)}
        onCloseBotBuildPresets={() => {}}
        onCloseBuilder={() => setBuilderOpen(false)}
        onOpenBuildPresets={() => setBuildPresetsOpen(true)}
        onCloseSkillLoadout={() => {}}
        onCloseInventory={() => setInventoryOpen(false)}
        onCloseProfile={() => setProfileTarget(null)}
        onSetPlayerFigure={setPlayerFigure}
        onSetPlayerProfile={setPlayerProfile}
        onSetMailboxes={setMailboxes}
      />
    </section>
  );
}
