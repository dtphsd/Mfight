# BACKUP POINT - 2026-03-13 21:55 MSK

**Project:** Fight Club  
**Workspace:** `c:/Users/dtphs/.vscode/Project`  
**Backup type:** UI baseline before phased refactor work

---

## What This Backup Point Means

This file marks the current UI state as a named rollback point before `UI-002` begins.

The goal is to keep a restorable reference for the live interface before:

- shared UI primitives are extracted
- modal and popover infrastructure is unified
- `CombatSandboxScreen` starts being decomposed

---

## Backed Up Files

Stored in:

- `fight-club/docs/backup-points/2026-03-13-2155-ui-baseline/`

Saved files:

- `CombatSandboxScreen.tsx`
- `BuilderPopover.tsx`
- `BuildPresetsPopover.tsx`
- `CombatSilhouette.tsx`
- `BattleLogPanel.tsx`
- `ItemPresentationCard.tsx`
- `InventoryPopover.tsx`
- `EquipmentSlotPopover.tsx`
- `ItemHoverPreview.tsx`
- `styles.css`

---

## Intent

If a future UI refactor damages layout, interaction flow, or presentation quality, compare or restore from this backup point first.

This is a UI-focused checkpoint, not a verified full-project release marker.

---

## Related Planning State

- planning baseline version: `v0.3`
- current saved UI checkpoint: `v0.4`
- next implementation task: `UI-002`

---

> Created: 2026-03-13 21:55 MSK
