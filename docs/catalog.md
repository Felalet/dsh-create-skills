# Catalog

The installable catalog lives in `catalog/catalog.json` and is bundled with the
plugin: ten skills from [anthropics/skills](https://github.com/anthropics/skills).
It is not a copy of those skills — only metadata and a source pointer.

## File shape

```json
{
  "version": 1,
  "updated": "2026-11-05",
  "source": "https://github.com/anthropics/skills",
  "categories": [
    { "id": "documents", "title": "Документы", "titleEn": "Documents", "description": "...", "descriptionEn": "..." }
  ],
  "skills": [
    {
      "id": "docx",
      "name": "docx",
      "title": "Word-документы",
      "titleEn": "Word documents",
      "description": "...",
      "descriptionEn": "...",
      "category": "documents",
      "tags": ["word", "docx"],
      "license": "unspecified",
      "source": { "type": "github", "repo": "anthropics/skills", "path": "skills/docx", "ref": "main" }
    }
  ]
}
```

Rules:

- `id` is unique and used by the API; `name` must be kebab-case and matches the
  directory name used on install;
- `category` must exist in `categories`;
- `source.type` is `github`; `path` is the skill directory inside the repository;
  `ref` is a branch or tag;
- Russian `title`/`description` are shown for the `ru` locale, English
  `titleEn`/`descriptionEn` for every other language.

`node scripts/validate-catalog.mjs` checks all of the above.

## Install flow

1. The client posts the selected ids and the scope (`project`/`user`).
2. The host downloads `https://codeload.github.com/<repo>/tar.gz/<ref>`.
3. The tarball is parsed in memory; only files under `<path>/` are copied, with a
   containment check per entry.
4. Symlinks are recreated when their target stays inside the skill, and the
   executable bit is preserved on POSIX.
5. `SKILL.md` must exist and carry `name` + `description`, otherwise the copied
   directory is removed and an error is reported.

Installed entries show up as "installed" in the catalog; the row then offers
disable and delete (delete moves the installed copy to the archive).

## Preview

`GET /api/preview?id=...` fetches only `<repo>/<ref>/<path>/SKILL.md` from
`raw.githubusercontent.com`, caches it per session (512 KB cap) and returns it
together with the entry metadata. The dialog renders the text in a `<pre>`; a
Copy button puts it on the clipboard.
