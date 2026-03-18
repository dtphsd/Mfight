import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { CharacterStatName, CharacterStats } from "@/modules/character";
import { combatIntentConfig, formatCombatIntentLabel, type CombatIntent } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import { CombatSilhouette, type CombatFigureId } from "@/ui/components/combat/CombatSilhouette";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";
import { formatMaybeTitle } from "./combatSandboxScreenHelpers";
import { MiniPanel, SidePanel } from "./combatSandboxScreenLayout";
import { ResourceGrid } from "./combatSandboxScreenResourceGrid";

type CombatSandboxModel = ReturnType<typeof useCombatSandbox>;

type StatMeta = Record<CharacterStatName, { short: string; color: string; background: string; border: string }>;

const playerIntentSilhouetteTone: Record<
  CombatIntent,
  {
    accent: string;
    fill: string;
    edge: string;
    glow: string;
  }
> = {
  neutral: {
    accent: "#f0a286",
    fill: "rgba(240,162,134,0.11)",
    edge: "rgba(240,162,134,0.28)",
    glow: "rgba(240,162,134,0.18)",
  },
  aggressive: {
    accent: "#ee9abb",
    fill: "rgba(238,154,187,0.12)",
    edge: "rgba(238,154,187,0.3)",
    glow: "rgba(238,154,187,0.2)",
  },
  guarded: {
    accent: "#b7d5ff",
    fill: "rgba(183,213,255,0.12)",
    edge: "rgba(183,213,255,0.3)",
    glow: "rgba(183,213,255,0.2)",
  },
  precise: {
    accent: "#87e2cf",
    fill: "rgba(135,226,207,0.12)",
    edge: "rgba(135,226,207,0.3)",
    glow: "rgba(135,226,207,0.2)",
  },
};

const EquipmentSlotPopover = lazy(() =>
  import("@/ui/components/combat/EquipmentSlotPopover").then((module) => ({ default: module.EquipmentSlotPopover }))
);

export function PlayerCombatPanel({
  sandbox,
  playerName,
  playerFigure,
  buildConfigured,
  equipment,
  selectedEquipmentSlot,
  shellStyle,
  panelStyle,
  buttonStyle,
  statMeta,
  deferredOverlayFallbackStyle,
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
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  statMeta: StatMeta;
  deferredOverlayFallbackStyle: CSSProperties;
  onOpenBuilder: () => void;
  onOpenBuildPresets: () => void;
  onOpenInventory: () => void;
  onOpenProfile: () => void;
  onSelectEquipmentSlot: (slot: EquipmentSlot) => void;
  onCloseEquipmentSlot: () => void;
  silhouetteState?: "victory" | "defeat" | null;
}) {
  const impactEvent = useCombatImpactPulse(sandbox.playerIncomingResult);
  const selectedIntentTone = playerIntentSilhouetteTone[sandbox.selectedIntent];

  return (
    <SidePanel
      shellStyle={shellStyle}
      panelStyle={panelStyle}
      silhouette={
        <CombatOutcomeSilhouetteWrap side="player" state={silhouetteState}>
          <div
            style={{
              borderRadius: "30px",
              padding: "8px",
              background: `linear-gradient(180deg, ${selectedIntentTone.fill}, rgba(255,255,255,0.02))`,
              border: `1px solid ${selectedIntentTone.edge}`,
              boxShadow: `0 0 24px ${selectedIntentTone.glow}, inset 2px 0 0 ${selectedIntentTone.edge}, inset -2px 0 0 ${selectedIntentTone.edge}`,
              transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
            }}
          >
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
          </div>
        </CombatOutcomeSilhouetteWrap>
      }
      sidebar={
        <PlayerCombatPanelSidebar
          sandbox={sandbox}
          buildConfigured={buildConfigured}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          statMeta={statMeta}
          onOpenBuilder={onOpenBuilder}
          onOpenBuildPresets={onOpenBuildPresets}
          onOpenInventory={onOpenInventory}
        />
      }
      blocks={[]}
      overlay={
        <PlayerEquipmentSlotOverlay
          sandbox={sandbox}
          selectedEquipmentSlot={selectedEquipmentSlot}
          deferredOverlayFallbackStyle={deferredOverlayFallbackStyle}
          onCloseEquipmentSlot={onCloseEquipmentSlot}
        />
      }
    />
  );
}

