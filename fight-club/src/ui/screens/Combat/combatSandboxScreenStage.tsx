import type { CSSProperties } from "react";
import type { CharacterStatName } from "@/modules/character";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { createSandboxCombatPresentationModel } from "./combatPresentationAdapters";
import { CombatPresentationShell } from "./combatPresentationShell";
import { FightSetupPanel, buildSandboxRoundRevealModel } from "./combatSandboxScreenSetup";
import { BotCombatPanel, PlayerCombatPanel } from "./combatSandboxScreenPanels";
import { CombatRoundReveal } from "./combatRoundReveal";

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
  const presentation = createSandboxCombatPresentationModel({
    player: {
      name: playerName,
      figure: playerFigure,
      currentHp: sandbox.playerCombatant?.currentHp ?? sandbox.playerSnapshot.maxHp,
      maxHp: sandbox.playerCombatant?.maxHp ?? sandbox.playerSnapshot.maxHp,
      equipment: playerEquipment,
      activeEffects: sandbox.playerCombatant?.activeEffects ?? [],
      derivedStats: [],
      badges: [],
      winner: outcomeWinner === "player",
      loser: outcomeWinner === "bot",
    },
    rival: {
      name: "Arena Bot",
      figure: botFigure,
      currentHp: sandbox.botCombatant?.currentHp ?? sandbox.botSnapshot.maxHp,
      maxHp: sandbox.botCombatant?.maxHp ?? sandbox.botSnapshot.maxHp,
      equipment: botEquipment,
      activeEffects: sandbox.botCombatant?.activeEffects ?? [],
      derivedStats: [],
      badges: [],
      resources: sandbox.botResources,
      winner: outcomeWinner === "bot",
      loser: outcomeWinner === "player",
    },
    controls: {
      currentActionLabel: selectedActionLabel,
      currentActionTags: selectedActionTags,
      currentActionSummary: selectedActionSummary,
      phaseLabel: sandbox.combatPhaseLabel,
      round: sandbox.combatState?.round ?? null,
      latestRoundSummary,
      primaryActionLabel: sandbox.combatPhase === "finished" ? "Restart Fight" : "Start Fight",
      canPrimaryAction: sandbox.canStartFight,
    },
  });
  const sandboxRoundReveal = buildSandboxRoundRevealModel({
    combatPhase: sandbox.combatPhase,
    latestRoundSummary: presentation.controls.latestRoundSummary,
  });

  return (
    <CombatPresentationShell
      shellStyle={shellStyle}
      overlay={
        deathFinisher ? (
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
        ) : null
      }
      leftState={outcomeWinner === "player" ? "winner" : outcomeWinner === "bot" ? "loser" : null}
      rightState={outcomeWinner === "bot" ? "winner" : outcomeWinner === "player" ? "loser" : null}
      resultReveal={
        outcomeWinner
          ? {
              eyebrow: "Fight Result",
              title: outcomeWinner === "player" ? "Victory" : "Defeat",
              subtitle:
                outcomeWinner === "player"
                  ? "Arena Bot goes down. Tune your build or queue the next test."
                  : "Arena Bot takes the duel. Rework the setup and try another round.",
              tone: outcomeWinner === "player" ? "victory" : "defeat",
            }
          : null
      }
      left={
          <PlayerCombatPanel
            sandbox={sandbox}
            playerName={presentation.player.name}
            playerFigure={presentation.player.figure as CombatFigureId}
            buildConfigured={buildConfigured}
            equipment={presentation.player.equipment}
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
            silhouetteState={presentation.player.winner ? "victory" : presentation.player.loser ? "defeat" : null}
            lowerAction={
              <CombatRoundReveal
                title={sandboxRoundReveal.title}
                tone={sandboxRoundReveal.tone}
                entries={sandbox.latestRoundEntries.map((entry) => ({
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
                }))}
              />
            }
          />
      }
      center={
        <FightSetupPanel
          sandbox={sandbox}
          shellStyle={shellStyle}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          primaryButtonStyle={primaryButtonStyle}
          selectedActionLabel={presentation.controls.currentActionLabel}
          selectedActionTags={presentation.controls.currentActionTags}
          selectedActionSummary={presentation.controls.currentActionSummary}
          latestRoundSummary={presentation.controls.latestRoundSummary}
          onOpenSkillLoadout={onOpenSkillLoadout}
        />
      }
      right={
          <BotCombatPanel
            sandbox={sandbox}
            botFigure={presentation.rival.figure as CombatFigureId}
            equipment={presentation.rival.equipment}
            shellStyle={shellStyle}
            panelStyle={panelStyle}
            buttonStyle={buttonStyle}
            onOpenBuildPresets={onOpenBotBuildPresets}
            onOpenProfile={onOpenBotProfile}
            silhouetteState={presentation.rival.winner ? "victory" : presentation.rival.loser ? "defeat" : null}
          />
      }
    />
  );
}
