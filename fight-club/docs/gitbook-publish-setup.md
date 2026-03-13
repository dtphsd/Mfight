# GitBook Publish Setup

> Last updated: 2026-03-14 00:53 MSK

This page explains how to publish the `fight-club/docs/` section to GitBook.

For the built-in static docs site, also see the VitePress and GitHub Pages notes below.

---

## Current Repo State

The repository is now prepared for GitBook import:

- `docs/README.md` is the docs landing page
- `docs/SUMMARY.md` is the GitBook navigation tree
- `docs/index.md` is the VitePress landing page
- `docs/architecture/` contains the main technical reading flow
- `docs/decisions/` contains ADR pages
- `.github/workflows/gitbook-docs-check.yml` validates the docs structure on GitHub
- `.github/workflows/deploy-docs-pages.yml` builds and deploys the VitePress site to GitHub Pages

---

## Recommended GitBook Setup

Use GitHub sync from the repository and point GitBook to the `fight-club/docs` folder.

Recommended reading root:

- `fight-club/docs/README.md`

Recommended navigation file:

- `fight-club/docs/SUMMARY.md`

---

## Suggested Publish Flow

1. Connect the GitHub repository in GitBook.
2. Select the docs root as `fight-club/docs`.
3. Use `README.md` as the landing page.
4. Let GitBook use `SUMMARY.md` for sidebar navigation.
5. Keep architecture pages and decision pages under the current folder structure.

---

## Before Publishing

Run:

```bash
npm run docs:validate
npm run docs:build
```

This checks:

- required docs pages exist
- `SUMMARY.md` links resolve
- `docs/README.md` still links to `SUMMARY.md`
- the VitePress site builds from the same docs source

---

## GitHub Automation

The repository now includes:

- `.github/workflows/gitbook-docs-check.yml`
- `.github/workflows/deploy-docs-pages.yml`

It validates docs structure on pushes and pull requests that touch docs-related files.

`gitbook-docs-check.yml` is not a GitBook deploy job by itself. It is a safety check so broken docs navigation does not reach the publishing branch.

`deploy-docs-pages.yml` builds the VitePress site and publishes it to GitHub Pages.

---

## Static Docs Site

The repository now also supports a built-in static docs site through VitePress.

Available commands:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

Main files:

- `docs/.vitepress/config.mts`
- `docs/index.md`
- `docs/architecture/index.md`
- `docs/decisions/index.md`

This means you now have two publish-friendly docs paths from the same markdown source:

- GitBook via `README.md` and `SUMMARY.md`
- GitHub Pages via VitePress

---

## If You Need Full Auto-Publish

If your GitBook space is already connected to GitHub, no extra deploy script is required.

If your GitBook setup uses a custom API or external sync job, you still need:

- GitBook API credentials or GitHub App integration
- the target space identifier
- the exact publishing method used by your team

Until those are connected, this repo is "GitBook-ready", but not "GitBook-deploying".

---

## Maintenance Rule

Whenever docs structure changes:

- update `docs/README.md`
- update `docs/SUMMARY.md`
- update this page if the publishing workflow changes

---

## Related Docs

- [Docs Home](./README.md)
- [Architecture Overview](./architecture/overview.md)
- [Combat Design Reference](./architecture/combat-design-reference.md)

---

> Last updated: 2026-03-14 00:53 MSK
