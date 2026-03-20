import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createCharacter } from "@/modules/character";
import { buildCombatSnapshot } from "@/orchestration/combat/buildCombatSnapshot";
import { OnlineDuelScreen } from "@/ui/screens/OnlineDuel/OnlineDuelScreen";

describe("OnlineDuelScreen", () => {
  function createPreparedFighter(name: string) {
    const created = createCharacter(name);
    if (!created.success) {
      throw new Error("failed to create prepared fighter");
    }

    return {
      snapshot: buildCombatSnapshot({
        character: created.data,
        flatBonuses: [],
        percentBonuses: [],
      }),
      figure: "rush-chip" as const,
      playerName: name,
      equipment: [{ slot: "mainHand" as const, item: null }],
    };
  }

  it("hosts, readies, and resolves a local online duel round through the client seam", async () => {
    render(<OnlineDuelScreen onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Room" }).hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Room" }));
    await waitFor(() => {
      expect(screen.getAllByText(/Match Code/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Match live|Create match/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Match Code/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText("Waiting for rival").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Join Match" }));
    const roomCode = screen.getByRole("textbox", { name: /Match Code/i });
    expect(roomCode).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Join Match" })[1]);
    await waitFor(() => {
      expect(screen.getByText("Combat Arena")).toBeTruthy();
      expect(screen.getByText("Ready check")).toBeTruthy();
      expect(screen.getByText("Fight Controls")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Show Debug Tools" }));
    fireEvent.click(screen.getByRole("button", { name: "Guest Disconnect" }));
    await waitFor(() => {
      expect(screen.getByText("connection_updated")).toBeTruthy();
      expect(screen.getAllByText("Offline").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("session-guest-1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "New Guest Session" }));
    expect(screen.getByText("session-guest-2")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Join Match" })[1]);
    await waitFor(() => {
      expect(screen.queryAllByText("Offline").length).toBe(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Host Side" }));
    fireEvent.click(screen.getByRole("button", { name: "Ready Selected Side" }));
    fireEvent.click(screen.getByRole("button", { name: "Ready Up" }));

    await waitFor(() => {
      expect(screen.getByText("duel_ready")).toBeTruthy();
      expect(screen.getAllByText("Ready").length).toBeGreaterThan(1);
      expect(screen.getByText("Choose actions")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Host Side" }));
    fireEvent.click(screen.getByRole("button", { name: "Host attack zone waist" }));
    fireEvent.click(screen.getByRole("button", { name: "Host defense zone legs" }));
    expect(screen.getByText("Waist / Guard Belly + Legs")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lock Selected Attack" }));
    fireEvent.click(screen.getByRole("button", { name: "Guest Side" }));
    fireEvent.click(screen.getByRole("button", { name: "Guest attack zone head" }));
    fireEvent.click(screen.getByRole("button", { name: "Guest defense zone waist" }));
    expect(screen.getByText("Head / Guard Belly + Waist")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lock Attack" }));

    await waitFor(() => {
      expect(screen.getByText("round_ready")).toBeTruthy();
      expect(screen.getByText("round_resolved")).toBeTruthy();
      expect(screen.getByText("Round Result")).toBeTruthy();
      expect(screen.getAllByText("Round 1").length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Host -> Guest|Guest -> Host/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Force Timeout" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Match" })).toBeTruthy();
      expect(screen.getAllByRole("button", { name: "Join Match" }).length).toBeGreaterThan(0);
    });
  });

  it("returns to the create flow when the player leaves the room", async () => {
    render(<OnlineDuelScreen onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Room" }).hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Room" }));
    await waitFor(() => {
      expect(screen.getAllByText(/Match Code/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Leave Room" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Room" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Create Match" })).toBeTruthy();
      expect(screen.queryByRole("textbox", { name: /Match Code/i })).toBeNull();
    });
  });

  it("lets the host ready up from the direct create flow before a rival joins", async () => {
    render(<OnlineDuelScreen onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Room" }).hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Room" }));

    await waitFor(() => {
      expect(screen.getAllByText(/Match Code/i).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "Ready Up" }).hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Ready Up" }));

    await waitFor(() => {
      expect(screen.getAllByText("Hold").length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1\/2 ready/i).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: "Cancel Ready" }).hasAttribute("disabled")).toBe(false);
    });
  });

  it("shows a live-service warning instead of creating a local room from the PvP lobby create path", async () => {
    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="create"
        preparedPlayer={createPreparedFighter("Lobby Hero")}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PvP Fight")).toBeTruthy();
      expect(screen.getByText("Opening match...")).toBeTruthy();
      expect(
        screen.getAllByText(
          "Connection issue: the live match service is offline. Start online:server before creating or joining a PvP fight."
        ).length
      ).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/^Duel Code$/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Create Room" })).toBeNull();
    expect(screen.queryByText("Debug Tools")).toBeNull();
  });

  it("does not allow the PvP lobby create path to fall back to a local room", async () => {
    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="create"
        preparedPlayer={createPreparedFighter("Lobby Hero")}
      />
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(
          "Connection issue: the live match service is offline. Start online:server before creating or joining a PvP fight."
        ).length
      ).toBeGreaterThan(0);
    });

    expect(screen.queryByRole("button", { name: "Ready Up" })).toBeNull();
    expect(screen.queryByText("1/2 ready")).toBeNull();
  });

  it("shows a live-service warning instead of silently missing the room on the PvP lobby join path", async () => {
    const hostRender = render(<OnlineDuelScreen onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Room" }).hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Room" }));

    let roomCode = "";
    await waitFor(() => {
      expect(screen.getAllByText(/Match Code/i).length).toBeGreaterThan(0);
      const codeValue = screen.getAllByText((content) => /^[A-Z0-9]{6}$/.test(content))[0];
      roomCode = codeValue.textContent ?? "";
      expect(roomCode.length).toBe(6);
    });

    hostRender.unmount();

    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="join"
        initialJoinCode={roomCode}
        preparedPlayer={createPreparedFighter("Guest Hero")}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PvP Fight")).toBeTruthy();
      expect(screen.getByText("Joining match...")).toBeTruthy();
      expect(
        screen.getAllByText(
          "Connection issue: the live match service is offline. Start online:server before creating or joining a PvP fight."
        ).length
      ).toBeGreaterThan(0);
    });

    expect(screen.getByText("Combat Arena")).toBeTruthy();
    expect(screen.queryByText("Debug Tools")).toBeNull();
  });

  it("shows a live-service warning instead of entering local matchmaking from the PvP lobby path", async () => {
    render(
      <OnlineDuelScreen
        onBack={() => {}}
        initialEntryMode="matchmaking"
        preparedPlayer={createPreparedFighter("Queue Hero")}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PvP Fight")).toBeTruthy();
      expect(screen.getAllByText(/Searching for a rival|Searching for another prepared fighter/i).length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(
          "Connection issue: the live match service is offline. Start online:server before creating or joining a PvP fight."
        ).length
      ).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/^Duel Code$/i)).toBeNull();
    expect(screen.queryByText("Debug Tools")).toBeNull();
  });
});
