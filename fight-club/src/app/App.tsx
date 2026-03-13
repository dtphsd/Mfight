import { useState } from "react";
import { AppShell } from "@/ui/components/layout/AppShell";
import { CombatSandboxScreen } from "@/ui/screens/Combat/CombatSandboxScreen";
import { CombatRulesScreen } from "@/ui/screens/CombatRules/CombatRulesScreen";
import { MainMenuScreen } from "@/ui/screens/MainMenu/MainMenuScreen";

export function App() {
  const [screen, setScreen] = useState<"menu" | "combat" | "rules">("menu");

  return (
    <AppShell>
      {screen === "menu" ? (
        <MainMenuScreen
          onOpenCombatSandbox={() => setScreen("combat")}
          onOpenCombatRules={() => setScreen("rules")}
        />
      ) : screen === "rules" ? (
        <CombatRulesScreen
          onBack={() => setScreen("menu")}
          onOpenCombatSandbox={() => setScreen("combat")}
        />
      ) : (
        <CombatSandboxScreen />
      )}
    </AppShell>
  );
}
