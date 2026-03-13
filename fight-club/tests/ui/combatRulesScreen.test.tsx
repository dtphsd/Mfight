import { fireEvent, render, screen } from "@testing-library/react";

import { CombatRulesScreen } from "@/ui/screens/CombatRules/CombatRulesScreen";

describe("CombatRulesScreen", () => {
  it("renders core sections and item table in russian by default", () => {
    render(<CombatRulesScreen onBack={() => {}} onOpenCombatSandbox={() => {}} />);

    expect(screen.getByRole("heading", { name: "Библиотека правил боевой системы" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Как проходит раунд" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Предметы и экипировка" })).toBeTruthy();
    expect(screen.getByText("Skill и цена")).toBeTruthy();
    expect(screen.getByText("Training Sword")).toBeTruthy();
  });

  it("switches to english content", () => {
    render(<CombatRulesScreen onBack={() => {}} onOpenCombatSandbox={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByRole("heading", { name: "Combat system rules library" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "How a round works" })).toBeTruthy();
    expect(screen.getByText("Skill and cost")).toBeTruthy();
  });
});
