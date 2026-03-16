# 🧬 Agent Evolution Lab Journal

> **Created**: {{DATE}}
> **Project**: {{PROJECT_NAME}}
> **Agent**: {{AGENT_ID}}
> **Rules**: `.agents/workflows/auto-evolution.md` (RULE 1-8)
> **Format**: JSON-compatible for Tamagotchi visualization

---

## 🎮 Система Уровней

| Level | Название | XP Диапазон | Описание |
|-------|----------|-------------|----------|
| 1-10 | 🟢 **Novice** | 0-50 XP | Учится на ошибках, повторяет баги |
| 11-20 | 🔵 **Apprentice** | 51-120 XP | Знает основные паттерны, читает инструкции |
| 21-30 | 🟣 **Operative** | 121-220 XP | Предупреждает баги до их появления |
| 31-40 | 🟠 **Specialist** | 221-350 XP | Создаёт системы предотвращения |
| 41-50 | 🔴 **Architect** | 351-500 XP | Self-healing pipelines |
| 51-60 | ⚫ **Sentinel** | 501-700 XP | Предсказывает failure modes |
| 61-70 | 🌟 **Mastermind** | 701-950 XP | Каждое решение — шаблон |
| 71-80 | 💎 **Legendary** | 951-1250 XP | Документация самодостаточна |
| 81-90 | 🏆 **Mythic** | 1251-1600 XP | Pipeline эволюционирует автономно |
| 91-100 | 👑 **Transcendent** | 1601+ XP | Полная автономия |

### XP за Impact Score

| Impact | Score | XP | Категория |
|--------|-------|-----|-----------|
| 1-2 | 📝 | +3 | Cosmetic |
| 3-4 | 📋 | +5 | Procedural |
| 5-6 | 🔧 | +8 | Structural |
| 7-8 | 🛡️ | +13 | Preventive |
| 9-10 | 💥 | +21 | Paradigm Shift |

### Бонусы
- **3+ записей за сессию**: +5 XP streak bonus
- **Предотвращённый повторный баг** (confirmed): +8 XP
- **Паттерн переиспользован другим агентом** (confirmed): +13 XP

---

## 📊 Текущий Статус

```
┌─────────────────────────────────────────────────┐
│  🧬 AGENT EVOLUTION STATUS                      │
│                                                 │
│  Level: 1 🟢 Novice                             │
│  Total XP: 56 / 120                             │
│  Next Level: Operative (121 XP)                 │
│  Evolution Entries: 7                           │
│  ██████████████░░░░░░░░░░░░░░  46%           │
│                                                 │
│  Session Streak: 7 entries                      │
│  Top Impact: 6                                  │
│  Patterns Extracted: 7                          │
│  Anti-Patterns Registered: 0                    │
└─────────────────────────────────────────────────┘
```

<!-- STATUS_JSON
{
  "agent_id": "my-agent-001",
  "project": "My Project",
  "level": 11,
  "level_name": "Apprentice",
  "level_emoji": "🔵",
  "xp_current": 56,
  "xp_next_level": 120,
  "total_entries": 7,
  "total_patterns": 7,
  "total_anti_patterns": 0,
  "top_impact": 6,
  "streak": 7,
  "last_updated": "2026-03-16T19:53:00+03:00"
}
-->

---

## 📓 Журнал Эволюции

> Записи добавляются AI-агентом автоматически по RULE 8 из `auto-evolution.md`.
> Каждая запись = EVO-NNN с Impact Score, XP, извлечённым паттерном.

### EVO-001 · Combat Silhouette Safe Decomposition
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 8 XP
**Type**: Process improvement

#### What happened
`CombatSilhouette.tsx` had accumulated multiple render responsibilities in one file while still being consumed by both the combat screen and the profile modal.

#### Why it happened
The component had grown organically around visuals, hover equipment, impact motion, figure rendering, and status presentation, which increased change risk for downstream consumers.

#### Evolution step
The refactor was done as isolated sibling extractions with explicit consumer tracing first, then `lint` and `build` verification after each meaningful slice.

#### 🧠 Extracted Pattern → PAT-001
> **"Trace consumers before UI decomposition"**: Before splitting a heavyweight UI component, first map direct imports and usages so internal extractions do not accidentally mutate the external contract.

<!-- EVO_JSON
{"id":"EVO-001","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Process improvement","pattern":"PAT-001","title":"Combat Silhouette Safe Decomposition"}
-->

### EVO-002 · Post-Refactor Verification Caught Contract Drift
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 16 XP
**Type**: Verification improvement

