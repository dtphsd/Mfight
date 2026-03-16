import { useState } from "react";
import type { ActiveCombatEffect } from "@/modules/combat";

export function SilhouetteStatusEffects({ effects }: { effects: ActiveCombatEffect[] }) {
  return <StatusEffectsHeader effects={effects} />;
}

function StatusEffectsHeader({ effects }: { effects: ActiveCombatEffect[] }) {
  if (effects.length === 0) {
    return <div style={{ minWidth: "40px" }} />;
  }

  const visibleEffects = effects.slice(0, 3);
  const hiddenCount = Math.max(0, effects.length - visibleEffects.length);

  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center", minWidth: 0, flex: 1 }}>
      {visibleEffects.map((effect) => (
        <StatusEffectBadge key={effect.id} effect={effect} />
      ))}
      {hiddenCount > 0 ? <StatusEffectsOverflow effects={effects.slice(3)} hiddenCount={hiddenCount} /> : null}
    </div>
  );
}

function StatusEffectBadge({ effect }: { effect: ActiveCombatEffect }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const accent = getEffectAccent(effect.kind);

  return (
    <div style={{ position: "relative", display: "grid", justifyItems: "center", alignItems: "center", flexShrink: 0 }}>
      <button
        type="button"
        aria-label={`View effect ${effect.name}`}
        onMouseEnter={() => setPopupOpen(true)}
        onMouseLeave={() => setPopupOpen(false)}
        onFocus={() => setPopupOpen(true)}
        onBlur={() => setPopupOpen(false)}
        style={{
          width: "18px",
          height: "18px",
          minWidth: 0,
          borderRadius: "999px",
          border: `1px solid ${accent.ring}`,
          background: accent.background,
          color: accent.text,
          cursor: "default",
          padding: "0",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: "8px", lineHeight: 1, fontWeight: 900 }}>{accent.icon}</span>
        <span
          style={{
            position: "absolute",
            right: "-4px",
            bottom: "-4px",
            minWidth: "11px",
            height: "11px",
            padding: "0 2px",
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            background: "rgba(18,16,15,0.98)",
            border: `1px solid ${accent.ring}`,
            color: accent.text,
            fontSize: "6px",
            fontWeight: 900,
          }}
        >
          {effect.turnsRemaining}
        </span>
      </button>
      {popupOpen ? <StatusEffectPopover effect={effect} accent={accent} align="center" /> : null}
    </div>
  );
}

