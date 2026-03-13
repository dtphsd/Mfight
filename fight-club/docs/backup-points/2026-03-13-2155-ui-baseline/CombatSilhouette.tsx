import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ActiveCombatEffect, CombatZone, RoundResult } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import { ItemPresentationCard } from "@/ui/components/combat/ItemPresentationCard";

interface CombatSilhouetteProps {
  title: string;
  currentHp: number;
  maxHp: number;
  selectedAttackZone?: CombatZone | null;
  selectedDefenseZones?: CombatZone[];
  lastIncomingZone?: CombatZone | null;
  lastOutgoingZone?: CombatZone | null;
  incomingResult?: RoundResult | null;
  outgoingResult?: RoundResult | null;
  interactive?: boolean;
  zoneHighlights?: Partial<Record<CombatZone, ZoneHighlightFlags>>;
  activeEffects?: ActiveCombatEffect[];
  equipmentSlots?: Array<{ slot: EquipmentSlot; item: Item | null }>;
  onEquipmentSlotClick?: (slot: EquipmentSlot) => void;
  onAttackSelect?: (zone: CombatZone) => void;
  onDefenseToggle?: (zone: CombatZone) => void;
}

interface ZoneHighlightFlags {
  bestOpen?: boolean;
  worstOpen?: boolean;
  bestGuarded?: boolean;
  worstGuarded?: boolean;
  openDamage?: number;
  guardedDamage?: number;
}

type MarkerKey = "hit" | "block" | "crit" | "penetration" | "dodge";

interface MarkerDefinition {
  key: MarkerKey;
  label: string;
  background: string;
  glow: string;
}

const zoneRects: Record<CombatZone, CSSProperties> = {
  head: { top: 16, left: 74, width: 72, height: 42, borderRadius: 24 },
  chest: { top: 70, left: 58, width: 104, height: 58, borderRadius: 24 },
  belly: { top: 132, left: 64, width: 92, height: 48, borderRadius: 20 },
  waist: { top: 184, left: 70, width: 80, height: 36, borderRadius: 18 },
  legs: { top: 228, left: 58, width: 104, height: 104, borderRadius: 28 },
};

const markerDefinitions: Record<MarkerKey, MarkerDefinition> = {
  hit: {
    key: "hit",
    label: "hit",
    background: "rgba(255,179,108,0.22)",
    glow: "rgba(255,179,108,0.35)",
  },
  block: {
    key: "block",
    label: "block",
    background: "rgba(105,219,194,0.2)",
    glow: "rgba(105,219,194,0.34)",
  },
  crit: {
    key: "crit",
    label: "crit",
    background: "rgba(232,72,72,0.22)",
    glow: "rgba(232,72,72,0.34)",
  },
  penetration: {
    key: "penetration",
    label: "penetration",
    background: "rgba(196,59,42,0.22)",
    glow: "rgba(196,59,42,0.34)",
  },
  dodge: {
    key: "dodge",
    label: "dodge",
    background: "rgba(90,192,255,0.22)",
    glow: "rgba(90,192,255,0.35)",
  },
};

const equipmentSlotPositions: Record<EquipmentSlot, CSSProperties> = {
  helmet: { top: 8, left: 2 },
  armor: { top: 8, left: 165 },
  mainHand: { top: 82, left: 2 },
  offHand: { top: 82, left: 165 },
  gloves: { top: 156, left: 2 },
  accessory: { top: 220, left: 165 },
  boots: { top: 290, left: 165 },
};