export function BotCombatPanel({
  sandbox,
  botFigure,
  equipment,
  shellStyle,
  panelStyle,
  buttonStyle,
  onOpenBuildPresets,
  onOpenProfile,
  silhouetteState = null,
}: {
  sandbox: CombatSandboxModel;
  botFigure: CombatFigureId;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  shellStyle: CSSProperties;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  onOpenBuildPresets: () => void;
  onOpenProfile: () => void;
  silhouetteState?: "victory" | "defeat" | null;
}) {
  const impactEvent = useCombatImpactPulse(sandbox.botIncomingResult);

  return (
    <SidePanel
      shellStyle={shellStyle}
      panelStyle={panelStyle}
      silhouette={
        <BotCombatPanelSilhouette
          sandbox={sandbox}
          botFigure={botFigure}
          equipment={equipment}
          panelStyle={panelStyle}
          onOpenProfile={onOpenProfile}
          silhouetteState={silhouetteState}
          impactEvent={impactEvent}
        />
      }
      sidebar={
        <BotCombatPanelSidebar
          sandbox={sandbox}
          panelStyle={panelStyle}
          buttonStyle={buttonStyle}
          onOpenBuildPresets={onOpenBuildPresets}
        />
      }
      blocks={[]}
    />
  );
}

function PlayerCombatPanelSidebar({
  sandbox,
  buildConfigured,
  panelStyle,
  buttonStyle,
  statMeta,
  onOpenBuilder,
  onOpenBuildPresets,
  onOpenInventory,
}: {
  sandbox: CombatSandboxModel;
  buildConfigured: boolean;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  statMeta: StatMeta;
  onOpenBuilder: () => void;
  onOpenBuildPresets: () => void;
  onOpenInventory: () => void;
}) {
  const [snapshotExpanded, setSnapshotExpanded] = useState(false);

  return (
    <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
      <MiniPanel panelStyle={panelStyle} title="Utility">
        <div style={{ display: "grid", gap: "6px" }}>
          <button type="button" aria-label="Open builder" onClick={onOpenBuilder} style={buttonStyle}>
            Builder
          </button>
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
          <button type="button" aria-label="Open inventory" onClick={onOpenInventory} style={buttonStyle}>
            Inventory
          </button>
        </div>
      </MiniPanel>
      <MiniPanel panelStyle={panelStyle} title="Build">
        <StatTuning
          stats={sandbox.playerCharacter.baseStats}
          statMeta={statMeta}
          unspentPoints={sandbox.playerCharacter.unspentStatPoints}
          onIncrease={sandbox.increaseStat}
          onDecrease={sandbox.decreaseStat}
        />
      </MiniPanel>
      <CollapsibleSnapshotPanel
        panelStyle={panelStyle}
        expanded={snapshotExpanded}
        onToggle={() => setSnapshotExpanded((current) => !current)}
        items={buildIntentAwareSnapshotItems(sandbox)}
      />
    </div>
  );
}

function buildIntentAwareSnapshotItems(sandbox: CombatSandboxModel) {
  const intentConfig = combatIntentConfig[sandbox.selectedIntent];
  const damageMultiplier = intentConfig.outgoingDamageMultiplier;
  const adjustedDamageRange = {
    min: Math.max(0, Math.round(sandbox.metrics.totalDamageRange.min * damageMultiplier)),
    max: Math.max(0, Math.round(sandbox.metrics.totalDamageRange.max * damageMultiplier)),
  };
  const adjustedBaseCrit = clampDisplayChance(
    sandbox.metrics.baseCritChance + sandbox.metrics.critChanceBonus + intentConfig.critChanceBonus
  );
  const adjustedCritVsTarget = clampDisplayChance(
    sandbox.metrics.critVsBot + sandbox.metrics.critChanceBonus + intentConfig.critChanceBonus
  );
  const adjustedDodge = sandbox.metrics.baseDodgeChance + sandbox.metrics.dodgeChanceBonus + intentConfig.dodgeChanceBonus;
  const adjustedBlock = sandbox.metrics.blockChanceBonus + intentConfig.blockChanceBonus;
  const adjustedBlockPower = sandbox.metrics.blockPowerBonus + intentConfig.blockPowerBonus;

  return [
    { label: "HP", value: String(sandbox.metrics.maxHp) },
    { label: "DMG", value: formatRangeLabel(adjustedDamageRange), tone: "warm" as const },
    { label: "Armor", value: formatRangeLabel(sandbox.metrics.totalArmorRange) },
    { label: "Base Crit", value: `${adjustedBaseCrit}%` },
    { label: "Crit vs Target", value: `${adjustedCritVsTarget}%`, tone: "warm" as const },
    { label: "Dodge", value: `${adjustedDodge}%` },
    { label: "Block", value: formatSignedValue(adjustedBlock) },
    { label: "Block Power", value: formatSignedValue(adjustedBlockPower) },
    { label: "Intent", value: formatCombatIntentLabel(sandbox.selectedIntent), tone: "warm" as const },
    { label: "Type", value: formatMaybeTitle(sandbox.metrics.weaponDamageType) },
  ];
}

