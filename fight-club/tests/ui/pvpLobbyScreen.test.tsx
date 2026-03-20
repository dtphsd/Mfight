import { fireEvent, render, screen } from "@testing-library/react";
import { PvpLobbyScreen } from "@/ui/screens/PvpLobby/PvpLobbyScreen";

describe("PvpLobbyScreen", () => {
  it("renders the player build stack and room-entry actions", () => {
    const onCreateMatch = vi.fn();
    const onJoinMatch = vi.fn();
    const onMatchmaking = vi.fn();

    render(
      <PvpLobbyScreen
        onBack={() => {}}
        onCreateMatch={onCreateMatch}
        onJoinMatch={onJoinMatch}
        onMatchmaking={onMatchmaking}
      />
    );

    expect(screen.getByTestId("pvp-lobby-screen")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open builder" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open build presets" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open inventory" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create Match" }));
    fireEvent.change(screen.getByRole("textbox", { name: "PvP lobby room code" }), {
      target: { value: "abc123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Join by Code" }));
    fireEvent.click(screen.getByRole("button", { name: "Matchmaking" }));

    expect(onCreateMatch).toHaveBeenCalledTimes(1);
    expect(onJoinMatch).toHaveBeenCalledTimes(1);
    expect(onMatchmaking).toHaveBeenCalledTimes(1);
    expect(onCreateMatch.mock.calls[0]?.[0]?.snapshot?.characterId).toBeTruthy();
    expect(onCreateMatch.mock.calls[0]?.[0]?.playerName).toBe("Player");
    expect(onJoinMatch.mock.calls[0]?.[1]).toBe("ABC123");
    expect(screen.getByRole("button", { name: "Ready inside room only" }).hasAttribute("disabled")).toBe(true);
  });
});
