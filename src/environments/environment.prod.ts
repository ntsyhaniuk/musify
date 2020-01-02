export const environment = {
  production: true,
  // @ts-ignore
  CLIENT_ID: process.env.CLIENT_ID,
  // @ts-ignore
  REDIRECT_URI: process.env.REDIRECT_URI,
  BASE_URL: 'https://api.spotify.com/v1',
  STORAGE_KEY: 'auth_token',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};