#### What happened
During the next `CombatSilhouette` decomposition slice, the equipment layer was extracted into a sibling module and a stale local type import was removed too aggressively.

#### Why it happened
The component body was being reduced quickly, but `CombatSilhouetteProps` still referenced `Item`, so the file-level contract and the local implementation details were temporarily out of sync.

#### Evolution step
The break was detected immediately by post-refactor build verification, then fixed by restoring the required type import without rolling back the extraction.

#### 🧠 Extracted Pattern → PAT-002
> **"Verify right after extraction"**: After every structural extraction, run verification immediately so contract drift is caught while the patch context is still small and obvious.

<!-- EVO_JSON
{"id":"EVO-002","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Verification improvement","pattern":"PAT-002","title":"Post-Refactor Verification Caught Contract Drift"}
-->

### EVO-003 · Stateful Impact Logic Moved Behind A Hook
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 24 XP
**Type**: Architecture refinement

#### What happened
After extracting the visual layers of `CombatSilhouette`, the file still owned the entire impact-motion lifecycle and timing state directly.

#### Why it happened
Presentation decomposition happened first, but the stateful behavior that coordinated linger, motion activation, and impact payload updates was still embedded in the component body.

#### Evolution step
The impact orchestration was moved into a dedicated `useCombatImpactMotion` hook so the component can keep shrinking toward a composition surface while the timing behavior stays isolated and testable.

#### 🧠 Extracted Pattern → PAT-003
> **"Extract stateful behavior after visual layers stabilize"**: Once render layers are separated, move the remaining timing or lifecycle orchestration into a dedicated hook so the top-level component becomes a clear coordinator.

<!-- EVO_JSON
{"id":"EVO-003","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Architecture refinement","pattern":"PAT-003","title":"Stateful Impact Logic Moved Behind A Hook"}
-->

### EVO-004 · Legacy Resource Grid Duplicate Removed
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 32 XP
**Type**: Cleanup hardening

#### What happened
`CombatSandboxScreen.tsx` still contained a dead local `ResourceGrid` implementation even though the live screen had already switched to the extracted `combatSandboxScreenResourceGrid` module.

#### Why it happened
The refactor had stabilized the real replacement first, but the original in-file helper was left behind as inert legacy code at the bottom of the screen file.

#### Evolution step
The duplicate block was removed only after confirming the active import and render path, then `lint` and `build` were rerun immediately to prove the screen no longer depended on the stale local copy.

#### 🧠 Extracted Pattern → PAT-004
> **"Remove dead duplicates after the replacement stabilizes"**: Once an extracted module is confirmed as the live path, delete the old in-file duplicate promptly so it cannot drift, confuse future edits, or mask the real source of truth.

<!-- EVO_JSON
{"id":"EVO-004","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Cleanup hardening","pattern":"PAT-004","title":"Legacy Resource Grid Duplicate Removed"}
-->

### EVO-005 · Fight Setup Flow Extracted From The Screen Shell
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 40 XP
**Type**: Composition refinement

#### What happened
`CombatSandboxScreen.tsx` still owned the full fight-setup render flow for controls, targeting, round advance, and action rails even after other slices had already been split into sibling modules.

#### Why it happened
The screen was shrinking incrementally, but the central setup section remained embedded because it stitched together several already-extracted child panels and shared style tokens.

#### Evolution step
The setup render layer was moved into `combatSandboxScreenSetup.tsx` and wired back into the screen through explicit style and behavior props, keeping the top-level file closer to a pure coordinator while preserving runtime behavior.

#### 🧠 Extracted Pattern → PAT-005
> **"Extract local composition once child modules are already stable"**: When a screen still feels heavy after helper and panel extractions, move the remaining in-file composition block into its own sibling module and pass styles/actions explicitly instead of keeping a half-container inside the parent file.

<!-- EVO_JSON
{"id":"EVO-005","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Composition refinement","pattern":"PAT-005","title":"Fight Setup Flow Extracted From The Screen Shell"}
-->

### EVO-006 · Combat Stage Extracted Into A Dedicated Screen Module
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 48 XP
**Type**: Screen decomposition

#### What happened
`CombatSandboxScreen.tsx` still held the full stage composition that stitched together the player panel, setup panel, bot panel, finish flash, and victory/defeat visual state.

#### Why it happened
Even after helper and setup extractions, the parent screen still mixed top-level orchestration with a large layout surface that passed shared styles and callbacks down to multiple combat panels.

#### Evolution step
The entire stage composition was moved into `combatSandboxScreenStage.tsx`, with shared style tokens and actions passed explicitly so the parent screen could keep shrinking toward a true orchestration shell.