function formatSignedValue(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function clampDisplayChance(value: number) {
  return Math.max(0, Math.min(95, Math.round(value)));
}

function PlayerEquipmentSlotOverlay({
  sandbox,
  selectedEquipmentSlot,
  deferredOverlayFallbackStyle,
  onCloseEquipmentSlot,
}: {
  sandbox: CombatSandboxModel;
  selectedEquipmentSlot: EquipmentSlot | null;
  deferredOverlayFallbackStyle: CSSProperties;
  onCloseEquipmentSlot: () => void;
}) {
  if (!selectedEquipmentSlot) {
    return null;
  }

  return (
    <Suspense fallback={<DeferredOverlayFallback style={deferredOverlayFallbackStyle} label="Loading slot..." />}>
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
    </Suspense>
  );
}

function BotCombatPanelSilhouette({
  sandbox,
  botFigure,
  equipment,
  panelStyle,
  onOpenProfile,
  silhouetteState,
  impactEvent,
}: {
  sandbox: CombatSandboxModel;
  botFigure: CombatFigureId;
  equipment: Array<{ slot: EquipmentSlot; item: Item | null }>;
  panelStyle: CSSProperties;
  onOpenProfile: () => void;
  silhouetteState: "victory" | "defeat" | null;
  impactEvent: ReturnType<typeof useCombatImpactPulse>;
}) {
  return (
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
      <ResourceGrid panelStyle={panelStyle} resources={sandbox.botResources} layout="row" showHeader={false} />
    </div>
  );
}

function BotCombatPanelSidebar({
  sandbox,
  panelStyle,
  buttonStyle,
  onOpenBuildPresets,
}: {
  sandbox: CombatSandboxModel;
  panelStyle: CSSProperties;
  buttonStyle: CSSProperties;
  onOpenBuildPresets: () => void;
}) {
  const [snapshotExpanded, setSnapshotExpanded] = useState(false);

  return (
    <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
      <MiniPanel panelStyle={panelStyle} title="Utility">
        <div style={{ display: "grid", gap: "6px" }}>
          <button type="button" aria-label="Open bot build presets" onClick={onOpenBuildPresets} style={buttonStyle}>
            Bot Build
          </button>
          <BotBuildPresetSummary
            label={sandbox.botBuildPreset.label}
            archetype={sandbox.botBuildPreset.archetype}
            targetFightLength={sandbox.botBuildPreset.targetFightLength}
          />
        </div>
      </MiniPanel>
      <div
        style={{
          ...panelStyle,
          padding: "10px",
          display: "grid",
          gap: "7px",
        }}
      >
        <button
          type="button"
          onClick={() => setSnapshotExpanded((current) => !current)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            alignItems: "center",
            padding: 0,
            background: "transparent",
            border: 0,
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.66, letterSpacing: "0.1em", color: "#d9b28b" }}>
            Snapshot
          </span>
          <span style={{ fontSize: "9px", color: "#e7d9c8", opacity: 0.8 }}>{snapshotExpanded ? "Hide" : "Show"}</span>
        </button>
        {snapshotExpanded ? (
          <>
            <StatGrid stats={sandbox.botSnapshot.stats} />
            <MetricGrid
              items={[
                { label: "HP", value: String(sandbox.metrics.opponentMaxHp) },
                { label: "DMG", value: formatRangeLabel(sandbox.metrics.opponentTotalDamageRange), tone: "warm" },
                { label: "Armor", value: formatRangeLabel(sandbox.metrics.opponentTotalArmorRange) },
                { label: "Crit vs You", value: `${clampDisplayChance(sandbox.metrics.matchup.botCritVsPlayer)}%` },
                { label: "Type", value: formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType) },
              ]}
            />
          </>
        ) : (
          <div style={{ fontSize: "9px", color: "rgba(231,217,200,0.72)", lineHeight: 1.3 }}>
            HP, damage, armor and stance-facing values stay here.
          </div>
        )}
      </div>
    </div>
  );
}

const defaultStatMeta: StatMeta = {
  strength: { short: "STR", color: "#f0a286", background: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)" },
  agility: { short: "AGI", color: "#87e2cf", background: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)" },
  rage: { short: "RAG", color: "#ee9abb", background: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)" },
  endurance: { short: "END", color: "#ebcf8b", background: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)" },
};

