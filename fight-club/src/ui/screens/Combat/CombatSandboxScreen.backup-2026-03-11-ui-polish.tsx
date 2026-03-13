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

const playerEquipmentSlots: EquipmentSlot[] = ["helmet", "armor", "mainHand", "offHand", "gloves", "accessory", "boots"];

const shellStyle: CSSProperties = {
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.1)",
  background:
    "linear-gradient(180deg, rgba(18,16,15,0.98), rgba(10,10,10,0.98)), radial-gradient(circle at top, rgba(255,193,122,0.08), transparent 28%)",
  boxShadow: "0 28px 70px rgba(0,0,0,0.34)",
};

const panelStyle: CSSProperties = {
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))",
};

const buttonStyle: CSSProperties = {
  padding: "8px 11px",
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
  background: "linear-gradient(180deg, rgba(207,106,50,0.28), rgba(207,106,50,0.16))",
  color: "#ffe2c2",
  boxShadow: "0 12px 28px rgba(207,106,50,0.18)",
};

const statMeta: Record<CharacterStatName, { short: string; color: string; background: string; border: string }> = {
  strength: { short: "STR", color: "#f0a286", background: "rgba(229,115,79,0.14)", border: "rgba(229,115,79,0.28)" },
  agility: { short: "AGI", color: "#87e2cf", background: "rgba(92,199,178,0.14)", border: "rgba(92,199,178,0.28)" },
  rage: { short: "RAG", color: "#ee9abb", background: "rgba(216,93,145,0.14)", border: "rgba(216,93,145,0.28)" },
  endurance: { short: "END", color: "#ebcf8b", background: "rgba(214,177,95,0.14)", border: "rgba(214,177,95,0.28)" },
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
  const latestRoundSummary =
    sandbox.latestRoundEntries.length > 0
      ? sandbox.latestRoundEntries.map((entry) => `${entry.attackerName}: ${entry.commentary}`).join(" | ")
      : "No round resolved yet.";

  return (
    <section data-testid="combat-sandbox-screen" style={{ display: "grid", gap: "12px" }}>
      <div style={{ ...shellStyle, padding: "14px", display: "grid", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px", alignItems: "start" }}>
          <SidePanel
            eyebrow="Player"
            title={sandbox.playerCharacter.name}
            note={formatMaybeTitle(sandbox.metrics.weaponDamageType)}
            silhouette={
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
                zoneHighlights={buildZoneHighlights(sandbox.metrics.matchup.botZonePressure)}
                equipmentSlots={playerEquipment}
                onEquipmentSlotClick={(slot) => setSelectedEquipmentSlot(slot)}
                onDefenseToggle={sandbox.toggleDefenseZone}
              />
            }
            sidebar={
              <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
                <MiniPanel title="Utility">
                  <div style={{ display: "grid", gap: "6px" }}>
                    <button type="button" aria-label="Open builder" onClick={() => setBuilderOpen(true)} style={buttonStyle}>Builder</button>
                    <button type="button" aria-label="Open inventory" onClick={() => setInventoryOpen(true)} style={buttonStyle}>Inventory</button>
                  </div>
                </MiniPanel>
                <MiniPanel title="Build">
                  <StatTuning stats={sandbox.playerCharacter.baseStats} unspentPoints={sandbox.playerCharacter.unspentStatPoints} onIncrease={sandbox.increaseStat} onDecrease={sandbox.decreaseStat} />
                </MiniPanel>
                <MiniPanel title="Snapshot">
                  <MetricGrid
                    items={[
                      { label: "HP", value: String(sandbox.metrics.maxHp) },
                      { label: "DMG", value: String(sandbox.metrics.totalDamage), tone: "warm" },
                      { label: "Armor", value: String(sandbox.metrics.totalArmor) },
                      { label: "Crit", value: `${sandbox.metrics.baseCritChance + sandbox.metrics.critChanceBonus}%` },
                      { label: "Dodge", value: `${sandbox.metrics.baseDodgeChance + sandbox.metrics.dodgeChanceBonus}%` },
                      { label: "Type", value: formatMaybeTitle(sandbox.metrics.weaponDamageType) },
                    ]}
                  />
                </MiniPanel>
              </div>
            }
            blocks={[]}
            overlay={
              selectedEquipmentSlot ? (
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
              ) : null
            }
          />

          <div data-testid="fight-setup-panel" style={{ ...shellStyle, padding: "14px", display: "grid", gap: "12px", alignContent: "start" }}>
            <PanelHeader eyebrow="Control Hub" title="Fight Setup" note={selectedActionLabel} />

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.92fr) minmax(0, 1.08fr)", gap: "10px", alignItems: "stretch" }}>
                <MiniPanel title="Fight Controls">
                  <div style={{ display: "grid", gap: "8px", height: "100%", alignContent: "space-between" }}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <button type="button" aria-label="Start fight" onClick={sandbox.startFight} style={primaryButtonStyle}>Start Fight</button>
                    </div>
                    <div style={{ display: "grid", gap: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.68 }}>Current Action</div>
                        <div style={{ fontSize: "10px", opacity: 0.66 }}>{sandbox.combatState ? `Round ${sandbox.combatState.round}` : "Pre-fight"}</div>
                      </div>
                      <div data-testid="selected-action-label" style={{ fontSize: "15px", fontWeight: 800 }}>{selectedActionLabel}</div>
                    </div>
                  </div>
                </MiniPanel>

                <MiniPanel title="Attack Target + Round">
                  <div style={{ display: "grid", gap: "8px", height: "100%", alignContent: "space-between" }}>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "6px" }}>
                        {sandbox.zones.map((zone) => (
                          <button
                            key={zone}
                            type="button"
                            aria-label={`Select attack zone ${zone}`}
                            onClick={() => sandbox.setSelectedAttackZone(zone)}
                            style={{
                              ...buttonStyle,
                              ...(sandbox.selectedAttackZone === zone ? { background: "rgba(207,106,50,0.16)", border: "1px solid rgba(255,171,97,0.4)", color: "#ffe2c2" } : {}),
                              padding: "10px 4px",
                              fontSize: "10px",
                              textTransform: "capitalize",
                            }}
                          >
                            {zone}
                          </button>
                        ))}
                      </div>
                      <ResourceGrid resources={sandbox.playerResources} />
                    </div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <button type="button" aria-label="Resolve round" onClick={sandbox.resolveNextRound} style={primaryButtonStyle}>Resolve Round</button>
                      <div data-testid="latest-round-summary" style={{ display: "none" }}>{latestRoundSummary}</div>
                    </div>
                  </div>
                </MiniPanel>
              </div>

              <MiniPanel title="Combat Actions">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <ActionRail
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
                          description={skill.description}
                          icon={getSkillIcon(skill.name)}
                        />
                      );
                    })}
                  />
                  <ActionRail
                    title="Consumables"
                    emptyLabel="No consumables."
                    entries={sandbox.availableConsumables.map((entry) => (
                      <ActionButton
                        key={entry.item.code}
                        selected={sandbox.selectedConsumableCode === entry.item.code}
                        onClick={() => sandbox.setSelectedConsumable(sandbox.selectedConsumableCode === entry.item.code ? null : entry.item.code)}
                        label={entry.item.name}
                        note={`x${entry.quantity}`}
                        description={entry.item.description}
                        icon={getConsumableIcon(entry.item.name)}
                      />
                    ))}
                  />
                </div>
              </MiniPanel>
            </div>

          </div>

          <SidePanel
            eyebrow="Target"
            title="Bot"
            note={formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType)}
            silhouette={
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
                zoneHighlights={buildZoneHighlights(sandbox.metrics.matchup.playerZonePressure)}
                onAttackSelect={sandbox.setSelectedAttackZone}
              />
            }
            sidebar={
              <div style={{ display: "grid", gap: "8px", alignContent: "start", height: "100%" }}>
                <MiniPanel title="Snapshot">
                  <StatGrid stats={sandbox.botSnapshot.stats} />
                </MiniPanel>
                <MiniPanel title="Pressure">
                  <MetricGrid
                    items={[
                      { label: "HP", value: String(sandbox.metrics.opponentMaxHp) },
                      { label: "DMG", value: String(sandbox.metrics.opponentTotalDamage), tone: "warm" },
                      { label: "Armor", value: String(sandbox.metrics.opponentTotalArmor) },
                      { label: "Type", value: formatMaybeTitle(sandbox.metrics.opponentWeaponDamageType) },
                    ]}
                  />
                </MiniPanel>
                <MiniPanel title="Resources">
                  <ResourceGrid resources={sandbox.botResources} />
                </MiniPanel>
              </div>
            }
            blocks={[]}
          />
        </div>
      </div>

      <div style={{ ...shellStyle, padding: "14px" }}>
        <BattleLogPanel entries={sandbox.battleLogEntries} playerId={sandbox.playerSnapshot.characterId} botId={sandbox.botSnapshot.characterId} />
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

