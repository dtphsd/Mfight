# GitBook Publish Setup

> Last updated: 2026-03-14 00:46 MSK

This page explains how to publish the `fight-club/docs/` section to GitBook.

---

## Current Repo State

The repository is now prepared for GitBook import:

- `docs/README.md` is the docs landing page
- `docs/SUMMARY.md` is the GitBook navigation tree
- `docs/architecture/` contains the main technical reading flow
- `docs/decisions/` contains ADR pages
- `.github/workflows/gitbook-docs-check.yml` validates the docs structure on GitHub

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
```

This checks:

- required docs pages exist
- `SUMMARY.md` links resolve
- `docs/README.md` still links to `SUMMARY.md`

---

## GitHub Automation

The repository now includes:

- `.github/workflows/gitbook-docs-check.yml`

It validates docs structure on pushes and pull requests that touch docs-related files.

This is not a GitBook deploy job by itself. It is a safety check so broken docs navigation does not reach the publishing branch.

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

> Last updated: 2026-03-14 00:46 MSK
