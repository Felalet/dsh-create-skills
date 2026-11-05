# Contributing

Thanks for taking the time to improve Create Skills. This is a DeepSeek Harness
plugin, so changes must keep working in the DSH Web client on Windows, macOS and
Linux.

## Before you start

- DSH 0.2.x and Node.js ≥ 22.19.
- The plugin is a normal package: `client.js` is the browser half, `index.js`
  the host half. There is no build step — files are loaded as they are.

## Run the checks

```bash
node scripts/check-client.mjs     # client loads, ru/en/zh parity, no hardcoded strings
node scripts/validate-catalog.mjs # catalog structure
node scripts/test-archive.mjs     # archive operations on a throwaway project
node scripts/test-preview.mjs     # GitHub preview (network required)
```

All four must pass before a pull request. `check-client.mjs` fails when a
`t('key')` has no dictionary entry or when Russian text appears outside the RU
dictionary.

## Localization rules

- Every user-facing string goes through the dictionaries in `client.js`:
  `RU`, `EN`, `ZH`. All three must keep the same key set.
- Use `t('key')` in components and `tr('key')` in the plugin's `apply()`.
- Russian belongs to the RU dictionary only; the check script enforces it.
- `locale/{ru,en,zh}.json` holds the plugin-manager title and description.

## Code layout

| File | Role |
|---|---|
| `client.js` | page, dialogs, catalog, compare, archive, dictionaries |
| `index.js` | host API under `/plugins/create-skills/api/*` |
| `catalog/catalog.json` | installable catalog entries (`title`/`titleEn`, `description`/`descriptionEn`) |
| `cordis.patch.yml` | inserts the plugin row into a profile |
| `icons/`, `scripts/`, `docs/` | assets, checks, documentation |

## Pull requests

- Keep one logical change per pull request.
- Describe the user-visible effect and how you verified it (which checks, which
  screen in DSH).
- Do not commit secrets, personal paths (`C:/Users/...`) or workspace data:
  scripts resolve paths from `import.meta.url`.
- For behavior changes, update `README.md`, `README.en.md` and `CHANGELOG.md`.

## Commit style

Short imperative subject lines, optionally prefixed (`feat:`, `fix:`, `docs:`,
`chore:`), with a body explaining the why when it is not obvious.
