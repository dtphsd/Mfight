import { createContext, useContext, useRef, type PropsWithChildren } from "react";
import { createGameApp } from "@/app/bootstrap/createGameApp";

type GameApp = ReturnType<typeof createGameApp>;

const AppContext = createContext<GameApp | null>(null);

export function AppProviders({ children }: PropsWithChildren) {
  const appRef = useRef<GameApp | null>(null);

  if (!appRef.current) {
    appRef.current = createGameApp();
  }

  return <AppContext.Provider value={appRef.current}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("App context is not available");
  }

  return context;
}

