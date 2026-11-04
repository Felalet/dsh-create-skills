# Источники каталога

## Основной

- **Репозиторий:** https://github.com/anthropics/skills
- **Ветка:** `main`
- **Проверено:** 2026-11-05 (GitHub API: 187 403 ★, 22 113 форков, license: null)
- **Формат:** `<repo>/skills/<name>/SKILL.md` — совместим с DSH (name + description в YAML-шапке).

## Лицензия

У репозитория **нет объявленной лицензии** (`license: null` в GitHub API). Поэтому:

- контент скиллов не копируется в этот репозиторий и не распространяется;
- `catalog.json` хранит только метаданные и ссылку на источник;
- скачивание выполняет пользователь по своему запросу, файлы остаются в его проекте;
- карточка скилла показывает `license: unspecified` и ссылку на исходный репозиторий.

Если появится скилл с явной разрешительной лицензией, его можно включить в поставку — отдельным решением и с сохранением уведомления об авторстве.

## Проверка перед добавлением

1. `https://api.github.com/repos/<owner>/<repo>/contents/<path>` отвечает 200.
2. В папке есть `SKILL.md`.
3. Frontmatter содержит `name` (kebab-case) и `description`.
4. `name` совпадает с `<name>` папки (иначе установка создаст неожиданную запись).
5. Лицензия известна или помечена `unspecified`.

## Кандидаты на будущее

- `anthropics/skills`: doc-coauthoring, frontend-design, algorithmic-art, theme-factory, slack-gif-creator, internal-comms, claude-api, academy-guide, discernment-nudge.
- Скиллы из экосистемы DSH (awesome-dsh-plugin): требуют отдельной проверки формата и лицензии.
