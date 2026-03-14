import type { CSSProperties } from "react";
import "./combat-motion.css";
import {
  getCombatImpactLabel,
  shouldShowCombatImpactValue,
  type CombatImpactVariant,
} from "./combatImpactMotion";

interface CombatImpactOverlayProps {
  lingerActive: boolean;
  impactVariant: CombatImpactVariant;
  impactValue?: number | null;
}

export function CombatImpactOverlay({
  lingerActive,
  impactVariant,
  impactValue = null,
}: CombatImpactOverlayProps) {
  if (!lingerActive) {
    return null;
  }

  return (
    <>
      <div
        className={`combat-silhouette-hit-flash combat-silhouette-hit-flash--${impactVariant}`}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "28px",
          background:
            impactVariant === "crit"
              ? "radial-gradient(circle at 50% 45%, rgba(255,64,64,0.32), rgba(255,96,96,0.13) 34%, transparent 74%)"
              : impactVariant === "block_break"
                ? "radial-gradient(circle at 50% 45%, rgba(164,216,255,0.3), rgba(255,255,255,0.14) 26%, rgba(122,190,255,0.08) 40%, transparent 76%)"
              : impactVariant === "block"
                ? "radial-gradient(circle at 50% 45%, rgba(120,190,255,0.22), rgba(120,190,255,0.08) 34%, transparent 74%)"
                : impactVariant === "dodge"
                  ? "radial-gradient(circle at 50% 45%, rgba(116,241,214,0.18), rgba(116,241,214,0.07) 34%, transparent 74%)"
                  : "radial-gradient(circle at 50% 45%, rgba(255,74,74,0.18), rgba(255,74,74,0.08) 38%, transparent 72%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {impactVariant === "crit" ? <CritImpactFrame /> : null}
      {impactVariant === "block_break" ? <BlockBreakImpactFrame /> : null}
      {impactVariant === "block" ? <BlockImpactFrame /> : null}
      <ImpactText impactVariant={impactVariant} impactValue={impactValue} />
    </>
  );
}

function CritImpactFrame() {
  return (
    <>
      <div
        className="combat-silhouette-frame-glow"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "28px",
          border: "2px solid rgba(255,92,92,0.92)",
          boxShadow:
            "0 0 0 1px rgba(255,150,150,0.34), 0 0 24px rgba(255,74,74,0.32), inset 0 0 18px rgba(255,74,74,0.12)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        className="combat-silhouette-crit-sigil"
        style={sigilContainerStyle}
      >
        <FrameCritSigil />
      </div>
    </>
  );
}

function BlockImpactFrame() {
  return (
    <div
      className="combat-silhouette-block-sigil"
      style={sigilContainerStyle}
    >
      <FrameShieldSigil />
    </div>
  );
}

function BlockBreakImpactFrame() {
  return (
    <>
      <div
        className="combat-silhouette-block-break-frame"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "28px",
          border: "2px solid rgba(188,230,255,0.92)",
          boxShadow:
            "0 0 0 1px rgba(235,247,255,0.28), 0 0 26px rgba(122,190,255,0.28), inset 0 0 18px rgba(124,188,255,0.12)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        className="combat-silhouette-block-sigil"
        style={sigilContainerStyle}
      >
        <FrameShieldSigil />
      </div>
      <div
        className="combat-silhouette-block-break-sigil"
        style={sigilContainerStyle}
      >
        <FrameBlockBreakSigil />
      </div>
    </>
  );
}

function ImpactText({
  impactVariant,
  impactValue,
}: {
  impactVariant: CombatImpactVariant;
  impactValue: number | null;
}) {
  return (
    <div
      className={`combat-silhouette-impact-text combat-silhouette-impact-text--${impactVariant}`}
      style={{
        position: "absolute",
        left: "50%",
        top: impactVariant === "crit" ? "16%" : "18%",
        transform: "translateX(-50%) rotate(-12deg)",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <div style={{ display: "grid", gap: "2px", justifyItems: "center" }}>
        <span>{getCombatImpactLabel(impactVariant)}</span>
        {shouldShowCombatImpactValue(impactVariant, impactValue) ? (
          <span
            style={{
              fontSize: "16px",
              letterSpacing: "0.08em",
              opacity: 0.95,
            }}
          >
            -{impactValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const sigilContainerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
  zIndex: 2,
};

function FrameShieldSigil() {
  return (
    <svg viewBox="0 0 120 120" width="114" height="114" aria-hidden="true">
      <defs>
        <radialGradient id="block-sigil-glow" cx="50%" cy="44%" r="58%">
          <stop offset="0%" stopColor="rgba(197,226,255,0.95)" />
          <stop offset="48%" stopColor="rgba(112,182,255,0.38)" />
          <stop offset="100%" stopColor="rgba(112,182,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="44" fill="url(#block-sigil-glow)" />
      <path
        d="M60 16 29 29v26c0 22.6 12.7 38.6 31 49 18.3-10.4 31-26.4 31-49V29L60 16Z"
        fill="rgba(113,181,255,0.18)"
        stroke="#c7e6ff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FrameCritSigil() {
  return (
    <svg viewBox="0 0 120 120" width="112" height="112" aria-hidden="true">
      <defs>
        <radialGradient id="crit-sigil-glow" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="rgba(255,198,198,0.9)" />
          <stop offset="46%" stopColor="rgba(255,86,86,0.32)" />
          <stop offset="100%" stopColor="rgba(255,86,86,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="43" fill="url(#crit-sigil-glow)" />
      <path
        d="M60 17c11.6 17.2 23.6 30.4 23.6 45.8a23.6 23.6 0 1 1-47.2 0C36.4 47.4 48.4 34.2 60 17Z"
        fill="rgba(255,92,92,0.2)"
        stroke="#ffc7c7"
        strokeWidth="3"
      />
    </svg>
  );
}

function FrameBlockBreakSigil() {
  return (
    <svg viewBox="0 0 120 120" width="142" height="142" aria-hidden="true">
      <defs>
        <linearGradient id="block-break-core" x1="20%" y1="0%" x2="78%" y2="100%">
          <stop offset="0%" stopColor="#ffe2e2" />
          <stop offset="42%" stopColor="#ff8b8b" />
          <stop offset="100%" stopColor="#d73333" />
        </linearGradient>
        <radialGradient id="block-break-glow" cx="50%" cy="48%" r="56%">
          <stop offset="0%" stopColor="rgba(255,224,224,0.86)" />
          <stop offset="36%" stopColor="rgba(255,104,104,0.3)" />
          <stop offset="100%" stopColor="rgba(255,104,104,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="42" fill="url(#block-break-glow)" />
      <path
        d="M29 18 52 49 43 49 62 74 53 74 85 109 67 80 75 80 57 54 65 54Z"
        fill="url(#block-break-core)"
        stroke="#fff2f2"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M83 20 66 42M95 46 72 56M91 79 70 72M35 97 49 79"
        stroke="rgba(255,196,196,0.74)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
