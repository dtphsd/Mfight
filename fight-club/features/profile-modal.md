# Profile Modal

> Last updated: 2026-03-15 15:49 MSK

**Feature:** Profile Modal  
**Status:** 🟡 IN PROGRESS

---

## Зачем

Дать Fight Club понятную и эффектную модальную карточку персонажа, которая собирает в одном месте визуал бойца, боевые характеристики, краткую публичную информацию и задел под social-слой.

---

## Проблема

Сейчас у персонажа нет отдельной публичной карточки. Игрок видит силуэт и часть метрик только внутри боевого экрана, а информация о бойце, его рекорде, наградах и будущих social-элементах никак не собрана в одну точку.

---

## Root Cause

- в проекте пока нет выделенного profile-модуля
- боевые данные, visual presentation и meta-информация разбросаны между sandbox hooks и screen components
- social-слой пока не существует как полноценная система, поэтому легко перепутать полезный profile MVP с преждевременным backend-heavy feature scope

---

## Решение

Сделать `Profile MVP Modal` как client-side social card:

- левый visual block:
  - силуэт / скин
  - экипировка вокруг
  - активные бафы и состояния
- левый stats block:
  - core stats
  - derived combat ratings
  - короткий список активных skills
- правый about block:
  - бои / победы / поражения / win rate
  - девиз
  - клановая строка как placeholder
  - showcase medals
- правый wall block:
  - подарки как showcase strip
  - pinned note / status
  - текстовый блок под будущую wall system

На первом этапе это будет локальная модальная система без backend, shared profiles или real gifting.

---

## Влияет на

- `src/modules/profile/*`
- `src/ui/components/profile/*`
- `src/ui/screens/Combat/CombatSandboxScreen.tsx`
- future menu / hunting profile entry points

---

## Статус

`🟡 IN PROGRESS`

Current state:

- profile track formalized as a dedicated feature
- combat-integrated `Profile MVP Modal` is now live
- the modal already opens from the combat screen and renders a four-block layout
- local profile mail is now wired through a mailbox mini modal with inbox reading, reply flow, and direct letters from another profile card
- current scope is intentionally local-only and backend-free
- session battle record is already updating from finished combat rounds

---

## MVP Scope

### Included now

- player-facing profile modal
- silhouette + equipment + active effects
- core stats + derived combat ratings
- session battle record
- motto / clan placeholder
- medals showcase
- gifts showcase placeholder
- wall / pinned-note placeholder
- local mailbox icon, inbox, reply flow, and direct profile-to-profile letters

### Deferred

- real shared profiles
- persistent social graph
- backend-backed private messages and delivery status
- real gifting between players
- clan system
- achievement unlock flow
- editable wall posts with comments and likes

---

## Planned Tasks

- `PROFILE-001` - define profile model and modal architecture
- `PROFILE-002` - build first combat-integrated profile modal
- `PROFILE-003` - add session battle record and showcase blocks
- `PROFILE-004` - expand profile entry points beyond combat
- `PROFILE-005` - formalize profile persistence and future social bridge

---

## Следующий шаг

Ship `PROFILE-001` and `PROFILE-002` together as the first live slice:

- expand the same modal pattern to more entry points
- polish the bot-side public card
- decide which parts of the local profile record should persist between sessions

---

> Last updated: 2026-03-15 15:49 MSK
