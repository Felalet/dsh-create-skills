# Decisions

Short records of the choices that shape the plugin. They describe the current
state, not a roadmap.

## ADR-001. Deleting means archiving

Deleting a skill moves its directory to `~/.dsh/skill-archive/<id>/` with a
`meta.json` that records the name, category, source and original path. The
archive tab restores it to that path, deletes it permanently, or empties
everything. Rationale: a skill is hand-written content in a file the user may not
have a copy of; a misclick must stay recoverable. The installed list therefore
has no Delete button — deletion lives in the catalog and in the editor.

## ADR-002. Comparison reads catalog skills directly

A catalog side is fetched from `raw.githubusercontent.com` and cached per
session, so two skills can be compared before either is installed. Installing
just to compare would pollute the workspace and the prompt. A saved version wins
over the catalog body, so an AI-improved version of a catalog skill is compared
by its label.

## ADR-003. The installed list shows only enabled skills

"Installed" answers "what does the model see now", so skills with
`disable-model-invocation` are hidden there while still listed in the catalog
with an Enable action. The summary shows how many are disabled, and the empty
state explains where to enable them.

## ADR-004. Localization is registered, not global

The client registers three dictionaries through `ctx.locale.register(ns, {ru,
en, zh})` and reads the active language from `ctx.locale`. Russian is only in the
RU dictionary; the check script fails if Cyrillic appears anywhere else. Catalog
content is bilingual by design: Russian for `ru`, English for every other
language.

## ADR-005. A name conflict is compared before replacing

Copying a skill into a workspace that already has that name is a merge of two
hand-edited files. The plugin fetches both bodies, compares them, keeps the local
one when they are identical, and otherwise shows a diff summary before replacing.
Replacing archives the previous copy first.

## ADR-006. Project scope is chosen explicitly

"Project" is the nearest folder with `.git`, which is not always obvious when a
workspace is created before its project structure exists. The create dialog
therefore lists the registered workspaces and writes into the chosen one, and the
same workspace list powers the "Other workspaces" section of the catalog.

## ADR-007. AI output language follows the UI

Category suggestions, grouping, comparison verdicts and improvements ask the
model to answer in the active UI language (`ru` → Russian, `zh` → Chinese,
everything else → English). The prompt scaffolding stays Russian/English; only
the requested output language changes.
