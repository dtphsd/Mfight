# MASTER-PLAN - Fight Club

> Last updated: 2026-03-14 01:01 MSK

**Project:** Fight Club  
**Scope:** active product planning, task tracking, and sprint history

---

## How To Use

- Add every active task to the table below.
- Use one status only: `🔴 TODO`, `🟡 IN PROGRESS`, `✅ DONE`, `⏸️ DEFERRED`.
- Keep task names short and stable.
- Link to a feature file in `features/` when the task belongs to a specific feature or refactor track.
- When a task is completed, move its final result into `Sprint History` and update the linked feature doc.

---

## Global Master Plan

| ID | Task | Area | Status | Feature Doc | Notes |
|----|------|------|--------|-------------|-------|
| UI-001 | UI and UX audit with phased refactor roadmap | UI / UX | ✅ DONE | `features/ui-ux-refactor.md` | Audit completed, roadmap formalized |
| UI-002 | Extract shared modal, panel, and action primitives | UI Architecture | ✅ DONE | `features/ui-ux-refactor.md` | Shared modal/button/panel foundation now covers inventory, slot, presets, and builder |
| UI-003 | Split `CombatSandboxScreen` into screen sections | UI Architecture | ✅ DONE | `features/ui-ux-refactor.md` | `CombatSandboxScreen` now renders through `PlayerCombatPanel`, `FightSetupPanel`, `BotCombatPanel`, and `BattleLogSection` |
| UI-004 | Unify popover and hover-preview infrastructure | UX / UI Infrastructure | ✅ DONE | `features/ui-ux-refactor.md` | Shared anchored popup, preview chrome, and item preview shell now cover the main hover-preview flows |
| UI-005 | Rework build flow into one clear UX path | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Merge presets, builder, inventory, and skills into one mental model |
| UI-006 | Rework round setup into guided action flow | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Make action selection procedural and easier to read |
| UI-007 | Reduce combat screen information density | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Demote advanced analytics and surface key actions first |
| UI-008 | Split heavyweight combat components | UI Architecture | 🟡 IN PROGRESS | `features/ui-ux-refactor.md` | `CombatSilhouette` now has extracted header, hp bar, board shell, figure, zones layer, legend, equipment layer, and status-effects layer; next step is choosing the next heavyweight component or continuing with status-effect popup internals |
| UI-009 | Add UI contract tests for critical flows | QA / UI | 🔴 TODO | `features/ui-ux-refactor.md` | Protect build flow, action flow, and modal behavior during refactor |
| UI-010 | Run visual polish pass across combat UI | Visual Design | 🟡 IN PROGRESS | `features/ui-ux-refactor.md` | `VP-M01`, `VP-M02`, and `VP-M03` are live; next motion decision is whether to add `VP-M04` micro-feedback or shift back to broader visual polish work |
| COMBAT-001 | Create complete combat design and rules reference | Combat Design / Docs | ✅ DONE | `features/combat-design-reference.md` | Source-of-truth combat reference now covers runtime model, formulas, passives, turn-order examples, verification rules, bot assumptions, and Combat Rules alignment |
| COMBAT-002 | Document combat resolution pipeline and turn order | Combat Design / Docs | ✅ DONE | `features/combat-design-reference.md` | Combat pipeline docs now cover exact sequencing, edge cases, traceability, and a regression-test target matrix for follow-up QA work |
| COMBAT-003 | Add composition regression tests for combat rules | Combat QA | 🟡 IN PROGRESS | `features/combat-design-reference.md` | Protect combinations like skills plus consumables, effects plus death, and block plus penetration from silent regressions |
| COMBAT-004 | Safely reduce `resolveRound.ts` risk without behavior changes | Combat Refactor | 🔴 TODO | `features/combat-design-reference.md` | Remove fragile duplication and isolate rule blocks only after the design reference and regression tests exist |
| COMBAT-005 | Formalize combat change checklist and verification flow | Combat Workflow | 🔴 TODO | `features/combat-design-reference.md` | Define what must be checked whenever combat formulas, resources, effects, or loadout rules change |

---

## Status Legend

- `🔴 TODO` - not started yet
- `🟡 IN PROGRESS` - actively being worked on
- `✅ DONE` - implemented and documented
- `⏸️ DEFERRED` - intentionally paused or postponed

---

## Execution Rules

- Work strictly phase by phase.
- Keep only one UI refactor task in `🟡 IN PROGRESS` at a time unless a parallel task is genuinely independent.
- Before starting the next phase, update the current task status and add the completed result to `Sprint History`.

---

## Sprint History

### v0.1 - Planning Workflow Added

- added repo-level master plan for task tracking
- added feature documentation template under `features/`
- started formal tracking for UI / UX audit and refactor planning

### v0.2 - UI / UX Refactor Roadmap Defined

