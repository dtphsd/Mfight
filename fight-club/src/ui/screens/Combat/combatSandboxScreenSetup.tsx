import type { CSSProperties } from "react";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { CombatActionsPanel } from "./combatSandboxScreenActions";
import { FightControlsPanel, RoundAdvanceControls } from "./combatSandboxScreenControls";
import { ResourceGrid as CombatResourceGrid } from "./combatSandboxScreenResourceGrid";
import { AttackTargetRoundPanel } from "./combatSandboxScreenTargeting";

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function FightSetupPanel({
  sandbox,
  shellStyle,
  panelStyle,
  buttonStyle,
  primaryButtonStyle,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  latestRoundSummary,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
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
        panelStyle={panelStyle}
        buttonStyle={buttonStyle}
        primaryButtonStyle={primaryButtonStyle}
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
  panelStyle,
  buttonStyle,
  primaryButtonStyle,
  selectedActionLabel,
  selectedActionTags,
  selectedActionSummary,
  latestRoundSummary,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  primaryButtonStyle: CSSProperties;
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
