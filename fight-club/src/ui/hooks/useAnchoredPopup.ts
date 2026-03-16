import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

type PopupPlacement = "horizontal" | "vertical";
type VerticalPreference = "auto" | "above" | "below";

interface UseAnchoredPopupOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  popupRef: RefObject<HTMLElement | null>;
  placement: PopupPlacement;
  verticalPreference?: VerticalPreference;
  preferredWidth?: number;
  gap?: number;
  viewportPadding?: number;
  zIndex?: number;
}

export function useAnchoredPopup({
  open,
  triggerRef,
  popupRef,
  placement,
  verticalPreference = "auto",
  preferredWidth = 320,
  gap = 8,
  viewportPadding = 12,
  zIndex = 30,
}: UseAnchoredPopupOptions) {
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !popupRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !popupRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const resolvedWidth = Math.min(preferredWidth, viewportWidth - viewportPadding * 2);

      if (placement === "horizontal") {
        const popupWidth = Math.min(resolvedWidth, popupRect.width || resolvedWidth);
        const hasRoomRight = viewportWidth - triggerRect.right >= popupWidth + gap;
        const hasRoomLeft = triggerRect.left >= popupWidth + gap;

        let left = triggerRect.right + gap;
        if (!hasRoomRight && hasRoomLeft) {
          left = triggerRect.left - popupWidth - gap;
        } else if (!hasRoomRight) {
          left = Math.max(viewportPadding, viewportWidth - popupWidth - viewportPadding);
        }

        const desiredTop = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
        const top = Math.max(
          viewportPadding,
          Math.min(desiredTop, viewportHeight - popupRect.height - viewportPadding)
        );

        setPopupStyle({
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          width: `${popupWidth}px`,
          zIndex,
          pointerEvents: "none",
        });
        return;
      }

      const desiredLeft = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
      const left = Math.max(
        viewportPadding,
        Math.min(desiredLeft, viewportWidth - popupRect.width - viewportPadding)
      );
      const spaceBelow = viewportHeight - triggerRect.bottom - viewportPadding;
      const spaceAbove = triggerRect.top - viewportPadding;
      const placeBelow =
        verticalPreference === "below"
          ? true
          : verticalPreference === "above"
            ? false
            : spaceBelow >= popupRect.height + gap || spaceBelow >= spaceAbove;
      const top = placeBelow
        ? Math.min(triggerRect.bottom + gap, viewportHeight - popupRect.height - viewportPadding)
        : Math.max(viewportPadding, triggerRect.top - popupRect.height - gap);

      setPopupStyle({
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `min(${resolvedWidth}px, calc(100vw - ${viewportPadding * 2}px))`,
        zIndex,
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
  }, [gap, open, placement, popupRef, preferredWidth, triggerRef, verticalPreference, viewportPadding, zIndex]);

  return popupStyle;
}