- converted the UI / UX audit into a tracked phased roadmap
- split the refactor effort into architecture, UX, and QA workstreams
- prepared task IDs for incremental execution instead of one large rewrite

### v0.3 - Current Baseline Saved

- locked the current planning baseline before implementation work
- marked the audit and roadmap task as complete
- confirmed that the next implementation step is `UI-002`

### v0.4 - UI Rollback Checkpoint Saved

- saved a dedicated UI backup point before starting `UI-002`
- copied the current live combat UI files into `docs/backup-points/2026-03-13-2155-ui-baseline/`
- recorded the checkpoint in `docs/backup-points/BACKUP-POINT-2026-03-13-2155-MSK.md`

### v0.5 - UI-002 Foundation Slice Landed

- added shared UI primitives under `src/ui/components/shared/`
- migrated `InventoryPopover.tsx` and `EquipmentSlotPopover.tsx` to shared modal and action-button primitives
- verified the slice with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.6 - Build Presets Moved To Shared Layer

- migrated `BuildPresetsPopover.tsx` to `ModalOverlay`, `ModalSurface`, `ActionButton`, and `PanelCard`
- preserved the dedicated presets visual theme while reducing duplicated modal and panel code
- re-verified preset apply flow with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.7 - Builder Shell Moved To Shared Layer

- migrated `BuilderPopover.tsx` outer modal shell to `ModalOverlay` and `ModalSurface`
- moved top-level builder actions and preset-entry actions to `ActionButton`
- kept inner builder cards feature-local on purpose to avoid mixing `UI-002` with deeper component decomposition work

### v0.8 - UI-002 Closed, UI-004 Started

- finished the shared modal, panel, and action foundation pass across the main combat popovers
- aligned `BuilderPopover` local `PanelCard` with the shared panel primitive through a thin wrapper
- moved the active refactor focus to hover-preview and anchored popover infrastructure

### v0.9 - Anchored Preview Hook Introduced

- added `src/ui/hooks/useAnchoredPopup.ts` as a shared positioning hook for preview and anchored popover flows
- migrated `ItemHoverPreview.tsx` and the equipment preview inside `CombatSilhouette.tsx` to the new hook
- re-verified the first `UI-004` slice with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.10 - Preview Surface Chrome Unified

- added `src/ui/components/shared/PreviewSurface.tsx` and `src/ui/components/shared/PreviewTag.tsx`
- migrated `ItemHoverPreview.tsx` and `CombatSilhouette.tsx` equipment preview chrome to the same shared preview surface
- kept the actual preview card content unchanged while removing duplicate hover-surface styling

### v0.11 - UI-004 Closed, UI-003 Started

- added `src/ui/components/shared/ItemPreviewPopover.tsx` to unify the preview content shell around `ItemPresentationCard`
- finished the main hover-preview infrastructure pass and closed `UI-004`
- moved the active refactor focus to decomposing `CombatSandboxScreen.tsx` into section-level components

### v0.12 - First Combat Screen Section Extracted

- extracted `PlayerCombatPanel` from `CombatSandboxScreen.tsx` as the first screen-level section component
- kept the player flow and equipment-slot overlay behavior unchanged while reducing the size of the main render body
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.13 - Fight Controls Extracted

- extracted `FightControlsPanel` from `CombatSandboxScreen.tsx` as the first central control section
- prepared `BotCombatPanelSidebar` as a helper for the next bot-panel extraction pass
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.14 - Attack Target And Round Extracted

- extracted `AttackTargetRoundPanel` from `CombatSandboxScreen.tsx`
- reduced the inline center-panel render further without changing round flow or zone selection behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.15 - Combat Actions Extracted

- extracted `CombatActionsPanel` from `CombatSandboxScreen.tsx`
- moved the skills and consumables action-rail section out of the main render without changing combat action behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.16 - Battle Log Section Extracted

- extracted `BattleLogSection` from `CombatSandboxScreen.tsx`
- moved the battle-log shell wrapper out of the main screen render while keeping the log behavior unchanged
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.17 - Bot Sidebar Swapped To Extracted Helper

- replaced the remaining inline bot sidebar in `CombatSandboxScreen.tsx` with `BotCombatPanelSidebar`
- finished the first safe extraction pass over the bot-side utility and snapshot sidebar without changing combat behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.18 - Combat Screen Decomposition Closed

- extracted `BotCombatPanel` and `FightSetupPanel` from `CombatSandboxScreen.tsx`
- completed the screen-level decomposition so the combat screen now acts primarily as a section coordinator
- closed `UI-003` and moved the active refactor focus to `UI-008`

### v0.19 - Combat Silhouette Decomposition Started

- extracted `SilhouetteHeader`, `SilhouetteHpBar`, and `SilhouetteBoard` from `CombatSilhouette.tsx`
- started `UI-008` with a safe structure-first pass that does not change zone interaction or preview behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.20 - Combat Silhouette Zone Layer Extracted

