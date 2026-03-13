import { useState, type CSSProperties, type ReactNode } from "react";
import type { CombatZone, RoundResult } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";

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
  equipmentSlots?: Array<{ slot: EquipmentSlot; itemName: string | null }>;
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontWeight: 700 }}>
          <span>{title}</span>
          <span>
            {currentHp}/{maxHp}
          </span>
        </div>
        <div
          style={{
            height: "12px",
            borderRadius: "999px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${hpColor.from}, ${hpColor.to})`,
              transition: "width 180ms ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "220px",
          height: "360px",
          borderRadius: "26px",
          background:
            "radial-gradient(circle at top, rgba(120,189,255,0.12), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.22), 0 14px 28px rgba(0,0,0,0.16)",
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

        {equipmentSlots.map(({ slot, itemName }) => (
          <EquipmentSlotButton
            key={slot}
            slot={slot}
            itemName={itemName}
            hovered={hoveredEquipmentSlot === slot}
            onMouseEnter={() => setHoveredEquipmentSlot(slot)}
            onMouseLeave={() => setHoveredEquipmentSlot((current) => (current === slot ? null : current))}
            onClick={() => onEquipmentSlotClick?.(slot)}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", fontSize: "11px", opacity: 0.72 }}>
        <LegendIcon markerKey="hit" />
        <LegendIcon markerKey="block" />
        <LegendIcon markerKey="crit" />
        <LegendIcon markerKey="penetration" />
        <LegendIcon markerKey="dodge" />
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
  itemName,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  slot: EquipmentSlot;
  itemName: string | null;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const equipped = Boolean(itemName);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        ...equipmentSlotPositions[slot],
        width: "49px",
        minHeight: "34px",
        borderRadius: "12px",
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
        zIndex: 2,
      }}
      title={itemName ? `${formatEquipmentSlotLabel(slot)}: ${itemName}` : `${formatEquipmentSlotLabel(slot)}: empty`}
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
      <div style={{ marginTop: "2px", fontSize: "6px", textTransform: "uppercase", opacity: 0.6 }}>
        {formatEquipmentSlotLabel(slot)}
      </div>
      <div style={{ marginTop: "1px", fontSize: "6px", fontWeight: 700, lineHeight: 1.05 }}>
        {itemName ? shortenItemName(itemName) : "Empty"}
      </div>
    </button>
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
      {marker.label}
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
