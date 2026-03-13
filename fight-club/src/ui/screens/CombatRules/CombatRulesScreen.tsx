import { useState } from "react";

import { combatRulesContent } from "./combatRulesContent";
import { CombatRulesHero } from "./components/CombatRulesHero";
import { CombatRulesSection } from "./components/CombatRulesSection";
import type { CombatRulesScreenProps, Locale } from "./types";

export function CombatRulesScreen({ onBack, onOpenCombatSandbox }: CombatRulesScreenProps) {
  const [locale, setLocale] = useState<Locale>("ru");
  const copy = combatRulesContent[locale];

  return (
    <section className="combat-rules-library">
      <CombatRulesHero
        locale={locale}
        copy={copy}
        onBack={onBack}
        onOpenCombatSandbox={onOpenCombatSandbox}
        onChangeLocale={setLocale}
      />

      <div className="combat-rules-library__sections">
        {copy.sections.map((section) => (
          <CombatRulesSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}
