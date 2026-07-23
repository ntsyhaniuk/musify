#!/usr/bin/env node
/**
 * Writes Angular environment files from process.env / .env without committing secrets.
 * Usage: npm run env
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) {
    return;
  }
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const CLIENT_ID = process.env.CLIENT_ID ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? 'http://127.0.0.1:4300/';
// Kept empty in the browser bundle on purpose — Last.fm key stays on Netlify.
const LASTFM_API_KEY = '';

function render(production) {
  return `export const environment = {
  production: ${production},
  CLIENT_ID: '${CLIENT_ID.replace(/'/g, "\\'")}',
  REDIRECT_URI: '${REDIRECT_URI.replace(/'/g, "\\'")}',
  LASTFM_API_KEY: '${LASTFM_API_KEY}',
  STORAGE_KEY: 'auth_token',
  BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
  BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
};
`;
}

writeFileSync(resolve('src/environments/environment.ts'), render(false));
writeFileSync(resolve('src/environments/environment.prod.ts'), render(true));

console.log(
  CLIENT_ID
    ? '[env] Wrote environment files with CLIENT_ID set.'
    : '[env] Wrote environment files with empty CLIENT_ID (set CLIENT_ID in .env).',
);
