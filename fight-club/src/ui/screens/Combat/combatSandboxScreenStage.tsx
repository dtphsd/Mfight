import type { CSSProperties } from "react";
import type { CharacterStatName } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { FightSetupPanel } from "./combatSandboxScreenSetup";
import { BotCombatPanel, PlayerCombatPanel } from "./combatSandboxScreenPanels";

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function CombatSandboxStage({
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
  shellStyle,
  panelStyle,
  buttonStyle,
  primaryButtonStyle,
  deferredOverlayFallbackStyle,
  statMeta,
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
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
  deferredOverlayFallbackStyle: CSSProperties;
  statMeta: Record<CharacterStatName, { short: string; color: string; background: string; border: string }>;
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
          shellStyle={shellStyle}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          primaryButtonStyle={primaryButtonStyle}
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