function SidePanel({
  eyebrow,
  title,
  note,
  silhouette,
  sidebar = null,
  blocks,
  overlay = null,
}: {
  eyebrow: string;
  title: string;
  note: string;
  silhouette: ReactNode;
  sidebar?: ReactNode;
  blocks: ReactNode[];
  overlay?: ReactNode;
}) {
  return (
    <div style={{ ...shellStyle, padding: "14px", display: "grid", gap: "10px", alignContent: "start" }}>
      <PanelHeader eyebrow={eyebrow} title={title} note={note} />
      <div style={{ ...panelStyle, padding: "10px", position: "relative" }}>
        <div style={sidebar ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 132px", gap: "10px", alignItems: "stretch" } : undefined}>
          {silhouette}
          {sidebar}
        </div>
        {overlay}
      </div>
      {blocks.length > 0 ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>{blocks.slice(0, 2)}</div> : null}
      {blocks.length > 2 ? blocks[2] : null}
    </div>
  );
}

function PanelHeader({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div style={{ display: "grid", gap: "2px" }}>
      <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.64 }}>{eyebrow}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline", flexWrap: "wrap" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: "10px", opacity: 0.66 }}>{note}</div>
      </div>
    </div>
  );
}

function MiniPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ ...panelStyle, padding: "7px", display: "grid", gap: "5px" }}>
      <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.66 }}>{title}</div>
      {children}
    </div>
  );
}

