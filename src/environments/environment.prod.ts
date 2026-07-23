/**
 * Production defaults (empty secrets).
 * Netlify build should run `npm run env` so CLIENT_ID / REDIRECT_URI come from env vars.
 */
export const environment = {
  production: true,
  CLIENT_ID: '',
  REDIRECT_URI: '',
  /** Unused in the browser — Last.fm key lives on Netlify (`LASTFM_API_KEY`). */
  LASTFM_API_KEY: '',
  STORAGE_KEY: 'auth_token',
  BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
  BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
};
