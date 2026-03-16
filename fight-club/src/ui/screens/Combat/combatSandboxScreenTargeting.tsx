import type { CSSProperties, ReactNode } from "react";
import type { CombatZone } from "@/modules/combat";
import { formatMaybeTitle } from "./combatSandboxScreenHelpers";
import { MiniPanel } from "./combatSandboxScreenLayout";

type ZoneCircleTone = {
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
};

const attackZoneCircleTone: ZoneCircleTone = {
  activeBackground: "rgba(207,106,50,0.18)",
  activeBorder: "rgba(255,171,97,0.48)",
  activeColor: "#ffe2c2",
  badgeBackground: "rgba(255,171,97,0.14)",
  badgeColor: "#ffcf9a",
  sectionBackground: "linear-gradient(180deg, rgba(207,106,50,0.12), rgba(255,255,255,0.02))",
  sectionBorder: "rgba(255,171,97,0.16)",
  titleColor: "#ffcf9a",
  selectedTransform: "translateY(-1px) scale(1.02)",
  selectedShadowTint: "rgba(255,171,97,0.18)",
  selectedInnerRing: "rgba(255,227,192,0.16)",
};

const defenseZoneCircleTone: ZoneCircleTone = {
  activeBackground: "rgba(76,143,255,0.18)",
  activeBorder: "rgba(122,187,255,0.48)",
  activeColor: "#dcefff",
  badgeBackground: "rgba(93,162,255,0.14)",
  badgeColor: "#9fd0ff",
  sectionBackground: "linear-gradient(180deg, rgba(76,143,255,0.12), rgba(255,255,255,0.02))",
  sectionBorder: "rgba(122,187,255,0.16)",
  titleColor: "#b7d5ff",
  selectedTransform: "translateY(0) scale(1.01)",
  selectedShadowTint: "rgba(122,187,255,0.16)",
  selectedInnerRing: "rgba(215,236,255,0.18)",
};

export function AttackTargetRoundPanel({
  panelStyle,
  resourcePanel,
  zones,
  selectedAttackZone,
  selectedDefenseZones,
  onSelectAttackZone,
  onToggleDefenseZone,
  roundControls,
}: {
  panelStyle: CSSProperties;
  resourcePanel: ReactNode;
  zones: CombatZone[];
  selectedAttackZone: CombatZone;
  selectedDefenseZones: CombatZone[];
  onSelectAttackZone: (zone: CombatZone) => void;
  onToggleDefenseZone: (zone: CombatZone) => void;
  roundControls: ReactNode;
}) {
  return (
    <MiniPanel panelStyle={panelStyle} title="Attack Target + Round">
      <div style={{ display: "grid", gap: "10px", height: "100%", alignContent: "space-between" }}>
        <AttackTargetSelectionPanel
          panelStyle={panelStyle}
          resourcePanel={resourcePanel}
          zones={zones}
          selectedAttackZone={selectedAttackZone}
          selectedDefenseZones={selectedDefenseZones}
          onSelectAttackZone={onSelectAttackZone}
          onToggleDefenseZone={onToggleDefenseZone}
        />
        {roundControls}
      </div>
    </MiniPanel>
  );
}

function AttackTargetSelectionPanel({
  panelStyle,
  resourcePanel,
  zones,
  selectedAttackZone,
  selectedDefenseZones,
  onSelectAttackZone,
  onToggleDefenseZone,
}: {
  panelStyle: CSSProperties;
  resourcePanel: ReactNode;
  zones: CombatZone[];
  selectedAttackZone: CombatZone;
  selectedDefenseZones: CombatZone[];
  onSelectAttackZone: (zone: CombatZone) => void;
  onToggleDefenseZone: (zone: CombatZone) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "9px" }}>
      {resourcePanel}
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
          zones={zones}
          selectedZones={[selectedAttackZone]}
          onSelectZone={onSelectAttackZone}
          tone={attackZoneCircleTone}
        />
        <ZoneCircleRow
          title="Block"
          zones={zones}
          selectedZones={selectedDefenseZones}
          onSelectZone={onToggleDefenseZone}
          multiSelect
          tone={defenseZoneCircleTone}
        />
      </div>
    </div>
  );
}

function ZoneCircleRow({
  title,
  zones,
  selectedZones,
  onSelectZone,
  multiSelect = false,
  tone,
}: {
  title: string;
  zones: CombatZone[];
  selectedZones: CombatZone[];
  onSelectZone: (zone: CombatZone) => void;
  multiSelect?: boolean;
  tone: ZoneCircleTone;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "6px",
        alignContent: "start",
        borderRadius: "14px",
        padding: "8px",
        background: tone.sectionBackground,
        border: `1px solid ${tone.sectionBorder}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.9, color: tone.titleColor, fontWeight: 800 }}>
          {title}
        </div>
        <div
          style={{
            borderRadius: "999px",
            padding: "2px 6px",
            fontSize: "8px",
            fontWeight: 700,
            background: tone.badgeBackground,
            color: tone.badgeColor,
            border: `1px solid ${tone.activeBorder}`,
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
                border: selected ? `1px solid ${tone.activeBorder}` : "1px solid rgba(255,255,255,0.1)",
                background: selected ? tone.activeBackground : "rgba(255,255,255,0.03)",
                color: selected ? tone.activeColor : "#d9ccbc",
                cursor: "pointer",
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                boxShadow: selected ? `0 0 18px ${tone.selectedShadowTint}, inset 0 0 0 1px ${tone.selectedInnerRing}` : "none",
                transform: selected ? tone.selectedTransform : "translateY(0) scale(1)",
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

function formatZoneSelectionSummary(selectedZones: CombatZone[], multiSelect: boolean) {
  if (selectedZones.length === 0) return "None";
  if (!multiSelect) return formatMaybeTitle(selectedZones[0]);

  const abbreviations = selectedZones.map((zone) => zone.slice(0, 2).toUpperCase());
  if (abbreviations.length <= 3) return abbreviations.join(" / ");

  return `${abbreviations.slice(0, 2).join(" / ")} +${abbreviations.length - 2}`;
}
