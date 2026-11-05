# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-11-05

First public release.

### Added

- **Skills page** in the sidebar: installed project and user skills with source,
  category, prompt weight and enabled state.
- **Catalog** of ten skills from `anthropics/skills`, grouped by category, with
  `SKILL.md` preview before installing, single or bulk install, project/user
  scope and an explicit target workspace.
- **Editor** for name, description, when-to-use and body; template with field
  hints; custom categories; 42vh instructions field.
- **Versions**: save, apply, delete, and "keep only the latest".
- **A/B comparison**: installed or catalog skills as either side, AI verdict,
  line diff, a "What to improve" instruction, and the applied version moving to
  side A for the next iteration.
- **Archive (trash)**: delete moves a skill into `~/.dsh/skill-archive`, restore
  to the original root, delete permanently, empty the archive.
- **Workspaces**: list skills of other workspaces, open one, copy a skill here,
  or collect from all; name conflicts are compared and resolved with a diff.
- **Session context menu** entry that opens the page on that session's workspace.
- **Localization** into Russian, English and Simplified Chinese (153 keys each),
  bilingual catalog data, plugin metadata in `locale/{ru,en,zh}.json`.
- **Cross-platform** host code: shared agents root via `DSH_AGENTS_HOME`,
  `path.relative` containment checks, symlink and executable-bit preservation
  when installing from the catalog.

### Notes

- Built-in `skill-office` skills cannot be removed individually; only the whole
  provider can be disabled in the Plugins page.
- The catalog is not vendored: skills are downloaded from their upstream
  repositories on demand.

[0.1.0]: https://github.com/Felalet/dsh-create-skills/releases/tag/v0.1.0
