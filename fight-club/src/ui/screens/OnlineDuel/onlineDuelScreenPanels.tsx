import { useEffect, useRef, useState, type CSSProperties, type ComponentType, type ReactNode } from "react";
import type { ActiveCombatEffect } from "@/modules/combat/model/CombatEffect";
import type { RoundResult } from "@/modules/combat/model/RoundResult";
import type { Item } from "@/modules/inventory";
import type { EquipmentSlot } from "@/modules/equipment";
import {
  combatIntentDescriptions,
  combatIntentOptions,
  formatCombatIntentLabel,
} from "@/modules/combat";
import type { RoundDraft } from "@/orchestration/combat/roundDraft";
import { CombatSilhouette } from "@/ui/components/combat/CombatSilhouette";
import {
  formatConsumableDetailLines,
  formatSkillDetailLines,
  getConsumableIcon,
  getSkillIcon,
} from "@/ui/screens/Combat/combatSandboxScreenHelpers";
import { ActionButton, ActionRail } from "@/ui/screens/Combat/combatSandboxScreenActionRail";
import { MiniPanel } from "@/ui/screens/Combat/combatSandboxScreenLayout";
import { ResourceGrid } from "@/ui/screens/Combat/combatSandboxScreenResourceGrid";
import type {
  OnlineAvailableConsumable,
  OnlineAvailableSkill,
} from "@/ui/screens/OnlineDuel/onlineDuelScreenSupport";

type OnlineImpactVariant = "hit" | "crit" | "block" | "block_break" | "penetration" | "dodge";

interface OnlineImpactEvent {
  key: string;
  variant: OnlineImpactVariant;
  value: number | null;
  zone: RoundResult["attackZone"];
}

