import type { CSSProperties } from "react";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { ActionButton, ActionRail } from "./combatSandboxScreenActionRail";
import {
  formatConsumableDetailLines,
  formatSkillDetailLines,
  getConsumableIcon,
  getSkillIcon,
} from "./combatSandboxScreenHelpers";
import { MiniPanel } from "./combatSandboxScreenLayout";

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

export function CombatActionsPanel({
  sandbox,
  panelStyle,
  buttonStyle,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <MiniPanel panelStyle={panelStyle} title="Combat Actions">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <CombatSkillsRail
          sandbox={sandbox}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          onOpenSkillLoadout={onOpenSkillLoadout}
        />
        <CombatConsumablesRail sandbox={sandbox} panelStyle={panelStyle} />
      </div>
    </MiniPanel>
  );
}

function CombatSkillsRail({
  sandbox,
  panelStyle,
  buttonStyle,
  onOpenSkillLoadout,
}: {
  sandbox: CombatSandboxModel;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <ActionRail
      panelStyle={panelStyle}
      title="Skills"
      emptyLabel=""
      countLabel={`${sandbox.equippedSkills.length}/${sandbox.maxEquippedSkills}`}
      entrySlots={sandbox.maxEquippedSkills}
      headerAction={
        <CombatSkillsRailActions
          buttonStyle={buttonStyle}
          selectedBasicAttack={sandbox.selectedAction.kind === "basic_attack"}
          canManageSkills={sandbox.unlockedSkills.length > 0}
          onSelectBasicAttack={sandbox.selectBasicAction}
          onOpenSkillLoadout={onOpenSkillLoadout}
        />
      }
      entries={sandbox.equippedSkills.map((skill) => {
        const currentValue = (sandbox.playerResources ?? { rage: 0, guard: 0, momentum: 0, focus: 0 })[skill.resourceType];
        const cooldownTurns = (sandbox.playerCombatant?.skillCooldowns ?? {})[skill.id] ?? 0;
        const skillReady = currentValue >= skill.cost && cooldownTurns <= 0;

        return (
          <ActionButton
            key={skill.id}
            selected={sandbox.selectedAction.kind === "skill_attack" && sandbox.selectedAction.skillId === skill.id}
            muted={currentValue < skill.cost || cooldownTurns > 0}
            ready={skillReady}
            resourceProgress={skill.cost > 0 ? Math.min(1, currentValue / skill.cost) : 1}
            onClick={() =>
              cooldownTurns <= 0
                ? sandbox.setSelectedSkillAction(
                    sandbox.selectedAction.kind === "skill_attack" && sandbox.selectedAction.skillId === skill.id
                      ? null
                      : skill.id
                  )
                : undefined
            }
            label={skill.name}
            note={cooldownTurns > 0 ? `Cooldown ${cooldownTurns}T` : `${currentValue}/${skill.cost} ${skill.resourceType}`}
            description={skill.description}
            detailLines={formatSkillDetailLines(skill)}
            icon={getSkillIcon(skill.name, skill.sourceItemCode)}
            iconHint={skill.sourceItemCode}
            badge={cooldownTurns > 0 ? `${cooldownTurns}` : `${skill.cost}`}
          />
        );
      })}
    />
  );
}

function CombatSkillsRailActions({
  buttonStyle,
  selectedBasicAttack,
  canManageSkills,
  onSelectBasicAttack,
  onOpenSkillLoadout,
}: {
  buttonStyle: CSSProperties;
  selectedBasicAttack: boolean;
  canManageSkills: boolean;
  onSelectBasicAttack: () => void;
  onOpenSkillLoadout: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <button
        type="button"
        aria-label="Select basic attack"
        onClick={onSelectBasicAttack}
        style={{
          ...buttonStyle,
          padding: "5px 8px",
          fontSize: "9px",
          ...(selectedBasicAttack
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
      {canManageSkills ? (
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
  );
}

function CombatConsumablesRail({
  sandbox,
  panelStyle,
}: {
  sandbox: CombatSandboxModel;
  panelStyle: CSSProperties;
}) {
  return (
    <ActionRail
      panelStyle={panelStyle}
      title="Consumables"
      emptyLabel="No consumables."
      countLabel={String(sandbox.availableConsumables.length)}
      entries={sandbox.availableConsumables.map((entry) => (
        <ActionButton
          key={entry.item.code}
          selected={sandbox.selectedAction.kind === "consumable" && sandbox.selectedAction.consumableCode === entry.item.code}
          onClick={() =>
            sandbox.setSelectedConsumableAction(
              sandbox.selectedAction.kind === "consumable" && sandbox.selectedAction.consumableCode === entry.item.code
                ? null
                : entry.item.code
            )
          }
          label={entry.item.name}
          note={`x${entry.quantity}`}
          description={entry.item.description}
          detailLines={formatConsumableDetailLines(entry.item)}
          icon={getConsumableIcon(entry.item.name)}
        />
      ))}
    />
  );
}
