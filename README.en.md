# Create Skills

A **DeepSeek Harness** plugin: a Skills page in the sidebar — catalog with preview, editor, versions, recycle bin and A/B comparison with AI improvement.

[Русская версия](README.md) · MIT · DSH 0.2.x · Windows / macOS / Linux

## Features

- **Installed** — project and user skills: source, category, prompt weight, enabled/disabled. Disabled skills are hidden here; enable them from the catalog.
- **Catalog** — curated skills by category. Click a row to preview `SKILL.md` before installing. Install one or all, into the project or the user directory, choosing a specific workspace.
- **Editor** — name, description, when-to-use and the Markdown body; a template with hints and a 42vh instructions field; category editing and archive-on-delete.
- **Versions** — save the current state, apply a version, delete one, or keep only the latest.
- **A/B comparison** — both sides from installed skills **or from the catalog without installing**; AI verdict, line diff, a "What to improve" field for a targeted change; the applied version moves to side A for the next iteration.
- **Archive** — deleting moves a skill to the trash: restore to its original root, delete permanently, or empty the archive; entries are grouped by category.
- **Workspaces** — list skills of other workspaces, Open, Copy here, and Collect from all. On a name conflict the plugin compares both copies and lets you keep yours or replace it (the old one goes to the archive).
- **Session context menu** — right-click a chat → **Skills**: the page opens on that chat's workspace.
- **Localization** — Russian, English, Simplified Chinese; the catalog is bilingual (ru/en).
- **Cross-platform** — plain Node.js in the host, no shell and no platform-specific APIs.

## Requirements

- DeepSeek Harness **0.2.x** (tested on 0.2.1-rc.5)
- Node.js ≥ 22.19 (bundled with DSH)
- Internet access for catalog installs (files come from GitHub)

## Installation

From the GitHub repository:

```bash
dsh plugin --profile desktop add github:<owner>/dsh-create-skills
```

From a local tarball:

```bash
npm pack
dsh plugin --profile desktop add ./create-skills-0.1.0.tgz
```

Restart DSH after installing, then open **Skills** in the sidebar.

## Quick start

1. **Catalog** → click a row to read the description and the `SKILL.md`.
2. **Install** — pick the scope: "project" (this workspace only) or "user" (every project). For "project" you can choose the target workspace.
3. **Installed** — enable/disable and see the prompt weight; Edit opens the editor, Versions the history.
4. **Compare** — pick a skill on the left, describe "What to improve", press Improve: the result lands on the right and is compared immediately.
5. **Archive** — everything deleted stays here until you empty it.

## Where skills live

| Scope | Path |
|---|---|
| Project | `<workspace>/.dsh/skills/<name>/SKILL.md` |
| Project (shared root) | `<workspace>/.agents/skills/...` |
| User | `~/.dsh/skills/...` |
| User (shared root) | `~/.agents/skills/...` |

DSH treats the nearest folder with `.git` as the project root, falling back to the workspace itself.

Plugin data:

- versions — `<project>/.dsh/skill-versions/<skill>/<label>/SKILL.md`;
- archive — `~/.dsh/skill-archive/<id>/` (with `meta.json`: name, category, origin, date);
- custom categories — `<project>/.dsh/skill-categories.json`;
- recent paths — browser `localStorage` (paths only, no content).

## SKILL.md format

```markdown
---
name: my-skill
description: "What the skill does and when to use it — one line, up to 200 characters"
whenToUse: "Optional trigger refinement"
metadata:
  category: "development"
---

# Title

## When to use
## Steps
## Check
```

`name` is kebab-case, `description` is required. `disable-model-invocation: true` hides the skill from the model, `user-invocable: false` removes it from the `/` menu. The plugin writes the category into `metadata.category`.

## Development

```bash
node scripts/validate-catalog.mjs   # catalog structure
node scripts/check-client.mjs       # client loads, ru/en/zh dictionaries, no hardcoded strings
node scripts/test-archive.mjs       # archive: move, list, restore, delete, empty
node scripts/test-preview.mjs       # GitHub preview (network required)
node icons/build-icons.mjs          # rebuild the SVG icons
```

Layout:

```
client.js            # browser half: page, dialogs, localization
index.js             # host: JSON API /plugins/create-skills/api/*
cordis.patch.yml     # profile wiring
catalog/catalog.json # 10 skills from anthropics/skills
locale/{ru,en,zh}.json
icons/               # icon sources and previews
scripts/             # checks and helper scripts
docs/                # architecture, skill format, catalog, decisions
```

## Limitations

- Built-in DSH skills (`skill-office`: `office*`, plus `diagnose-windows-sandbox-acl`) ship with the app and cannot be removed or disabled individually. Only the whole `skill-office` provider can be turned off on the Plugins page.
- Comparison works within the current workspace (installed and catalog skills); comparing two workspaces is not supported yet.
- The plugin performs file operations inside skill roots and downloads `SKILL.md` from GitHub. Third-party skills are instructions for the agent: install only what you trust.

## Documentation

- [docs/](docs/README.md) — architecture, skill format, catalog, decisions.
- [CHANGELOG.md](CHANGELOG.md) — released changes.
- [CONTRIBUTING.md](CONTRIBUTING.md) — checks, code layout, localization rules.
- [SECURITY.md](SECURITY.md) — private reporting and the trust boundary.

## License

MIT — see [LICENSE](LICENSE). Catalog skills are not vendored: they are downloaded on demand from their upstream repositories (`anthropics/skills`).
