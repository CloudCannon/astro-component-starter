---
description: Keep the changelog up to date when making changes
globs: CHANGELOG.md
alwaysApply: true
---

# Changelog

When making functional changes to the project (bug fixes, new features, enhancements, breaking changes), add an entry to the `[Unreleased]` section of `CHANGELOG.md`.

Use the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format with these categories:

- **Added** — new features
- **Changed** — changes to existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

**Never create duplicate category headers.** Before adding an entry, read the existing `[Unreleased]` section and append to the matching `###` heading that already exists. Only create a new `###` heading if one doesn't exist yet for that category.

Skip changelog entries for refactors, code style changes, or other internal-only changes with no user-facing impact.
