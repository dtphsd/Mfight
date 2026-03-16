import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ActiveCombatEffect } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import houndDriveFigure from "@/assets/combat/Hound-Drive.jpg";
import kitsuneBitFigure from "@/assets/combat/Kitsune-Bit.jpg";
import neoScopeFigure from "@/assets/combat/Neo-Scope.jpg";
import quackCoreFigure from "@/assets/combat/Quack-Core.jpg";
import razorBoarFigure from "@/assets/combat/Razor-Boar.jpg";
import rushChipFigure from "@/assets/combat/Rush-Chip.jpg";
import trashFluxFigure from "@/assets/combat/Trash-Flux.jpg";
import verminTekFigure from "@/assets/combat/Vermin-Tek.jpg";
import { CombatImpactOverlay } from "@/ui/components/combat/CombatImpactOverlay";
import { ItemPreviewPopover } from "@/ui/components/shared/ItemPreviewPopover";
import { useAnchoredPopup } from "@/ui/hooks/useAnchoredPopup";
import {
  COMBAT_IMPACT_LINGER_DURATION_MS,
  getCombatImpactMotionDurationMs,
  type CombatImpactVariant,
} from "./combatImpactMotion";

export type CombatFigureId =
  | "hound-drive"
  | "kitsune-bit"
  | "neo-scope"
  | "quack-core"
  | "razor-boar"
  | "rush-chip"
  | "trash-flux"
  | "vermin-tek";

interface CombatSilhouetteProps {
  title: string;
  currentHp: number;
  maxHp: number;
  activeEffects?: ActiveCombatEffect[];
  equipmentSlots?: Array<{ slot: EquipmentSlot; item: Item | null }>;
  figure: CombatFigureId;
  mirrored?: boolean;
  impactKey?: string | number | null;
  impactVariant?: CombatImpactVariant;
  impactValue?: number | null;
  onEquipmentSlotClick?: (slot: EquipmentSlot) => void;
  onProfileClick?: () => void;
}

const equipmentSlotPositions: Record<EquipmentSlot, CSSProperties> = {
  helmet: { top: 8, left: 86 },
  earring: { top: 34, left: 166 },
  bracers: { top: 44, left: 4 },
  mainHand: { top: 96, left: 4 },
  armor: { top: 148, left: 4 },
  shirt: { top: 200, left: 4 },
  gloves: { top: 252, left: 4 },
  belt: { top: 304, left: 4 },
  offHand: { top: 96, left: 166 },
  ring2: { top: 148, left: 166 },
  ring: { top: 200, left: 166 },
  pants: { top: 252, left: 166 },
  boots: { top: 304, left: 166 },
};

export function CombatSilhouette({
  title,
  currentHp,
  maxHp,
  activeEffects = [],
  equipmentSlots = [],
  figure,
  mirrored = false,
  impactKey = null,
  impactVariant = "hit",
  impactValue = null,
  onEquipmentSlotClick,
  onProfileClick,
}: CombatSilhouetteProps) {
  const [hoveredEquipmentSlot, setHoveredEquipmentSlot] = useState<EquipmentSlot | null>(null);
  const [motionActive, setMotionActive] = useState(false);
  const [lingerActive, setLingerActive] = useState(false);
  const [lingerToken, setLingerToken] = useState(0);
  const [activeImpact, setActiveImpact] = useState<{ variant: CombatImpactVariant; value: number | null }>({
    variant: impactVariant,
    value: impactValue,
  });
  const lastImpactKeyRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!impactKey) {
      lastImpactKeyRef.current = null;
      return;
    }

    if (lastImpactKeyRef.current === impactKey) {
      return;
    }

    lastImpactKeyRef.current = impactKey;
    setMotionActive(false);
    setLingerActive(false);
    setActiveImpact({
      variant: impactVariant,
      value: impactValue,
    });
    const frameId = window.requestAnimationFrame(() => {
      setMotionActive(true);
      setLingerActive(true);
      setLingerToken((current) => current + 1);
    });
    const motionTimeoutId = window.setTimeout(() => setMotionActive(false), getCombatImpactMotionDurationMs(impactVariant));
    const lingerTimeoutId = window.setTimeout(() => setLingerActive(false), COMBAT_IMPACT_LINGER_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(motionTimeoutId);
      window.clearTimeout(lingerTimeoutId);
    };
  }, [impactKey, impactVariant]);

  return (
    <div style={{ display: "grid", gap: "10px", justifyItems: "center", width: "220px", margin: "0 auto" }}>
      <SilhouetteHeader title={title} currentHp={currentHp} maxHp={maxHp} activeEffects={activeEffects} />

      <SilhouetteBoard
        motionActive={motionActive}
        lingerActive={lingerActive}
        lingerToken={lingerToken}
        impactVariant={activeImpact.variant}
        impactValue={activeImpact.value}
        onProfileClick={onProfileClick}
      >
        <SilhouetteFigure figure={figure} mirrored={mirrored} />

        <SilhouetteEquipmentLayer
          equipmentSlots={equipmentSlots}
          hoveredEquipmentSlot={hoveredEquipmentSlot}
          onHoverSlot={setHoveredEquipmentSlot}
          onEquipmentSlotClick={onEquipmentSlotClick}
        />
      </SilhouetteBoard>

    </div>
  );
}

