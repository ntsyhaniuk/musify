/**
 * Local development defaults.
 * Prefer `npm run env` (from `.env`) over editing secrets here.
 * CLIENT_ID / LASTFM_API_KEY must stay empty in git.
 */
export const environment = {
  production: false,
  CLIENT_ID: '',
  REDIRECT_URI: 'http://127.0.0.1:4300/',
  /** Unused in the browser — Last.fm key lives on Netlify (`LASTFM_API_KEY`). */
  LASTFM_API_KEY: '',
  STORAGE_KEY: 'auth_token',
  BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
  BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
};
