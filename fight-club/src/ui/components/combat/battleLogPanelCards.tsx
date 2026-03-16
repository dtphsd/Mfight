import { getBattleLogVisibleTags, type BattleLogEntry } from "@/ui/components/combat/battleLogFormatting";
import {
  formatBattleLogTimestamp,
  formatMaybeTitle,
  formatResourceGainPills,
  getBattleLogTheme,
  getDamagePillIcon,
  PotionIcon,
  ShieldSlashIcon,
} from "@/ui/components/combat/battleLogPanelHelpers";
import {
  BattleLogSection,
  EventPill,
  MetaPill,
  TagPill,
} from "@/ui/components/combat/battleLogPanelPrimitives";

export function BattleLogCard({
  entry,
  playerId,
  botId,
}: {
  entry: BattleLogEntry;
  playerId: string;
  botId: string;
}) {
  const attackerAccent =
    entry.attackerId === playerId
      ? "#ff8f73"
      : entry.attackerId === botId
        ? "#78bdff"
        : "#b8b1a5";
  const actorLabel =
    entry.attackerId === playerId
      ? "Player"
      : entry.attackerId === botId
        ? "Bot"
        : "System";
  const entryTheme = getBattleLogTheme(entry.type);
  const timeLabel = formatBattleLogTimestamp(entry.timestamp);
  const visibleTags = getBattleLogVisibleTags(entry);
  const detailPills = [
    entry.defenderName && !entry.isEffectTick ? <MetaPill key="target" label="Target" value={entry.defenderName} /> : null,
    entry.attackZone && !entry.isEffectTick ? <MetaPill key="zone" label="Zone" value={formatMaybeTitle(entry.attackZone)} /> : null,
    entry.damageType && !entry.isEffectTick ? <MetaPill key="type" label="Type" value={formatMaybeTitle(entry.damageType)} /> : null,
    entry.damage !== null && entry.damage > 0 ? (
      <EventPill key="damage" tone={entry.type} label={`-${entry.damage} HP`} icon={getDamagePillIcon(entry.type)} />
    ) : null,
    entry.healedHp > 0 ? (
      <EventPill key="healed" tone="consumable" label={`+${entry.healedHp} HP`} icon={<PotionIcon size={12} />} />
    ) : null,
    entry.blockedPercent !== null ? (
      <EventPill key="blocked" tone="block" label={`Block ${entry.blockedPercent}%`} icon={<ShieldSlashIcon size={12} />} />
    ) : null,
    ...formatResourceGainPills(entry.attackerResourceGain, "Gain").map((pill) => (
      <MetaPill key={`attacker-${pill.label}`} label={pill.label} value={pill.value} />
    )),
    ...formatResourceGainPills(entry.defenderResourceGain, "Def").map((pill) => (
      <MetaPill key={`defender-${pill.label}`} label={pill.label} value={pill.value} />
    )),
  ].filter(Boolean);

  return (
    <div
      data-testid="battle-log-entry"
      style={{
        borderRadius: "18px",
        padding: "11px 13px",
        background:
          `linear-gradient(180deg, ${entryTheme.background}, rgba(255,255,255,0.015)), radial-gradient(circle at top right, ${entryTheme.glow}, transparent 34%)`,
        border: `1px solid ${entryTheme.border}`,
        boxShadow: `0 12px 24px ${entryTheme.shadow}`,
        display: "grid",
        gap: "9px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: "4px",
          background: `linear-gradient(180deg, ${entryTheme.badgeText}, transparent)`,
          opacity: 0.85,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: entryTheme.badgeBackground,
              color: entryTheme.badgeText,
              fontSize: "11px",
              fontWeight: 800,
              border: `1px solid ${entryTheme.badgeBorder}`,
            }}
          >
            {entryTheme.icon}
            <span>{entryTheme.label}</span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.04)",
              color: attackerAccent,
              fontSize: "11px",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {actorLabel}
          </span>
          <span style={{ fontSize: "11px", opacity: 0.72 }}>Round {entry.round}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {entry.attackerName ? (
            <span style={{ fontSize: "11px", color: attackerAccent, fontWeight: 700 }}>{entry.attackerName}</span>
          ) : null}
          <span style={{ fontSize: "11px", opacity: 0.52 }}>{timeLabel}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "3px" }}>
        <div style={{ fontSize: "12px", lineHeight: 1.5, color: "#fff7ee", fontWeight: 700 }}>{entry.headline}</div>
        {entry.explanation ? (
          <div style={{ fontSize: "10px", lineHeight: 1.4, color: "#d8d1c6", opacity: 0.82 }}>{entry.explanation}</div>
        ) : null}
      </div>

      {visibleTags.length > 0 ? (
        <BattleLogSection label="Signals">
          {visibleTags.map((tag) => (
            <TagPill key={`${entry.id}-${tag}`} value={tag} />
          ))}
        </BattleLogSection>
      ) : null}

      {detailPills.length > 0 ? <BattleLogSection label="Details">{detailPills}</BattleLogSection> : null}
    </div>
  );
}