export function CombatSilhouette({
  title,
  currentHp,
  maxHp,
  selectedAttackZone,
  selectedDefenseZones = [],
  lastIncomingZone,
  lastOutgoingZone,
  incomingResult = null,
  outgoingResult = null,
  interactive = false,
  zoneHighlights = {},
  activeEffects = [],
  equipmentSlots = [],
  onEquipmentSlotClick,
  onAttackSelect,
  onDefenseToggle,
}: CombatSilhouetteProps) {
  const [hoveredEquipmentSlot, setHoveredEquipmentSlot] = useState<EquipmentSlot | null>(null);
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const hpColor = getHpColor(hpPercent);

  return (
    <div style={{ display: "grid", gap: "10px", justifyItems: "center", width: "220px", margin: "0 auto" }}>
      <div style={{ width: "220px" }}>
        <div style={{ display: "grid", gap: "5px", marginBottom: "0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontWeight: 700, alignItems: "center" }}>
            <span style={{ letterSpacing: "0.04em", flexShrink: 0 }}>{title}</span>
            <StatusEffectsHeader effects={activeEffects} />
            <span style={{ color: "rgba(255,244,231,0.78)", fontSize: "12px", flexShrink: 0 }}>
              {currentHp}/{maxHp}
            </span>
          </div>
        </div>
        <div
          style={{
            height: "14px",
            borderRadius: "999px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${hpColor.from}, ${hpColor.to})`,
              transition: "width 180ms ease",
              boxShadow: "0 0 18px rgba(255,159,98,0.18)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "220px",
          height: "360px",
          borderRadius: "28px",
          background:
            "radial-gradient(circle at top, rgba(120,189,255,0.14), transparent 22%), radial-gradient(circle at bottom, rgba(255,179,108,0.08), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 0 36px rgba(0,0,0,0.24), 0 18px 34px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 220 360"
          width="220"
          height="360"
          style={{ position: "absolute", inset: 0, opacity: 0.38 }}
        >
          <path
            d="M111 34c20 0 37 18 37 39 0 16-9 29-22 35 10 8 15 22 18 35l10 42c2 8 8 15 15 19l8 4-11 14-12-6-6 25 13 65-18 8-21-75h-8l-21 75-18-8 13-65-6-25-12 6-11-14 8-4c7-4 13-11 15-19l10-42c3-13 8-27 18-35-13-6-22-19-22-35 0-21 17-39 37-39Z"
            fill="rgba(255,255,255,0.82)"
          />
        </svg>

        {(Object.entries(zoneRects) as Array<[CombatZone, CSSProperties]>).map(([zone, rect]) => {
          const selectedAttack = selectedAttackZone === zone;
          const selectedDefense = selectedDefenseZones.includes(zone);
          const incoming = lastIncomingZone === zone;
          const outgoing = lastOutgoingZone === zone;
          const highlight = zoneHighlights[zone];
          const zoneGlow = getZoneHighlightGlow(highlight);

          return (
            <button
              key={zone}
              type="button"
              aria-label={`${title} zone ${zone}`}
              onClick={() => {
                if (!interactive) {
                  return;
                }

                onAttackSelect?.(zone);
                onDefenseToggle?.(zone);
              }}
              style={{
                position: "absolute",
                ...rect,
                border: selectedAttack
                  ? "2px solid #ffb36c"
                  : selectedDefense
                    ? "2px solid #69dbc2"
                    : incoming
                      ? "2px solid #ff6b57"
                      : outgoing
                        ? "2px solid #e9d06b"
                        : "1px solid rgba(255,255,255,0.14)",
                background: selectedAttack
                  ? "rgba(255,179,108,0.24)"
                  : selectedDefense
                    ? "rgba(105,219,194,0.2)"
                    : incoming
                      ? "rgba(255,107,87,0.24)"
                      : outgoing
                        ? "rgba(233,208,107,0.2)"
                        : "rgba(255,255,255,0.05)",
                cursor: interactive ? "pointer" : "default",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "capitalize",
                backdropFilter: "blur(3px)",
                boxShadow: zoneGlow.boxShadow,
              }}
            >
              {zone}
              <ZoneMarkers zone={zone} incomingResult={incomingResult} outgoingResult={outgoingResult} />
              <ZoneOutlookBadges zone={zone} highlight={highlight} />
            </button>
          );
        })}

        {equipmentSlots.map(({ slot, item }) => (
          <EquipmentSlotButton
            key={slot}
            slot={slot}
            item={item}
            hovered={hoveredEquipmentSlot === slot}
            onMouseEnter={() => setHoveredEquipmentSlot(slot)}
            onMouseLeave={() => setHoveredEquipmentSlot((current) => (current === slot ? null : current))}
            onClick={() => onEquipmentSlotClick?.(slot)}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", fontSize: "11px", opacity: 0.82 }}>
        <LegendIcon markerKey="hit" />
        <LegendIcon markerKey="block" />
        <LegendIcon markerKey="crit" />
        <LegendIcon markerKey="penetration" />
        <LegendIcon markerKey="dodge" />
      </div>
    </div>
  );
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
            {effects.map((effect) => (
              <div key={effect.id} style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    display: "inline-grid",
                    placeItems: "center",
                    background: getEffectAccent(effect.kind).background,
                    border: `1px solid ${getEffectAccent(effect.kind).ring}`,
                    color: getEffectAccent(effect.kind).text,
                    fontSize: "8px",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {getEffectAccent(effect.kind).icon}
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
            ))}
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

function shortenItemName(itemName: string) {
  if (itemName.length <= 12) {
    return itemName;
  }

  return `${itemName.slice(0, 11)}...`;
}

function EquipmentSlotButton({
  slot,
  item,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  slot: EquipmentSlot;
  item: Item | null;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const equipped = Boolean(item);
  const itemName = item?.name ?? null;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!hovered || !item || !buttonRef.current || !popupRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current || !popupRef.current) {
        return;
      }

      const viewportPadding = 12;
      const gap = 8;
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const desiredLeft = buttonRect.left + buttonRect.width / 2 - popupRect.width / 2;
      const clampedLeft = Math.max(viewportPadding, Math.min(desiredLeft, viewportWidth - popupRect.width - viewportPadding));

      const spaceBelow = viewportHeight - buttonRect.bottom - viewportPadding;
      const spaceAbove = buttonRect.top - viewportPadding;
      const placeBelow = spaceBelow >= popupRect.height + gap || spaceBelow >= spaceAbove;

      const top = placeBelow
        ? Math.min(buttonRect.bottom + gap, viewportHeight - popupRect.height - viewportPadding)
        : Math.max(viewportPadding, buttonRect.top - popupRect.height - gap);

      setPopupStyle({
        position: "fixed",
        left: `${clampedLeft}px`,
        top: `${top}px`,
        width: `min(320px, calc(100vw - ${viewportPadding * 2}px))`,
        zIndex: 30,
        pointerEvents: "none",
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [hovered, item]);

  return (
    <div
      style={{
        position: "absolute",
        ...equipmentSlotPositions[slot],
        zIndex: hovered ? 4 : 2,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        style={{
          width: "49px",
          minHeight: "34px",
          borderRadius: "14px",
          border: hovered
            ? "1px solid rgba(255,211,141,0.72)"
            : equipped
              ? "1px solid rgba(255,171,97,0.5)"
              : "1px solid rgba(255,255,255,0.16)",
          background: hovered
            ? "linear-gradient(180deg, rgba(255,210,140,0.16), rgba(255,255,255,0.08))"
            : equipped
              ? "linear-gradient(180deg, rgba(207,106,50,0.24), rgba(255,255,255,0.05))"
              : "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
          color: "#fff8ed",
          cursor: "pointer",
          padding: "3px 4px",
          textAlign: "center",
          boxShadow: hovered
            ? "0 0 20px rgba(255,211,141,0.2)"
            : equipped
              ? "0 0 18px rgba(207,106,50,0.18)"
              : "0 0 0 transparent",
          transition: "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: hovered
                ? "rgba(255,217,166,0.22)"
                : equipped
                  ? "rgba(207,106,50,0.22)"
                  : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {renderEquipmentSlotIcon(slot, 18)}
          </span>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: hovered ? "#ffd38d" : equipped ? "#ff9d57" : "rgba(255,255,255,0.18)",
              boxShadow: hovered ? "0 0 10px rgba(255,211,141,0.55)" : "none",
            }}
          />
        </div>
        <div style={{ marginTop: "2px", fontSize: "6px", textTransform: "uppercase", opacity: 0.62, letterSpacing: "0.08em" }}>
          {formatEquipmentSlotLabel(slot)}
        </div>
        <div style={{ marginTop: "1px", fontSize: "6px", fontWeight: 700, lineHeight: 1.05 }}>
          {itemName ? shortenItemName(itemName) : "Empty"}
        </div>
      </button>
      {hovered && item ? <EquipmentItemPopover popupRef={popupRef} slot={slot} item={item} style={popupStyle} /> : null}
    </div>
  );
}

function EquipmentItemPopover({
  slot,
  item,
  style,
  popupRef,
}: {
  slot: EquipmentSlot;
  item: Item;
  style: CSSProperties | null;
  popupRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={popupRef}
      style={{
        ...(style ?? {
          position: "fixed",
          left: "12px",
          top: "12px",
          width: "min(320px, calc(100vw - 24px))",
          zIndex: 30,
          pointerEvents: "none",
        }),
      }}
    >
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(25,22,27,0.98), rgba(14,13,18,0.98)), radial-gradient(circle at top, rgba(255,214,164,0.08), transparent 32%)",
          boxShadow: "0 24px 40px rgba(0,0,0,0.34)",
          padding: "8px",
        }}
      >
        <div style={{ display: "grid", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              alignItems: "center",
              padding: "2px 4px 0",
            }}
          >
            <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,233,205,0.72)" }}>
              Equipped {formatEquipmentSlotLabel(slot)}
            </div>
            <HoverTag label="Equipped" />
          </div>
          <ItemPresentationCard
            entry={{ item, quantity: 1 }}
            compact
            showQuantityTag={false}
          />
        </div>
      </div>
    </div>
  );
}

function ZoneMarkers({
  zone,
  incomingResult,
  outgoingResult,
}: {
  zone: CombatZone;
  incomingResult: RoundResult | null;
  outgoingResult: RoundResult | null;
}) {
  const outgoingMarkers = outgoingResult && outgoingResult.attackZone === zone ? getResultMarkers(outgoingResult) : [];
  const incomingMarkers = incomingResult && incomingResult.attackZone === zone ? getResultMarkers(incomingResult) : [];
  const markers = [
    ...outgoingMarkers.map((marker) => ({ ...marker, side: "left" as const })),
    ...incomingMarkers.map((marker) => ({ ...marker, side: "right" as const })),
  ].slice(0, 4);

  if (markers.length === 0) {
    return null;
  }

  return (
    <>
      {markers.map((marker, index) => (
        <span
          key={`${marker.key}-${marker.side}-${index}`}
          style={{
            position: "absolute",
            top: 4 + Math.floor(index / 2) * 18,
            [marker.side === "left" ? "left" : "right"]: 4,
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            lineHeight: 1,
            background: marker.background,
            boxShadow: `0 0 12px ${marker.glow}`,
            border: "1px solid rgba(255,255,255,0.16)",
          }}
          title={marker.label}
        >
          {renderMarkerIcon(marker.key, 12)}
        </span>
      ))}
    </>
  );
}

function ZoneOutlookBadges({
  zone,
  highlight,
}: {
  zone: CombatZone;
  highlight?: ZoneHighlightFlags;
}) {
  if (!highlight) {
    return null;
  }

  const badges = [
    highlight.bestOpen ? { key: "bo", label: "BO", side: "left" as const, top: 4, background: "rgba(232,72,72,0.22)", glow: "rgba(232,72,72,0.32)" } : null,
    highlight.worstOpen ? { key: "wo", label: "WO", side: "left" as const, top: 24, background: "rgba(92,199,178,0.22)", glow: "rgba(92,199,178,0.3)" } : null,
    highlight.bestGuarded ? { key: "bg", label: "BG", side: "right" as const, top: 4, background: "rgba(216,93,145,0.22)", glow: "rgba(216,93,145,0.32)" } : null,
    highlight.worstGuarded ? { key: "wg", label: "WG", side: "right" as const, top: 24, background: "rgba(115,149,230,0.22)", glow: "rgba(115,149,230,0.32)" } : null,
  ].filter((badge): badge is NonNullable<typeof badge> => badge !== null);

  if (badges.length === 0) {
    return null;
  }

  return (
    <>
      {badges.map((badge) => (
        <span
          key={badge.key}
          style={{
            position: "absolute",
            top: badge.top,
            [badge.side === "left" ? "left" : "right"]: 4,
            minWidth: "17px",
            height: "15px",
            padding: "0 4px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "7px",
            fontWeight: 700,
            lineHeight: 1,
            background: badge.background,
          boxShadow: `0 0 12px ${badge.glow}`,
          border: "1px solid rgba(255,255,255,0.14)",
          color: "#fff8ed",
        }}
          title={getZoneBadgeTitle(badge.key, zone, highlight)}
        >
          {badge.label}
        </span>
      ))}
    </>
  );
}

function LegendIcon({ markerKey }: { markerKey: MarkerKey }) {
  const marker = markerDefinitions[markerKey];

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px", borderRadius: "999px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span
        style={{
          minWidth: "20px",
          height: "20px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.08)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        {renderMarkerIcon(markerKey, 12)}
      </span>
      <span style={{ color: "rgba(255,244,231,0.82)" }}>{marker.label}</span>
    </span>
  );
}

function getResultMarkers(result: RoundResult): MarkerDefinition[] {
  if (result.dodged) {
    return [markerDefinitions.dodge];
  }

  const markers: MarkerDefinition[] = [markerDefinitions.hit];

  if (result.blocked) {
    markers.push(markerDefinitions.block);
  }

  if (result.penetrated) {
    markers.push(markerDefinitions.penetration);
  }

  if (result.crit) {
    markers.push(markerDefinitions.crit);
  }

  return markers;
}

function getZoneHighlightGlow(highlight?: ZoneHighlightFlags) {
  if (!highlight) {
    return { boxShadow: "none" };
  }

  const glows: string[] = [];

  if (highlight.bestOpen) {
    glows.push("0 0 18px rgba(232,72,72,0.18)");
  }

  if (highlight.bestGuarded) {
    glows.push("0 0 18px rgba(216,93,145,0.18)");
  }

  if (highlight.worstOpen) {
    glows.push("inset 0 0 0 1px rgba(92,199,178,0.18)");
  }

  if (highlight.worstGuarded) {
    glows.push("inset 0 0 0 1px rgba(115,149,230,0.18)");
  }

  return {
    boxShadow: glows.length > 0 ? glows.join(", ") : "none",
  };
}

function getZoneBadgeTitle(key: string, zone: CombatZone, highlight: ZoneHighlightFlags) {
  const openDamage = highlight.openDamage ?? 0;
  const guardedDamage = highlight.guardedDamage ?? 0;

  switch (key) {
    case "bo":
      return `${zone}: best open target (${openDamage} open / ${guardedDamage} guarded)`;
    case "wo":
      return `${zone}: worst open target (${openDamage} open / ${guardedDamage} guarded)`;
    case "bg":
      return `${zone}: best guarded target (${openDamage} open / ${guardedDamage} guarded)`;
    case "wg":
      return `${zone}: worst guarded target (${openDamage} open / ${guardedDamage} guarded)`;
    default:
      return "";
  }
}

function renderMarkerIcon(markerKey: MarkerKey, size: number): ReactNode {
  switch (markerKey) {
    case "hit":
      return <SwordIcon size={size} />;
    case "block":
      return <ShieldIcon size={size} />;
    case "crit":
      return <BloodDropIcon size={size} />;
    case "penetration":
      return <BrokenShieldIcon size={size} />;
    case "dodge":
      return <DodgeIcon size={size} />;
    default:
      return null;
  }
}

function renderEquipmentSlotIcon(slot: EquipmentSlot, size: number): ReactNode {
  switch (slot) {
    case "mainHand":
      return <SwordIcon size={size} />;
    case "offHand":
      return <ShieldIcon size={size} />;
    case "helmet":
      return <HelmetIcon size={size} />;
    case "armor":
      return <ArmorIcon size={size} />;
    case "boots":
      return <BootsIcon size={size} />;
    case "gloves":
      return <GlovesIcon size={size} />;
    case "accessory":
      return <RingIcon size={size} />;
    default:
      return null;
  }
}

function formatEquipmentSlotLabel(slot: EquipmentSlot) {
  switch (slot) {
    case "mainHand":
      return "Main Hand";
    case "offHand":
      return "Off Hand";
    case "helmet":
      return "Helmet";
    case "armor":
      return "Armor";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "accessory":
      return "Accessory";
    default:
      return slot;
  }
}


function HoverTag({ label }: { label: string }) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "3px 7px",
        fontSize: "9px",
        color: "#e8dbc9",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </span>
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
      icon: "▲",
    };
  }

  return {
    ring: "rgba(229,115,79,0.3)",
    background: "linear-gradient(180deg, rgba(229,115,79,0.2), rgba(229,115,79,0.08))",
    kindBackground: "linear-gradient(180deg, rgba(229,115,79,0.22), rgba(229,115,79,0.12))",
    text: "#ffc4bd",
    halo: "radial-gradient(circle, rgba(229,115,79,0.24), rgba(229,115,79,0.04) 58%, transparent 78%)",
    icon: "▼",
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

function SwordIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M14.5 3.5 20 4l-.5 5.5-7.1 7.1-4.9-4.9 7-7.2Z" fill="#ffd79b" stroke="#fff1d8" strokeWidth="1" />
      <path d="m8 13-2.5 2.5M6.2 17.3 4.7 18.8M9.6 14.6l-1.7 1.7" stroke="#f4b35e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.8 20.2 2.5 18.9l2-2 1.3 1.3-2 2Z" fill="#8a5a2e" />
    </svg>
  );
}

function HelmetIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M6 12c0-4 2.8-7 6-7s6 3 6 7v2h-2v4H8v-4H6v-2Z"
        fill="#d6dce7"
        stroke="#f6f7fb"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9 12h6" stroke="#8a96a7" strokeWidth="1.2" />
    </svg>
  );
}

function ArmorIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="m8 4 4 2 4-2 2 3-1 3v9H7v-9L6 7l2-3Z"
        fill="#b9c4d3"
        stroke="#eef3f7"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 6v13" stroke="#8d99aa" strokeWidth="1.2" />
    </svg>
  );
}

function GlovesIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M8 6c1 0 1.8.7 1.8 1.7V11h.7V6.8c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V11h.7V8.5c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v5.3c0 2.8-1.8 4.7-4.7 4.7H12c-3 0-5-2-5-5v-4.7C7 7 7.4 6 8 6Z"
        fill="#d7c8ae"
        stroke="#fff3de"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BootsIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M8 5h4v7c0 1.5 1.2 2.8 2.8 2.8H19v2.2H5v-3.2l3-1.5V5Z"
        fill="#d4b592"
        stroke="#fff0d6"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M5 17h14" stroke="#8b6544" strokeWidth="1.2" />
    </svg>
  );
}

function RingIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="14" r="4.5" fill="none" stroke="#f0d79b" strokeWidth="2" />
      <path d="m12 4 2 3-2 2-2-2 2-3Z" fill="#7dc4ff" stroke="#d8f0ff" strokeWidth="1" />
    </svg>
  );
}

function ShieldIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11 4.2-2.3 7-5.9 7-11V5l-7-3Z"
        fill="#60d7bf"
        stroke="#d9fff8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 4.4v14.8" stroke="#d9fff8" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

function BrokenShieldIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11 4.2-2.3 7-5.9 7-11V5l-7-3Z" fill="#ff6e63" opacity="0.25" />
      <path
        d="M12 2 5 5v6c0 5.1 2.8 8.7 7 11V2Z"
        fill="#ff8978"
        stroke="#ffd7cf"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 2v20c4.2-2.3 7-5.9 7-11V5l-7-3Z"
        fill="#c43b2a"
        stroke="#ffd7cf"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 4.8 10.1 9.4l1.7 1.6-2.4 3.2 1.4 1.4-1.8 3.4"
        fill="none"
        stroke="#fff0ec"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BloodDropIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 3c2.7 4 5.5 7 5.5 10.6A5.5 5.5 0 1 1 6.5 13.6C6.5 10 9.3 7 12 3Z"
        fill="#f06262"
        stroke="#ffd1d1"
        strokeWidth="1.1"
      />
      <circle cx="10.5" cy="15" r="1.2" fill="#ffd8d8" opacity="0.8" />
    </svg>
  );
}

function DodgeIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 4c4.8 0 8 2.7 8 6.7S16.8 17.4 12 20c-4.8-2.6-8-5.3-8-9.3S7.2 4 12 4Z"
        fill="none"
        stroke="#8bd1ff"
        strokeWidth="1.4"
      />
      <path
        d="M12 7.2c2.6 0 4.3 1.4 4.3 3.5S14.6 14.9 12 16.4c-2.6-1.5-4.3-3.3-4.3-5.7S9.4 7.2 12 7.2Z"
        fill="none"
        stroke="#d9f3ff"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="10.8" r="1.4" fill="#d9f3ff" />
    </svg>
  );
}

function getHpColor(hpPercent: number) {
  if (hpPercent > 60) {
    return { from: "#1fba4c", to: "#7bf26d" };
  }

  if (hpPercent > 30) {
    return { from: "#d1a62e", to: "#f2df72" };
  }

  return { from: "#c43b2a", to: "#ff7a60" };
}
