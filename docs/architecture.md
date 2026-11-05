# Architecture

Create Skills is a DeepSeek Harness plugin with two halves that share one
package.

```
client.js  ── browser half (page, dialogs, dictionaries, context-menu entry)
index.js   ── host half   (HTTP JSON API under /plugins/create-skills/api)
```

## Host half

A Cordis plugin (`name`, `inject: ['webServer']`) that registers exact routes on
the DSH web server. It talks to the DSH services `skills`, `agents` and
`sessions` to resolve the current workspace and the skill registry snapshot.

| Route | Purpose |
|---|---|
| `GET /skills` | installed skills + categories for the current workspace |
| `GET/POST/PATCH/DELETE /skills` | read one skill, create, edit, enable/disable, hard delete (unused by the UI) |
| `POST /archive`, `GET /archive` | move a skill to the trash, list the trash |
| `POST /archive/restore`, `/archive/delete`, `/archive/empty` | restore, delete permanently, empty |
| `GET /catalog` | installable catalog entries with an `installed` flag |
| `POST /install` | install catalog entries (project or user scope) |
| `GET /preview` | one `SKILL.md` from the upstream repository, cached |
| `GET/POST /versions`, `/versions/apply`, `/versions/prune` | skill versions |
| `POST /compare` | AI comparison of two variants |
| `POST /improve` | AI improvement, stored as a new version |
| `POST /categories`, `DELETE /categories` | custom categories |
| `POST /suggest-category`, `POST /group` | AI category suggestion and task grouping |
| `GET /workspaces`, `GET /workspace-skills` | registered workspaces and their project skills |
| `POST /skills/copy`, `/skills/collect`, `/skills/conflict` | cross-workspace copy, bulk collect, conflict comparison |
| `POST /pick-folder` | the host directory picker |
| `GET /session-path` | working directory of a session (for the context-menu entry) |
| `POST /client-event`, `GET /stats` | client diagnostics and counters |

Every write is checked against the writable skill roots: project
`.dsh/skills`, `.agents/skills`, `~/.dsh/skills`, `~/.agents/skills`. Path
containment uses `path.relative`, so `..`, the filesystem root, case differences
on Windows/macOS and other drives are handled.

## Client half

`window.__ModuleLoader__.load` registers a module with `inject: ['slots',
'locale', 'layout']` and contributes:

- `main` panel `create-skills` — the page (installed, catalog, compare, archive);
- `sidebar.panellist` — the sidebar entry with the puzzle glyph;
- `contextMenu.icon` + a session context-menu action that opens the page on the
  session's workspace.

The page keeps a small state machine per surface: skills snapshot, catalog,
archive, versions, compare, editor, preview and conflict dialogs. Everything is
rendered with `React.createElement` and inline styles on DSH alias tokens, so it
follows the host theme.

## Storage

| What | Where |
|---|---|
| Skills | `<root>/skills/<name>/SKILL.md` |
| Versions | `<project>/.dsh/skill-versions/<skill>/<label>/SKILL.md` |
| Archive | `~/.dsh/skill-archive/<id>/{meta.json,skill/}` |
| Custom categories | `<project>/.dsh/skill-categories.json` |
| Recent paths | browser `localStorage` (`create-skills:recent-paths`) |

## Data flow examples

**Install from the catalog.** Client → `POST /install` with ids and scope →
host downloads a repository tarball over HTTPS, validates `SKILL.md`, copies the
skill directory (preserving symlinks and executable bits on POSIX) into the
target root, and the client reloads the list.

**Improve.** Client sends `{name | catalogId, task, instruction}` → host reads the
body (from the skill file or the upstream `SKILL.md`), calls the model, stores
the result as an `ai-<timestamp>` version with a complete frontmatter, and the
client puts that version on side B of the comparison.

**Replace on conflict.** Copy returns `409` when the target name exists; the
client asks `POST /skills/conflict` for both bodies, shows a diff summary, and
retries with `replace: true`, which first moves the local copy into the archive.

## Limits

- Built-in `skill-office` skills are provider-owned and cannot be removed
  individually.
- Comparison reads one workspace at a time.
- No background jobs: all work happens inside a request, the archive and
  versions are ordinary folders on disk.
