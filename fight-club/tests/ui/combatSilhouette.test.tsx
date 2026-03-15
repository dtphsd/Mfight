import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CombatSilhouette } from "@/ui/components/combat/CombatSilhouette";

describe("CombatSilhouette", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not replay the same impact twice for an unchanged impact key", () => {
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(window, "setTimeout");
    vi.spyOn(window, "clearTimeout");

    const { rerender } = render(
      <StrictMode>
        <CombatSilhouette
          title="Player"
          currentHp={100}
          maxHp={100}
          figure="rush-chip"
          impactKey="impact-1"
          impactVariant="hit"
          impactValue={12}
        />
      </StrictMode>
    );

    rerender(
      <StrictMode>
        <CombatSilhouette
          title="Player"
          currentHp={100}
          maxHp={100}
          figure="rush-chip"
          impactKey="impact-1"
          impactVariant="hit"
          impactValue={12}
        />
      </StrictMode>
    );

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps the active impact label when the incoming impact props clear", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(window, "setTimeout");
    vi.spyOn(window, "clearTimeout");

    const { rerender } = render(
      <CombatSilhouette
        title="Player"
        currentHp={100}
        maxHp={100}
        figure="rush-chip"
        impactKey="impact-1"
        impactVariant="crit"
        impactValue={12}
      />
    );

    expect(screen.getByText("CRIT")).toBeTruthy();
    expect(screen.getByText("-12")).toBeTruthy();

    rerender(
      <CombatSilhouette
        title="Player"
        currentHp={100}
        maxHp={100}
        figure="rush-chip"
        impactKey={null}
        impactVariant="hit"
        impactValue={null}
      />
    );

    expect(screen.getByText("CRIT")).toBeTruthy();
    expect(screen.getByText("-12")).toBeTruthy();
  });
});