#### 🧠 Extracted Pattern → PAT-006
> **"Extract the stage shell before touching overlay orchestration"**: When a screen contains both a large visible stage and a complex overlay layer, separate the static composition shell first so the remaining overlay work can be handled in a smaller, more focused file.

<!-- EVO_JSON
{"id":"EVO-006","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Screen decomposition","pattern":"PAT-006","title":"Combat Stage Extracted Into A Dedicated Screen Module"}
-->

### EVO-007 · Overlay Orchestration Extracted After Stage Stabilization
**Date**: 2026-03-16
**Impact**: 6/10 🔧 Structural
**XP**: +8 · **Cumulative**: 56 XP
**Type**: Overlay decomposition

#### What happened
After the stage shell moved out, `CombatSandboxScreen.tsx` still owned the entire overlay orchestration layer for lazy popovers, inventory, build flows, and profile modals.

#### Why it happened
The overlay side was riskier than the visible stage because it mixed lazy imports, fallback UI, profile mail actions, and multiple modal-specific data contracts in one remaining block.

#### Evolution step
The full overlay layer was moved into `combatSandboxScreenOverlays.tsx` together with its lazy loaders and preload helper, then the parent screen was rewired to call a single preload function and render one overlay module.

#### 🧠 Extracted Pattern → PAT-007
> **"Move lazy overlay orchestration with its loaders"**: When extracting a modal-heavy overlay block, move the lazy imports, fallback UI, and preload helper into the same sibling module so the parent shell does not keep hidden coupling to modal internals.

<!-- EVO_JSON
{"id":"EVO-007","date":"2026-03-16","impact":6,"xp":8,"category":"Structural","type":"Overlay decomposition","pattern":"PAT-007","title":"Overlay Orchestration Extracted After Stage Stabilization"}
-->

---

## 🧠 Pattern Registry (что ДЕЛАТЬ)

| # | Паттерн | Source | Применимость |
|---|---------|--------|-------------|
| PAT-001 | Trace consumers before UI decomposition | EVO-001 | Любой безопасный рефактор тяжелого UI-компонента с живыми consumers |
| PAT-002 | Verify right after extraction | EVO-002 | Любая декомпозиция, где легко потерять локальный тип или контракт после выноса кода |
| PAT-003 | Extract stateful behavior after visual layers stabilize | EVO-003 | UI-компоненты, где render уже разложен, но timing/lifecycle логика все еще застряла в верхнем файле |
| PAT-004 | Remove dead duplicates after the replacement stabilizes | EVO-004 | Cleanup после extraction, когда новый sibling-модуль уже живой, а старый локальный дубликат только путает источник правды |
| PAT-005 | Extract local composition once child modules are already stable | EVO-005 | Большие screen/container-файлы, где почти все дочерние блоки уже вынесены, но центральная раскладка все еще держит файл раздутым |
| PAT-006 | Extract the stage shell before touching overlay orchestration | EVO-006 | Экраны с крупным visible-stage и отдельным сложным overlay-слоем, где безопаснее сначала отделить статическую композицию |
| PAT-007 | Move lazy overlay orchestration with its loaders | EVO-007 | Modal-heavy UI-экраны, где lazy imports, fallback UI и preload-логика должны жить рядом с самим overlay-слоем |

---

## 🚫 Anti-Pattern Registry (что НЕ ДЕЛАТЬ)

| # | Anti-Pattern | Source | Root Cause |
|---|-------------|--------|-----------|
<!-- Anti-patterns will be added here by the AI agent -->

---

## 📈 XP Timeline

| Session | Entries | XP Earned | Total | Level |
|---------|---------|-----------|-------|-------|
| 2026-03-16 | 7 | +56 | 56 | 11 🔵 Apprentice |

---

## 📏 Метрики

| Метрика | Значение |
|---------|----------|
| Всего EVO-записей | 7 |
| Preventive entries | 0 (0%) |
| Structural entries | 7 (100%) |
| Средний Impact | 6 |
| Паттернов (PAT) | 7 |
| Anti-паттернов (AP) | 0 |
| Повторных багов предотвращено | 0 |

---

## 🎮 Визуализация

> Этот документ спроектирован для парсинга. JSON блоки в HTML-комментариях (`STATUS_JSON`, `EVO_JSON`)
> содержат machine-readable данные для визуализации на сайте-тамагочи.
>
> Откройте `visualizer/index.html` в браузере и загрузите этот файл чтобы увидеть своего тамагочи!
