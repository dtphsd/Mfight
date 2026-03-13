import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <div className="app-shell__content">
          {children}
        </div>
      </div>
    </div>
  );
}
