import type { CSSProperties } from "react";
import { combatIntentDescriptions, combatIntentOptions, formatCombatIntentLabel, type CombatIntent } from "@/modules/combat";
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

const intentVisuals: Record<
  CombatIntent,
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
      <div style={{ display: "grid", gap: "10px" }}>
        <CombatIntentSelector sandbox={sandbox} buttonStyle={buttonStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <CombatSkillsRail
          sandbox={sandbox}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          onOpenSkillLoadout={onOpenSkillLoadout}
        />
        <CombatConsumablesRail sandbox={sandbox} panelStyle={panelStyle} />
        </div>
      </div>
    </MiniPanel>
  );
}

function CombatIntentSelector({
  sandbox,
  buttonStyle,
}: {
  sandbox: CombatSandboxModel;
  buttonStyle: CSSProperties;
}) {
  const selectedTone = intentVisuals[sandbox.selectedIntent];

  return (
    <div
      style={{
        display: "grid",
        gap: "5px",
        padding: "7px",
        borderRadius: "16px",
        border: `1px solid ${selectedTone.border}`,
        background: `linear-gradient(180deg, ${selectedTone.fill}, rgba(255,255,255,0.02))`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 24px ${selectedTone.glow}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "2px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc5ae" }}>
            Combat Intent
          </div>
          <div style={{ fontSize: "8px", color: selectedTone.accent, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {formatCombatIntentLabel(sandbox.selectedIntent)}
          </div>
        </div>
        <div style={{ fontSize: "8px", color: "#bca896", maxWidth: "190px", textAlign: "right", lineHeight: 1.25 }}>
          {combatIntentDescriptions[sandbox.selectedIntent]}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "5px" }}>
        {combatIntentOptions.map((intent) => {
          const selected = sandbox.selectedIntent === intent;
          const tone = intentVisuals[intent];

          return (
            <button
              key={intent}
              type="button"
              aria-label={`Set combat intent ${intent}`}
              onClick={() => sandbox.setSelectedIntent(intent)}
              style={{
                ...buttonStyle,
                padding: "6px 8px",
                fontSize: "9px",
                minHeight: "34px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 140ms ease, box-shadow 140ms ease, background 140ms ease, color 140ms ease",
                ...(selected
                  ? {
                      border: `1px solid ${tone.border}`,
                      background: `linear-gradient(180deg, ${tone.fill}, rgba(255,255,255,0.04))`,
                      color: tone.accent,
                      boxShadow: `inset 0 0 0 1px ${tone.border}, 0 0 18px ${tone.glow}`,
                    }
                  : {
                      background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
                    }),
              }}
            >
              {formatCombatIntentLabel(intent)}
            </button>
          );
        })}
      </div>
    </div>
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
