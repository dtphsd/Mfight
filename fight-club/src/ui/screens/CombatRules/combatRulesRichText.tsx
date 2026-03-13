import type { ReactNode } from "react";

import type { HighlightMode } from "./types";

const defaultHighlightPatterns: Array<{ pattern: RegExp; className: string }> = [
  { pattern: /\bStrength\b|\bСила\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bAgility\b|\bЛовкость\b/gi, className: "combat-rules-library__term--agility" },
  { pattern: /\bRage\b|\bЯрость\b/gi, className: "combat-rules-library__term--rage" },
  { pattern: /\bEndurance\b|\bЭндуранс\b/gi, className: "combat-rules-library__term--endurance" },
  { pattern: /\barmor\b|\bброня\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bpenetration\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bblock\b|\bблок\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bdodge\b/gi, className: "combat-rules-library__term--agility" },
  { pattern: /\bcrit\b|\bкрит\b/gi, className: "combat-rules-library__term--rage" },
  { pattern: /\bMomentum\b|\bИмпульс\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bGuard\b|\bГвард\b|\bЗащита\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bFocus\b|\bФокус\b/gi, className: "combat-rules-library__term--agility" },
];

const resourceFirstHighlightPatterns: Array<{ pattern: RegExp; className: string }> = [
  { pattern: /\bMomentum\b|\bИмпульс\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bGuard\b|\bГвард\b|\bЗащита\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bFocus\b|\bФокус\b/gi, className: "combat-rules-library__term--agility" },
  { pattern: /\bRage\b|\bЯрость\b/gi, className: "combat-rules-library__term--rage" },
  { pattern: /\bStrength\b|\bСила\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bAgility\b|\bЛовкость\b/gi, className: "combat-rules-library__term--agility" },
  { pattern: /\bEndurance\b|\bЭндуранс\b/gi, className: "combat-rules-library__term--endurance" },
  { pattern: /\barmor\b|\bброня\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bpenetration\b/gi, className: "combat-rules-library__term--strength" },
  { pattern: /\bblock\b|\bблок\b/gi, className: "combat-rules-library__term--armor" },
  { pattern: /\bdodge\b/gi, className: "combat-rules-library__term--agility" },
  { pattern: /\bcrit\b|\bкрит\b/gi, className: "combat-rules-library__term--rage" },
];

export function renderCombatRulesRichText(text: string, mode: HighlightMode = "default") {
  const patterns = mode === "resource" ? resourceFirstHighlightPatterns : defaultHighlightPatterns;
  const matches: Array<{ start: number; end: number; text: string; className: string }> = [];

  for (const entry of patterns) {
    const pattern = new RegExp(entry.pattern.source, entry.pattern.flags);
    let match: RegExpExecArray | null = pattern.exec(text);

    while (match) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        className: entry.className,
      });
      match = pattern.exec(text);
    }
  }

  if (matches.length === 0) {
    return text;
  }

  matches.sort((left, right) => left.start - right.start || right.end - left.end);
  const filtered = matches.filter((match, index) => {
    const previous = matches[index - 1];
    return !previous || match.start >= previous.end;
  });

  const parts: ReactNode[] = [];
  let cursor = 0;

  filtered.forEach((match, index) => {
    if (match.start > cursor) {
      parts.push(text.slice(cursor, match.start));
    }

    parts.push(
      <span key={`${match.start}-${index}`} className={match.className}>
        {match.text}
      </span>
    );
    cursor = match.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}
