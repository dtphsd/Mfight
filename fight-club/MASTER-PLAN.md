# MASTER-PLAN - Fight Club

> Last updated: 2026-03-14 22:40 MSK

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
| COMBAT-006 | Define first-wave combat expansion states and interaction rules | Combat Design | 🟡 IN PROGRESS | `features/combat-expansion.md` | `Exposed` and `Staggered` now power live setup/payoff loops across charm, mace, axe, shield, and greatsword skills, so the next handoff is player-facing rules/docs sync |
| COMBAT-007 | Design and implement more varied skills around setup/payoff patterns | Combat Content | 🟡 IN PROGRESS | `features/combat-expansion.md` | Second-wave payoff skills are now expanding into armor and accessory kits through `Body Check` and `Killer Focus`, both tied to the live `Exposed` / `Staggered` windows |
| COMBAT-008 | Deepen archetype identity through state synergy and combat loops | Combat Identity | ✅ DONE | `features/combat-expansion.md` | Warden guard loops and Duelist / Executioner finisher loops are now both readable through state-aware payoff skills like `Parry Riposte`, `Iron Brace`, `Heartseeker`, and `Execution Mark` |
| COMBAT-009 | Expand combat docs and Combat Rules for the new state and skill layer | Combat Docs / UX | ✅ DONE | `features/combat-expansion.md` | `Combat Rules` generated facts, verification docs, and reader-facing rules copy now explain `Exposed`, `Staggered`, setup/payoff windows, and short rider expiry nuances |
| COMBAT-010 | Add regression and balance coverage for combat expansion content | Combat QA / Balance | 🟡 IN PROGRESS | `features/combat-expansion.md` | Expansion tests and matrix playtests are running; the latest heavy rescue pass improved `Heavy / Two-Hand` from `Net -27` to `Net -24`, but `Shield / Guard` and `Sustain / Regen` still own the top tier and `Mace / Control` paid part of the price, so the next move should target the sustain/guard cluster or isolate a safer heavy-only buff |
| HUNT-001 | Define hunting domain model and save boundaries | Hunting Architecture | ✅ DONE | `features/hunting-mvp.md` | Hunting model contracts, starter zones, creation helpers, and the `state.hunting.*` save-boundary draft are now established |
| HUNT-002 | Implement autonomous idle hunt loop and session resolution | Hunting Runtime | ✅ DONE | `features/hunting-mvp.md` | `startHunt` and `resolveHunt` now provide deterministic idle hunt simulation with test coverage |
| HUNT-003 | Add reward bridge from hunting into shared inventory | Hunting Economy | ✅ DONE | `features/hunting-mvp.md` | `claimHuntRewards` now converts pending hunt rewards into shared inventory items through the existing inventory module |
| HUNT-004 | Implement hunter progression and base stat allocation | Hunting Progression | ✅ DONE | `features/hunting-mvp.md` | `addHunterExperience` and `allocateHunterStatPoint` are live with tests; level-step rewards and zone unlock timing are now verified |
| HUNT-005 | Implement hunting gear and pet-lite bonuses | Hunting Systems | ✅ DONE | `features/hunting-mvp.md` | Starter hunting gear and pet catalogs, equip and assign flows, and live resolver bonuses are now in place |
| HUNT-006 | Build first hunting UI shell and claim flow | Hunting UX | ✅ DONE | `features/hunting-mvp.md` | `HuntingScreen` and `useHuntingSandbox` now expose zone selection, start/resolve/claim flow, profile summary, pet summary, and shared inventory feedback |
| HUNT-007 | Document hunting architecture and verification flow | Hunting Docs / Safety | ✅ DONE | `features/hunting-mvp.md` | Hunting runtime reference, reward bridge rules, architecture overview sync, and root doc alignment are now documented and validated |
| HUNT-008 | Persist hunting state and offline return flow | Hunting Persistence | ✅ DONE | `features/hunting-mvp.md` | Hunting state now round-trips through the shared save envelope, restores route progress between sessions, and ships with a compact no-scroll lodge UI tuned around restored-session flow, route timing, and claim review |
| HUNT-009 | Add first hunting tool focus layer | Hunting Gameplay | 🟡 IN PROGRESS | `features/hunting-mvp.md` | Tool focus is now live and route stances add the second route-planning lever through `Steady`, `Greedy`, and `Cautious` hunt styles |

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

