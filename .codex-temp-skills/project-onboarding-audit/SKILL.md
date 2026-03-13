---
name: project-onboarding-audit
description: Analyze an unfamiliar codebase before changes. Use when the user wants a one-command initial project audit, asks to study the project first, verify documentation against real code, map architecture, identify danger zones, or establish safe editing rules. Trigger on requests like "изучи проект", "сделай первичный анализ", "проверь документацию и код", or explicit use of $project-onboarding-audit.
---

# Project Onboarding Audit

Perform a read-only project audit before making changes.

## Audit Goal

Understand the project from documentation and real code, detect mismatches, and produce a safe working map for later edits.

## Required Starting Files

Read these files first if they exist:

1. `RULES.md`
2. `PROJECT-INFO.md`
3. `PROJECT_STRUCTURE.md`
4. `SECURITY_ARCHITECTURE.md`
5. `DATABASE_ARCHITECTURE.md`
6. `.agent/rules/antigravity-final-rules.md`

Treat documentation as a starting point, not as ground truth. Verify every important claim against the real codebase. If docs and code diverge, trust the code and explicitly record the mismatch.

## Operating Rules

- Do not edit code during this audit unless the user explicitly changes scope.
- Do not invent files, modules, routes, env vars, or behaviors.
- Read before concluding: inspect the actual entry points, config files, and module boundaries.
- Check which parts are documented and which parts only exist in code.
- State uncertainty directly when evidence is incomplete.

## Audit Workflow

### 1. Verify documentation

- Compare the required markdown files with the real repository structure and implementation.
- Confirm whether `PROJECT_STRUCTURE.md` is still accurate.
- List outdated, missing, or misleading documentation with concrete file references.

### 2. Build the architecture map

- Identify the real stack from code and config: frameworks, runtime, package manager, database, ORM, build tools, testing tools.
- Find entry points: app bootstrap files, router setup, API handlers, server startup, database init, background jobs, scripts.
- Trace the main data flow between frontend, backend, and database.
- Explain authentication and authorization from real code, including session/token handling and permission checks.

### 3. Analyze dependencies and configuration

- Read `package.json` and lock/config files to identify core dependencies and scripts.
- Inspect `.env*` examples, config modules, and runtime guards to infer critical environment variables.
- Summarize the purpose of the important libraries actually used in code.

### 4. Mark danger zones

Identify code that is risky to change. Prioritize:

- auth and session logic
- security and cryptography
- database schema, migrations, seeds, destructive data flows
- payment, billing, or external integrations
- deployment and production config
- tight coupling and hidden side effects
- untested critical code paths
- hardcoded values with behavioral impact

Use this exact format for each item:

`⚠️ [Файл/Модуль] — Описание риска → Рекомендация`

### 5. Define safe editing rules

State what must be checked before any change:

- which files must be read first
- which dependencies must be traced
- which docs must be updated after edits
- which validation commands should be run
- what must never be changed directly, especially database structure without migrations

## Output Format

Respond in markdown with these sections:

## Шаг 1: Верификация документации
## Шаг 2: Архитектурная карта
## Шаг 3: Зависимости и конфигурация
## Шаг 4: Danger Zones
## Шаг 5: Правила безопасного редактирования

Finish with a short summary of 5 to 7 points titled `## Краткая сводка`.

After the audit, wait for the user's next task instead of proposing code changes.
