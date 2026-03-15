import { useState } from "react";
import { AppShell } from "@/ui/components/layout/AppShell";
import { CombatSandboxScreen } from "@/ui/screens/Combat/CombatSandboxScreen";
import { CombatRulesScreen } from "@/ui/screens/CombatRules/CombatRulesScreen";
import { HuntingScreen } from "@/ui/screens/Hunting/HuntingScreen";
import { MainMenuScreen } from "@/ui/screens/MainMenu/MainMenuScreen";

export function App() {
  const [screen, setScreen] = useState<"menu" | "combat" | "rules" | "hunting">("menu");
  const [playerName, setPlayerName] = useState("Player");

  return (
    <AppShell>
      {screen === "menu" ? (
        <MainMenuScreen
          playerName={playerName}
          onOpenCombatSandbox={() => setScreen("combat")}
          onOpenCombatRules={() => setScreen("rules")}
          onOpenHunting={() => setScreen("hunting")}
        />
      ) : screen === "rules" ? (
        <CombatRulesScreen
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
    </AppShell>
  );
}
