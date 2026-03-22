import type { ReactNode } from "react";
import type { CombatZone } from "@/modules/combat";
import { CombatImpactOverlay } from "@/ui/components/combat/CombatImpactOverlay";
import type { CombatImpactVariant } from "@/ui/components/combat/combatImpactMotion";

export function SilhouetteBoard({
  motionActive = false,
  lingerActive = false,
  lingerToken = 0,
  impactVariant = "hit",
  impactValue = null,
  impactZone = null,
  onProfileClick,
  children,
}: {
  motionActive?: boolean;
  lingerActive?: boolean;
  lingerToken?: number;
  impactVariant?: CombatImpactVariant;
  impactValue?: number | null;
  impactZone?: CombatZone | null;
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
        impactZone={impactZone}
      />
      {children}
    </div>
  );
}
