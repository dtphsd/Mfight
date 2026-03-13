# UI / UX Refactor

> Last updated: 2026-03-13 23:20 MSK

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

UI / UX audit and phased roadmap are complete. `UI-002`, `UI-003`, and `UI-004` are finished. The active implementation steps are `UI-008` for structural decomposition and `UI-010` for the first visual polish slice.

---

## Следующий шаг

Start decomposing the next heavyweight combat components now that `CombatSandboxScreen.tsx` has been converted into a section coordinator.

---

## Current Baseline

- planning workflow is active in `MASTER-PLAN.md`
- current saved planning checkpoint is `v0.3`
- current saved UI rollback checkpoint is `v0.4`
- current implementation task is `UI-008`

---

## Active Implementation Step

- completed in the previous slice (`UI-002`):
  - `src/ui/components/shared/ActionButton.tsx`
  - `src/ui/components/shared/ModalOverlay.tsx`
  - `src/ui/components/shared/ModalSurface.tsx`
  - `src/ui/components/shared/PanelCard.tsx`
  - `src/ui/components/combat/InventoryPopover.tsx`
  - `src/ui/components/combat/EquipmentSlotPopover.tsx`
  - `src/ui/components/combat/BuildPresetsPopover.tsx`
  - `src/ui/components/combat/BuilderPopover.tsx` outer shell and top-level action buttons
  - `src/ui/components/combat/BuilderPopover.tsx` local `PanelCard` now wraps the shared panel primitive
- verified with:
  - `npm run test -- tests/ui/combatSandboxScreen.test.tsx`
  - `npm run build`
- completed in the previous slice (`UI-004`):
  - added `src/ui/hooks/useAnchoredPopup.ts`
  - added `src/ui/components/shared/PreviewSurface.tsx`
  - added `src/ui/components/shared/PreviewTag.tsx`
  - added `src/ui/components/shared/ItemPreviewPopover.tsx`
  - migrated `src/ui/components/combat/ItemHoverPreview.tsx`
  - migrated equipment preview positioning and preview shell inside `src/ui/components/combat/CombatSilhouette.tsx`
  - verified with:
    - `npm run test -- tests/ui/combatSandboxScreen.test.tsx`
    - `npm run build`
- active now:
  - `UI-008`
  - focus: split the next heavyweight combat components after the screen-level decomposition
  - first target files:
    - `src/ui/components/combat/CombatSilhouette.tsx`
    - `src/ui/components/combat/BuilderPopover.tsx`
    - `src/ui/components/combat/ItemPresentationCard.tsx`
    - `src/ui/components/combat/BattleLogPanel.tsx`
  - goal:
    - reduce the size and responsibility of the largest combat UI components without changing player-visible behavior
  - completed in the first `UI-008` slice:
    - extracted `SilhouetteHeader` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteHpBar` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteBoard` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteFigure` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteZonesLayer` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteLegend` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteEquipmentLayer` from `src/ui/components/combat/CombatSilhouette.tsx`
    - extracted `SilhouetteStatusEffects` from `src/ui/components/combat/CombatSilhouette.tsx`
  - completed in the previous screen-decomposition slices:
    - extracted `PlayerCombatPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - extracted `FightControlsPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - extracted `AttackTargetRoundPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - extracted `CombatActionsPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - extracted `BattleLogSection` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - replaced the inline bot sidebar with `BotCombatPanelSidebar`
    - extracted `BotCombatPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
    - extracted `FightSetupPanel` from `src/ui/screens/Combat/CombatSandboxScreen.tsx`
  - verified with:
    - `npm run test -- tests/ui/combatSandboxScreen.test.tsx`
    - `npm run build`
  - next in the same phase:
    - decide whether to continue inside `CombatSilhouette.tsx` with status-effect popup internals or move to the next heavyweight component
  - queued after the current structural pass:
    - `UI-010`
    - focus: visual polish across combat UI without changing product flow
    - targets:
      - strengthen visual hierarchy around `Fight Setup` and primary combat actions
      - reduce panel, tag, and border noise in secondary surfaces
      - normalize typography into clearer title / value / helper / meta tiers
      - simplify preview and popover chrome while preserving the current visual identity
      - improve `CombatSilhouette` readability in idle and active states
      - make `BattleLogPanel` easier to scan during longer playtest sessions
      - add motion feedback for resource readiness, available actions, and impact reactions
    - completed first implementation slice:
      - `VP-M02` ready-state pulse is now active for available skill buttons
      - `VP-M02` ready-state pulse is now active for `Resolve Round` when the round is ready
      - `VP-M03` silhouette hit reaction is now active when an incoming combat result deals damage
      - `VP-M01` resource ring is now active for skill buttons while the required resource is still building
      - verified with:
        - `npm run test -- tests/ui/combatSandboxScreen.test.tsx`
        - `npm run build`

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

### Phase 5A - Visual Polish Pass

Why this matters:

- the combat UI already has a strong visual identity, but hierarchy and readability can be improved without changing the underlying flows

Scope:

- increase contrast between primary actions and secondary controls
- reduce visual noise from repeated borders, glows, and pill treatments
- tighten typography and spacing hierarchy across the sandbox
- simplify popover and preview chrome
- improve silhouette idle-state clarity and selected-state emphasis
- make battle log entries easier to scan quickly
- add a circular readiness/progress treatment around important action buttons when resources are building
- light up or ignite an action button when the required resource threshold is reached
- add subtle silhouette hit-reaction motion when the combatant receives damage
- keep all motion short, readable, and secondary to gameplay clarity

Primary files:

- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- `src/ui/components/combat/CombatSilhouette.tsx`
- `src/ui/components/shared/ActionButton.tsx`
- `src/ui/components/combat/BattleLogPanel.tsx`
- `src/ui/components/combat/BuilderPopover.tsx`
- `src/ui/components/combat/BuildPresetsPopover.tsx`
- `src/ui/components/shared/*`
- `src/styles.css`

Expected effect:

- stronger visual hierarchy
- cleaner panels and previews
- better readability during long sessions
- more intentional combat presentation without losing the current product character
- better feedback when a skill or action is becoming available
- more satisfying combat feel without needing to read every number first

Suggested motion candidates:

- `VP-M01` Resource ring:
  - animate a circular progress treatment around high-priority action buttons while the needed resource is building
  - intended targets: selected skill buttons, key combat actions, possibly `Resolve Round` readiness states
  - status:
    - started
    - current implementation covers skill buttons during the build-up phase before ready state

- `VP-M02` Ready ignition:
  - when the required resource threshold is reached, switch the action button into a brighter ready state with a short glow pulse
  - intended targets: skill buttons and other gated actions
  - status:
    - started
    - current implementation covers skill buttons and `Resolve Round`

- `VP-M03` Silhouette hit reaction:
  - add a very short shake or impact nudge when a fighter receives a hit
  - intended targets: player and bot `CombatSilhouette`
  - status:
    - started
    - current implementation uses incoming `RoundResult.finalDamage > 0` as the trigger

- `VP-M04` Damage / resource micro-feedback:
  - consider lightweight burst or tick animation for resource gain and loss, but only if it stays readable and does not spam the screen

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
6. visual polish pass
7. expanded UI tests

---

## Success Criteria

- `CombatSandboxScreen.tsx` stops being the main monolith
- popovers and previews use one shared infrastructure
- build flow feels like one system instead of several disconnected tools
- round setup becomes guided and easier to read
- important combat actions stand out more than advanced analytics
- UI refactor can proceed with targeted tests protecting critical flows

---

> Last updated: 2026-03-13 22:33 MSK