function SilhouetteHeader({
  title,
  currentHp,
  maxHp,
  activeEffects,
}: {
  title: string;
  currentHp: number;
  maxHp: number;
  activeEffects: ActiveCombatEffect[];
}) {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const hpColor = getHpColor(hpPercent);

  return (
    <div style={{ width: "220px" }}>
      <div style={{ display: "grid", gap: "5px", marginBottom: "0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontWeight: 700, alignItems: "center" }}>
          <span style={{ letterSpacing: "0.04em", flexShrink: 0 }}>{title}</span>
          <SilhouetteStatusEffects effects={activeEffects} />
          <span style={{ color: "rgba(255,244,231,0.78)", fontSize: "12px", flexShrink: 0 }}>
            {currentHp}/{maxHp}
          </span>
        </div>
      </div>
      <SilhouetteHpBar hpPercent={hpPercent} hpColor={hpColor} />
    </div>
  );
}

function SilhouetteHpBar({
  hpPercent,
  hpColor,
}: {
  hpPercent: number;
  hpColor: ReturnType<typeof getHpColor>;
}) {
  return (
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
  );
}

function SilhouetteBoard({
  motionActive = false,
  lingerActive = false,
  lingerToken = 0,
  impactVariant = "hit",
  impactValue = null,
  onProfileClick,
  children,
}: {
  motionActive?: boolean;
  lingerActive?: boolean;
  lingerToken?: number;
  impactVariant?: CombatImpactVariant;
  impactValue?: number | null;
  onProfileClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={
        motionActive
          ? `combat-silhouette-impact combat-silhouette-impact--${impactVariant}`
          : undefined
      }
      style={{
        position: "relative",
        width: "220px",
        height: "360px",
        borderRadius: "28px",
        background:
          "radial-gradient(circle at top, rgba(120,189,255,0.06), transparent 18%), radial-gradient(circle at bottom, rgba(255,179,108,0.04), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 0 28px rgba(0,0,0,0.28), 0 18px 34px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      {onProfileClick ? (
        <button
          type="button"
          aria-label="Open character profile"
          onClick={onProfileClick}
          title="Open profile"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            width: "22px",
            height: "22px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, rgba(22,23,28,0.92), rgba(12,13,17,0.92))",
            color: "#f5e7d4",
            fontSize: "12px",
            fontWeight: 800,
            lineHeight: 1,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            zIndex: 6,
            boxShadow: "0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          i
        </button>
      ) : null}
      <CombatImpactOverlay
        key={lingerToken}
        lingerActive={lingerActive}
        impactVariant={impactVariant}
        impactValue={impactValue}
      />
      {children}
    </div>
  );
}

function SilhouetteFigure({
  figure,
  mirrored = false,
}: {
  figure: CombatFigureId;
  mirrored?: boolean;
}) {
  const figureMeta = figureMetas[figure];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: `${figureMeta.width}px`,
          height: `${figureMeta.height}px`,
          transform: `translate(-50%, ${figureMeta.translateY})`,
          overflow: "visible",
          opacity: 0.96,
          filter: "drop-shadow(0 26px 28px rgba(0,0,0,0.38)) saturate(1.04) contrast(1.06)",
        }}
      >
        <img
          data-testid="combat-silhouette-image"
          data-figure={figure}
          src={figureMeta.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${figureMeta.width}px`,
            height: `${figureMeta.height}px`,
            transform: `translate(-50%, -50%) scaleX(${mirrored ? -1 : 1})`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

const figureMetas: Record<CombatFigureId, { src: string; width: number; height: number; translateY: string }> = {
  "hound-drive": {
    src: houndDriveFigure,
    width: 318,
    height: 318,
    translateY: "-45%",
  },
  "kitsune-bit": {
    src: kitsuneBitFigure,
    width: 318,
    height: 318,
    translateY: "-46%",
  },
  "neo-scope": {
    src: neoScopeFigure,
    width: 318,
    height: 318,
    translateY: "-45%",
  },
  "quack-core": {
    src: quackCoreFigure,
    width: 318,
    height: 318,
    translateY: "-45%",
  },
  "razor-boar": {
    src: razorBoarFigure,
    width: 320,
    height: 320,
    translateY: "-45%",
  },
  "rush-chip": {
    src: rushChipFigure,
    width: 320,
    height: 320,
    translateY: "-46%",
  },
  "trash-flux": {
    src: trashFluxFigure,
    width: 320,
    height: 320,
    translateY: "-45%",
  },
  "vermin-tek": {
    src: verminTekFigure,
    width: 312,
    height: 312,
    translateY: "-45%",
  },
};

function SilhouetteEquipmentLayer({
  equipmentSlots,
  hoveredEquipmentSlot,
  onHoverSlot,
  onEquipmentSlotClick,
}: {
  equipmentSlots: Array<{ slot: EquipmentSlot; item: Item | null }>;
  hoveredEquipmentSlot: EquipmentSlot | null;
  onHoverSlot: (slot: EquipmentSlot | null | ((current: EquipmentSlot | null) => EquipmentSlot | null)) => void;
  onEquipmentSlotClick?: (slot: EquipmentSlot) => void;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {equipmentSlots.map(({ slot, item }) => (
        <EquipmentSlotButton
          key={slot}
          slot={slot}
          item={item}
          hovered={hoveredEquipmentSlot === slot}
          onMouseEnter={() => onHoverSlot(slot)}
          onMouseLeave={() => onHoverSlot((current) => (current === slot ? null : current))}
          onClick={() => onEquipmentSlotClick?.(slot)}
        />
      ))}
    </div>
  );
}

function SilhouetteStatusEffects({ effects }: { effects: ActiveCombatEffect[] }) {
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
  const popupStyle = useAnchoredPopup({
    open: hovered && Boolean(item),
    triggerRef: buttonRef,
    popupRef,
    placement: "vertical",
    preferredWidth: 320,
    gap: 8,
    viewportPadding: 12,
    zIndex: 30,
  });

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
          opacity: hovered ? 1 : 0.52,
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
  const previewEntry = { item, quantity: 1 as const };

  return (
    <ItemPreviewPopover
      entry={previewEntry}
      popupRef={popupRef}
      style={style}
      fallbackWidth="min(320px, calc(100vw - 24px))"
      label={`Equipped ${formatEquipmentSlotLabel(slot)}`}
      tagLabel="Equipped"
    />
  );
}

function renderEquipmentSlotIcon(slot: EquipmentSlot, size: number): ReactNode {
  switch (slot) {
    case "mainHand":
      return <SwordIcon size={size} />;
    case "offHand":
      return <ShieldIcon size={size} />;
    case "helmet":
      return <HelmetIcon size={size} />;
    case "shirt":
      return <ArmorIcon size={size} />;
    case "armor":
      return <ArmorIcon size={size} />;
    case "bracers":
      return <GlovesIcon size={size} />;
    case "belt":
      return <ArmorIcon size={size} />;
    case "pants":
      return <BootsIcon size={size} />;
    case "boots":
      return <BootsIcon size={size} />;
    case "gloves":
      return <GlovesIcon size={size} />;
    case "ring":
      return <RingIcon size={size} />;
    case "ring2":
      return <RingIcon size={size} />;
    case "earring":
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
    case "shirt":
      return "Shirt";
    case "armor":
      return "Armor";
    case "bracers":
      return "Bracers";
    case "belt":
      return "Belt";
    case "pants":
      return "Pants";
    case "boots":
      return "Boots";
    case "gloves":
      return "Gloves";
    case "ring":
      return "Ring";
    case "ring2":
      return "Ring II";
    case "earring":
      return "Earring";
    default:
      return slot;
  }
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

function getHpColor(hpPercent: number) {
  if (hpPercent > 60) {
    return { from: "#1fba4c", to: "#7bf26d" };
  }

  if (hpPercent > 30) {
    return { from: "#d1a62e", to: "#f2df72" };
  }

  return { from: "#c43b2a", to: "#ff7a60" };
}



