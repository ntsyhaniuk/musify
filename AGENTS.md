# Agent guidance — Musify

Musify is an Angular 22 Spotify client. Prefer modern Angular patterns already used in this repo (standalone components, signals, `rxResource`, `inject()`, modern control flow).

## Angular skills

Official Angular agent skills are declared in [`skills-lock.json`](skills-lock.json) (source: [`angular/skills`](https://github.com/angular/skills)).

| Skill | When to use |
| --- | --- |
| **angular-developer** | Components, services, signals / `linkedSignal` / `resource`, forms, DI, routing, SSR, ARIA, animations, styling, testing, CLI |
| **angular-new-app** | Scaffolding a **new** Angular application with the CLI |

Installed skill bodies live under `.agents/skills/` (gitignored). Reinstall from the lockfile in Cursor if that folder is missing, then follow those skills for Angular work.

Do not invent Angular APIs that conflict with the project’s Angular 22 stack or with guidance in the Angular skills.
