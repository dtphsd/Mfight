import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { CharacterStatName, CharacterStats } from "@/modules/character";
import type { CombatZone } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import { BattleLogPanel } from "@/ui/components/combat/BattleLogPanel";
import { BuilderPopover } from "@/ui/components/combat/BuilderPopover";
import { CombatSilhouette } from "@/ui/components/combat/CombatSilhouette";
import { EquipmentSlotPopover } from "@/ui/components/combat/EquipmentSlotPopover";
import { InventoryPopover } from "@/ui/components/combat/InventoryPopover";
import { useCombatSandbox } from "@/ui/hooks/useCombatSandbox";

const playerEquipmentSlots: EquipmentSlot[] = [
  "helmet",
  "armor",
  "mainHand",
  "offHand",
  "gloves",
  "accessory",
  "boots",
];

const panelStyle: CSSProperties = {
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.1)",
  background:
    "linear-gradient(180deg, rgba(20,18,17,0.98), rgba(13,12,11,0.98)), radial-gradient(circle at top, rgba(255,192,120,0.08), transparent 28%)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
};

const buttonStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#efe6da",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  border: "1px solid rgba(255,171,97,0.4)",
  background: "rgba(207,106,50,0.18)",
  color: "#ffe2c2",
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

export function CombatSandboxScreen() {
  const sandbox = useCombatSandbox();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState<EquipmentSlot | null>(null);

  const playerEquipment = useMemo(
    () =>
      playerEquipmentSlots.map((slot) => ({
        slot,
        itemName: sandbox.equippedItems.find((entry) => entry.slot === slot)?.item?.name ?? null,
      })),
    [sandbox.equippedItems]
  );

  const selectedActionLabel = sandbox.selectedConsumableCode
    ? sandbox.availableConsumables.find((entry) => entry.item.code === sandbox.selectedConsumableCode)?.item.name ?? "Consumable"
    : sandbox.selectedSkillId
      ? sandbox.availableSkills.find((skill) => skill.id === sandbox.selectedSkillId)?.name ?? "Skill"
      : "Basic Attack";

  const playerZoneHighlights = buildZoneHighlights(sandbox.metrics.matchup.botZonePressure);
  const botZoneHighlights = buildZoneHighlights(sandbox.metrics.matchup.playerZonePressure);

  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <div style={{ ...panelStyle, padding: "14px", display: "grid", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: "3px" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.64 }}>
              Combat Sandbox
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1.02 }}>Player | FIGHT SETUP | Bot</div>
            <div style={{ fontSize: "12px", lineHeight: 1.4, color: "#cabfb0", maxWidth: "760px" }}>
              Восстановленный боевой экран поверх текущего sandbox runtime: билд, инвентарь, экипировка, действия, зоны и боевой лог.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setBuilderOpen(true)} style={buttonStyle}>
              Builder
            </button>
            <button type="button" onClick={() => setInventoryOpen(true)} style={buttonStyle}>
              Inventory
            </button>
            <button type="button" onClick={sandbox.resetBuild} style={buttonStyle}>
              Reset Build
            </button>
            <button type="button" onClick={sandbox.startFight} style={primaryButtonStyle}>
              Start Fight
            </button>
            <button type="button" onClick={sandbox.resolveNextRound} style={primaryButtonStyle}>
              Resolve Round
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.9fr) minmax(0, 1fr)",
            gap: "12px",
            alignItems: "start",
          }}
        >
          <div style={{ ...panelStyle, padding: "14px", display: "grid", gap: "10px", alignContent: "start", height: "100%" }}>
            <PanelHeader
              eyebrow="Player"
              title={sandbox.playerCharacter.name}
              note={formatMaybeTitle(sandbox.metrics.weaponDamageType)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 118px", gap: "12px", alignItems: "start", position: "relative" }}>
              <div style={{ display: "grid", justifyItems: "center", padding: "8px 6px 10px", borderRadius: "18px", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.06)" }}>
                <CombatSilhouette
                  title="Player"
                  currentHp={sandbox.playerCombatant?.currentHp ?? sandbox.playerSnapshot.maxHp}
                  maxHp={sandbox.playerCombatant?.maxHp ?? sandbox.playerSnapshot.maxHp}
                  selectedDefenseZones={sandbox.selectedDefenseZones}
                  lastIncomingZone={sandbox.latestBotLogEntry?.attackZone ?? null}
                  lastOutgoingZone={sandbox.latestPlayerLogEntry?.attackZone ?? null}
                  incomingResult={sandbox.playerIncomingResult}
                  outgoingResult={sandbox.playerOutgoingResult}
                  interactive
                  zoneHighlights={playerZoneHighlights}
                  equipmentSlots={playerEquipment}
                  onEquipmentSlotClick={(slot) => setSelectedEquipmentSlot(slot)}
                  onDefenseToggle={sandbox.toggleDefenseZone}
                />
              </div>
              <div style={{ display: "grid", gap: "8px", alignContent: "start" }}>
                <MiniPanel title="Stats">
                  <StatTuning
                    stats={sandbox.playerCharacter.baseStats}
                    unspentPoints={sandbox.playerCharacter.unspentStatPoints}
                    onIncrease={sandbox.increaseStat}
                    onDecrease={sandbox.decreaseStat}
                  />
                </MiniPanel>
                <MiniPanel title="Resources">
                  <ResourceGrid resources={sandbox.playerResources} compact />
                </MiniPanel>
                <MiniPanel title="Metrics">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    <MetricChip label="HP" value={String(sandbox.metrics.maxHp)} />
                    <MetricChip label="DMG" value={String(sandbox.metrics.totalDamage)} tone="warm" />
                    <MetricChip label="Armor" value={String(sandbox.metrics.totalArmor)} />
                    <MetricChip label="Type" value={formatMaybeTitle(sandbox.metrics.weaponDamageType)} />
                  </div>
                </MiniPanel>
              </div>

              {selectedEquipmentSlot ? (
                <EquipmentSlotPopover
                  slot={selectedEquipmentSlot}
                  entries={sandbox.getInventoryOptionsForSlot(selectedEquipmentSlot)}
                  equippedItemCode={sandbox.equippedItems.find((entry) => entry.slot === selectedEquipmentSlot)?.item?.code ?? null}
                  onEquip={(itemCode) => {
                    sandbox.equipItemByCode(itemCode);
                    setSelectedEquipmentSlot(null);
                  }}
                  onUnequip={(slot) => {
                    sandbox.unequipSlot(slot);
                    setSelectedEquipmentSlot(null);
                  }}
                  onClose={() => setSelectedEquipmentSlot(null)}
                />
              ) : null}
            </div>
          </div>

          <div style={{ ...panelStyle, padding: "14px", display: "grid", gap: "10px", alignContent: "start", height: "100%" }}>
            <PanelHeader eyebrow="Center" title="FIGHT SETUP" note={selectedActionLabel} />

            <div style={{ borderRadius: "16px", padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "7px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68 }}>Fight State</div>
                <div style={{ fontSize: "10px", opacity: 0.62 }}>
                  {sandbox.combatState ? `Round ${sandbox.combatState.round}` : "Idle"}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <MetricChip label="Selected" value={selectedActionLabel} />
                <MetricChip label="Acts First" value={sandbox.playerActsFirst ? "Player" : "Bot"} />
                <MetricChip label="Defense" value={sandbox.selectedDefenseZones.map(formatMaybeTitle).join(", ")} />
                <MetricChip label="Error" value={sandbox.roundError ?? "None"} tone={sandbox.roundError ? "warm" : "neutral"} />
              </div>
            </div>

            <div style={{ borderRadius: "16px", padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "7px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68 }}>Attack Target</div>
                <div style={{ fontSize: "9px", opacity: 0.6 }}>Click zone or bot silhouette</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "6px" }}>
                {sandbox.zones.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => sandbox.setSelectedAttackZone(zone)}
                    style={{
                      ...buttonStyle,
                      ...(sandbox.selectedAttackZone === zone
                        ? {
                            background: "rgba(207,106,50,0.16)",
                            border: "1px solid rgba(255,171,97,0.4)",
                            color: "#ffe2c2",
                          }
                        : {}),
                      padding: "9px 4px",
                      fontSize: "10px",
                      textTransform: "capitalize",
                    }}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "start" }}>
              <ActionRail
                eyebrow="Offense"
                title="Skills"
                emptyLabel="Equip a skill item."
                basicActionSelected={sandbox.selectedSkillId === null && sandbox.selectedConsumableCode === null}
                onSelectBasicAction={() => {
                  sandbox.setSelectedSkill(null);
                  sandbox.setSelectedConsumable(null);
                }}
                entries={sandbox.availableSkills.map((skill) => {
                  const currentValue = (sandbox.playerResources ?? { rage: 0, guard: 0, momentum: 0, focus: 0 })[skill.resourceType];
                  return (
                    <ActionButton
                      key={skill.id}
                      selected={sandbox.selectedSkillId === skill.id}
                      muted={currentValue < skill.cost}
                      onClick={() => sandbox.setSelectedSkill(sandbox.selectedSkillId === skill.id ? null : skill.id)}
                      label={skill.name}
                      note={`${currentValue}/${skill.cost} ${skill.resourceType}`}
                    />
                  );
                })}
              />
              <ActionRail
                eyebrow="Utility"
                title="Consumables"
                emptyLabel="No consumables."
                entries={sandbox.availableConsumables.map((entry) => (
                  <ActionButton
                    key={entry.item.code}
                    selected={sandbox.selectedConsumableCode === entry.item.code}
                    onClick={() =>
                      sandbox.setSelectedConsumable(
                        sandbox.selectedConsumableCode === entry.item.code ? null : entry.item.code
                      )
                    }
                    label={entry.item.name}
                    note={`x${entry.quantity}`}
                  />
                ))}
              />
            </div>

            <div style={{ borderRadius: "16px", padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "7px" }}>
              <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68, textAlign: "center" }}>Quick Metrics</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <MetricChip label="DMG" value={String(sandbox.metrics.totalDamage)} tone="warm" />
                <MetricChip label="Armor" value={String(sandbox.metrics.totalArmor)} />
                <MetricChip label="Crit" value={`${sandbox.metrics.baseCritChance + sandbox.metrics.critChanceBonus}%`} />
                <MetricChip label="Dodge" value={`${sandbox.metrics.baseDodgeChance + sandbox.metrics.dodgeChanceBonus}%`} />
              </div>
            </div>
          </div>

          <div style={{ ...panelStyle, padding: "14px", display: "grid", gap: "10px", alignContent: "start", height: "100%" }}>
            <PanelHeader eyebrow="Target" title="Bot" note={formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType)} />
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 118px", gap: "12px", alignItems: "start" }}>
              <div style={{ display: "grid", justifyItems: "center", padding: "8px 6px 10px", borderRadius: "18px", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.06)" }}>
                <CombatSilhouette
                  title="Bot"
                  currentHp={sandbox.botCombatant?.currentHp ?? sandbox.botSnapshot.maxHp}
                  maxHp={sandbox.botCombatant?.maxHp ?? sandbox.botSnapshot.maxHp}
                  selectedAttackZone={sandbox.selectedAttackZone}
                  lastIncomingZone={sandbox.latestPlayerLogEntry?.attackZone ?? null}
                  lastOutgoingZone={sandbox.latestBotLogEntry?.attackZone ?? null}
                  incomingResult={sandbox.botIncomingResult}
                  outgoingResult={sandbox.botOutgoingResult}
                  interactive
                  zoneHighlights={botZoneHighlights}
                  onAttackSelect={sandbox.setSelectedAttackZone}
                />
              </div>
              <div style={{ display: "grid", gap: "8px", alignContent: "start" }}>
                <MiniPanel title="Stats">
                  <StatGrid stats={sandbox.botSnapshot.stats} />
                </MiniPanel>
                <MiniPanel title="Resources">
                  <ResourceGrid resources={sandbox.botResources} compact />
                </MiniPanel>
                <MiniPanel title="Metrics">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    <MetricChip label="HP" value={String(sandbox.metrics.opponentMaxHp)} />
                    <MetricChip label="DMG" value={String(sandbox.metrics.opponentTotalDamage)} tone="warm" />
                    <MetricChip label="Armor" value={String(sandbox.metrics.opponentTotalArmor)} />
                    <MetricChip label="Type" value={formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType)} />
                  </div>
                </MiniPanel>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...panelStyle, padding: "14px" }}>
        <BattleLogPanel
          entries={sandbox.battleLogEntries}
          playerId={sandbox.playerSnapshot.characterId}
          botId={sandbox.botSnapshot.characterId}
        />
      </div>

      {builderOpen ? (
        <BuilderPopover
          buildPresets={sandbox.buildPresets}
          playerCharacter={sandbox.playerCharacter}
          metrics={sandbox.metrics}
          increaseStat={sandbox.increaseStat}
          decreaseStat={sandbox.decreaseStat}
          applyPreset={sandbox.applyPreset}
          resetBuild={sandbox.resetBuild}
          onClose={() => setBuilderOpen(false)}
        />
      ) : null}

      {inventoryOpen ? (
        <InventoryPopover
          entries={sandbox.inventory.entries}
          slotsUsed={sandbox.inventorySlots.used}
          slotsMax={sandbox.inventorySlots.max}
          equippedItems={sandbox.equippedItems}
          onEquip={sandbox.equipItemByCode}
          onClose={() => setInventoryOpen(false)}
        />
      ) : null}
    </section>
  );
}