function StatusEffectsOverflow({
  effects,
  hiddenCount,
}: {
  effects: ActiveCombatEffect[];
  hiddenCount: number;
}) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        aria-label={`View ${hiddenCount} more effects`}
        onMouseEnter={() => setPopupOpen(true)}
        onMouseLeave={() => setPopupOpen(false)}
        onFocus={() => setPopupOpen(true)}
        onBlur={() => setPopupOpen(false)}
        style={{
          borderRadius: "999px",
          padding: "2px 5px",
          fontSize: "8px",
          fontWeight: 800,
          color: "#e8dbc9",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          cursor: "default",
        }}
      >
        +{hiddenCount}
      </button>
      {popupOpen ? (
        <div
          style={{
            position: "absolute",
            zIndex: 30,
            top: "calc(100% + 8px)",
            right: 0,
            width: "220px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(18,16,15,0.98)",
            boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
            padding: "10px",
            display: "grid",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff4e7", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            More Effects
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {effects.map((effect) => {
              const accent = getEffectAccent(effect.kind);

              return (
                <div key={effect.id} style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "999px",
                      display: "inline-grid",
                      placeItems: "center",
                      background: accent.background,
                      border: `1px solid ${accent.ring}`,
                      color: accent.text,
                      fontSize: "8px",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {accent.icon}
                  </span>
                  <div style={{ minWidth: 0, display: "grid", gap: "2px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff4e7" }}>
                      {effect.name}{effect.stackCount > 1 ? ` x${effect.stackCount}` : ""} {effect.turnsRemaining}T
                    </div>
                    <div style={{ fontSize: "9px", color: "#d7cbbc", lineHeight: 1.3 }}>
                      {effect.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusEffectPopover({
  effect,
  accent,
  align,
}: {
  effect: ActiveCombatEffect;
  accent: ReturnType<typeof getEffectAccent>;
  align: "center" | "right";
}) {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 30,
        top: "calc(100% + 8px)",
        [align === "center" ? "left" : "right"]: align === "center" ? "50%" : 0,
        transform: align === "center" ? "translateX(-50%)" : "none",
        width: "230px",
        borderRadius: "16px",
        border: `1px solid ${accent.ring}`,
        background: "rgba(18,16,15,0.98)",
        boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
        padding: "11px",
        display: "grid",
        gap: "9px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff4e7", lineHeight: 1.15 }}>
          {effect.name}{effect.stackCount > 1 ? ` x${effect.stackCount}` : ""}
        </div>
        <div
          style={{
            borderRadius: "999px",
            padding: "5px 8px",
            background: accent.kindBackground,
            border: `1px solid ${accent.ring}`,
            color: accent.text,
            fontSize: "10px",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {effect.turnsRemaining}T
        </div>
      </div>
      <div
        style={{
          minHeight: "96px",
          borderRadius: "14px",
          border: `1px solid ${accent.ring}`,
          background: "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08), transparent 40%), linear-gradient(180deg, rgba(29,26,24,0.98), rgba(14,12,11,0.98))",
          display: "grid",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "12px",
            borderRadius: "999px",
            background: accent.halo,
            filter: "blur(8px)",
            opacity: 0.85,
          }}
        />
        <div style={{ position: "relative", display: "grid", gap: "4px", justifyItems: "center" }}>
          <div style={{ fontSize: "34px", lineHeight: 1 }}>{accent.icon}</div>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: accent.text }}>
            {effect.kind}
          </div>
        </div>
      </div>
      <div style={{ fontSize: "10px", lineHeight: 1.35, color: "#d7cbbc" }}>{effect.description}</div>
      <div style={{ display: "grid", gap: "3px" }}>
        {formatEffectLines(effect).map((line) => (
          <div key={`${effect.id}-${line}`} style={{ fontSize: "9px", color: "#e7d9c8", lineHeight: 1.25 }}>
            {line}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "9px", color: "#c4b8aa" }}>
        Source {effect.sourceSkillName ? `${effect.sourceSkillName} / ` : ""}{effect.sourceName}
      </div>
    </div>
  );
}

function getEffectAccent(kind: ActiveCombatEffect["kind"]) {
  if (kind === "buff") {
    return {
      ring: "rgba(92,199,178,0.3)",
      background: "linear-gradient(180deg, rgba(92,199,178,0.2), rgba(92,199,178,0.08))",
      kindBackground: "linear-gradient(180deg, rgba(92,199,178,0.22), rgba(92,199,178,0.12))",
      text: "#baf1dd",
      halo: "radial-gradient(circle, rgba(92,199,178,0.24), rgba(92,199,178,0.04) 58%, transparent 78%)",
      icon: "в–І",
    };
  }

  return {
    ring: "rgba(229,115,79,0.3)",
    background: "linear-gradient(180deg, rgba(229,115,79,0.2), rgba(229,115,79,0.08))",
    kindBackground: "linear-gradient(180deg, rgba(229,115,79,0.22), rgba(229,115,79,0.12))",
    text: "#ffc4bd",
    halo: "radial-gradient(circle, rgba(229,115,79,0.24), rgba(229,115,79,0.04) 58%, transparent 78%)",
    icon: "в–ј",
  };
}

function formatEffectLines(effect: ActiveCombatEffect) {
  const lines: string[] = [];

  if (effect.modifiers.critChanceBonus !== 0) {
    lines.push(`Crit ${formatSignedNumber(effect.modifiers.critChanceBonus)}%`);
  }
  if (effect.modifiers.dodgeChanceBonus !== 0) {
    lines.push(`Dodge ${formatSignedNumber(effect.modifiers.dodgeChanceBonus)}%`);
  }
  if (effect.modifiers.blockChanceBonus !== 0) {
    lines.push(`Block ${formatSignedNumber(effect.modifiers.blockChanceBonus)}%`);
  }
  if (effect.modifiers.blockPowerBonus !== 0) {
    lines.push(`Block Power ${formatSignedNumber(effect.modifiers.blockPowerBonus)}%`);
  }
  if (effect.modifiers.outgoingDamagePercent !== 0) {
    lines.push(`Outgoing Damage ${formatSignedNumber(effect.modifiers.outgoingDamagePercent)}%`);
  }
  if (effect.modifiers.incomingDamagePercent !== 0) {
    lines.push(`Incoming Damage ${formatSignedNumber(effect.modifiers.incomingDamagePercent)}%`);
  }

  lines.push(...formatSignedDamageProfile(effect.modifiers.damageFlatBonus, "Damage"));
  lines.push(...formatSignedDamageProfile(effect.modifiers.armorFlatBonus, "Armor"));
  lines.push(...formatSignedDamageProfile(effect.modifiers.armorPenetrationPercentBonus, "Pen", true));

  if (effect.periodic.heal > 0) {
    lines.push(`Tick Heal +${effect.periodic.heal} HP`);
  }
  if (effect.periodic.damage > 0) {
    lines.push(`Tick Damage ${effect.periodic.damage} HP`);
  }

  lines.push(
    ...Object.entries(effect.periodic.resourceDelta)
      .filter(([, value]) => (value ?? 0) !== 0)
      .map(([resource, value]) => `Tick ${formatTitle(resource)} ${formatSignedNumber(value ?? 0)}`)
  );

  return lines.length > 0 ? lines : ["No direct stat changes"];
}

function formatSignedDamageProfile(
  profile: ActiveCombatEffect["modifiers"]["damageFlatBonus"] | ActiveCombatEffect["modifiers"]["armorFlatBonus"] | ActiveCombatEffect["modifiers"]["armorPenetrationPercentBonus"],
  suffix: string,
  percent = false
) {
  return Object.entries(profile)
    .filter(([, value]) => value !== 0)
    .map(([type, value]) => `${formatTitle(type)} ${suffix} ${formatSignedNumber(value)}${percent ? "%" : ""}`);
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatTitle(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
