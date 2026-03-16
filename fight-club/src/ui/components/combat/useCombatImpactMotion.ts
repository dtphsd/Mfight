import { useEffect, useRef, useState } from "react";
import {
  COMBAT_IMPACT_LINGER_DURATION_MS,
  getCombatImpactMotionDurationMs,
  type CombatImpactVariant,
} from "./combatImpactMotion";

export function useCombatImpactMotion({
  impactKey,
  impactVariant,
  impactValue,
}: {
  impactKey: string | number | null;
  impactVariant: CombatImpactVariant;
  impactValue: number | null;
}) {
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
  }, [impactKey, impactVariant, impactValue]);

  return {
    motionActive,
    lingerActive,
    lingerToken,
    activeImpact,
  };
}
