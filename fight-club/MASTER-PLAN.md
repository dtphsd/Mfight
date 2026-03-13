# MASTER-PLAN - Fight Club

> Last updated: 2026-03-13 21:55 MSK

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
| UI-002 | Extract shared modal, panel, and action primitives | UI Architecture | 🔴 TODO | `features/ui-ux-refactor.md` | Reduce repeated inline surfaces, buttons, pills, and overlay shells |
| UI-003 | Split `CombatSandboxScreen` into screen sections | UI Architecture | 🔴 TODO | `features/ui-ux-refactor.md` | Make the main combat screen orchestration-only |
| UI-004 | Unify popover and hover-preview infrastructure | UX / UI Infrastructure | 🔴 TODO | `features/ui-ux-refactor.md` | One positioning and overlay model for preview and modal flows |
| UI-005 | Rework build flow into one clear UX path | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Merge presets, builder, inventory, and skills into one mental model |
| UI-006 | Rework round setup into guided action flow | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Make action selection procedural and easier to read |
| UI-007 | Reduce combat screen information density | UX | 🔴 TODO | `features/ui-ux-refactor.md` | Demote advanced analytics and surface key actions first |
| UI-008 | Split heavyweight combat components | UI Architecture | 🔴 TODO | `features/ui-ux-refactor.md` | Decompose silhouette, builder, item card, and battle log sections |
| UI-009 | Add UI contract tests for critical flows | QA / UI | 🔴 TODO | `features/ui-ux-refactor.md` | Protect build flow, action flow, and modal behavior during refactor |
| DOC-001 | Maintain root docs accuracy against real code | Docs | 🔴 TODO | - | Update docs whenever structure or workflow changes |

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
- expected outcome:
  - clearer build journey
  - guided round construction
  - less cognitive overload on the primary screen

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

---

## Update Checklist

When work changes state:

1. update the task row in `Global Master Plan`
2. update or create the matching file in `features/`
3. add completed work to `Sprint History`
4. update the timestamp at the top of this file

---

> Last updated: 2026-03-13 21:55 MSK
