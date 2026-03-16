import { fireEvent, render, screen } from "@testing-library/react";
import { CombatSandboxScreen } from "@/ui/screens/Combat/CombatSandboxScreen";

describe("CombatSandboxScreen", () => {
  it("opens builder and inventory popovers", async () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open builder" }));
    expect(await screen.findByText("Player Builder")).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "Close builder popover" }));

    fireEvent.click(screen.getByRole("button", { name: "Open inventory" }));
    expect(await screen.findByText("Loadout Storage")).toBeTruthy();
  });

  it("lets the player equip new Battle Kings items from inventory", async () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open inventory" }));
    fireEvent.click(await screen.findByRole("button", { name: "Equip Молодой Меч" }));
    fireEvent.click(await screen.findByRole("button", { name: "Equip Кабассет" }));
    fireEvent.click(await screen.findByRole("button", { name: "Equip Перчатки Молотобойца" }));
    fireEvent.click(await screen.findByRole("button", { name: "Equip Пояс Новобранца" }));
    fireEvent.click(await screen.findByRole("button", { name: "Close inventory popover" }));

    expect(screen.getByRole("button", { name: /Main Hand Молодой Меч/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Helmet Кабассет/i })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Gloves/i }).length).toBeGreaterThan(0);
  });

  it("starts combat and appends entries to the battle log after a round resolves", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Start fight" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve round" }));

    expect(screen.getByTestId("battle-log-panel")).toBeTruthy();
    expect(screen.getAllByTestId("battle-log-entry").length).toBeGreaterThan(0);
    expect(screen.getByTestId("latest-round-summary").textContent).not.toContain("No round resolved yet.");
  });

  it("keeps basic attack selected through round transitions without legacy skills", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Start fight" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve round" }));

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

  it("applies a curated build preset from the dedicated presets popover", async () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open build presets" }));
    expect(await screen.findByText("Arena Archetypes")).toBeTruthy();

    fireEvent.click((await screen.findAllByRole("button", { name: /Dagger \/ Crit/i })).at(-1)!);
    fireEvent.click(await screen.findByRole("button", { name: "Apply Build" }));

    expect(screen.getAllByTestId("combat-silhouette-image")[0].getAttribute("data-figure")).toBe("kitsune-bit");
    expect(screen.getAllByRole("button", { name: /Main Hand/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Helmet/i }).length).toBeGreaterThan(0);
  });

  it("lets the bot switch to curated gear presets and updates its snapshot", () => {
    render(<CombatSandboxScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Open bot build presets" }));
    expect(screen.getByText("Bot Builds")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /MC Mace \/ Control/i }));

    expect(screen.getAllByText("Mace / Control").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blunt").length).toBeGreaterThan(0);
  });

  it("supports local profile mail from inbox replies and direct messages", async () => {
    render(<CombatSandboxScreen playerName="Courier" />);

    fireEvent.click(screen.getAllByRole("button", { name: "Open character profile" })[0]);
    fireEvent.click(await screen.findByRole("button", { name: "Open personal mail" }));

    expect(await screen.findByText("Inbox and replies")).toBeTruthy();
    expect(await screen.findByText("Sparring request")).toBeTruthy();
    fireEvent.click(await screen.findByText("Sparring request"));

    fireEvent.change(await screen.findByLabelText("Mail body"), {
      target: { value: "Reply confirmed. Meet me after the next round." },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Send Letter" }));

    expect((await screen.findAllByText("Re: Sparring request")).length).toBeGreaterThan(0);
    fireEvent.click(await screen.findByRole("button", { name: "Close mailbox" }));
    fireEvent.click(await screen.findByRole("button", { name: "Close profile modal" }));

    fireEvent.click(screen.getAllByRole("button", { name: "Open character profile" })[1]);
    fireEvent.click(await screen.findByRole("button", { name: "Write a letter to Arena Bot" }));

    fireEvent.change(await screen.findByLabelText("Mail subject"), {
      target: { value: "Route notes" },
    });
    fireEvent.change(await screen.findByLabelText("Mail body"), {
      target: { value: "Your scouting notes are waiting in the local inbox service." },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Send Letter" }));
    fireEvent.click(await screen.findByRole("button", { name: "Close mailbox" }));
    fireEvent.click(await screen.findByRole("button", { name: "Close profile modal" }));

    fireEvent.click(screen.getAllByRole("button", { name: "Open character profile" })[0]);
    fireEvent.click(await screen.findByRole("button", { name: "Open personal mail" }));

    expect((await screen.findAllByText("Route notes")).length).toBeGreaterThan(0);
  });
});
