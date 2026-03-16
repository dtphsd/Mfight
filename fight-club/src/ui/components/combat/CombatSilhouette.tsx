import { useState } from "react";
import type { ActiveCombatEffect } from "@/modules/combat";
import type { EquipmentSlot } from "@/modules/equipment";
import type { Item } from "@/modules/inventory";
import { type CombatImpactVariant } from "./combatImpactMotion";
import { SilhouetteBoard } from "./combatSilhouetteBoard";
import { SilhouetteEquipmentLayer } from "./combatSilhouetteEquipment";
import { SilhouetteFigure } from "./combatSilhouetteFigure";
import { SilhouetteHeader } from "./combatSilhouetteHeader";
import { useCombatImpactMotion } from "./useCombatImpactMotion";

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
  const {
    motionActive,
    lingerActive,
    lingerToken,
    activeImpact,
  } = useCombatImpactMotion({
    impactKey,
    impactVariant,
    impactValue,
  });

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






