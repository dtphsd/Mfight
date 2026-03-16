---
description: Auto-evolution protocol — learning from mistakes, preventing regressions
---

# Auto-Evolution Protocol

> **Purpose**: Systematic learning from deployment errors to prevent recurrence.
> Never repeat the same mistake twice.

---

## 🔴 RULE 1: Never Deploy Without Verifying

Before deploying ANY code change:
1. **Run tests** — full suite must pass.
2. **Compare output** with previous working state.
3. **If changing critical paths** — verify downstream consumers still work.

---

## 🔴 RULE 2: One Change → One Deploy → One Verify

**DO NOT** batch multiple features without intermediate verification.

```
Code change → Build → Deploy → Verify → Commit
```

**NOT**:
```
Change A → Change B → Change C → Deploy → "hope it works"
```

---

## 🔴 RULE 3: Observe Patterns

Track recurring issues in the evolution journal. If something breaks twice — create a prevention pattern.

---

## 🟡 RULE 4: Regression Checklist

Before closing any work session, verify key functionality still works as expected.

---

## 🟡 RULE 5: Error Documentation

When an error occurs:
1. **Document immediately** — add to anti-pattern registry in evolution_journal.md
2. **Root cause** — find the exact line(s) that caused it
3. **Write a test** — if the error is testable
4. **Update this workflow** — add prevention steps

---

## 🟡 RULE 6: User Feedback Processing

When you receive negative feedback:
1. **Acknowledge honestly** — don't deflect or minimize
2. **Categorize** — regression (broke something) or gap (never worked)?
3. **If regression** — find the commit that introduced it
4. **If gap** — add to backlog with proper priority

---

## 🟢 RULE 7: Safe Deployment Checklist

```
Before Deploy:
☐ All tests pass
☐ No unintended changes (git diff)
☐ Critical paths verified

After Deploy:
☐ Core functionality works
☐ No new console errors
☐ User-visible output is correct
```

---

## 🧬 RULE 8: Post-Fix Evolution Algorithm

> **Journal**: `evolution_journal.md` — data, patterns, XP/Level, metrics
>
> **This is the most important rule!** After EVERY significant fix or error:

### Algorithm — после КАЖДОГО значимого фикса или ошибки:

```
1. CLASSIFY → Regression / Gap / Process failure / Documentation Drift
      ↓
2. EXTRACT PATTERN → 1 sentence for preventing recurrence
      ↓
3. UPDATE DOCS → deploy/architecture/known bugs
      ↓
4. UPDATE WORKFLOW → this file, add prevention steps
      ↓
5. JOURNAL ENTRY → evolution_journal.md (EVO-NNN, Impact, XP)
```

### Journal Entry Format:

```markdown
### EVO-NNN · Title
**Date**: YYYY-MM-DD
**Impact**: N/10 🛡️ Category
**XP**: +N · **Cumulative**: N XP
**Type**: Classification

#### What happened
Description of the issue.

#### Why it happened
Root cause analysis.

#### Evolution step
What was done to prevent recurrence.

#### 🧠 Extracted Pattern → PAT-NNN
> **"Pattern Name"**: One sentence describing what to always do.
```

Then add a JSON block for the visualizer:
```html
<!-- EVO_JSON
{"id":"EVO-NNN","date":"YYYY-MM-DD","impact":N,"xp":N,"category":"Category","type":"Type","pattern":"PAT-NNN","title":"Title"}
-->
```

And update the `STATUS_JSON` block at the top of evolution_journal.md with new XP total and level.

### XP Calculation

| Impact | XP |
|--------|-----|
| 1-2 | +3 |
| 3-4 | +5 |
| 5-6 | +8 |
| 7-8 | +13 |
| 9-10 | +21 |

### Level Calculation

| XP Range | Level Range | Level Name |
|----------|-------------|------------|
| 0-50 | 1-10 | 🟢 Novice |
| 51-120 | 11-20 | 🔵 Apprentice |
| 121-220 | 21-30 | 🟣 Operative |
| 221-350 | 31-40 | 🟠 Specialist |
| 351-500 | 41-50 | 🔴 Architect |
| 501-700 | 51-60 | ⚫ Sentinel |
| 701-950 | 61-70 | 🌟 Mastermind |
| 951-1250 | 71-80 | 💎 Legendary |
| 1251-1600 | 81-90 | 🏆 Mythic |
| 1601+ | 91-100 | 👑 Transcendent |

**Level formula**: `level = floor(xp / (xp_next_level_start / 10)) + level_range_start`

---

## 🚫 Anti-Pattern Registry (Quick Reference)

Common anti-patterns to watch for:

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| AP-001 | Feature Sprint Blindness | Verify after EACH feature, not batch |
| AP-002 | Test-Only Validation | Visual verification required |
| AP-003 | Fallback Addiction | NO FALLBACKS. Retry → crash → debug |
| AP-004 | Documentation Drift | Update all docs when updating any doc |
| AP-005 | Dismissive Bug Triage | If it returns wrong data = IS a bug |

> Full anti-pattern registry: `evolution_journal.md` → "Anti-Pattern Registry"
