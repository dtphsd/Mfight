import { Suspense, lazy, useState } from "react";
import { AppShell } from "@/ui/components/layout/AppShell";
import { MainMenuScreen } from "@/ui/screens/MainMenu/MainMenuScreen";

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
  const [screen, setScreen] = useState<"menu" | "combat" | "rules" | "hunting" | "combat-agent">("menu");
  const [playerName, setPlayerName] = useState("Player");

  return (
    <AppShell>
      {screen === "menu" ? (
        <MainMenuScreen
          playerName={playerName}
          onOpenCombatSandbox={() => setScreen("combat")}
          onOpenCombatRules={() => setScreen("rules")}
          onOpenHunting={() => setScreen("hunting")}
          onOpenCombatAgent={() => setScreen("combat-agent")}
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
