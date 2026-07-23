# Musify

Spotify web player SPA rebuilt on **Angular 22** (standalone, signals, zoneless-ready stack).

**Live:** https://msf.netlify.app/

You need a **Spotify Premium** account for Web Playback SDK streaming.

## Features

- Authorization Code + **PKCE** (no implicit grant, no client secret in the browser)
- Library-centric home (followed artists, playlists, recently played, saved albums, fresh albums)
- Search with `limit` ≤ 10 and pagination
- Album / artist / playlist details (playlist items + URI library endpoints)
- Web Playback SDK bottom bar (Material slider only)
- Last.fm bios via Netlify function proxy (`/api/lastfm`)

## Prerequisites

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) app
2. Redirect URI allow-listed exactly, e.g. `http://127.0.0.1:4300/` (local) and your Netlify URL
3. Optional: [Last.fm API key](https://www.last.fm/api/account/create) for bios
4. App owner must have Spotify Premium (Development Mode requirement)

## Setup

```bash
cp .env.example .env
# Edit .env with CLIENT_ID, REDIRECT_URI, LASTFM_API_KEY
npm install
npm run env        # writes src/environments/environment.ts from .env (gitignored values stay local)
npm start
```

App: [http://127.0.0.1:4300/](http://127.0.0.1:4300/)

### Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `CLIENT_ID` | `.env` → Angular `environment` | Spotify app client id (public, but do not commit real values casually) |
| `REDIRECT_URI` | `.env` → Angular `environment` | Must match Dashboard + Spotify authorize request |
| `LASTFM_API_KEY` | `.env` only (local proxy + Netlify) | Server-only; never written into Angular `environment*.ts` |

Never commit `.env` or real keys. `environment*.ts` in the repo ship with empty secrets. After `npm run env`, restore with `git checkout -- src/environments/` before committing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Local Last.fm proxy + dev server on `127.0.0.1:4300` |
| `npm run start:ng` | `ng serve` only (bios need the proxy or Netlify) |
| `npm run env` | Generate `environment.ts` / `environment.prod.ts` from `.env` |
| `npm run build` | Production build → `dist/musify/browser` |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |

## Last.fm bios locally

Bios call `/api/lastfm`. With `npm start`, a small Node proxy (`scripts/lastfm-dev-proxy.mjs`) injects `LASTFM_API_KEY` from `.env` (proxied via `proxy.conf.json`). Production uses the Netlify function.

Alternatively: `npx netlify dev` or deploy with `LASTFM_API_KEY` set.

## Deploy (Netlify)

- Build command: `npm run env && npm run build`
- Publish directory: `dist/musify/browser`
- Env vars: `CLIENT_ID`, `REDIRECT_URI`, `LASTFM_API_KEY`
- `netlify.toml` already maps `/api/lastfm` → the Last.fm function and SPA fallbacks

## Architecture

```
src/app/
  core/           auth (PKCE), interceptor, spinner, env token
  data-access/    Spotify + Last.fm clients
  features/       home, search, detail, player
  shared/         items-list, navbar, profile, track-row, models
```

## Notes

- Post–Feb 2026 Spotify Web API: no browse categories / new-releases / artist top-tracks; search limit 10; playlist `items`; library URIs.
- Missing fields such as `popularity` / `followers` are handled optionally and do not crash the UI.
