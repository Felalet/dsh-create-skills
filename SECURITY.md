# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | yes |
| older | no |

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private reporting:
**Security → Report a vulnerability** in this repository
(<https://github.com/<owner>/dsh-create-skills/security/advisories/new>).

Include:

- the plugin version and DSH version;
- the operating system;
- what you did, what happened, and what you expected;
- proof of concept or logs (remove tokens, absolute user paths and personal data).

Expect an initial answer within a few days. Once a fix is ready it is released
together with an advisory entry.

## What this plugin does with your system

- Reads and writes files inside skill roots only:
  `<project>/.dsh/skills`, `<project>/.agents/skills`, `~/.dsh/skills`,
  `~/.agents/skills`, plus `<project>/.dsh/skill-versions`,
  `<project>/.dsh/skill-categories.json` and `~/.dsh/skill-archive`.
- Downloads `SKILL.md` files and skill archives over HTTPS from
  `raw.githubusercontent.com` and `codeload.github.com`.
- Never runs shell commands, never reads credentials, never sends your files
  anywhere. AI calls go through the DeepSeek Harness model service you already
  configured.

## Trust boundary

A skill is a set of **instructions for the agent**, not sandboxed code. Once a
skill is installed and loaded, the model may follow it. Install skills only from
sources you trust, and review the `SKILL.md` in the preview before installing —
that is exactly what the preview dialog is for.

The archive keeps deleted skills on disk; empty it if you do not want the old
content to remain.

## Secrets

The plugin does not need any credentials. Do not put API keys or tokens into
skill files, issue reports or pull requests: they become public and the plugin
will happily copy them into a project.
