import { fireEvent, render, screen } from "@testing-library/react";
import { CombatSandboxScreen } from "@/ui/screens/Combat/CombatSandboxScreen";

describe("CombatSandboxScreen", () => {
  it("opens builder and inventory popovers", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open builder" }));
    expect(screen.getByText("Player Builder")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close builder popover" }));

    fireEvent.click(screen.getByRole("button", { name: "Open inventory" }));
    expect(screen.getByText("Loadout Storage")).toBeTruthy();
  });

  it("lets the player manually equip up to five skills and select one in combat", () => {
    render(<CombatSandboxScreen />);

    expect(screen.queryByRole("button", { name: "Select Feint Slash" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open inventory" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Training Sword" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Oak Shield" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Leather Cap" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Braced Gloves" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Trail Boots" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Arena Earring" }));
    fireEvent.click(screen.getByRole("button", { name: "Close inventory popover" }));

    fireEvent.click(screen.getByRole("button", { name: "Manage equipped skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Feint Slash to panel skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Head Slip to panel skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Parry Riposte to panel skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Low Feint to panel skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Killer Focus to panel skills" }));
    expect(screen.getByRole("button", { name: "Add Shield Bash to panel skills" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close skill loadout popover" }));

    const skillButton = screen.getByRole("button", { name: "Select Feint Slash" });
    fireEvent.click(skillButton);

    expect(screen.getByTestId("selected-action-label").textContent).toContain("Feint Slash");
    expect(screen.getByTestId("selected-action-tags").textContent).toContain("Skill");
    expect(screen.getByTestId("selected-action-tags").textContent).toContain("Damage x1.38");
    expect(screen.getByTestId("selected-action-tags").textContent).toContain("Bleeding Line 2T");
    expect(screen.getByRole("button", { name: "Select Head Slip" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select Parry Riposte" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select Low Feint" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select Killer Focus" })).toBeTruthy();
  });

  it("starts combat and appends entries to the battle log after a round resolves", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Start fight" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve round" }));

    expect(screen.getByTestId("battle-log-panel")).toBeTruthy();
    expect(screen.getAllByTestId("battle-log-entry").length).toBeGreaterThan(0);
    expect(screen.getByTestId("latest-round-summary").textContent).not.toContain("No round resolved yet.");
  });

  it("switches an unaffordable selected skill to basic attack when a new round starts", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open inventory" }));
    fireEvent.click(screen.getByRole("button", { name: "Equip Training Sword" }));
    fireEvent.click(screen.getByRole("button", { name: "Close inventory popover" }));

    fireEvent.click(screen.getByRole("button", { name: "Manage equipped skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Feint Slash to panel skills" }));
    fireEvent.click(screen.getByRole("button", { name: "Close skill loadout popover" }));

    fireEvent.click(screen.getByRole("button", { name: "Start fight" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve round" }));

    fireEvent.click(screen.getByRole("button", { name: "Select Feint Slash" }));
    expect(screen.getByTestId("selected-action-label").textContent).toContain("Feint Slash");

    fireEvent.click(screen.getByRole("button", { name: "Prepare next round" }));
    expect(screen.getByTestId("selected-action-label").textContent).toContain("Basic Attack");
    expect(screen.getByTestId("selected-action-tags").textContent).toContain("Basic");
  });

  it("shows attack zone damage multipliers in fight controls", () => {
    render(<CombatSandboxScreen />);

    const actionTags = screen.getByTestId("selected-action-tags");
    fireEvent.click(screen.getByRole("button", { name: "Select attack zone belly" }));
    expect(actionTags.textContent).toContain("Zone x1.00");
    expect(screen.getByText("Damage x1.00")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Select attack zone head" }));
    expect(actionTags.textContent).toContain("Zone x1.20");
    expect(screen.getByText("Damage x1.20")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Select attack zone legs" }));
    expect(actionTags.textContent).toContain("Zone x0.80");
    expect(screen.getByText("Damage x0.80")).toBeTruthy();
  });

  it("applies a curated build preset from the dedicated presets popover", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open build presets" }));
    expect(screen.getByText("Arena Archetypes")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: /Dagger \/ Crit/i }).at(-1)!);
    fireEvent.click(screen.getByRole("button", { name: "Apply Build" }));

    expect(screen.getByRole("button", { name: "Select Piercing Lunge" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select Killer Focus" })).toBeTruthy();
  });

  it("lets the bot switch to curated gear presets and updates its snapshot", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open bot build presets" }));
    expect(screen.getByText("Bot Builds")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /MC Mace \/ Control/i }));

    expect(screen.getAllByText("Mace / Control").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blunt").length).toBeGreaterThan(0);
  });
});