function DeferredOverlayFallback({ style, label = "Loading..." }: { style: CSSProperties; label?: string }) {
  return <div style={style}>{label}</div>;
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

function MetricGrid({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: string; tone?: "neutral" | "warm" }>;
  columns?: 2 | 3;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "5px" }}>
      {items.map((item) => (
        <MetricChip key={`${item.label}-${item.value}`} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </div>
  );
}

function CollapsibleSnapshotPanel({
  panelStyle,
  expanded,
  onToggle,
  items,
}: {
  panelStyle: CSSProperties;
  expanded: boolean;
  onToggle: () => void;
  items: Array<{ label: string; value: string; tone?: "neutral" | "warm" }>;
}) {
  return (
    <div
      style={{
        ...panelStyle,
        padding: "10px",
        display: "grid",
        gap: "7px",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          alignItems: "center",
          padding: 0,
          background: "transparent",
          border: 0,
          color: "inherit",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.66, letterSpacing: "0.1em", color: "#d9b28b" }}>
          Snapshot
        </span>
        <span style={{ fontSize: "9px", color: "#e7d9c8", opacity: 0.8 }}>{expanded ? "Hide" : "Show"}</span>
      </button>
      {expanded ? (
        <MetricGrid columns={3} items={items} />
      ) : (
        <div style={{ fontSize: "9px", color: "rgba(231,217,200,0.72)", lineHeight: 1.3 }}>
          HP, damage, armor and current stance values stay here.
        </div>
      )}
    </div>
  );
}

function MetricChip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warm" }) {
  const palette =
    tone === "warm"
      ? { background: "rgba(207,106,50,0.14)", border: "rgba(214,151,94,0.32)", label: "#e6bf92", value: "#ffe2c2" }
      : { background: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.08)", label: "rgba(255,255,255,0.62)", value: "#efe6da" };

  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "7px 8px",
        background: palette.background,
        border: `1px solid ${palette.border}`,
        display: "grid",
        gap: "2px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "9px", textTransform: "uppercase", color: palette.label }}>{label}</div>
      <div style={{ fontSize: "10px", lineHeight: 1.2, fontWeight: 700, color: palette.value, textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}

function StatTuning({
  stats,
  statMeta,
  unspentPoints,
  onIncrease,
  onDecrease,
}: {
  stats: Record<CharacterStatName, number>;
  statMeta: StatMeta;
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
        <div
          key={name}
          style={{
            borderRadius: "10px",
            padding: "4px 5px",
            background: statMeta[name].background,
            border: `1px solid ${statMeta[name].border}`,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "4px",
            alignItems: "center",
          }}
        >
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
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "14px",
        height: "14px",
        borderRadius: "999px",
        border: `1px solid ${color}66`,
        background: "rgba(255,255,255,0.07)",
        color,
        cursor: "pointer",
        padding: 0,
        fontWeight: 800,
        lineHeight: 1,
        fontSize: "8px",
      }}
    >
      {label}
    </button>
  );
}

function StatGrid({ stats, statMeta = defaultStatMeta }: { stats: CharacterStats; statMeta?: StatMeta }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px" }}>
      {Object.entries(stats).map(([name, value]) => {
        const meta = statMeta[name as CharacterStatName];
        return (
          <div
            key={name}
            style={{ borderRadius: "10px", padding: "6px 4px", background: meta.background, border: `1px solid ${meta.border}`, textAlign: "center" }}
          >
            <div style={{ fontSize: "7px", opacity: 0.9, textTransform: "uppercase", color: meta.color }}>{meta.short}</div>
            <div style={{ fontWeight: 700, marginTop: "2px", fontSize: "11px" }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}


function BotBuildPresetSummary({
  label,
  archetype,
  targetFightLength,
}: {
  label: string;
  archetype: string;
  targetFightLength: string;
}) {
  return (
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
      <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff3e2", lineHeight: 1.15 }}>{label}</div>
      <div style={{ fontSize: "8px", lineHeight: 1.25, color: "#cbbba8" }}>
        {archetype} vs {targetFightLength}
      </div>
    </div>
  );
}

function formatRangeLabel(range: { min: number; max: number }) {
  return range.min === range.max ? String(range.min) : `${range.min}-${range.max}`;
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

  if (result.penetrated) {
    return "penetration" as const;
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
  const [event, setEvent] = useState<null | { key: string; variant: ReturnType<typeof resolveImpactVariant>; value: number | null }>(null);
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
