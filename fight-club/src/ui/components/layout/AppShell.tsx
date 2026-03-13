import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" aria-hidden="true">
        <span className="app-shell__glow app-shell__glow--fire" />
        <span className="app-shell__glow app-shell__glow--sky" />
        <span className="app-shell__grid" />
      </div>
      <div className="app-shell__frame">
        <div className="app-shell__content">
          {children}
        </div>
      </div>
    </div>
  );
}
