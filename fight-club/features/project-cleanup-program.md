# Project Cleanup Program

> Last updated: 2026-03-16 13:55 MSK

**Feature:** project-cleanup-program  
**Status:** IN PROGRESS

---

## Зачем

Formalize the large cleanup effort as a tracked workstream instead of a one-off note.

The project is stable enough to support cleanup, but the codebase has accumulated backup artifacts, generated source noise, placeholder runtime layers, and several oversized files that now slow down safe changes.

---

## Проблема

The main issues are structural rather than functional:

- backup files still live inside `src/`
- generated and build artifacts sit too close to hand-written source
- some bootstrap and module files are placeholders but look like real runtime architecture
- the combat UI and combat runtime still have several oversized files with too much responsibility
- save loading remains weak because `localStorage` reads are not validated

This makes audits slower, code review noisier, and future refactors riskier than they need to be.

---

## Root Cause

The project grew quickly through feature delivery, docs hardening, and UI iteration.

That delivery pace produced a healthy amount of working code, but repo hygiene and layer cleanup did not keep up with:

- rapid UI experimentation
- generated Battle Kings content imports
- checkpoint backups kept near the live files
- forward-looking stubs for future modules

---

## Решение

Run cleanup in phased order, starting with low-risk deletions and structure cleanup before touching combat behavior.

### Phase 0 - Cleanup Inventory

- classify everything into `source`, `generated`, `backup`, `build output`, `stub`, or `orphan`
- confirm what can be deleted immediately and what must be moved first
- map which cleanup steps overlap with existing tasks like `UI-008` and `COMBAT-004`

### Phase 1 - Safe Junk Removal

- remove or relocate backup files from `src/`
- remove orphan scripts that are no longer part of the current Battle Kings pipeline
- decide whether generated `.js`, `.d.ts`, and `tsbuildinfo` files should remain tracked

### Phase 2 - Source Boundary Cleanup

- separate live source from generated item artifacts more clearly
- reduce review noise around `generatedBattleKingsStarterItems.ts`
- keep generator scripts authoritative and make generated output easier to reproduce

### Phase 3 - Dead Layer Pruning

- remove or quarantine stub bootstrap and module files that are not part of the active runtime
- make future-only architecture explicit instead of leaving placeholders in the live graph

### Phase 4 - UI Surface Decomposition

- continue shrinking oversized UI surfaces, especially the combat sandbox and heavyweight combat components
- separate screen composition, view-model selection, and modal orchestration more clearly

### Phase 5 - Combat Core Risk Reduction

- reduce the size and responsibility count of `resolveRound.ts`
- isolate turn-start effects, attack resolution, result assembly, and resource/cooldown checks
- do this only behind strong regression coverage

### Phase 6 - Persistence Hardening

- validate save payloads on load
- normalize old payloads safely
- prevent malformed local state from breaking the runtime

### Phase 7 - Docs And Workflow Sync

- update docs to distinguish live source from generated output and backup archives
- document the cleanup rules so the repo does not regress into the same shape later

---

## Влияет на

- combat runtime
- combat UI
- hunting persistence boundary
- repo hygiene and review workflow
- generated content pipeline
- documentation accuracy

---

## Cleanup Workstreams

| ID | Workstream | Goal |
|----|------------|------|
| CLEAN-001 | Cleanup inventory | Build the removal/move map before deleting anything |
| CLEAN-002 | Safe junk removal | Remove low-risk artifacts and repo clutter |
| CLEAN-003 | Source boundary cleanup | Separate source from generated and build noise |
| CLEAN-004 | Dead layer pruning | Retire placeholder runtime layers |
| CLEAN-005 | Sandbox state refactor | Shrink orchestration and hook complexity |
| CLEAN-006 | Heavy UI decomposition | Continue reducing oversized UI files |
| CLEAN-007 | Combat core reduction | Lower `resolveRound.ts` risk safely |
| CLEAN-008 | Persistence hardening | Validate and normalize save reads |
| CLEAN-009 | Docs and workflow sync | Lock the cleanup into project rules |

---

## Cleanup Inventory

### 1. Backup artifacts inside `src/`

Tracked backup files currently live in the active source tree:

- `src/styles.backup-2026-03-11-ui-polish.css`
- `src/ui/screens/MainMenu/MainMenuScreen.backup-2026-03-11-ui-polish.tsx`
- `src/ui/screens/Combat/CombatSandboxScreen.backup-2026-03-11.tsx`
- `src/ui/screens/Combat/CombatSandboxScreen.backup-2026-03-11-ui-polish.tsx`
- `src/ui/components/layout/AppShell.backup-2026-03-11-ui-polish.tsx`
- `src/ui/components/combat/CombatSilhouette.backup-2026-03-11.tsx`
- `src/ui/components/combat/CombatSilhouette.backup-2026-03-11-ui-polish.tsx`
- `src/ui/components/combat/BattleLogPanel.backup-2026-03-11.tsx`
- `src/ui/components/combat/BattleLogPanel.backup-2026-03-11-ui-polish.tsx`

Decision:

- move to `docs/backup-points/` if they are still needed as restore checkpoints
- otherwise delete them in `CLEAN-002`

### 2. Generated and config artifacts tracked in git

Tracked generated/config artifacts:

- `tsconfig.app.tsbuildinfo`
- `tsconfig.node.tsbuildinfo`
- `vite.config.js`
- `vite.config.d.ts`
- `vitest.config.js`
- `vitest.config.d.ts`

Current note:

- `dist/` is already ignored
- these generated config sidecars and buildinfo files are still tracked and create repository noise

