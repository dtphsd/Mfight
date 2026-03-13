import { renderCombatRulesRichText } from "../combatRulesRichText";
import type { Locale, RulePageCopy } from "../types";

interface CombatRulesHeroProps {
  locale: Locale;
  copy: RulePageCopy;
  onBack: () => void;
  onOpenCombatSandbox: () => void;
  onChangeLocale: (locale: Locale) => void;
}

export function CombatRulesHero({
  locale,
  copy,
  onBack,
  onOpenCombatSandbox,
  onChangeLocale,
}: CombatRulesHeroProps) {
  return (
    <header className="combat-rules-library__hero">
      <div className="combat-rules-library__hero-main">
        <div className="combat-rules-library__toolbar">
          <div className="combat-rules-library__eyebrow">{copy.eyebrow}</div>
          <div className="combat-rules-library__locale-switch" role="tablist" aria-label="Combat rules language">
            <button
              type="button"
              className={`combat-rules-library__locale-button${locale === "ru" ? " combat-rules-library__locale-button--active" : ""}`}
              onClick={() => onChangeLocale("ru")}
            >
              RU
            </button>
            <button
              type="button"
              className={`combat-rules-library__locale-button${locale === "en" ? " combat-rules-library__locale-button--active" : ""}`}
              onClick={() => onChangeLocale("en")}
            >
              EN
            </button>
          </div>
        </div>

        <h1 className="combat-rules-library__title">{copy.title}</h1>
        <p className="combat-rules-library__lead">{renderCombatRulesRichText(copy.lead)}</p>

        <div className="combat-rules-library__actions">
          <button type="button" className="main-menu__cta" onClick={onOpenCombatSandbox}>
            {copy.openSandbox}
          </button>
          <button type="button" className="main-menu__ghost" onClick={onBack}>
            {copy.backToMenu}
          </button>
        </div>
      </div>

      <aside className="combat-rules-library__contents">
        <div className="combat-rules-library__contents-title">{copy.contentsTitle}</div>
        <nav className="combat-rules-library__contents-list" aria-label={copy.contentsTitle}>
          {copy.contents.map((entry, index) => (
            <a key={entry.id} className="combat-rules-library__contents-link" href={`#${entry.id}`}>
              <span className="combat-rules-library__contents-index">{String(index + 1).padStart(2, "0")}</span>
              <span>{entry.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </header>
  );
}