- extracted `SilhouetteFigure`, `SilhouetteZonesLayer`, and `SilhouetteLegend` from `CombatSilhouette.tsx`
- moved zone rendering and legend chrome out of the main silhouette component without changing zone selection or marker behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.21 - Combat Silhouette Equipment Layer Extracted

- extracted `SilhouetteEquipmentLayer` from `CombatSilhouette.tsx`
- moved equipment-slot mapping and hover wiring out of the main silhouette component without changing preview or slot-click behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.22 - Combat Silhouette Status Layer Extracted

- extracted `SilhouetteStatusEffects` from `CombatSilhouette.tsx`
- moved the header-level status-effects entry point out of the main silhouette header without changing badge or popup behavior
- re-verified the screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.23 - Visual Polish Plan Added

- added `UI-010` as a dedicated visual polish task for combat UI
- separated visual styling improvements from the active structural refactor track
- documented concrete polish targets so future visual work can be executed incrementally instead of ad hoc

### v0.24 - Motion Feedback Added To Visual Plan

- expanded `UI-010` to include motion feedback as part of the combat visual polish pass
- added resource-ready button glow and radial progress concepts for action readiness states
- added silhouette hit-reaction animation as a planned feedback layer for received damage events

### v0.25 - UI-010 Motion Implementation Started

- started `UI-010` with `VP-M02`, the lowest-risk ready-state motion slice
- added a pulsing ready-state treatment for skill buttons when the required resource threshold is met
- added the same ready-state pulse to `Resolve Round` when the round is ready to resolve
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.26 - Silhouette Hit Reaction Landed

- implemented `VP-M03` as a short silhouette impact animation when the incoming combat result deals real damage
- applied the motion at the silhouette board layer so both player and bot silhouettes can react without touching combat logic
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

### v0.27 - Resource Ring Landed

- implemented `VP-M01` for skill buttons while the required resource is still building
- added a circular progress ring that fills toward readiness and hands off to the existing ready pulse once the threshold is reached
- re-verified the combat screen with `tests/ui/combatSandboxScreen.test.tsx` and `npm run build`

---

## Planned Refactor Phases

### Phase 1 - Stabilize UI Foundations

- goal: reduce repeated UI patterns before touching behavior-heavy screens
- tasks:
  - `UI-002`
  - `UI-004`
- expected outcome:
  - shared overlay, modal, button, pill, and panel primitives
  - one reusable preview / popover positioning pattern

### Phase 2 - Decompose Main Combat Screen

- goal: turn the sandbox screen into a screen-level coordinator instead of a monolith
- tasks:
  - `UI-003`
  - `UI-008`
- expected outcome:
  - smaller screen sections
  - lower coupling between screen layout and detailed presentation blocks

### Phase 3 - Improve UX Flow

- goal: make build setup and round setup easier to understand and operate
- tasks:
  - `UI-005`
  - `UI-006`
  - `UI-007`
  - `UI-010`
- expected outcome:
  - clearer build journey
  - guided round construction
  - less cognitive overload on the primary screen
  - stronger visual hierarchy and cleaner combat presentation
  - more readable motion feedback for combat readiness and impact states

### Phase 4 - Protect The Refactor

- goal: lock down behavior before or during invasive UI work
- tasks:
  - `UI-009`
- expected outcome:
  - contract tests for modal flows, action flows, and critical combat UI behavior

---

## Feature Docs

- `features/_TEMPLATE.md` - base template for every feature or refactor track
- `features/ui-ux-refactor.md` - reserved for the UI / UX refactor plan and progress log

---

## Saved Checkpoints