function PanelHeader({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div style={{ display: "grid", gap: "2px" }}>
      <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.64 }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline", flexWrap: "wrap" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: "10px", opacity: 0.66 }}>{note}</div>
      </div>
    </div>
  );
}

function MiniPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: "12px", padding: "5px", background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "4px" }}>
      <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68, textAlign: "center" }}>{title}</div>
      {children}
    </div>
  );
}

function MetricChip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warm" }) {
  const palette =
    tone === "warm"
      ? { background: "rgba(207,106,50,0.14)", border: "rgba(214,151,94,0.32)", label: "#e6bf92", value: "#ffe2c2" }
      : { background: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.08)", label: "rgba(255,255,255,0.62)", value: "#efe6da" };

  return (
    <div style={{ borderRadius: "12px", padding: "7px 8px", background: palette.background, border: `1px solid ${palette.border}`, display: "grid", gap: "2px", textAlign: "center" }}>
      <div style={{ fontSize: "9px", textTransform: "uppercase", color: palette.label }}>{label}</div>
      <div style={{ fontSize: "10px", lineHeight: 1.2, fontWeight: 700, color: palette.value, textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}

function StatTuning({
  stats,
  unspentPoints,
  onIncrease,
  onDecrease,
}: {
  stats: Record<CharacterStatName, number>;
  unspentPoints: number;
  onIncrease: (statName: CharacterStatName) => void;
  onDecrease: (statName: CharacterStatName) => void;
}) {
  return (
    <div style={{ borderRadius: "14px", padding: "6px", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.07)", display: "grid", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>Stats</div>
        <div style={{ fontSize: "8px", opacity: 0.68 }}>Pts {unspentPoints}</div>
      </div>
      <div style={{ display: "grid", gap: "4px" }}>
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
              gap: "3px",
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
    </div>
  );
}

function TinyButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "12px",
        height: "12px",
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

function StatGrid({ stats }: { stats: CharacterStats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px" }}>
      {Object.entries(stats).map(([name, value]) => {
        const meta = statMeta[name as CharacterStatName];
        return (
          <div
            key={name}
            style={{
              borderRadius: "10px",
              padding: "5px 4px",
              background: meta.background,
              border: `1px solid ${meta.border}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "7px", opacity: 0.9, textTransform: "uppercase", color: meta.color }}>{meta.short}</div>
            <div style={{ fontWeight: 700, marginTop: "2px", fontSize: "11px" }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

function ResourceGrid({
  resources,
  compact = false,
}: {
  resources: { rage: number; guard: number; momentum: number; focus: number } | null;
  compact?: boolean;
}) {
  const items = [
    { key: "rage", label: "Rage", color: "#ee9abb" },
    { key: "guard", label: "Guard", color: "#b7d5ff" },
    { key: "momentum", label: "Momentum", color: "#f0a286" },
    { key: "focus", label: "Focus", color: "#87e2cf" },
  ] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: compact ? "4px" : "6px" }}>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            borderRadius: compact ? "10px" : "12px",
            padding: compact ? "6px 4px" : "7px 6px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: compact ? "7px" : "8px", opacity: 0.72, color: item.color, textTransform: "uppercase" }}>
            {item.label}
          </div>
          <div style={{ fontSize: compact ? "12px" : "14px", fontWeight: 800 }}>{resources?.[item.key] ?? 0}</div>
        </div>
      ))}
    </div>
  );
}

function ActionRail({
  eyebrow,
  title,
  entries,
  emptyLabel,
  basicActionSelected = false,
  onSelectBasicAction,
}: {
  eyebrow: string;
  title: string;
  entries: ReactNode[];
  emptyLabel: string;
  basicActionSelected?: boolean;
  onSelectBasicAction?: () => void;
}) {
  const content = onSelectBasicAction
    ? [
        <ActionButton
          key="basic"
          selected={basicActionSelected}
          onClick={onSelectBasicAction}
          label="Basic Attack"
          note="No cost"
        />,
        ...entries,
      ]
    : entries;
  const fillers = Math.max(0, 5 - content.length);

  return (
    <div style={{ borderRadius: "12px", padding: "5px", background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>{eyebrow}</div>
        <div style={{ fontSize: "8px", fontWeight: 700, color: "#efe6da" }}>{title}</div>
      </div>
      {content.length === 0 ? <div style={{ fontSize: "8px", opacity: 0.58 }}>{emptyLabel}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "5px" }}>
        {content.slice(0, 5)}
        {Array.from({ length: fillers }).map((_, index) => (
          <div
            key={`${title}-${index}`}
            style={{
              width: "100%",
              aspectRatio: "1.35 / 1",
              borderRadius: "9px",
              border: "1px dashed rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  selected,
  muted = false,
  onClick,
  label,
  note,
}: {
  selected: boolean;
  muted?: boolean;
  onClick: () => void;
  label: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} • ${note}`}
      style={{
        width: "100%",
        aspectRatio: "1.35 / 1",
        minWidth: 0,
        borderRadius: "999px",
        border: selected ? "1px solid rgba(255,171,97,0.5)" : "1px solid rgba(255,255,255,0.1)",
        background: selected ? "rgba(207,106,50,0.16)" : "rgba(255,255,255,0.04)",
        color: muted ? "rgba(255,248,237,0.56)" : "#fff8ed",
        cursor: "pointer",
        padding: "4px",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ display: "grid", gap: "2px" }}>
        <div style={{ fontSize: "8px", fontWeight: 800, lineHeight: 1.1 }}>{label}</div>
        <div style={{ fontSize: "7px", opacity: 0.72 }}>{note}</div>
      </div>
    </button>
  );
}

function buildZoneHighlights(zonePressure: {
  bestOpen: { zone: CombatZone };
  worstOpen: { zone: CombatZone };
  bestGuarded: { zone: CombatZone };
  worstGuarded: { zone: CombatZone };
  zones: Array<{ zone: CombatZone; openDamage: number; guardedDamage: number }>;
}) {
  const byZone = Object.fromEntries(
    zonePressure.zones.map((entry) => [entry.zone, { openDamage: entry.openDamage, guardedDamage: entry.guardedDamage }])
  ) as Record<CombatZone, { openDamage: number; guardedDamage: number }>;

  return {
    [zonePressure.bestOpen.zone]: {
      ...byZone[zonePressure.bestOpen.zone],
      bestOpen: true,
    },
    [zonePressure.worstOpen.zone]: {
      ...byZone[zonePressure.worstOpen.zone],
      ...(zonePressure.worstOpen.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}),
      worstOpen: true,
    },
    [zonePressure.bestGuarded.zone]: {
      ...byZone[zonePressure.bestGuarded.zone],
      ...(zonePressure.bestGuarded.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}),
      ...(zonePressure.bestGuarded.zone === zonePressure.worstOpen.zone ? { worstOpen: true } : {}),
      bestGuarded: true,
    },
    [zonePressure.worstGuarded.zone]: {
      ...byZone[zonePressure.worstGuarded.zone],
      ...(zonePressure.worstGuarded.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}),
      ...(zonePressure.worstGuarded.zone === zonePressure.worstOpen.zone ? { worstOpen: true } : {}),
      ...(zonePressure.worstGuarded.zone === zonePressure.bestGuarded.zone ? { bestGuarded: true } : {}),
      worstGuarded: true,
    },
  };
}

function formatMaybeTitle(value: string | null) {
  return value
    ? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "None";
}
