# BACKUP POINT - 2026-03-12 16:40 MSK

**Project:** Fight Club  
**Workspace:** `c:/Users/dtphs/.vscode/Project`  
**Backup type:** documentation + validated working-state marker

---

## What This Backup Point Means

This file marks the current project state as a stable reference point after:

- timed combat effects were introduced
- skills and consumables started applying status effects
- status effects were moved above HP in the silhouette header
- battle log formatting was cleaned up for healing ticks and full-block zero-damage outcomes
- `Regen Potion` was added as a timed consumable effect example

---

## Verified State At Backup Time

The project passed:

- `npm run build`
- `npm run test`
- `npm run lint`

Known validated counts at this point:

- `17` test files
- `97` tests

---

## Root Docs Snapshot

The following root docs were updated to match code at this point:

- `PROJECT-INFO.md`
- `PROJECT_STRUCTURE.md`
- `SECURITY_ARCHITECTURE.md`
- `DATABASE_ARCHITECTURE.md`

---

## Important Runtime Facts At This Point

- no backend
- no auth
- no real database
- persistence still means browser `localStorage`
- combat supports timed buffs/debuffs and periodic heal/damage/resource effects
- consumables can now apply timed combat effects
- active effects are shown above HP to avoid spending vertical space
- battle log now formats healing and full-block cases more honestly

---

## Intent

This backup point is a named stable marker for future work.  
If later changes introduce regressions, compare against this point first.

---

> Created: 2026-03-12 16:40 MSK
