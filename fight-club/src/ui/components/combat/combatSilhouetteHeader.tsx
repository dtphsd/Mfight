import type { ActiveCombatEffect } from "@/modules/combat";
import { SilhouetteStatusEffects } from "./combatSilhouetteStatus";

export function SilhouetteHeader({
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

function getHpColor(hpPercent: number) {
  if (hpPercent > 60) {
    return { from: "#1fba4c", to: "#7bf26d" };
  }

  if (hpPercent > 30) {
    return { from: "#d1a62e", to: "#f2df72" };
  }

  return { from: "#c43b2a", to: "#ff7a60" };
}
