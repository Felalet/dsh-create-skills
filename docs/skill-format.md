# Skill format

Source of truth: the `@deepseek-ai/dsh-skill-filesystem` documentation, checked
against the DSH build this plugin targets.

## Roots and precedence

| Rank | Source | Path |
|---|---|---|
| 100 | project DSH | `<project>/.dsh/skills` |
| 200 | project agents | `<project>/.agents/skills` |
| 300 | custom | `Config.customSkillDirs` |
| 400 | user DSH | `~/.dsh/skills` |
| 500 | user agents | `~/.agents/skills` |
| 600 | bundled | the provider's own directory |

The project root is the nearest ancestor containing `.git`; without one, the
session's working directory is used. Duplicate names resolve by rank: a nearer
root shadows a farther one. The plugin writes to the first four roots only.

## File

A skill is a directory `<name>/SKILL.md` or a flat `<name>.md` at the top level
of a scanned root. Nested `**/SKILL.md` is deliberately not discovered.

```markdown
---
name: my-skill
description: "What it does and when to use it — one line, 1-200 characters"
whenToUse: "Optional trigger refinement, up to 120 characters"
metadata:
  category: "development"
---

# Body

## When to use
## Steps
## Check
```

Required frontmatter: `name` (kebab-case, `a-z0-9-`) and `description`.
Optional:

- `whenToUse` — narrows the trigger;
- `metadata.category` — the category the page shows and filters by;
- `disable-model-invocation: true` — keeps the skill out of the model catalog
  (the page then hides it from "Installed" and offers "Enable" in the catalog);
- `user-invocable: false` — keeps the skill out of the `/` menu.

Unknown keys are preserved by the editor: it rewrites only the fields it owns.

## Validation performed by the plugin

- `name`: `/^[a-z0-9]+(-[a-z0-9]+)*$/`, up to 64 characters;
- `description`: one line, 1–200 characters, no line breaks;
- `whenToUse`: one line, up to 120 characters;
- the body must not be empty when creating.

When writing, the plugin rebuilds the frontmatter (`name`, `description`,
`whenToUse`, `metadata.category`) and keeps the body as Markdown. An applied
version is rejected with `422` if its frontmatter has no `name`/`description`,
because the registry would silently drop such a skill.

## Categories

Category ids are free-form strings. `documents`, `development`, `design` and
`meta` come from the catalog; `builtin` and `mine` are derived from the source
when a skill has no `metadata.category`. Custom categories live in
`<project>/.dsh/skill-categories.json` as `{id, title}` pairs and are merged with
the catalog and the two built-in ids.
