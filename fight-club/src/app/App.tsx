import { Suspense, lazy, useState } from "react";
import { AppShell } from "@/ui/components/layout/AppShell";
import { MainMenuScreen } from "@/ui/screens/MainMenu/MainMenuScreen";
import type { PvpPreparedFighter } from "@/ui/screens/PvpLobby/pvpLobbyTypes";

const CombatSandboxScreen = lazy(() =>
  import("@/ui/screens/Combat/CombatSandboxScreen").then((module) => ({
    default: module.CombatSandboxScreen,
  }))
);
const CombatRulesScreen = lazy(() =>
  import("@/ui/screens/CombatRules/CombatRulesScreen").then((module) => ({
    default: module.CombatRulesScreen,
  }))
);
const HuntingScreen = lazy(() =>
  import("@/ui/screens/Hunting/HuntingScreen").then((module) => ({
    default: module.HuntingScreen,
  }))
);
const CombatAgentScreen = lazy(() =>
  import("@/ui/screens/CombatAgent/CombatAgentScreen").then((module) => ({
    default: module.CombatAgentScreen,
  }))
);
const AdminDashboardScreen = lazy(() =>
  import("@/ui/screens/AdminDashboard/AdminDashboardScreen").then((module) => ({
    default: module.AdminDashboardScreen,
  }))
);
const OnlineDuelScreen = lazy(() =>
  import("@/ui/screens/OnlineDuel/OnlineDuelScreen").then((module) => ({
    default: module.OnlineDuelScreen,
  }))
);
const PvpLobbyScreen = lazy(() =>
  import("@/ui/screens/PvpLobby/PvpLobbyScreen").then((module) => ({
    default: module.PvpLobbyScreen,
  }))
);

const screenLoadingFallback = (
  <div
    style={{
      minHeight: "52vh",
      display: "grid",
      placeItems: "center",
      color: "rgba(255,244,231,0.78)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Loading arena module...
  </div>
);

export function App() {
  const [screen, setScreen] = useState<
    "menu" | "combat" | "rules" | "hunting" | "combat-agent" | "admin-dashboard" | "pvp" | "pvp-room"
  >("menu");
  const [playerName, setPlayerName] = useState("Player");
  const [pvpPreparedFighter, setPvpPreparedFighter] = useState<PvpPreparedFighter | null>(null);
  const [pvpEntryMode, setPvpEntryMode] = useState<"create" | "join" | "matchmaking">("create");
  const [pvpJoinCode, setPvpJoinCode] = useState("");

  return (
    <AppShell>
      {screen === "menu" ? (
        <MainMenuScreen
          playerName={playerName}
          onOpenCombatSandbox={() => setScreen("combat")}
          onOpenCombatRules={() => setScreen("rules")}
          onOpenHunting={() => setScreen("hunting")}
          onOpenCombatAgent={() => setScreen("combat-agent")}
          onOpenAdminDashboard={() => setScreen("admin-dashboard")}
          onOpenPvp={() => setScreen("pvp")}
        />
      ) : (
        <Suspense fallback={screenLoadingFallback}>
          {screen === "rules" ? (
            <CombatRulesScreen
              onBack={() => setScreen("menu")}
              onOpenCombatSandbox={() => setScreen("combat")}
            />
          ) : screen === "combat-agent" ? (
            <CombatAgentScreen
              onBack={() => setScreen("menu")}
              onOpenCombatSandbox={() => setScreen("combat")}
            />
          ) : screen === "admin-dashboard" ? (
            <AdminDashboardScreen
              onBack={() => setScreen("menu")}
              onOpenPvp={() => setScreen("pvp")}
            />
          ) : screen === "pvp" ? (
            <PvpLobbyScreen
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
              onBack={() => setScreen("menu")}
              onCreateMatch={(fighter) => {
                setPvpPreparedFighter(fighter);
                setPvpEntryMode("create");
                setPvpJoinCode("");
                setScreen("pvp-room");
              }}
              onJoinMatch={(fighter, roomCode) => {
                setPvpPreparedFighter(fighter);
                setPvpEntryMode("join");
                setPvpJoinCode(roomCode);
                setScreen("pvp-room");
              }}
              onMatchmaking={(fighter) => {
                setPvpPreparedFighter(fighter);
                setPvpEntryMode("matchmaking");
                setPvpJoinCode("");
                setScreen("pvp-room");
              }}
            />
          ) : screen === "pvp-room" ? (
            <OnlineDuelScreen
              onBack={() => setScreen("pvp")}
              initialEntryMode={pvpEntryMode}
              preparedPlayer={pvpPreparedFighter}
              initialJoinCode={pvpJoinCode}
            />
          ) : screen === "hunting" ? (
            <HuntingScreen onBack={() => setScreen("menu")} />
          ) : (
            <CombatSandboxScreen
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
            />
          )}
        </Suspense>
      )}
    </AppShell>
  );
}