function MetricGrid({ items }: { items: Array<{ label: string; value: string; tone?: "neutral" | "warm" }> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px" }}>
      {items.map((item) => (
        <MetricChip key={`${item.label}-${item.value}`} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </div>
  );
}

function MetricChip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warm" }) {
  const palette = tone === "warm"
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
    <div style={{ display: "grid", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <div style={{ fontSize: "8px", textTransform: "uppercase", opacity: 0.68 }}>Inline Build</div>
        <div style={{ fontSize: "8px", opacity: 0.68 }}>Pts {unspentPoints}</div>
      </div>
      {(Object.entries(stats) as Array<[CharacterStatName, number]>).map(([name, value]) => (
        <div key={name} style={{ borderRadius: "10px", padding: "4px 5px", background: statMeta[name].background, border: `1px solid ${statMeta[name].border}`, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px", alignItems: "center" }}>
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
    <button type="button" onClick={onClick} style={{ width: "14px", height: "14px", borderRadius: "999px", border: `1px solid ${color}66`, background: "rgba(255,255,255,0.07)", color, cursor: "pointer", padding: 0, fontWeight: 800, lineHeight: 1, fontSize: "8px" }}>
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
          <div key={name} style={{ borderRadius: "10px", padding: "6px 4px", background: meta.background, border: `1px solid ${meta.border}`, textAlign: "center" }}>
            <div style={{ fontSize: "7px", opacity: 0.9, textTransform: "uppercase", color: meta.color }}>{meta.short}</div>
            <div style={{ fontWeight: 700, marginTop: "2px", fontSize: "11px" }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

function ResourceGrid({ resources }: { resources: { rage: number; guard: number; momentum: number; focus: number } | null }) {
  const items = [
    { key: "rage", label: "Rage", color: "#ee9abb" },
    { key: "guard", label: "Guard", color: "#b7d5ff" },
    { key: "momentum", label: "Momentum", color: "#f0a286" },
    { key: "focus", label: "Focus", color: "#87e2cf" },
  ] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "5px" }}>
      {items.map((item) => (
        <div key={item.key} style={{ borderRadius: "10px", padding: "7px 4px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
          <div style={{ fontSize: "7px", opacity: 0.72, color: item.color, textTransform: "uppercase" }}>{item.label}</div>
          <div style={{ fontSize: "13px", fontWeight: 800 }}>{resources?.[item.key] ?? 0}</div>
        </div>
      ))}
    </div>
  );
}

function ActionRail({
  title,
  entries,
  emptyLabel,
  basicActionSelected = false,
  onSelectBasicAction,
}: {
  title: string;
  entries: ReactNode[];
  emptyLabel: string;
  basicActionSelected?: boolean;
  onSelectBasicAction?: () => void;
}) {
  const maxSlots = 5;
  const content = onSelectBasicAction
    ? [
        <ActionButton key="basic" selected={basicActionSelected} onClick={onSelectBasicAction} label="Basic Attack" note="No cost" />,
        ...entries,
      ]
    : entries;
  const visibleEntries = content.slice(0, maxSlots);
  const placeholders = Array.from({ length: Math.max(0, maxSlots - visibleEntries.length) }, (_, index) => (
    <ActionSlotPlaceholder key={`placeholder-${title}-${index}`} />
  ));

  return (
    <div style={{ ...panelStyle, padding: "6px", display: "grid", gap: "4px" }}>
      <div style={{ fontSize: "9px", fontWeight: 700, color: "#efe6da" }}>{title}</div>
      {content.length === 0 ? <div style={{ fontSize: "9px", opacity: 0.58 }}>{emptyLabel}</div> : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gridTemplateRows: "32px",
          gap: "4px",
          alignItems: "center",
          minHeight: "32px",
        }}
      >
        {visibleEntries}
        {placeholders}
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
  description,
  icon,
}: {
  selected: boolean;
  muted?: boolean;
  onClick: () => void;
  label: string;
  note: string;
  description?: string;
  icon?: string;
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const visual = getActionVisual(label);

  return (
    <div style={{ position: "relative", display: "grid", justifyItems: "center", alignItems: "center" }}>
      <button
        type="button"
        aria-label={`Select ${label}`}
        onClick={onClick}
        onMouseEnter={() => setPopupOpen(true)}
        onMouseLeave={() => setPopupOpen(false)}
        onFocus={() => setPopupOpen(true)}
        onBlur={() => setPopupOpen(false)}
        style={{
          width: "28px",
          height: "28px",
          minWidth: 0,
          borderRadius: "999px",
          border: selected ? "1px solid rgba(255,171,97,0.68)" : `1px solid ${visual.ring}`,
          background: selected
            ? "linear-gradient(180deg, rgba(207,106,50,0.24), rgba(207,106,50,0.12))"
            : visual.buttonBackground,
          color: muted ? "rgba(255,248,237,0.56)" : "#fff8ed",
          cursor: "pointer",
          padding: "0",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          boxShadow: selected ? "0 10px 22px rgba(207,106,50,0.18)" : "none",
          fontSize: "13px",
          lineHeight: 1,
          overflow: "hidden",
        }}
      >
        <span aria-hidden="true">{icon ?? "•"}</span>
      </button>
      {popupOpen ? (
        <div
          style={{
            position: "absolute",
            zIndex: 5,
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "190px",
            borderRadius: "14px",
            border: `1px solid ${visual.ring}`,
            background: "rgba(18,16,15,0.98)",
            boxShadow: "0 18px 34px rgba(0,0,0,0.3)",
            padding: "9px",
            display: "grid",
            gap: "7px",
          }}
        >
          <div
            style={{
              minHeight: "88px",
              borderRadius: "12px",
              border: `1px solid ${visual.ring}`,
              background: visual.cardBackground,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "12px",
                borderRadius: "999px",
                background: visual.halo,
                filter: "blur(8px)",
                opacity: 0.85,
              }}
            />
            <div style={{ position: "relative", fontSize: "42px", lineHeight: 1 }}>{icon ?? "•"}</div>
          </div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff4e7" }}>{label}</div>
          {description ? <div style={{ fontSize: "10px", lineHeight: 1.35, color: "#d7cbbc" }}>{description}</div> : null}
          <div style={{ fontSize: "9px", color: "#c4b8aa" }}>{note}</div>
        </div>
      ) : null}
    </div>
  );
}

function ActionSlotPlaceholder() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "28px",
        height: "28px",
        justifySelf: "center",
        borderRadius: "999px",
        border: "1px dashed rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    />
  );
}

function buildZoneHighlights(zonePressure: {
  bestOpen: { zone: CombatZone };
  worstOpen: { zone: CombatZone };
  bestGuarded: { zone: CombatZone };
  worstGuarded: { zone: CombatZone };
  zones: Array<{ zone: CombatZone; openDamage: number; guardedDamage: number }>;
}) {
  const byZone = Object.fromEntries(zonePressure.zones.map((entry) => [entry.zone, { openDamage: entry.openDamage, guardedDamage: entry.guardedDamage }])) as Record<CombatZone, { openDamage: number; guardedDamage: number }>;
  return {
    [zonePressure.bestOpen.zone]: { ...byZone[zonePressure.bestOpen.zone], bestOpen: true },
    [zonePressure.worstOpen.zone]: { ...byZone[zonePressure.worstOpen.zone], ...(zonePressure.worstOpen.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}), worstOpen: true },
    [zonePressure.bestGuarded.zone]: { ...byZone[zonePressure.bestGuarded.zone], ...(zonePressure.bestGuarded.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}), ...(zonePressure.bestGuarded.zone === zonePressure.worstOpen.zone ? { worstOpen: true } : {}), bestGuarded: true },
    [zonePressure.worstGuarded.zone]: { ...byZone[zonePressure.worstGuarded.zone], ...(zonePressure.worstGuarded.zone === zonePressure.bestOpen.zone ? { bestOpen: true } : {}), ...(zonePressure.worstGuarded.zone === zonePressure.worstOpen.zone ? { worstOpen: true } : {}), ...(zonePressure.worstGuarded.zone === zonePressure.bestGuarded.zone ? { bestGuarded: true } : {}), worstGuarded: true },
  };
}

function getSkillIcon(skillName: string) {
  const normalizedName = skillName.toLowerCase();

  if (normalizedName.includes("shield")) {
    return "🛡";
  }

  if (normalizedName.includes("pierc") || normalizedName.includes("lunge") || normalizedName.includes("dagger")) {
    return "🗡";
  }

  if (normalizedName.includes("cleave") || normalizedName.includes("slash") || normalizedName.includes("sword")) {
    return "⚔";
  }

  return "✦";
}

function getConsumableIcon(itemName: string) {
  const normalizedName = itemName.toLowerCase();

  if (normalizedName.includes("potion")) {
    return "🧪";
  }

  if (normalizedName.includes("bandage")) {
    return "🩹";
  }

  return "◉";
}

function getActionVisual(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("potion") || normalized.includes("elixir")) {
    return {
      ring: "rgba(93, 197, 177, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(67,142,126,0.22), rgba(24,53,49,0.3))",
      innerBackground:
        "radial-gradient(circle at 30% 25%, rgba(180,255,238,0.26), transparent 42%), linear-gradient(180deg, rgba(42,94,84,0.62), rgba(18,36,33,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(107,233,212,0.24), transparent 40%), linear-gradient(180deg, rgba(17,44,40,0.98), rgba(8,18,17,0.98))",
      halo: "radial-gradient(circle, rgba(94,233,209,0.42), rgba(94,233,209,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("bandage")) {
    return {
      ring: "rgba(234, 208, 153, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(166,136,79,0.18), rgba(49,39,21,0.28))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,241,202,0.24), transparent 40%), linear-gradient(180deg, rgba(96,73,35,0.54), rgba(34,26,15,0.92))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(255,224,162,0.18), transparent 40%), linear-gradient(180deg, rgba(48,34,20,0.98), rgba(21,15,10,0.98))",
      halo: "radial-gradient(circle, rgba(255,227,175,0.32), rgba(255,227,175,0.06) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("shield") || normalized.includes("guard")) {
    return {
      ring: "rgba(117, 176, 255, 0.26)",
      buttonBackground: "linear-gradient(180deg, rgba(73,112,171,0.2), rgba(22,34,55,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(212,235,255,0.24), transparent 40%), linear-gradient(180deg, rgba(42,65,103,0.62), rgba(17,27,46,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(111,173,255,0.22), transparent 40%), linear-gradient(180deg, rgba(17,29,49,0.98), rgba(9,16,28,0.98))",
      halo: "radial-gradient(circle, rgba(120,180,255,0.34), rgba(120,180,255,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("slash") || normalized.includes("sword") || normalized.includes("cleave")) {
    return {
      ring: "rgba(224, 130, 91, 0.28)",
      buttonBackground: "linear-gradient(180deg, rgba(173,85,52,0.2), rgba(54,25,18,0.32))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(255,217,192,0.22), transparent 40%), linear-gradient(180deg, rgba(112,51,35,0.62), rgba(38,17,11,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(235,143,105,0.22), transparent 40%), linear-gradient(180deg, rgba(50,23,17,0.98), rgba(22,10,8,0.98))",
      halo: "radial-gradient(circle, rgba(236,146,108,0.36), rgba(236,146,108,0.08) 58%, transparent 78%)",
    };
  }

  if (normalized.includes("pierc") || normalized.includes("lunge") || normalized.includes("dagger")) {
    return {
      ring: "rgba(180, 140, 233, 0.22)",
      buttonBackground: "linear-gradient(180deg, rgba(112,82,164,0.18), rgba(33,22,53,0.3))",
      innerBackground:
        "radial-gradient(circle at 32% 25%, rgba(232,215,255,0.22), transparent 40%), linear-gradient(180deg, rgba(72,49,110,0.62), rgba(25,16,42,0.94))",
      cardBackground:
        "radial-gradient(circle at 50% 18%, rgba(195,154,255,0.18), transparent 40%), linear-gradient(180deg, rgba(38,24,59,0.98), rgba(19,11,30,0.98))",
      halo: "radial-gradient(circle, rgba(197,158,255,0.3), rgba(197,158,255,0.06) 58%, transparent 78%)",
    };
  }

  return {
    ring: "rgba(255,255,255,0.12)",
    buttonBackground: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    innerBackground:
      "radial-gradient(circle at 32% 25%, rgba(255,255,255,0.14), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    cardBackground:
      "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(180deg, rgba(29,26,24,0.98), rgba(14,12,11,0.98))",
    halo: "radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 58%, transparent 78%)",
  };
}

function formatMaybeTitle(value: string | null) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "None";
}
