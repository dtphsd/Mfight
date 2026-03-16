import houndDriveFigure from "@/assets/combat/Hound-Drive.jpg";
import kitsuneBitFigure from "@/assets/combat/Kitsune-Bit.jpg";
import neoScopeFigure from "@/assets/combat/Neo-Scope.jpg";
import quackCoreFigure from "@/assets/combat/Quack-Core.jpg";
import razorBoarFigure from "@/assets/combat/Razor-Boar.jpg";
import rushChipFigure from "@/assets/combat/Rush-Chip.jpg";
import trashFluxFigure from "@/assets/combat/Trash-Flux.jpg";
import verminTekFigure from "@/assets/combat/Vermin-Tek.jpg";
import type { CombatFigureId } from "@/ui/components/combat/CombatSilhouette";

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

export function SilhouetteFigure({
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