Decision:

- remove tracked generated sidecars and stop treating them as long-lived source artifacts in `CLEAN-002`
- clarify final keep/remove rules in `CLEAN-003`

### 3. Orphan script candidates

Current orphan candidate:

- `fetch-battle-kings-items.mjs`

Reason:

- tracked in git
- not referenced by `package.json`
- not part of the current `BazaBK -> parse -> generate items` pipeline
- uses an older direct-fetch workflow and separate dependencies from the active local-page pipeline

Decision:

- remove or archive in `CLEAN-002` unless there is still a hidden manual workflow depending on it

### 4. Stub runtime layers

Confirmed placeholder files:

- `src/app/bootstrap/wireDependencies.ts`
- `src/app/bootstrap/registerModules.ts`
- `src/modules/arena/application/startArenaCombat.ts`
- `src/modules/shop/application/purchaseItem.ts`
- `src/modules/commentator/application/registerCommentator.ts`

Decision:

- prune or quarantine in `CLEAN-004`
- do not mix this with early junk-removal unless imports and docs are checked first

### 5. Oversized live files

Highest-value decomposition targets right now:

| File | Lines | Notes |
|------|-------|-------|
| `src/content/items/generatedBattleKingsStarterItems.ts` | 6316 | Huge generated source blob; review and diff noise |
| `src/ui/screens/Combat/CombatSandboxScreen.tsx` | 3008 | Still too large after first decomposition wave |
| `src/ui/components/combat/BuilderPopover.tsx` | 1351 | Heavy UI surface |
| `src/modules/combat/application/resolveRound.ts` | 1034 | Highest combat logic risk |
| `src/ui/components/combat/CombatSilhouette.tsx` | 1015 | Still heavyweight despite extractions |
| `src/ui/screens/Hunting/HuntingScreen.tsx` | 949 | Large screen-level component |
| `src/ui/components/profile/ProfileModal.tsx` | 947 | Heavy modal surface |
| `src/ui/components/combat/ItemPresentationCard.tsx` | 941 | Large presentation component |

Decision:

- use this list as the starting target set for `CLEAN-005`, `CLEAN-006`, and `CLEAN-007`

### 6. Script duplication to review

Current duplication candidate:

- `scripts/run-build-matrix.cjs`
- `scripts/run-build-matrix.ts`

Decision:

- confirm why both exist before removal
- keep out of `CLEAN-002` until the active invocation and test path are fully documented

---

## Execution Order

1. `CLEAN-001`
2. `CLEAN-002`
3. `CLEAN-003`
4. `CLEAN-004`
5. `CLEAN-005`
6. `CLEAN-006`
7. `CLEAN-007`
8. `CLEAN-008`
9. `CLEAN-009`

---

## Risks

- deleting a file that is still part of an undocumented workflow
- mixing repo cleanup with behavior changes in combat runtime
- moving generated assets without documenting reproduction rules
- changing save handling without backward-compatibility checks

---

## Статус

`TODO | IN PROGRESS | DONE | DEFERRED`

Current state:

- `CLEAN-001` is complete: cleanup inventory and target classification are documented here
- `CLEAN-002` is complete: low-risk junk has been removed from the live tree
- `CLEAN-004` is complete: placeholder bootstrap/application stubs are no longer part of the runtime graph
- `CLEAN-005` is complete: `useCombatSandbox` has been split into `useCombatSandboxData.ts`, `useCombatSandboxActions.ts`, and `useCombatSandboxFlow.ts`
- `CLEAN-006` is actively in progress: `CombatSandboxScreen` is now split across dedicated sibling modules for actions, controls, targeting, layout, panels, popovers, and resource-grid rendering
- `CLEAN-009` is in progress: root docs and structure notes are being synchronized with the cleanup work so the next session can continue from documented reality

Current cleanup frontier:

- remove the remaining legacy-local `BotBuildPresetsPopover` and `ResourceGrid` blocks that still sit inside `CombatSandboxScreen.tsx` as temporary non-runtime leftovers
- continue shrinking the next heavyweight UI surfaces after the combat screen split stabilizes
- finish clarifying generated-content boundaries for `CLEAN-003`

Completed cleanup slices so far:

- removed the orphan `fetch-battle-kings-items.mjs` script
- removed source-tree backup files from `src/`
- removed tracked generated config sidecars and recurring `tsbuildinfo` noise from the repo workflow
- pruned inactive bootstrap/application stubs under `src/app/bootstrap` and future-only module application layers
- extracted combat-screen siblings:
  - `combatSandboxScreenActionRail.tsx`
  - `combatSandboxScreenActions.tsx`
  - `combatSandboxScreenControls.tsx`
  - `combatSandboxScreenHelpers.ts`
  - `combatSandboxScreenLayout.tsx`
  - `combatSandboxScreenPanels.tsx`
  - `combatSandboxScreenPopovers.tsx`
  - `combatSandboxScreenResourceGrid.tsx`
  - `combatSandboxScreenTargeting.tsx`

Verification baseline after cleanup slices:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run docs:validate`

`CLEAN-001` outcome:

- backup files in `src` confirmed
- tracked generated sidecars confirmed
- orphan script candidate confirmed
- stub runtime layers confirmed
- oversized live-file target list confirmed

---

## Следующий шаг

Start `CLEAN-002`: remove or relocate low-risk junk first, especially tracked backup files in `src`, `fetch-battle-kings-items.mjs`, and tracked generated config/buildinfo artifacts.

---

> Last updated: 2026-03-16 13:55 MSK