export function StatSummaryGrid({
  stats,
  rowStyle,
  labelStyle,
  valueStyle,
}: {
  stats: Array<{ label: string; value: string; helper: string }>;
  rowStyle: CSSProperties;
  labelStyle: CSSProperties;
  valueStyle: CSSProperties;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {stats.map((stat) => (
        <div key={stat.label} style={rowStyle}>
          <span style={labelStyle}>{stat.label}</span>
          <span style={valueStyle}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

export function OnlineCombatActionsPanel({
  panelStyle,
  buttonStyle,
  selectedIntent,
  selectedAction,
  availableSkills,
  availableConsumables,
  playerResources,
  playerSkillCooldowns,
  onIntentChange,
  onSkillChange,
  onConsumableChange,
  onlineIntentVisuals,
}: {
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  selectedIntent: RoundDraft["intent"];
  selectedAction: RoundDraft["selectedAction"];
  availableSkills: OnlineAvailableSkill[];
  availableConsumables: OnlineAvailableConsumable[];
  playerResources: { rage: number; guard: number; momentum: number; focus: number } | null;
  playerSkillCooldowns: Record<string, number>;
  onIntentChange: (intent: RoundDraft["intent"]) => void;
  onSkillChange: (skillId: string | null) => void;
  onConsumableChange: (itemCode: string | null) => void;
  onlineIntentVisuals: Record<
    RoundDraft["intent"],
    {
      accent: string;
      border: string;
      fill: string;
      glow: string;
    }
  >;
}) {
  const selectedSkillId = selectedAction.kind === "skill_attack" ? selectedAction.skillId : null;
  const selectedConsumableCode = selectedAction.kind === "consumable" ? selectedAction.consumableCode : null;
  const selectedTone = onlineIntentVisuals[selectedIntent];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gap: 5,
          padding: 7,
          borderRadius: 16,
          border: `1px solid ${selectedTone.border}`,
          background: `linear-gradient(180deg, ${selectedTone.fill}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 24px ${selectedTone.glow}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc5ae" }}>
              Combat Intent
            </div>
            <div style={{ fontSize: 8, color: selectedTone.accent, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {formatCombatIntentLabel(selectedIntent)}
            </div>
          </div>
          <div style={{ fontSize: 8, color: "#bca896", maxWidth: 190, textAlign: "right", lineHeight: 1.25 }}>
            {combatIntentDescriptions[selectedIntent]}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 5 }}>
          {combatIntentOptions.map((intent) => {
            const selected = selectedIntent === intent;
            const tone = onlineIntentVisuals[intent];

            return (
              <button
                key={intent}
                type="button"
                onClick={() => onIntentChange(intent)}
                style={{
                  ...buttonStyle,
                  padding: "6px 8px",
                  fontSize: 9,
                  minHeight: 34,
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ActionRail
          panelStyle={panelStyle}
          title="Skills"
          emptyLabel=""
          countLabel={String(availableSkills.length)}
          headerAction={
            <button
              type="button"
              onClick={() => onSkillChange(null)}
              style={{
                ...buttonStyle,
                padding: "5px 8px",
                fontSize: 9,
                ...(selectedAction.kind === "basic_attack"
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
          }
          entries={availableSkills.map((skill) => {
            const currentValue = (playerResources ?? { rage: 0, guard: 0, momentum: 0, focus: 0 })[skill.resourceType];
            const cooldownTurns = playerSkillCooldowns[skill.id] ?? 0;
            const skillReady = currentValue >= skill.cost && cooldownTurns <= 0;

            return (
              <ActionButton
                key={skill.id}
                selected={selectedSkillId === skill.id}
                muted={currentValue < skill.cost || cooldownTurns > 0}
                ready={skillReady}
                resourceProgress={skill.cost > 0 ? Math.min(1, currentValue / skill.cost) : 1}
                onClick={() =>
                  cooldownTurns <= 0 ? onSkillChange(selectedSkillId === skill.id ? null : skill.id) : undefined
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

        <ActionRail
          panelStyle={panelStyle}
          title="Consumables"
          emptyLabel="No consumables."
          countLabel={String(availableConsumables.length)}
          entries={availableConsumables.map((entry) => (
            <ActionButton
              key={entry.item.code}
              selected={selectedConsumableCode === entry.item.code}
              onClick={() => onConsumableChange(selectedConsumableCode === entry.item.code ? null : entry.item.code)}
              label={entry.item.name}
              note={`x${entry.quantity}`}
              description={entry.item.description}
              detailLines={formatConsumableDetailLines(entry.item)}
              icon={getConsumableIcon(entry.item.name)}
            />
          ))}
        />
      </div>
    </div>
  );
}

export function OnlinePlayerCombatPanel({
  playerName,
  playerFigure,
  currentHp,
  maxHp,
  combatantId,
  combatLog,
  activeEffects,
  equipment,
  selectedIntent,
  shellStyle,
  panelStyle,
  derivedStats,
  roleLabel,
  presetLabel,
  winner,
  loser,
  onOpenProfile,
  sidePanelComponent: SidePanelComponent,
  chipStyle,
  combatArenaBadgeRowStyle,
  onlinePlayerIntentSilhouetteTone,
  statSummaryRowStyle,
  statSummaryLabelStyle,
  statSummaryValueStyle,
}: {
  playerName: string;
  playerFigure: string;
  currentHp: number;
  maxHp: number;
  combatantId: string;
  combatLog: RoundResult[];
  activeEffects: ActiveCombatEffect[];
  equipment: Array<{ slot: string; item: unknown }>;
  selectedIntent: RoundDraft["intent"];
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  derivedStats: Array<{ label: string; value: string; helper: string }>;
  roleLabel: string;
  presetLabel: string;
  winner: boolean;
  loser: boolean;
  onOpenProfile: () => void;
  sidePanelComponent: ComponentType<{
    shellStyle: CSSProperties;
    panelStyle: CSSProperties;
    silhouette: ReactNode;
    sidebar?: ReactNode;
    blocks: ReactNode[];
    overlay?: ReactNode;
  }>;
  chipStyle: CSSProperties;
  combatArenaBadgeRowStyle: CSSProperties;
  onlinePlayerIntentSilhouetteTone: Record<
    RoundDraft["intent"],
    {
      accent: string;
      fill: string;
      edge: string;
      glow: string;
    }
  >;
  statSummaryRowStyle: CSSProperties;
  statSummaryLabelStyle: CSSProperties;
  statSummaryValueStyle: CSSProperties;
}) {
  const selectedTone = onlinePlayerIntentSilhouetteTone[selectedIntent];
  const impactEvent = useOnlineCombatImpactPulse(combatLog, combatantId);

  return (
    <SidePanelComponent
      shellStyle={{
        ...shellStyle,
        border: `1px solid ${selectedTone.edge}`,
        background: `linear-gradient(180deg, ${selectedTone.fill}, rgba(255,255,255,0.02))`,
        boxShadow: `0 30px 74px rgba(0,0,0,0.34), 0 0 24px ${selectedTone.glow}`,
      }}
      panelStyle={panelStyle}
      silhouette={
        <div
          key={impactEvent?.key ?? "player-idle"}
          className={[
            winner ? "combat-postfight-silhouette combat-postfight-silhouette--victory-left" : "",
            loser ? "combat-postfight-silhouette combat-postfight-silhouette--defeat-left" : "",
            impactEvent ? `combat-panel-shake combat-panel-shake--${impactEvent.variant}` : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            style={{
              borderRadius: 30,
              padding: 8,
              background: `linear-gradient(180deg, ${selectedTone.fill}, rgba(255,255,255,0.02))`,
              border: `1px solid ${selectedTone.edge}`,
              boxShadow: `0 0 24px ${selectedTone.glow}, inset 2px 0 0 ${selectedTone.edge}, inset -2px 0 0 ${selectedTone.edge}`,
              transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
            }}
          >
            <CombatSilhouette
              title={playerName}
              currentHp={currentHp}
              maxHp={maxHp}
              activeEffects={activeEffects}
              equipmentSlots={equipment as Array<{ slot: EquipmentSlot; item: Item | null }>}
              figure={playerFigure as never}
              mirrored
              onProfileClick={onOpenProfile}
              impactKey={impactEvent?.key ?? null}
              impactVariant={impactEvent?.variant ?? "hit"}
              impactValue={impactEvent?.value ?? null}
              impactZone={impactEvent?.zone ?? null}
            />
          </div>
        </div>
      }
      sidebar={
        <div style={{ display: "grid", gap: 8, alignContent: "start", height: "100%" }}>
          <MiniPanel panelStyle={panelStyle} title="Utility">
            <div style={{ display: "grid", gap: 6 }}>
              <div style={combatArenaBadgeRowStyle}>
                <span style={chipStyle}>{roleLabel}</span>
                <span style={chipStyle}>{presetLabel}</span>
              </div>
            </div>
          </MiniPanel>
          <MiniPanel panelStyle={panelStyle} title="Build">
            <StatSummaryGrid
              stats={derivedStats}
              rowStyle={statSummaryRowStyle}
              labelStyle={statSummaryLabelStyle}
              valueStyle={statSummaryValueStyle}
            />
          </MiniPanel>
        </div>
      }
      blocks={[]}
    />
  );
}

export function OnlineOpponentCombatPanel({
  playerName,
  playerFigure,
  currentHp,
  maxHp,
  combatantId,
  combatLog,
  activeEffects,
  equipment,
  shellStyle,
  panelStyle,
  derivedStats,
  resources,
  connectionLabel,
  readinessLabel,
  winner,
  loser,
  onOpenProfile,
  sidePanelComponent: SidePanelComponent,
  chipStyle,
  combatArenaBadgeRowStyle,
  statSummaryRowStyle,
  statSummaryLabelStyle,
  statSummaryValueStyle,
}: {
  playerName: string;
  playerFigure: string;
  currentHp: number;
  maxHp: number;
  combatantId: string;
  combatLog: RoundResult[];
  activeEffects: ActiveCombatEffect[];
  equipment: Array<{ slot: string; item: unknown }>;
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  derivedStats: Array<{ label: string; value: string; helper: string }>;
  resources: { rage: number; guard: number; momentum: number; focus: number } | null;
  connectionLabel: string;
  readinessLabel: string;
  winner: boolean;
  loser: boolean;
  onOpenProfile: () => void;
  sidePanelComponent: ComponentType<{
    shellStyle: CSSProperties;
    panelStyle: CSSProperties;
    silhouette: ReactNode;
    sidebar?: ReactNode;
    blocks: ReactNode[];
    overlay?: ReactNode;
  }>;
  chipStyle: CSSProperties;
  combatArenaBadgeRowStyle: CSSProperties;
  statSummaryRowStyle: CSSProperties;
  statSummaryLabelStyle: CSSProperties;
  statSummaryValueStyle: CSSProperties;
}) {
  const impactEvent = useOnlineCombatImpactPulse(combatLog, combatantId);

  return (
    <SidePanelComponent
      shellStyle={shellStyle}
      panelStyle={panelStyle}
      silhouette={
        <div style={{ display: "grid", gap: 8 }}>
          <div
            key={impactEvent?.key ?? "opponent-idle"}
            className={[
              winner ? "combat-postfight-silhouette combat-postfight-silhouette--victory-right" : "",
              loser ? "combat-postfight-silhouette combat-postfight-silhouette--defeat-right" : "",
              impactEvent ? `combat-panel-shake combat-panel-shake--${impactEvent.variant}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CombatSilhouette
              title={playerName}
              currentHp={currentHp}
              maxHp={maxHp}
              activeEffects={activeEffects}
              equipmentSlots={equipment as Array<{ slot: EquipmentSlot; item: Item | null }>}
              figure={playerFigure as never}
              onProfileClick={onOpenProfile}
              impactKey={impactEvent?.key ?? null}
              impactVariant={impactEvent?.variant ?? "hit"}
              impactValue={impactEvent?.value ?? null}
              impactZone={impactEvent?.zone ?? null}
            />
          </div>
          <ResourceGrid panelStyle={panelStyle} resources={resources} layout="row" showHeader={false} />
        </div>
      }
      sidebar={
        <div style={{ display: "grid", gap: 8, alignContent: "start", height: "100%" }}>
          <MiniPanel panelStyle={panelStyle} title="Utility">
            <div style={{ display: "grid", gap: 6 }}>
              <div style={combatArenaBadgeRowStyle}>
                <span style={chipStyle}>{connectionLabel}</span>
                <span style={chipStyle}>{readinessLabel}</span>
              </div>
            </div>
          </MiniPanel>
          <MiniPanel panelStyle={panelStyle} title="Snapshot">
            <StatSummaryGrid
              stats={derivedStats}
              rowStyle={statSummaryRowStyle}
              labelStyle={statSummaryLabelStyle}
              valueStyle={statSummaryValueStyle}
            />
          </MiniPanel>
        </div>
      }
      blocks={[]}
    />
  );
}

function resolveOnlineImpactVariant(result: RoundResult): OnlineImpactVariant {
  if (result.dodged) {
    return "dodge";
  }

  if (result.blocked && result.finalDamage > 0) {
    return "block_break";
  }

  if (result.penetrated) {
    return "penetration";
  }

  if (result.blocked && result.finalDamage <= 0) {
    return "block";
  }

  if (result.crit) {
    return "crit";
  }

  if (result.blocked) {
    return "block";
  }

  return "hit";
}

function resolveOnlineImpactValue(result: RoundResult) {
  return result.finalDamage > 0 ? result.finalDamage : null;
}

function useOnlineCombatImpactPulse(combatLog: RoundResult[], defenderId: string) {
  const [event, setEvent] = useState<OnlineImpactEvent | null>(null);
  const lastImpactKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const latestRound = combatLog.reduce((highestRound, entry) => {
      return entry.round > highestRound ? entry.round : highestRound;
    }, 0);

    if (!latestRound) {
      return;
    }

    const latestIncomingResult =
      [...combatLog]
        .reverse()
        .find(
          (entry) =>
            entry.round === latestRound &&
            entry.defenderId === defenderId &&
            (entry.finalDamage > 0 || entry.blocked || entry.dodged)
        ) ?? null;

    if (!latestIncomingResult) {
      return;
    }

    const nextKey = `${latestIncomingResult.round}-${latestIncomingResult.timestamp}-${latestIncomingResult.attackerId}-${latestIncomingResult.defenderId}-${latestIncomingResult.type}-${latestIncomingResult.finalDamage}-${latestIncomingResult.crit ? "crit" : "normal"}-${latestIncomingResult.blocked ? "block" : "open"}-${latestIncomingResult.dodged ? "dodge" : "land"}`;
    if (lastImpactKeyRef.current === nextKey) {
      return;
    }

    lastImpactKeyRef.current = nextKey;
    setEvent({
      key: nextKey,
      variant: resolveOnlineImpactVariant(latestIncomingResult),
      value: resolveOnlineImpactValue(latestIncomingResult),
      zone: latestIncomingResult.attackZone,
    });

    const clearTimeoutId = window.setTimeout(() => {
      setEvent((current) => (current?.key === nextKey ? null : current));
    }, 0);

    return () => window.clearTimeout(clearTimeoutId);
  }, [combatLog, defenderId]);

  return event;
}
