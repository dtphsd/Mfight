# DATABASE_ARCHITECTURE - Fight Club

> Last updated: 2026-03-12 17:00 MSK

**Actual status:** no real database  
**Persistence technology:** browser `localStorage`  
**ORM:** absent  
**Migrations:** absent

---

## Main Fact

The project still does **not** use:

- PostgreSQL
- MySQL
- SQLite
- IndexedDB as a real application data layer
- Prisma
- Drizzle
- TypeORM
- any server-side persistence service

Do not document a DB that does not exist.

---

## What Exists Instead

### Save abstraction

Files:

- `fight-club/src/core/storage/SaveRepository.ts`
- `fight-club/src/core/storage/LocalStorageSaveRepository.ts`

Purpose:

- abstract storage writes
- avoid hard-coupling orchestration directly to one backend

### Save payload schema

File:

- `fight-club/src/core/storage/saveSchema.ts`

Current payload shape:

```ts
{
  version: string;
  timestamp: number;
  state: Record<string, unknown>;
}
```

This is a serialized save payload, not a relational schema.

### Save orchestration

File:

- `fight-club/src/orchestration/saveGame.ts`

Writes:

- `version`
- `timestamp`
- `state`

### Current storage key

File:

- `fight-club/src/app/bootstrap/createGameApp.ts`

Current key:

- `fight-club-save`

---

## Current Limits

- no validated parse on read
- no migration layer
- no transaction semantics
- no rollback
- no profile system
- no sync between devices
- no server backup

Important persistence note:

- runtime combat now includes timed effects and richer consumable results
- this does **not** create a DB layer
- it only increases the importance of keeping save shape changes compatible if persistence expands later

---

## Safe Change Rules

While storage stays local-only:

- do not break the `version / timestamp / state` save envelope casually
- do not treat `localStorage` as trusted input
- add validation before expanding save complexity
- introduce compatibility/migration rules before changing save version behavior

If a real DB appears later:

- rewrite this document substantially
- update all root docs together
- remove all statements that say there is no DB

---

## Rewrite Triggers

Revise this file immediately if the project adds any of:

- SQLite / IndexedDB / Postgres / MySQL as real storage
- ORM tooling
- migration files
- entity relationships
- remote persistence API
- cloud sync
- account-based saves

---

## Current Summary

Today the project has:

- no DB
- no tables
- no SQL schema
- no foreign keys
- no ORM
- only a browser-side save payload through `localStorage`

---

> Last updated: 2026-03-12 17:00 MSK