| Version | Type | Description | Next Step |
|---------|------|-------------|-----------|
| v0.3 | Planning Baseline | Current UI / UX audit, phased roadmap, and task-tracking workflow saved before refactor work starts | `UI-002` |
| v0.4 | UI Backup Point | Live UI snapshot saved before shared-primitives refactor begins | `UI-002` |
| v0.5 | UI Foundation Slice | Shared primitives introduced and first two popovers moved to the new layer | `UI-002` |
| v0.6 | Presets Shared-Layer Slice | Build presets popover now uses the shared modal, button, and panel primitives | `UI-002` |
| v0.7 | Builder Shell Slice | Builder modal shell and top-level actions now use shared primitives | `UI-002` |
| v0.8 | Foundation Closed | Shared modal, panel, and action primitives are now established enough to close `UI-002` | `UI-004` |
| v0.9 | Anchored Preview Slice | Shared hover/anchored popup hook now powers item hover and silhouette equipment preview positioning | `UI-004` |
| v0.10 | Preview Chrome Slice | Shared preview surface and tag now unify the hover-card chrome across combat UI | `UI-004` |
| v0.11 | Hover Infrastructure Closed | Shared preview hook, surface, tag, and item preview shell are now established enough to close `UI-004` | `UI-003` |
| v0.12 | Player Section Slice | First `CombatSandboxScreen` section extracted without changing combat flow | `UI-003` |
| v0.13 | Fight Controls Slice | First central fight-setup section extracted while preserving combat behavior | `UI-003` |
| v0.14 | Round Setup Slice | Attack target and round-control section extracted from the central combat panel | `UI-003` |
| v0.15 | Combat Actions Slice | Skills and consumables rails extracted from the central combat panel | `UI-003` |
| v0.16 | Battle Log Slice | Battle log shell extracted from the main combat screen render | `UI-003` |
| v0.17 | Bot Sidebar Slice | Bot utility and snapshot sidebar now render through the extracted helper | `UI-003` |
| v0.18 | Screen Decomposition Closed | Bot and center sections now render through extracted screen components; `UI-003` is complete | `UI-008` |
| v0.19 | Silhouette Structure Slice | `CombatSilhouette` now has extracted header, hp bar, and board shell components | `UI-008` |
| v0.20 | Silhouette Zone Slice | `CombatSilhouette` now has extracted figure, zone layer, and legend components | `UI-008` |
| v0.21 | Silhouette Equipment Slice | `CombatSilhouette` now has an extracted equipment-slot layer | `UI-008` |
| v0.22 | Silhouette Status Slice | `CombatSilhouette` now has an extracted status-effects layer entry point | `UI-008` |
| v0.23 | Visual Polish Plan | Dedicated visual design polish task added to the roadmap as `UI-010` | `UI-010` |
| v0.24 | Motion Feedback Plan | Resource-ready and hit-reaction animations added to the visual polish roadmap | `UI-010` |
| v0.25 | Ready-State Motion Slice | `VP-M02` ready-state pulse implemented for skill buttons and `Resolve Round` | `UI-010` |
| v0.26 | Silhouette Hit Reaction Slice | `VP-M03` silhouette impact animation implemented for real incoming damage | `UI-010` |
| v0.27 | Resource Ring Slice | `VP-M01` circular readiness ring implemented for skill buttons while resources are building | `UI-010` |
| v0.28 | Combat Design Rules Requirement | Combat design and rules documentation promoted to a tracked first-class requirement in the master plan | `COMBAT-001` |
| v0.29 | Combat Track Expanded | Combat documentation requirement split into spec, pipeline, test, refactor, and verification tasks | `COMBAT-001` |
| v0.30 | Combat Reference Draft Started | First source-of-truth combat design draft added under `docs/architecture/` and `COMBAT-001` moved to in-progress | `COMBAT-001` |
| v0.31 | Combat Formula Draft Expanded | Combat reference now includes formula coefficients, passive rules, and current coverage notes from the live test suite | `COMBAT-001` |
| v0.32 | Combat Order And Verification Slice | Combat reference now includes turn-order examples and a formal verification checklist for combat changes | `COMBAT-001` |
| v0.33 | Combat Reference Closed | Combat source-of-truth now covers runtime model, formulas, passives, turn order examples, bot assumptions, and rules-screen alignment | `COMBAT-002` |
| v0.34 | Combat Sequencing Slice | Combat pipeline documentation now captures exact per-actor sequencing, path order, and critical edge cases from `resolveRound(...)` | `COMBAT-002` |
| v0.35 | Combat Traceability Slice | Combat reference now maps major runtime rules to tests and Combat Rules dependencies for safer follow-up work | `COMBAT-002` |
| v0.36 | Combat Regression Matrix Added | Combat pipeline docs now hand off directly into a prioritized regression-test matrix for `COMBAT-003` | `COMBAT-003` |
| v0.37 | GitBook Docs Prep | Added docs landing pages, section indexes, and GitBook-friendly navigation links across architecture and decision docs | `DOC-001` |
| v0.38 | GitBook Navigation Finalized | Added `docs/SUMMARY.md` and synchronized root docs for GitBook export readiness | `DOC-001` |
| v0.39 | GitBook Publish Setup Added | Added publish setup guide, docs validation script, and GitHub workflow for GitBook-ready docs handoff | `DOC-001` |
| v0.40 | VitePress Docs Site Added | Added VitePress site config, GitHub Pages deploy workflow, and local docs build commands on top of the repo docs source | `DOC-001` |
| v0.41 | Docs Site Build Verified | Verified local VitePress build and opted workflows into Node 24 execution for GitHub Actions stability | `DOC-001` |

---

## Update Checklist

When work changes state:

1. update the task row in `Global Master Plan`
2. update or create the matching file in `features/`
3. add completed work to `Sprint History`
4. update the timestamp at the top of this file

---

> Last updated: 2026-03-14 01:01 MSK