## Upcoming UX Cleanup Queue

- `UI-011` - add a clear `Current Turn` focus block so the player always sees attack, target zone, defense, active skill or consumable, and readiness in one place
- `UI-012` - turn round setup into a guided path: attack -> zone -> defense -> optional skill or consumable -> resolve
- `UI-013` - reduce combat-screen noise and separate play-now information from analysis and log-heavy information
- `UI-014` - make `Exposed`, `Staggered`, and payoff windows self-explanatory directly in the combat UI
- `UI-015` - reduce build-editing friction by moving presets, inventory, equipment, and skills toward one clearer build center

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
- prepared a dedicated visual-improvement backlog without mixing it into the structural UI refactor

### v0.82 - Hunting Tool Focus Layer Added

- opened `HUNT-009` as the first hunting gameplay layer after the stabilized lodge MVP
- added a compact tool-focus system that changes route-specific yields through `equipHuntingTool(...)`
- documented tool-driven route planning as the next hunting gameplay base after persistence and UI compaction

### v0.83 - Hunting Profile Tab Legacy Save Fix Added

- fixed the hunting `Profile` tab crash for older saves created before `profile.tool` existed
- added save normalization in `loadHuntingState(...)` so legacy hunting profiles automatically receive an empty tool loadout
- added regression coverage for legacy hunting saves without the tool field

### v0.84 - Hunting Route Stances Added

