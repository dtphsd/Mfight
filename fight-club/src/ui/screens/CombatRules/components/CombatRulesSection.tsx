import { renderCombatRulesRichText } from "../combatRulesRichText";
import { getCombatRulesCalloutClass, getCombatRulesHighlightMode } from "../combatRulesTheme";
import type { HighlightMode, RuleSection } from "../types";

export function CombatRulesSection({ section }: { section: RuleSection }) {
  const highlightMode: HighlightMode = getCombatRulesHighlightMode(section);

  return (
    <section id={section.id} className="combat-rules-library__section">
      <div className="combat-rules-library__section-head">
        <h2 className="combat-rules-library__section-title">{section.title}</h2>
        <p className="combat-rules-library__section-intro">
          {renderCombatRulesRichText(section.intro, highlightMode)}
        </p>
      </div>

      <div className="combat-rules-library__section-body">
        <div className="combat-rules-library__bullet-list">
          {section.bullets.map((item) => (
            <div key={item} className="combat-rules-library__bullet">
              <span className="combat-rules-library__bullet-dot" aria-hidden="true" />
              <span>{renderCombatRulesRichText(item, highlightMode)}</span>
            </div>
          ))}
        </div>

        {section.callouts && section.callouts.length > 0 ? (
          <div className="combat-rules-library__callouts">
            {section.callouts.map((callout) => (
              <article
                key={`${section.id}-${callout.label}`}
                className={getCombatRulesCalloutClass(callout.tone)}
              >
                <div className="combat-rules-library__callout-label">
                  {renderCombatRulesRichText(callout.label, highlightMode)}
                </div>
                <div className="combat-rules-library__callout-value">
                  {renderCombatRulesRichText(callout.value, highlightMode)}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {section.steps && section.steps.length > 0 ? (
        <div className="combat-rules-library__steps">
          {section.steps.map((item) => (
            <div key={item} className="combat-rules-library__step">
              {renderCombatRulesRichText(item, highlightMode)}
            </div>
          ))}
        </div>
      ) : null}

      {section.table ? (
        <div className="combat-rules-library__table-wrap">
          <table className="combat-rules-library__table">
            <thead>
              <tr>
                {section.table.columns.map((column) => (
                  <th key={column}>{renderCombatRulesRichText(column, highlightMode)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell) => (
                    <td key={cell}>{renderCombatRulesRichText(cell, highlightMode)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
