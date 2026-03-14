import { useGameApp } from "@/ui/hooks/useGameApp";

interface MainMenuScreenProps {
  onOpenCombatSandbox: () => void;
  onOpenCombatRules: () => void;
  onOpenHunting: () => void;
}

export function MainMenuScreen({ onOpenCombatSandbox, onOpenCombatRules, onOpenHunting }: MainMenuScreenProps) {
  const { logger } = useGameApp();

  return (
    <section className="main-menu">
      <div className="main-menu__hero">
        <div className="main-menu__panel">
          <p className="main-menu__eyebrow">Combat Prototype</p>
          <h1 className="main-menu__title">Fight Club</h1>
          <div className="main-menu__subtitle-row">
            <span className="main-menu__subtitle-pill">Arena sandbox</span>
            <span className="main-menu__subtitle-pill">Readable combat feedback</span>
            <span className="main-menu__subtitle-pill">Deterministic loop</span>
          </div>
          <p className="main-menu__copy">
            Deterministic 1v1 sandbox for build tuning, stat progression checks and combat loop inspection.
            The current client is focused on readable combat feedback, item bonuses and safe iteration on balance.
          </p>
          <div className="main-menu__actions">
            <button
              type="button"
              className="main-menu__cta"
              onClick={() => {
                logger.info("Combat sandbox opened");
                onOpenCombatSandbox();
              }}
            >
              Open Combat Sandbox
            </button>
            <button type="button" className="main-menu__ghost" onClick={onOpenCombatRules}>
              Read Combat Rules
            </button>
            <button
              type="button"
              className="main-menu__ghost"
              onClick={() => {
                logger.info("Hunting lodge opened");
                onOpenHunting();
              }}
            >
              Open Hunting Lodge
            </button>
          </div>
          <div className="main-menu__feature-strip">
            <div className="main-menu__feature-card">
              <div className="main-menu__feature-label">Focus</div>
              <div className="main-menu__feature-value">Build, equip and resolve rounds in one flow</div>
            </div>
            <div className="main-menu__feature-card">
              <div className="main-menu__feature-label">Why It Matters</div>
              <div className="main-menu__feature-value">Fast balancing without backend noise or hidden state</div>
            </div>
          </div>
        </div>

        <div className="main-menu__stats">
          <div className="main-menu__stats-head">
            <div className="main-menu__stats-kicker">Session Snapshot</div>
            <div className="main-menu__stats-note">Current frontend build state</div>
          </div>
          <div className="main-menu__tag-row">
            <span className="main-menu__tag">React 19</span>
            <span className="main-menu__tag">TypeScript</span>
            <span className="main-menu__tag">Vite</span>
            <span className="main-menu__tag">Vitest</span>
          </div>
          <div className="main-menu__stat-grid">
            <div className="main-menu__stat-card">
              <div className="main-menu__stat-label">Current Mode</div>
              <div className="main-menu__stat-value">Sandbox</div>
            </div>
            <div className="main-menu__stat-card">
              <div className="main-menu__stat-label">Combat</div>
              <div className="main-menu__stat-value">1v1</div>
            </div>
            <div className="main-menu__stat-card">
              <div className="main-menu__stat-label">Persistence</div>
              <div className="main-menu__stat-value">Local</div>
            </div>
            <div className="main-menu__stat-card">
              <div className="main-menu__stat-label">Runtime</div>
              <div className="main-menu__stat-value">Deterministic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