- extended `HUNT-009` with `Steady`, `Greedy`, and `Cautious` route stances
- connected stance bonuses to encounter pace, success rate, and payout behavior in `resolveHunt(...)`
- exposed stance selection in the hunting profile tab and added test coverage for the risk-vs-reward tradeoff

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
| v0.42 | Docs Site Polish Pass | Improved VitePress home page, section landing pages, sidebar structure, and theme styling for a more wiki-like docs experience | `DOC-001` |
| v0.43 | Docs Information Architecture Expanded | Added role-based Gameplay and Systems hubs, stronger home navigation, and a more discoverable wiki-style docs structure | `DOC-001` |
| v0.44 | Docs Section Hubs Refined | Upgraded Gameplay, Systems, Architecture, and Decisions landing pages into fuller wiki-style section hubs with clearer reading paths and task-oriented entry points | `DOC-001` |
| v0.45 | Combat Docs Subsections Added | Split the oversized combat reference into dedicated subsection pages for model, formulas, integrations, and verification with sidebar support | `DOC-001` |
| v0.46 | Combat Expansion Track Added | Added a dedicated master-plan workstream for new combat states, more varied skills, stronger archetype identity, and matching docs/test coverage | `COMBAT-006` |
| v0.47 | Combat State Layer Expanded | Extended the first-wave state system across axe and shield skills, keeping the same readable `Exposed` / `Staggered` layer while growing setup/payoff diversity and regression coverage | `COMBAT-006` |
| v0.48 | Combat Rules State Sync Started | Updated generated Combat Rules facts so the player-facing rules screen now explains the live `Exposed` / `Staggered` setup-payoff layer and condition-based skill bonuses | `COMBAT-009` |
| v0.49 | Combat Verification Docs Synced With State Layer | Extended combat integration and traceability docs so setup/payoff windows and short rider expiry behavior are explicitly part of combat verification | `COMBAT-009` |
| v0.50 | Combat Rules Copy Synced With State Layer | Updated the main English Combat Rules copy so named states and setup/payoff windows are explained directly in the reader-facing sections, not only in generated fact cards | `COMBAT-009` |
| v0.51 | Combat Rules State Sync Closed | Finished the first full docs/rules handoff for the new `Exposed` / `Staggered` layer so runtime, Combat Rules, and verification docs are aligned again | `COMBAT-009` |
| v0.52 | More Varied Payoff Skills Started | Began `COMBAT-007` by extending the current state windows into armor and accessory kits through `Body Check` and `Killer Focus` payoff interactions | `COMBAT-007` |
| v0.53 | Warden Counter Loop Started | Began `COMBAT-008` by turning guard-based kits into a clearer counter-archetype through `Shield Bash` setup into `Parry Riposte` and `Iron Brace` payoff pressure | `COMBAT-008` |
| v0.54 | Duelist And Executioner Loop Expanded | Extended `COMBAT-008` so `Execution Mark` now creates `Exposed` and `Heartseeker` now cashes it in, giving precision and finisher kits a clearer identity alongside the Warden slice | `COMBAT-008` |
| v0.55 | Combat Expansion Balance Snapshot Captured | Promoted `COMBAT-010` into active work after a fresh build matrix showed `Shield / Guard` leading the field while `Dagger / Crit` and `Heavy / Two-Hand` lag behind the current meta | `COMBAT-010` |
| v0.56 | Preset Balance Pass Measured | Rebalanced the curated presets and re-ran the matrix: `Heavy / Two-Hand` improved materially, `Shield / Guard` stayed dominant, and `Dagger / Crit` became the clearest weak point | `COMBAT-010` |
| v0.57 | Dagger Rescue Pass Measured | Restored a more direct burst profile to `Dagger / Crit` and re-ran the matrix: dagger improved clearly, `Shield / Guard` softened slightly, and `Sustain / Regen` emerged as the other top-tier outlier | `COMBAT-010` |
| v0.58 | Heavy Rescue Pass Measured | Restored the stable heavy preset shell, raised greatsword baseline pressure, and slightly strengthened `Execution Arc`; the matrix moved `Heavy / Two-Hand` from `Net -27` to `Net -24`, while `Mace / Control` slipped and the sustain/guard leaders stayed in place | `COMBAT-010` |
| v0.59 | UX Cleanup Track Added | Shifted the next product focus away from open-ended balance tuning and formalized a combat UX cleanup queue around a `Current Turn` block, guided round setup, lower screen noise, clearer state/payoff feedback, and a more unified build flow | `UI-011`, `UI-012`, `UI-013`, `UI-014`, `UI-015` |
| v0.60 | Hunting MVP Blueprint Added | Formalized `hunting` as an autonomous idle-sim workstream, added the first architecture blueprint, and created `HUNT-001` through `HUNT-007` as the implementation roadmap | `HUNT-001`, `HUNT-002`, `HUNT-003`, `HUNT-004`, `HUNT-005`, `HUNT-006`, `HUNT-007` |
| v0.61 | Hunting Domain Contracts Landed | Started `HUNT-001` by adding the first-pass hunting model contracts for hunter profile, hunting stats, hunt state, hunt rewards, pet-lite, gear, and expanded zone metadata, then verified the new bounded context layer with a clean build | `HUNT-001` |
| v0.62 | Hunting Factories And Save Draft Added | Extended `HUNT-001` with starter zones, profile and gear creation helpers, and a draft save-shape for `state.hunting.*`, leaving the module ready for deterministic hunt start and resolution work | `HUNT-001` |
| v0.63 | Hunting Runtime Slice Landed | Started `HUNT-002` by implementing deterministic `startHunt` and `resolveHunt`, added the first hunting module tests, and verified the new loop with green tests and build | `HUNT-002` |
| v0.64 | Hunting Reward Bridge Landed | Started `HUNT-003` by adding a dedicated hunting reward catalog and `claimHuntRewards`, then verified that pending hunt rewards can be claimed into the shared inventory through the existing inventory module | `HUNT-003` |
| v0.65 | Hunting Progression Slice Landed | Started `HUNT-004` by adding hunter experience, level-step progression, stat allocation, and verified zone unlock timing for the first hunting progression loop | `HUNT-004` |
| v0.66 | Hunting Gear And Pet-Lite Slice Landed | Started `HUNT-005` by adding starter gear and pet catalogs, profile-level equip and assign flows, and live resolver bonuses for speed, survival, loot quantity, and rare drops | `HUNT-005` |
| v0.67 | Hunting UI Shell Landed | Started `HUNT-006` by adding the first hunting screen, menu navigation, screen-state hook, and a visible start-resolve-claim loop over the live hunting runtime and reward bridge | `HUNT-006` |
| v0.68 | Hunting Docs Handoff Started | Started `HUNT-007` by adding a live hunting runtime reference, syncing architecture overview, and aligning root project docs with the now-live hunting module | `HUNT-007` |
| v0.69 | Hunting MVP Handoff Closed | Finished the first hunting documentation handoff, validated the docs, and closed the initial hunting MVP track with runtime, UI shell, and verification rules all in sync | `HUNT-007` |
| v0.70 | Hunting Persistence Slice Landed | Started `HUNT-008` by persisting hunting state through the shared save envelope, restoring the hook state on load, and adding dedicated persistence tests | `HUNT-008` |
| v0.71 | Hunting Restored-Session UX Added | Extended `HUNT-008` with a restored-session banner, a clearer step-strip, live elapsed and remaining route timing, and resolve gating so the player can understand saved hunting state and only finish a route once the timer is truly complete | `HUNT-008` |
| v0.72 | Hunting UI Polish Slice Added | Extended `HUNT-008` with a reverse route countdown bar, mini inventory strip, stronger route console, and MMO-style loot popup feedback so the hunting screen reads more like a live game mode than a raw debug shell | `HUNT-008` |
| v0.73 | Hunting Route Ledger Added | Extended `HUNT-008` with persist-backed recent claim history and a route ledger panel so the lodge keeps a short campaign log instead of only showing the latest haul | `HUNT-008` |
| v0.74 | Hunting Zone Board Enriched | Extended `HUNT-008` with richer route cards that surface base payout, threat pips, and loot-profile hints so route selection reads more like a real game board and less like raw data tags | `HUNT-008` |
| v0.75 | Hunting HUD Rail Added | Extended `HUNT-008` with a dedicated right-side HUD rail for active route state, companion status, quick stash, and latest haul so the lodge now reads as a single game panel instead of disconnected cards | `HUNT-008` |
| v0.76 | Hunting Route Atmosphere Added | Extended `HUNT-008` with route icons and richer loot-preview chips on zone cards so route selection feels more atmospheric and MMORPG-like instead of purely textual | `HUNT-008` |
| v0.77 | Hunting Action Motion Added | Extended `HUNT-008` with ready, resolve, and claim micro-interactions plus stronger ready-state emphasis on the route console and route HUD so the hunting flow feels more alive in motion | `HUNT-008` |
| v0.78 | Hunting Compact Layout Pass Added | Extended `HUNT-008` with a compact-mode layout, reduced panel density, fewer duplicate sections, and more tooltip-driven secondary details so the lodge is much closer to fitting into a single screen without scroll | `HUNT-008` |
| v0.79 | Hunting Tabbed Single-Screen Pass Added | Extended `HUNT-008` by replacing the lower multi-panel stack with a tabbed panel plus compact ledger column so the lodge is much closer to a true one-screen layout without losing route, status, or profile detail | `HUNT-008` |
| v0.80 | Hunting No-Scroll Pass Tightened | Tightened `HUNT-008` further by leaning harder into tabbed panels, shorter copy, and tooltip-driven secondary context so the lodge is more aggressively tuned for one-screen use | `HUNT-008` |
| v0.81 | Hunting HUD Compact Step Added | Tightened the right-side hunting HUD with smaller companion and haul cards so the one-screen layout wastes less vertical space in the snapshot rail | `HUNT-008` |
| v0.82 | Hunting Tool Focus Slice Landed | Closed the main `HUNT-008` persistence/UI work and opened `HUNT-009` with a first hunting tool-focus layer that changes route yields, persists through the hunter profile, and is selectable from the profile tab | `HUNT-009` |

---

## Update Checklist

When work changes state:

1. update the task row in `Global Master Plan`
2. update or create the matching file in `features/`
3. add completed work to `Sprint History`
4. update the timestamp at the top of this file

---

> Last updated: 2026-03-14 20:17 MSK
