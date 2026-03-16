# TAMA_start Agent Guide

## Purpose

`TAMA_start` is a starter kit for an "agent evolution" workflow:

- `README.md` explains how to install and use the kit
- `evolution_journal.md` is the source-of-truth log/template for agent growth
- `.agents/workflows/auto-evolution.md` defines the behavioral protocol for the AI agent
- `visualizer/index.html` parses the journal and renders the Tamagotchi-style dashboard

## What To Treat As Canonical

- Treat `evolution_journal.md` as the canonical data source.
- Treat `visualizer/index.html` as a parser/viewer for that journal, not as the source of truth.
- Treat `.agents/workflows/auto-evolution.md` as the operational rules for how the agent should update the journal.

## Editing Rules

- Preserve the `STATUS_JSON` and `EVO_JSON` comment blocks in `evolution_journal.md`.
- Do not rename the main files unless the parser and docs are updated together.
- Keep the journal Markdown machine-readable:
  - stable headings
  - stable registry sections
  - valid JSON inside comment blocks
- If you change parsing behavior in `visualizer/index.html`, verify it still accepts the current journal template.
- If you change the journal template, verify the visualizer still parses:
  - status block
  - EVO entries
  - pattern registry
  - anti-pattern registry

## Agent Responsibilities

- When adding or updating the evolution workflow, sync all three surfaces:
  - `.agents/workflows/auto-evolution.md`
  - `evolution_journal.md`
  - `README.md`
- Prefer additive changes over format-breaking rewrites.
- If introducing a new field, document it in the workflow and keep old journal content parseable when possible.
- Keep this folder portable: it should still make sense when copied into another project root.

## Safe Workflow

1. Read `README.md` for user-facing intent.
2. Read `.agents/workflows/auto-evolution.md` before changing journal logic.
3. Update `evolution_journal.md` template only if the workflow or parser truly requires it.
4. If `visualizer/index.html` changes, verify its regex-based extraction logic still matches the template.

## Current Notes

- The visualizer currently extracts `STATUS_JSON` and `EVO_JSON` directly from Markdown comments.
- The visualizer also reads the Pattern and Anti-Pattern tables from Markdown text, so structural changes to those sections are high-risk.
- The content appears intended for UTF-8; keep new files and edits UTF-8-friendly and avoid accidental encoding regressions.
