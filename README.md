# Musify

Spotify web player SPA (Angular 22 rewrite in progress).

## Run locally

```bash
npm install
npm start
```

App serves at `http://127.0.0.1:4300/`.

Set `CLIENT_ID` in `src/environments/environment.ts` (or production replacement) — do not commit secrets.

## Build

```bash
npm run build
```

Output: `dist/musify/` (Netlify SPA; `public/_redirects` included).
