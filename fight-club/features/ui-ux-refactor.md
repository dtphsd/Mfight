# UI / UX Refactor

> Last updated: 2026-03-13 21:52 MSK

**Feature:** UI / UX Refactor  
**Status:** 🟡 IN PROGRESS

---

## Зачем

Сделать интерфейс Fight Club проще для сопровождения, понятнее для пользователя и безопаснее для поэтапного рефакторинга без потери текущей визуальной идентичности.

---

## Проблема

UI перегружен крупными компонентами, плотными экранами, большим количеством inline-стилей и несколькими пересекающимися сценариями сборки билда и настройки раунда.

---

## Root Cause

- слишком много ответственности сосредоточено в нескольких больших UI-файлах
- presentation, formatting и интерактивная логика смешаны в одних и тех же компонентах
- build / inventory / preset / action flows разнесены по нескольким popover-слоям
- нет единого task-tracking артефакта для долгого UI-рефакторинга

---

## Решение

- провести полный UI / UX аудит
- сформировать пошаговый план рефакторинга по приоритетам
- ввести master plan и feature docs для отслеживания статуса и следующего шага
- затем разбивать UI на секции, shared primitives и более прозрачные сценарии

---

## Влияет на

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/hooks/useCombatSandbox.ts`
- `src/ui/components/combat/*`
- `src/styles.css`
- player build flow
- round setup flow
- combat readability and analysis flow

---

## Статус

`🟡 IN PROGRESS`

Current state:

UI / UX audit and phased roadmap are complete. The refactor track stays `IN PROGRESS` because implementation has not started yet.

---

## Следующий шаг

Start with shared UI primitives and popover infrastructure before touching behavior-heavy screens.

---

## Current Baseline

- planning workflow is active in `MASTER-PLAN.md`
- current saved planning checkpoint is `v0.3`
- first implementation task is `UI-002`

---

## Refactor Roadmap

### Phase 1 - UI Foundations

Why first:

- repeated modal, button, card, and overlay patterns currently exist in multiple files
- the same visual language is implemented several times with local inline styles

Scope:

- extract shared UI primitives for modal shells, panel cards, pills, metric cards, and action buttons
- standardize overlay and popup layering
- unify hover / anchored preview positioning

Primary files:

- `src/ui/components/combat/BuildPresetsPopover.tsx`
- `src/ui/components/combat/BuilderPopover.tsx`
- `src/ui/components/combat/InventoryPopover.tsx`
- `src/ui/components/combat/EquipmentSlotPopover.tsx`
- `src/ui/components/combat/ItemHoverPreview.tsx`
- `src/ui/components/combat/CombatSilhouette.tsx`

Expected effect:

- lower UI duplication
- easier visual consistency changes
- lower risk before screen decomposition

---

### Phase 2 - Main Screen Decomposition

Why next:

- `CombatSandboxScreen.tsx` currently mixes orchestration, section layout, and local presentation helpers

Scope:

- split the combat screen into player panel, control panel, bot panel, action rail, and summary sections
- keep the screen responsible only for section composition and open / close state

Primary files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/hooks/useCombatSandbox.ts`
- `src/ui/components/combat/BattleLogPanel.tsx`
- `src/ui/components/combat/CombatSilhouette.tsx`

Expected effect:

- smaller files
- clearer ownership boundaries
- safer future feature work

---

### Phase 3 - Build Flow UX

Why this matters:

- presets, builder, inventory, equipment, and skill setup currently feel like separate systems for one user task

Scope:

- define one build journey
- reduce modal hopping
- make presets, equipment, and skills feel like one connected build center

Primary files:

- `src/ui/components/combat/BuilderPopover.tsx`
- `src/ui/components/combat/BuildPresetsPopover.tsx`
- `src/ui/components/combat/InventoryPopover.tsx`
- `src/ui/components/combat/EquipmentSlotPopover.tsx`
- `src/ui/components/combat/ItemPresentationCard.tsx`

Expected effect:

- lower cognitive load
- faster build iteration
- clearer mental model for players

---

### Phase 4 - Round Setup UX

Why this matters:

- attack type, skill selection, consumable use, attack zone, and defense zones are currently selected as separate controls

Scope:

- reshape round setup into one guided action flow
- make readiness and missing selections obvious
- highlight the current combat step more clearly

Primary files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/hooks/useCombatSandbox.ts`
- `src/orchestration/combat/roundDraft.ts`
- `src/orchestration/combat/combatStateMachine.ts`

Expected effect:

- easier turn construction
- fewer user mistakes
- stronger UX hierarchy between build, action, and resolution

---

### Phase 5 - Density And Readability Pass

Why this matters:

- the sandbox is information-rich, but not all information deserves equal visual weight

Scope:

- demote advanced analytics
- reduce tag noise
- increase readability of secondary text
- separate action mode from analysis mode where possible

Primary files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/components/combat/BattleLogPanel.tsx`
- `src/ui/components/combat/BuilderPopover.tsx`
- `src/styles.css`

Expected effect:

- clearer first-read experience
- better scanability
- less fatigue during long balancing sessions

---

### Phase 6 - UI Test Safety Net

Why this matters:

- current UI is too large and too interactive to refactor safely without stronger contract tests

Scope:

- add tests for modal flows, build flow, action selection flow, and key screen states

Primary files:

- `tests/ui/combatSandboxScreen.test.tsx`
- `tests/ui/combatRulesScreen.test.tsx`
- `tests/ui/battleLogFormatting.test.ts`
- new focused UI tests for builder / popover behavior

Expected effect:

- safer iterative refactor
- lower regression risk

---

## Priority Order

1. shared UI primitives and popup infrastructure
2. sandbox screen decomposition
3. build flow UX
4. round setup UX
5. density and readability pass
6. expanded UI tests

---

## Success Criteria

- `CombatSandboxScreen.tsx` stops being the main monolith
- popovers and previews use one shared infrastructure
- build flow feels like one system instead of several disconnected tools
- round setup becomes guided and easier to read
- important combat actions stand out more than advanced analytics
- UI refactor can proceed with targeted tests protecting critical flows

---

> Last updated: 2026-03-13 21:52 MSK
